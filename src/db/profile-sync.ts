import { db } from './index.js';
import { users } from './schema.js';

export type PublicProfileSync = {
  uid: string;
  email: string;
  name: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  bannerUrl?: string;
  profileVisibility?: 'public' | 'friends' | 'private';
  sessionVisibility?: 'private' | 'friends' | 'public';
  university?: string;
  studyField?: string;
  countryCode?: string;
  countryName?: string;
  currentSubject?: string;
  currentGoal?: string;
  isGhostMode?: boolean;
};

// Only user-editable profile fields are updated here. Subscription, XP, study totals,
// streaks and legal acceptance are server-owned and cannot be overwritten by a client sync.
export async function syncPublicProfile(input: PublicProfileSync) {
  const handle = input.handle || input.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 32);
  const [user] = await db.insert(users).values({
    uid: input.uid,
    email: input.email,
    name: input.name,
    handle,
    avatar: input.avatar || '',
    bio: input.bio || '',
    bannerUrl: input.bannerUrl || '',
    profileVisibility: input.profileVisibility || 'public',
    sessionVisibility: input.sessionVisibility || 'private',
    university: input.university || '',
    studyField: input.studyField || '',
    countryCode: input.countryCode || 'GLOBAL',
    countryName: input.countryName || 'Global',
    currentSubject: input.currentSubject || 'General Study',
    currentGoal: input.currentGoal || '',
    isGhostMode: input.isGhostMode ?? false,
  }).onConflictDoUpdate({
    target: users.uid,
    set: {
      email: input.email,
      name: input.name,
      handle,
      avatar: input.avatar || '',
      bio: input.bio || '',
      bannerUrl: input.bannerUrl || '',
      profileVisibility: input.profileVisibility || 'public',
      sessionVisibility: input.sessionVisibility || 'private',
      university: input.university || '',
      studyField: input.studyField || '',
      countryCode: input.countryCode || 'GLOBAL',
      countryName: input.countryName || 'Global',
      currentSubject: input.currentSubject || 'General Study',
      currentGoal: input.currentGoal || '',
      isGhostMode: input.isGhostMode ?? false,
    },
  }).returning();
  return user;
}
