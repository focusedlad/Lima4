import React from 'react';
import { X, Timer, Users, Target, Trophy, Link2, Volume2, Cherry } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'start_focus' | 'view_feed' | 'create_challenge' | 'view_rankings' | 'paste_video' | 'sound_synth') => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-sm w-full p-6 bg-[#FDFBF7] dark:bg-[#221F21] border border-pink-100 dark:border-pink-950/80 shadow-2xl relative rounded-3xl">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-pink-950/60 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center">
              <Cherry className="w-4 h-4 fill-pink-500/20" />
            </div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-white">Quick Actions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-pink-50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <button
            onClick={() => onAction('start_focus')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1A1819] hover:bg-pink-50 dark:hover:bg-pink-950/30 text-stone-900 dark:text-white font-semibold border border-pink-100 dark:border-pink-950/70 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Start Study Session</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">Choose Pomodoro or Study Time Stopwatch</div>
            </div>
          </button>

          <button
            onClick={() => onAction('view_feed')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1A1819] hover:bg-sky-50 dark:hover:bg-sky-950/30 text-stone-900 dark:text-white font-semibold border border-sky-100 dark:border-sky-950/70 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Milestones Feed</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">Friends updates & community accomplishments</div>
            </div>
          </button>

          <button
            onClick={() => onAction('create_challenge')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1A1819] hover:bg-pink-50 dark:hover:bg-pink-950/30 text-stone-900 dark:text-white font-semibold border border-pink-100 dark:border-pink-950/70 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Create Study Challenge</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">Compete with friends or campus</div>
            </div>
          </button>

          <button
            onClick={() => onAction('view_rankings')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1A1819] hover:bg-sky-50 dark:hover:bg-sky-950/30 text-stone-900 dark:text-white font-semibold border border-sky-100 dark:border-sky-950/70 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Campus Leaderboard</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">See who studied the most today or this week</div>
            </div>
          </button>

          <button
            onClick={() => onAction('paste_video')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1A1819] hover:bg-pink-50 dark:hover:bg-pink-950/30 text-stone-900 dark:text-white font-semibold border border-pink-100 dark:border-pink-950/70 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Floating Pop-Up Video</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">Play any YouTube, Vimeo, or MP4 link</div>
            </div>
          </button>

          <button
            onClick={() => onAction('sound_synth')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#1A1819] hover:bg-sky-50 dark:hover:bg-sky-950/30 text-stone-900 dark:text-white font-semibold border border-sky-100 dark:border-sky-950/70 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900 dark:text-white">Ambient Sound Synthesizer</div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">Soft rain, Tokyo cafe, library whispers</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
