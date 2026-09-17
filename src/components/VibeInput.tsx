import React, { useState } from 'react';
import { Sparkles, Dices, X, RefreshCw, Layers } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface VibeInputProps {
  lang: Language;
  prompt: string;
  onChangePrompt: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  referenceImage: string | null;
  onClearReference: () => void;
}

export const VibeInput: React.FC<VibeInputProps> = ({
  lang,
  prompt,
  onChangePrompt,
  onSubmit,
  isLoading,
  referenceImage,
  onClearReference,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const t = translations[lang];

  const handleSurpriseMe = () => {
    const randomVibe = t.presets[Math.floor(Math.random() * t.presets.length)].vibe;
    onChangePrompt(randomVibe);
    setSelectedTag(randomVibe);
  };

  const handleSelectTag = (vibe: string) => {
    onChangePrompt(vibe);
    setSelectedTag(vibe);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-4 pb-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        {/* Remixing reference indicator */}
        {referenceImage && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/40 border border-indigo-700/40 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-14 rounded-lg overflow-hidden border border-indigo-400/40 shadow-sm shrink-0 bg-slate-900">
                <img
                  src={referenceImage}
                  alt="Reference wallpaper"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-300">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.remixActive}</span>
                </div>
                <p className="text-[11px] text-indigo-200/70">{t.remixActiveDesc}</p>
              </div>
            </div>

            <button
              type="button"
              id="clear-reference-btn"
              onClick={onClearReference}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-colors"
              title={t.clearReference}
              aria-label={t.clearReference}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input box */}
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-lg shadow-black/40">
          <div className="flex items-center gap-2 px-2 pb-2">
            <input
              id="vibe-input-field"
              type="text"
              value={prompt}
              onChange={(e) => {
                onChangePrompt(e.target.value);
                setSelectedTag('');
              }}
              placeholder={referenceImage ? t.remixPlaceholder : t.inputPlaceholder}
              className="w-full bg-transparent text-sm md:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
              disabled={isLoading}
            />
            {prompt && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  onChangePrompt('');
                  setSelectedTag('');
                }}
                className="p-1 text-slate-500 hover:text-slate-300"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-1">
            <button
              type="button"
              id="surprise-vibe-btn"
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors disabled:opacity-50"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.surpriseMe}</span>
            </button>

            <button
              type="submit"
              id="generate-wallpapers-btn"
              disabled={!prompt.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white text-xs md:text-sm font-semibold shadow-md shadow-indigo-900/40 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                  <span>{t.generatingButton}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{referenceImage ? t.remixButton : t.generateButton}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset vibe chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-[11px] font-medium text-slate-500 shrink-0 pl-0.5">{t.vibesLabel}</span>
          {t.presets.map((item) => (
            <button
              key={item.vibe}
              type="button"
              onClick={() => handleSelectTag(item.vibe)}
              disabled={isLoading}
              className={`shrink-0 px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap text-xs ${
                selectedTag === item.vibe || prompt === item.vibe
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {item.vibe}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
