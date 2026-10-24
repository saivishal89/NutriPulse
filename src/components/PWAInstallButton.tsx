import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running standalone, we don't need to force the install button
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setIsModalOpen(true);
          }
        }}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#ff5708] to-[#ff8c42] hover:brightness-110 text-white text-xs font-bold tracking-tight shadow-[0_0_16px_rgba(255,87,8,0.4)] transition-all cursor-pointer active:scale-95 flex-shrink-0"
        title="Download / Install Phone App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Get App</span>
        <span className="sm:hidden">App</span>
      </button>

      <InstallAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
