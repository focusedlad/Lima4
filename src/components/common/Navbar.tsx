import React from 'react';
import { Compass, Sparkles, Plus, Timer, BarChart3, Bell, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: 'campus' | 'social' | 'gizmo' | 'focus' | 'analytics';
  onSelectTab: (tab: 'campus' | 'social' | 'gizmo' | 'focus' | 'analytics') => void;
  onOpenQuickAction: () => void;
  pendingKnocksCount: number;
  onOpenAdmissions: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAction,
  pendingKnocksCount,
  onOpenAdmissions,
}) => {
  return (
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-3 w-[calc(100%-1rem)] max-w-lg pb-safe">
      <nav
        aria-label="Primary Navigation"
        className="relative liquid-glass rounded-[32px] px-2 py-1.5 flex items-center justify-between shadow-[0_16px_40px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.7)] transition-all"
      >
        {/* Left Side: Campus & Social Feed */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => onSelectTab('campus')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[20px] text-xs font-bold liquid-spring liquid-interactive min-h-[44px] ${
              currentTab === 'campus'
                ? 'bg-amber-200/80 dark:bg-amber-950/70 text-stone-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-300 dark:ring-amber-700 scale-[1.02]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/70'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Campus</span>
          </button>

          <button
            onClick={() => onSelectTab('social')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[20px] text-xs font-bold liquid-spring liquid-interactive min-h-[44px] ${
              currentTab === 'social'
                ? 'bg-purple-200/80 dark:bg-purple-950/70 text-purple-950 dark:text-purple-200 shadow-xs ring-1 ring-purple-300 dark:ring-purple-700 scale-[1.02]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/70'
            }`}
          >
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="hidden sm:inline">Feed</span>
          </button>

          <button
            onClick={() => onSelectTab('gizmo')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[20px] text-xs font-bold liquid-spring liquid-interactive min-h-[44px] ${
              currentTab === 'gizmo'
                ? 'bg-pink-200/80 dark:bg-pink-950/70 text-stone-900 dark:text-pink-200 shadow-xs ring-1 ring-pink-300 dark:ring-pink-700 scale-[1.02]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
            <span className="hidden sm:inline">Gizmo AI</span>
          </button>
        </div>

        {/* Center Circular Action (+) Button */}
        <div className="relative -my-4 px-0.5">
          <button
            onClick={onOpenQuickAction}
            aria-label="Create or Quick Action"
            className="w-12 h-12 rounded-full bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 flex items-center justify-center shadow-[0_8px_25px_-4px_rgba(24,24,27,0.45)] hover:scale-110 active:scale-90 liquid-spring focus:outline-none focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-400/40 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-5 h-5 stroke-[2.5] relative z-10" />
          </button>
        </div>

        {/* Right Side: Focus Timer & Analytics */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => onSelectTab('focus')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[20px] text-xs font-bold liquid-spring liquid-interactive min-h-[44px] ${
              currentTab === 'focus'
                ? 'bg-sky-200/80 dark:bg-sky-950/70 text-stone-900 dark:text-sky-200 shadow-xs ring-1 ring-sky-300 dark:ring-sky-700 scale-[1.02]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/70'
            }`}
          >
            <Timer className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Focus</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[20px] text-xs font-bold liquid-spring liquid-interactive min-h-[44px] ${
              currentTab === 'analytics'
                ? 'bg-emerald-200/80 dark:bg-emerald-950/70 text-stone-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-300 dark:ring-emerald-700 scale-[1.02]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/70'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Insights</span>
          </button>

          {/* Pending Knock Badge Indicator if user has requests */}
          {pendingKnocksCount > 0 && (
            <button
              onClick={onOpenAdmissions}
              title={`${pendingKnocksCount} admission knock(s) waiting`}
              className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-full hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors ml-0.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-stone-900" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
