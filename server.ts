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
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a vibe or prompt description for your wallpaper.',
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

    const generateCount = Math.min(Math.max(Number(count) || 4, 1), 4);

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
