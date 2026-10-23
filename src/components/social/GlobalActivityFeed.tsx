import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Heart,
  Send,
  EyeOff,
  Globe,
  Clock,
  Plus,
  Users,
  Search,
  UserPlus,
  UserCheck,
  Check,
  X,
  Target,
  BookOpen,
  Filter,
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  SupabaseService,
  FriendItem,
  UserSearchResult,
  MilestoneItem,
} from '../../services/supabase';
import { audioSynth } from '../../services/audioSynth';

interface GlobalActivityFeedProps {
  currentUser: UserProfile;
  onToggleGhostMode: () => void;
}

export const GlobalActivityFeed: React.FC<GlobalActivityFeedProps> = ({
  currentUser,
  onToggleGhostMode,
}) => {
  // Feed Mode: 'friends' or 'global'
  const [feedMode, setFeedMode] = useState<'friends' | 'global'>('friends');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'DeepWork' | 'USMLE' | 'BarExam' | 'Coding'>('all');

  // Milestone list & loading
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cheeredIds, setCheeredIds] = useState<Record<string, boolean>>({});

  // Friends & Search States
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [isFriendsListOpen, setIsFriendsListOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Post Milestone Form State
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postDescription, setPostDescription] = useState<string>('');
  const [postSubject, setPostSubject] = useState<string>(
    currentUser.currentSubject?.replace(/^#/, '') || 'DeepWork'
  );
  const [postType, setPostType] = useState<'session_completed' | 'streak_milestone' | 'challenge_completed'>('session_completed');

  useEffect(() => {
    loadFriends();
  }, [currentUser.id]);

  useEffect(() => {
    loadMilestones(feedMode);
  }, [feedMode, currentUser.id]);

  const loadFriends = async () => {
    const list = await SupabaseService.fetchFriends(currentUser.id);
    setFriends(list);
  };

  const loadMilestones = async (mode: 'friends' | 'global') => {
    setIsLoading(true);
    const data = await SupabaseService.fetchMilestones(currentUser.id, mode === 'friends');
    setMilestones(data);
    setIsLoading(false);
  };

  // Search Studiers
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const results = await SupabaseService.searchUsers(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    };

    const debounce = setTimeout(handleSearch, 250);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const isFriendAdded = (friendUid: string) => {
    return friends.some((f) => f.friendUid === friendUid);
  };

  const handleToggleFriend = async (user: UserSearchResult) => {
    setActionError(null);
    const isAdded = isFriendAdded(user.uid);
    try {
      if (isAdded) {
        await SupabaseService.removeFriend(currentUser.id, user.uid);
        setFriends((prev) => prev.filter((f) => f.friendUid !== user.uid));
      } else {
        await SupabaseService.addFriend(currentUser.id, { uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar, university: user.university });
        await loadFriends();
        audioSynth.playChime('peer_nudge');
      }
    } catch (error: any) {
      setActionError(error?.message || 'That change could not be saved. Please try again.');
    }
  };

  const handleRemoveFriend = async (friendUid: string) => {
    setActionError(null);
    try {
      await SupabaseService.removeFriend(currentUser.id, friendUid);
      setFriends((prev) => prev.filter((friend) => friend.friendUid !== friendUid));
    } catch (error: any) {
      setActionError(error?.message || 'Could not remove this study partner.');
    }
  };

  const handleCheer = async (milestoneId: string) => {
    if (cheeredIds[milestoneId] || milestones.some((item) => item.milestoneId === milestoneId && item.userHasCheered)) return;
    setActionError(null);
    try {
      const result = await SupabaseService.cheerMilestone(milestoneId);
      setCheeredIds((prev) => ({ ...prev, [milestoneId]: true }));
      if (result.alreadyCheered) {
        await loadMilestones(feedMode);
        return;
      }
      setMilestones((prev) => prev.map((m) => m.milestoneId === milestoneId ? { ...m, cheersCount: m.cheersCount + 1, userHasCheered: true } : m));
      audioSynth.playChime('peer_nudge');
    } catch (error: any) {
      setActionError(error?.message || 'Your cheer could not be saved. Please try again.');
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;
    setActionError(null);
    setIsSubmittingMilestone(true);
    try {
      const newMilestone = await SupabaseService.postMilestone({
        user: currentUser, title: postTitle.trim(),
        description: postDescription.trim() || `Focused session on ${postSubject}.`,
        subjectTag: postSubject.trim(), type: postType,
      });
      setMilestones((prev) => [newMilestone, ...prev]);
      setPostTitle('');
      setPostDescription('');
      setIsPosting(false);
      audioSynth.playChime('pomodoro_complete');
    } catch (error: any) {
      setActionError(error?.message || 'Your milestone could not be published. Please try again.');
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  // Filtered milestones by subject tag
  const filteredMilestones = milestones.filter((item) => {
    if (subjectFilter === 'all') return true;
    return (
      item.subjectTag?.toLowerCase().includes(subjectFilter.toLowerCase()) ||
      item.title.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Header & Navigation Modes */}
      {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-950/40 dark:text-rose-200">{actionError}</p>}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Social Accountability & Milestone Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Study Feed
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Follow real members’ focus milestones and encourage your study partners.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Friends Counter & Directory Button */}
          <button
            onClick={() => setIsFriendsListOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Friends ({friends.length})</span>
          </button>

          {/* Privacy Ghost Mode Toggle */}
          <button
            onClick={onToggleGhostMode}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
              currentUser.isGhostMode
                ? 'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 ring-1 ring-purple-300'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
            }`}
            title="Ghost Mode keeps your sprint milestones private"
          >
            <EyeOff className={`w-3.5 h-3.5 ${currentUser.isGhostMode ? 'text-purple-700 dark:text-purple-300' : 'text-stone-400'}`} />
            <span>{currentUser.isGhostMode ? 'Ghost ON' : 'Ghost OFF'}</span>
          </button>

          {/* Share Milestone Button */}
          <button
            onClick={() => setIsPosting((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-900 text-white dark:bg-white dark:text-stone-950 text-xs font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post Milestone</span>
          </button>
        </div>
      </div>

      {/* Two Prominent Feed Mode Tabs: Friends Only vs Global Feed */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-[#FDFBF7] dark:bg-[#1A1819] rounded-[24px] border border-pink-100 dark:border-pink-950/80">
        <div className="grid grid-cols-2 gap-1 flex-1 sm:max-w-md">
          <button
            onClick={() => setFeedMode('friends')}
            className={`py-2 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              feedMode === 'friends'
                ? 'bg-white dark:bg-[#221F21] text-pink-700 dark:text-pink-300 shadow-xs border border-pink-200 dark:border-pink-900 ring-1 ring-pink-300 dark:ring-pink-800'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-pink-500 shrink-0" />
            <span>Friends Feed Only</span>
          </button>

          <button
            onClick={() => setFeedMode('global')}
            className={`py-2 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              feedMode === 'global'
                ? 'bg-white dark:bg-[#221F21] text-sky-700 dark:text-sky-300 shadow-xs border border-sky-200 dark:border-sky-900 ring-1 ring-sky-300 dark:ring-sky-800'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-500 shrink-0" />
            <span>Global Campus Feed</span>
          </button>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 text-xs">
          {(['all', 'DeepWork', 'USMLE', 'BarExam', 'Coding'] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setSubjectFilter(tag)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                subjectFilter === tag
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 hover:bg-pink-50 dark:hover:bg-stone-800'
              }`}
            >
              {tag === 'all' ? 'All Subjects' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* Friend Search Bar - Quick Look-Up by Unique Name / Handle */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-pink-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search real members by name or handle..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-[#221F21] border border-pink-100 dark:border-pink-950/80 text-stone-900 dark:text-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl max-h-80 overflow-y-auto space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 font-bold uppercase tracking-wider">
              <span>Matching Studiers</span>
              <span>{searchResults.length} found</span>
            </div>

            {isSearching ? (
              <div className="py-6 text-center text-xs text-stone-400">Searching directory...</div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-500">
                No studier found with handle or name matching "{searchQuery}"
              </div>
            ) : (
              searchResults.map((user) => {
                const added = isFriendAdded(user.uid);
                return (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-stone-200 dark:ring-stone-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-stone-900 dark:text-white truncate">
                            {user.name}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {user.handle}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">
                          {user.university || 'Independent Scholar'} • {user.currentStreak}d streak • {user.totalHoursStudied}h
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFriend(user)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        added
                          ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900'
                          : 'bg-pink-500 text-white hover:bg-pink-600 shadow-xs'
                      }`}
                    >
                      {added ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Post Milestone Drawer / Form */}
      {isPosting && (
        <form
          onSubmit={handlePostSubmit}
          className="squircle-card p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-white">Broadcast Study Milestone</h3>
              <p className="text-[11px] text-stone-400">
                Posting as {currentUser.name} ({currentUser.handle || `@${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPostType('session_completed')}
              className={`p-2 rounded-xl font-semibold border text-center transition-all ${
                postType === 'session_completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-200'
                  : 'border-stone-200 dark:border-stone-800 text-stone-500'
              }`}
            >
              Sprint Completed
            </button>
            <button
              type="button"
              onClick={() => setPostType('streak_milestone')}
              className={`p-2 rounded-xl font-semibold border text-center transition-all ${
                postType === 'streak_milestone'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200'
                  : 'border-stone-200 dark:border-stone-800 text-stone-500'
              }`}
            >
              Streak Milestone
            </button>
            <button
              type="button"
              onClick={() => setPostType('challenge_completed')}
              className={`p-2 rounded-xl font-semibold border text-center transition-all ${
                postType === 'challenge_completed'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-950 dark:text-indigo-200'
                  : 'border-stone-200 dark:border-stone-800 text-stone-500'
              }`}
            >
              Challenge Goal Met
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="e.g. Finished 90m deep focus sprint on Renal Pathology"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={postSubject}
                onChange={(e) => setPostSubject(e.target.value)}
                placeholder="#SubjectTag (e.g. USMLE)"
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <textarea
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            placeholder="Add context (notes summarized, problem sets finished, key takeaway)..."
            rows={2}
            className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="px-3 py-1.5 rounded-xl text-stone-500 hover:bg-stone-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingMilestone}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white dark:bg-white text-white dark:text-stone-950 font-bold text-xs hover:bg-stone-800 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingMilestone ? 'Publishing…' : 'Publish milestone'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Feed Content Display */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-stone-400">Loading feed milestones...</div>
      ) : filteredMilestones.length === 0 ? (
        <div className="squircle-card p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              {feedMode === 'friends' ? 'No Friend Milestones Yet' : 'No Milestones Found'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {feedMode === 'friends'
                ? 'Your Friends Feed shows milestones only from studiers you add. Search for peers above, or add recommended studiers below!'
                : 'No milestones match this filter. Share your first study sprint milestone!'}
            </p>
          </div>

          {feedMode === 'friends' && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 max-w-lg mx-auto">
              <p className="text-xs text-slate-500 dark:text-slate-400">No other members have joined your network yet. Search for a real registered member above, or share Lima4 with someone who would benefit from focused study.</p>
            </div>
          )}
        <div className="space-y-3">
          {filteredMilestones.map((item) => {
            const hasCheered = cheeredIds[item.milestoneId] || item.userHasCheered;
            const isFriend = friends.some((f) => f.friendUid === item.userUid);

            return (
              <div
                key={item.milestoneId || item.id}
                className="squircle-card p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                {/* Left: User Avatar & Post Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <img
                    src={item.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={item.userName}
                    className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-2 ring-stone-100 dark:ring-stone-800"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-stone-900 dark:text-white">
                        {item.userName}
                      </span>
                      {item.userHandle && (
                        <span className="text-[11px] font-mono font-semibold text-pink-600 dark:text-pink-400">
                          {item.userHandle}
                        </span>
                      )}
                      {isFriend && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-[10px] font-bold border border-pink-200 dark:border-pink-800">
                          Friend
                        </span>
                      )}
                      <span className="text-stone-300 dark:text-stone-700">•</span>
                      <span className="text-xs text-stone-400">{item.createdAt || 'Recent'}</span>
                    </div>

                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                      <span>{item.university || 'Global Campus'}</span>
                      {item.streakDays && (
                        <span className="inline-flex items-center gap-0.5 font-bold text-pink-600 dark:text-pink-400">
                          <Flame className="w-3 h-3 fill-pink-500" />
                          <span>{item.streakDays}d streak</span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-bold text-sm text-stone-900 dark:text-white mt-2">
                      {item.title}
                    </h2>

                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {item.subjectTag && (
                      <div className="mt-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-[11px] font-mono font-semibold border border-pink-100 dark:border-pink-950/60">
                          #{item.subjectTag.replace(/^#/, '')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Cheer Button */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-50 dark:border-pink-950/40 shrink-0">
                  <button
                    onClick={() => handleCheer(item.milestoneId || item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      hasCheered
                        ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shadow-xs'
                        : 'bg-[#FDFBF7] dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-pink-50 border border-pink-100 dark:border-stone-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasCheered ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span>{item.cheersCount || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Friends Management Modal */}
      {isFriendsListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="squircle-card max-w-md w-full p-6 bg-white dark:bg-[#221F21] border border-pink-100 dark:border-pink-950/80 shadow-2xl relative max-h-[85vh] flex flex-col rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-pink-50 dark:border-pink-950/60 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Study Friends ({friends.length})
                  </h3>
                  <p className="text-xs text-stone-500">People whose milestones appear in your Friends Feed</p>
                </div>
              </div>
              <button
                onClick={() => setIsFriendsListOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {friends.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  You haven't added any study friends yet. Use the search bar above to look up friends by their unique handle!
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.friendUid}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={friend.friendAvatar}
                        alt={friend.friendName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 dark:text-white truncate">
                          {friend.friendName}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                          {friend.friendHandle}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {friend.friendUniversity}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => void handleRemoveFriend(friend.friendUid)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 mt-4 flex items-center justify-end shrink-0">
              <button
                onClick={() => setIsFriendsListOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
