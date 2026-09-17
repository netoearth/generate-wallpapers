import React, { useState, useEffect } from 'react';
import { X, History, Trash2, ArrowRight, Layers, Heart } from 'lucide-react';
import { WallpaperBatch, Wallpaper, Language } from '../types';
import { translations } from '../i18n';

interface BatchHistoryModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  batches: WallpaperBatch[];
  favorites: Wallpaper[];
  onSelectBatch: (batch: WallpaperBatch) => void;
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onClearHistory: () => void;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
  onClearFavorites: () => void;
  initialTab?: 'history' | 'favorites';
}

export const BatchHistoryModal: React.FC<BatchHistoryModalProps> = ({
  lang,
  isOpen,
  onClose,
  batches,
  favorites,
  onSelectBatch,
  onSelectWallpaper,
  onClearHistory,
  onToggleFavorite,
  onClearFavorites,
  initialTab = 'history',
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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
            {activeTab === 'history' ? (
              <History className="w-5 h-5 text-indigo-400" />
            ) : (
              <Heart className="w-5 h-5 text-rose-400 fill-rose-500" />
            )}
            <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
              {activeTab === 'history' ? t.historyTab : t.favoritesTab}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'history' && batches.length > 0 && (
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
            {activeTab === 'favorites' && favorites.length > 0 && (
              <button
                type="button"
                id="clear-all-favorites-btn"
                onClick={onClearFavorites}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title={t.clearFavorites}
                aria-label={t.clearFavorites}
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            id="tab-history-btn"
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.historyTab}</span>
            {batches.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/40 text-indigo-200">
                {batches.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-favorites-btn"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'fill-white' : 'fill-none'}`} />
            <span>{t.favoritesTab}</span>
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/40 text-rose-200">
                {favorites.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'history' ? (
          batches.length === 0 ? (
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
          )
        ) : (
          /* Favorites Tab Content */
          favorites.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 gap-3 px-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-xs max-w-xs leading-relaxed text-slate-400">{t.noFavorites}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md hover:border-rose-500/60 transition-all flex flex-col justify-between"
                >
                  <img
                    src={fav.url}
                    alt={fav.prompt}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onClick={() => {
                      onSelectWallpaper(fav);
                      onClose();
                    }}
                  />
                  {/* Gradient Vignette for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

                  {/* Top action: Unfavorite heart & aspect ratio */}
                  <div className="relative z-10 flex items-center justify-between p-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-white/90 border border-white/10 font-medium">
                      {fav.aspectRatio}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(fav);
                      }}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-rose-400 hover:text-white hover:bg-rose-600 transition-colors border border-white/10 shadow"
                      title={t.unfavorite}
                      aria-label={t.unfavorite}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Bottom info & view action */}
                  <div className="relative z-10 p-2">
                    <p className="text-[11px] text-white font-medium line-clamp-1 drop-shadow mb-1.5">
                      "{fav.prompt}"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWallpaper(fav);
                        onClose();
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <span>{t.fullView}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
