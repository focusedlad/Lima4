import { getAuthenticatedSupabaseUser } from '../../src/lib/supabase-request-auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthenticatedSupabaseUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in with your email account to check followed YouTube channels.' });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'YouTube live discovery is not configured yet. Add YOUTUBE_API_KEY to the server environment.',
      code: 'YOUTUBE_API_KEY_MISSING',
    });
  }

  const raw = typeof req.query?.channel === 'string' ? req.query.channel.trim() : '';
  if (!raw || raw.length > 300) {
    return res.status(400).json({ error: 'Provide a YouTube channel URL, @handle, or channel ID.' });
  }

  const getJson = async (url: URL) => {
    const response = await fetch(url.toString());
    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message || 'YouTube API request failed.';
      const error = new Error(message) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return payload;
  };

  try {
    const urlLike = /^https?:\/\//i.test(raw) ? new URL(raw) : null;
    const host = urlLike?.hostname.replace(/^www\./, '').toLowerCase();
    if (urlLike && !['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host || '') && !['youtu.be'].includes(host || '')) {
      return res.status(400).json({ error: 'That link does not look like a YouTube channel URL.' });
    }

    let channelId = '';
    let channelTitle = raw;
    let channelThumbnail = '';

    const channelIdMatch = raw.match(/UC[a-zA-Z0-9_-]{20,}/);
    const handleMatch = raw.match(/(?:^|\/)@([a-zA-Z0-9._-]+)/);
    const legacyUserMatch = raw.match(/youtube\.com\/(?:user|c)\/([a-zA-Z0-9._-]+)/i);

    let channelLookup = new URL('https://www.googleapis.com/youtube/v3/channels');
    channelLookup.searchParams.set('part', 'id,snippet');
    channelLookup.searchParams.set('key', apiKey);
    if (channelIdMatch) {
      channelLookup.searchParams.set('id', channelIdMatch[0]);
    } else if (handleMatch) {
      channelLookup.searchParams.set('forHandle', handleMatch[1]);
    } else if (legacyUserMatch) {
      const search = new URL('https://www.googleapis.com/youtube/v3/search');
      search.searchParams.set('part', 'snippet');
      search.searchParams.set('type', 'channel');
      search.searchParams.set('q', legacyUserMatch[1]);
      search.searchParams.set('maxResults', '1');
      search.searchParams.set('key', apiKey);
      const searchResult = await getJson(search);
      channelId = searchResult.items?.[0]?.id?.channelId || '';
    } else {
      return res.status(400).json({ error: 'Use a YouTube channel URL such as youtube.com/@handle.' });
    }

    if (!channelId) {
      const channels = await getJson(channelLookup);
      const channel = channels.items?.[0];
      if (!channel) return res.status(404).json({ error: 'We could not find that YouTube channel.' });
      channelId = channel.id;
      channelTitle = channel.snippet?.title || channelTitle;
      channelThumbnail = channel.snippet?.thumbnails?.default?.url || '';
    } else if (channelIdMatch) {
      const channels = await getJson(channelLookup);
      const channel = channels.items?.[0];
      if (!channel) return res.status(404).json({ error: 'We could not find that YouTube channel.' });
      channelTitle = channel.snippet?.title || channelTitle;
      channelThumbnail = channel.snippet?.thumbnails?.default?.url || '';
    }

    const liveQuery = new URL('https://www.googleapis.com/youtube/v3/search');
    liveQuery.searchParams.set('part', 'snippet');
    liveQuery.searchParams.set('channelId', channelId);
    liveQuery.searchParams.set('type', 'video');
    liveQuery.searchParams.set('eventType', 'live');
    liveQuery.searchParams.set('maxResults', '5');
    liveQuery.searchParams.set('order', 'date');
    liveQuery.searchParams.set('key', apiKey);
    const live = await getJson(liveQuery);
    const streams = (live.items || []).map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title || 'Live stream',
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
      channelId: item.snippet?.channelId || channelId,
      channelTitle: item.snippet?.channelTitle || channelTitle,
      url: item.id?.videoId ? `https://www.youtube.com/watch?v=${item.id.videoId}` : '',
      isLive: true,
    })).filter((item: any) => item.videoId);

    return res.status(200).json({
      channelId,
      channelTitle,
      channelThumbnail,
      checkedAt: new Date().toISOString(),
      isLive: streams.length > 0,
      streams,
    });
  } catch (error: any) {
    console.error('YouTube live lookup failed:', error?.message || error);
    const status = Number(error?.status);
    return res.status(status >= 400 && status < 500 ? status : 502).json({
      error: status === 403
        ? 'YouTube API access was denied. Check the key, API enablement, and quota.'
        : 'We could not check this channel right now. Please try again shortly.',
    });
  }
}
