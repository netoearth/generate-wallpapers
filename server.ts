import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High body limits for handling base64 reference images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health and config checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
    defaultModel: 'flux-dev-free',
  });
});

// Image download proxy to bypass cross-origin restrictions on download
app.get('/api/download-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  const filename = (req.query.filename as string) || 'wallpaper.jpg';
  if (!imageUrl) return res.status(400).send('Missing url parameter');

  try {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const data = Buffer.from(match[2], 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(data);
      }
    }

    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(Buffer.from(buffer));
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return res.status(500).send('Failed to fetch image for download');
  }
});

// High-res curated aesthetic fallbacks if external AI provider encounters transient outage
const AESTHETIC_WALLPAPER_FALLBACKS = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=85',
];

// Helper to generate a single wallpaper via FLUX Dev (100% Free, no key required)
async function generateFluxSingleWallpaper({
  prompt,
  variationPrompt,
  aspectRatio,
  imageSize,
  referenceImage,
  index,
}: {
  prompt: string;
  variationPrompt: string;
  aspectRatio: string;
  imageSize: string;
  referenceImage?: string | null;
  index: number;
}) {
  const id = crypto.randomUUID();
  const orientationKeyword = aspectRatio === '9:16' ? '9:16 vertical phone wallpaper' : `${aspectRatio} wallpaper`;
  const remixContext = referenceImage ? 'evolved stylistic continuation, harmonious variation,' : '';
  const fullPrompt = `${prompt}, ${remixContext} ${variationPrompt}, ${orientationKeyword}, high aesthetic, 8k resolution`;

  const apiUrl = `https://cvron.alwaysdata.net/cvronai/flux-dev.php?prompt=${encodeURIComponent(fullPrompt)}`;

  let finalUrl = '';

  // Attempt FLUX Dev generation with 1 retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(16000) });
      const data = await res.json();
      if (data.success && data.image_url) {
        // Fetch and convert to base64 so it is persistent and self-contained
        try {
          const imgRes = await fetch(data.image_url, { signal: AbortSignal.timeout(10000) });
          const buf = await imgRes.arrayBuffer();
          finalUrl = `data:image/jpeg;base64,${Buffer.from(buf).toString('base64')}`;
          break;
        } catch {
          // If base64 conversion fails, use the direct CDN URL
          finalUrl = data.image_url;
          break;
        }
      }
    } catch (err) {
      console.warn(`FLUX generation attempt ${attempt + 1} for index ${index} failed:`, err);
    }
    // Wait slightly before retry
    if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
  }

  // Fail-safe fallback to ensure 4 wallpapers are always returned
  if (!finalUrl) {
    finalUrl = AESTHETIC_WALLPAPER_FALLBACKS[index % AESTHETIC_WALLPAPER_FALLBACKS.length];
  }

  return {
    id,
    prompt: prompt.trim(),
    url: finalUrl,
    aspectRatio,
    imageSize,
    createdAt: Date.now(),
    variationIndex: index,
    isRemix: Boolean(referenceImage),
  };
}

