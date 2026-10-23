import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check, Smartphone, Cherry, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed and launched as standalone app
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">cheri App Installed</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">Running as a standalone native-grade app</div>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300">
            Active PWA
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // In Chromium browsers when beforeinstallprompt hasn't fired yet or in unsupported desktop environments,
      // show helpful guide modal
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-bold shadow-xs transition-all min-h-[40px] shrink-0 ${className}`}
          title="Install cheri as a Progressive Web App on your device"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'badge' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 hover:bg-pink-200 text-[11px] font-bold transition-colors ${className}`}
        >
          <Download className="w-3 h-3" />
          <span>Install</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141315] border border-pink-100 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 ring-2 ring-pink-200 dark:ring-pink-900/60 shadow-xs">
              <Cherry className="w-6 h-6 fill-pink-500/20" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <span>Install cheri App</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-300 text-[10px] font-bold border border-pink-200 dark:border-pink-900">
                  PWA Ready
                </span>
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Install to your home screen or dock for instant fullscreen study sessions and offline timer support.
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isIOS ? 'Install on iPhone/iPad' : 'Install to Home Screen'}</span>
          </button>
        </div>
      )}

      {/* iOS & Browser Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#141315] border border-pink-200 dark:border-stone-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                  <Cherry className="w-4 h-4 fill-pink-500/20" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">Install cheri App</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Add to Home Screen / Desktop</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-pink-50 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-[#1A181C] border border-pink-100 dark:border-stone-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <span>In Safari or your browser toolbar</span>
                    <Share2 className="w-3.5 h-3.5 text-sky-500 inline" />
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                    Tap the <strong>Share</strong> button (on Safari iOS) or the install icon in your browser URL address bar (Chrome, Edge, Brave).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#1A181C] border border-pink-100 dark:border-stone-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <span>Select "Add to Home Screen"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-pink-500 inline" />
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">
                    Scroll down the action sheet and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong> at the top right.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-900/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-[11px] text-pink-950 dark:text-pink-200 leading-relaxed">
                  <strong>cheri</strong> will launch in pure edge-to-edge standalone mode directly from your home screen or dock without any browser address bar!
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
