import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Clock,
  Users,
  Plus,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  X,
  Award,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SupabaseService, StudyChallengeItem } from '../../services/supabase';

interface StudyChallengesViewProps {
  currentUser: UserProfile;
  onSelectChallengeLeaderboard?: (challenge: StudyChallengeItem) => void;
}

export const StudyChallengesView: React.FC<StudyChallengesViewProps> = ({
  currentUser,
  onSelectChallengeLeaderboard,
}) => {
  const [challenges, setChallenges] = useState<StudyChallengeItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'joined' | 'weekend' | '7_days'>('all');

  // Form states for creating challenge
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTargetHours, setNewTargetHours] = useState<number>(30);
  const [newPeriod, setNewPeriod] = useState<'today' | 'weekend' | '7_days' | '14_days' | '30_days'>('7_days');
  const [newCategory, setNewCategory] = useState<string>('Deep Work');
  const [newVisibility, setNewVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [newRequiresApproval, setNewRequiresApproval] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const list = await SupabaseService.fetchChallenges();
      setChallenges(list);
      setActionError(null);
    } catch (error: any) {
      setActionError(error?.message || 'Could not load saved challenges. Please try again.');
    }
  };

  const handleJoin = async (challenge: StudyChallengeItem) => {
    setActionError(null);
    try {
      await SupabaseService.joinChallenge(challenge.id, currentUser);
      await loadChallenges();
    } catch (error: any) {
      setActionError(error?.message || 'Could not join this challenge. Please try again.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setActionError(null);
    setIsSaving(true);
    try {
      const created = await SupabaseService.createChallenge({
        title: newTitle.trim(), description: newDescription.trim(), targetHours: Number(newTargetHours),
        period: newPeriod, category: newCategory, visibility: newVisibility, requiresApproval: newRequiresApproval, creator: currentUser,
      });
      setChallenges((previous) => [created, ...previous]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewRequiresApproval(false);
    } catch (error: any) {
      setActionError(error?.message || 'The challenge could not be created. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    if (activeFilter === 'joined') return c.isJoined;
    if (activeFilter === 'weekend') return c.period === 'weekend';
    if (activeFilter === '7_days') return c.period === '7_days';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="clay-card-yellow p-6 border border-indigo-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
                Study Challenges & Competitions
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Create or join focus challenges, push your limits with fellow students, and track who studies the most.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-950 font-bold text-xs shadow-xs transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Challenge</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-indigo-200/60 dark:border-stone-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950'
                : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:bg-white'
            }`}
          >
            All Challenges ({challenges.length})
          </button>
          <button
            onClick={() => setActiveFilter('joined')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'joined'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950'
                : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:bg-white'
            }`}
          >
            My Joined Challenges
          </button>
          <button
            onClick={() => setActiveFilter('weekend')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'weekend'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950'
                : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:bg-white'
            }`}
          >
            Weekend Lock-ins
          </button>
          <button
            onClick={() => setActiveFilter('7_days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === '7_days'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950'
                : 'bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:bg-white'
            }`}
          >
            7-Day Sprints
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-950/40 dark:text-rose-200">{actionError}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChallenges.map((challenge) => {
          const progressPercent = Math.min(
            100,
            Math.round(((challenge.myProgressHours || 0) / Math.max(1, challenge.targetHours)) * 100)
          );

          return (
            <div
              key={challenge.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between transition-all hover:border-indigo-400 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5"><span className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-bold text-[10px] uppercase tracking-wider">{challenge.category}</span><span className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-[9px] uppercase tracking-wide">{challenge.visibility || 'public'}</span></div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{challenge.participantsCount} participants</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-stone-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
                  {challenge.description || 'Join this study sprint and track your hours with competitors.'}
                </p>

                <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className={`rounded-lg px-2 py-1 ${challenge.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{challenge.status === 'active' ? 'LIVE' : challenge.status === 'completed' ? 'COMPLETED' : challenge.status === 'cancelled' ? 'CANCELLED' : 'WAITING FOR CREATOR'}</span>
                  <span className="rounded-lg bg-stone-100 px-2 py-1 text-stone-600 dark:bg-stone-800 dark:text-stone-300">{challenge.requiresApproval ? 'Creator approval required' : 'Open entry'}</span>
                </div>

                {/* Target Metric Card */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 mb-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-stone-600 dark:text-stone-300">Goal Target:</span>
                  </div>
                  <span className="font-extrabold text-stone-900 dark:text-white">
                    {challenge.targetHours} Hours ({challenge.period.replace('_', ' ')})
                  </span>
                </div>

                {/* Progress Bar (if joined) */}
                {challenge.isJoined && (
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                      <span>Your Progress</span>
                      <span className="text-stone-900 dark:text-white font-bold">
                        {challenge.myProgressHours || 0} / {challenge.targetHours} hrs ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={challenge.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={challenge.creatorName}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <span className="text-[11px] text-stone-500 truncate">
                    by {challenge.creatorName}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                  {challenge.isCreator && challenge.status === 'waiting' && (
                    <button onClick={async () => { try { setActionError(null); await SupabaseService.startChallenge(challenge.id); await loadChallenges(); } catch (error: any) { setActionError(error?.message || 'Could not start this challenge.'); } }} className="rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white">Start challenge</button>
                  )}
                  {challenge.isCreator && (challenge.pendingRequests || []).map((request) => (
                    <span key={request.userUid} className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-1 text-[10px] text-amber-900">
                      {request.userName}
                      <button aria-label={`Accept ${request.userName}`} onClick={async () => { try { await SupabaseService.decideChallengeRequest(challenge.id, request.userUid, 'accepted'); await loadChallenges(); } catch (error: any) { setActionError(error?.message || 'Could not accept request.'); } }} className="rounded bg-emerald-600 px-1.5 py-1 text-white">Accept</button>
                      <button aria-label={`Reject ${request.userName}`} onClick={async () => { try { await SupabaseService.decideChallengeRequest(challenge.id, request.userUid, 'rejected'); await loadChallenges(); } catch (error: any) { setActionError(error?.message || 'Could not reject request.'); } }} className="rounded bg-rose-600 px-1.5 py-1 text-white">Decline</button>
                    </span>
                  ))}
                  {challenge.isJoined ? (
                    <span className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-bold text-xs ${challenge.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      <Check className="h-3.5 w-3.5" />
                      <span>{challenge.status === 'active' ? 'Joined' : 'Waiting to start'}</span>
                    </span>
                  ) : challenge.membershipStatus === 'pending' ? (
                    <span className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">Request pending</span>
                  ) : challenge.membershipStatus === 'rejected' ? (
                    <span className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800">Request declined</span>
                  ) : (
                    <button
                      onClick={() => handleJoin(challenge)}
                      className="rounded-xl bg-indigo-400 px-3.5 py-1.5 text-xs font-bold text-stone-950 transition-colors hover:bg-indigo-300"
                    >
                      {challenge.requiresApproval ? 'Request to join' : 'Join challenge'}
                    </button>
                  )}

                  {onSelectChallengeLeaderboard && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoin(challenge)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-stone-950 font-bold text-xs transition-colors"
                    >
                      Join Challenge
                    </button>
                  )}

                  {onSelectChallengeLeaderboard && (
                    <button
                      onClick={() => onSelectChallengeLeaderboard(challenge)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                      title="View challenge leaderboard"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredChallenges.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/80 px-5 py-12 text-center dark:border-white/15 dark:bg-[#0B1020]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No challenges yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">Create the first study challenge or check back when other real members start one.</p>
            <button type="button" onClick={() => setIsCreateModalOpen(true)} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700">Create the first challenge</button>
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  Create Study Challenge
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4 text-xs">
              {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-950/40 dark:text-rose-200">{actionError}</p>}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7-Day 35h Midterm Sprint"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Description / Study Rules
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline the goals and daily commitment expected..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Target Study Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={newTargetHours}
                    onChange={(e) => setNewTargetHours(Number(e.target.value) || 10)}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Time Period
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
                  >
                    <option value="today">Today (24 Hours)</option>
                    <option value="weekend">Weekend Sprint</option>
                    <option value="7_days">7 Days</option>
                    <option value="14_days">14 Days</option>
                    <option value="30_days">30 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Subject Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Medicine, STEM, Deep Work, Law..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Who can see this challenge?</label>
                <select value={newVisibility} onChange={(e) => setNewVisibility(e.target.value as 'public' | 'friends' | 'private')} className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs">
                  <option value="public">Public — everyone can discover it</option>
                  <option value="friends">Friends — only you and your friends</option>
                  <option value="private">Private — only you and invited/joined participants</option>
                </select>
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <input type="checkbox" checked={newRequiresApproval} onChange={(e) => setNewRequiresApproval(e.target.checked)} className="mt-0.5" />
                <span><strong>Require creator approval</strong><span className="block mt-0.5 text-[10px] font-normal">Students request entry. You approve them before they can participate.</span></span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Creating…' : 'Launch Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
