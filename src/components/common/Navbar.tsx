import React from 'react';
import { Timer, Target, Trophy, BarChart3, Plus } from 'lucide-react';

export type MainNavTab = 'focus' | 'challenges' | 'leaderboard' | 'analytics';

interface NavbarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenQuickAction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAction,
}) => {
  return (
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-3 w-[calc(100%-1rem)] max-w-md pb-safe">
      <nav
        aria-label="Primary Navigation"
        className="relative bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-[28px] px-2 py-1.5 flex items-center justify-between shadow-[0_12px_36px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] transition-all"
      >
        {/* Left Side: Focus Timer & Study Challenges */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('focus')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'focus'
                ? 'bg-amber-100 dark:bg-amber-950 text-stone-900 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          <button
            onClick={() => onSelectTab('challenges')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'challenges'
                ? 'bg-amber-100 dark:bg-amber-950 text-stone-900 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Challenges</span>
          </button>
        </div>

        {/* Center Circular Action (+) Button */}
        <div className="relative -my-3 px-1">
          <button
            onClick={onOpenQuickAction}
            aria-label="Create or Quick Action"
            className="w-11 h-11 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all focus:outline-none"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Side: Competitive Leaderboard & Insights */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'leaderboard'
                ? 'bg-amber-100 dark:bg-amber-950 text-stone-900 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Rankings</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
              currentTab === 'analytics'
                ? 'bg-amber-100 dark:bg-amber-950 text-stone-900 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Insights</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
