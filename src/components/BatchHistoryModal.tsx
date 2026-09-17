import React from 'react';
import { X, History, Trash2, ArrowRight, Layers } from 'lucide-react';
import { WallpaperBatch, Wallpaper, Language } from '../types';
import { translations } from '../i18n';

interface BatchHistoryModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  batches: WallpaperBatch[];
  onSelectBatch: (batch: WallpaperBatch) => void;
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onClearHistory: () => void;
}

export const BatchHistoryModal: React.FC<BatchHistoryModalProps> = ({
  lang,
  isOpen,
  onClose,
  batches,
  onSelectBatch,
  onSelectWallpaper,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div
      id="history-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="history-modal-card"
        className="w-full max-w-lg bg-[#111420] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">{t.historyTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            {batches.length > 0 && (
              <button
                type="button"
                id="clear-all-history-btn"
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title={t.clearHistory}
                aria-label={t.clearHistory}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              id="close-history-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-xs">{t.noHistory}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-xs font-semibold text-white truncate">
                      "{batch.prompt}"
                    </span>
                    {batch.isRemix && (
                      <span className="flex items-center gap-1 text-[9px] font-semibold text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        <Layers className="w-2.5 h-2.5" />
                        {t.remix}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* 4 Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {batch.wallpapers.map((wallpaper, wIndex) => (
                    <button
                      key={wallpaper.id}
                      type="button"
                      onClick={() => {
                        onSelectWallpaper(wallpaper);
                        onClose();
                      }}
                      className="aspect-[9/16] rounded-lg overflow-hidden border border-slate-700/60 hover:border-indigo-400 transition-all active:scale-95 bg-slate-950"
                      title={`Variation ${wIndex + 1}`}
                    >
                      <img
                        src={wallpaper.url}
                        alt={`Variation ${wIndex + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    {batch.aspectRatio} · {batch.imageSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBatch(batch);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>{t.loadBatch}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
