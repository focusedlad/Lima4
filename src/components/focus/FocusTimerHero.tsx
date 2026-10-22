import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  ShieldAlert,
  Flame,
  Tv,
  Clock,
  Zap,
  Target,
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  X,
  Check,
  Sliders,
  VolumeX,
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';
import { FocusCategory, YouTubeCreator } from '../../types';

interface FocusTimerHeroProps {
  onOpenAudioModal: () => void;
  onSessionComplete: (durationMinutes: number, category: FocusCategory, subject: string, method?: string) => void;
  syncedCreator?: YouTubeCreator | null;
  onDisconnectSync?: () => void;
  activeSubject?: string;
  onToggleFloatingStream?: () => void;
  isStreamActive?: boolean;
}

export type TimerMode =
  | 'pomodoro_50_10'
  | 'pomodoro_25_5'
  | 'animedoro'
  | 'rule_52_17'
  | 'rule_90_20'
  | 'sprint_10'
  | 'flowtime';

export interface FocusWallpaper {
  id: string;
  name: string;
  category: 'minimal' | 'rain' | 'library' | 'nature' | 'night' | 'cosmic';
  description: string;
  imageUrl?: string;
  accentColor: string;
  soundPreset?: 'rain' | 'library' | 'cafe' | 'vinyl';
}

export const FOCUS_WALLPAPERS: FocusWallpaper[] = [
  {
    id: 'clean_clay',
    name: 'Minimalist Ivory Clay',
    category: 'minimal',
    description: 'Zero distractions, soothing dark obsidian slate with warm amber accents',
    accentColor: '#F59E0B',
  },
  {
    id: 'tokyo_rain',
    name: 'Tokyo Rainy Window',
    category: 'rain',
    description: 'Gentle raindrops streaking across glass with warm cafe bokeh outside',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#38BDF8',
    soundPreset: 'rain',
  },
  {
    id: 'kyoto_library',
    name: 'Kyoto Vault Library',
    category: 'library',
    description: 'Towering dark mahogany bookshelves, warm brass lamps, historic focus',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#F59E0B',
    soundPreset: 'library',
  },
  {
    id: 'nordic_mist',
    name: 'Nordic Pine Mist',
    category: 'nature',
    description: 'Tranquil evergreen forest in morning fog, clean and breathing atmosphere',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#34D399',
    soundPreset: 'rain',
  },
  {
    id: 'night_owl',
    name: 'Midnight Study Desk',
    category: 'night',
    description: 'Warm glowing lamp, midnight quiet, deep 2am flow state',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#A78BFA',
    soundPreset: 'vinyl',
  },
  {
    id: 'golden_studio',
    name: 'Golden Hour Studio',
    category: 'minimal',
    description: 'Soft afternoon sun rays, clean architectural geometry and tranquility',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#FB923C',
    soundPreset: 'cafe',
  },
  {
    id: 'zen_bamboo',
    name: 'Zen Bamboo Garden',
    category: 'nature',
    description: 'Tranquil Japanese bamboo groves, smooth stone ripples, mental silence',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#10B981',
    soundPreset: 'cafe',
  },
  {
    id: 'cosmic_stars',
    name: 'Cosmic Starfield',
    category: 'cosmic',
    description: 'Deep navy nebula, distant galaxy dust, calm boundless concentration',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#818CF8',
    soundPreset: 'vinyl',
  },
];

