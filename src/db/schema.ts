import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (PostgreSQL relational storage linked with Firebase UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  university: text('university'),
  studyField: text('study_field'),
  xp: integer('xp').default(0).notNull(),
  totalHoursStudied: integer('total_hours_studied').default(0).notNull(),
  currentStreak: integer('current_streak').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Study Spaces table
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

// Flashcard Study Decks table
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
  studyDecks: many(studyDecks),
}));

export const focusLogsRelations = relations(focusLogs, ({ one }) => ({
  user: one(users, {
    fields: [focusLogs.userUid],
    references: [users.uid],
  }),
}));

export const studyDecksRelations = relations(studyDecks, ({ one }) => ({
  author: one(users, {
    fields: [studyDecks.authorUid],
    references: [users.uid],
  }),
}));
