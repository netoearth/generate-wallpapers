import React from 'react';
import { Download, Monitor, Smartphone, CheckCircle2, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang: Language;
  onOpenCrossPlatformModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang,
  onOpenCrossPlatformModal,
}) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();

  const handleAction = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        onOpenCrossPlatformModal();
      }
    } else {
      onOpenCrossPlatformModal();
    }
  };

  const getPlatformLabel = () => {
    if (lang === 'zh') {
      if (platform === 'android') return '安装至 Android';
      if (platform === 'windows') return '安装至 Windows';
      if (platform === 'macos') return '安装至 Mac';
      if (platform === 'linux') return '安装至 Linux';
      if (platform === 'ios') return '安装至 iPhone';
      return '跨平台客户端';
    } else {
      if (platform === 'android') return 'Install on Android';
      if (platform === 'windows') return 'Install on Windows';
      if (platform === 'macos') return 'Install on Mac';
      if (platform === 'linux') return 'Install on Linux';
      if (platform === 'ios') return 'Install on iOS';
      return 'Get Desktop / App';
    }
  };

  const getPlatformIcon = () => {
    if (platform === 'android' || platform === 'ios') {
      return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (platform === 'windows' || platform === 'linux') {
      return <Monitor className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (platform === 'macos') {
      return <Laptop className="w-3.5 h-3.5 text-violet-400" />;
    }
    return <Download className="w-3.5 h-3.5 text-indigo-400" />;
  };

  if (isInstalled) {
    return (
      <button
        id="cross-platform-installed-btn"
        type="button"
        onClick={onOpenCrossPlatformModal}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-colors shadow-sm"
        title={lang === 'zh' ? '已作为应用安装 - 查看跨平台发布' : 'Installed as App - View Cross-Platform'}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline font-mono text-[11px]">
          {lang === 'zh' ? '已安装应用' : 'App Mode'}
        </span>
      </button>
    );
  }

  return (
    <button
      id="pwa-install-header-btn"
      type="button"
      onClick={handleAction}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-100 bg-gradient-to-r from-indigo-600/90 to-violet-600/90 hover:from-indigo-500 hover:to-violet-500 border border-indigo-400/40 transition-all active:scale-[0.97] shadow-sm shadow-indigo-900/40"
      title={lang === 'zh' ? '跨平台安装与发布中心 (Android, Windows, macOS, Linux)' : 'Cross-Platform Install & Publish Hub'}
    >
      {getPlatformIcon()}
      <span className="text-[11px] whitespace-nowrap">{getPlatformLabel()}</span>
    </button>
  );
};
