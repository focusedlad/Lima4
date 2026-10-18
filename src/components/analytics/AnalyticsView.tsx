import React, { useState } from 'react';
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
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(
    heatmapDays.find((d) => d.dayNumber === 17) || heatmapDays[16] || heatmapDays[0]
  );

  // Compute Focus Macronutrients Split
  const totalDeepWorkHours = Math.round(
    logs.filter((l) => l.category === 'deep_work').reduce((acc, l) => acc + l.durationMinutes, 0) /
      60 *
      10
  ) / 10 + 48.5;

  const totalRecallHours = Math.round(
    logs.filter((l) => l.category === 'recall').reduce((acc, l) => acc + l.durationMinutes, 0) /
      60 *
      10
  ) / 10 + 26.2;

  const totalReviewHours = Math.round(
    logs.filter((l) => l.category === 'review').reduce((acc, l) => acc + l.durationMinutes, 0) /
      60 *
      10
  ) / 10 + 18.8;

  const totalMonthHours = Math.round((totalDeepWorkHours + totalRecallHours + totalReviewHours) * 10) / 10;
  const deepPct = Math.round((totalDeepWorkHours / totalMonthHours) * 100);
  const recallPct = Math.round((totalRecallHours / totalMonthHours) * 100);
  const reviewPct = 100 - deepPct - recallPct;

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

            {/* Labels Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Deep Work
                </div>
                <div className="text-lg font-bold font-mono text-stone-900">{totalDeepWorkHours}h</div>
                <div className="text-[11px] text-emerald-700">{deepPct}% of focus nutrition</div>
              </div>

              <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-100">
                <div className="flex items-center gap-1.5 font-bold text-pink-900 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  Gizmo Recall
                </div>
                <div className="text-lg font-bold font-mono text-stone-900">{totalRecallHours}h</div>
                <div className="text-[11px] text-pink-700">{recallPct}% active testing</div>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100">
                <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  Review / Notes
                </div>
                <div className="text-lg font-bold font-mono text-stone-900">{totalReviewHours}h</div>
                <div className="text-[11px] text-sky-700">{reviewPct}% passive input</div>
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

        {/* Module 2: Desk Pet Progression Card (1 Col) */}
        <div className="squircle-card p-6 bg-white border border-stone-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Level {pet.level} Desk Pet
              </span>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
                Mood: {pet.mood}
              </div>
            </div>

            {/* Pet Graphic & Avatar Presentation */}
            <div className="w-24 h-24 mx-auto my-2 rounded-3xl bg-amber-100/70 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-inner relative">
              {pet.species === 'shiba' && '🐕'}
              {pet.species === 'capybara' && '🦫'}
              {pet.species === 'owl' && '🦉'}

              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-stone-900 text-white rounded-full text-[9px] font-bold">
                Lv.{pet.level}
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-stone-900">{pet.name} the {pet.species.toUpperCase()}</h3>
              <p className="text-[11px] text-stone-500">Unlocks desk accessories through focus XP</p>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1 mt-3">
              <div className="flex justify-between text-[11px] text-stone-500 font-mono">
                <span>XP Progress</span>
                <span>{pet.currentXp} / {pet.nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  style={{ width: `${xpPercent}%` }}
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                />
              </div>
            </div>

            {/* Pet Species Switcher */}
            <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={() => handleSwitchPetSpecies('shiba')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  pet.species === 'shiba'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                🐕 Shiba
              </button>
              <button
                onClick={() => handleSwitchPetSpecies('capybara')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  pet.species === 'capybara'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                🦫 Boba
              </button>
              <button
                onClick={() => handleSwitchPetSpecies('owl')}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  pet.species === 'owl'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                🦉 Matcha
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
                  className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[10px] font-medium"
                >
                  ✨ {item}
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
              <h2 className="text-sm font-bold text-stone-900">31-Day Habit Heatmap (October 2026)</h2>
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

        {/* 31-Day Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-2 py-2">
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
                title={`Oct ${day.dayNumber}: ${day.hours}h`}
              >
                <span className="text-[11px]">{day.dayNumber}</span>
                <span className="text-[9px] opacity-80 font-mono">{day.hours}h</span>
              </button>
            );
          })}
        </div>

        {/* Day Breakdown Inspector */}
        {selectedDay && (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Inspecting: October {selectedDay.dayNumber}, 2026
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
