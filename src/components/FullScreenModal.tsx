import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Wallpaper, Language } from '../types';
import { translations } from '../i18n';

interface FullScreenModalProps {
  lang: Language;
  wallpaper: Wallpaper | null;
  allWallpapers: Wallpaper[];
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  lang,
  wallpaper,
  allWallpapers,
  onClose,
  onRemix,
  onSelectWallpaper,
}) => {
  const [showLockOverlay, setShowLockOverlay] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [currentDate, setCurrentDate] = useState<string>('Thursday, September 17');
  const t = translations[lang];

  // Format real or aesthetic time in current language
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString(locale, options));
    };
    updateDate();
  }, [lang]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && wallpaper) {
        const idx = allWallpapers.findIndex((w) => w.id === wallpaper.id);
        if (idx > 0) onSelectWallpaper(allWallpapers[idx - 1]);
      }
      if (e.key === 'ArrowRight' && wallpaper) {
        const idx = allWallpapers.findIndex((w) => w.id === wallpaper.id);
        if (idx < allWallpapers.length - 1) onSelectWallpaper(allWallpapers[idx + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wallpaper, allWallpapers, onClose, onSelectWallpaper]);

  if (!wallpaper) return null;

  const currentIndex = allWallpapers.findIndex((w) => w.id === wallpaper.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allWallpapers.length - 1;

  // Trigger Download via direct blob or download-proxy
  const handleDownload = () => {
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
      // Use proxy for remote URLs to ensure browser downloads as file
      const downloadUrl = `/api/download-proxy?url=${encodeURIComponent(wallpaper.url)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      id="fullscreen-viewer-modal"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Top Floating Bar */}
      <div className="w-full max-w-lg flex items-center justify-between py-2 px-3 z-30">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-800/80 backdrop-blur-md text-xs font-semibold text-slate-200 border border-slate-700">
            {currentIndex + 1} / {allWallpapers.length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {wallpaper.aspectRatio} · {wallpaper.imageSize}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lock screen preview toggle */}
          <button
            type="button"
            id="toggle-lock-screen-overlay"
            onClick={() => setShowLockOverlay((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showLockOverlay
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title={t.lockScreen}
          >
            {showLockOverlay ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="text-xs">{showLockOverlay ? t.hideLockScreen : t.lockScreen}</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            id="close-fullscreen-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Wallpaper Preview Stage */}
      <div className="relative flex-1 w-full max-w-sm flex items-center justify-center my-auto overflow-hidden">
        {/* Nav Prev */}
        {hasPrev && (
          <button
            type="button"
            id="fullscreen-prev-btn"
            onClick={() => onSelectWallpaper(allWallpapers[currentIndex - 1])}
            className="absolute left-1 z-30 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/80 border border-white/10 transition-colors"
            aria-label={t.prevWallpaper}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Wallpaper Frame */}
        <div className="relative w-full max-h-[72vh] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 bg-slate-950 flex items-center justify-center">
          <img
            src={wallpaper.url}
            alt={wallpaper.prompt}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Optional Lock Screen Overlay Simulator */}
          {showLockOverlay && (
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/50 text-white font-sans animate-in fade-in duration-150">
              {/* Top Lock status */}
              <div className="flex flex-col items-center pt-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/80 mb-1 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
                <div className="text-[11px] font-medium tracking-wide text-white/90 drop-shadow">
                  {currentDate}
                </div>
                <div className="text-6xl font-light tracking-tight text-white drop-shadow-md my-1 font-['Outfit',sans-serif]">
                  {currentTime}
                </div>
              </div>

              {/* Sample notification bubble */}
              <div className="my-auto w-full">
                <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-white/90">{t.lockScreenNoticeTitle}</span>
                    <span className="text-[10px] text-white/70">now</span>
                  </div>
                  <p className="text-xs text-white/90 leading-snug line-clamp-2">
                    {t.lockScreenNoticeBody}
                  </p>
                </div>
              </div>

              {/* Bottom Phone Shortcuts & Home Bar */}
              <div className="flex flex-col items-center gap-4 pb-1">
                <div className="w-full flex items-center justify-between px-2 text-white/90">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>

                <div className="w-32 h-1 rounded-full bg-white/70 shadow" />
              </div>
            </div>
          )}
        </div>

        {/* Nav Next */}
        {hasNext && (
          <button
            type="button"
            id="fullscreen-next-btn"
            onClick={() => onSelectWallpaper(allWallpapers[currentIndex + 1])}
            className="absolute right-1 z-30 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/80 border border-white/10 transition-colors"
            aria-label={t.nextWallpaper}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="w-full max-w-lg z-30 px-3 py-3">
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5">
          <div className="text-center px-2">
            <p className="text-xs text-slate-300 font-medium truncate">
              "{wallpaper.prompt}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Download Button */}
            <button
              type="button"
              id="download-wallpaper-btn"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs md:text-sm font-semibold border border-slate-700 active:scale-[0.98] transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>{t.downloadWallpaper}</span>
            </button>

            {/* Remix Button */}
            <button
              type="button"
              id="remix-wallpaper-btn"
              onClick={() => onRemix(wallpaper)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs md:text-sm font-semibold active:scale-[0.98] transition-all shadow-md shadow-indigo-900/40"
            >
              <RefreshCw className="w-4 h-4 text-indigo-200" />
              <span>{t.remixBatch}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
