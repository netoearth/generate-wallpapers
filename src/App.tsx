import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VibeInput } from './components/VibeInput';
import { WallpaperGrid } from './components/WallpaperGrid';
import { FullScreenModal } from './components/FullScreenModal';
import { SettingsModal } from './components/SettingsModal';
import { BatchHistoryModal } from './components/BatchHistoryModal';
import { AspectRatio, ImageSize, ModelChoice, Wallpaper, WallpaperBatch, Language } from './types';
import { translations } from './i18n';
import { AlertCircle, X, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  // Multi-language state: default 'zh' (or stored preference)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('wallpaper_ai_lang');
    if (saved === 'zh' || saved === 'en') return saved;
    return 'zh';
  });

  const t = translations[lang];

  const handleToggleLang = () => {
    const nextLang: Language = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    localStorage.setItem('wallpaper_ai_lang', nextLang);
  };

  const handleChangeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('wallpaper_ai_lang', newLang);
  };

  // State
  const [prompt, setPrompt] = useState<string>(lang === 'zh' ? '雨夜赛博朋克低保真街道' : 'rainy cyberpunk lo-fi');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  // Default to flux-dev-free so user immediately gets reliable, quota-free wallpaper generation!
  const [model, setModel] = useState<ModelChoice>('flux-dev-free');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const [currentWallpapers, setCurrentWallpapers] = useState<Wallpaper[]>([]);
  const [batches, setBatches] = useState<WallpaperBatch[]>([]);
  const [activeWallpaper, setActiveWallpaper] = useState<Wallpaper | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Check backend health/config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        // If Gemini is selected but no key, notify user
        if (!data.hasApiKey && model.startsWith('gemini')) {
          setModel('flux-dev-free');
        }
      })
      .catch((err) => {
        console.error('Config fetch failed:', err);
      });
  }, [model]);

  // Main generation handler
  const handleGenerate = async (overrideRefImage?: string | null, customPrompt?: string) => {
    const promptToUse = customPrompt !== undefined ? customPrompt : prompt;
    if (!promptToUse.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const refToUse = overrideRefImage !== undefined ? overrideRefImage : referenceImage;

    try {
      const response = await fetch('/api/generate-wallpapers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToUse.trim(),
          aspectRatio,
          imageSize,
          model,
          referenceImage: refToUse,
          count: 4,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || (lang === 'zh' ? '生成壁纸失败，请重试' : 'Failed to generate wallpapers.'));
      }

      const generated: Wallpaper[] = data.wallpapers || [];

      if (generated.length === 0) {
        throw new Error(lang === 'zh' ? '未生成壁纸，请尝试其他描述词。' : 'No wallpapers were generated. Please try again.');
      }

      // Update current active batch
      setCurrentWallpapers(generated);

      // Save to batch history
      const newBatch: WallpaperBatch = {
        id: `batch_${Date.now()}`,
        prompt: promptToUse.trim(),
        wallpapers: generated,
        aspectRatio,
        imageSize,
        model,
        timestamp: Date.now(),
        isRemix: Boolean(refToUse),
        referenceImage: refToUse || undefined,
      };

      setBatches((prev) => [newBatch, ...prev]);
    } catch (err: any) {
      console.error('Generation error:', err);
      const msg = err.message || (lang === 'zh' ? '生成壁纸时发生错误。' : 'An error occurred while generating wallpapers.');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick download helper
  const handleQuickDownload = (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPrompt = wallpaper.prompt
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .substring(0, 30);
    const filename = `wallpaper-${cleanPrompt}-var${wallpaper.variationIndex + 1}.jpg`;

    if (wallpaper.url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = wallpaper.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(wallpaper.url)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Remix handler: Uses current image as reference for next batch
  const handleRemix = (wallpaper: Wallpaper, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Set reference image
    setReferenceImage(wallpaper.url);
    // Close full screen viewer if open
    setActiveWallpaper(null);

    // Trigger generation using this reference image
    handleGenerate(wallpaper.url, wallpaper.prompt);
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e8f0] flex flex-col font-sans">
      {/* Mobile-first sticky header with Language Toggle */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        aspectRatio={aspectRatio}
        imageSize={imageSize}
        model={model}
        historyCount={batches.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto flex flex-col">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">
                  {lang === 'zh' ? '提示' : 'Notice'}
                </span>
                <span>{errorMessage}</span>
                {model !== 'flux-dev-free' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModel('flux-dev-free');
                      setErrorMessage(null);
                      handleGenerate();
                    }}
                    className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      {lang === 'zh' ? '切换至免费模型 (FLUX Dev) 并重试' : 'Switch to Free Model (FLUX Dev) & Retry'}
                    </span>
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-red-900/60 text-red-300"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input prompt & vibe controls */}
        <VibeInput
          lang={lang}
          prompt={prompt}
          onChangePrompt={setPrompt}
          onSubmit={() => handleGenerate()}
          isLoading={isLoading}
          referenceImage={referenceImage}
          onClearReference={() => setReferenceImage(null)}
        />

        {/* 4 Variations Grid */}
        <div className="flex-1">
          <WallpaperGrid
            lang={lang}
            wallpapers={currentWallpapers}
            isLoading={isLoading}
            currentPrompt={prompt}
            aspectRatio={aspectRatio}
            onSelectWallpaper={(wp) => setActiveWallpaper(wp)}
            onQuickDownload={handleQuickDownload}
            onQuickRemix={handleRemix}
            onSelectPresetVibe={(vibe) => {
              setPrompt(vibe);
              handleGenerate(referenceImage, vibe);
            }}
          />
        </div>
      </main>

      {/* Full-Screen Wallpaper Modal with Download & Remix */}
      <FullScreenModal
        lang={lang}
        wallpaper={activeWallpaper}
        allWallpapers={currentWallpapers}
        onClose={() => setActiveWallpaper(null)}
        onRemix={handleRemix}
        onSelectWallpaper={setActiveWallpaper}
      />

      {/* Settings Modal (Aspect Ratio, Image Size, Model, Language) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        onChangeLang={handleChangeLang}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        imageSize={imageSize}
        onChangeImageSize={setImageSize}
        model={model}
        onChangeModel={setModel}
      />

      {/* History Modal */}
      <BatchHistoryModal
        lang={lang}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        batches={batches}
        onSelectBatch={(batch) => {
          setCurrentWallpapers(batch.wallpapers);
          setPrompt(batch.prompt);
          setAspectRatio(batch.aspectRatio);
          setImageSize(batch.imageSize);
        }}
        onSelectWallpaper={(wp) => setActiveWallpaper(wp)}
        onClearHistory={() => setBatches([])}
      />
    </div>
  );
}
