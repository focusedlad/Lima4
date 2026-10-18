import React, { useState } from 'react';
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
} from 'lucide-react';
import { YouTubeCreator } from '../../types';

interface YouTubeLiveRadarProps {
  creators: YouTubeCreator[];
  onToggleSubscribe: (creatorId: string) => void;
  onSyncWithCreator: (creator: YouTubeCreator) => void;
  syncedCreatorId?: string | null;
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
    title: '🔴 lofi hip hop radio - beats to relax/study to [Live 24/7]',
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
    title: '⚡ 12-Hour Silent Study Sprint With Me [50-10 Pomodoro]',
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
    title: '🩺 10-Hour Med School Study With Me (50/10 Pomodoro + Rain)',
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
    title: '☕ Chillhop Radio - jazzy & lofi study beats to focus',
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
    title: '📚 4-Hour Silent Pomodoro Study With Me (Desk Timer + Lo-Fi)',
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
    title: '🌧️ Tokyo Evening Rain & Quiet Library Ambience',
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
    title: '🧠 10-Hour Intensive Board Exam Sprint (Silent Real-Time Study)',
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
    title: '☕ Cozy Coffee Shop Ambience & Soft Piano Study',
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
}) => {
  const [selectedStream, setSelectedStream] = useState<YouTubeCreator>(creators[0]);
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [customVideoId, setCustomVideoId] = useState<string>('');
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [streamReloadKey, setStreamReloadKey] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'silent' | 'music' | 'ambient' | 'medical'>('all');

  const handleSelectStream = (creator: YouTubeCreator) => {
    setSelectedStream(creator);
    setAlertNotice(`Loaded stream: ${creator.name}`);
    setTimeout(() => setAlertNotice(null), 3000);
  };

  const handleSelectPreset = (preset: typeof PRESET_POPULAR_STREAMS[0]) => {
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
    };
    setSelectedStream(updated);
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

  const parseYoutubeInput = (input: string): string => {
    let clean = input.trim();
    if (clean.includes('watch?v=')) {
      clean = clean.split('watch?v=')[1]?.split('&')[0];
    } else if (clean.includes('youtu.be/')) {
      clean = clean.split('youtu.be/')[1]?.split('?')[0];
    } else if (clean.includes('/live/')) {
      clean = clean.split('/live/')[1]?.split('?')[0];
    } else if (clean.includes('/embed/')) {
      clean = clean.split('/embed/')[1]?.split('?')[0];
    }
    return clean;
  };

  const filteredPresets =
    categoryFilter === 'all'
      ? PRESET_POPULAR_STREAMS
      : PRESET_POPULAR_STREAMS.filter((p) => p.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Toast Alert Notice */}
      {alertNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{alertNotice}</span>
          <button onClick={() => setAlertNotice(null)} className="text-amber-700 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Live Radar Creator Carousel / List */}
      <div className="squircle-card p-6 bg-white border border-stone-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Study With Me Live Stream Radar</h2>
              <p className="text-xs text-stone-500">Live study broadcasts with verified players & automatic Pomodoro sync</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {creators.filter((c) => c.isLive).length} Verified Live Streamers
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Streamers ({PRESET_POPULAR_STREAMS.length})
          </button>
          <button
            onClick={() => setCategoryFilter('silent')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'silent'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            ⚡ Silent Study Sprints
          </button>
          <button
            onClick={() => setCategoryFilter('medical')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'medical'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🩺 Med School & Board Prep
          </button>
          <button
            onClick={() => setCategoryFilter('music')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'music'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🎧 Lofi & Chillhop Radio
          </button>
          <button
            onClick={() => setCategoryFilter('ambient')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
              categoryFilter === 'ambient'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🌧️ Rain & Library Ambience
          </button>
        </div>

        {/* Popular Streams Quick Switcher Bar */}
        <div className="mb-4 pt-1 pb-2 border-b border-stone-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
            Click to Launch Streamer in Player:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {filteredPresets.map((p) => {
              const isActive = selectedStream?.videoId === p.videoId;
              return (
                <button
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-100 text-rose-950 border border-rose-300 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5 text-rose-600" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {creators.map((creator) => {
            const isSelected = selectedStream?.id === creator.id || selectedStream?.videoId === creator.videoId;
            const isSynced = syncedCreatorId === creator.id;

            return (
              <div
                key={creator.id}
                onClick={() => handleSelectStream(creator)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-50 border-stone-400 shadow-xs ring-1 ring-stone-300'
                    : 'bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="relative">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      {creator.isLive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSub(creator);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        creator.isSubscribed
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                      }`}
                      title={creator.isSubscribed ? 'WebSub Alerts active' : 'Turn on WebSub live alert'}
                    >
                      {creator.isSubscribed ? <Bell className="w-3.5 h-3.5 text-amber-700" /> : <BellOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900 truncate">{creator.name}</h3>
                  <p className="text-[11px] text-stone-500 mb-2 truncate">{creator.currentSessionMode}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  {creator.isLive ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Users className="w-3 h-3" />
                      {creator.liveViewers?.toLocaleString()} watching
                    </span>
                  ) : (
                    <span className="text-stone-400">Offline / Scheduled</span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSync(creator);
                    }}
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors ${
                      isSynced
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {isSynced ? '✓ Synced' : 'Sync Timer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-App Distraction-Free Streamer (Dual / Split View) */}
      <div className={`squircle-card p-6 bg-white border border-stone-200 overflow-hidden transition-all ${isTheaterMode ? 'shadow-2xl' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-stone-900 flex items-center justify-center font-bold">
              <Tv className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>{selectedStream ? selectedStream.streamTitle || selectedStream.name : 'Study Stream'}</span>
                {selectedStream?.isLive && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-200">
                    LIVE
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Distraction-free focus view</span>
                <span>•</span>
                <span>No comments or recommendation rabbit holes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSync(selectedStream)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              title="Reload live player embed"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reload</span>
            </button>

            {/* Direct Open in YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${selectedStream.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors"
              title="Open full stream on YouTube in new tab"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setIsTheaterMode((prev) => !prev)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors hidden sm:inline-flex"
              title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSplitView((prev) => !prev)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors"
              title={isSplitView ? 'Collapse player' : 'Expand player'}
            >
              {isSplitView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Audio helper notice */}
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              Stream starts muted for instant deep work. Unmute via the YouTube player, or layer with Ambiance beats above!
            </span>
          </div>
          <span className="font-mono text-[10px] text-stone-400 font-bold shrink-0">Stream ID: {selectedStream.videoId}</span>
        </div>

        {isSplitView && (
          <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 shadow-inner ${isTheaterMode ? 'max-h-[700px]' : ''}`}>
            <iframe
              key={`${selectedStream.videoId}_${streamReloadKey}`}
              src={`https://www.youtube-nocookie.com/embed/${selectedStream.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`}
              title="Study With Me Focus Stream"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Custom Stream Input */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-stone-500">Paste any YouTube study stream, lofi broadcast or URL:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. jfKfPfyJRdk or youtube.com/watch?v=..."
              value={customVideoId}
              onChange={(e) => setCustomVideoId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 w-full sm:w-72"
            />
            <button
              onClick={() => {
                if (customVideoId) {
                  const vid = parseYoutubeInput(customVideoId) || 'jfKfPfyJRdk';
                  setSelectedStream({
                    id: 'custom_' + Date.now(),
                    name: 'Custom Live Stream',
                    channelTitle: 'Custom Streamer',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    subscribers: '100K',
                    isLive: true,
                    streamTitle: 'Custom Study Session',
                    videoId: vid,
                    currentSessionMode: '50m Deep Work / 10m Break',
                    pomodoroWorkMin: 50,
                    pomodoroBreakMin: 10,
                    isSubscribed: false,
                  });
                  setAlertNotice(`Loaded custom video stream ID: ${vid}`);
                  setCustomVideoId('');
                  setTimeout(() => setAlertNotice(null), 3500);
                }
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 shrink-0 shadow-xs"
            >
              Load Stream
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
