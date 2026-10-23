import React from 'react';
import { Timer, Users, Target, Trophy, BarChart3, Settings, Plus, Cherry } from 'lucide-react';

export type MainNavTab = 'focus' | 'feed' | 'challenges' | 'leaderboard' | 'analytics' | 'settings';

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
    <footer className="fixed bottom-0 left-0 right-0 w-full z-50 bg-[#FDFBF7]/95 dark:bg-[#1A1819]/95 backdrop-blur-md border-t border-pink-100 dark:border-pink-950/80 shadow-[0_-4px_24px_rgba(244,114,182,0.06)] pb-safe transition-colors">
      <nav
        aria-label="cheri Primary Navigation"
        className="max-w-4xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-1 sm:gap-2"
      >
        {/* Tab 1: Focus Mode (Pomodoro & Study Time) */}
        <button
          onClick={() => onSelectTab('focus')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-2xl text-xs font-bold transition-all min-h-[48px] ${
            currentTab === 'focus'
              ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 ring-1 ring-pink-300 dark:ring-pink-800 shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-pink-50/50 dark:hover:bg-stone-800/50'
          }`}
          title="Focus Mode (Pomodoro & Study Time)"
        >
          <Timer className="w-4 h-4 text-pink-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">Focus</span>
        </button>

        {/* Tab 2: Friends & Global Milestones Feed */}
        <button
          onClick={() => onSelectTab('feed')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-2xl text-xs font-bold transition-all min-h-[48px] ${
            currentTab === 'feed'
              ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 ring-1 ring-pink-300 dark:ring-pink-800 shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-pink-50/50 dark:hover:bg-stone-800/50'
          }`}
          title="Friends & Global Feed"
        >
          <Users className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">Feed</span>
        </button>

        {/* Center Quick Action (+) Button */}
        <div className="px-1 shrink-0">
          <button
            onClick={onOpenQuickAction}
            aria-label="Create or Quick Action"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-pink-500/25 transition-all focus:outline-none"
            title="Quick Action Hub"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Challenges */}
        <button
          onClick={() => onSelectTab('challenges')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-2xl text-xs font-bold transition-all min-h-[48px] ${
            currentTab === 'challenges'
              ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 ring-1 ring-pink-300 dark:ring-pink-800 shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-pink-50/50 dark:hover:bg-stone-800/50'
          }`}
          title="Study Challenges"
        >
          <Target className="w-4 h-4 text-pink-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">Challenges</span>
        </button>

        {/* Tab 4: Leaderboard */}
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-2xl text-xs font-bold transition-all min-h-[48px] ${
            currentTab === 'leaderboard'
              ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 ring-1 ring-pink-300 dark:ring-pink-800 shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-pink-50/50 dark:hover:bg-stone-800/50'
          }`}
          title="Campus Rankings"
        >
          <Trophy className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">Rankings</span>
        </button>

        {/* Tab 5: Settings (Dark/Light mode, Account details, Sound) */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-2xl text-xs font-bold transition-all min-h-[48px] ${
            currentTab === 'settings'
              ? 'bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 ring-1 ring-pink-300 dark:ring-pink-800 shadow-xs'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-pink-50/50 dark:hover:bg-stone-800/50'
          }`}
          title="App Settings & Account Profile"
        >
          <Settings className="w-4 h-4 text-pink-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">Settings</span>
        </button>
      </nav>
    </footer>
  );
};
