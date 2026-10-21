import { db } from './index';
import { users, focusLogs, studySpaces, studyDecks } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface UserSyncInput {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  university?: string;
  studyField?: string;
  xp?: number;
  totalHoursStudied?: number;
  currentStreak?: number;
}

export async function upsertUser(input: UserSyncInput) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: input.uid,
        email: input.email,
        name: input.name,
        avatar: input.avatar || '',
        university: input.university || '',
        studyField: input.studyField || '',
        xp: input.xp || 0,
        totalHoursStudied: input.totalHoursStudied || 0,
        currentStreak: input.currentStreak || 1,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: input.email,
          name: input.name,
          avatar: input.avatar || '',
          university: input.university || '',
          studyField: input.studyField || '',
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

export async function upsertStudySpace(input: {
  spaceId: string;
  name: string;
  tagline?: string;
  subjectTag: string;
  hostUid: string;
  hostName: string;
  hostAvatar?: string;
  mode?: string;
  isPrivate?: boolean;
  workMin?: number;
  breakMin?: number;
}) {
  try {
    const result = await db
      .insert(studySpaces)
      .values({
        spaceId: input.spaceId,
        name: input.name,
        tagline: input.tagline || '',
        subjectTag: input.subjectTag,
        hostUid: input.hostUid,
        hostName: input.hostName,
        hostAvatar: input.hostAvatar || '',
        mode: input.mode || 'pomodoro',
        isPrivate: input.isPrivate ?? false,
        workMin: input.workMin ?? 50,
        breakMin: input.breakMin ?? 10,
      })
      .onConflictDoUpdate({
        target: studySpaces.spaceId,
        set: {
          name: input.name,
          tagline: input.tagline || '',
          subjectTag: input.subjectTag,
          workMin: input.workMin ?? 50,
          breakMin: input.breakMin ?? 10,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database upsertStudySpace failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getAllStudySpaces() {
  try {
    return await db.select().from(studySpaces).orderBy(desc(studySpaces.createdAt)).limit(50);
  } catch (error) {
    console.error('Database getAllStudySpaces failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function upsertStudyDeck(input: {
  deckId: string;
  title: string;
  description?: string;
  subjectTag: string;
  curriculum?: string;
  cardsCount: number;
  authorUid: string;
  authorName: string;
  cardsJson?: string;
  rating?: number;
}) {
  try {
    const result = await db
      .insert(studyDecks)
      .values({
        deckId: input.deckId,
        title: input.title,
        description: input.description || '',
        subjectTag: input.subjectTag,
        curriculum: input.curriculum || 'General',
        cardsCount: input.cardsCount,
        authorUid: input.authorUid,
        authorName: input.authorName,
        cardsJson: input.cardsJson || '[]',
        rating: input.rating ?? 5,
      })
      .onConflictDoUpdate({
        target: studyDecks.deckId,
        set: {
          title: input.title,
          description: input.description || '',
          cardsCount: input.cardsCount,
          cardsJson: input.cardsJson || '[]',
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database upsertStudyDeck failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getAllStudyDecks() {
  try {
    return await db.select().from(studyDecks).orderBy(desc(studyDecks.createdAt)).limit(50);
  } catch (error) {
    console.error('Database getAllStudyDecks failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}
