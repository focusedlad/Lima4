import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  ShieldAlert,
  Flame,
  Tv,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  X,
  Check,
  Sliders,
  Flag,
  Cherry,
  Timer,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';
import { FocusCategory, YouTubeCreator } from '../../types';
import { parseAnyVideoUrl, createCreatorFromVideo } from '../../services/videoParser';

interface FocusTimerHeroProps {
  onOpenAudioModal: () => void;
  onSessionComplete: (durationMinutes: number, category: FocusCategory, subject: string, method?: string) => void;
  syncedCreator?: YouTubeCreator | null;
  onDisconnectSync?: () => void;
  activeSubject?: string;
  onToggleFloatingStream?: () => void;
  isStreamActive?: boolean;
  videoBackground?: YouTubeCreator | null;
  onSetVideoBackground?: (stream: YouTubeCreator | null) => void;
  onPopOutVideo?: (stream: YouTubeCreator) => void;
}

export type FocusMainType = 'pomodoro' | 'study_time';

export type PomodoroPreset = '25_5' | '50_10' | 'animedoro' | 'sprint_10';

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
    description: 'Zero distractions, soothing obsidian slate with soft pink accents',
    accentColor: '#F472B6',
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
    description: 'Towering mahogany bookshelves, quiet focus, historic university warmth',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#F472B6',
    soundPreset: 'library',
  },
  {
    id: 'nordic_mist',
    name: 'Nordic Pine Mist',
    category: 'nature',
    description: 'Tranquil evergreen forest in morning fog, clean and breathing atmosphere',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#38BDF8',
    soundPreset: 'rain',
  },
  {
    id: 'night_owl',
    name: 'Midnight Study Desk',
    category: 'night',
    description: 'Warm glowing lamp, midnight quiet, deep 2am flow state',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#EC4899',
    soundPreset: 'vinyl',
  },
  {
    id: 'golden_studio',
    name: 'Golden Hour Studio',
    category: 'minimal',
    description: 'Soft afternoon sun rays, clean architectural geometry and tranquility',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#F472B6',
    soundPreset: 'cafe',
  },
  {
    id: 'zen_bamboo',
    name: 'Zen Bamboo Garden',
    category: 'nature',
    description: 'Tranquil Japanese bamboo groves, smooth stone ripples, mental silence',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#38BDF8',
    soundPreset: 'cafe',
  },
  {
    id: 'cosmic_stars',
    name: 'Cosmic Starfield',
    category: 'cosmic',
    description: 'Deep navy nebula, distant galaxy dust, calm boundless concentration',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80',
    accentColor: '#38BDF8',
    soundPreset: 'vinyl',
  },
];

export const PRESET_STUDY_VIDEOS = [
  {
    id: 'lofi_girl',
    name: 'Lofi Girl - Study Beats',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    videoId: 'jfKfPfyJRdk',
    description: 'Continuous soothing beats to relax and study to',
  },
  {
    id: 'tokyo_rain_live',
    name: 'Tokyo Rain & City Bokeh',
    url: 'https://www.youtube.com/watch?v=1fueZCTYkpA',
    videoId: '1fueZCTYkpA',
    description: 'Quiet nighttime rainy window over illuminated city lights',
  },
  {
    id: 'cozy_fireplace',
    name: 'Cozy Library Fireplace 4K',
    url: 'https://www.youtube.com/watch?v=2g811Eo7K8U',
    videoId: '2g811Eo7K8U',
    description: 'Warm crackling fireplace in an ancient timber library',
  },
  {
    id: 'chillhop_cafe',
    name: 'Chillhop Raccoon Cafe',
    url: 'https://www.youtube.com/watch?v=5yx6BWlEVcY',
    videoId: '5yx6BWlEVcY',
    description: 'Soft instrumental jazzy hip-hop study sessions',
  },
];

