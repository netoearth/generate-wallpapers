import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Smartphone,
  Monitor,
  Laptop,
  Terminal,
  Copy,
  Check,
  Download,
  Share2,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';
import { usePWAInstall, OperatingSystem } from '../hooks/usePWAInstall';

interface CrossPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CrossPlatformModal: React.FC<CrossPlatformModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'overview' | 'android' | 'windows' | 'macos' | 'linux' | 'build'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getOSBadge = (os: OperatingSystem) => {
    switch (os) {
      case 'android':
        return { name: 'Android', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' };
      case 'windows':
        return { name: 'Windows 10/11', color: 'text-sky-400 bg-sky-950/60 border-sky-500/30' };
      case 'macos':
        return { name: 'macOS', color: 'text-violet-400 bg-violet-950/60 border-violet-500/30' };
      case 'linux':
        return { name: 'Linux', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' };
      case 'ios':
        return { name: 'iOS (iPhone)', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' };
      default:
        return { name: 'Desktop / Web', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
    }
  };

  const currentOSInfo = getOSBadge(platform);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#11141c] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{t.crossPlatformHub}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-mono">
                      Multi-OS
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">{t.crossPlatformSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Device Highlight Banner */}
            <div className="px-5 py-3 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">{t.currentSystem}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${currentOSInfo.color}`}>
                  {currentOSInfo.name}
                </span>
                {isInstalled && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium ml-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.installedAppNotice}</span>
                  </span>
                )}
              </div>

              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.oneClickInstall}</span>
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 pb-2 border-b border-slate-800/60 overflow-x-auto text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {lang === 'zh' ? '全平台概览' : 'All Platforms'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('windows')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'windows'
                    ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span>Windows</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('macos')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'macos'
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-violet-400" />
                <span>macOS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('linux')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'linux'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Linux</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('build')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'build'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'zh' ? '构建发布' : 'Build & Dist'}</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-300 text-xs leading-relaxed">
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Android Card */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
                        <Smartphone className="w-4 h-4" />
                        <span>{t.androidCardTitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono">
                        APK / PWA / Google Play
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{t.androidCardDesc}</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('android')}
                        className="px-3 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                      >
                        {lang === 'zh' ? '查看 Android 安装与 APK 指南 →' : 'View Android & APK Guide →'}
                      </button>
                    </div>
                  </div>

                  {/* Windows Card */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-sky-400 text-sm">
                        <Monitor className="w-4 h-4" />
                        <span>{t.windowsCardTitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950/80 text-sky-300 border border-sky-500/30 font-mono">
                        .EXE / MSIX / MS Store
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{t.windowsCardDesc}</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('windows')}
                        className="px-3 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 text-xs font-medium"
                      >
                        {lang === 'zh' ? '查看 Windows 客户端指南 →' : 'View Windows Guide →'}
                      </button>
                    </div>
                  </div>

                  {/* macOS Card */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-violet-400 text-sm">
                        <Laptop className="w-4 h-4" />
                        <span>{t.macosCardTitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-violet-950/80 text-violet-300 border border-violet-500/30 font-mono">
                        .DMG / Safari App / Dock
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{t.macosCardDesc}</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('macos')}
                        className="px-3 py-1 rounded-lg bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-500/30 text-xs font-medium"
                      >
                        {lang === 'zh' ? '查看 macOS 程序坞与 DMG 指南 →' : 'View macOS Guide →'}
                      </button>
                    </div>
                  </div>

                  {/* Linux Card */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-amber-400 text-sm">
                        <Terminal className="w-4 h-4" />
                        <span>{t.linuxCardTitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/30 font-mono">
                        AppImage / .DEB / Desktop
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{t.linuxCardDesc}</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('linux')}
                        className="px-3 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs font-medium"
                      >
                        {lang === 'zh' ? '查看 Linux 安装与 AppImage 指南 →' : 'View Linux Guide →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Android */}
              {activeTab === 'android' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                      <Smartphone className="w-4 h-4" />
                      <span>{lang === 'zh' ? '方案 1：Android Chrome 浏览器一键安装 (推荐)' : 'Method 1: 1-Click Browser Install (Recommended)'}</span>
                    </div>
                    <p className="text-slate-300">
                      {lang === 'zh'
                        ? '在安卓手机（如小米、华为、三星、OPPO、vivo等）自带的 Chrome 或 Edge 浏览器中打开本站，点击下方安装按钮即可自动生成原生 WebAPK，无需经过应用商店即可添加到桌面，拥有完全原生的全屏沉浸体验。'
                        : 'Open in Android Chrome or Edge browser. Tap the Install button below to instantly install as a standalone WebAPK on your home screen with native app full-screen experience.'}
                    </p>
                    {isInstallable ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await install();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>{lang === 'zh' ? '立即在当前安卓设备上安装' : 'Install on Android Now'}</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                        {lang === 'zh'
                          ? '提示：请在安卓 Chrome 浏览器菜单中点击「安装应用」或「添加到主屏幕」即可完成安装。'
                          : 'Tip: Tap Chrome menu (⋮) > "Install App" or "Add to Home screen".'}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'zh' ? '方案 2：编译为原生 APK / AAB (Google Play / 应用商店)' : 'Method 2: Native APK / AAB Build (Capacitor)'}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs">
                      {lang === 'zh'
                        ? '项目根目录已预配置 Capacitor (`capacitor.config.json`)。在本地终端运行以下命令即可生成原生 Android Studio 工程并构建发布版 APK：'
                        : 'Pre-configured with Capacitor (`capacitor.config.json`). Run the commands below in your terminal to generate an Android Studio project and compile APKs:'}
                    </p>
                    <div className="relative p-3 rounded-lg bg-black/70 border border-slate-800 font-mono text-[11px] text-emerald-300">
                      <code>
                        npm install @capacitor/core @capacitor/cli @capacitor/android<br />
                        npx cap add android<br />
                        npx cap sync<br />
                        npx cap open android
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/android && npx cap add android && npx cap sync && npx cap open android', 'cap-android')}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={t.copyCommand}
                      >
                        {copiedKey === 'cap-android' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Windows */}
              {activeTab === 'windows' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm">
                      <Monitor className="w-4 h-4" />
                      <span>{lang === 'zh' ? '方案 1：Windows 桌面一键安装 (Microsoft Edge / Chrome)' : 'Method 1: Windows Desktop App via Edge/Chrome'}</span>
                    </div>
                    <p className="text-slate-300">
                      {lang === 'zh'
                        ? '在 Windows 10/11 的 Edge 或 Chrome 浏览器地址栏右侧点击“安装应用”图标，或点击下方按钮，即可将应用独立窗口运行，固定在任务栏或开始菜单，享受秒开的桌面体验。'
                        : 'In Windows 10/11, click the Install icon on the right side of the Edge or Chrome address bar to install as a standalone desktop window, pinned to your taskbar and Start Menu.'}
                    </p>
                    {isInstallable && (
                      <button
                        type="button"
                        onClick={async () => {
                          await install();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>{lang === 'zh' ? '安装为 Windows 桌面程序' : 'Install on Windows Desktop'}</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                      <Terminal className="w-4 h-4 text-sky-400" />
                      <span>{lang === 'zh' ? '方案 2：打包为 .EXE 安装包与发布到微软商店' : 'Method 2: Package .EXE & Microsoft Store'}</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      {lang === 'zh'
                        ? '已内置 Electron 配置文件 (`electron/main.cjs` 与 `electron-builder.json`)。通过 electron-builder 可直接生成带有 NSIS 安装向导的 Windows 可执行文件：'
                        : 'Equipped with Electron configurations (`electron/main.cjs` & `electron-builder.json`) to generate Windows installer executables:'}
                    </p>
                    <div className="relative p-3 rounded-lg bg-black/70 border border-slate-800 font-mono text-[11px] text-sky-300">
                      <code>
                        npm install -D electron electron-builder<br />
                        npm run build<br />
                        npx electron-builder --win nsis
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('npm install -D electron electron-builder && npm run build && npx electron-builder --win nsis', 'win-exe')}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={t.copyCommand}
                      >
                        {copiedKey === 'win-exe' ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: macOS */}
              {activeTab === 'macos' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm">
                      <Laptop className="w-4 h-4" />
                      <span>{lang === 'zh' ? '方案 1：macOS Safari 17+ 添加到程序坞 (Dock)' : 'Method 1: Safari 17+ Add to Dock'}</span>
                    </div>
                    <p className="text-slate-300">
                      {lang === 'zh'
                        ? '在 Mac 电脑上的 Safari 浏览器中，点击菜单栏「文件」>「添加到程序坞 (Add to Dock)」，应用就会像原生 Mac 软件一样常驻在您的程序坞 (Dock) 和 Launchpad 启动台，支持 Command+Tab 独立切换！'
                        : 'In Safari on macOS Sonoma or newer, click "File" in top menu > "Add to Dock". The app becomes a native macOS app in your Dock and Launchpad, with full Command+Tab support.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                      <Terminal className="w-4 h-4 text-violet-400" />
                      <span>{lang === 'zh' ? '方案 2：打包为原生 .DMG 镜像与 .APP' : 'Method 2: Package .DMG Installer & .APP'}</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      {lang === 'zh'
                        ? '使用内置的 Electron 配置，在 Mac 终端中运行以下命令即可生成可在所有 Apple Silicon (M1/M2/M3/M4) 与 Intel Mac 上运行的 .dmg 安装包：'
                        : 'Using the included Electron configuration, run the following to build native .dmg installers for Apple Silicon & Intel Macs:'}
                    </p>
                    <div className="relative p-3 rounded-lg bg-black/70 border border-slate-800 font-mono text-[11px] text-violet-300">
                      <code>
                        npm install -D electron electron-builder<br />
                        npm run build<br />
                        npx electron-builder --mac dmg
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('npm install -D electron electron-builder && npm run build && npx electron-builder --mac dmg', 'mac-dmg')}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={t.copyCommand}
                      >
                        {copiedKey === 'mac-dmg' ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Linux */}
              {activeTab === 'linux' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                      <Terminal className="w-4 h-4" />
                      <span>{lang === 'zh' ? '方案 1：Linux 桌面快捷方式 (Chrome / Chromium)' : 'Method 1: Linux Chromium / Desktop Integration'}</span>
                    </div>
                    <p className="text-slate-300">
                      {lang === 'zh'
                        ? '在 Ubuntu、Debian、Fedora、Arch 等 Linux 桌面系统中的 Chrome/Chromium 浏览器，点击「菜单」>「保存并分享」>「安装应用」，将自动在系统中创建带有图标的 .desktop 快捷启动项。'
                        : 'On Ubuntu, Debian, Fedora, or Arch Linux, click Chrome menu > "Save and share" > "Install page as app" to create a system .desktop launcher.'}
                    </p>
                    {isInstallable && (
                      <button
                        type="button"
                        onClick={async () => {
                          await install();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>{lang === 'zh' ? '安装到 Linux 桌面' : 'Install on Linux Desktop'}</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'zh' ? '方案 2：构建通用 AppImage 与 .deb 软件包' : 'Method 2: Universal AppImage & .deb'}</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      {lang === 'zh'
                        ? '通过 Electron Builder 打包出免安装直接运行的 Linux AppImage 或针对 Debian/Ubuntu 的 .deb 安装包：'
                        : 'Build universal AppImage and Debian/Ubuntu .deb binaries using Electron Builder:'}
                    </p>
                    <div className="relative p-3 rounded-lg bg-black/70 border border-slate-800 font-mono text-[11px] text-amber-300">
                      <code>
                        npm install -D electron electron-builder<br />
                        npm run build<br />
                        npx electron-builder --linux AppImage deb
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('npm install -D electron electron-builder && npm run build && npx electron-builder --linux AppImage deb', 'linux-dist')}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={t.copyCommand}
                      >
                        {copiedKey === 'linux-dist' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Build & Dist Guide */}
              {activeTab === 'build' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                    <h3 className="text-indigo-300 font-semibold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{t.packageCommandGuide}</span>
                    </h3>
                    <p className="text-slate-400 text-xs">
                      {lang === 'zh'
                        ? '本工程已包含完整的跨平台发布配置，支持以下编译命令直接生成各个系统的安装程序：'
                        : 'All cross-platform publishing configurations have been integrated into this project. Use the following build commands:'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Command 1: Android */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Android (APK / AAB)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('npx cap sync && npx cap open android', 'cmd-android')}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                        >
                          {copiedKey === 'cmd-android' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'cmd-android' ? t.copiedCommand : t.copyCommand}</span>
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <code>npx cap sync && npx cap open android</code>
                      </p>
                    </div>

                    {/* Command 2: Windows */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sky-400 text-xs flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5" />
                          <span>Windows (.EXE / NSIS)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('npm run build && npx electron-builder --win', 'cmd-win')}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                        >
                          {copiedKey === 'cmd-win' ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'cmd-win' ? t.copiedCommand : t.copyCommand}</span>
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <code>npm run build && npx electron-builder --win</code>
                      </p>
                    </div>

                    {/* Command 3: macOS */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-violet-400 text-xs flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5" />
                          <span>macOS (.DMG / .APP)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('npm run build && npx electron-builder --mac', 'cmd-mac')}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                        >
                          {copiedKey === 'cmd-mac' ? <Check className="w-3 h-3 text-violet-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'cmd-mac' ? t.copiedCommand : t.copyCommand}</span>
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <code>npm run build && npx electron-builder --mac</code>
                      </p>
                    </div>

                    {/* Command 4: Linux */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-400 text-xs flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Linux (.AppImage / .deb)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('npm run build && npx electron-builder --linux', 'cmd-linux')}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                        >
                          {copiedKey === 'cmd-linux' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'cmd-linux' ? t.copiedCommand : t.copyCommand}</span>
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <code>npm run build && npx electron-builder --linux</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-500">
                PWA / Capacitor / Electron Ready
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
