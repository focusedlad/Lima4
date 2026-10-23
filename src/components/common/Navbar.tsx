import React from 'react';
import { Timer, Users, Target, Trophy, BarChart3, Settings, Plus, Cherry } from 'lucide-react';

export type MainNavTab = 'focus' | 'feed' | 'challenges' | 'leaderboard' | 'analytics' | 'settings';

interface NavbarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenQuickAction: () => void;
}

const items: { id: MainNavTab; label: string; Icon: React.ElementType }[] = [
  { id: 'focus', label: 'Focus', Icon: Timer },
  { id: 'feed', label: 'Community', Icon: Users },
  { id: 'challenges', label: 'Challenges', Icon: Target },
  { id: 'leaderboard', label: 'Rankings', Icon: Trophy },
  { id: 'analytics', label: 'Progress', Icon: BarChart3 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenQuickAction }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-100 bg-white/95 pb-safe shadow-[0_-8px_30px_rgba(39,74,99,0.08)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#111820]/95 md:bottom-0 md:left-0 md:right-auto md:top-0 md:w-[84px] md:border-r md:border-t-0 md:pb-0">
      <nav aria-label="Primary navigation" className="mx-auto flex max-w-xl items-center justify-around gap-1 px-2 py-2 md:h-full md:max-w-none md:flex-col md:justify-center md:gap-3 md:px-2 md:py-5">
        {items.map(({ id, label, Icon }) => {
          const active = currentTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={active ? 'page' : undefined}
              title={label}
              className={`group flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-1.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:w-full md:flex-none md:gap-1.5 md:py-3 md:text-[10px] ${
                active
                  ? 'bg-sky-100 text-sky-900 ring-1 ring-sky-200 dark:bg-sky-950/70 dark:text-sky-200 dark:ring-sky-900'
                  : 'text-slate-500 hover:bg-sky-50 hover:text-sky-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="max-w-full truncate">{label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenQuickAction}
          aria-label="Open quick actions"
          title="Quick actions"
          className="flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 rounded-2xl bg-[#6D2932] px-2 py-2 text-[10px] font-bold text-white shadow-md shadow-[#6D2932]/20 transition-transform hover:bg-[#572029] active:scale-95 md:mt-2 md:w-full md:flex-none"
        >
          <Plus className="h-5 w-5" />
          <span className="md:hidden">Create</span>
          <span className="hidden md:inline">Create</span>
        </button>
        <div className="hidden items-center gap-1.5 pt-2 text-[9px] font-bold tracking-wide text-slate-400 md:flex md:flex-col">
          <Cherry className="h-4 w-4 text-[#6D2932]" />
          <span>LIMA</span>
        </div>
      </nav>
    </footer>
  );
};
