import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile, FocusSessionLog } from '../types';

export interface CustomSupabaseCredentials {
  url: string;
  anonKey: string;
}

export function getCustomSupabaseConfig(): CustomSupabaseCredentials | null {
  try {
    const raw = localStorage.getItem('cheri_custom_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (_) {}
  return null;
}

export function setCustomSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem('cheri_custom_supabase_config', JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    // Force re-init
    _clientInstance = null;
  } catch (_) {}
}

export function clearCustomSupabaseConfig(): void {
  try {
    localStorage.removeItem('cheri_custom_supabase_config');
    _clientInstance = null;
  } catch (_) {}
}

const customConfig = getCustomSupabaseConfig();
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const effectiveUrl = customConfig?.url || envUrl || 'https://xyzcompany.supabase.co';
const effectiveAnonKey = customConfig?.anonKey || envAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const isSupabaseConfigured = Boolean(
  (customConfig && customConfig.url && customConfig.anonKey) ||
  (envUrl && envAnonKey && !envUrl.includes('xyzcompany'))
);

let _clientInstance: SupabaseClient | null = null;

export function getActiveSupabaseClient(): SupabaseClient {
  if (!_clientInstance) {
    const conf = getCustomSupabaseConfig();
    const url = conf?.url || envUrl || 'https://xyzcompany.supabase.co';
    const key = conf?.anonKey || envAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    _clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _clientInstance;
}

export const supabase: SupabaseClient = getActiveSupabaseClient();

export interface StudyChallengeItem {
  id: string;
  title: string;
  description?: string;
  creatorUid: string;
  creatorName: string;
  creatorAvatar?: string;
  targetHours: number;
  period: 'today' | 'weekend' | '7_days' | '14_days' | '30_days';
  startDate: string;
  endDate: string;
  participantsCount: number;
  category: string;
  isJoined?: boolean;
  myProgressHours?: number;
}

export interface LeaderboardEntry {
  id: string;
  uid: string;
  name: string;
  avatar: string;
  university?: string;
  studyField?: string;
  hoursStudied: number;
  xp: number;
  streakDays: number;
  rank: number;
}

export interface FriendItem {
  id: number | string;
  userUid: string;
  friendUid: string;
  friendName: string;
  friendHandle: string;
  friendAvatar: string;
  friendUniversity: string;
  createdAt?: string;
}

export interface UserSearchResult {
  id: number;
  uid: string;
  name: string;
  handle: string;
  avatar: string;
  university?: string;
  studyField?: string;
  totalHoursStudied: number;
  currentStreak: number;
  xp: number;
  isFriend?: boolean;
}

export interface MilestoneItem {
  id: string;
  milestoneId: string;
  userUid: string;
  userName: string;
  userHandle?: string;
  userAvatar?: string;
  university?: string;
  type: string;
  title: string;
  description: string;
  subjectTag?: string;
  streakDays: number;
  xpEarned: number;
  cheersCount: number;
  userHasCheered?: boolean;
  createdAt?: string;
}

export const SupabaseService = {
  getClient(): SupabaseClient {
    return supabase;
  },

  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return null;
      return data.session;
    } catch (_) {
      return null;
    }
  },

  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;
      return data.user;
    } catch (_) {
      return null;
    }
  },

  /**
   * Sign In with Apple (OAuth)
   */
  async signInWithApple(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Apple sign-in is unavailable until Supabase is configured.' };
    try {
      const { error } = await getActiveSupabaseClient().auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: window.location.origin },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Apple sign-in failed.' };
    }
  },
  /**
   * Sign In with Google (OAuth)
   */
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Google sign-in is unavailable until Supabase is configured.' };
    try {
      const { error } = await getActiveSupabaseClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed.' };
    }
  },
  /**
   * Sign In with Email & Password
   */
  async signInWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: any; profile?: UserProfile; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Account sign-in is unavailable because Supabase is not configured.' };
    try {
      const { data, error } = await getActiveSupabaseClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass,
      });
      if (error) return { success: false, error: error.message };
      if (!data.user || !data.session) return { success: false, error: 'No active session was returned. Please verify your email and try again.' };
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  },
  /**
   * Sign Up with Email, Password & Name
   */
  async signUpWithEmail(email: string, pass: string, name: string): Promise<{ success: boolean; user?: any; session?: Session | null; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Account registration is unavailable because Supabase is not configured.' };
    try {
      const { data, error } = await getActiveSupabaseClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password: pass,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed.' };
    }
  },
  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (_) {}
  },

  /**
   * Sync User Profile with PostgreSQL backend
   */
  async syncUser(user: UserProfile): Promise<{ isFirstUser: boolean }> {
    try {
      const { data: { session } } = await getActiveSupabaseClient().auth.getSession();
      if (!session?.user || session.user.id !== user.id) return { isFirstUser: false };
      const res = await fetch('/api/db/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({
          uid: session.user.id,
          email: session.user.email || user.email || '',
          name: user.name,
          avatar: user.avatar,
          university: user.university || user.universityOrLocation,
          studyField: user.studyField,
          countryCode: user.countryCode,
          countryName: user.countryName,
          currentSubject: user.currentSubject,
          currentGoal: user.currentGoal,
          isGhostMode: user.isGhostMode,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          termsAccepted: user.termsAccepted,
          termsAcceptedAt: user.termsAcceptedAt,
          termsVersion: user.termsVersion,
          xp: user.xp,
          totalHoursStudied: Math.round(user.totalHoursStudied),
          currentStreak: user.currentStreak,
        }),
      });
      if (!res.ok) {
        console.warn('Profile sync failed:', await res.text());
        return { isFirstUser: false };
      }
      const result = await res.json();
      return { isFirstUser: Boolean(result?.isFirstUser) };
    } catch (e) {
      console.warn('Supabase/DB syncUser skipped:', e);
      return { isFirstUser: false };
    }
  },
  /**
   * Log completed focus session
   */
  async logFocusSession(log: FocusSessionLog, userUid: string): Promise<void> {
    try {
      const { data: { session } } = await getActiveSupabaseClient().auth.getSession();
      if (!session?.user || session.user.id !== userUid) return;
      await fetch('/api/db/focus-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({
          userUid,
          durationMinutes: log.durationMinutes,
          category: log.category,
          subject: log.subject,
          xpEarned: log.xpEarned,
          date: log.date,
        }),
      });
    } catch (e) {
      console.warn('Supabase/DB logFocusSession skipped:', e);
    }
  },

  /**
   * Fetch Study Challenges from backend
   */
  async fetchChallenges(): Promise<StudyChallengeItem[]> {
    try {
      const res = await fetch('/api/db/challenges');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.challenges)) {
          return json.challenges;
        }
      }
    } catch (_) {}

    return [];
  },

  /**
   * Create a new Study Challenge
   */
  async createChallenge(input: {
    title: string;
    description: string;
    targetHours: number;
    period: 'today' | 'weekend' | '7_days' | '14_days' | '30_days';
    category: string;
    creator: UserProfile;
  }): Promise<StudyChallengeItem> {
    const newChallenge: StudyChallengeItem = {
      id: `ch_${Date.now()}`,
      title: input.title,
      description: input.description,
      creatorUid: input.creator.id,
      creatorName: input.creator.name,
      creatorAvatar: input.creator.avatar,
      targetHours: input.targetHours,
      period: input.period,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      participantsCount: 1,
      category: input.category,
      isJoined: true,
      myProgressHours: 0,
    };

    try {
      await fetch('/api/db/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: newChallenge.id,
          title: newChallenge.title,
          description: newChallenge.description,
          creatorUid: newChallenge.creatorUid,
          creatorName: newChallenge.creatorName,
          creatorAvatar: newChallenge.creatorAvatar,
          targetHours: newChallenge.targetHours,
          period: newChallenge.period,
          startDate: newChallenge.startDate,
          endDate: newChallenge.endDate,
          category: newChallenge.category,
        }),
      });
    } catch (_) {}

    return newChallenge;
  },

  /**
   * Join an existing challenge
   */
  async joinChallenge(challengeId: string, user: UserProfile): Promise<void> {
    try {
      await fetch('/api/db/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          userUid: user.id,
          userName: user.name,
          userAvatar: user.avatar,
        }),
      });
    } catch (_) {}
  },

  /**
   * Fetch Leaderboard for specific timeframe
   */
  async fetchLeaderboard(timeframe: 'today' | 'week' | 'month' | 'all'): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(`/api/db/leaderboard?timeframe=${timeframe}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.leaderboard)) {
          return json.leaderboard.map((item: any, idx: number) => ({
            id: item.uid || `lead_${idx}`,
            uid: item.uid,
            name: item.name || 'Studier',
            avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            university: item.university || 'Global Campus',
            studyField: item.studyField || 'General Studies',
            hoursStudied: Number(item.totalHoursStudied || 0),
            xp: Number(item.xp || 0),
            streakDays: Number(item.currentStreak || 1),
            rank: idx + 1,
          }));
        }
      }
    } catch (_) {}

    return [];
  },

  /**
   * Fetch friends list for user
   */
  async fetchFriends(userUid: string): Promise<FriendItem[]> {
    try {
      const res = await fetch(`/api/db/friends?userUid=${encodeURIComponent(userUid)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.friends)) {
          return json.friends;
        }
      }
    } catch (_) {}
    return [];
  },

  /**
   * Add a friend by UID
   */
  async addFriend(
    userUid: string,
    friend: { uid: string; name: string; handle?: string; avatar?: string; university?: string }
  ): Promise<void> {
    try {
      await fetch('/api/db/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid,
          friendUid: friend.uid,
          friendName: friend.name,
          friendHandle: friend.handle,
          friendAvatar: friend.avatar,
          friendUniversity: friend.university,
        }),
      });
    } catch (_) {}

    const current = await this.fetchFriends(userUid);
    if (!current.some((f) => f.friendUid === friend.uid)) {
      current.push({
        id: Date.now(),
        userUid,
        friendUid: friend.uid,
        friendName: friend.name,
        friendHandle: friend.handle || `@${friend.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        friendAvatar: friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        friendUniversity: friend.university || 'Global Campus',
      });
      localStorage.setItem(`lumina_friends_${userUid}`, JSON.stringify(current));
    }
  },

  /**
   * Remove friend connection
   */
  async removeFriend(userUid: string, friendUid: string): Promise<void> {
    try {
      await fetch(`/api/db/friends/${encodeURIComponent(friendUid)}?userUid=${encodeURIComponent(userUid)}`, {
        method: 'DELETE',
      });
    } catch (_) {}

    const current = await this.fetchFriends(userUid);
    const updated = current.filter((f) => f.friendUid !== friendUid);
    localStorage.setItem(`lumina_friends_${userUid}`, JSON.stringify(updated));
  },

  /**
   * Search studiers by handle, name, or university
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const res = await fetch(`/api/db/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          return json.users;
        }
      }
    } catch (_) {}

    return [];
  },

  /**
   * Fetch Milestones Feed (supports friendsOnly = true/false)
   */
  async fetchMilestones(userUid: string, friendsOnly: boolean): Promise<MilestoneItem[]> {
    try {
      const res = await fetch(`/api/db/milestones?friendsOnly=${friendsOnly}&userUid=${encodeURIComponent(userUid)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.milestones)) {
          return json.milestones;
        }
      }
    } catch (_) {}

    return [];
  },

  /**
   * Post new Milestone
   */
  async postMilestone(input: {
    user: UserProfile;
    title: string;
    description: string;
    subjectTag?: string;
    type?: string;
  }): Promise<MilestoneItem> {
    const userHandle = input.user.handle || `@${input.user.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newMilestone: MilestoneItem = {
      id: `mile_${Date.now()}`,
      milestoneId: `mile_${Date.now()}`,
      userUid: input.user.id,
      userName: input.user.name,
      userHandle,
      userAvatar: input.user.avatar,
      university: input.user.university || input.user.universityOrLocation,
      type: input.type || 'session_completed',
      title: input.title,
      description: input.description,
      subjectTag: input.subjectTag || 'General',
      streakDays: input.user.currentStreak,
      xpEarned: 50,
      cheersCount: 0,
      userHasCheered: false,
      createdAt: 'Just now',
    };

    try {
      await fetch('/api/db/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: newMilestone.milestoneId,
          userUid: newMilestone.userUid,
          userName: newMilestone.userName,
          userHandle: newMilestone.userHandle,
          userAvatar: newMilestone.userAvatar,
          university: newMilestone.university,
          type: newMilestone.type,
          title: newMilestone.title,
          description: newMilestone.description,
          subjectTag: newMilestone.subjectTag,
          streakDays: newMilestone.streakDays,
          xpEarned: newMilestone.xpEarned,
        }),
      });
    } catch (_) {}

    return newMilestone;
  },

  /**
   * Cheer a milestone
   */
  async cheerMilestone(milestoneId: string): Promise<void> {
    try {
      await fetch(`/api/db/milestones/${encodeURIComponent(milestoneId)}/cheer`, {
        method: 'POST',
      });
    } catch (_) {}
  },
};

