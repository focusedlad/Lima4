import React, { useState } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Tv,
  ExternalLink,
  RefreshCw,
  Radio,
  Check,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { YouTubeCreator } from '../../types';

interface FloatingStreamerWidgetProps {
  stream: YouTubeCreator | null;
  isVisible: boolean;
  onClose: () => void;
  onSyncTimer: (stream: YouTubeCreator) => void;
  onOpenRadar?: () => void;
  isSynced?: boolean;
}

export const FloatingStreamerWidget: React.FC<FloatingStreamerWidgetProps> = ({
  stream,
  isVisible,
  onClose,
  onSyncTimer,
  onOpenRadar,
  isSynced,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  if (!isVisible || !stream) return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 pointer-events-auto ${
        isMinimized
          ? 'top-16 sm:top-20 right-2 sm:right-6 w-auto'
          : 'top-16 sm:top-20 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-80 max-w-[340px]'
      }`}
      style={{
        top: 'max(env(safe-area-inset-top, 16px) + 54px, 68px)',
      }}
    >
      <div className="bg-stone-900/95 dark:bg-stone-950/95 text-white rounded-2xl border border-stone-700/80 dark:border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
        {/* Top Header Bar */}
        <div className="px-3 py-2 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{stream.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isMinimized && (
              <button
                onClick={() => setIsMuted((m) => !m)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title={isMuted ? 'Unmute stream' : 'Mute stream'}
                aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            )}
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Reload video stream"
              aria-label="Reload stream"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={isMinimized ? 'Expand mini-player' : 'Minimize mini-player'}
              aria-label="Toggle player size"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
              title="Close floating player"
              aria-label="Close floating stream"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video Player Embed Area */}
        {!isMinimized && (
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            <iframe
              key={`${stream.videoId}_${reloadKey}_${isMuted}`}
              src={`https://www.youtube-nocookie.com/embed/${stream.videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=1&modestbranding=1&rel=0&enablejsapi=1`}
              title="Focus Stream Mini-Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Bottom Quick Action Bar */}
        <div className="px-3 py-2 bg-stone-900/90 flex items-center justify-between text-[11px] gap-2 border-t border-stone-800/80">
          <button
            onClick={() => onSyncTimer(stream)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              isSynced
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
            title="Sync focus timer intervals with this stream"
          >
            {isSynced ? <Check className="w-3 h-3 text-emerald-400" /> : <Tv className="w-3 h-3 text-amber-400" />}
            <span>{isSynced ? 'Synced' : `Sync ${stream.pomodoroWorkMin}/${stream.pomodoroBreakMin}m`}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {onOpenRadar && (
              <button
                onClick={onOpenRadar}
                className="text-stone-400 hover:text-white transition-colors"
                title="Open full stream radar"
              >
                Channels
              </button>
            )}
            <a
              href={`https://www.youtube.com/watch?v=${stream.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-stone-400 hover:text-rose-400 transition-colors"
              title="Pop out to YouTube tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
