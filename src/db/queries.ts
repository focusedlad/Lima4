import { db } from './index';
import { users, focusLogs, studyChallenges, challengeParticipants, friendships, milestones, milestoneCheers } from './schema';
import { eq, desc, sql, or, and, gt, gte, ilike, inArray, notInArray } from 'drizzle-orm';

export interface UserSyncInput {
  uid: string;
  email: string;
  name: string;
  handle?: string;
  avatar?: string;
  university?: string;
  studyField?: string;
  countryCode?: string;
  countryName?: string;
  currentSubject?: string;
  currentGoal?: string;
  isGhostMode?: boolean;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  xp?: number;
  totalHoursStudied?: number;
  currentStreak?: number;
}

export async function upsertUser(input: UserSyncInput) {
  try {
    const userHandle = input.handle || input.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const result = await db
      .insert(users)
      .values({
        uid: input.uid,
        email: input.email,
        name: input.name,
        handle: userHandle,
        avatar: input.avatar || '',
        university: input.university || '',
        studyField: input.studyField || '',
        countryCode: input.countryCode || 'GLOBAL',
        countryName: input.countryName || 'Global',
        currentSubject: input.currentSubject || 'General Study',
        currentGoal: input.currentGoal || '',
        isGhostMode: input.isGhostMode ?? false,
        subscriptionTier: input.subscriptionTier || 'free',
        subscriptionStatus: input.subscriptionStatus || 'active',
        termsAccepted: input.termsAccepted ?? false,
        termsAcceptedAt: input.termsAcceptedAt ? new Date(input.termsAcceptedAt) : null,
        termsVersion: input.termsVersion || null,
        xp: input.xp || 0,
        totalHoursStudied: input.totalHoursStudied || 0,
        currentStreak: input.currentStreak || 1,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: input.email,
          name: input.name,
          handle: userHandle,
          avatar: input.avatar || '',
          university: input.university || '',
          studyField: input.studyField || '',
          countryCode: input.countryCode || 'GLOBAL',
          countryName: input.countryName || 'Global',
          currentSubject: input.currentSubject || 'General Study',
          currentGoal: input.currentGoal || '',
          isGhostMode: input.isGhostMode ?? false,
          subscriptionTier: input.subscriptionTier || 'free',
          subscriptionStatus: input.subscriptionStatus || 'active',
          termsAccepted: input.termsAccepted ?? false,
          termsAcceptedAt: input.termsAcceptedAt ? new Date(input.termsAcceptedAt) : undefined,
          termsVersion: input.termsVersion || null,
          xp: input.xp || 0,
          totalHoursStudied: input.totalHoursStudied || 0,
          currentStreak: input.currentStreak || 1,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database upsertUser failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return user || null;
  } catch (error) {
    console.error('Database getUserByUid failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getRegisteredUserCount(): Promise<number> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(sql`${users.uid} ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`);
    return Number(result?.count || 0);
  } catch (error) {
    console.error('Database getRegisteredUserCount failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function insertFocusLog(input: {
  userUid: string;
  durationMinutes: number;
  category: string;
  subject: string;
  xpEarned: number;
  date: string;
}) {
  try {
    const result = await db
      .insert(focusLogs)
      .values({
        userUid: input.userUid,
        durationMinutes: input.durationMinutes,
        category: input.category,
        subject: input.subject,
        xpEarned: input.xpEarned,
        date: input.date,
      })
      .returning();

    // Progress belongs to each challenge the authenticated user has joined.
    await db
      .update(challengeParticipants)
      .set({ studiedMinutes: sql`${challengeParticipants.studiedMinutes} + ${input.durationMinutes}` })
      .where(eq(challengeParticipants.userUid, input.userUid));

    // User totals are synchronized from the authenticated profile endpoint; do not increment twice.

    return result[0];
  } catch (error) {
    console.error('Database insertFocusLog failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getFocusLogsByUser(userUid: string) {
  try {
    return await db
      .select()
      .from(focusLogs)
      .where(eq(focusLogs.userUid, userUid))
      .orderBy(desc(focusLogs.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database getFocusLogsByUser failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function insertStudyChallenge(input: {
  challengeId: string;
  title: string;
  description?: string;
  creatorUid: string;
  creatorName: string;
  creatorAvatar?: string;
  targetHours: number;
  period: string;
  startDate: string;
  endDate: string;
  category?: string;
}) {
  try {
    const result = await db
      .insert(studyChallenges)
      .values({
        challengeId: input.challengeId,
        title: input.title,
        description: input.description || '',
        creatorUid: input.creatorUid,
        creatorName: input.creatorName,
        creatorAvatar: input.creatorAvatar || '',
        targetHours: input.targetHours,
        period: input.period,
        startDate: input.startDate,
        endDate: input.endDate,
        category: input.category || 'General',
        participantsCount: 1,
      })
      .returning();

    // Auto add creator as participant
    await db.insert(challengeParticipants).values({
      challengeId: input.challengeId,
      userUid: input.creatorUid,
      userName: input.creatorName,
      userAvatar: input.creatorAvatar || '',
      studiedMinutes: 0,
    });

    return result[0];
  } catch (error) {
    console.error('Database insertStudyChallenge failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getJoinedChallengeProgress(userUid: string) {
  try {
    return await db
      .select({ challengeId: challengeParticipants.challengeId, studiedMinutes: challengeParticipants.studiedMinutes })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.userUid, userUid));
  } catch (error) {
    console.error('Database getJoinedChallengeProgress failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getAllStudyChallenges() {
  try {
    return await db.select().from(studyChallenges).orderBy(desc(studyChallenges.createdAt)).limit(50);
  } catch (error) {
    console.error('Database getAllStudyChallenges failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function joinStudyChallenge(input: {
  challengeId: string;
  userUid: string;
  userName: string;
  userAvatar?: string;
}) {
  try {
    // Check if already joined
    const existing = await db
      .select()
      .from(challengeParticipants)
      .where(
        sql`${challengeParticipants.challengeId} = ${input.challengeId} AND ${challengeParticipants.userUid} = ${input.userUid}`
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(challengeParticipants).values({
        challengeId: input.challengeId,
        userUid: input.userUid,
        userName: input.userName,
        userAvatar: input.userAvatar || '',
        studiedMinutes: 0,
      });

      await db
        .update(studyChallenges)
        .set({
          participantsCount: sql`${studyChallenges.participantsCount} + 1`,
        })
        .where(eq(studyChallenges.challengeId, input.challengeId));
    }

    return { success: true };
  } catch (error) {
    console.error('Database joinStudyChallenge failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getChallengeLeaderboard(challengeId: string) {
  try {
    return await db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challengeId))
      .orderBy(desc(challengeParticipants.studiedMinutes))
      .limit(50);
  } catch (error) {
    console.error('Database getChallengeLeaderboard failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getLeaderboardByTimeframe(timeframe: 'today' | 'week' | 'month' | 'all') {
  try {
    if (timeframe === 'all') {
      return await db
        .select({ id: users.id, uid: users.uid, name: users.name, handle: users.handle, avatar: users.avatar, university: users.university, studyField: users.studyField, totalHoursStudied: users.totalHoursStudied, xp: users.xp, currentStreak: users.currentStreak })
        .from(users)
        .where(and(eq(users.isGhostMode, false), or(gt(users.totalHoursStudied, 0), gt(users.xp, 0))))
        .orderBy(desc(users.totalHoursStudied), desc(users.xp))
        .limit(50);
    }

    const now = new Date();
    const start = new Date(now);
    if (timeframe === 'week') {
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
    } else if (timeframe === 'month') {
      start.setDate(1);
    }
    const startDate = start.toISOString().slice(0, 10);
    const aggregates = await db
      .select({ uid: focusLogs.userUid, minutes: sql<number>`COALESCE(SUM(${focusLogs.durationMinutes}), 0)::int`, xp: sql<number>`COALESCE(SUM(${focusLogs.xpEarned}), 0)::int` })
      .from(focusLogs)
      .where(gte(focusLogs.date, startDate))
      .groupBy(focusLogs.userUid);
    if (!aggregates.length) return [];
    const aggregateByUid = new Map(aggregates.map((row) => [row.uid, row]));
    const members = await db
      .select({ id: users.id, uid: users.uid, name: users.name, handle: users.handle, avatar: users.avatar, university: users.university, studyField: users.studyField, totalHoursStudied: users.totalHoursStudied, xp: users.xp, currentStreak: users.currentStreak })
      .from(users)
      .where(and(eq(users.isGhostMode, false), inArray(users.uid, aggregates.map((row) => row.uid))));
    return members
      .map((member) => {
        const stats = aggregateByUid.get(member.uid);
        return { ...member, totalHoursStudied: Math.round(((stats?.minutes || 0) / 60) * 100) / 100, xp: Number(stats?.xp || 0) };
      })
      .filter((member) => member.totalHoursStudied > 0 || member.xp > 0)
      .sort((a, b) => b.totalHoursStudied - a.totalHoursStudied || b.xp - a.xp)
      .slice(0, 50);
  } catch (error) {
    console.error('Database getLeaderboardByTimeframe failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

// Friendship Queries
export async function addFriend(input: {
  userUid: string;
  friendUid: string;
  friendName: string;
  friendHandle?: string;
  friendAvatar?: string;
  friendUniversity?: string;
}) {
  try {
    const existing = await db
      .select()
      .from(friendships)
      .where(
        sql`${friendships.userUid} = ${input.userUid} AND ${friendships.friendUid} = ${input.friendUid}`
      )
      .limit(1);

    if (existing.length === 0) {
      const res = await db
        .insert(friendships)
        .values({
          userUid: input.userUid,
          friendUid: input.friendUid,
          friendName: input.friendName,
          friendHandle: input.friendHandle || '',
          friendAvatar: input.friendAvatar || '',
          friendUniversity: input.friendUniversity || '',
        })
        .returning();
      return res[0];
    }
    return existing[0];
  } catch (error) {
    console.error('Database addFriend failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function removeFriend(userUid: string, friendUid: string) {
  try {
    await db
      .delete(friendships)
      .where(
        sql`${friendships.userUid} = ${userUid} AND ${friendships.friendUid} = ${friendUid}`
      );
    return { success: true };
  } catch (error) {
    console.error('Database removeFriend failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getFriendsByUser(userUid: string) {
  try {
    return await db
      .select()
      .from(friendships)
      .where(eq(friendships.userUid, userUid))
      .orderBy(desc(friendships.createdAt));
  } catch (error) {
    console.error('Database getFriendsByUser failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function searchUsersByQuery(query: string) {
  try {
    const clean = query.trim().replace(/^@/, '');
    if (!clean) return [];
    return await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        handle: users.handle,
        avatar: users.avatar,
        university: users.university,
        studyField: users.studyField,
        totalHoursStudied: users.totalHoursStudied,
        currentStreak: users.currentStreak,
        xp: users.xp,
      })
      .from(users)
      .where(
        and(
          eq(users.isGhostMode, false),
          or(
            ilike(users.handle, `%${clean}%`),
            ilike(users.name, `%${clean}%`),
            ilike(users.university, `%${clean}%`)
          )
        )
      )
      .limit(20);
  } catch (error) {
    console.error('Database searchUsersByQuery failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

// Milestone & Activity Feed Queries
export async function insertMilestone(input: {
  milestoneId: string;
  userUid: string;
  userName: string;
  userHandle?: string;
  userAvatar?: string;
  university?: string;
  type?: string;
  title: string;
  description: string;
  subjectTag?: string;
  streakDays?: number;
  xpEarned?: number;
}) {
  try {
    const result = await db
      .insert(milestones)
      .values({
        milestoneId: input.milestoneId,
        userUid: input.userUid,
        userName: input.userName,
        userHandle: input.userHandle || '',
        userAvatar: input.userAvatar || '',
        university: input.university || '',
        type: input.type || 'session_completed',
        title: input.title,
        description: input.description,
        subjectTag: input.subjectTag || '',
        streakDays: input.streakDays || 1,
        xpEarned: input.xpEarned || 50,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database insertMilestone failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getMilestonesFeed(userUid?: string, friendsOnly?: boolean) {
  try {
    const ghostRows = await db.select({ uid: users.uid }).from(users).where(eq(users.isGhostMode, true));
    const ghostUids = ghostRows.map((row) => row.uid);
    if (friendsOnly && userUid) {
      const friendRows = await db
        .select({ friendUid: friendships.friendUid })
        .from(friendships)
        .where(eq(friendships.userUid, userUid));
      const friendUids = [...new Set([...friendRows.map((f) => f.friendUid), userUid])].filter((uid) => !ghostUids.includes(uid));
      if (!friendUids.length) return [];
      return await db
        .select()
        .from(milestones)
        .where(inArray(milestones.userUid, friendUids))
        .orderBy(desc(milestones.createdAt))
        .limit(50);
    }
    const query = db.select().from(milestones);
    if (ghostUids.length) {
      return await db.select().from(milestones).where(notInArray(milestones.userUid, ghostUids)).orderBy(desc(milestones.createdAt)).limit(50);
    }
    return await query.orderBy(desc(milestones.createdAt)).limit(50);
  } catch (error) {
    console.error('Database getMilestonesFeed failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getCheeredMilestoneIds(userUid: string, milestoneIds: string[]) {
  if (!milestoneIds.length) return [];
  try {
    return await db
      .select({ milestoneId: milestoneCheers.milestoneId })
      .from(milestoneCheers)
      .where(and(eq(milestoneCheers.userUid, userUid), inArray(milestoneCheers.milestoneId, milestoneIds)));
  } catch (error) {
    console.error('Database getCheeredMilestoneIds failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function cheerMilestoneInDb(milestoneId: string, userUid: string) {
  try {
    const inserted = await db
      .insert(milestoneCheers)
      .values({ milestoneId, userUid })
      .onConflictDoNothing()
      .returning({ id: milestoneCheers.id });
    if (!inserted.length) return { success: true, alreadyCheered: true };
    await db
      .update(milestones)
      .set({ cheersCount: sql`${milestones.cheersCount} + 1` })
      .where(eq(milestones.milestoneId, milestoneId));
    return { success: true, alreadyCheered: false };
  } catch (error) {
    console.error('Database cheerMilestone failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}
