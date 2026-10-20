import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  Trophy,
  BookOpen,
  Heart,
  MessageSquare,
  Send,
  EyeOff,
  Filter,
  Globe,
  School,
  Clock,
  Plus,
} from 'lucide-react';
import { ActivityFeedItem, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynth';

interface GlobalActivityFeedProps {
  feed: ActivityFeedItem[];
  currentUser: UserProfile;
  onCheerActivity: (activityId: string) => void;
  onPostMilestone: (title: string, description: string, subjectTag: string) => void;
  onToggleGhostMode: () => void;
}

export const GlobalActivityFeed: React.FC<GlobalActivityFeedProps> = ({
  feed,
  currentUser,
  onCheerActivity,
  onPostMilestone,
  onToggleGhostMode,
}) => {
  const [filter, setFilter] = useState<'all' | 'my_university' | 'streaks' | 'sessions'>('all');
  const [postTitle, setPostTitle] = useState('');
  const [postSubject, setPostSubject] = useState(currentUser.currentSubject?.replace(/^#/, '') || 'USMLE');
  const [isPosting, setIsPosting] = useState(false);

  const handleCheer = (activityId: string) => {
    audioSynth.playChime('peer_nudge');
    onCheerActivity(activityId);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;
    onPostMilestone(
      postTitle.trim(),
      `Studying at ${currentUser.university || currentUser.universityOrLocation}. Verified focus session.`,
      postSubject.replace(/^#/, '').trim()
    );
    setPostTitle('');
    setIsPosting(false);
  };

  const filteredFeed = feed.filter((item) => {
    if (filter === 'my_university') {
      return (
        item.university.toLowerCase() === (currentUser.university || '').toLowerCase() ||
        item.countryFlag === currentUser.countryFlag
      );
    }
    if (filter === 'streaks') {
      return item.type === 'streak_milestone' || item.type === 'desk_pet_level';
    }
    if (filter === 'sessions') {
      return item.type === 'session_completed' || item.type === 'battle_won';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header and Social Hub Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
            <Globe className="w-4 h-4" />
            <span>Social Hub • Global Activity & Milestones</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Global Activity Feed</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Celebrate real-time streaks, completed focus sprints, and desk pet milestones with peers worldwide.
          </p>
        </div>

        {/* Ghost Mode Privacy Toggle & Share Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onToggleGhostMode}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
              currentUser.isGhostMode
                ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
            title="Ghost Mode hides your activity from public feed and global directory"
          >
            <EyeOff className={`w-3.5 h-3.5 ${currentUser.isGhostMode ? 'text-purple-700' : 'text-stone-400'}`} />
            <span>{currentUser.isGhostMode ? 'Ghost Mode: ON' : 'Ghost Mode: OFF'}</span>
          </button>

          <button
            onClick={() => setIsPosting((prev) => !prev)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Share Milestone
          </button>
        </div>
      </div>

      {/* Ghost Mode Active Warning Notice */}
      {currentUser.isGhostMode && (
        <div className="p-4 rounded-3xl bg-purple-50 border border-purple-200/80 text-purple-950 flex items-start justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-start gap-2.5">
            <EyeOff className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm">Ghost Mode is currently active</strong>
              <span className="text-purple-800">
                You are studying incognito. Your completed sprints, streaks, and room presence are private and hidden from the public feed and university directory.
              </span>
            </div>
          </div>
          <button
            onClick={onToggleGhostMode}
            className="px-3 py-1.5 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-950 font-bold shrink-0"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* Post Milestone Form (Collapsible) */}
      {isPosting && (
        <form onSubmit={handlePostSubmit} className="squircle-card p-5 bg-white border border-stone-200 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-xs font-bold text-stone-900">Broadcast Focus Milestone</h3>
            <span className="text-[11px] text-stone-400">
              Posting as {currentUser.countryFlag || '🌐'} {currentUser.name} ({currentUser.university || 'Global'})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="e.g. Completed 90m deep work on USMLE Neuro Pathology!"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="#SubjectTag (e.g. #USMLE)"
                value={postSubject}
                onChange={(e) => setPostSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast to Global Feed
            </button>
          </div>
        </form>
      )}

      {/* Feed Filters */}
      <div className="squircle-card p-3 sm:p-4 bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Live Activities
          </button>

          <button
            onClick={() => setFilter('my_university')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'my_university'
                ? 'bg-amber-100 text-amber-900 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>{currentUser.countryFlag || '🌐'}</span>
            <span>My Country & Campus</span>
          </button>

          <button
            onClick={() => setFilter('streaks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'streaks'
                ? 'bg-pink-100 text-pink-900 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-pink-500 text-pink-600" />
            <span>Streaks & Desk Pets</span>
          </button>

          <button
            onClick={() => setFilter('sessions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filter === 'sessions'
                ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed Sprints</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-stone-400">
          {filteredFeed.length} live update{filteredFeed.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Activities Timeline Feed */}
      <div className="space-y-3.5">
        {filteredFeed.map((item) => {
          const isStreak = item.type === 'streak_milestone';
          const isPet = item.type === 'desk_pet_level';
          const isBattle = item.type === 'battle_won';
          const isSession = item.type === 'session_completed';
          const isDeck = item.type === 'deck_created';

          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
          let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';

          if (isStreak) {
            icon = <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />;
            badgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
          } else if (isPet) {
            icon = <Sparkles className="w-4 h-4 text-purple-600" />;
            badgeBg = 'bg-purple-50 text-purple-900 border-purple-200';
          } else if (isBattle) {
            icon = <Trophy className="w-4 h-4 text-amber-600" />;
            badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
          } else if (isDeck) {
            icon = <BookOpen className="w-4 h-4 text-pink-600" />;
            badgeBg = 'bg-pink-50 text-pink-900 border-pink-200';
          }

          return (
            <div
              key={item.id}
              className="squircle-card p-5 bg-white border border-stone-200/90 hover:border-stone-300 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left Column: Avatar + Details */}
              <div className="flex items-start gap-3.5">
                <div className="relative">
                  <img
                    src={item.userAvatar}
                    alt={item.userName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-stone-200"
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow-xs px-0.5">
                    {item.countryFlag}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{item.userName}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <School className="w-3 h-3 text-stone-400" />
                      {item.university}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[10px] text-stone-400 font-mono">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                    {item.subjectTag && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-semibold">
                        {item.subjectTag.replace(/^#/, '')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Right Column: Cheer Button & XP indicator */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                {item.xpEarned && (
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    +{item.xpEarned} XP
                  </span>
                )}

                <button
                  onClick={() => handleCheer(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                    item.userHasCheered
                      ? 'bg-amber-200 text-amber-950 border border-amber-300'
                      : 'bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200'
                  }`}
                  title="Send peer cheer"
                >
                  <Heart className={`w-3.5 h-3.5 ${item.userHasCheered ? 'fill-amber-700 text-amber-700' : 'text-stone-500'}`} />
                  <span>{item.cheersCount} Cheers</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
