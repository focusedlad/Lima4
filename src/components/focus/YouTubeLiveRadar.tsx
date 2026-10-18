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
} from 'lucide-react';
import { YouTubeCreator } from '../../types';

interface YouTubeLiveRadarProps {
  creators: YouTubeCreator[];
  onToggleSubscribe: (creatorId: string) => void;
  onSyncWithCreator: (creator: YouTubeCreator) => void;
  syncedCreatorId?: string | null;
}

export const YouTubeLiveRadar: React.FC<YouTubeLiveRadarProps> = ({
  creators,
  onToggleSubscribe,
  onSyncWithCreator,
  syncedCreatorId,
}) => {
  const [selectedStream, setSelectedStream] = useState<YouTubeCreator>(creators[0]);
  const [isSplitView, setIsSplitView] = useState<boolean>(true);
  const [customVideoId, setCustomVideoId] = useState<string>('');
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const handleSelectStream = (creator: YouTubeCreator) => {
    setSelectedStream(creator);
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

  return (
    <div className="space-y-6">
      {/* Toast Alert Notice */}
      {alertNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <span>{alertNotice}</span>
          <button onClick={() => setAlertNotice(null)} className="text-amber-700 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Live Radar Creator Carousel / List */}
      <div className="squircle-card p-6 bg-white border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Study With Me Creator Radar</h2>
              <p className="text-xs text-stone-500">Live streams & WebSub automatic Pomodoro sync</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {creators.filter((c) => c.isLive).length} Live Now
          </span>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {creators.map((creator) => {
            const isSelected = selectedStream?.id === creator.id;
            const isSynced = syncedCreatorId === creator.id;

            return (
              <div
                key={creator.id}
                onClick={() => handleSelectStream(creator)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-50 border-stone-400 shadow-sm'
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
                      title={creator.isSubscribed ? 'Alerts active' : 'Turn on WebSub live alert'}
                    >
                      {creator.isSubscribed ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
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
      <div className="squircle-card p-6 bg-white border border-stone-200 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-stone-700" />
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                {selectedStream ? selectedStream.streamTitle || selectedStream.name : 'Study Stream'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Distraction-free focus view</span>
                <span>•</span>
                <span>No comments or recommended algorithm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSync(selectedStream)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Pomodoro ({selectedStream.pomodoroWorkMin}m/{selectedStream.pomodoroBreakMin}m)
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

        {isSplitView && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 shadow-inner">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedStream.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
              title="Study With Me Focus Stream"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Custom Stream Input */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-stone-500">Paste any YouTube study stream or lofi link:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. jfKfPfyJRdk or YouTube URL"
              value={customVideoId}
              onChange={(e) => setCustomVideoId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 w-full sm:w-60"
            />
            <button
              onClick={() => {
                if (customVideoId) {
                  let vid = customVideoId;
                  if (vid.includes('v=')) {
                    vid = vid.split('v=')[1]?.split('&')[0];
                  } else if (vid.includes('youtu.be/')) {
                    vid = vid.split('youtu.be/')[1]?.split('?')[0];
                  }
                  setSelectedStream({
                    id: 'custom_' + Date.now(),
                    name: 'Custom Live Stream',
                    channelTitle: 'Custom Streamer',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    subscribers: '100K',
                    isLive: true,
                    streamTitle: 'Custom Study Session',
                    videoId: vid || 'jfKfPfyJRdk',
                    currentSessionMode: '50m Deep Work / 10m Break',
                    pomodoroWorkMin: 50,
                    pomodoroBreakMin: 10,
                    isSubscribed: false,
                  });
                  setCustomVideoId('');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 shrink-0"
            >
              Load Stream
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
