import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Globe,
  Layers,
  ArrowRight,
  Key,
  Server,
  Cpu,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';
import { AspectRatio, ImageSize, ModelChoice, Language, CustomApiConfig, CustomApiProvider } from '../types';
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
  customApi: CustomApiConfig;
  onChangeCustomApi: (config: CustomApiConfig) => void;
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

interface ProviderPreset {
  id: CustomApiProvider;
  name: string;
  badge: string;
  endpoint: string;
  defaultModel: string;
  suggestedModels: string[];
  portalUrl: string;
  portalName: string;
  description: string;
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'qwen-dashscope',
    name: '阿里通义万相 (Qwen / Wanx)',
    badge: '阿里云百炼',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations',
    defaultModel: 'wanx2.1-t2i-turbo',
    suggestedModels: ['wanx2.1-t2i-turbo', 'wanx2.1-t2i-plus', 'wanx-v1'],
    portalUrl: 'https://bailian.console.aliyun.com/',
    portalName: '百炼控制台获取 Key',
    description: '阿里云官方通义万相 2.1 极速文生图，构图自然，国风美学与写实极佳',
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    badge: '高速聚合',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    defaultModel: 'black-forest-labs/FLUX.1-schnell',
    suggestedModels: ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-5-large', 'Pro/black-forest-labs/FLUX.1-schnell'],
    portalUrl: 'https://cloud.siliconflow.cn/',
    portalName: '硅基流动获取 Key',
    description: '国内高速部署的 FLUX.1 与 SD3.5，秒级出图，支持多种模型规格',
  },
  {
    id: 'deepseek-compat',
    name: 'DeepSeek 扩写 + 硅基生图',
    badge: '双核协同',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    defaultModel: 'black-forest-labs/FLUX.1-schnell',
    suggestedModels: ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-3-5-large'],
    portalUrl: 'https://platform.deepseek.com/',
    portalName: 'DeepSeek 开放平台',
    description: '先由 DeepSeek 对壁纸氛围进行构图/光影四重扩写，再通过兼容 API 渲染',
  },
  {
    id: 'zhipu-cogview',
    name: '智谱 AI (CogView)',
    badge: '清华系大模型',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/images/generations',
    defaultModel: 'cogview-3-plus',
    suggestedModels: ['cogview-3-plus', 'cogview-3'],
    portalUrl: 'https://open.bigmodel.cn/',
    portalName: '智谱大模型平台',
    description: '智谱新一代 CogView 系列多模态生图大模型，色彩饱和度与画质出众',
  },
  {
    id: 'custom-openai',
    name: '自定义 OpenAI 兼容接口',
    badge: '通用中转 / 代理',
    endpoint: 'https://api.openai.com/v1/images/generations',
    defaultModel: 'dall-e-3',
    suggestedModels: ['dall-e-3', 'dall-e-2'],
    portalUrl: 'https://platform.openai.com/api-keys',
    portalName: 'OpenAI API Keys',
    description: '支持 OneAPI、NewAPI 或任意遵循 OpenAI /v1/images/generations 规范的端点',
  },
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
  customApi,
  onChangeCustomApi,
  onOpenCrossPlatform,
}) => {
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const t = translations[lang];

  const handleProviderSelect = (preset: ProviderPreset) => {
    onChangeCustomApi({
      ...customApi,
      provider: preset.id,
      endpoint: preset.endpoint,
      model: preset.defaultModel,
      enabled: true,
    });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!customApi.endpoint?.trim()) {
      setTestResult({
        success: false,
        message: lang === 'zh' ? '请输入有效的 API 端点 URL' : 'Please enter a valid API endpoint URL',
      });
      return;
    }
    if (!customApi.apiKey?.trim()) {
      setTestResult({
        success: false,
        message: lang === 'zh' ? '请输入 API Key' : 'Please enter an API Key',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-custom-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: customApi.endpoint.trim(),
          apiKey: customApi.apiKey.trim(),
          model: customApi.model.trim(),
          provider: customApi.provider,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || (lang === 'zh' ? '测试成功！API 端点与密钥配置有效' : 'Connected successfully!'),
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || (lang === 'zh' ? '测试失败，请检查密钥与端点' : 'Test failed. Check key & endpoint.'),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || (lang === 'zh' ? '网络请求超时或异常' : 'Network request timeout or failure'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const currentPreset = PROVIDER_PRESETS.find((p) => p.id === customApi.provider) || PROVIDER_PRESETS[0];

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-full sm:max-w-xl max-h-[90vh] bg-slate-950 border border-slate-800 sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl overflow-y-auto p-4 sm:p-6 gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">{t.settings}</h2>
          </div>
          <button
            type="button"
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.language}</span>
            <span className="text-[11px] text-slate-500">{lang === 'zh' ? '当前：中文' : 'Current: English'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="lang-btn-zh"
              onClick={() => onChangeLang('zh')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                lang === 'zh'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>简体中文</span>
              {lang === 'zh' && <Check className="w-3.5 h-3.5 text-indigo-400 ml-1" />}
            </button>
            <button
              type="button"
              id="lang-btn-en"
              onClick={() => onChangeLang('en')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
              {lang === 'en' && <Check className="w-3.5 h-3.5 text-indigo-400 ml-1" />}
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

            {/* Custom / Domestic API Model Card */}
            <button
              type="button"
              id="model-custom-api"
              onClick={() => {
                onChangeModel('custom-api');
                if (!customApi.enabled) {
                  onChangeCustomApi({ ...customApi, enabled: true });
                }
              }}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                model === 'custom-api' || customApi.enabled
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-100">
                  <span>{t.modelCustomApi}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/30 text-purple-300 font-normal">
                    {t.customApiTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {t.modelCustomApiDesc}
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

        {/* Dedicated Custom API Configuration Section */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/70 border border-purple-900/40 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                {t.customApiTitle}
              </span>
            </div>
            {/* Enable switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px] text-slate-300">
                {customApi.enabled ? (lang === 'zh' ? '已启用' : 'Enabled') : (lang === 'zh' ? '未启用' : 'Disabled')}
              </span>
              <input
                type="checkbox"
                id="toggle-custom-api"
                checked={customApi.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  onChangeCustomApi({ ...customApi, enabled });
                  if (enabled && model !== 'custom-api') {
                    onChangeModel('custom-api');
                  } else if (!enabled && model === 'custom-api') {
                    onChangeModel('flux-dev-free');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 relative"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.customApiSubtitle}
          </p>

          {/* Preset Providers Grid */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>{t.apiProvider}</span>
              <span className="text-[10px] text-slate-500">{t.presetEndpointNotice}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROVIDER_PRESETS.map((preset) => {
                const isSelected = customApi.provider === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleProviderSelect(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/80 text-white ring-1 ring-purple-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-slate-100">{preset.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        {preset.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-1">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick link to acquire API key from selected platform */}
          {currentPreset.portalUrl && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
              <span className="text-slate-400">{lang === 'zh' ? '还未获取 API 密钥？' : 'Need an API key?'}</span>
              <a
                href={currentPreset.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                <span>{currentPreset.portalName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* API Key Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.apiKeyLabel}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {lang === 'zh' ? '支持各平台官方 Token' : 'Saved locally only'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                id="custom-api-key-input"
                value={customApi.apiKey || ''}
                onChange={(e) => {
                  onChangeCustomApi({ ...customApi, apiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Endpoint URL Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.endpointUrl}</span>
              </label>
              <button
                type="button"
                onClick={() => onChangeCustomApi({ ...customApi, endpoint: currentPreset.endpoint })}
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{lang === 'zh' ? '重置为默认' : 'Reset'}</span>
              </button>
            </div>
            <input
              type="text"
              id="custom-api-endpoint-input"
              value={customApi.endpoint || ''}
              onChange={(e) => onChangeCustomApi({ ...customApi, endpoint: e.target.value })}
              placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
            />
          </div>

          {/* Model Name Input and Quick Suggestions */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-300">
                {t.modelNameLabel}
              </label>
              <div className="flex items-center gap-1.5">
                {currentPreset.suggestedModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChangeCustomApi({ ...customApi, model: m })}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                      customApi.model === m
                        ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {m.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              id="custom-api-model-input"
              value={customApi.model || ''}
              onChange={(e) => onChangeCustomApi({ ...customApi, model: e.target.value })}
              placeholder={t.modelNamePlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
            />
          </div>

          {/* DeepSeek Prompt Enhancer Toggle */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="deepseek-prompt-enhance-checkbox"
              checked={customApi.enablePromptEnhance ?? true}
              onChange={(e) => onChangeCustomApi({ ...customApi, enablePromptEnhance: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
            />
            <div className="flex-1">
              <label htmlFor="deepseek-prompt-enhance-checkbox" className="text-xs font-semibold text-slate-200 cursor-pointer">
                {t.enableDeepSeekPromptEnhance}
              </label>
              <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                {t.deepSeekEnhanceDesc}
              </p>
            </div>
          </div>

          {/* Test Connection Button & Result Banner */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              id="test-custom-api-btn"
              disabled={isTesting || !customApi.apiKey?.trim()}
              onClick={handleTestConnection}
              className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 disabled:opacity-50 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.testingConnection}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.testApiConnection}</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug break-all">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Security Guarantee Note */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t.apiKeySecurityNote}</span>
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
