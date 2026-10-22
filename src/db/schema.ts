import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (PostgreSQL relational storage linked with Supabase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Supabase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  handle: text('handle'), // unique username e.g. ian_dev
  avatar: text('avatar'),
  university: text('university'),
  studyField: text('study_field'),
  xp: integer('xp').default(0).notNull(),
  totalHoursStudied: integer('total_hours_studied').default(0).notNull(),
  currentStreak: integer('current_streak').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Focus Session Logs table
export const focusLogs = pgTable('focus_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  category: text('category').notNull(), // deep_work, recall, review
  subject: text('subject').notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow(),
});

// Study Challenges table (Community & Friends Study Competitions)
export const studyChallenges = pgTable('study_challenges', {
  id: serial('id').primaryKey(),
  challengeId: text('challenge_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  creatorUid: text('creator_uid').notNull(),
  creatorName: text('creator_name').notNull(),
  creatorAvatar: text('creator_avatar'),
  targetHours: integer('target_hours').notNull(),
  period: text('period').notNull(), // 'today', 'weekend', '7_days', '14_days', '30_days'
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  participantsCount: integer('participants_count').default(1).notNull(),
  category: text('category').default('General').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Challenge Participants table (Tracking competition leaderboard per challenge)
export const challengeParticipants = pgTable('challenge_participants', {
  id: serial('id').primaryKey(),
  challengeId: text('challenge_id').notNull(),
  userUid: text('user_uid').notNull(),
  userName: text('user_name').notNull(),
  userAvatar: text('user_avatar'),
  studiedMinutes: integer('studied_minutes').default(0).notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Friendships table (tracking who added whom as friends)
export const friendships = pgTable('friendships', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  friendUid: text('friend_uid').notNull(),
  friendName: text('friend_name').notNull(),
  friendHandle: text('friend_handle'),
  friendAvatar: text('friend_avatar'),
  friendUniversity: text('friend_university'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Milestones & Activity Feed items
export const milestones = pgTable('milestones', {
  id: serial('id').primaryKey(),
  milestoneId: text('milestone_id').notNull().unique(),
  userUid: text('user_uid').notNull(),
  userName: text('user_name').notNull(),
  userHandle: text('user_handle'),
  userAvatar: text('user_avatar'),
  university: text('university'),
  type: text('type').default('session_completed').notNull(), // 'session_completed', 'streak_milestone', 'challenge_completed'
  title: text('title').notNull(),
  description: text('description').notNull(),
  subjectTag: text('subject_tag'),
  streakDays: integer('streak_days').default(1).notNull(),
  xpEarned: integer('xp_earned').default(50).notNull(),
  cheersCount: integer('cheers_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Legacy tables preserved for compatibility
export const studySpaces = pgTable('study_spaces', {
  id: serial('id').primaryKey(),
  spaceId: text('space_id').notNull().unique(),
  name: text('name').notNull(),
  tagline: text('tagline'),
  subjectTag: text('subject_tag').notNull(),
  hostUid: text('host_uid').notNull(),
  hostName: text('host_name').notNull(),
  hostAvatar: text('host_avatar'),
  mode: text('mode').default('pomodoro').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  workMin: integer('work_min').default(50).notNull(),
  breakMin: integer('break_min').default(10).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studyDecks = pgTable('study_decks', {
  id: serial('id').primaryKey(),
  deckId: text('deck_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  subjectTag: text('subject_tag').notNull(),
  curriculum: text('curriculum').default('General'),
  cardsCount: integer('cards_count').default(0).notNull(),
  authorUid: text('author_uid').notNull(),
  authorName: text('author_name').notNull(),
  cardsJson: text('cards_json'),
  rating: integer('rating').default(5).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  focusLogs: many(focusLogs),
  challengeParticipants: many(challengeParticipants),
}));

export const focusLogsRelations = relations(focusLogs, ({ one }) => ({
  user: one(users, {
    fields: [focusLogs.userUid],
    references: [users.uid],
  }),
}));

export const studyChallengesRelations = relations(studyChallenges, ({ many }) => ({
  participants: many(challengeParticipants),
}));
