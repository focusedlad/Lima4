import {
  UserProfile,
  StudySpace,
  StudyDeck,
  YouTubeCreator,
  AdmissionRequest,
  FocusSessionLog,
  DayActivity,
  ActivityFeedItem,
  SubscriptionPlan,
  GlobalAnnouncement,
  EmployeeAccount,
  SystemSettings,
} from '../types';

const USER_KEY = 'lumina_user_profile';
const SPACES_KEY = 'lumina_spaces';
const DECKS_KEY = 'lumina_decks';
const CREATORS_KEY = 'lumina_creators';
const ADMISSIONS_KEY = 'lumina_admissions';
const LOGS_KEY = 'lumina_focus_logs';
const FEED_KEY = 'lumina_activity_feed';
const USERS_LIST_KEY = 'lumina_all_users';
const PLANS_KEY = 'lumina_subscription_plans';
const ANNOUNCEMENTS_KEY = 'lumina_announcements';
const EMPLOYEES_KEY = 'lumina_employees';
const SETTINGS_KEY = 'lumina_system_settings';
const DB_VERSION_KEY = 'lumina_beta_real_users_v3';

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(DB_VERSION_KEY) !== 'true') {
      localStorage.removeItem(SPACES_KEY);
      localStorage.removeItem(DECKS_KEY);
      localStorage.removeItem(CREATORS_KEY);
      localStorage.removeItem(ADMISSIONS_KEY);
      localStorage.removeItem(ANNOUNCEMENTS_KEY);
      localStorage.removeItem(EMPLOYEES_KEY);
      localStorage.removeItem(FEED_KEY);
      localStorage.removeItem(USERS_LIST_KEY);
      localStorage.removeItem(LOGS_KEY);
      localStorage.removeItem('cheri_registered_accounts');
      localStorage.setItem(DB_VERSION_KEY, 'true');
    }
  } catch (_) {}
}

export const stripHashtags = (text?: string): string => {
  if (!text) return '';
  return text.replace(/^#+/, '').replace(/\s+#+/g, ' ').trim();
};

export const INITIAL_USER: UserProfile = {
  id: 'unauthenticated', name: 'New Studier', avatar: '',
  universityOrLocation: 'Independent Scholar', countryCode: 'GLOBAL', countryName: 'Global', countryFlag: '',
  university: 'Independent Scholar', studyField: 'General Studies', isGhostMode: false,
  currentSubject: 'General Study', currentGoal: 'Start your first focus session', status: 'in_focus',
  currentStreak: 0, totalHoursStudied: 0, xp: 0,
  deskPet: { name: 'Pip', species: 'owl', level: 1, currentXp: 0, nextLevelXp: 100, mood: 'focused', decorations: [] },
};

export const INITIAL_SPACES: StudySpace[] = [];

export const INITIAL_ADMISSIONS: AdmissionRequest[] = [];

export const INITIAL_DECKS: StudyDeck[] = [];

export const INITIAL_CREATORS: YouTubeCreator[] = [];

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Scholar',
    tagline: 'Essential focus tools and campus community access for every student.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: 'Standard',
    badgeColor: 'bg-stone-100 text-stone-700',
    isPopular: false,
    isActive: true,
    features: [
      'Access to Public Campus Study Rooms',
      '3 AI Magic Import Flashcard Decks / day',
      'Standard Spaced Repetition (SRS) Review',
      'Global Activity Feed & Cheer participation',
      'Basic Desk Pet companion',
      'Standard Pomodoro & Flowtime Timers',
    ],
    limits: {
      magicImportsPerDay: 3,
      canCreatePrivateRooms: false,
      canUseGhostMode: false,
      hasPriorityTutor: false,
      unlimitedDecks: false,
      maxMembersInRoom: 8,
    },
  },
  {
    id: 'pro',
    name: 'Pro Academic',
    tagline: 'High-yield AI mastery, private locked rooms, and unlimited active recall.',
    monthlyPrice: 9.99,
    yearlyPrice: 89.99,
    badge: 'Most Popular',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    isPopular: true,
    isActive: true,
    features: [
      'Unlimited AI Magic Imports (Notes, YouTube, PDF)',
      'Create Locked & Private Knock-to-Enter Rooms',
      'Ghost Mode: Complete incognito invisible studying',
      'Priority Socratic AI Flashcard Tutor',
      '4K Synchronized YouTube Study-With-Me Audio Radar',
      'Detailed 31-Day Neural Heatmap Analytics',
      'Custom Desk Pet Auras & Ambient Sounds',
    ],
    limits: {
      magicImportsPerDay: -1,
      canCreatePrivateRooms: true,
      canUseGhostMode: true,
      hasPriorityTutor: true,
      unlimitedDecks: true,
      maxMembersInRoom: 25,
    },
  },
  {
    id: 'campus_elite',
    name: 'Campus Elite',
    tagline: 'Ultimate institutional tier for university leaders, researchers, and power cohorts.',
    monthlyPrice: 19.99,
    yearlyPrice: 179.99,
    badge: 'Institutional',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    isPopular: false,
    isActive: true,
    features: [
      'Everything in Pro Academic tier',
      'Verified University Leader Badge on Global Feeds',
      'Host Massive Study Rooms (up to 100 members)',
      'Export Study Analytics & Flashcard Decks to Anki/PDF',
      'All Desk Pet Accessories & Mythic Evolutions unlocked',
      'Direct VIP feedback channel with Lumina engineers',
      'Cross-campus leaderboard pinned spotlights',
    ],
    limits: {
      magicImportsPerDay: -1,
      canCreatePrivateRooms: true,
      canUseGhostMode: true,
      hasPriorityTutor: true,
      unlimitedDecks: true,
      maxMembersInRoom: 100,
    },
  },
];

