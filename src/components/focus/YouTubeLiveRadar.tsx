import React, { useState, useRef, useEffect } from 'react';
import {
  Tv,
  Bell,
  BellOff,
  Radio,
  Users,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
  Check,
  Volume2,
  Headphones,
  Compass,
  Zap,
  Stethoscope,
  CloudRain,
  Eye,
  Link2,
  History,
  Trash2,
  Clock,
  Video,
  FileVideo,
} from 'lucide-react';
import { YouTubeCreator } from '../../types';
import {
  parseAnyVideoUrl,
  createCreatorFromVideo,
  getSavedVideoLinks,
  saveVideoLink,
  removeSavedVideoLink,
  SavedVideoLink,
} from '../../services/videoParser';

interface YouTubeLiveRadarProps {
  creators: YouTubeCreator[];
  onToggleSubscribe: (creatorId: string) => void;
  onSyncWithCreator: (creator: YouTubeCreator) => void;
  syncedCreatorId?: string | null;
  onWatchStream?: (stream: YouTubeCreator) => void;
}

const PRESET_POPULAR_STREAMS: {
  name: string;
  title: string;
  videoId: string;
  mode: string;
  workMin: number;
  breakMin: number;
  category: 'silent' | 'music' | 'ambient' | 'medical';
  channelHandle: string;
  avatar: string;
}[] = [
  {
    name: 'Lofi Girl 24/7',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to [Live 24/7]',
    videoId: 'jfKfPfyJRdk',
    mode: '25m Pomodoro / Flow',
    workMin: 25,
    breakMin: 5,
    category: 'music',
    channelHandle: '@LofiGirl',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    name: 'James Scholz',
    title: '12-Hour Silent Study Sprint (50-10 Pomodoro Focus Session)',
    videoId: 'turb9FvXzM8',
    mode: '50m Sprint / 10m Break',
    workMin: 50,
    breakMin: 10,
    category: 'silent',
    channelHandle: '@JamesScholz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Kharma Medic',
    title: '10-Hour Med School Study Session (50/10 Pomodoro + Rain)',
    videoId: '4xDzrJKXOOY',
    mode: '50m Deep Work / 10m Break',
    workMin: 50,
    breakMin: 10,
    category: 'medical',
    channelHandle: '@KharmaMedic',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    name: 'Chillhop Beats',
    title: 'Chillhop Radio - Jazzy & Lo-Fi Study Beats to Focus',
    videoId: '5yx6BWlEVcY',
    mode: '50m Deep Work / 10m Break',
    workMin: 50,
    breakMin: 10,
    category: 'music',
    channelHandle: '@ChillhopMusic',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    name: 'The Sherry Formula',
    title: '4-Hour Silent Pomodoro Study Sprint (Desk Timer + Lo-Fi)',
    videoId: 'S_dfuo2F760',
    mode: '60m Deep Sprint / 10m Break',
    workMin: 60,
    breakMin: 10,
    category: 'silent',
    channelHandle: '@TheSherryFormula',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    name: 'Tokyo Rain Library',
    title: 'Tokyo Evening Rain & Quiet Library Ambience',
    videoId: '5qap5aO4i9A',
    mode: '50m Focus / 10m Break',
    workMin: 50,
    breakMin: 10,
    category: 'ambient',
    channelHandle: '@AbaoinTokyo',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
  },
  {
    name: 'StudyMD Board Prep',
    title: '10-Hour Intensive Board Exam Sprint (Silent Real-Time Study)',
    videoId: '4xDzrJKXOOY',
    mode: '50m Deep Work / 10m Break',
    workMin: 50,
    breakMin: 10,
    category: 'medical',
    channelHandle: '@StudyMD',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
  },
  {
    name: 'Cafe Study Piano',
    title: 'Cozy Coffee Shop Ambience & Soft Piano Study',
    videoId: 'S_dfuo2F760',
    mode: 'Continuous Flowtime',
    workMin: 45,
    breakMin: 15,
    category: 'ambient',
    channelHandle: '@CafeStudy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
];

export const YouTubeLiveRadar: React.FC<YouTubeLiveRadarProps> = ({
  creators,
  onToggleSubscribe,
  onSyncWithCreator,
  syncedCreatorId,
  onWatchStream,
}) => {
  const [selectedStream, setSelectedStream] = useState<YouTubeCreator>(creators[0]);
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [streamReloadKey, setStreamReloadKey] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'silent' | 'music' | 'ambient' | 'medical'>('all');

  // Custom Video Link Inputs
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customTitleInput, setCustomTitleInput] = useState<string>('');
  const [customWorkMin, setCustomWorkMin] = useState<number>(50);
  const [customBreakMin, setCustomBreakMin] = useState<number>(10);
  const [inputError, setInputError] = useState<string | null>(null);
  const [savedLinks, setSavedLinks] = useState<SavedVideoLink[]>(() => getSavedVideoLinks());

  const radarPlayerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const handleSelectStream = (creator: YouTubeCreator) => {
    setSelectedStream(creator);
    onWatchStream?.(creator);
    setAlertNotice(`Watching stream: ${creator.name}`);
    setTimeout(() => setAlertNotice(null), 3000);
  };

  const handleSelectPreset = (preset: (typeof PRESET_POPULAR_STREAMS)[0]) => {
    const updated: YouTubeCreator = {
      id: `preset_${preset.videoId}`,
      name: preset.name,
      channelTitle: preset.channelHandle || preset.name,
      avatar: preset.avatar,
      subscribers: '1M+',
      isLive: true,
      streamTitle: preset.title,
      videoId: preset.videoId,
      currentSessionMode: preset.mode,
      pomodoroWorkMin: preset.workMin,
      pomodoroBreakMin: preset.breakMin,
      liveViewers: 14500,
      isSubscribed: true,
      sourceType: 'youtube',
      videoUrl: `https://www.youtube.com/watch?v=${preset.videoId}`,
    };
    setSelectedStream(updated);
    onWatchStream?.(updated);
    setStreamReloadKey((k) => k + 1);
    setAlertNotice(`Now playing: ${preset.name}`);
    setTimeout(() => setAlertNotice(null), 3000);
  };

  const handleSync = (creator: YouTubeCreator) => {
    onSyncWithCreator(creator);
    setAlertNotice(`Timer synchronized with ${creator.name}'s ${creator.pomodoroWorkMin}/${creator.pomodoroBreakMin} cycle!`);
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleToggleSub = (creator: YouTubeCreator) => {
    onToggleSubscribe(creator.id);
    const newStatus = !creator.isSubscribed;
    setAlertNotice(
      newStatus
        ? `🔔 WebSub Radar: You will get live alerts when ${creator.name} starts streaming!`
        : `Turned off live alerts for ${creator.name}.`
    );
    setTimeout(() => setAlertNotice(null), 3500);
  };

  // Process and play any video link
  const handleProcessCustomLink = (destination: 'popup' | 'radar') => {
    setInputError(null);
    if (!customUrlInput.trim()) {
      setInputError('Please paste a video URL (YouTube, Vimeo, MP4 file, etc.)');
      return;
    }

    const parsed = parseAnyVideoUrl(customUrlInput, customTitleInput);
    if (!parsed) {
      setInputError('Could not recognize video URL. Please check the link and try again.');
      return;
    }

    const newCreator = createCreatorFromVideo(parsed, {
      customTitle: customTitleInput,
      workMin: customWorkMin,
      breakMin: customBreakMin,
    });

    // Save to local storage
    const updated = saveVideoLink({
      url: parsed.originalUrl,
      title: newCreator.name,
      sourceType: parsed.sourceType,
      workMin: customWorkMin,
      breakMin: customBreakMin,
    });
    setSavedLinks(updated);

    if (destination === 'popup') {
      onWatchStream?.(newCreator);
      setAlertNotice(`Launched "${newCreator.name}" in floating movable pop-up!`);
    } else {
      setSelectedStream(newCreator);
      setStreamReloadKey((k) => k + 1);
      setAlertNotice(`Loaded "${newCreator.name}" in radar player.`);
      if (radarPlayerRef.current) {
        radarPlayerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setCustomUrlInput('');
    setCustomTitleInput('');
    setTimeout(() => setAlertNotice(null), 3500);
  };

  const handlePlaySavedLink = (saved: SavedVideoLink, destination: 'popup' | 'radar') => {
    const parsed = parseAnyVideoUrl(saved.url, saved.title);
    if (!parsed) return;

    const newCreator = createCreatorFromVideo(parsed, {
      customTitle: saved.title,
      workMin: saved.workMin,
      breakMin: saved.breakMin,
    });

    if (destination === 'popup') {
      onWatchStream?.(newCreator);
      setAlertNotice(`Playing "${newCreator.name}" in floating pop-up.`);
    } else {
      setSelectedStream(newCreator);
      setStreamReloadKey((k) => k + 1);
      setAlertNotice(`Loaded "${newCreator.name}" in radar.`);
    }
    setTimeout(() => setAlertNotice(null), 3000);
  };

  const handleDeleteSavedLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeSavedVideoLink(id);
    setSavedLinks(updated);
  };

  const filteredPresets =
    categoryFilter === 'all'
      ? PRESET_POPULAR_STREAMS
      : PRESET_POPULAR_STREAMS.filter((p) => p.category === categoryFilter);

  // Check type of video for the radar player
  const isDirectVideo = selectedStream?.sourceType === 'direct' || Boolean(selectedStream?.directVideoUrl);
  const isVimeo = selectedStream?.sourceType === 'vimeo';
  const isGenericEmbed = selectedStream?.sourceType === 'embed';
  const isYouTube = !isDirectVideo && !isVimeo && !isGenericEmbed;

  return (
    <div className="space-y-6">
      {/* Toast Alert Notice */}
      {alertNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{alertNotice}</span>
          <button onClick={() => setAlertNotice(null)} className="text-amber-700 dark:text-amber-400 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Universal Video Station Card (Play Any Video Link) */}
      <div className="clay-card-yellow p-5 sm:p-6 transition-all shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <span>Universal Video Station</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-stone-900 dark:text-amber-200 uppercase tracking-wider">
                  Any Video Link
                </span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Paste any YouTube video/stream, Shorts, Vimeo, or MP4 link — play in the floating pop-up or split screen!
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Video URL Input */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                placeholder="Paste video URL (YouTube watch/live/shorts, Vimeo, MP4 file...)"
                value={customUrlInput}
                onChange={(e) => {
                  setCustomUrlInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
              {customUrlInput && (
                <button
                  onClick={() => setCustomUrlInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Optional Title Input */}
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Video Title / Subject (optional)"
                value={customTitleInput}
                onChange={(e) => setCustomTitleInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
            </div>

            {/* Pomodoro Work/Break Interval */}
            <div className="md:col-span-3 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <input
                type="number"
                min="1"
                max="180"
                value={customWorkMin}
                onChange={(e) => setCustomWorkMin(Number(e.target.value) || 25)}
                className="w-12 px-1.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-center font-bold text-stone-900 dark:text-white"
                title="Work minutes"
              />
              <span>/</span>
              <input
                type="number"
                min="1"
                max="60"
                value={customBreakMin}
                onChange={(e) => setCustomBreakMin(Number(e.target.value) || 5)}
                className="w-12 px-1.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-center font-bold text-stone-900 dark:text-white"
                title="Break minutes"
              />
              <span className="text-[11px] font-medium text-stone-500">min</span>
            </div>
          </div>

          {inputError && <p className="text-xs text-rose-500 font-semibold">{inputError}</p>}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleProcessCustomLink('popup')}
                className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play in Floating Pop-Up</span>
              </button>

              <button
                onClick={() => handleProcessCustomLink('radar')}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Watch in Radar View</span>
              </button>
            </div>

            {/* Quick Sample Links */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 overflow-x-auto max-w-full">
              <span className="font-semibold shrink-0">Try link:</span>
              <button
                onClick={() => {
                  setCustomUrlInput('https://www.youtube.com/watch?v=jfKfPfyJRdk');
                  setCustomTitleInput('Lofi Girl Study Stream');
                }}
                className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700 transition-colors shrink-0"
              >
                Lofi Beats
              </button>
              <button
                onClick={() => {
                  setCustomUrlInput('https://www.youtube.com/watch?v=turb9FvXzM8');
                  setCustomTitleInput('James Scholz 12h Sprint');
                }}
                className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700 transition-colors shrink-0"
              >
                12h Sprint
              </button>
              <button
                onClick={() => {
                  setCustomUrlInput('https://www.youtube.com/watch?v=5qap5aO4i9A');
                  setCustomTitleInput('Tokyo Rain Library');
                }}
                className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-stone-800 hover:bg-white dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700 transition-colors shrink-0"
              >
                Rain Library
              </button>
            </div>
          </div>

          {/* Saved Video Links Shelf */}
          {savedLinks.length > 0 && (
            <div className="pt-3 border-t border-amber-200/60 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Recently Used Video Links ({savedLinks.length}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {savedLinks.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 shadow-xs group hover:border-amber-400 transition-all"
                  >
                    <div
                      onClick={() => handlePlaySavedLink(item, 'popup')}
                      className="min-w-0 cursor-pointer flex-1"
                      title={`Click to launch ${item.title} in floating pop-up`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-stone-900 dark:text-white truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {item.workMin}/{item.breakMin}m • {item.sourceType.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePlaySavedLink(item, 'popup')}
                        className="p-1 rounded-md bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950 text-stone-700 hover:text-amber-900 dark:text-stone-300 transition-colors"
                        title="Play in floating pop-up"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSavedLink(item.id, e)}
                        className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Delete from saved"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Radar Creator Carousel / List */}
      <div className="squircle-card p-6 bg-white dark:bg-[#18181b] border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">Study With Me Live Stream Radar</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Curated study channels with verified creators & automatic Pomodoro sync
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {creators.filter((c) => c.isLive).length} Verified Live Streamers
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs max-w-full">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            All Channels ({PRESET_POPULAR_STREAMS.length})
          </button>
          <button
            onClick={() => setCategoryFilter('silent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'silent'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Silent Sprints</span>
          </button>
          <button
            onClick={() => setCategoryFilter('music')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'music'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-purple-500" />
            <span>Lo-Fi & Beats</span>
          </button>
          <button
            onClick={() => setCategoryFilter('ambient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'ambient'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-500" />
            <span>Ambient & Rain</span>
          </button>
          <button
            onClick={() => setCategoryFilter('medical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'medical'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
            <span>Med / Intensive</span>
          </button>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-full">
          {filteredPresets.map((preset) => {
            const isSelected = selectedStream?.videoId === preset.videoId;
            const isSynced = syncedCreatorId === `preset_${preset.videoId}`;

            return (
              <div
                key={preset.videoId}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-2 ring-amber-200 dark:ring-amber-800'
                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="relative">
                    <img
                      src={preset.avatar}
                      alt={preset.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-stone-700 shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-stone-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">{preset.name}</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{preset.channelHandle}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-mono font-medium mt-1">
                      {preset.workMin}/{preset.breakMin}m Pomodoro
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mb-3 h-8">
                  {preset.title}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live 24/7
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPreset(preset);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold text-[10px] hover:bg-amber-400 hover:text-stone-950 transition-colors"
                      title="Play in floating pop-up"
                    >
                      Pop-Up
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync({
                          id: `preset_${preset.videoId}`,
                          name: preset.name,
                          channelTitle: preset.channelHandle,
                          avatar: preset.avatar,
                          subscribers: '1M+',
                          isLive: true,
                          videoId: preset.videoId,
                          currentSessionMode: preset.mode,
                          pomodoroWorkMin: preset.workMin,
                          pomodoroBreakMin: preset.breakMin,
                          isSubscribed: true,
                        });
                      }}
                      className={`px-2 py-0.5 rounded-lg font-semibold text-[10px] transition-colors ${
                        isSynced
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {isSynced ? '✓ Synced' : 'Sync'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-App Distraction-Free Streamer (Dual / Split View) */}
      <div
        ref={radarPlayerRef}
        className={`squircle-card p-6 bg-white dark:bg-[#18181b] border border-stone-200 dark:border-stone-800 overflow-hidden transition-all ${
          isTheaterMode ? 'shadow-2xl' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-stone-900 dark:text-amber-200 flex items-center justify-center font-bold">
              <Tv className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <span>{selectedStream ? selectedStream.streamTitle || selectedStream.name : 'Study Stream'}</span>
                {selectedStream?.isLive && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-200">
                    LIVE
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span>Distraction-free focus view</span>
                <span>•</span>
                <span>No comments or recommendation rabbit holes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pop out to floating widget button */}
            <button
              onClick={() => {
                onWatchStream?.(selectedStream);
                setAlertNotice(`Opened "${selectedStream.name}" in draggable floating player!`);
                setTimeout(() => setAlertNotice(null), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 hover:bg-amber-400 hover:text-stone-950 font-bold text-xs transition-colors shadow-xs"
              title="Pop out video into movable floating player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Floating Pop-Up</span>
            </button>

            <button
              onClick={() => handleSync(selectedStream)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Cycle ({selectedStream.pomodoroWorkMin}m/{selectedStream.pomodoroBreakMin}m)
            </button>

            <button
              onClick={() => {
                setStreamReloadKey((k) => k + 1);
                setAlertNotice('Stream player reloaded.');
                setTimeout(() => setAlertNotice(null), 2500);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
              title="Reload live player embed"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reload</span>
            </button>

            {/* Direct Open in Original Site */}
            <a
              href={
                selectedStream.videoUrl ||
                (isYouTube
                  ? `https://www.youtube.com/watch?v=${selectedStream.videoId}`
                  : isVimeo
                  ? `https://vimeo.com/${selectedStream.videoId}`
                  : selectedStream.directVideoUrl || '#')
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors"
              title="Open video in new tab"
            >
              <span>Open Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setIsTheaterMode((prev) => !prev)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs transition-colors hidden sm:inline-flex"
              title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSplitView((prev) => !prev)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs transition-colors"
              title={isSplitView ? 'Collapse player' : 'Expand player'}
            >
              {isSplitView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Audio helper notice */}
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              Player ready for instant deep work. You can unmute via player controls or pop out into the movable floating widget!
            </span>
          </div>
          <span className="font-mono text-[10px] text-stone-400 font-bold shrink-0">
            Source: {selectedStream.sourceType?.toUpperCase() || 'YOUTUBE'}
          </span>
        </div>

        {isSplitView && (
          <div
            className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 shadow-inner ${
              isTheaterMode ? 'max-h-[700px]' : ''
            }`}
          >
            {isDirectVideo ? (
              <video
                ref={videoElementRef}
                key={`${selectedStream.directVideoUrl || selectedStream.videoUrl}_${streamReloadKey}`}
                src={selectedStream.directVideoUrl || selectedStream.videoUrl}
                autoPlay
                loop
                playsInline
                controls
                muted
                className="w-full h-full object-cover"
              />
            ) : isVimeo ? (
              <iframe
                key={`${selectedStream.videoId}_${streamReloadKey}`}
                src={`https://player.vimeo.com/video/${selectedStream.videoId}?autoplay=1&muted=1`}
                title={selectedStream.name}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : isGenericEmbed ? (
              <iframe
                key={`${selectedStream.embedUrl || selectedStream.videoUrl}_${streamReloadKey}`}
                src={selectedStream.embedUrl || selectedStream.videoUrl}
                title={selectedStream.name}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            ) : (
              <iframe
                key={`${selectedStream.videoId}_${streamReloadKey}`}
                src={`https://www.youtube-nocookie.com/embed/${selectedStream.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`}
                title="Study Focus Stream"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