export const FocusTimerHero: React.FC<FocusTimerHeroProps> = ({
  onOpenAudioModal,
  onSessionComplete,
  syncedCreator,
  onDisconnectSync,
  activeSubject = 'USMLE / Neuro',
  onToggleFloatingStream,
  isStreamActive = false,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro_50_10');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60);
  const [flowtimeSeconds, setFlowtimeSeconds] = useState<number>(0);
  const [isPhoneAway, setIsPhoneAway] = useState<boolean>(false);
  const [awayCount, setAwayCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<FocusCategory>('deep_work');

  // Wallpaper and Atmosphere States
  const [selectedWallpaperId, setSelectedWallpaperId] = useState<string>(() => {
    return localStorage.getItem('lumina_focus_wallpaper') || 'tokyo_rain';
  });
  const [dimLevel, setDimLevel] = useState<'soft' | 'medium' | 'deep'>(() => {
    return (localStorage.getItem('lumina_focus_dim') as any) || 'medium';
  });
  const [isAtmosphereModalOpen, setIsAtmosphereModalOpen] = useState<boolean>(false);
  const [isZenFullscreen, setIsZenFullscreen] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  const currentWallpaper =
    FOCUS_WALLPAPERS.find((w) => w.id === selectedWallpaperId) || FOCUS_WALLPAPERS[0];

  useEffect(() => {
    localStorage.setItem('lumina_focus_wallpaper', selectedWallpaperId);
  }, [selectedWallpaperId]);

  useEffect(() => {
    localStorage.setItem('lumina_focus_dim', dimLevel);
  }, [dimLevel]);

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
      case 'rule_52_17':
        return 52 * 60;
      case 'rule_90_20':
        return 90 * 60;
      case 'sprint_10':
        return 10 * 60;
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
      case 'rule_52_17':
        return 17 * 60;
      case 'rule_90_20':
        return 20 * 60;
      case 'sprint_10':
        return 3 * 60;
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isRunning, isBreak]);

  // Timer Interval Loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (mode === 'flowtime') {
          setFlowtimeSeconds((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, isBreak]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isBreak) {
      audioSynth.playChime('pomodoro_complete');
      const workMin = Math.round(getWorkSeconds(mode) / 60);
      onSessionComplete(workMin, selectedCategory, activeSubject, mode);
      setIsBreak(true);
      setTimeLeft(getBreakSeconds(mode));
    } else {
      audioSynth.playChime('break_start');
      setIsBreak(false);
      setTimeLeft(getWorkSeconds(mode));
    }
  };

  const togglePlay = () => {
    if (!isRunning) {
      audioSynth.playChime('pomodoro_complete');
    }
    setIsRunning(!isRunning);
    setIsPhoneAway(false);
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
    if (!isBreak && mode === 'flowtime' && flowtimeSeconds > 60) {
      const minutes = Math.floor(flowtimeSeconds / 60);
      onSessionComplete(minutes, selectedCategory, activeSubject, 'flowtime');
      setFlowtimeSeconds(0);
      setIsRunning(false);
      return;
    }

    if (!isBreak) {
      const currentWork = getWorkSeconds(mode);
      const studied = Math.max(1, Math.round((currentWork - timeLeft) / 60));
      onSessionComplete(studied, selectedCategory, activeSubject, mode);
      setIsBreak(true);
      setTimeLeft(getBreakSeconds(mode));
    } else {
      setIsBreak(false);
      setTimeLeft(getWorkSeconds(mode));
    }
    setIsRunning(false);
  };

  const handleSoundToggle = (soundType?: 'rain' | 'library' | 'cafe' | 'vinyl') => {
    if (!soundType) return;
    if (activeSound === soundType) {
      audioSynth.stopAll();
      setActiveSound(null);
    } else {
      audioSynth.stopAll();
      if (soundType === 'rain') audioSynth.startRain(0.5);
      if (soundType === 'library') audioSynth.startLibrary(0.4);
      if (soundType === 'cafe') audioSynth.startCafe(0.4);
      if (soundType === 'vinyl') audioSynth.startVinyl(0.4);
      setActiveSound(soundType);
    }
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

  const overlayOpacity =
    dimLevel === 'soft' ? 'bg-stone-950/45' : dimLevel === 'medium' ? 'bg-stone-950/70' : 'bg-stone-950/85';

  return (
    <>
      <div className="relative rounded-[32px] overflow-hidden transition-all shadow-xl border border-stone-800 text-white">
        {/* Background Wallpaper Layer */}
        {currentWallpaper.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-[1.02]"
            style={{ backgroundImage: `url(${currentWallpaper.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#161618]" />
        )}

        {/* Ambient Dark Overlay for High Contrast Text Readability */}
        <div className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-300 ${overlayOpacity}`} />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Top Bar: Mode Selectors & Atmospheric Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Segmented Mode Control - Various Studying Timing Methods */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-800 text-xs max-w-full">
              <button
                onClick={() => switchMode('pomodoro_50_10')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'pomodoro_50_10'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="50m Deep Work / 10m Break"
              >
                50/10 Focus
              </button>
              <button
                onClick={() => switchMode('pomodoro_25_5')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'pomodoro_25_5'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="25m Classic Pomodoro / 5m Break"
              >
                25/5 Classic
              </button>
              <button
                onClick={() => switchMode('animedoro')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'animedoro'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="40m Sprint / 20m Video Reward"
              >
                40/20 Animedoro
              </button>
              <button
                onClick={() => switchMode('rule_52_17')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'rule_52_17'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="52m Peak Productivity / 17m Scientific Rest (DeskTime study)"
              >
                52/17 DeskTime
              </button>
              <button
                onClick={() => switchMode('rule_90_20')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'rule_90_20'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="90m Ultradian Rhythm Sprint / 20m Recharge"
              >
                90/20 Ultradian
              </button>
              <button
                onClick={() => switchMode('sprint_10')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'sprint_10'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="10m Anti-Procrastination Kickstart"
              >
                10m Sprint
              </button>
              <button
                onClick={() => switchMode('flowtime')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'flowtime'
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Open Flowtime Stopwatch"
              >
                Flowtime
              </button>
            </div>

            {/* Atmosphere, Wallpaper, Sound & Stream Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Wallpaper & Atmosphere Selector Button */}
              <button
                onClick={() => setIsAtmosphereModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-amber-300 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-xs"
                title="Choose wallpaper background and study atmosphere"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{currentWallpaper.name}</span>
              </button>

              {/* Fullscreen Zen Mode Toggle */}
              <button
                onClick={() => setIsZenFullscreen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold backdrop-blur-md transition-colors"
                title="Enter full-screen Zen study immersion"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zen Mode</span>
              </button>

              {syncedCreator && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
                  <Tv className="w-3.5 h-3.5" />
                  <span>Synced: {syncedCreator.name}</span>
                  {onDisconnectSync && (
                    <button
                      onClick={onDisconnectSync}
                      className="ml-1 text-white/60 hover:text-white font-bold"
                      title="Unlink sync"
                    >
                      X
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={onOpenAudioModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold transition-colors backdrop-blur-md"
                title="Open Web Audio Synthesizer"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Ambience</span>
              </button>

              {onToggleFloatingStream && (
                <button
                  onClick={onToggleFloatingStream}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all backdrop-blur-md ${
                    isStreamActive
                      ? 'bg-rose-950 border-rose-800 text-rose-300 shadow-xs'
                      : 'bg-stone-900/90 hover:bg-stone-800 border-stone-800 text-stone-200'
                  }`}
                  title="Toggle floating study stream in top-right corner"
                >
                  <Tv className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">{isStreamActive ? 'Pop-Up Video' : 'Video Pop-Up'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Phone Down / Accountability Warning Banner if user was away */}
          {isPhoneAway && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/90 border border-rose-800 text-rose-200 flex items-center justify-between animate-fade-in text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Focus Window Inactive!</strong> Tab was backgrounded during active sprint.
                </span>
              </div>
              <button
                onClick={() => setIsPhoneAway(false)}
                className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 font-semibold transition-colors"
              >
                Resume Focus
              </button>
            </div>
          )}

          {/* Central Interactive Circular Timer Graphic */}
          <div className="flex flex-col items-center justify-center py-6 sm:py-10">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer SVG Progress Ring */}
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                {/* Background track ring */}
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-stone-800/80"
                  fill="transparent"
                />
                {/* Active progress track */}
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
                  className="transition-all duration-700"
                />
              </svg>

              {/* Central Counter Display */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span
                  className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    isBreak ? 'text-amber-300' : 'text-emerald-400'
                  }`}
                >
                  {isBreak
                    ? 'Recharging Break'
                    : mode === 'flowtime'
                    ? 'Flowing Stopwatch'
                    : 'Deep Focus Sprint'}
                </span>
                <div className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono text-white drop-shadow-md">
                  {formattedTime}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-300 font-medium bg-stone-900/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{activeSubject}</span>
                </div>
              </div>
            </div>

            {/* Focus Category Selector (Deep Work, Active Recall, Review) */}
            <div className="flex items-center gap-1.5 mt-4 p-1 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-800">
              <button
                onClick={() => setSelectedCategory('deep_work')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'deep_work'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Deep Work
              </button>
              <button
                onClick={() => setSelectedCategory('recall')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'recall'
                    ? 'bg-pink-950 text-pink-300 border border-pink-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Active Recall
              </button>
              <button
                onClick={() => setSelectedCategory('review')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'review'
                    ? 'bg-sky-950 text-sky-300 border border-sky-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Reading / Review
              </button>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-stone-800/80">
            <button
              onClick={handleReset}
              className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors backdrop-blur-md"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`flex items-center justify-center px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                isRunning
                  ? 'bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700'
                  : 'bg-emerald-400 text-stone-950 hover:bg-emerald-300'
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
              className="p-3 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors backdrop-blur-md"
              title="Skip to break / complete"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Zen Study Immersion Modal */}
      {isZenFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 text-white bg-stone-950 select-none animate-fade-in overflow-hidden">
          {/* Wallpaper Layer */}
          {currentWallpaper.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url(${currentWallpaper.imageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-stone-950" />
          )}

          {/* Dimmer Overlay */}
          <div className={`absolute inset-0 backdrop-blur-[3px] ${overlayOpacity}`} />

          {/* Top Bar inside Zen Mode */}
          <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 border border-white/10 backdrop-blur-md text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-stone-200">{activeSubject}</span>
            </div>

            <button
              onClick={() => setIsZenFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-xs font-bold text-stone-300 hover:text-white backdrop-blur-md transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Zen</span>
            </button>
          </div>

          {/* Zen Center Timer Display */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <span
              className={`text-sm font-bold uppercase tracking-widest mb-2 ${
                isBreak ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {isBreak ? 'Recharging Break' : 'Deep Work Session'}
            </span>
            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
              {formattedTime}
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white transition-all backdrop-blur-md"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className={`flex items-center justify-center px-10 py-4 rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95 ${
                  isRunning
                    ? 'bg-stone-900/90 text-white border border-white/20 hover:bg-stone-800'
                    : 'bg-emerald-400 text-stone-950 hover:bg-emerald-300'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2 fill-current" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Focus Now
                  </>
                )}
              </button>

              <button
                onClick={handleSkip}
                className="p-3.5 rounded-2xl bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white transition-all backdrop-blur-md"
                title="Skip"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Zen Bottom Bar */}
          <div className="relative z-10 text-center text-xs text-stone-400 font-medium">
            Press Esc or Exit Zen to return to standard view
          </div>
        </div>
      )}

      {/* Wallpaper & Focus Atmosphere Selector Modal */}
      {isAtmosphereModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-fade-in">
          <div className="squircle-card max-w-2xl w-full p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Study Session Wallpapers & Atmosphere
                  </h3>
                  <p className="text-xs text-stone-500">
                    Select an aesthetic background and pair matching ambient noise
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAtmosphereModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* Dimmer / Contrast Slider */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Background Contrast Dimmer
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 capitalize">{dimLevel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setDimLevel('soft')}
                    className={`py-1.5 rounded-xl font-semibold border transition-all ${
                      dimLevel === 'soft'
                        ? 'bg-white dark:bg-stone-900 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    Soft (Vibrant)
                  </button>
                  <button
                    onClick={() => setDimLevel('medium')}
                    className={`py-1.5 rounded-xl font-semibold border transition-all ${
                      dimLevel === 'medium'
                        ? 'bg-white dark:bg-stone-900 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    Medium (Balanced)
                  </button>
                  <button
                    onClick={() => setDimLevel('deep')}
                    className={`py-1.5 rounded-xl font-semibold border transition-all ${
                      dimLevel === 'deep'
                        ? 'bg-white dark:bg-stone-900 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    Deep (High Focus)
                  </button>
                </div>
              </div>

              {/* Wallpaper Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FOCUS_WALLPAPERS.map((wp) => {
                  const isSelected = selectedWallpaperId === wp.id;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => setSelectedWallpaperId(wp.id)}
                      className={`group cursor-pointer rounded-2xl border p-3.5 transition-all text-left relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-400/40 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {/* Thumbnail Preview */}
                      <div className="h-28 rounded-xl overflow-hidden mb-2.5 relative border border-stone-200/80 dark:border-stone-700">
                        {wp.imageUrl ? (
                          <img
                            src={wp.imageUrl}
                            alt={wp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-900 flex items-center justify-center text-stone-500 font-mono text-xs">
                            Dark Obsidian Clay
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-stone-900 dark:text-white flex items-center justify-between">
                          <span>{wp.name}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                          {wp.description}
                        </p>
                      </div>

                      {/* Sound Preset Pair */}
                      {wp.soundPreset && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 capitalize">Ambience: {wp.soundPreset}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSoundToggle(wp.soundPreset);
                            }}
                            className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                              activeSound === wp.soundPreset
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{activeSound === wp.soundPreset ? 'Playing' : 'Play Sound'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 mt-4 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsAtmosphereModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Apply Atmosphere
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