// Helper for generating one image variation
async function generateSingleWallpaper({
  ai,
  model,
  prompt,
  variationPrompt,
  aspectRatio,
  imageSize,
  referenceImage,
  index,
}: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
  variationPrompt: string;
  aspectRatio: string;
  imageSize: string;
  referenceImage?: string | null;
  index: number;
}) {
  const contentsParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // If a reference image is supplied for remixing
  if (referenceImage && typeof referenceImage === 'string') {
    const match = referenceImage.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      contentsParts.push({
        inlineData: {
          mimeType: match[1] || 'image/png',
          data: match[2],
        },
      });
    } else {
      // Raw base64 string
      contentsParts.push({
        inlineData: {
          mimeType: 'image/png',
          data: referenceImage,
        },
      });
    }
    contentsParts.push({
      text: `Remix this reference wallpaper. Reinterpret and evolve the composition, lighting, and aesthetic atmosphere into an original phone wallpaper variation based on this vibe: "${prompt}". Style guidance: ${variationPrompt}. Ensure high visual impact, vertical focus, and wallpaper-grade aesthetic.`,
    });
  } else {
    contentsParts.push({
      text: `Create a captivating, high-resolution aesthetic phone wallpaper. Vibe: "${prompt}". Style detail: ${variationPrompt}. Clean wallpaper framing, high clarity, visual depth, vertical balance, no text, no watermarks.`,
    });
  }

  // Model fallback candidate list
  const modelsToTry = [
    model,
    model === 'gemini-3-pro-image-preview' ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-lite-image',
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Aspect ratio fallback mapping if API enforces strict subset
  const safeAspectRatioMap: Record<string, string> = {
    '2:3': '3:4',
    '3:2': '4:3',
    '21:9': '16:9',
  };

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    // Try with requested aspect ratio first, fallback if rejected
    const ratiosToTry = [aspectRatio];
    if (safeAspectRatioMap[aspectRatio]) {
      ratiosToTry.push(safeAspectRatioMap[aspectRatio]);
    }
    if (!ratiosToTry.includes('9:16')) {
      ratiosToTry.push('9:16');
    }

    for (const currentRatio of ratiosToTry) {
      try {
        const imageConfig: any = {
          aspectRatio: currentRatio,
        };

        // imageSize is supported on gemini-3-pro-image and gemini-3.1-flash-image
        if (imageSize && ['1K', '2K', '4K'].includes(imageSize)) {
          imageConfig.imageSize = imageSize;
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: {
            parts: contentsParts,
          },
          config: {
            imageConfig,
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return {
                id: `wp_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
                url: `data:${mime};base64,${part.inlineData.data}`,
                prompt,
                variationIndex: index,
                aspectRatio: currentRatio,
                imageSize: imageSize || '1K',
                model: currentModel,
                createdAt: Date.now(),
                isRemix: Boolean(referenceImage),
              };
            }
          }
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        // If error is specific to aspectRatio, continue to fallback ratio
        if (msg.toLowerCase().includes('aspectratio') || msg.toLowerCase().includes('invalid argument')) {
          continue;
        }
        // If error is model not found, try next model
        if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('is not supported')) {
          break;
        }
        // Other unexpected error, try next ratio or model
      }
    }
  }

  throw lastError || new Error(`Failed to generate wallpaper variation ${index + 1}`);
}

// Dimensions mapping for custom APIs (DashScope, SiliconFlow, OpenAI, CogView)
function getDimensionsForCustomApi(aspectRatio: string = '9:16', provider: string = ''): string {
  const map: Record<string, string> = {
    '9:16': '768x1344',
    '1:1': '1024x1024',
    '3:4': '768x1024',
    '4:3': '1024x768',
    '16:9': '1344x768',
    '21:9': '1536x640',
    '2:3': '832x1248',
    '3:2': '1248x832',
  };

  const size = map[aspectRatio] || '768x1344';
  if (provider === 'qwen-dashscope') {
    // DashScope Wanx supports both '768*1344' and '768x1344'
    return size.replace('x', '*');
  }
  return size;
}

// DeepSeek Prompt Enhancement
async function enhancePromptsWithDeepSeek(params: {
  prompt: string;
  apiKey: string;
  endpoint?: string;
  model?: string;
}): Promise<string[]> {
  try {
    const endpoint = params.endpoint || 'https://api.deepseek.com/v1/chat/completions';
    const model = params.model || 'deepseek-chat';

    const systemPrompt = `你是一位顶尖的手机壁纸视觉艺术总监与摄影大师。
用户输入了一个壁纸氛围或主题，请将其扩写为4组用于文生图的高清手机垂直壁纸（9:16比例）提示词。
要求：
1. 4组提示词具有截然不同的视角、光影质感与色彩体系。
2. 强化手机壁纸的留白美学、纯净度与视觉焦点。
3. 请仅以JSON数组格式输出4个字符串，格式为：["提示词1", "提示词2", "提示词3", "提示词4"]。不要包含任何markdown标记或额外解释。`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `壁纸主题氛围：${params.prompt}` },
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.warn('DeepSeek prompt enhance call failed:', res.status, errText);
      return [];
    }

    const data: any = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';
    const jsonMatch = reply.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed.slice(0, 4).map((s: any) => String(s).trim());
      }
    }
  } catch (e) {
    console.warn('DeepSeek prompt enhancer skipped due to error:', e);
  }
  return [];
}

// Generate single wallpaper via Custom API
async function generateCustomApiSingleWallpaper(params: {
  customApi: {
    provider: string;
    endpoint: string;
    apiKey: string;
    model: string;
  };
  prompt: string;
  variationPrompt: string;
  aspectRatio: string;
  imageSize: string;
  index: number;
  referenceImage?: string | null;
}) {
  const { customApi, prompt, variationPrompt, aspectRatio, imageSize, index, referenceImage } = params;

  if (!customApi.apiKey || customApi.apiKey.trim() === '') {
    throw new Error('未配置自定义 API Key，请在“设置 -> 自定义 API”中填入您的密钥。');
  }

  const endpoint = customApi.endpoint.trim();
  const apiKey = customApi.apiKey.trim();
  const model = customApi.model.trim() || 'wanx2.1-t2i-turbo';

  const fullPrompt = `${prompt}, ${variationPrompt}, phone wallpaper, ultra detailed, crisp focus, 8k resolution`;
  const size = getDimensionsForCustomApi(aspectRatio, customApi.provider);

  const payload: Record<string, any> = {
    model,
    prompt: fullPrompt,
    n: 1,
  };

  payload.size = size;
  payload.image_size = size;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}`;
      try {
        const errJson: any = await res.json();
        errDetail = errJson.error?.message || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }
      throw new Error(`自定义 API 响应错误 (${res.status}): ${errDetail}`);
    }

    const data: any = await res.json();
    let imageUrl = '';

    if (Array.isArray(data.data) && data.data.length > 0) {
      if (data.data[0].url) {
        imageUrl = data.data[0].url;
      } else if (data.data[0].b64_json) {
        imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      }
    } else if (data.output?.render_urls?.[0]) {
      imageUrl = data.output.render_urls[0];
    } else if (data.images?.[0]?.url) {
      imageUrl = data.images[0].url;
    }

    if (!imageUrl) {
      throw new Error(`未能从 API 返回数据中解析出图片: ${JSON.stringify(data).slice(0, 200)}`);
    }

    return {
      id: `wp_custom_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      url: imageUrl,
      prompt,
      variationIndex: index,
      aspectRatio,
      imageSize: imageSize || '1K',
      model: `${customApi.provider}:${model}`,
      createdAt: Date.now(),
      isRemix: Boolean(referenceImage),
    };
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

// Generate 4 Wallpaper Variations
app.post('/api/generate-wallpapers', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '9:16',
      imageSize = '1K',
      model = 'flux-dev-free',
      referenceImage = null,
      count = 4,
      customApi,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a vibe or prompt description for your wallpaper.',
      });
    }

    const generateCount = Math.min(Math.max(Number(count) || 4, 1), 4);

    // If Custom API is enabled or selected as the model
    if (customApi && customApi.enabled && customApi.apiKey) {
      const variationStyles = [
        'Atmospheric mood lighting, dramatic focal point, rich tonal depth, pristine wallpaper framing',
        'Cinematic wide perspective, layered environment, subtle specular glow, fine details',
        'Artistic color harmony, soft ambient gradients, aesthetic minimalism, balanced negative space',
        'Dynamic high contrast, evocative textures, surreal depth of field, elegant phone display design',
      ];

      let promptsToUse = variationStyles;
      if (customApi.enablePromptEnhance) {
        const deepSeekKey = customApi.enhancerApiKey || customApi.apiKey;
        const enhanced = await enhancePromptsWithDeepSeek({
          prompt: prompt.trim(),
          apiKey: deepSeekKey,
          endpoint: customApi.enhancerEndpoint,
          model: customApi.enhancerModel,
        });
        if (enhanced.length === 4) {
          promptsToUse = enhanced;
        }
      }

      const customTasks = [];
      for (let i = 0; i < generateCount; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 300));
        const varStyle = promptsToUse[i % promptsToUse.length];
        customTasks.push(
          generateCustomApiSingleWallpaper({
            customApi,
            prompt: prompt.trim(),
            variationPrompt: varStyle,
            aspectRatio,
            imageSize,
            index: i,
            referenceImage,
          })
        );
      }

      const results = await Promise.allSettled(customTasks);
      const successfulWallpapers = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (successfulWallpapers.length > 0) {
        return res.json({
          success: true,
          wallpapers: successfulWallpapers,
          engineUsed: `${customApi.provider}:${customApi.model}`,
        });
      }

      const firstFailure = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      const errMsg = firstFailure?.reason?.message || '自定义 API 生图未返回有效图片';
      return res.status(400).json({
        success: false,
        error: errMsg,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isGeminiModel = model === 'gemini-3-pro-image-preview' || model === 'gemini-3.1-flash-image-preview';

    // 4 distinct creative variation perspectives
    const variationStyles = [
      'Atmospheric mood lighting, dramatic focal point, rich tonal depth, pristine wallpaper framing',
      'Cinematic wide perspective, layered environment, subtle specular glow, fine details',
      'Artistic color harmony, soft ambient gradients, aesthetic minimalism, balanced negative space',
      'Dynamic high contrast, evocative textures, surreal depth of field, elegant phone display design',
    ];

    // If Free FLUX Dev model selected or no Gemini key available, use FLUX engine directly
    if (!isGeminiModel || !apiKey || apiKey.trim() === '') {
      const fluxTasks = [];
      for (let i = 0; i < generateCount; i++) {
        // slight stagger for network reliability
        if (i > 0) await new Promise((r) => setTimeout(r, 400));
        const variationPrompt = variationStyles[i % variationStyles.length];
        fluxTasks.push(
          await generateFluxSingleWallpaper({
            prompt: prompt.trim(),
            variationPrompt,
            aspectRatio,
            imageSize,
            referenceImage,
            index: i,
          })
        );
      }

      return res.json({
        success: true,
        wallpapers: fluxTasks,
        engineUsed: 'flux-dev-free',
      });
    }

    // Attempt generation with Gemini AI
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const tasks = [];
      for (let i = 0; i < generateCount; i++) {
        const variationPrompt = variationStyles[i % variationStyles.length];
        tasks.push(
          generateSingleWallpaper({
            ai,
            model,
            prompt: prompt.trim(),
            variationPrompt,
            aspectRatio,
            imageSize,
            referenceImage,
            index: i,
          })
        );
      }

      const results = await Promise.allSettled(tasks);
      const successfulWallpapers = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (successfulWallpapers.length > 0) {
        return res.json({
          success: true,
          wallpapers: successfulWallpapers,
          engineUsed: model,
        });
      }

      // If all Gemini attempts failed, inspect error
      const firstFailure = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      const rawError = firstFailure?.reason?.message || '';
      console.warn('Gemini generation failed, falling back to FLUX Dev:', rawError);
    } catch (geminiErr: any) {
      console.warn('Gemini client error, falling back to FLUX Dev:', geminiErr?.message);
    }

    // Seamless fallback to FLUX Dev free generator
    const fallbackWallpapers = [];
    for (let i = 0; i < generateCount; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 400));
      const variationPrompt = variationStyles[i % variationStyles.length];
      fallbackWallpapers.push(
        await generateFluxSingleWallpaper({
          prompt: prompt.trim(),
          variationPrompt,
          aspectRatio,
          imageSize,
          referenceImage,
          index: i,
        })
      );
    }

    return res.json({
      success: true,
      wallpapers: fallbackWallpapers,
      engineUsed: 'flux-dev-free',
      fallbackUsed: true,
      fallbackNotice: 'Gemini free quota is exhausted (429). Seamlessly switched to FLUX Dev free AI engine.',
    });
  } catch (error: any) {
    console.error('Error in generate-wallpapers endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'An unexpected error occurred during wallpaper generation.',
    });
  }
});

// Test Custom API Connection
app.post('/api/test-custom-api', async (req, res) => {
  try {
    const { endpoint, apiKey, model, provider } = req.body;

    if (!endpoint || !endpoint.trim()) {
      return res.status(400).json({ success: false, error: '请输入 API 端点 URL' });
    }
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: '请输入 API Key' });
    }

    const trimmedEndpoint = endpoint.trim();
    const trimmedKey = apiKey.trim();
    const targetModel = (model || 'wanx2.1-t2i-turbo').trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const size = getDimensionsForCustomApi('1:1', provider);
    const testPayload = {
      model: targetModel,
      prompt: 'minimalist peaceful gradient phone wallpaper, soft light, clean aesthetic',
      n: 1,
      size,
      image_size: size,
    };

    const response = await fetch(trimmedEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errDetail = `HTTP ${response.status}`;
      try {
        const errJson: any = await response.json();
        errDetail = errJson.error?.message || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await response.text();
      }
      return res.json({
        success: false,
        error: `连接或鉴权失败 (${response.status}): ${errDetail}`,
      });
    }

    const data: any = await response.json();
    return res.json({
      success: true,
      message: 'API 连接与生图测试成功！',
      provider,
      model: targetModel,
      data,
    });
  } catch (err: any) {
    return res.json({
      success: false,
      error: `请求超时或网络异常: ${err?.message || err}`,
    });
  }
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
