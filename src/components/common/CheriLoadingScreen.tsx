import React from 'react';
import { Cherry, Sparkles } from 'lucide-react';

interface CheriLoadingScreenProps {
  message?: string;
  subMessage?: string;
  isFullPage?: boolean;
}

export const CheriLoadingScreen: React.FC<CheriLoadingScreenProps> = ({
  message = 'Preparing your study sanctuary...',
  subMessage = 'cheri • aesthetic focus & timer',
  isFullPage = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none animate-fade-in">
      <div className="relative mb-6">
        {/* Outer pulsing rings */}
        <div className="absolute -inset-4 rounded-3xl bg-pink-400/20 dark:bg-pink-500/10 blur-xl animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-3xl bg-white dark:bg-[#181619] border border-pink-200/80 dark:border-pink-900/60 shadow-xl flex items-center justify-center">
          <Cherry className="w-10 h-10 text-pink-500 fill-pink-500/20 animate-bounce duration-1000" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#141315]">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white">cheri</span>
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 max-w-xs">
        {message}
      </p>
      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
        {subMessage}
      </p>

      {/* Aesthetic loading progress bar */}
      <div className="w-44 h-1.5 rounded-full bg-pink-100 dark:bg-stone-800 mt-5 overflow-hidden">
        <div className="h-full bg-pink-500 rounded-full animate-indeterminate"></div>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7] dark:bg-[#0D0C0D] transition-colors">
        {content}
      </div>
    );
  }

  return content;
};