export const DEFAULT_STUDY_CHALLENGES: StudyChallengeItem[] = [
  {
    id: 'ch_week_35h',
    title: 'Weekly 35-Hour Deep Focus Sprint',
    description: 'Commit to 5 hours of distraction-free deep work every day this week.',
    creatorUid: 'user_sophia',
    creatorName: 'Sophia Lin',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    targetHours: 35,
    period: '7_days',
    startDate: '2026-10-18',
    endDate: '2026-10-25',
    participantsCount: 42,
    category: 'Deep Work',
    isJoined: true,
    myProgressHours: 14.5,
  },
  {
    id: 'ch_mcat_50h',
    title: 'Pre-Med & MCAT High-Yield Sprint',
    description: 'High-yield physiology, biochemistry, and active recall sprints.',
    creatorUid: 'user_marcus',
    creatorName: 'Marcus Vance',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    targetHours: 50,
    period: '14_days',
    startDate: '2026-10-15',
    endDate: '2026-10-29',
    participantsCount: 28,
    category: 'Medicine',
    isJoined: false,
    myProgressHours: 0,
  },
  {
    id: 'ch_weekend_lockin',
    title: 'Weekend 14-Hour Lock-in',
    description: 'Saturday & Sunday 7-hour daily power study sessions with zero interruptions.',
    creatorUid: 'user_elena',
    creatorName: 'Elena Rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    targetHours: 14,
    period: 'weekend',
    startDate: '2026-10-24',
    endDate: '2026-10-25',
    participantsCount: 86,
    category: 'Sprint',
    isJoined: true,
    myProgressHours: 6,
  },
  {
    id: 'ch_stem_daily',
    title: 'Daily 2-Hour Math & Coding Habit',
    description: 'Build an unbroken streak of pure algorithmic problem-solving.',
    creatorUid: 'user_kenji',
    creatorName: 'Kenji Sato',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    targetHours: 14,
    period: '7_days',
    startDate: '2026-10-19',
    endDate: '2026-10-26',
    participantsCount: 64,
    category: 'STEM',
    isJoined: false,
    myProgressHours: 0,
  },
];

