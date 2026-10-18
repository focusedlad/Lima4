import React from 'react';
import { Compass, Sparkles, Plus, Timer, BarChart3, Bell } from 'lucide-react';

interface NavbarProps {
  currentTab: 'campus' | 'gizmo' | 'focus' | 'analytics';
  onSelectTab: (tab: 'campus' | 'gizmo' | 'focus' | 'analytics') => void;
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg">
      <nav
        aria-label="Primary Navigation"
        className="relative bg-white/95 backdrop-blur-xl border border-stone-200/80 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] rounded-[32px] px-3 py-2 flex items-center justify-between transition-all"
      >
        {/* Left Side: Campus & Gizmo */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('campus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[20px] text-xs font-semibold transition-all ${
              currentTab === 'campus'
                ? 'bg-amber-100 text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Campus</span>
          </button>

          <button
            onClick={() => onSelectTab('gizmo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[20px] text-xs font-semibold transition-all ${
              currentTab === 'gizmo'
                ? 'bg-pink-100 text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Gizmo AI</span>
          </button>
        </div>

        {/* Center Circular Action (+) Button */}
        <div className="relative -my-5 px-1">
          <button
            onClick={onOpenQuickAction}
            aria-label="Create or Quick Action"
            className="w-13 h-13 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-[0_8px_25px_-4px_rgba(24,24,27,0.45)] hover:scale-105 active:scale-95 transition-all hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-200"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Side: Focus Timer & Analytics */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('focus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[20px] text-xs font-semibold transition-all ${
              currentTab === 'focus'
                ? 'bg-sky-100 text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Timer className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Focus</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[20px] text-xs font-semibold transition-all ${
              currentTab === 'analytics'
                ? 'bg-emerald-100 text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Insights</span>
          </button>

          {/* Pending Knock Badge Indicator if user has requests */}
          {pendingKnocksCount > 0 && (
            <button
              onClick={onOpenAdmissions}
              title={`${pendingKnocksCount} admission knock(s) waiting`}
              className="relative p-2 text-stone-600 hover:text-stone-900 rounded-full hover:bg-amber-50 transition-colors ml-0.5"
            >
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