export const INITIAL_ANNOUNCEMENTS: GlobalAnnouncement[] = [];

export const INITIAL_EMPLOYEES: EmployeeAccount[] = [];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'Lumina Study',
  tagline: 'All-in-one social focus, global virtual campus, and AI-powered study platform.',
  maintenanceMode: false,
  maintenanceNotice: 'Lumina Study is undergoing scheduled infrastructure upgrades. We will be back shortly!',
  allowNewSignups: true,
  defaultPomodoroWork: 25,
  defaultPomodoroBreak: 5,
  xpMultiplier: 1.0,
  freeDailyAiLimit: 3,
  proDailyAiLimit: 100,
  ghostModeAllowedForFree: false,
  superAdminEmail: 'iantumwebaze75@gmail.com',
};

export const INITIAL_ALL_USERS: UserProfile[] = [];

export const generate31DayHeatmap = (): DayActivity[] => {
  const days: DayActivity[] = [];
  const today = new Date();
  for (let offset = 30; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    days.push({
      date: date.toISOString().slice(0, 10),
      dayNumber: date.getDate(),
      hours: 0,
      deepWorkHours: 0,
      recallHours: 0,
      reviewHours: 0,
      sessionsCount: 0,
    });
  }
  return days;
};

export class StorageService {
  public static getUser(): UserProfile {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (data) {
        const u = JSON.parse(data);
        if (u.currentSubject) u.currentSubject = stripHashtags(u.currentSubject);
        return u;
      }
    } catch (_) {}
    return INITIAL_USER;
  }

  public static saveUser(user: UserProfile) {
    try {
      if (user.currentSubject) user.currentSubject = stripHashtags(user.currentSubject);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (_) {}
  }

  public static getSpaces(): StudySpace[] {
    try {
      const data = localStorage.getItem(SPACES_KEY);
      if (data) {
        const list: StudySpace[] = JSON.parse(data);
        return list.map((s) => ({
          ...s,
          subjectTag: stripHashtags(s.subjectTag),
          currentMembers: s.currentMembers?.map((m) => ({
            ...m,
            subjectTag: stripHashtags(m.subjectTag),
          })) || [],
        }));
      }
    } catch (_) {}
    return [];
  }

  public static saveSpaces(spaces: StudySpace[]) {
    try {
      localStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
    } catch (_) {}
  }

  public static getDecks(): StudyDeck[] {
    try {
      const data = localStorage.getItem(DECKS_KEY);
      if (data) {
        const list: StudyDeck[] = JSON.parse(data);
        return list.map((d) => ({
          ...d,
          subjectTag: stripHashtags(d.subjectTag),
        }));
      }
    } catch (_) {}
    return [];
  }

  public static saveDecks(decks: StudyDeck[]) {
    try {
      localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
    } catch (_) {}
  }

  public static getCreators(): YouTubeCreator[] {
    try {
      const data = localStorage.getItem(CREATORS_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return [];
  }

  public static saveCreators(creators: YouTubeCreator[]) {
    try {
      localStorage.setItem(CREATORS_KEY, JSON.stringify(creators));
    } catch (_) {}
  }

  public static getAdmissions(): AdmissionRequest[] {
    try {
      const data = localStorage.getItem(ADMISSIONS_KEY);
      if (data) {
        const list: AdmissionRequest[] = JSON.parse(data);
        return list.map((a) => ({
          ...a,
          subjectTag: stripHashtags(a.subjectTag),
        }));
      }
    } catch (_) {}
    return INITIAL_ADMISSIONS;
  }

  public static saveAdmissions(admissions: AdmissionRequest[]) {
    try {
      localStorage.setItem(ADMISSIONS_KEY, JSON.stringify(admissions));
    } catch (_) {}
  }

  public static getFocusLogs(): FocusSessionLog[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      if (data) {
        const list: FocusSessionLog[] = JSON.parse(data);
        return list.map((l) => ({
          ...l,
          subject: stripHashtags(l.subject),
        }));
      }
    } catch (_) {}
    return [];
  }

  public static saveFocusLogs(logs: FocusSessionLog[]) {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (_) {}
  }

  public static getActivityFeed(): ActivityFeedItem[] {
    try {
      const data = localStorage.getItem(FEED_KEY);
      if (data) {
        const list: ActivityFeedItem[] = JSON.parse(data);
        return list.map((item) => ({
          ...item,
          subjectTag: item.subjectTag ? stripHashtags(item.subjectTag) : undefined,
        }));
      }
    } catch (_) {}
    return [];
  }

  public static saveActivityFeed(feed: ActivityFeedItem[]) {
    try {
      localStorage.setItem(FEED_KEY, JSON.stringify(feed));
    } catch (_) {}
  }

  public static getAllUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_LIST_KEY);
      if (data) {
        const list: UserProfile[] = JSON.parse(data);
        return list.map((u) => ({
          ...u,
          currentSubject: stripHashtags(u.currentSubject),
        }));
      }
    } catch (_) {}
    return [];
  }

  public static saveAllUsers(users: UserProfile[]) {
    try {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    } catch (_) {}
  }

  public static getSubscriptionPlans(): SubscriptionPlan[] {
    try {
      const data = localStorage.getItem(PLANS_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return INITIAL_SUBSCRIPTION_PLANS;
  }

  public static saveSubscriptionPlans(plans: SubscriptionPlan[]) {
    try {
      localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    } catch (_) {}
  }

  public static getAnnouncements(): GlobalAnnouncement[] {
    try {
      const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return INITIAL_ANNOUNCEMENTS;
  }

  public static saveAnnouncements(announcements: GlobalAnnouncement[]) {
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    } catch (_) {}
  }

  public static getEmployees(): EmployeeAccount[] {
    try {
      const data = localStorage.getItem(EMPLOYEES_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return [];
  }

  public static saveEmployees(employees: EmployeeAccount[]) {
    try {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } catch (_) {}
  }

  public static getSystemSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return INITIAL_SYSTEM_SETTINGS;
  }

  public static saveSystemSettings(settings: SystemSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}
  }


}
