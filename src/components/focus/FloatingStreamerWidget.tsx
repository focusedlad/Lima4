import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  Tv,
  ExternalLink,
  RefreshCw,
  Radio,
  Check,
  Volume2,
  VolumeX,
  GripHorizontal,
  Expand,
  Shrink,
} from 'lucide-react';
import { YouTubeCreator } from '../../types';

export type StreamerWidgetSize = 'pip' | 'compact' | 'standard' | 'large';

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
  const [size, setSize] = useState<StreamerWidgetSize>('compact');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Position state (null = calculate initial default)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Width in pixels based on size mode
  const getWidgetWidth = useCallback((s: StreamerWidgetSize) => {
    if (s === 'pip') return 240;
    if (s === 'compact') return 220;
    if (s === 'standard') return 310;
    return 400; // large
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

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with left click or primary touch, and don't trigger if clicked on a button
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

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

  if (!isVisible || !stream) return null;

  const currentWidth = getWidgetWidth(size);

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
        width: `${currentWidth}px`,
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
          {/* Left: Drag grip indicator + Creator name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <GripHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[130px]">
              {stream.name}
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={isMuted ? 'Unmute stream' : 'Mute stream'}
              aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 text-stone-400" />
              ) : (
                <Volume2 className="w-3 h-3 text-emerald-400" />
              )}
            </button>

            {/* Reload stream if stalled */}
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Reload stream"
              aria-label="Reload stream"
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

        {/* Video Player Embed Area (hidden in PiP Audio Pill mode) */}
        {size !== 'pip' && (
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
        <div className="px-2.5 py-1.5 bg-stone-900/90 flex items-center justify-between text-[11px] gap-2 border-t border-stone-800/80">
          <button
            onClick={() => onSyncTimer(stream)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold transition-all text-[10px] ${
              isSynced
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
            title="Sync focus timer intervals with this stream"
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
              href={`https://www.youtube.com/watch?v=${stream.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-stone-400 hover:text-rose-400 transition-colors"
              title="Pop out to YouTube tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
