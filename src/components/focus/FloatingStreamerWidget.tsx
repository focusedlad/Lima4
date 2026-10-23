import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Tv,
  ExternalLink,
  RefreshCw,
  Volume2,
  VolumeX,
  GripHorizontal,
  Link2,
  Play,
  Clock,
  Sparkles,
  History,
  Trash2,
  Check,
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

export type StreamerWidgetSize = 'pip' | 'compact' | 'standard' | 'large';

interface FloatingStreamerWidgetProps {
  stream: YouTubeCreator | null;
  isVisible: boolean;
  onClose: () => void;
  onSyncTimer: (stream: YouTubeCreator) => void;
  onOpenRadar?: () => void;
  isSynced?: boolean;
  onChangeVideo?: (stream: YouTubeCreator) => void;
  onSetAsBackground?: (stream: YouTubeCreator) => void;
}

export const FloatingStreamerWidget: React.FC<FloatingStreamerWidgetProps> = ({
  stream,
  isVisible,
  onClose,
  onSyncTimer,
  onOpenRadar,
  isSynced,
  onChangeVideo,
  onSetAsBackground,
}) => {
  const [size, setSize] = useState<StreamerWidgetSize>('compact');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Link Drawer State
  const [isLinkDrawerOpen, setIsLinkDrawerOpen] = useState<boolean>(false);
  const [pastedUrl, setPastedUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [workMin, setWorkMin] = useState<number>(50);
  const [breakMin, setBreakMin] = useState<number>(10);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [recentLinks, setRecentLinks] = useState<SavedVideoLink[]>(() => getSavedVideoLinks());

  // Position state (null = calculate initial default)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);

  // Width is responsive, while the user can still choose compact, standard or large.
  const getWidgetWidth = useCallback((s: StreamerWidgetSize) => {
    if (s === 'pip') return 240;
    if (s === 'compact') return 260;
    if (s === 'standard') return 360;
    return 520;
  }, []);

  // Initialize position on first visible render
  useEffect(() => {
    if (isVisible && position === null && typeof window !== 'undefined') {
      const w = getWidgetWidth(size);
      const initialX = Math.max(16, window.innerWidth - w - 20);
      const initialY = 76;
      setPosition({ x: initialX, y: initialY });
    }
  }, [isVisible, position, size, getWidgetWidth]);

  // Handle window resize boundary clamping
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const w = getWidgetWidth(size);
        const maxX = Math.max(8, window.innerWidth - w - 8);
        const maxY = Math.max(8, window.innerHeight - 80);
        return {
          x: Math.min(Math.max(8, prev.x), maxX),
          y: Math.min(Math.max(8, prev.y), maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, getWidgetWidth]);

  // Change YouTube mute state without remounting the iframe (which restarts playback).
  useEffect(() => {
    if (videoElementRef.current) videoElementRef.current.muted = isMuted;
    const player = youtubeIframeRef.current?.contentWindow;
    if (player && stream && !stream.directVideoUrl && stream.sourceType !== 'direct' && stream.sourceType !== 'vimeo' && stream.sourceType !== 'embed') {
      player.postMessage(JSON.stringify({ event: 'command', func: isMuted ? 'mute' : 'unMute', args: [] }), '*');
    }
  }, [isMuted, stream]);

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;

    e.preventDefault();
    const currentX = position?.x ?? (window.innerWidth - getWidgetWidth(size) - 20);
    const currentY = position?.y ?? 76;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };
    setIsDragging(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragRef.current) return;
    e.preventDefault();

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const w = getWidgetWidth(size);
    const widgetH = widgetRef.current ? widgetRef.current.offsetHeight : 200;

    const rawX = dragRef.current.initialX + deltaX;
    const rawY = dragRef.current.initialY + deltaY;

    // Constrain within screen bounds
    const clampedX = Math.max(8, Math.min(window.innerWidth - w - 8, rawX));
    const clampedY = Math.max(8, Math.min(window.innerHeight - widgetH - 8, rawY));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Cycle sizes: pip -> compact -> standard -> large -> compact
  const handleNextSize = () => {
    setSize((current) => {
      if (current === 'pip') return 'compact';
      if (current === 'compact') return 'standard';
      if (current === 'standard') return 'large';
      return 'compact';
    });
  };

  // Load custom video link
  const handlePlayPastedLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError(null);

    const parsed = parseAnyVideoUrl(pastedUrl, customTitle);
    if (!parsed) {
      setUrlError('Please enter a valid video link (YouTube, Vimeo, MP4 file, etc.)');
      return;
    }

    const newCreator = createCreatorFromVideo(parsed, {
      customTitle,
      workMin,
      breakMin,
    });

    // Save to recent list
    const updated = saveVideoLink({
      url: parsed.originalUrl,
      title: newCreator.name,
      sourceType: parsed.sourceType,
      workMin,
      breakMin,
    });
    setRecentLinks(updated);

    // Update parent
    if (onChangeVideo) {
      onChangeVideo(newCreator);
    } else {
      onSyncTimer(newCreator);
    }

    setPastedUrl('');
    setCustomTitle('');
    setIsLinkDrawerOpen(false);
    setReloadKey((k) => k + 1);
  };

  const handlePlayRecent = (item: SavedVideoLink) => {
    const parsed = parseAnyVideoUrl(item.url, item.title);
    if (!parsed) return;

    const newCreator = createCreatorFromVideo(parsed, {
      customTitle: item.title,
      workMin: item.workMin,
      breakMin: item.breakMin,
    });

    if (onChangeVideo) {
      onChangeVideo(newCreator);
    } else {
      onSyncTimer(newCreator);
    }
    setIsLinkDrawerOpen(false);
    setReloadKey((k) => k + 1);
  };

  const handleDeleteRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeSavedVideoLink(id);
    setRecentLinks(updated);
  };

  if (!isVisible || !stream) return null;

  const currentWidth = getWidgetWidth(size);

  // Determine embed source or render method
  const isDirectVideo = stream.sourceType === 'direct' || Boolean(stream.directVideoUrl);
  const isVimeo = stream.sourceType === 'vimeo';
  const isGenericEmbed = stream.sourceType === 'embed';
  const isYouTube = !isDirectVideo && !isVimeo && !isGenericEmbed;

  // Compute external link target
  const externalLinkUrl =
    stream.videoUrl ||
    (isYouTube
      ? `https://www.youtube.com/watch?v=${stream.videoId}`
      : isVimeo
      ? `https://vimeo.com/${stream.videoId}`
      : stream.directVideoUrl || '#');

  return (
    <div
      ref={widgetRef}
      className={`fixed z-50 pointer-events-auto select-none transition-shadow ${
        isDragging ? 'cursor-grabbing opacity-95 shadow-2xl scale-[1.01]' : 'transition-[width] duration-200'
      }`}
      style={{
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        right: position ? undefined : '16px',
        width: `min(${currentWidth}px, calc(100vw - 16px))`,
        maxWidth: 'calc(100vw - 16px)',
      }}
    >
      <div className="bg-stone-900/95 dark:bg-stone-950/95 text-white rounded-[24px] border border-stone-700/80 dark:border-stone-800 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.55)] backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
        {/* Draggable Header Bar */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="px-3 py-2 bg-stone-950/90 border-b border-stone-800/80 flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing hover:bg-stone-900 transition-colors"
          title="Click and drag anywhere on this bar to move video around screen"
        >
          {/* Left: Drag grip indicator + Video title */}
          <div className="flex items-center gap-1.5 min-w-0">
            <GripHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[95px] sm:max-w-[125px]">
              {stream.name || 'Video'}
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Set as Focus Background Button */}
            {onSetAsBackground && stream && (
              <button
                onClick={() => {
                  onSetAsBackground(stream);
                  onClose();
                }}
                className="px-1.5 py-0.5 rounded-md bg-pink-950/80 hover:bg-pink-900 border border-pink-700/60 text-pink-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Play this video as the Full-Screen Focus Background in your study screen"
              >
                <Maximize2 className="w-2.5 h-2.5 text-pink-400" />
                <span className="hidden sm:inline">Set BG</span>
              </button>
            )}

            {/* Inline Link / Change Video Button */}
            <button
              onClick={() => setIsLinkDrawerOpen((prev) => !prev)}
              className={`p-1 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold ${
                isLinkDrawerOpen
                  ? 'bg-pink-500 text-white'
                  : 'text-pink-400 hover:text-pink-300 hover:bg-stone-800'
              }`}
              title="Paste any video link (YouTube, Vimeo, MP4...)"
              aria-label="Paste video link"
            >
              <Link2 className="w-3 h-3" />
              <span className="hidden sm:inline">Link</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={isMuted ? 'Unmute video' : 'Mute video'}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 text-stone-400" />
              ) : (
                <Volume2 className="w-3 h-3 text-pink-400" />
              )}
            </button>

            {/* Reload stream/video if stalled */}
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Reload video"
              aria-label="Reload video"
            >
              <RefreshCw className="w-3 h-3" />
            </button>

            {/* Size Switcher button */}
            <button
              onClick={handleNextSize}
              className="px-1.5 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono font-bold flex items-center gap-0.5 transition-colors"
              title={`Current size: ${size}. Click to toggle size (Compact / Standard / Large / Mini Pill)`}
            >
              {size === 'pip' ? 'Pill' : size === 'compact' ? 'S' : size === 'standard' ? 'M' : 'L'}
            </button>

            {/* Mini/PiP Toggle */}
            <button
              onClick={() => setSize((s) => (s === 'pip' ? 'compact' : 'pip'))}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={size === 'pip' ? 'Show video' : 'Mini audio pill mode'}
              aria-label="Toggle mini pill"
            >
              {size === 'pip' ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>

            {/* Close */}
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

        {/* Inline Paste Video Drawer */}
        {isLinkDrawerOpen && (
          <div className="p-3 bg-stone-900 border-b border-stone-800 text-xs animate-fade-in space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Play Any Video Link
              </span>
              <button
                onClick={() => setIsLinkDrawerOpen(false)}
                className="text-stone-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <form onSubmit={handlePlayPastedLink} className="space-y-2">
              <div>
                <input
                  type="text"
                  placeholder="Paste YouTube, Vimeo, or MP4 URL..."
                  value={pastedUrl}
                  onChange={(e) => {
                    setPastedUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  placeholder="Title (opt)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="col-span-1 px-2 py-1 rounded-lg bg-stone-950 border border-stone-700 text-[10px] text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <div className="col-span-2 flex items-center gap-1 text-[10px] text-stone-400">
                  <Clock className="w-3 h-3 shrink-0" />
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={workMin}
                    onChange={(e) => setWorkMin(Number(e.target.value) || 25)}
                    className="w-10 px-1 py-0.5 rounded bg-stone-950 border border-stone-700 text-center text-white"
                    title="Work minutes"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakMin}
                    onChange={(e) => setBreakMin(Number(e.target.value) || 5)}
                    className="w-10 px-1 py-0.5 rounded bg-stone-950 border border-stone-700 text-center text-white"
                    title="Break minutes"
                  />
                  <span>min</span>
                </div>
              </div>

              {urlError && <p className="text-[10px] text-rose-400">{urlError}</p>}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="submit"
                  className="py-1.5 px-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Movable Pop-Up</span>
                </button>

                {onSetAsBackground && (
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseAnyVideoUrl(pastedUrl, customTitle);
                      if (!parsed) {
                        setUrlError('Please enter a valid video link');
                        return;
                      }
                      const newCreator = createCreatorFromVideo(parsed, { customTitle, workMin, breakMin });
                      onSetAsBackground(newCreator);
                      setPastedUrl('');
                      setCustomTitle('');
                      setIsLinkDrawerOpen(false);
                      onClose();
                    }}
                    className="py-1.5 px-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Focus Background</span>
                  </button>
                )}
              </div>
            </form>

            {/* Quick Recent Links */}
            {recentLinks.length > 0 && (
              <div className="pt-2 border-t border-stone-800 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-stone-400 font-semibold">
                  <History className="w-2.5 h-2.5" />
                  <span>Recent Links:</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {recentLinks.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handlePlayRecent(item)}
                      className="group flex items-center justify-between px-2 py-1 rounded-lg bg-stone-950/60 hover:bg-stone-800 cursor-pointer transition-colors text-[10px]"
                    >
                      <span className="truncate text-stone-300 group-hover:text-amber-300 max-w-[170px]">
                        {item.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteRecent(item.id, e)}
                        className="text-stone-500 hover:text-rose-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove link"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Player Embed Area (hidden in PiP Audio Pill mode) */}
        {size !== 'pip' && (
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {isDirectVideo ? (
              <video
                ref={videoElementRef}
                key={`${stream.directVideoUrl || stream.videoUrl}_${reloadKey}`}
                src={stream.directVideoUrl || stream.videoUrl}
                autoPlay
                loop
                playsInline
                controls
                muted={isMuted}
                className="w-full h-full object-cover"
              />
            ) : isVimeo ? (
              <iframe
                key={`${stream.videoId}_${reloadKey}_${isMuted}`}
                src={`https://player.vimeo.com/video/${stream.videoId}?autoplay=1&muted=${isMuted ? '1' : '0'}`}
                title={stream.name}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : isGenericEmbed ? (
              <iframe
                key={`${stream.embedUrl || stream.videoUrl}_${reloadKey}`}
                src={stream.embedUrl || stream.videoUrl}
                title={stream.name}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            ) : (
              /* YouTube standard/shorts/live */
              <iframe
                ref={youtubeIframeRef}
                key={`${stream.videoId}_${reloadKey}`}
                src={`https://www.youtube-nocookie.com/embed/${stream.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                title="Focus Video Mini-Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        )}

        {/* Bottom Quick Action Bar */}
        <div className="px-2.5 py-1.5 bg-stone-900/90 flex items-center justify-between text-[11px] gap-2 border-t border-stone-800/80">
          <button
            onClick={() => onSyncTimer(stream)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold transition-all text-[10px] ${
              isSynced
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
            title="Sync focus timer intervals with this video"
          >
            {isSynced ? <Check className="w-3 h-3 text-emerald-400" /> : <Tv className="w-3 h-3 text-amber-400" />}
            <span>{isSynced ? 'Synced' : `${stream.pomodoroWorkMin}/${stream.pomodoroBreakMin}m`}</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px]">
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
              href={externalLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-stone-400 hover:text-amber-400 transition-colors"
              title="Open video in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
