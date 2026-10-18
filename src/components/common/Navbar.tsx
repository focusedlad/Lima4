import React from 'react';
import { Compass, Sparkles, Plus, Timer, BarChart3, Bell } from 'lucide-react';

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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3 w-full max-w-xl">
      <nav
        aria-label="Primary Navigation"
        className="relative bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] rounded-[32px] px-2.5 py-1.5 flex items-center justify-between transition-all"
      >
        {/* Left Side: Campus & Social Feed */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('campus')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[20px] text-xs font-bold transition-all ${
              currentTab === 'campus'
                ? 'bg-amber-100 text-stone-900 shadow-xs ring-1 ring-amber-200'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Campus</span>
          </button>

          <button
            onClick={() => onSelectTab('social')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[20px] text-xs font-bold transition-all ${
              currentTab === 'social'
                ? 'bg-purple-100 text-purple-950 shadow-xs ring-1 ring-purple-200'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <span className="text-xs">🌐</span>
            <span className="hidden sm:inline">Feed</span>
          </button>

          <button
            onClick={() => onSelectTab('gizmo')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[20px] text-xs font-bold transition-all ${
              currentTab === 'gizmo'
                ? 'bg-pink-100 text-stone-900 shadow-xs ring-1 ring-pink-200'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Gizmo AI</span>
          </button>
        </div>

        {/* Center Circular Action (+) Button */}
        <div className="relative -my-4 px-0.5">
          <button
            onClick={onOpenQuickAction}
            aria-label="Create or Quick Action"
            className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-[0_8px_25px_-4px_rgba(24,24,27,0.45)] hover:scale-105 active:scale-95 transition-all hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-200"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Side: Focus Timer & Analytics */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectTab('focus')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[20px] text-xs font-bold transition-all ${
              currentTab === 'focus'
                ? 'bg-sky-100 text-stone-900 shadow-xs ring-1 ring-sky-200'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Timer className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Focus</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[20px] text-xs font-bold transition-all ${
              currentTab === 'analytics'
                ? 'bg-emerald-100 text-stone-900 shadow-xs ring-1 ring-emerald-200'
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
