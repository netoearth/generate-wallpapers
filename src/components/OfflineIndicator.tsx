import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator"
      className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-950/90 text-amber-200 border border-amber-500/40 backdrop-blur-md shadow-xl text-xs font-medium animate-pulse"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        {lang === 'zh'
          ? '离线模式 — 当前处于离线状态，已启用本地缓存'
          : 'Offline Mode — You are currently offline, using cached assets.'}
      </span>
    </div>
  );
};
