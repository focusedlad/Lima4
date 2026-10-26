import React from 'react';
import { Timer, Users, Target, Trophy, BarChart3, Settings, Plus } from 'lucide-react';

export type MainNavTab = 'focus' | 'friends' | 'feed' | 'challenges' | 'leaderboard' | 'analytics' | 'settings';

interface NavbarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenQuickAction: () => void;
}

const items: { id: MainNavTab; label: string; Icon: React.ElementType }[] = [
  { id: 'focus', label: 'Focus', Icon: Timer },
  { id: 'friends', label: 'Friends', Icon: Users },
  { id: 'feed', label: 'Community', Icon: Compass },
  { id: 'challenges', label: 'Challenges', Icon: Target },
  { id: 'leaderboard', label: 'Rankings', Icon: Trophy },
  { id: 'analytics', label: 'Progress', Icon: BarChart3 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenQuickAction }) => (
  <footer className="lima-navigation fixed bottom-0 left-0 right-0 z-50 max-h-36 overflow-y-auto border-t border-slate-200 bg-white pb-safe md:bottom-0 md:left-0 md:right-auto md:top-0 md:max-h-none md:w-[84px] md:border-r md:border-t-0 md:pb-0">
    <nav aria-label="Primary navigation" className="mx-auto grid w-full max-w-xl grid-cols-4 items-center gap-1 px-2 py-2 md:flex md:h-full md:max-w-none md:flex-col md:justify-center md:gap-2 md:px-2 md:py-5">
      {items.map(({ id, label, Icon }) => {
        const active = currentTab === id;
        return (
          <button key={id} type="button" onClick={() => onSelectTab(id)}
            aria-current={active ? 'page' : undefined} title={label}
            className={`group flex min-h-[42px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 md:w-full md:flex-none md:py-3 md:text-[10px] ${active ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-slate-900' : 'text-slate-500'}`} strokeWidth={active ? 2.3 : 1.8} />
            <span className="max-w-full truncate">{label}</span>
          </button>
        );
      })}
      <button type="button" onClick={onOpenQuickAction} aria-label="Open quick actions" title="Create"
        className="flex min-h-[42px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-slate-900 px-2 py-2 text-[10px] font-semibold text-white hover:bg-slate-700 active:scale-[.98] md:mt-2 md:w-full md:flex-none">
        <Plus className="h-5 w-5" strokeWidth={2} />
        <span>Create</span>
      </button>
      <div className="hidden pt-3 text-[10px] font-bold tracking-[.18em] text-slate-400 md:block">LIMA</div>
    </nav>
  </footer>
);
