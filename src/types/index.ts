export type FocusCategory = 'deep_work' | 'recall' | 'review';

export type UserStatus = 'in_focus' | 'on_break' | 'away';

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  universities: string[];
}

export type UserRole = 'student' | 'moderator' | 'employee' | 'admin' | 'superadmin';

export interface UserProfile {
  id: string;
  name: string;
  handle?: string;
  email?: string;
  avatar: string;
  bio?: string;
  bannerUrl?: string;
  profileVisibility?: 'public' | 'friends' | 'private';
  sessionVisibility?: 'private' | 'friends' | 'public';
  universityOrLocation: string;
  countryCode?: string;
  countryName?: string;
  countryFlag?: string;
  university?: string;
  studyField?: string;
  isGhostMode: boolean; // if true, study sessions are private and unlisted from public directory & feeds
  currentSubject: string;
  currentGoal: string;
  status: UserStatus;
  currentStreak: number;
  totalHoursStudied: number;
  xp: number;
  role?: UserRole;
  subscriptionTier?: 'free' | 'pro' | 'campus_elite' | string;
  subscriptionStatus?: 'active' | 'trial' | 'expired' | 'canceled';
  isSuspended?: boolean;
  joinedDate?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  deskPet: {
    name: string;
    species: 'shiba' | 'capybara' | 'owl';
    level: number;
    currentXp: number;
    nextLevelXp: number;
    mood: 'focused' | 'happy' | 'sleepy';
    decorations: string[];
  };
}

export interface PeerUser {
  id: string;
  name: string;
  avatar: string;
  location: string;
  countryFlag?: string;
  university?: string;
  subjectTag: string;
  currentGoal: string;
  status: UserStatus;
  streakDays: number;
  focusMinutesToday: number;
  cameraOn?: boolean;
}

export interface StudySpace {
  id: string;
  name: string;
  tagline: string;
  subjectTag: string;
  location: string;
  countryCode?: string;
  countryFlag?: string;
  university?: string;
  isGhostMode?: boolean; // if true, hidden from public global list & country feeds
  mode: 'pomodoro' | 'flowtime' | 'animedoro' | 'discussion';
  isPrivate: boolean;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  currentMembers: PeerUser[];
  maxCapacity: number;
  currentStreamUrl?: string;
  isSilentMode: boolean;
  pomodoroInterval: {
    work: number;
    breakTime: number;
  };
  breakScheduleText?: string;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  countryFlag: string;
  countryName: string;
  university: string;
  type: 'session_completed' | 'streak_milestone' | 'desk_pet_level' | 'deck_created' | 'battle_won';
  title: string;
  description: string;
  xpEarned?: number;
  streakDays?: number;
  timestamp: string;
  cheersCount: number;
  userHasCheered?: boolean;
  subjectTag?: string;
}

export interface AdmissionRequest {
  id: string;
  spaceId: string;
  spaceName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  studyGoal: string;
  subjectTag: string;
  streakDays: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  options?: string[];
  hint?: string;
  explanation?: string;
  cardType: 'recall' | 'multiple_choice' | 'fill_in';
  srsInterval: number; // in days
  easeFactor: number; // e.g. 2.5
  consecutiveCorrect: number;
  lastReviewedAt?: string;
  nextReviewAt: string;
}

export interface StudyDeck {
  id: string;
  title: string;
  description: string;
  subjectTag: string;
  curriculum: string; // e.g. "MCAT", "USMLE Step 1", "AP Biology", "CS Algorithm"
  cardsCount: number;
  cards: Flashcard[];
  isPublic: boolean;
  authorName: string;
  authorAvatar: string;
  rating: number;
  reviewsDueCount: number;
  createdAt: string;
}

export interface LiveBattlePlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  combo: number;
  currentAnswer?: string | null;
  isCorrect?: boolean | null;
  statusText: string;
}

export type VideoSourceType = 'youtube' | 'vimeo' | 'direct' | 'embed';

export interface YouTubeCreator {
  id: string;
  name: string;
  channelTitle: string;
  avatar: string;
  subscribers: string;
  isLive: boolean;
  streamTitle?: string;
  videoId: string; // e.g. youtube video ID, vimeo ID, or unique identifier
  currentSessionMode: string;
  pomodoroWorkMin: number;
  pomodoroBreakMin: number;
  liveViewers?: number;
  isSubscribed: boolean;
  // Generic / Any Video Link Support:
  sourceType?: VideoSourceType;
  videoUrl?: string; // Original URL entered by user
  directVideoUrl?: string; // HTML5 video source (.mp4, .webm, etc.)
  embedUrl?: string; // Direct embed URL (for Vimeo, iframe, etc.)
  isCustomUrl?: boolean;
}

export interface FocusSessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  category: FocusCategory;
  subject: string;
  xpEarned: number;
}

export interface DayActivity {
  date: string;
  dayNumber: number;
  hours: number;
  deepWorkHours: number;
  recallHours: number;
  reviewHours: number;
  sessionsCount: number;
}

export interface SubscriptionTierLimits {
  magicImportsPerDay: number; // -1 for unlimited
  canCreatePrivateRooms: boolean;
  canUseGhostMode: boolean;
  hasPriorityTutor: boolean;
  unlimitedDecks: boolean;
  maxMembersInRoom: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge: string;
  badgeColor?: string;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
  limits: SubscriptionTierLimits;
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'event' | 'update' | 'maintenance';
  priority: 'normal' | 'high' | 'urgent';
  author: string;
  createdAt: string;
  isActive: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

export type EmployeePermission =
  | 'overview'
  | 'users'
  | 'spaces'
  | 'announcements'
  | 'subscriptions'
  | 'settings'
  | 'team';

export interface EmployeeAccount {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  status: 'active' | 'suspended';
  permissions: EmployeePermission[];
  accessKey: string;
  hiredAt: string;
  lastActive: string;
}

export interface SystemSettings {
  platformName: string;
  tagline: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  allowNewSignups: boolean;
  defaultPomodoroWork: number;
  defaultPomodoroBreak: number;
  xpMultiplier: number;
  freeDailyAiLimit: number;
  proDailyAiLimit: number;
  ghostModeAllowedForFree: boolean;
  superAdminEmail: string;
}