export const FocusTimerHero: React.FC<FocusTimerHeroProps> = ({
  onOpenAudioModal,
  onSessionComplete,
  syncedCreator,
  onDisconnectSync,
  activeSubject = 'General Study',
  onToggleFloatingStream,
  isStreamActive = false,
  videoBackground = null,
  onSetVideoBackground,
  onPopOutVideo,
}) => {
  // Primary Switch: Pomodoro vs Open-ended Study Time
  const [focusType, setFocusType] = useState<FocusMainType>('pomodoro');
  const [pomodoroPreset, setPomodoroPreset] = useState<PomodoroPreset>('25_5');

  // Timer states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [studyTimeSeconds, setStudyTimeSeconds] = useState<number>(0);
  const [pomodoroCycle, setPomodoroCycle] = useState<number>(1);
  const [laps, setLaps] = useState<string[]>([]);

  // Focus Category & Distraction Accountability
  const [selectedCategory, setSelectedCategory] = useState<FocusCategory>('deep_work');
  const [isPhoneAway, setIsPhoneAway] = useState<boolean>(false);

  // Video Background Mute state
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);

  // Wallpaper and Atmosphere States
  const [selectedWallpaperId, setSelectedWallpaperId] = useState<string>(() => {
    return localStorage.getItem('cheri_focus_wallpaper') || 'tokyo_rain';
  });
  const [dimLevel, setDimLevel] = useState<'soft' | 'medium' | 'deep'>(() => {
    return (localStorage.getItem('cheri_focus_dim') as any) || 'medium';
  });
  const [isAtmosphereModalOpen, setIsAtmosphereModalOpen] = useState<boolean>(false);
  const [modalActiveTab, setModalActiveTab] = useState<'wallpapers' | 'video_bg'>('wallpapers');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [customVideoTitle, setCustomVideoTitle] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);

  const [isZenFullscreen, setIsZenFullscreen] = useState<boolean>(false);
  const enterZenFullscreen = async () => {
    // Enter browser-level fullscreen while this click is still a user gesture.
    // Some mobile browsers (notably iOS Safari) do not expose the Fullscreen API;
    // the fixed, viewport-sized Zen overlay remains the best available fallback there.
    setIsZenFullscreen(true);
    try {
      const root = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      if (typeof root.requestFullscreen === 'function') {
        await root.requestFullscreen({ navigationUI: 'hide' });
      } else if (typeof root.webkitRequestFullscreen === 'function') {
        await root.webkitRequestFullscreen();
      }
    } catch (error) {
      // Keep Zen Mode open even if browser-level fullscreen is unsupported or denied.
      console.info('Browser fullscreen is unavailable; keeping Zen Mode immersive.', error);
    }
  };

  const exitZenFullscreen = async () => {
    setIsZenFullscreen(false);
    try {
      const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen();
      } else if (doc.webkitFullscreenElement && typeof doc.webkitExitFullscreen === 'function') {
        await doc.webkitExitFullscreen();
      }
    } catch (error) {
      console.info('Browser fullscreen could not be exited programmatically.', error);
    }
  };

  const [activeSound, setActiveSound] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const videoBackgroundIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isZenFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsZenFullscreen(false);
    };
    const handleFullscreenChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        setIsZenFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isZenFullscreen]);

  // Mute/unmute YouTube through the IFrame API instead of changing its URL.
  // Changing the URL remounts the iframe and restarts live/replayed videos.
  useEffect(() => {
    const player = videoBackgroundIframeRef.current?.contentWindow;
    if (!player || !videoBackground?.videoId) return;
    player.postMessage(
      JSON.stringify({ event: 'command', func: isVideoMuted ? 'mute' : 'unMute', args: [] }),
      'https://www.youtube-nocookie.com'
    );
  }, [isVideoMuted, videoBackground?.videoId]);

  const currentWallpaper =
    FOCUS_WALLPAPERS.find((w) => w.id === selectedWallpaperId) || FOCUS_WALLPAPERS[0];

  useEffect(() => {
    localStorage.setItem('cheri_focus_wallpaper', selectedWallpaperId);
  }, [selectedWallpaperId]);

  useEffect(() => {
    localStorage.setItem('cheri_focus_dim', dimLevel);
  }, [dimLevel]);

  // Synchronize with creator interval if linked
  useEffect(() => {
    if (syncedCreator) {
      setFocusType('pomodoro');
      if (syncedCreator.pomodoroWorkMin === 25) {
        setPomodoroPreset('25_5');
        setTimeLeft(25 * 60);
      } else {
        setPomodoroPreset('50_10');
        setTimeLeft(syncedCreator.pomodoroWorkMin * 60);
      }
    }
  }, [syncedCreator]);

  // Durations lookup
  const getWorkSeconds = (preset: PomodoroPreset) => {
    switch (preset) {
      case '25_5':
        return 25 * 60;
      case '50_10':
        return 50 * 60;
      case 'animedoro':
        return 40 * 60;
      case 'sprint_10':
        return 10 * 60;
    }
  };

  const getBreakSeconds = (preset: PomodoroPreset, cycle: number) => {
    if (cycle % 4 === 0) {
      return 15 * 60;
    }
    switch (preset) {
      case '25_5':
        return 5 * 60;
      case '50_10':
        return 10 * 60;
      case 'animedoro':
        return 20 * 60;
      case 'sprint_10':
        return 3 * 60;
    }
  };

  // Accountability: window visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isBreak) {
        setIsPhoneAway(true);
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
        if (focusType === 'study_time') {
          setStudyTimeSeconds((prev) => prev + 1);
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
  }, [isRunning, focusType, isBreak, pomodoroPreset, pomodoroCycle]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isBreak) {
      audioSynth.playChime('pomodoro_complete');
      const workMin = Math.round(getWorkSeconds(pomodoroPreset) / 60);
      onSessionComplete(workMin, selectedCategory, activeSubject, `pomodoro_${pomodoroPreset}`);
      setIsBreak(true);
      setTimeLeft(getBreakSeconds(pomodoroPreset, pomodoroCycle));
    } else {
      audioSynth.playChime('break_start');
      setIsBreak(false);
      setPomodoroCycle((c) => (c >= 4 ? 1 : c + 1));
      setTimeLeft(getWorkSeconds(pomodoroPreset));
    }
  };

  const togglePlay = () => {
    setIsRunning(!isRunning);
    setIsPhoneAway(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setIsPhoneAway(false);
    if (focusType === 'study_time') {
      setStudyTimeSeconds(0);
      setLaps([]);
    } else {
      setTimeLeft(getWorkSeconds(pomodoroPreset));
    }
  };

  const handleSkipOrLog = () => {
    if (focusType === 'study_time') {
      if (studyTimeSeconds >= 60) {
        const minutes = Math.floor(studyTimeSeconds / 60);
        onSessionComplete(minutes, selectedCategory, activeSubject, 'study_time');
      }
      setStudyTimeSeconds(0);
      setLaps([]);
      setIsRunning(false);
      return;
    }

    // Pomodoro skip
    if (!isBreak) {
      const currentWork = getWorkSeconds(pomodoroPreset);
      const studied = Math.max(1, Math.round((currentWork - timeLeft) / 60));
      onSessionComplete(studied, selectedCategory, activeSubject, `pomodoro_${pomodoroPreset}`);
      setIsBreak(true);
      setTimeLeft(getBreakSeconds(pomodoroPreset, pomodoroCycle));
    } else {
      setIsBreak(false);
      setPomodoroCycle((c) => (c >= 4 ? 1 : c + 1));
      setTimeLeft(getWorkSeconds(pomodoroPreset));
    }
    setIsRunning(false);
  };

  const handleAddLap = () => {
    const mins = Math.floor(studyTimeSeconds / 60);
    const secs = studyTimeSeconds % 60;
    const lapString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    setLaps((prev) => [lapString, ...prev.slice(0, 4)]);
  };

  const handleSwitchFocusType = (type: FocusMainType) => {
    setIsRunning(false);
    setIsBreak(false);
    setFocusType(type);
    if (type === 'pomodoro') {
      setTimeLeft(getWorkSeconds(pomodoroPreset));
    } else {
      setStudyTimeSeconds(0);
    }
  };

  const handleSwitchPomodoroPreset = (preset: PomodoroPreset) => {
    setIsRunning(false);
    setIsBreak(false);
    setPomodoroPreset(preset);
    setTimeLeft(getWorkSeconds(preset));
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

  // Handle setting a custom video as background or pop-up
  const handleApplyVideo = (mode: 'background' | 'popup', urlToUse?: string, titleToUse?: string) => {
    const url = urlToUse || customVideoUrl;
    const title = titleToUse || customVideoTitle;
    setVideoError(null);

    const parsed = parseAnyVideoUrl(url, title);
    if (!parsed) {
      setVideoError('Please enter a valid video link (YouTube, Vimeo, MP4 file, etc.)');
      return;
    }

    const creator = createCreatorFromVideo(parsed, {
      customTitle: title,
      workMin: 25,
      breakMin: 5,
    });

    if (mode === 'background') {
      if (onSetVideoBackground) onSetVideoBackground(creator);
      setIsAtmosphereModalOpen(false);
    } else {
      if (onPopOutVideo) onPopOutVideo(creator);
      setIsAtmosphereModalOpen(false);
    }

    setCustomVideoUrl('');
    setCustomVideoTitle('');
  };

  // Format time display
  const displaySeconds = focusType === 'study_time' ? studyTimeSeconds : timeLeft;
  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;

  const formattedTime =
    focusType === 'study_time' && hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Progress ring computation
  const totalDuration = isBreak
    ? getBreakSeconds(pomodoroPreset, pomodoroCycle)
    : getWorkSeconds(pomodoroPreset);
  const progressRatio =
    focusType === 'study_time'
      ? Math.min(1, (studyTimeSeconds % (60 * 60)) / (60 * 60))
      : 1 - timeLeft / Math.max(1, totalDuration);

  const radius = 98;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const overlayOpacity =
    dimLevel === 'soft'
      ? 'bg-stone-950/45 dark:bg-black/55'
      : dimLevel === 'medium'
      ? 'bg-stone-950/70 dark:bg-black/75'
      : 'bg-stone-950/85 dark:bg-black/88';

  return (
    <>
      <div className="relative rounded-[32px] overflow-hidden transition-all shadow-xl border border-pink-100/30 dark:border-stone-800 text-white">
        {/* Background Layer: Live Video Background OR Curated Wallpaper */}
        {videoBackground ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {videoBackground.directVideoUrl ? (
              <video
                src={videoBackground.directVideoUrl}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                className="w-full h-full object-cover scale-[1.05]"
              />
            ) : videoBackground.videoId ? (
              <iframe
                ref={videoBackgroundIframeRef}
                src={`https://www.youtube-nocookie.com/embed/${videoBackground.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoBackground.videoId}&playsinline=1&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                title={videoBackground.name}
                className="w-full h-full object-cover scale-[1.35] pointer-events-none border-0"
                allow="autoplay; encrypted-media"
              />
            ) : null}
          </div>
        ) : currentWallpaper.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-[1.02]"
            style={{ backgroundImage: `url(${currentWallpaper.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#161415] dark:bg-[#0D0C0D]" />
        )}

        {/* Ambient Dark Overlay for High Contrast Text Readability */}
        <div className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-300 ${overlayOpacity}`} />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Top Bar: Primary Focus Switcher (Pomodoro vs Study Time) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
            {/* Primary Toggle: Pomodoro vs Study Time */}
            <div className="flex items-center p-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 w-full sm:w-auto">
              <button
                onClick={() => handleSwitchFocusType('pomodoro')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  focusType === 'pomodoro'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25 ring-1 ring-pink-400'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Cherry className="w-3.5 h-3.5" />
                <span>Pomodoro</span>
              </button>

              <button
                onClick={() => handleSwitchFocusType('study_time')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  focusType === 'study_time'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Study Time</span>
              </button>
            </div>

            {/* Video, Wallpaper, Sound & Fullscreen controls */}
            <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
              {/* Wallpaper & Video Selector Button */}
              <button
                onClick={() => setIsAtmosphereModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-pink-300 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-xs"
                title="Choose wallpaper background or video background"
              >
                {videoBackground ? (
                  <>
                    <Tv className="w-3.5 h-3.5 text-pink-400" />
                    <span className="truncate max-w-[130px]">{videoBackground.name}</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-3.5 h-3.5 text-pink-400" />
                    <span>{currentWallpaper.name}</span>
                  </>
                )}
              </button>

              {/* Pop-Out to Movable Window Button (if video background is active) */}
              {videoBackground && onPopOutVideo && (
                <button
                  onClick={() => {
                    onPopOutVideo(videoBackground);
                    if (onSetVideoBackground) onSetVideoBackground(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 text-xs font-bold transition-all active:scale-95 backdrop-blur-md"
                  title="Pop out this video into a movable window that you can drag anywhere around the screen"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pop Out</span>
                </button>
              )}

              {/* Video Audio Toggle */}
              {videoBackground && (
                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-stone-200 text-xs font-semibold backdrop-blur-md"
                  title={isVideoMuted ? 'Unmute video background' : 'Mute video background'}
                >
                  {isVideoMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  )}
                </button>
              )}

              {/* Fullscreen Zen Mode */}
              <button
                onClick={enterZenFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-stone-200 text-xs font-semibold backdrop-blur-md transition-colors"
                title="Enter full-screen Zen study immersion"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zen Mode</span>
              </button>

              {/* Ambience audio */}
              <button
                onClick={onOpenAudioModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/15 text-stone-200 text-xs font-semibold transition-colors backdrop-blur-md"
                title="Open Web Audio Synthesizer"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Ambience</span>
              </button>
            </div>
          </div>

          {/* Sub-bar: Presets for Pomodoro OR Stopwatch Goal for Study Time */}
          <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            {focusType === 'pomodoro' ? (
              <>
                {/* Pomodoro Presets */}
                <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => handleSwitchPomodoroPreset('25_5')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      pomodoroPreset === '25_5'
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    25/5 Classic
                  </button>
                  <button
                    onClick={() => handleSwitchPomodoroPreset('50_10')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      pomodoroPreset === '50_10'
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    50/10 Deep
                  </button>
                  <button
                    onClick={() => handleSwitchPomodoroPreset('animedoro')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      pomodoroPreset === 'animedoro'
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    40/20 Animedoro
                  </button>
                  <button
                    onClick={() => handleSwitchPomodoroPreset('sprint_10')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      pomodoroPreset === 'sprint_10'
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    10m Sprint
                  </button>
                </div>

                {/* Pomodoro Cycle Indicators */}
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                  <span className="text-[11px] font-bold text-stone-300">Cycle {pomodoroCycle}/4</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          step < pomodoroCycle
                            ? 'bg-pink-500 ring-2 ring-pink-400/50'
                            : step === pomodoroCycle
                            ? 'bg-pink-400 animate-pulse'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Study Time Flowtime Mode Details */
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800">
                    Open Flowtime Study Session
                  </span>
                  <span className="text-stone-300 text-[11px]">
                    Counts forward continuously. Log when finished.
                  </span>
                </div>
                {studyTimeSeconds > 0 && (
                  <button
                    onClick={handleAddLap}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5 text-sky-400" />
                    <span>Mark Lap</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Phone Down Accountability Warning Banner */}
          {isPhoneAway && (
            <div className="my-3 p-3 rounded-2xl bg-pink-950/90 border border-pink-700 text-pink-200 flex items-center justify-between animate-fade-in text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0" />
                <span>
                  <strong>cheri Focus Alert:</strong> App was backgrounded during active session.
                </span>
              </div>
              <button
                onClick={() => setIsPhoneAway(false)}
                className="px-2.5 py-1 rounded-lg bg-pink-800 hover:bg-pink-700 font-semibold transition-colors"
              >
                Resume
              </button>
            </div>
          )}

          {/* Central Circular Timer Graphic */}
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer SVG Progress Ring */}
              <svg viewBox="0 0 256 256" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
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
                  stroke={isBreak ? '#38BDF8' : '#EC4899'}
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
                    isBreak ? 'text-sky-300' : 'text-pink-400'
                  }`}
                >
                  {isBreak
                    ? 'Recharging Break'
                    : focusType === 'study_time'
                    ? 'Study Time Stopwatch'
                    : 'Pomodoro Focus'}
                </span>
                <div className="text-5xl sm:text-6xl font-black tracking-tight font-mono text-white drop-shadow-md">
                  {formattedTime}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-200 font-medium bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <span>{activeSubject}</span>
                </div>
              </div>
            </div>

            {/* Lap recordings for Study Time (if any) */}
            {focusType === 'study_time' && laps.length > 0 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full">
                {laps.map((lap, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-black/40 text-[11px] font-mono text-sky-300 border border-white/10"
                  >
                    Lap {laps.length - idx}: {lap}
                  </span>
                ))}
              </div>
            )}

            {/* Focus Category Selector */}
            <div className="flex items-center gap-1.5 mt-5 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
              <button
                onClick={() => setSelectedCategory('deep_work')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'deep_work'
                    ? 'bg-pink-500 text-white font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Deep Work
              </button>
              <button
                onClick={() => setSelectedCategory('recall')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'recall'
                    ? 'bg-pink-500 text-white font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Active Recall
              </button>
              <button
                onClick={() => setSelectedCategory('review')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'review'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Reading / Review
              </button>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-center gap-4 mt-2 pt-4 border-t border-white/10">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 text-stone-300 hover:text-white transition-colors backdrop-blur-md"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`flex items-center justify-center px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
                isRunning
                  ? 'bg-black/60 text-white hover:bg-black/80 border border-white/20'
                  : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/25 ring-2 ring-pink-400/50'
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
                  {focusType === 'study_time' ? 'Start Study Time' : 'Start Pomodoro'}
                </>
              )}
            </button>

            <button
              onClick={handleSkipOrLog}
              className="p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 text-stone-300 hover:text-white transition-colors backdrop-blur-md"
              title={focusType === 'study_time' ? 'Finish & Log Study Time' : 'Skip to break / complete'}
            >
              {focusType === 'study_time' ? (
                <Check className="w-5 h-5 text-sky-400" />
              ) : (
                <SkipForward className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Zen Study Immersion Modal */}
      {isZenFullscreen && (
        <div className="focus-zen-fullscreen fixed inset-0 z-[100] flex h-[100dvh] min-h-[100dvh] w-screen max-w-none flex-col justify-between p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)] sm:p-12 text-white bg-[#030407] select-none animate-fade-in overflow-hidden">
          {/* Wallpaper Layer OR Live Video Background in Zen Fullscreen */}
          {videoBackground ? (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {videoBackground.directVideoUrl ? (
                <video
                  src={videoBackground.directVideoUrl}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  className="w-full h-full object-cover scale-[1.05]"
                />
              ) : videoBackground.videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoBackground.videoId}?autoplay=1&mute=${
                    isVideoMuted ? '1' : '0'
                  }&controls=0&loop=1&playlist=${videoBackground.videoId}&playsinline=1&modestbranding=1`}
                  title={videoBackground.name}
                  className="w-full h-full object-cover scale-[1.35] pointer-events-none border-0"
                  allow="autoplay; encrypted-media"
                />
              ) : null}
            </div>
          ) : currentWallpaper.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
              style={{ backgroundImage: `url(${currentWallpaper.imageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}

          {/* Dimmer Overlay */}
          <div className={`absolute inset-0 backdrop-blur-[3px] ${overlayOpacity}`} />

          {/* Top Bar inside Zen Mode */}
          <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-xs">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <span className="font-semibold text-stone-200">{activeSubject}</span>
            </div>

            <div className="flex items-center gap-2">
              {videoBackground && (
                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-xs font-bold text-stone-300 hover:text-white backdrop-blur-md transition-colors"
                >
                  {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
                  <span>{isVideoMuted ? 'Unmute' : 'Muted'}</span>
                </button>
              )}

              <button
                onClick={exitZenFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-xs font-bold text-stone-300 hover:text-white backdrop-blur-md transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Zen</span>
              </button>
            </div>
          </div>

          {/* Zen Center Timer Display */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <span
              className={`text-sm font-bold uppercase tracking-widest mb-2 ${
                isBreak ? 'text-sky-300' : 'text-pink-400'
              }`}
            >
              {isBreak
                ? 'Recharging Break'
                : focusType === 'study_time'
                ? 'Study Time Stopwatch'
                : 'cheri Pomodoro Session'}
            </span>
            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
              {formattedTime}
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/10 text-stone-300 hover:text-white transition-all backdrop-blur-md"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className={`flex items-center justify-center px-10 py-4 rounded-2xl font-black text-base shadow-2xl transition-all active:scale-95 ${
                  isRunning
                    ? 'bg-black/80 text-white border border-white/20'
                    : 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/30'
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
                onClick={handleSkipOrLog}
                className="p-3.5 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/10 text-stone-300 hover:text-white transition-all backdrop-blur-md"
                title="Finish / Skip"
              >
                {focusType === 'study_time' ? (
                  <Check className="w-5 h-5 text-sky-400" />
                ) : (
                  <SkipForward className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Zen Bottom Bar */}
          <div className="relative z-10 text-center text-xs text-stone-400 font-medium">
            cheri • Press Esc or Exit Zen to return
          </div>
        </div>
      )}

      {/* Wallpaper & Focus Atmosphere / Video Selector Modal */}
      {isAtmosphereModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="squircle-card max-w-2xl w-full p-6 bg-[#FDFBF7] dark:bg-[#121113] border border-pink-100 dark:border-stone-800 shadow-2xl relative max-h-[90vh] flex flex-col rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-stone-800 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Study Atmosphere & Live Video
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Choose an aesthetic wallpaper or play a video as study background or movable pop-up
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAtmosphereModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-pink-50 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs: Wallpapers vs Live Video Backgrounds */}
            <div className="flex items-center gap-2 mb-4 shrink-0 p-1 bg-stone-100 dark:bg-[#1A181C] rounded-2xl">
              <button
                onClick={() => setModalActiveTab('wallpapers')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  modalActiveTab === 'wallpapers'
                    ? 'bg-white dark:bg-[#252228] text-pink-700 dark:text-pink-300 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Aesthetic Wallpapers
              </button>
              <button
                onClick={() => setModalActiveTab('video_bg')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  modalActiveTab === 'video_bg'
                    ? 'bg-white dark:bg-[#252228] text-sky-700 dark:text-sky-300 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                Live Video Background / Pop-Up
              </button>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {modalActiveTab === 'wallpapers' ? (
                <>
                  {/* Dimmer / Contrast Slider */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#1A181C] border border-pink-100 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-pink-500" />
                        Background Contrast Dimmer
                      </span>
                      <span className="text-[11px] font-mono text-stone-500 capitalize">{dimLevel}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        onClick={() => setDimLevel('soft')}
                        className={`py-1.5 rounded-xl font-semibold border transition-all ${
                          dimLevel === 'soft'
                            ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-400 text-pink-700 dark:text-pink-300 shadow-xs'
                            : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        Soft (Vibrant)
                      </button>
                      <button
                        onClick={() => setDimLevel('medium')}
                        className={`py-1.5 rounded-xl font-semibold border transition-all ${
                          dimLevel === 'medium'
                            ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-400 text-pink-700 dark:text-pink-300 shadow-xs'
                            : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        Medium (Balanced)
                      </button>
                      <button
                        onClick={() => setDimLevel('deep')}
                        className={`py-1.5 rounded-xl font-semibold border transition-all ${
                          dimLevel === 'deep'
                            ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-400 text-pink-700 dark:text-pink-300 shadow-xs'
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
                      const isSelected = selectedWallpaperId === wp.id && !videoBackground;
                      return (
                        <div
                          key={wp.id}
                          onClick={() => {
                            setSelectedWallpaperId(wp.id);
                            if (onSetVideoBackground) onSetVideoBackground(null);
                          }}
                          className={`group cursor-pointer rounded-2xl border p-3.5 transition-all text-left relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'border-pink-400 bg-pink-50/40 dark:bg-pink-950/30 ring-2 ring-pink-400/40 shadow-sm'
                              : 'border-pink-100 dark:border-stone-800 bg-white dark:bg-[#1A181C] hover:border-pink-200'
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
                                Ivory Minimal Clay
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
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
                            <div className="mt-2.5 pt-2 border-t border-pink-50 dark:border-stone-800 flex items-center justify-between text-[11px]">
                              <span className="text-stone-400 capitalize">Ambience: {wp.soundPreset}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSoundToggle(wp.soundPreset);
                                }}
                                className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                                  activeSound === wp.soundPreset
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 hover:bg-pink-100'
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
                </>
              ) : (
                /* Live Video Background Tab */
                <div className="space-y-4">
                  {/* Custom URL Input Box */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1A181C] border border-pink-100 dark:border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-sky-500" />
                      <span>Paste Any Custom Video URL</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      YouTube live streams, Vimeo videos, or direct .mp4 video files
                    </p>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customVideoUrl}
                        onChange={(e) => setCustomVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or direct .mp4 link"
                        className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-[#121113] border border-pink-100 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <input
                        type="text"
                        value={customVideoTitle}
                        onChange={(e) => setCustomVideoTitle(e.target.value)}
                        placeholder="Optional custom title (e.g. Kyoto Lofi Stream)"
                        className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] dark:bg-[#121113] border border-pink-100 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>

                    {videoError && <p className="text-[11px] text-rose-500">{videoError}</p>}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplyVideo('background')}
                        className="py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Play as Background</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyVideo('popup')}
                        className="py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Open Movable Pop-up</span>
                      </button>
                    </div>
                  </div>

                  {/* Curated Presets */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white mb-2">
                      Popular Aesthetic Study Streams
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESET_STUDY_VIDEOS.map((vid) => (
                        <div
                          key={vid.id}
                          className="p-3 rounded-2xl bg-white dark:bg-[#1A181C] border border-pink-100 dark:border-stone-800 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-stone-900 dark:text-white">{vid.name}</div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                              {vid.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              onClick={() => handleApplyVideo('background', vid.url, vid.name)}
                              className="py-1 px-2 rounded-lg bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 text-pink-700 dark:text-pink-300 font-bold text-[10px] flex items-center justify-center gap-1 border border-pink-200 dark:border-pink-900"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Background</span>
                            </button>
                            <button
                              onClick={() => handleApplyVideo('popup', vid.url, vid.name)}
                              className="py-1 px-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-bold text-[10px] flex items-center justify-center gap-1 border border-sky-200 dark:border-sky-900"
                            >
                              <Tv className="w-3 h-3" />
                              <span>Movable</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-pink-100 dark:border-stone-800 mt-4 flex items-center justify-between shrink-0">
              {videoBackground ? (
                <button
                  onClick={() => {
                    if (onSetVideoBackground) onSetVideoBackground(null);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600"
                >
                  Clear Video & Revert to Wallpaper
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setIsAtmosphereModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 font-bold text-xs shadow-md shadow-pink-500/20 transition-all active:scale-95"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
