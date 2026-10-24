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
  visibility?: 'public' | 'friends' | 'private';
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

function getAuthRedirectUrl(): string {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') return window.location.origin;
  if (hostname.endsWith('.vercel.app') || hostname === 'lima4.vercel.app') return 'https://lima4.vercel.app';
  return window.location.origin;
}

async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await getActiveSupabaseClient().auth.getSession();
  if (!session?.user) throw new Error('Please sign in to use community features.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', 'Bearer ' + session.access_token);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(input, { ...init, headers });
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
        options: { redirectTo: getAuthRedirectUrl() },
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
        options: { redirectTo: getAuthRedirectUrl() },
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
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed.' };
    }
  },
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured.' };
    try {
      const { error } = await getActiveSupabaseClient().auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: getAuthRedirectUrl() },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not resend verification email.' };
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
          handle: user.handle,
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
    const res = await authenticatedFetch('/api/db/challenges');
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || 'Could not load saved challenges.');
    }
    if (!json.success || !Array.isArray(json.challenges)) {
      throw new Error(json.error || 'The server returned an invalid challenge list.');
    }
    return json.challenges;
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
    visibility?: 'public' | 'friends' | 'private';
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

    const response = await authenticatedFetch('/api/db/challenges', {
      method: 'POST',
      body: JSON.stringify({
        title: newChallenge.title, description: newChallenge.description,
        targetHours: newChallenge.targetHours, period: newChallenge.period, category: newChallenge.category,
        visibility: input.visibility || 'public',
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.challenge) throw new Error(payload.error || 'The challenge could not be saved.');
    return { ...newChallenge, ...payload.challenge, id: payload.challenge.id || payload.challenge.challengeId, isJoined: true, myProgressHours: 0 };
  },

  /**
   * Join an existing challenge
   */
  async joinChallenge(challengeId: string, user: UserProfile): Promise<void> {
    const response = await authenticatedFetch('/api/db/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Could not join this challenge.');
    }
  },

  /**
   * Fetch Leaderboard for specific timeframe
   */
  async fetchLeaderboard(timeframe: 'today' | 'week' | 'month' | 'all'): Promise<LeaderboardEntry[]> {
    try {
      const res = await authenticatedFetch(`/api/db/leaderboard?timeframe=${timeframe}`);
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
      const res = await authenticatedFetch(`/api/db/friends?userUid=${encodeURIComponent(userUid)}`);
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
    if (!friend.uid || friend.uid === userUid) throw new Error('Choose another registered member.');
    const response = await authenticatedFetch('/api/db/friends', {
      method: 'POST',
      body: JSON.stringify({ friendUid: friend.uid }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Could not add this member.');
    }
  },

  /**
   * Remove friend connection
   */
  async removeFriend(userUid: string, friendUid: string): Promise<void> {
    const response = await authenticatedFetch(`/api/db/friends/${encodeURIComponent(friendUid)}?userUid=${encodeURIComponent(userUid)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Could not remove this member.');
    }
  },

  /**
   * Search studiers by handle, name, or university
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const res = await authenticatedFetch(`/api/db/users/search?q=${encodeURIComponent(query)}`);
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
      const res = await authenticatedFetch(`/api/db/milestones?friendsOnly=${friendsOnly}&userUid=${encodeURIComponent(userUid)}`);
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

    const response = await authenticatedFetch('/api/db/milestones', {
      method: 'POST',
      body: JSON.stringify({
        title: newMilestone.title, description: newMilestone.description,
        subjectTag: newMilestone.subjectTag, type: newMilestone.type,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.milestone) throw new Error(payload.error || 'The milestone could not be published.');
    return { ...newMilestone, ...payload.milestone, id: payload.milestone.milestoneId || payload.milestone.id };
  },

  /**
   * Cheer a milestone
   */
  async cheerMilestone(milestoneId: string): Promise<{ alreadyCheered: boolean }> {
    const response = await authenticatedFetch(`/api/db/milestones/${encodeURIComponent(milestoneId)}/cheer`, { method: 'POST' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Could not cheer this milestone.');
    return { alreadyCheered: Boolean(payload.alreadyCheered) };
  },
};
