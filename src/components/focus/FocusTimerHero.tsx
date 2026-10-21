import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sparkles,
  Volume2,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';
import { FocusCategory, YouTubeCreator } from '../../types';

interface FocusTimerHeroProps {
  onOpenAudioModal: () => void;
  onSessionComplete: (durationMinutes: number, category: FocusCategory, subject: string) => void;
  syncedCreator?: YouTubeCreator | null;
  onDisconnectSync?: () => void;
  activeSubject?: string;
  onToggleFloatingStream?: () => void;
  isStreamActive?: boolean;
}

export type TimerMode = 'pomodoro_50_10' | 'pomodoro_25_5' | 'animedoro' | 'flowtime';

export const FocusTimerHero: React.FC<FocusTimerHeroProps> = ({
  onOpenAudioModal,
  onSessionComplete,
  syncedCreator,
  onDisconnectSync,
  activeSubject = 'USMLE / Neuro',
  onToggleFloatingStream,
  isStreamActive,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro_50_10');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60);
  const [flowtimeSeconds, setFlowtimeSeconds] = useState<number>(0);
  const [isPhoneAway, setIsPhoneAway] = useState<boolean>(false);
  const [awayCount, setAwayCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<FocusCategory>('deep_work');

  const intervalRef = useRef<number | null>(null);

  // Synchronize with creator interval if linked
  useEffect(() => {
    if (syncedCreator) {
      if (syncedCreator.pomodoroWorkMin === 25) {
        setMode('pomodoro_25_5');
        setTimeLeft(25 * 60);
      } else {
        setMode('pomodoro_50_10');
        setTimeLeft(syncedCreator.pomodoroWorkMin * 60);
      }
    }
  }, [syncedCreator]);

  // Handle Mode Change
  const getWorkSeconds = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro_50_10':
        return 50 * 60;
      case 'pomodoro_25_5':
        return 25 * 60;
      case 'animedoro':
        return 40 * 60;
      case 'flowtime':
        return 0;
    }
  };

  const getBreakSeconds = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro_50_10':
        return 10 * 60;
      case 'pomodoro_25_5':
        return 5 * 60;
      case 'animedoro':
        return 20 * 60;
      case 'flowtime':
        return 5 * 60;
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsBreak(false);
    if (newMode === 'flowtime') {
      setFlowtimeSeconds(0);
    } else {
      setTimeLeft(getWorkSeconds(newMode));
    }
  };

  // Group Accountability: "Phone Down" / Tab Blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isBreak) {
        setIsPhoneAway(true);
        setAwayCount((prev) => prev + 1);
      }
    };

    const handleWindowBlur = () => {
      if (isRunning && !isBreak) {
        setIsPhoneAway(true);
      }
    };

    const handleWindowFocus = () => {
      // Returned back to the app
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isRunning, isBreak]);

  // Timer Tick Loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (mode === 'flowtime') {
          setFlowtimeSeconds((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handlePeriodFinished();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, isBreak]);

  const handlePeriodFinished = () => {
    setIsRunning(false);
    if (!isBreak) {
      // Completed focus session
      audioSynth.playChime('pomodoro_complete');
      const minutesCompleted = Math.round(
        (mode === 'flowtime' ? flowtimeSeconds : getWorkSeconds(mode)) / 60
      );
      onSessionComplete(minutesCompleted, selectedCategory, activeSubject);
      setIsBreak(true);
      setTimeLeft(getBreakSeconds(mode));
    } else {
      // Completed break
      audioSynth.playChime('break_start');
      setIsBreak(false);
      setTimeLeft(getWorkSeconds(mode));
    }
  };

  const togglePlay = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning && onToggleFloatingStream && !isStreamActive) {
      onToggleFloatingStream();
    }
    if (isPhoneAway) {
      setIsPhoneAway(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setIsPhoneAway(false);
    if (mode === 'flowtime') {
      setFlowtimeSeconds(0);
    } else {
      setTimeLeft(getWorkSeconds(mode));
    }
  };

  const handleSkip = () => {
    handlePeriodFinished();
  };

  // Format time display
  const displaySeconds = mode === 'flowtime' ? flowtimeSeconds : timeLeft;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Progress ring computation
  const totalDuration = isBreak ? getBreakSeconds(mode) : getWorkSeconds(mode);
  const progressRatio =
    mode === 'flowtime'
      ? Math.min(1, (flowtimeSeconds % (50 * 60)) / (50 * 60))
      : 1 - timeLeft / Math.max(1, totalDuration);

  const radius = 98;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="squircle-card-dark p-6 sm:p-8 text-white relative overflow-hidden transition-all">
      {/* Background ambient neon glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000 ${
          isBreak ? 'bg-amber-400' : isPhoneAway ? 'bg-rose-500' : 'bg-emerald-400'
        }`}
      />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none bg-sky-500" />

      {/* Top Bar: Mode Selectors & Creator Sync Badge */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Segmented Mode Control */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs max-w-full">
          <button
            onClick={() => switchMode('pomodoro_50_10')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'pomodoro_50_10'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            50/10 Focus
          </button>
          <button
            onClick={() => switchMode('pomodoro_25_5')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'pomodoro_25_5'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            25/5 Classic
          </button>
          <button
            onClick={() => switchMode('animedoro')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'animedoro'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            40/20 Animedoro
          </button>
          <button
            onClick={() => switchMode('flowtime')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              mode === 'flowtime'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Flowtime
          </button>
        </div>

        {/* Ambient Sound & Stream Sync badges */}
        <div className="flex flex-wrap items-center gap-2">
          {syncedCreator && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
              <Tv className="w-3.5 h-3.5 animate-pulse" />
              <span>Synced with {syncedCreator.name}</span>
              {onDisconnectSync && (
                <button
                  onClick={onDisconnectSync}
                  className="ml-1 text-white/60 hover:text-white"
                  title="Unlink sync"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <button
            onClick={onOpenAudioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-stone-200 text-xs transition-colors"
            title="Open Web Audio Synthesizer"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Ambience</span>
          </button>

          {onToggleFloatingStream && (
            <button
              onClick={onToggleFloatingStream}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                isStreamActive
                  ? 'bg-rose-500/25 text-rose-200 border-rose-500/40 shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-stone-200'
              }`}
              title="Toggle floating study stream in top-right corner"
            >
              <Tv className={`w-3.5 h-3.5 ${isStreamActive ? 'text-rose-400 animate-pulse' : 'text-stone-300'}`} />
              <span className="hidden sm:inline">{isStreamActive ? 'Mini Player' : 'Live Video'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Phone Down / Accountability Warning Banner if user was away */}
      {isPhoneAway && (
        <div className="relative z-10 mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Phone Picked Up / Tab Left!</strong> Room peers see you as "Away".
            </span>
          </div>
          <button
            onClick={() => setIsPhoneAway(false)}
            className="px-2.5 py-1 rounded-lg bg-rose-500/40 hover:bg-rose-500/60 font-semibold transition-colors"
          >
            Back in Focus
          </button>
        </div>
      )}

      {/* Main Focus Dial & Time Presentation */}
      <div className="relative z-10 flex flex-col items-center justify-center my-3">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              className="text-stone-800"
              fill="transparent"
            />
            {/* Active glowing progress track */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke={isBreak ? '#FBBF24' : isPhoneAway ? '#F43F5E' : '#34D399'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 filter drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]"
            />
          </svg>

          {/* Central Counter Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                isBreak ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {isBreak ? 'Recharging Break' : mode === 'flowtime' ? 'Flowing Sprint' : 'Deep Focus Sprint'}
            </span>
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono text-white">
              {formattedTime}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{activeSubject}</span>
            </div>
          </div>
        </div>

        {/* Focus Category Selector (Deep Work, Active Recall, Review) */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-stone-900/80 rounded-2xl border border-white/5">
          <button
            onClick={() => setSelectedCategory('deep_work')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === 'deep_work'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Deep Work
          </button>
          <button
            onClick={() => setSelectedCategory('recall')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === 'recall'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Active Recall
          </button>
          <button
            onClick={() => setSelectedCategory('review')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === 'review'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Reading / Review
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
        <button
          onClick={handleReset}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className={`flex items-center justify-center px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all transform active:scale-95 ${
            isRunning
              ? 'bg-stone-800 text-stone-200 hover:bg-stone-700 border border-white/20'
              : 'bg-emerald-400 text-stone-950 hover:bg-emerald-300 shadow-emerald-500/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2 fill-current" />
              Pause Sprint
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Focus
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          title="Skip to break / complete"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
