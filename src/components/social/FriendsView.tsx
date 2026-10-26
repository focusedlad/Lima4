import React, { useEffect, useState } from 'react';
import { Search, Users, UserPlus, UserCheck, X, RefreshCw, GraduationCap, Clock3, Flame, Award } from 'lucide-react';
import { UserProfile } from '../../types';
import { SupabaseService, FriendItem, UserSearchResult } from '../../services/supabase';

interface FriendsViewProps {
  currentUser: UserProfile;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ currentUser }) => {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searching, setSearching] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshFriends = async () => {
    setLoadingFriends(true);
    try {
      const list = await SupabaseService.fetchFriends(currentUser.id);
      setFriends(list);
    } catch (e: any) {
      setError(e?.message || 'Could not load your friends. Try again.');
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    void refreshFriends();
    let cancelled = false;
    SupabaseService.fetchSuggestedUsers().then((items) => { if (!cancelled) setSuggestions(items.filter((person) => person.uid !== currentUser.id)); }).catch(() => {}).finally(() => { if (!cancelled) setLoadingSuggestions(false); });
    return () => { cancelled = true; };
  }, [currentUser.id]);

  useEffect(() => {
    let cancelled = false;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(async () => {
      const found = await SupabaseService.searchUsers(term);
      if (!cancelled) {
        setResults(found.filter((person) => person.uid !== currentUser.id));
        setSearching(false);
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, currentUser.id]);

  const isFriend = (uid: string) => friends.some((friend) => friend.friendUid === uid);

  const toggleFriend = async (person: UserSearchResult) => {
    setError('');
    setNotice('');
    setBusyUid(person.uid);
    try {
      if (isFriend(person.uid)) {
        await SupabaseService.removeFriend(currentUser.id, person.uid);
        setFriends((old) => old.filter((friend) => friend.friendUid !== person.uid));
        setNotice(person.name + ' was removed from your friends list.');
      } else {
        await SupabaseService.addFriend(currentUser.id, {
          uid: person.uid, name: person.name, handle: person.handle,
          avatar: person.avatar, university: person.university,
        });
        await refreshFriends();
        setNotice('Added ' + person.name + '. For friends-only milestones, they must add you back too.');
      }
    } catch (e: any) {
      setError(e?.message || 'That change could not be saved. Please try again.');
    } finally {
      setBusyUid(null);
    }
  };

  return (
    <div className="lima-friends-page space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">Your study network</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Friends</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">Find people you know, add study partners, and keep your network in one place.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Users className="h-4 w-4" /> {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 sm:p-6 dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-slate-900">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900 dark:text-white">Suggested study partners</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Discover other Lima4 members and invite them into your study network.</p></div><Users className="h-5 w-5 shrink-0 text-indigo-500" /></div>
        {loadingSuggestions ? <p className="py-5 text-center text-sm text-slate-500">Finding members…</p> :
          suggestions.filter((person) => !friends.some((friend) => friend.friendUid === person.uid)).length === 0 ?
            <p className="mt-4 rounded-xl border border-dashed border-indigo-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-indigo-900">No new suggestions right now. Check back as more people join Lima4.</p> :
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {suggestions.filter((person) => !friends.some((friend) => friend.friendUid === person.uid)).map((person) => <article key={person.uid} className="flex min-w-0 items-center gap-3 rounded-xl border border-white bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">{person.avatar ? <img src={person.avatar} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-bold text-slate-500">{(person.name[0] || '?').toUpperCase()}</div>}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900 dark:text-white">{person.name}</p><p className="truncate text-xs text-slate-500">@{person.handle}</p>{person.university && <p className="truncate text-xs text-slate-500">{person.university}</p>}</div>
                <button type="button" disabled={busyUid === person.uid} onClick={() => void toggleFriend(person)} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"><UserPlus className="h-4 w-4" />Add</button>
              </article>)}
            </div>}
      </section>

      {(error || notice) && <p role={error ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{error || notice}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Find people</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search by name or handle. Only registered Lima4 members appear.</p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" autoComplete="off" placeholder="Search name or @handle…" aria-label="Search Lima4 members" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-slate-700" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"><X className="h-4 w-4" /></button>}
        </div>
        {query.trim().length >= 2 && (
          <div className="mt-4 space-y-2">
            {searching ? <p className="py-5 text-center text-sm text-slate-500">Searching members…</p> :
              results.length === 0 ? <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-800">No members found. Check the spelling or try their handle.</p> :
              results.map((person) => {
                const added = isFriend(person.uid);
                return <article key={person.uid} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <img src={person.avatar} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-full bg-slate-100 object-cover dark:bg-slate-800" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{person.name}</p>
                    <p className="truncate text-xs text-slate-500">@{person.handle}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {person.university && <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{person.university}</span>}
                      <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{person.totalHoursStudied}h</span>
                      <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{person.currentStreak}d streak</span>
                    </p>
                  </div>
                  <button type="button" disabled={busyUid === person.uid} onClick={() => void toggleFriend(person)} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-wait disabled:opacity-50 ${added ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-200 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200' : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900'}`}>
                    {added ? <><UserCheck className="h-4 w-4" /> Added</> : <><UserPlus className="h-4 w-4" /> Add</>}
                  </button>
                </article>;
              })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your friends</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage the people you have added.</p>
          </div>
          <button type="button" onClick={() => void refreshFriends()} disabled={loadingFriends} aria-label="Refresh friends list" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <RefreshCw className={`h-4 w-4 ${loadingFriends ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        {loadingFriends ? <p className="py-8 text-center text-sm text-slate-500">Loading your friends…</p> :
          friends.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
            <Users className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-white">Your network starts here</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">Search for classmates or study partners above. Members you add will appear here.</p>
            <button type="button" onClick={() => document.querySelector<HTMLInputElement>('[aria-label="Search Lima4 members"]')?.focus()} className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Find friends</button>
          </div> :
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {friends.map((friend) => <article key={friend.friendUid} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <img src={friend.friendAvatar} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-full bg-slate-100 object-cover dark:bg-slate-800" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{friend.friendName}</p>
                <p className="truncate text-xs text-slate-500">@{friend.friendHandle}</p>
                <p className="truncate text-xs text-slate-500">{friend.friendUniversity || 'Lima4 member'}</p>
              </div>
              <button type="button" disabled={busyUid === friend.friendUid} onClick={async () => {
                setError(''); setNotice(''); setBusyUid(friend.friendUid);
                try {
                  await SupabaseService.removeFriend(currentUser.id, friend.friendUid);
                  setFriends((old) => old.filter((item) => item.friendUid !== friend.friendUid));
                  setNotice(friend.friendName + ' was removed from your friends list.');
                } catch (e: any) { setError(e?.message || 'Could not remove this friend.'); }
                finally { setBusyUid(null); }
              }} aria-label={'Remove ' + friend.friendName} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30">Remove</button>
            </article>)}
          </div>}
      </section>
      <p className="flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400"><Award className="mt-0.5 h-4 w-4 shrink-0" /> Friends-only milestones are shared only when the connection is mutual. Adding someone here does not automatically add you to their list.</p>
    </div>
  );
};

export default FriendsView;
