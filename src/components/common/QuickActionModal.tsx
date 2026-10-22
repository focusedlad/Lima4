import React from 'react';
import { X, Timer, Target, Trophy, Link2, Volume2 } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'start_focus' | 'create_challenge' | 'view_rankings' | 'paste_video' | 'sound_synth') => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-sm w-full p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <h2 className="text-base font-bold text-stone-900 dark:text-white">Quick Actions</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <button
            onClick={() => onAction('start_focus')}
            className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-semibold border border-amber-200 dark:border-amber-900 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900 text-stone-950 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Start Study Sprint</div>
              <div className="text-[11px] text-stone-500 font-normal">Choose Pomodoro, Animedoro, or Flowtime</div>
            </div>
          </button>

          <button
            onClick={() => onAction('create_challenge')}
            className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 font-semibold border border-emerald-200 dark:border-emerald-900 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-200 dark:bg-emerald-900 text-stone-950 dark:text-emerald-200 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Create Study Challenge</div>
              <div className="text-[11px] text-stone-500 font-normal">Compete with friends or community</div>
            </div>
          </button>

          <button
            onClick={() => onAction('view_rankings')}
            className="w-full p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 text-indigo-950 dark:text-indigo-200 font-semibold border border-indigo-200 dark:border-indigo-900 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-200 dark:bg-indigo-900 text-stone-950 dark:text-indigo-200 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Competitive Leaderboard</div>
              <div className="text-[11px] text-stone-500 font-normal">See who studied the most today or this week</div>
            </div>
          </button>

          <button
            onClick={() => onAction('paste_video')}
            className="w-full p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-950 dark:text-rose-200 font-semibold border border-rose-200 dark:border-rose-900 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-200 dark:bg-rose-900 text-stone-950 dark:text-rose-200 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Floating Pop-Up Video</div>
              <div className="text-[11px] text-stone-500 font-normal">Play any YouTube, Vimeo, or MP4 link</div>
            </div>
          </button>

          <button
            onClick={() => onAction('sound_synth')}
            className="w-full p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-semibold border border-stone-200 dark:border-stone-700 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Ambient Sound Synthesizer</div>
              <div className="text-[11px] text-stone-500 font-normal">Binaural beats, soft rain, brown noise</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
