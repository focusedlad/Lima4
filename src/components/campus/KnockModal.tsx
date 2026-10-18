import React, { useState } from 'react';
import { Lock, Send, X, ShieldCheck, Flame, User } from 'lucide-react';
import { StudySpace, UserProfile } from '../../types';

interface KnockModalProps {
  space: StudySpace | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitKnock: (spaceId: string, studyGoal: string) => void;
}

export const KnockModal: React.FC<KnockModalProps> = ({
  space,
  currentUser,
  isOpen,
  onClose,
  onSubmitKnock,
}) => {
  const [goal, setGoal] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  if (!isOpen || !space) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    onSubmitKnock(space.id, goal.trim());
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-md w-full p-6 bg-white border border-stone-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSent ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Knock Sent to Host</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {space.hostName} received your admission request with your study sprint goal.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block">
                  Private Knock-to-Enter Space
                </span>
                <h3 className="text-base font-bold text-stone-900 leading-snug">{space.name}</h3>
              </div>
            </div>

            <p className="text-xs text-stone-600 mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-100">
              Host <strong>{space.hostName}</strong> requires all studiers to state their specific sprint intention before entering to maintain deep accountability.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User preview */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="text-xs">
                  <div className="font-bold text-stone-900">{currentUser.name}</div>
                  <div className="text-stone-500 flex items-center gap-2">
                    <span>{currentUser.universityOrLocation}</span>
                    <span>•</span>
                    <span className="flex items-center text-amber-600 font-semibold">
                      <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                      {currentUser.currentStreak}d Streak
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Your Study Sprint Goal for this Session:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. 50m sprint reviewing USMLE cardiology murmurs and 20 practice questions..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Knock to Host
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
