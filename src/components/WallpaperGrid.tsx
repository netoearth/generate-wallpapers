import React from 'react';
import { Maximize2, Download, RefreshCw, Sparkles, Layers, Image as ImageIcon } from 'lucide-react';
import { Wallpaper, AspectRatio, Language } from '../types';
import { translations } from '../i18n';

interface WallpaperGridProps {
  lang: Language;
  wallpapers: Wallpaper[];
  isLoading: boolean;
  currentPrompt: string;
  aspectRatio: AspectRatio;
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onQuickDownload: (wallpaper: Wallpaper, e: React.MouseEvent) => void;
  onQuickRemix: (wallpaper: Wallpaper, e: React.MouseEvent) => void;
  onSelectPresetVibe: (vibe: string) => void;
}

export const WallpaperGrid: React.FC<WallpaperGridProps> = ({
  lang,
  wallpapers,
  isLoading,
  currentPrompt,
  aspectRatio,
  onSelectWallpaper,
  onQuickDownload,
  onQuickRemix,
  onSelectPresetVibe,
}) => {
  const t = translations[lang];

  // Map aspect ratio to CSS aspect-ratio class or style
  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '9:16':
        return 'aspect-[9/16]';
      case '1:1':
        return 'aspect-square';
      case '2:3':
        return 'aspect-[2/3]';
      case '3:2':
        return 'aspect-[3/2]';
      case '3:4':
        return 'aspect-[3/4]';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
        return 'aspect-[16/9]';
      case '21:9':
        return 'aspect-[21/9]';
      default:
        return 'aspect-[9/16]';
    }
  };

  const ratioClass = getAspectRatioClass(aspectRatio);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-200">{t.craftingTitle}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-[200px]">"{currentPrompt}"</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`relative ${ratioClass} rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800/80 overflow-hidden shadow-lg shadow-black/40 flex flex-col items-center justify-center p-4`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/20 via-transparent to-indigo-950/20 animate-pulse-glow" />
              <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
                <Sparkles className="w-5 h-5 animate-pulse text-indigo-400/70" />
              </div>
              <span className="text-xs font-medium text-slate-400">Variation {num}</span>
              <span className="text-[10px] text-slate-600 mt-0.5">...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty Welcome State
  if (!wallpapers || wallpapers.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center text-center">
        <div className="w-16 h-28 rounded-2xl bg-slate-900/90 border-2 border-dashed border-slate-700/80 flex flex-col items-center justify-center p-2 mb-4 shadow-xl">
          <ImageIcon className="w-7 h-7 text-indigo-400 mb-1" />
          <span className="text-[9px] font-bold text-slate-400 uppercase">9:16 Vibe</span>
        </div>

        <h3 className="text-lg font-bold text-white font-['Outfit',sans-serif] mb-1">
          {t.emptyTitle}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          {t.emptyDesc}
        </p>

        <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            {t.popularStarters}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.presets.slice(0, 4).map((item) => (
              <button
                key={item.vibe}
                type="button"
                onClick={() => onSelectPresetVibe(item.vibe)}
                className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                  {item.vibe}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Variations Grid
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-['Outfit',sans-serif]">
            {t.variationsHeader}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
            {aspectRatio}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">{t.tapToInspect}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-8">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={wallpaper.id}
            id={`wallpaper-card-${index}`}
            onClick={() => onSelectWallpaper(wallpaper)}
            className={`group relative ${ratioClass} rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/90 shadow-xl shadow-black/50 cursor-pointer transition-all duration-200 active:scale-[0.98] hover:border-indigo-500/60 hover:shadow-indigo-950/30`}
          >
            {/* Wallpaper Image */}
            <img
              src={wallpaper.url}
              alt={`Wallpaper variation ${index + 1}: ${wallpaper.prompt}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10">
                #{index + 1}
              </span>

              {wallpaper.isRemix && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-900/80 backdrop-blur-md text-[9px] font-semibold text-indigo-200 border border-indigo-500/40">
                  <Layers className="w-2.5 h-2.5" />
                  {t.remix}
                </span>
              )}
            </div>

            {/* Bottom Controls on Hover/Mobile */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id={`quick-download-${index}`}
                  onClick={(e) => onQuickDownload(wallpaper, e)}
                  className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-white/10"
                  title={t.download}
                  aria-label={t.download}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  id={`quick-remix-${index}`}
                  onClick={(e) => onQuickRemix(wallpaper, e)}
                  className="p-1.5 rounded-lg bg-indigo-900/80 backdrop-blur-md text-indigo-200 hover:text-white hover:bg-indigo-700 transition-colors border border-indigo-500/30"
                  title={t.remix}
                  aria-label={t.remix}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-medium text-slate-200 border border-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Maximize2 className="w-3 h-3" />
                <span>{t.fullView}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
