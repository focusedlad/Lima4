import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Clock,
  Sparkles,
  Heart,
  TrendingUp,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SupabaseService, LeaderboardEntry } from '../../services/supabase';

interface LeaderboardViewProps {
  currentUser: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cheeredIds, setCheeredIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLeaderboard(timeframe);
  }, [timeframe]);

  const loadLeaderboard = async (tf: 'today' | 'week' | 'month' | 'all') => {
    setIsLoading(true);
    const data = await SupabaseService.fetchLeaderboard(tf);
    setLeaderboard(data);
    setIsLoading(false);
  };

  const handleCheer = (entry: LeaderboardEntry) => {
    setCheeredIds((prev) => ({ ...prev, [entry.id]: true }));
  };

  const filteredEntries = leaderboard.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.university && item.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.studyField && item.studyField.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const topThree = leaderboard.slice(0, 3);
  const remaining = filteredEntries.slice(3);

  // Compute current user's relative standing
  const userRank = leaderboard.findIndex((item) => item.uid === currentUser.id) + 1;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="clay-card-purple p-6 border border-indigo-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <span>Competitive Study Leaderboard</span>
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Live rankings of students who have studied the most. Filter by day, week, month, or all-time.
              </p>
            </div>
          </div>

          <button
            onClick={() => loadLeaderboard(timeframe)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-stone-900/80 hover:bg-white text-stone-700 dark:text-stone-200 border border-indigo-200/60 dark:border-stone-800 text-xs font-bold transition-colors shrink-0"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-indigo-200/60 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/70 dark:bg-stone-900/70 rounded-2xl border border-indigo-100 dark:border-stone-800 text-xs">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === 'today'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === 'week'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === 'month'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === 'all'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search studiers or school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/90 border border-indigo-200/80 dark:border-stone-800 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Podium for Top 3 Champions */}
      {!searchQuery && topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-6 pb-2">
          {/* #2 Rank (Silver) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-center shadow-sm flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-extrabold text-xs mb-2">
              #2
            </div>
            <div className="relative mb-2">
              <img
                src={topThree[1].avatar}
                alt={topThree[1].name}
                className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-700"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center">
                <Award className="w-3 h-3" />
              </span>
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white truncate max-w-full">
              {topThree[1].name}
            </h3>
            <p className="text-[10px] text-stone-500 truncate max-w-full mb-2">
              {topThree[1].university}
            </p>
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-stone-900 dark:text-white font-extrabold text-xs">
              {topThree[1].hoursStudied} hrs
            </div>
          </div>

          {/* #1 Rank (Gold Champion - Tallest) */}
          <div className="p-5 sm:p-6 rounded-3xl clay-card-yellow border-2 border-amber-400 text-center shadow-md flex flex-col items-center -translate-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold text-sm mb-2 shadow-xs">
              #1
            </div>
            <div className="relative mb-2">
              <img
                src={topThree[0].avatar}
                alt={topThree[0].name}
                className="w-18 h-18 rounded-full object-cover ring-4 ring-amber-300 dark:ring-amber-500"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                <Trophy className="w-3.5 h-3.5 fill-stone-950" />
              </span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white truncate max-w-full">
              {topThree[0].name}
            </h3>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate max-w-full mb-2 font-medium">
              {topThree[0].university}
            </p>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-extrabold text-sm shadow-xs">
              {topThree[0].hoursStudied} hrs
            </div>
          </div>

          {/* #3 Rank (Bronze) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 text-center shadow-sm flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center font-extrabold text-xs mb-2">
              #3
            </div>
            <div className="relative mb-2">
              <img
                src={topThree[2].avatar}
                alt={topThree[2].name}
                className="w-14 h-14 rounded-full object-cover ring-4 ring-amber-200 dark:ring-amber-900"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center">
                <Award className="w-3 h-3" />
              </span>
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white truncate max-w-full">
              {topThree[2].name}
            </h3>
            <p className="text-[10px] text-stone-500 truncate max-w-full mb-2">
              {topThree[2].university}
            </p>
            <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-stone-800 text-stone-900 dark:text-white font-extrabold text-xs">
              {topThree[2].hoursStudied} hrs
            </div>
          </div>
        </div>
      )}

      {/* Your Current Rank Card */}
      <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold text-xs shrink-0">
            {userRank ? `#${userRank}` : '—'}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-stone-400 font-semibold block uppercase tracking-wider">
              Your Standing
            </span>
            <span className="text-sm font-bold text-white truncate block">
              {currentUser.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0 font-bold">
          <div className="text-right">
            <span className="text-stone-400 text-[10px] block font-medium">Logged Focus</span>
            <span className="text-emerald-400">{currentUser.totalHoursStudied} hrs</span>
          </div>
          <div className="text-right">
            <span className="text-stone-400 text-[10px] block font-medium">Daily Streak</span>
            <span className="text-amber-400 flex items-center gap-1 justify-end">
              <Flame className="w-3 h-3" />
              {currentUser.currentStreak}d
            </span>
          </div>
        </div>
      </div>

      {/* Full Rankings List */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-stone-500">
          <span>Rank & Studier</span>
          <span>Time Studied & Recognition</span>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {filteredEntries.map((entry, index) => {
            const hasCheered = Boolean(cheeredIds[entry.id]);

            return (
              <div
                key={entry.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
              >
                {/* Left: Rank & Profile */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 text-center font-mono font-extrabold text-xs text-stone-400 shrink-0">
                    #{entry.rank || index + 1}
                  </span>
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-stone-200 dark:ring-stone-700"
                  />
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white truncate block">
                      {entry.name}
                    </span>
                    <span className="text-[11px] text-stone-500 truncate block">
                      {entry.university} • {entry.studyField}
                    </span>
                  </div>
                </div>

                {/* Right: Hours, Streak, Cheer */}
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <div className="text-right">
                    <span className="font-extrabold text-stone-900 dark:text-white block">
                      {entry.hoursStudied} hrs
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 justify-end">
                      <Flame className="w-3 h-3" />
                      {entry.streakDays}d streak
                    </span>
                  </div>

                  <button
                    onClick={() => handleCheer(entry)}
                    className={`p-2 rounded-xl transition-all ${
                      hasCheered
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                        : 'bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 text-stone-500 hover:text-rose-500'
                    }`}
                    title="Send a cheer"
                  >
                    <Heart className={`w-4 h-4 ${hasCheered ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredEntries.length === 0 && (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {searchQuery ? 'No members match that search' : 'Your community starts here'}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try another name, university, or field of study.' : 'There are no other registered members on the leaderboard yet. As real students join and complete focus sessions, their rankings will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
