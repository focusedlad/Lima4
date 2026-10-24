import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  Heart,
  Award,
  ChevronRight,
  TrendingUp,
  Dog,
  Smile,
  Bird,
} from 'lucide-react';
import { UserProfile, DayActivity, FocusSessionLog } from '../../types';

interface AnalyticsViewProps {
  currentUser: UserProfile;
  heatmapDays: DayActivity[];
  logs: FocusSessionLog[];
  onUpdateDeskPet: (updated: UserProfile['deskPet']) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentUser,
  heatmapDays,
  logs,
  onUpdateDeskPet,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(heatmapDays[heatmapDays.length - 1] || null);
  useEffect(() => {
    setSelectedDay((previous) => previous ? (heatmapDays.find((day) => day.date === previous.date) || heatmapDays[heatmapDays.length - 1] || null) : (heatmapDays[heatmapDays.length - 1] || null));
  }, [heatmapDays]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recentLogs = logs.filter((log) => new Date(log.date + 'T00:00:00').getTime() >= cutoff.getTime());

  // Compute Focus Macronutrients Split
  const totalDeepWorkHours = Math.round(
    recentLogs.filter((l) => l.category === 'deep_work').reduce((acc, l) => acc + l.durationMinutes, 0) /
      60 *
      10
  ) / 10;

  const totalRecallHours = Math.round(
    recentLogs.filter((l) => l.category === 'recall').reduce((acc, l) => acc + l.durationMinutes, 0) /
      60 *
      10
  ) / 10;

  const totalReviewHours = Math.round(
    recentLogs.filter((l) => l.category === 'review').reduce((acc, l) => acc + l.durationMinutes, 0) /
      60 *
      10
  ) / 10;

  const totalMonthHours = Math.round((totalDeepWorkHours + totalRecallHours + totalReviewHours) * 10) / 10;
  const deepPct = totalMonthHours ? Math.round((totalDeepWorkHours / totalMonthHours) * 100) : 0;
  const recallPct = totalMonthHours ? Math.round((totalRecallHours / totalMonthHours) * 100) : 0;
  const reviewPct = totalMonthHours ? 100 - deepPct - recallPct : 0;

  // Pet Switcher handler
  const handleSwitchPetSpecies = (species: 'shiba' | 'capybara' | 'owl') => {
    const names = {
      shiba: 'Mochi',
      capybara: 'Boba',
      owl: 'Matcha',
    };
    onUpdateDeskPet({
      ...currentUser.deskPet,
      species,
      name: names[species],
    });
  };

  const pet = currentUser.deskPet;
  const xpPercent = Math.min(100, Math.round((pet.currentXp / pet.nextLevelXp) * 100));

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Productivity Biology & Habit Architecture</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Study Analytics</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Focus macronutrients, monthly 31-day activity heatmap, and your desk pet companion.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-stone-400 block">Total Focus</span>
            <span className="text-sm font-bold text-stone-900 font-mono">{currentUser.totalHoursStudied}h</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div className="text-left border-l border-stone-100 pl-3">
            <span className="text-[10px] font-bold uppercase text-stone-400 block">Active Streak</span>
            <span className="text-sm font-bold text-amber-700 font-mono">{currentUser.currentStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Grid: Macronutrients Split & Desk Pet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Focus Macronutrients Split (2 Cols) */}
        <div className="lg:col-span-2 squircle-card p-6 bg-white border border-stone-200 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Focus "Macronutrients" Split</h2>
              <p className="text-xs text-stone-500">Three-tier balance of deep work vs active recall vs reading</p>
            </div>
            <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 px-3 py-1 rounded-xl">
              {totalMonthHours} hrs tracked
            </span>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 rounded-xl overflow-hidden flex bg-stone-100 shadow-inner">
              <div
                style={{ width: `${deepPct}%` }}
                className="bg-emerald-400 h-full transition-all duration-700"
                title={`Deep Work: ${deepPct}%`}
              />
              <div
                style={{ width: `${recallPct}%` }}
                className="bg-pink-300 h-full transition-all duration-700"
                title={`Active Recall: ${recallPct}%`}
              />
              <div
                style={{ width: `${reviewPct}%` }}
                className="bg-sky-300 h-full transition-all duration-700"
                title={`Reading / Review: ${reviewPct}%`}
              />
            </div>

            {/* Labels Strip with Pastel Clay Cards (IMG_4392 Macronutrient style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-4 rounded-3xl clay-card-mint">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  Deep Work
                </div>
                <div className="text-2xl font-extrabold font-mono text-emerald-950 dark:text-emerald-100">{totalDeepWorkHours}h</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">{deepPct}% of focus intake</div>
              </div>

              <div className="p-4 rounded-3xl clay-card-pink">
                <div className="flex items-center gap-1.5 font-bold text-pink-900 dark:text-pink-100 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-xs" />
                  Gizmo Recall
                </div>
                <div className="text-2xl font-extrabold font-mono text-pink-950 dark:text-pink-100">{totalRecallHours}h</div>
                <div className="text-[11px] text-pink-700 dark:text-pink-300 font-medium">{recallPct}% active testing</div>
              </div>

              <div className="p-4 rounded-3xl clay-card-sky">
                <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-100 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
                  Review / Notes
                </div>
                <div className="text-2xl font-extrabold font-mono text-sky-950 dark:text-sky-100">{totalReviewHours}h</div>
                <div className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">{reviewPct}% concept consolidation</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Optimal Cognitive Ratio:</strong> You maintained a healthy 50%+ Deep Work and 25%+ Active Recall distribution this week.
            </span>
          </div>
        </div>

        {/* Module 2: Desk Pet Progression Card (IMG_4392 Pet Dashboard Layout) */}
        <div className="clay-card-yellow p-6 flex flex-col justify-between space-y-4">
          <div>
            {/* Top 3-Stat Squircle Tiles (inspired by IMG_4392) */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl p-2 text-center border border-amber-200/60 dark:border-amber-800/40 shadow-xs">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold">Species</span>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 capitalize">{pet.species}</span>
              </div>
              <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl p-2 text-center border border-amber-200/60 dark:border-amber-800/40 shadow-xs">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold">Mood</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 capitalize">{pet.mood}</span>
              </div>
              <div className="bg-white/80 dark:bg-stone-900/80 rounded-2xl p-2 text-center border border-amber-200/60 dark:border-amber-800/40 shadow-xs">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-semibold">Stage</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Lv.{pet.level}</span>
              </div>
            </div>

            {/* Pet Graphic & Avatar Presentation */}
            <div className="w-24 h-24 mx-auto my-2 rounded-3xl bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center shadow-md relative">
              {pet.species === 'shiba' && (
                <div className="flex flex-col items-center text-amber-700 dark:text-amber-300">
                  <Dog className="w-10 h-10 stroke-[1.75]" />
                  <span className="text-[10px] font-bold tracking-tight">SHIBA</span>
                </div>
              )}
              {pet.species === 'capybara' && (
                <div className="flex flex-col items-center text-amber-700 dark:text-amber-300">
                  <Smile className="w-10 h-10 stroke-[1.75]" />
                  <span className="text-[10px] font-bold tracking-tight">BOBA</span>
                </div>
              )}
              {pet.species === 'owl' && (
                <div className="flex flex-col items-center text-amber-700 dark:text-amber-300">
                  <Bird className="w-10 h-10 stroke-[1.75]" />
                  <span className="text-[10px] font-bold tracking-tight">MATCHA</span>
                </div>
              )}

              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 rounded-full text-[9px] font-bold shadow-xs">
                Lv.{pet.level}
              </span>
            </div>

            <div className="text-center mt-2">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">{pet.name}</h3>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">Earns desk accessories & evolutions through focus sprints</p>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1 mt-3">
              <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-400 font-mono">
                <span className="font-semibold">Evolution XP</span>
                <span className="font-bold">{pet.currentXp} / {pet.nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/70 dark:bg-stone-900 overflow-hidden shadow-inner border border-amber-200/50 dark:border-amber-900/50">
                <div
                  style={{ width: `${xpPercent}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                />
              </div>
            </div>

            {/* Pet Species Switcher */}
            <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={() => handleSwitchPetSpecies('shiba')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  pet.species === 'shiba'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Dog className="w-3.5 h-3.5" />
                <span>Shiba</span>
              </button>
              <button
                onClick={() => handleSwitchPetSpecies('capybara')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  pet.species === 'capybara'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Boba</span>
              </button>
              <button
                onClick={() => handleSwitchPetSpecies('owl')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  pet.species === 'owl'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Bird className="w-3.5 h-3.5" />
                <span>Matcha</span>
              </button>
            </div>
          </div>

          {/* Unlocked Accessories */}
          <div className="pt-2 border-t border-stone-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Equipped Room Decor
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pet.decorations.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[10px] font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: 31-Day Activity Heatmap Grid */}
      <div className="squircle-card p-6 bg-white border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Your Last 31 Days of Study</h2>
              <p className="text-xs text-stone-500">Visual intensity matrix color-coded by daily focus volume</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-stone-100 border border-stone-200" />
              <span>Rest (&lt;2h)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-sky-200" />
              <span>Mod (2-4h)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-emerald-200" />
              <span>High (4-6h)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-pink-200" />
              <span>Max (&gt;6h)</span>
            </div>
          </div>
        </div>

        {/* 31-Day Grid - Responsive calendar style, zero horizontal scroll */}
        <div className="w-full">
          <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-1.5 sm:gap-2 py-2 w-full">
          {heatmapDays.map((day) => {
            let color = 'bg-stone-100 text-stone-400 hover:border-stone-400';
            if (day.hours > 6) {
              color = 'bg-pink-200 text-pink-900 font-bold border-pink-300';
            } else if (day.hours >= 4) {
              color = 'bg-emerald-200 text-emerald-900 font-bold border-emerald-300';
            } else if (day.hours >= 2) {
              color = 'bg-sky-200 text-sky-900 font-bold border-sky-300';
            }

            const isSelected = selectedDay?.dayNumber === day.dayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day)}
                className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${color} ${
                  isSelected ? 'ring-2 ring-stone-900 scale-105 shadow-xs' : 'hover:scale-102'
                }`}
                title={`${new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.hours}h`}
              >
                <span className="text-[11px]">{day.dayNumber}</span>
                <span className="text-[9px] opacity-80 font-mono">{day.hours}h</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Day Breakdown Inspector */}
        {selectedDay && (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Inspecting: {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="text-sm font-bold text-stone-900 mt-0.5">
                {selectedDay.hours} hours across {selectedDay.sessionsCount} focus sprints
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-emerald-700">Deep Work: {selectedDay.deepWorkHours}h</span>
              <span className="text-pink-700">Active Recall: {selectedDay.recallHours}h</span>
              <span className="text-sky-700">Review: {selectedDay.reviewHours}h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
