import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, Check, Clock3, ExternalLink, LoaderCircle, Plus, Radio, RefreshCw, Trash2, X } from 'lucide-react';

type FollowedChannel = {
  id: string;
  channel: string;
  channelId?: string;
  title?: string;
  thumbnail?: string;
  lastLiveVideoIds?: string[];
  lastCheckedAt?: string;
};
type LiveStream = { videoId: string; title: string; thumbnail: string; channelId: string; channelTitle: string; url: string; isLive: boolean };
type LookupResult = { channelId: string; channelTitle: string; channelThumbnail: string; checkedAt: string; isLive: boolean; streams: LiveStream[] };

const FOLLOW_KEY = 'lima4_youtube_followed_channels_v1';
const PREF_KEY = 'lima4_notification_preferences_v1';
const REMINDER_KEY = 'lima4_local_reminders_v1';
const CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000;

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeChannel(value: string) {
  const trimmed = value.trim();
  if (/^UC[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^@[a-zA-Z0-9._-]+$/.test(trimmed)) return `https://www.youtube.com/${trimmed}`;
  return '';
}

export const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [channelInput, setChannelInput] = useState('');
  const [channels, setChannels] = useState<FollowedChannel[]>(() => readJson(FOLLOW_KEY, []));
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [alertsEnabled, setAlertsEnabled] = useState(() => readJson(PREF_KEY, { live: true, study: true, challenges: true }).live);
  const [studyReminder, setStudyReminder] = useState(() => readJson(PREF_KEY, { studyMinutes: 60 }).studyMinutes || 60);
  const [challengeReminder, setChallengeReminder] = useState(() => readJson(PREF_KEY, { challengeMinutes: 30 }).challengeMinutes || 30);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [liveByChannel, setLiveByChannel] = useState<Record<string, LiveStream[]>>({});
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [studyTimerActive, setStudyTimerActive] = useState(false);
  const [challengeTimerActive, setChallengeTimerActive] = useState(false);

  useEffect(() => { localStorage.setItem(FOLLOW_KEY, JSON.stringify(channels)); }, [channels]);
  useEffect(() => {
    const prefs = readJson(PREF_KEY, { live: true, study: true, challenges: true, studyMinutes: 60, challengeMinutes: 30 });
    localStorage.setItem(PREF_KEY, JSON.stringify({ ...prefs, live: alertsEnabled, studyMinutes: studyReminder, challengeMinutes: challengeReminder }));
  }, [alertsEnabled, studyReminder, challengeReminder]);

  const notify = useCallback((title: string, body: string, url?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const notification = new Notification(title, { body, icon: '/pwa-192x192.png', tag: `lima4-${title}-${body}` });
      if (url) notification.onclick = () => { window.focus(); window.open(url, '_blank', 'noopener,noreferrer'); notification.close(); };
    } catch { /* Notifications are best-effort; some browsers require service-worker notifications. */ }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      setError('This browser does not support desktop notifications.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setMessage(result === 'granted' ? 'Notifications are enabled on this device.' : 'Notifications were not enabled. You can change this in your browser settings.');
    } catch {
      setError('The browser could not request notification permission.');
    }
  };

  const lookupChannel = useCallback(async (channel: FollowedChannel, silent = false) => {
    setBusyId(channel.id);
    if (!silent) { setError(''); setMessage(''); }
    try {
      const query = channel.channelId || channel.channel;
      const response = await fetch(`/api/youtube/live?channel=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Live channel lookup failed.');
      const result = data as LookupResult;
      const streams = result.streams || [];
      const previousIds = channel.lastLiveVideoIds || [];
      const newStreams = streams.filter((stream) => !previousIds.includes(stream.videoId));
      setChannels((current) => current.map((item) => item.id === channel.id ? {
        ...item,
        channelId: result.channelId,
        title: result.channelTitle,
        thumbnail: result.channelThumbnail,
        lastLiveVideoIds: streams.map((stream) => stream.videoId),
        lastCheckedAt: result.checkedAt,
      } : item));
      setLiveByChannel((current) => ({ ...current, [result.channelId]: streams }));
      setLastCheck(result.checkedAt);
      if (alertsEnabled && newStreams.length > 0 && previousIds.length > 0) {
        notify(`${result.channelTitle} is live`, newStreams[0].title, newStreams[0].url);
      }
      if (!silent) setMessage(streams.length ? `${result.channelTitle}: live stream found.` : `${result.channelTitle}: no live stream found right now.`);
      return result;
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Could not check that channel.');
      return null;
    } finally {
      setBusyId((current) => current === channel.id ? null : current);
    }
  }, [alertsEnabled, notify]);

  const addChannel = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeChannel(channelInput);
    if (!normalized) {
      setError('Paste a YouTube channel URL or enter a channel @handle, for example @YouTube.');
      return;
    }
    if (channels.some((item) => item.channel.toLowerCase() === normalized.toLowerCase())) {
      setError('You are already following that channel on this device.');
      return;
    }
    const channel: FollowedChannel = { id: `channel_${Date.now()}`, channel: normalized };
    setChannels((current) => [channel, ...current]);
    setChannelInput('');
    const result = await lookupChannel(channel);
    if (!result) setMessage('Saved this channel on this device. Live status will work once the YouTube API key is configured.');
  };

  const checkAll = useCallback(async (silent = false) => {
    if (!channels.length) {
      if (!silent) setMessage('Add a YouTube channel first.');
      return;
    }
    for (const channel of channels) {
      await lookupChannel(channel, silent);
    }
  }, [channels, lookupChannel]);

  useEffect(() => {
    if (!open || channels.length === 0) return;
    const timer = window.setInterval(() => { void checkAll(true); }, CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [open, channels.length, checkAll]);

  const scheduleReminder = (kind: 'study' | 'challenge', minutes: number) => {
    const key = kind === 'study' ? 'study' : 'challenges';
    const prefs = readJson(PREF_KEY, { live: true, study: true, challenges: true, studyMinutes: 60, challengeMinutes: 30 });
    localStorage.setItem(PREF_KEY, JSON.stringify({ ...prefs, [key]: true, [kind === 'study' ? 'studyMinutes' : 'challengeMinutes']: minutes }));
    const existing = readJson<Record<string, number>>(REMINDER_KEY, {});
    if (existing[kind]) window.clearTimeout(existing[kind]);
    const timerId = window.setTimeout(() => {
      const currentPrefs = readJson(PREF_KEY, { study: true, challenges: true });
      if (currentPrefs[key]) notify(kind === 'study' ? 'Time to focus again' : 'Your challenge is waiting', kind === 'study' ? 'Ready for another short study session?' : 'Open Lima4 to continue your study challenge.');
      const next = readJson<Record<string, number>>(REMINDER_KEY, {});
      delete next[kind];
      localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
      if (kind === 'study') setStudyTimerActive(false); else setChallengeTimerActive(false);
    }, minutes * 60 * 1000);
    localStorage.setItem(REMINDER_KEY, JSON.stringify({ ...existing, [kind]: timerId }));
    if (kind === 'study') setStudyTimerActive(true); else setChallengeTimerActive(true);
    setMessage(`${kind === 'study' ? 'Focus' : 'Challenge'} reminder set for ${minutes} minutes while this page remains open.`);
  };

  const removeChannel = (id: string) => setChannels((current) => current.filter((channel) => channel.id !== id));
  const permissionLabel = useMemo(() => permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked in browser settings' : permission === 'unsupported' ? 'Not supported' : 'Not enabled', [permission]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open notifications and live channels"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-600 transition hover:bg-sky-50 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-[#111820] dark:text-slate-200 dark:hover:bg-white/5"
      >
        {alertsEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {channels.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#71313B] px-1 text-[9px] font-bold text-white">{channels.length}</span>}
      </button>
      {open && (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[70] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-sky-100 bg-white p-4 text-slate-800 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[390px] sm:max-h-[min(80vh,680px)] dark:border-white/10 dark:bg-[#111820] dark:text-slate-100">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><h2 className="text-base font-bold">Notifications & live channels</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your study nudges, in one quiet place.</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 dark:hover:bg-white/5"><X className="h-4 w-4" /></button>
          </div>

          <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Browser notifications</h3><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Permission: {permissionLabel}</p></div>
              {permission !== 'granted' && permission !== 'unsupported' && <button type="button" onClick={() => void requestPermission()} className="rounded-xl bg-[#71313B] px-3 py-2 text-xs font-bold text-white hover:bg-[#57232C]">Enable</button>}
              {permission === 'granted' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Check className="h-4 w-4" /> Ready</span>}
            </div>
            <label className="mt-3 flex items-center justify-between gap-3 text-xs"><span>Notify me when followed channels go live</span><input type="checkbox" checked={alertsEnabled} onChange={(e) => setAlertsEnabled(e.target.checked)} className="h-4 w-4 accent-[#71313B]" /></label>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Live checks run every two hours while this panel is open. Browser-only reminders cannot notify reliably after Lima4 is closed.</p>
          </section>

          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-bold">YouTube channels you follow</h3><button type="button" disabled={!channels.length || busyId !== null} onClick={() => void checkAll(false)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-50 disabled:opacity-40 dark:text-sky-200 dark:hover:bg-white/5"><RefreshCw className={`h-3 w-3 ${busyId ? 'animate-spin' : ''}`} /> Check live</button></div>
            <form onSubmit={addChannel} className="flex gap-2">
              <input value={channelInput} onChange={(e) => setChannelInput(e.target.value)} placeholder="Channel URL or @handle" aria-label="YouTube channel URL or handle" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-[#0C1218] dark:focus:ring-sky-950" />
              <button type="submit" disabled={!channelInput.trim() || busyId !== null} aria-label="Follow channel" className="flex items-center justify-center rounded-xl bg-[#71313B] px-3 text-white hover:bg-[#57232C] disabled:opacity-40"><Plus className="h-4 w-4" /></button>
            </form>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Follows are saved on this device. Add YOUTUBE_API_KEY to Vercel to enable live lookup; the key stays server-side.</p>
            {channels.length === 0 ? <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 dark:border-white/10">No channels followed yet. Add a creator you like.</div> : (
              <div className="mt-3 space-y-2">
                {channels.map((channel) => {
                  const streams = (channel.channelId && liveByChannel[channel.channelId]) || [];
                  return <div key={channel.id} className="rounded-2xl border border-slate-100 p-3 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      {channel.thumbnail ? <img src={channel.thumbnail} alt="" className="h-9 w-9 rounded-full object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"><Radio className="h-4 w-4" /></div>}
                      <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{channel.title || channel.channel}</p><p className="mt-0.5 text-[10px] text-slate-500">{channel.lastCheckedAt ? `Checked ${new Date(channel.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not checked yet'}</p></div>
                      <button type="button" onClick={() => void lookupChannel(channel)} disabled={busyId !== null} aria-label={`Check ${channel.title || 'channel'}`} className="rounded-lg p-1.5 text-sky-700 hover:bg-sky-50 disabled:opacity-40 dark:text-sky-200 dark:hover:bg-white/5">{busyId === channel.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</button>
                      <button type="button" onClick={() => removeChannel(channel.id)} aria-label="Unfollow channel" className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {streams.length > 0 ? <div className="mt-3 space-y-2">{streams.map((stream) => <a key={stream.videoId} href={stream.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50">{stream.thumbnail && <img src={stream.thumbnail} alt="" className="h-10 w-16 rounded-lg object-cover" />}<span className="min-w-0 flex-1"><span className="mb-1 flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> LIVE NOW</span><span className="block truncate text-slate-700 dark:text-slate-200">{stream.title}</span></span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>)}</div> : channel.lastCheckedAt ? <p className="mt-2 text-[10px] text-slate-500">No live stream found on the last check.</p> : null}
                  </div>;
                })}
              </div>
            )}
            {lastCheck && <p className="mt-2 text-[10px] text-slate-400">Last lookup: {new Date(lastCheck).toLocaleString()}</p>}
          </section>

          <section className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10">
            <h3 className="mb-2 text-sm font-bold">Study reminders</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10"><p className="flex items-center gap-1.5 text-xs font-semibold"><Clock3 className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" /> Return to focus</p><div className="mt-2 flex gap-2"><select value={studyReminder} onChange={(e) => setStudyReminder(Number(e.target.value))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-white/10 dark:bg-[#0C1218]"><option value={25}>25 minutes</option><option value={50}>50 minutes</option><option value={60}>1 hour</option><option value={120}>2 hours</option></select><button type="button" onClick={() => scheduleReminder('study', studyReminder)} className="rounded-lg bg-sky-100 px-2.5 text-[11px] font-bold text-sky-900 dark:bg-sky-950 dark:text-sky-200">{studyTimerActive ? 'Reset' : 'Set'}</button></div></div>
              <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10"><p className="flex items-center gap-1.5 text-xs font-semibold"><Clock3 className="h-3.5 w-3.5 text-[#71313B]" /> Challenge nudge</p><div className="mt-2 flex gap-2"><select value={challengeReminder} onChange={(e) => setChallengeReminder(Number(e.target.value))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-white/10 dark:bg-[#0C1218]"><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option><option value={120}>2 hours</option></select><button type="button" onClick={() => scheduleReminder('challenge', challengeReminder)} className="rounded-lg bg-[#71313B] px-2.5 text-[11px] font-bold text-white">{challengeTimerActive ? 'Reset' : 'Set'}</button></div></div>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Reminders run while this page is open. Closing the browser may stop them. Full push notifications need a configured push service.</p>
          </section>
          {(message || error) && <div role={error ? 'alert' : 'status'} className={`mt-3 rounded-xl px-3 py-2 text-xs ${error ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>{error || message}</div>}
        </div>
      )}
    </div>
  );
};