export const SEED_LEADERBOARDS: Record<'today' | 'week' | 'month' | 'all', LeaderboardEntry[]> = {
  today: [
    { id: 'u1', uid: 'u1', name: 'James Scholz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', university: 'Oxford', studyField: 'Economics', hoursStudied: 9.5, xp: 380, streakDays: 45, rank: 1 },
    { id: 'u2', uid: 'u2', name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', university: 'Stanford', studyField: 'Neuroscience', hoursStudied: 8.0, xp: 320, streakDays: 22, rank: 2 },
    { id: 'u3', uid: 'u3', name: 'Kharma Medic', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', university: 'King\'s College London', studyField: 'Medicine', hoursStudied: 7.2, xp: 290, streakDays: 19, rank: 3 },
    { id: 'u4', uid: 'u4', name: 'Liam Davies', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', university: 'Cambridge', studyField: 'Law', hoursStudied: 6.5, xp: 260, streakDays: 14, rank: 4 },
    { id: 'u5', uid: 'u5', name: 'Aoi Tanaka', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', university: 'Tokyo University', studyField: 'Engineering', hoursStudied: 5.8, xp: 230, streakDays: 31, rank: 5 },
    { id: 'u6', uid: 'u6', name: 'Mateo Morales', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', university: 'MIT', studyField: 'Physics', hoursStudied: 5.2, xp: 210, streakDays: 9, rank: 6 },
  ],
  week: [
    { id: 'u1', uid: 'u1', name: 'James Scholz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', university: 'Oxford', studyField: 'Economics', hoursStudied: 46.5, xp: 1860, streakDays: 45, rank: 1 },
    { id: 'u3', uid: 'u3', name: 'Kharma Medic', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', university: 'King\'s College London', studyField: 'Medicine', hoursStudied: 42.0, xp: 1680, streakDays: 19, rank: 2 },
    { id: 'u2', uid: 'u2', name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', university: 'Stanford', studyField: 'Neuroscience', hoursStudied: 39.5, xp: 1580, streakDays: 22, rank: 3 },
    { id: 'u5', uid: 'u5', name: 'Aoi Tanaka', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', university: 'Tokyo University', studyField: 'Engineering', hoursStudied: 35.0, xp: 1400, streakDays: 31, rank: 4 },
    { id: 'u4', uid: 'u4', name: 'Liam Davies', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', university: 'Cambridge', studyField: 'Law', hoursStudied: 32.5, xp: 1300, streakDays: 14, rank: 5 },
    { id: 'u7', uid: 'u7', name: 'Nia Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', university: 'Harvard', studyField: 'Psychology', hoursStudied: 29.0, xp: 1160, streakDays: 11, rank: 6 },
  ],
  month: [
    { id: 'u1', uid: 'u1', name: 'James Scholz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', university: 'Oxford', studyField: 'Economics', hoursStudied: 178.0, xp: 7120, streakDays: 45, rank: 1 },
    { id: 'u2', uid: 'u2', name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', university: 'Stanford', studyField: 'Neuroscience', hoursStudied: 162.5, xp: 6500, streakDays: 22, rank: 2 },
    { id: 'u3', uid: 'u3', name: 'Kharma Medic', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', university: 'King\'s College London', studyField: 'Medicine', hoursStudied: 154.0, xp: 6160, streakDays: 19, rank: 3 },
    { id: 'u5', uid: 'u5', name: 'Aoi Tanaka', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', university: 'Tokyo University', studyField: 'Engineering', hoursStudied: 141.0, xp: 5640, streakDays: 31, rank: 4 },
    { id: 'u6', uid: 'u6', name: 'Mateo Morales', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', university: 'MIT', studyField: 'Physics', hoursStudied: 128.5, xp: 5140, streakDays: 9, rank: 5 },
  ],
  all: [
    { id: 'u1', uid: 'u1', name: 'James Scholz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', university: 'Oxford', studyField: 'Economics', hoursStudied: 840.0, xp: 33600, streakDays: 45, rank: 1 },
    { id: 'u5', uid: 'u5', name: 'Aoi Tanaka', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', university: 'Tokyo University', studyField: 'Engineering', hoursStudied: 720.0, xp: 28800, streakDays: 31, rank: 2 },
    { id: 'u2', uid: 'u2', name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', university: 'Stanford', studyField: 'Neuroscience', hoursStudied: 685.0, xp: 27400, streakDays: 22, rank: 3 },
    { id: 'u3', uid: 'u3', name: 'Kharma Medic', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', university: 'King\'s College London', studyField: 'Medicine', hoursStudied: 590.0, xp: 23600, streakDays: 19, rank: 4 },
  ],
};

export const DEFAULT_FRIENDS: FriendItem[] = [
  {
    id: 'f1',
    userUid: 'default',
    friendUid: 'user_elena',
    friendName: 'Elena Rostova',
    friendHandle: '@elena_law',
    friendAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    friendUniversity: 'University of Oxford',
  },
  {
    id: 'f2',
    userUid: 'default',
    friendUid: 'user_kenji',
    friendName: 'Kenji Sato',
    friendHandle: '@kenji_stem',
    friendAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    friendUniversity: 'Tokyo Institute of Technology',
  },
  {
    id: 'f3',
    userUid: 'default',
    friendUid: 'u5',
    friendName: 'Aoi Tanaka',
    friendHandle: '@aoi_eng',
    friendAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    friendUniversity: 'Tokyo University',
  },
];

export const SEED_USERS_DIRECTORY: UserSearchResult[] = [
  {
    id: 1,
    uid: 'user_ian',
    name: 'Ian Tumwebaze',
    handle: '@ian_dev',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    university: 'Makerere University',
    studyField: 'FullStack & AI Systems',
    totalHoursStudied: 215,
    currentStreak: 42,
    xp: 14800,
  },
  {
    id: 2,
    uid: 'user_elena',
    name: 'Elena Rostova',
    handle: '@elena_law',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    university: 'University of Oxford',
    studyField: 'Law & Jurisprudence (Bar Exam)',
    totalHoursStudied: 142,
    currentStreak: 22,
    xp: 6850,
  },
  {
    id: 3,
    uid: 'user_kenji',
    name: 'Kenji Sato',
    handle: '@kenji_stem',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    university: 'Tokyo Institute of Technology',
    studyField: 'Computer Science & Math',
    totalHoursStudied: 180,
    currentStreak: 28,
    xp: 8200,
  },
  {
    id: 4,
    uid: 'u1',
    name: 'James Scholz',
    handle: '@james_scholz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    university: 'University of Oxford',
    studyField: 'Economics & Mathematics',
    totalHoursStudied: 840,
    currentStreak: 45,
    xp: 33600,
  },
  {
    id: 5,
    uid: 'u2',
    name: 'Sophia Chen',
    handle: '@sophia_chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    university: 'Stanford University',
    studyField: 'Neuroscience & Pre-Med',
    totalHoursStudied: 685,
    currentStreak: 22,
    xp: 27400,
  },
  {
    id: 6,
    uid: 'u3',
    name: 'Kharma Medic',
    handle: '@kharma_medic',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    university: "King's College London",
    studyField: 'Medicine (MBBS)',
    totalHoursStudied: 590,
    currentStreak: 19,
    xp: 23600,
  },
  {
    id: 7,
    uid: 'u4',
    name: 'Liam Davies',
    handle: '@liam_davies',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    university: 'University of Cambridge',
    studyField: 'Law',
    totalHoursStudied: 325,
    currentStreak: 14,
    xp: 13000,
  },
  {
    id: 8,
    uid: 'u5',
    name: 'Aoi Tanaka',
    handle: '@aoi_eng',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    university: 'Tokyo University',
    studyField: 'Mechanical Engineering',
    totalHoursStudied: 720,
    currentStreak: 31,
    xp: 28800,
  },
  {
    id: 9,
    uid: 'u6',
    name: 'Mateo Morales',
    handle: '@mateo_mit',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    university: 'MIT',
    studyField: 'Physics & Quantum Computing',
    totalHoursStudied: 410,
    currentStreak: 18,
    xp: 16400,
  },
];

export const SEED_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    milestoneId: 'm1',
    userUid: 'user_elena',
    userName: 'Elena Rostova',
    userHandle: '@elena_law',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    university: 'University of Oxford',
    type: 'streak_milestone',
    title: 'Completed 22-Day Unbroken Streak Milestone',
    description: 'Finished constitutional case briefs and tort reform analysis. 142 total hours logged on platform.',
    subjectTag: 'BarExam',
    streakDays: 22,
    xpEarned: 150,
    cheersCount: 18,
    createdAt: '15m ago',
  },
  {
    id: 'm2',
    milestoneId: 'm2',
    userUid: 'user_kenji',
    userName: 'Kenji Sato',
    userHandle: '@kenji_stem',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    university: 'Tokyo Institute of Technology',
    type: 'session_completed',
    title: '90m Ultradian Sprint Finished: Distributed Systems',
    description: 'Raft consensus algorithm formal proof verification and Go cluster benchmarking.',
    subjectTag: 'Coding',
    streakDays: 28,
    xpEarned: 120,
    cheersCount: 24,
    createdAt: '42m ago',
  },
  {
    id: 'm3',
    milestoneId: 'm3',
    userUid: 'u5',
    userName: 'Aoi Tanaka',
    userHandle: '@aoi_eng',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    university: 'Tokyo University',
    type: 'challenge_completed',
    title: 'Conquered 35-Hour Weekly Challenge Goal',
    description: 'Finished thermodynamics midterm practice exams and FE Exam problem sets with 4 hours to spare.',
    subjectTag: 'Engineering',
    streakDays: 31,
    xpEarned: 250,
    cheersCount: 37,
    createdAt: '2h ago',
  },
  {
    id: 'm4',
    milestoneId: 'm4',
    userUid: 'u1',
    userName: 'James Scholz',
    userHandle: '@james_scholz',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    university: 'University of Oxford',
    type: 'session_completed',
    title: 'Completed 5-Hour Silent Deep Focus Marathon',
    description: 'Econometrics regression models and macro-labor market dynamics.',
    subjectTag: 'DeepWork',
    streakDays: 45,
    xpEarned: 300,
    cheersCount: 52,
    createdAt: '3h ago',
  },
  {
    id: 'm5',
    milestoneId: 'm5',
    userUid: 'u2',
    userName: 'Sophia Chen',
    userHandle: '@sophia_chen',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    university: 'Stanford University',
    type: 'streak_milestone',
    title: 'Hit 22 Days Daily Habit Goal',
    description: 'Cardiovascular physiology flashcard drills and renal clearance equation review.',
    subjectTag: 'USMLE',
    streakDays: 22,
    xpEarned: 100,
    cheersCount: 29,
    createdAt: '5h ago',
  },
];
