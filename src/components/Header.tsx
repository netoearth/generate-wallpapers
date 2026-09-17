import React from 'react';
import { Smartphone, Sliders, History, Globe, Layers, Heart } from 'lucide-react';
import { AspectRatio, ImageSize, ModelChoice, Language } from '../types';
import { translations } from '../i18n';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  model: ModelChoice;
  historyCount: number;
  favoritesCount?: number;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenFavorites?: () => void;
  onOpenCrossPlatform: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  aspectRatio,
  imageSize,
  model,
  historyCount,
  favoritesCount = 0,
  onOpenSettings,
  onOpenHistory,
  onOpenFavorites,
  onOpenCrossPlatform,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-[#0e111a]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/30 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5 font-['Outfit',sans-serif] truncate">
              <span>{t.appTitle}</span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                {t.nineToSixteen}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* PWA & Cross-Platform Install Action */}
          <PWAInstallButton
            lang={lang}
            onOpenCrossPlatformModal={onOpenCrossPlatform}
          />

          {/* Cross-Platform Hub Button */}
          <button
            id="open-cross-platform-hub-btn"
            type="button"
            onClick={onOpenCrossPlatform}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title={t.crossPlatformHub}
            aria-label={t.crossPlatformHub}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Language Toggle Button */}
          <button
            id="toggle-language-btn"
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900/70 hover:bg-slate-800/90 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
            title={t.switchLanguage}
            aria-label={t.switchLanguage}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px]">{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>

          {/* Favorites Button */}
          <button
            id="open-favorites-btn"
            type="button"
            onClick={onOpenFavorites || onOpenHistory}
            className="relative p-2 rounded-lg text-slate-300 hover:text-rose-400 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title={t.favoritesTab}
            aria-label={t.favoritesTab}
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-500' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* History Button */}
          <button
            id="open-history-btn"
            type="button"
            onClick={onOpenHistory}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title={t.history}
            aria-label={t.history}
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            id="open-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title={t.settings}
            aria-label={t.settings}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-200 hidden sm:inline">{aspectRatio}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">{imageSize}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
