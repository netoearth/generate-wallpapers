import React from 'react';
import { X, Check, Sliders, Sparkles, Zap, Globe, Layers, ArrowRight } from 'lucide-react';
import { AspectRatio, ImageSize, ModelChoice, Language } from '../types';
import { translations } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  imageSize: ImageSize;
  onChangeImageSize: (size: ImageSize) => void;
  model: ModelChoice;
  onChangeModel: (model: ModelChoice) => void;
  onOpenCrossPlatform?: () => void;
}

const ASPECT_RATIOS: Array<{
  ratio: AspectRatio;
  label: string;
  desc: string;
  recommended?: boolean;
}> = [
  { ratio: '9:16', label: '9:16', desc: 'Phone Wallpaper', recommended: true },
  { ratio: '1:1', label: '1:1', desc: 'Square Avatar' },
  { ratio: '2:3', label: '2:3', desc: 'Standard Portrait' },
  { ratio: '3:2', label: '3:2', desc: 'Classic Photo' },
  { ratio: '3:4', label: '3:4', desc: 'Tall Portrait' },
  { ratio: '4:3', label: '4:3', desc: 'Classic Monitor' },
  { ratio: '16:9', label: '16:9', desc: 'Widescreen' },
  { ratio: '21:9', label: '21:9', desc: 'Ultrawide' },
];

const IMAGE_SIZES: Array<{
  size: ImageSize;
  label: string;
  desc: string;
}> = [
  { size: '1K', label: '1K Standard', desc: 'Balanced speed & clarity' },
  { size: '2K', label: '2K High Res', desc: 'Crisp retina detail' },
  { size: '4K', label: '4K Ultra HD', desc: 'Studio grade wallpaper' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onChangeLang,
  aspectRatio,
  onChangeAspectRatio,
  imageSize,
  onChangeImageSize,
  model,
  onChangeModel,
  onOpenCrossPlatform,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-full max-w-lg bg-[#111420] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-5 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">{t.settings}</h2>
          </div>
          <button
            id="close-settings-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              {t.language}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="lang-btn-zh"
              onClick={() => onChangeLang('zh')}
              className={`p-3 rounded-xl border text-center transition-all ${
                lang === 'zh'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-sm font-bold text-slate-100">中文 (简体)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Chinese</div>
            </button>

            <button
              type="button"
              id="lang-btn-en"
              onClick={() => onChangeLang('en')}
              className={`p-3 rounded-xl border text-center transition-all ${
                lang === 'en'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="text-sm font-bold text-slate-100">English</div>
              <div className="text-[10px] text-slate-400 mt-0.5">US English</div>
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.model}</span>
            <span className="text-[11px] text-emerald-400 font-medium">{t.freeTag}</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* FLUX Dev Free Model */}
            <button
              type="button"
              id="model-flux-dev-free"
              onClick={() => onChangeModel('flux-dev-free')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                model === 'flux-dev-free'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                  <span>{t.modelFluxFree}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-normal">
                    {t.freeTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {t.modelFluxFreeDesc}
                </p>
              </div>
            </button>

            {/* Gemini 3 Pro */}
            <button
              type="button"
              id="model-gemini-3-pro"
              onClick={() => onChangeModel('gemini-3-pro-image-preview')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                model === 'gemini-3-pro-image-preview'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                  <span>{t.modelGeminiPro}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                    {t.paidTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {t.modelGeminiProDesc}
                </p>
              </div>
            </button>

            {/* Gemini 3.1 Flash */}
            <button
              type="button"
              id="model-gemini-3-1-flash"
              onClick={() => onChangeModel('gemini-3.1-flash-image-preview')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                model === 'gemini-3.1-flash-image-preview'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                  <span>{t.modelGeminiFlash}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                    {t.paidTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {t.modelGeminiFlashDesc}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Image Size (Resolution) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.resolution}</span>
            <span className="text-[11px] text-slate-400">1K / 2K / 4K</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {IMAGE_SIZES.map((item) => {
              const isSelected = imageSize === item.size;
              return (
                <button
                  key={item.size}
                  type="button"
                  id={`image-size-${item.size.toLowerCase()}`}
                  onClick={() => onChangeImageSize(item.size)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-100">{item.size}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.aspectRatio}</span>
            <span className="text-[11px] text-slate-400">{t.nineToSixteen}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ASPECT_RATIOS.map((item) => {
              const isSelected = aspectRatio === item.ratio;
              return (
                <button
                  key={item.ratio}
                  type="button"
                  id={`aspect-ratio-${item.ratio.replace(':', '-')}`}
                  onClick={() => onChangeAspectRatio(item.ratio)}
                  className={`relative p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{item.label}</span>
                    {item.recommended && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cross-Platform Hub Trigger */}
        {onOpenCrossPlatform && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">{t.crossPlatformHub}</div>
                <div className="text-[10px] text-slate-400">Android · Windows · macOS · Linux</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCrossPlatform();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-colors"
            >
              <span>{lang === 'zh' ? '管理跨平台发布' : 'Open Hub'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Save button */}
        <div className="pt-2">
          <button
            type="button"
            id="apply-settings-btn"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-semibold transition-colors shadow-md"
          >
            {t.applySettings}
          </button>
        </div>
      </div>
    </div>
  );
};
