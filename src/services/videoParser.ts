import { YouTubeCreator, VideoSourceType } from '../types';

export interface ParsedVideoResult {
  sourceType: VideoSourceType;
  videoId: string;
  embedUrl?: string;
  directVideoUrl?: string;
  originalUrl: string;
  titleSuggestion: string;
}

export interface SavedVideoLink {
  id: string;
  url: string;
  title: string;
  sourceType: VideoSourceType;
  workMin: number;
  breakMin: number;
  addedAt: string;
}

const STORAGE_KEY_RECENT_VIDEOS = 'lumina_recent_custom_videos';

/**
 * Parses any video URL (YouTube, Vimeo, direct MP4/WebM, or generic web embed)
 */
export function parseAnyVideoUrl(input: string, customTitle?: string): ParsedVideoResult | null {
  if (!input) return null;
  const clean = input.trim();
  if (!clean) return null;

  // 1. YouTube checks:
  // Standard: https://www.youtube.com/watch?v=VIDEO_ID
  // Short: https://youtu.be/VIDEO_ID
  // Live: https://www.youtube.com/live/VIDEO_ID
  // Shorts: https://www.youtube.com/shorts/VIDEO_ID
  // Embed: https://www.youtube.com/embed/VIDEO_ID
  // Music: https://music.youtube.com/watch?v=VIDEO_ID

  const ytWatchMatch = clean.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|live\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    const videoId = ytWatchMatch[1];
    return {
      sourceType: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`,
      originalUrl: clean,
      titleSuggestion: customTitle?.trim() || `YouTube Video (${videoId})`,
    };
  }

  // Raw 11-char YouTube ID alone
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return {
      sourceType: 'youtube',
      videoId: clean,
      embedUrl: `https://www.youtube-nocookie.com/embed/${clean}?autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1`,
      originalUrl: `https://www.youtube.com/watch?v=${clean}`,
      titleSuggestion: customTitle?.trim() || `YouTube Video (${clean})`,
    };
  }

  // 2. Vimeo checks:
  // https://vimeo.com/123456789
  // https://player.vimeo.com/video/123456789
  const vimeoMatch = clean.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      sourceType: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      originalUrl: clean,
      titleSuggestion: customTitle?.trim() || `Vimeo Video (${vimeoId})`,
    };
  }

  // 3. Direct HTML5 video file (.mp4, .webm, .ogg, .mov, .m4v):
  const cleanNoQuery = clean.split('?')[0].toLowerCase();
  if (
    cleanNoQuery.endsWith('.mp4') ||
    cleanNoQuery.endsWith('.webm') ||
    cleanNoQuery.endsWith('.ogg') ||
    cleanNoQuery.endsWith('.mov') ||
    cleanNoQuery.endsWith('.m4v') ||
    clean.includes('.mp4?') ||
    clean.includes('.webm?')
  ) {
    const filename = cleanNoQuery.split('/').pop() || 'Video File';
    return {
      sourceType: 'direct',
      videoId: `direct_${Date.now()}`,
      directVideoUrl: clean,
      originalUrl: clean,
      titleSuggestion: customTitle?.trim() || filename.replace(/[-_]/g, ' '),
    };
  }

  // 4. Generic Web Video URL (valid http/https protocol)
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    // If it contains "embed", it can be framed directly
    let domain = 'Web Video';
    try {
      const u = new URL(clean);
      domain = u.hostname.replace('www.', '');
    } catch (_) {}

    return {
      sourceType: 'embed',
      videoId: `embed_${Date.now()}`,
      embedUrl: clean,
      originalUrl: clean,
      titleSuggestion: customTitle?.trim() || `${domain} Video`,
    };
  }

  return null;
}

/**
 * Creates a complete, playable YouTubeCreator object from any parsed URL
 */
export function createCreatorFromVideo(
  parsed: ParsedVideoResult,
  options?: {
    customTitle?: string;
    workMin?: number;
    breakMin?: number;
    category?: string;
  }
): YouTubeCreator {
  const workMin = options?.workMin ?? 50;
  const breakMin = options?.breakMin ?? 10;
  const title = options?.customTitle?.trim() || parsed.titleSuggestion;

  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: title,
    channelTitle: parsed.sourceType === 'youtube' ? 'YouTube Stream' : parsed.sourceType === 'vimeo' ? 'Vimeo' : 'Custom Media',
    avatar:
      parsed.sourceType === 'youtube'
        ? `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
    subscribers: 'Custom Link',
    isLive: false,
    streamTitle: title,
    videoId: parsed.videoId,
    currentSessionMode: `${workMin}m Focus / ${breakMin}m Break`,
    pomodoroWorkMin: workMin,
    pomodoroBreakMin: breakMin,
    isSubscribed: false,
    // Custom video specific flags:
    sourceType: parsed.sourceType,
    videoUrl: parsed.originalUrl,
    directVideoUrl: parsed.directVideoUrl,
    embedUrl: parsed.embedUrl,
    isCustomUrl: true,
  };
}

/**
 * LocalStorage helpers for saved / recent custom video links
 */
export function getSavedVideoLinks(): SavedVideoLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_VIDEOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export function saveVideoLink(link: Omit<SavedVideoLink, 'id' | 'addedAt'>): SavedVideoLink[] {
  try {
    const current = getSavedVideoLinks().filter((l) => l.url.trim().toLowerCase() !== link.url.trim().toLowerCase());
    const newEntry: SavedVideoLink = {
      ...link,
      id: `vid_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 15);
    localStorage.setItem(STORAGE_KEY_RECENT_VIDEOS, JSON.stringify(updated));
    return updated;
  } catch (_) {
    return [];
  }
}

export function removeSavedVideoLink(id: string): SavedVideoLink[] {
  try {
    const current = getSavedVideoLinks().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY_RECENT_VIDEOS, JSON.stringify(current));
    return current;
  } catch (_) {
    return [];
  }
}
