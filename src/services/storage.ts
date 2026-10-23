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
      localStorage.removeItem(ADMISSIONS_KEY);
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

export const INITIAL_DECKS: StudyDeck[] = [
  {
    id: 'deck_usmle_neuro',
    title: 'USMLE Step 1: High-Yield Neuro & Autonomic Pharmacology',
    description: 'Master cranial nerves, stroke syndromes, and cholinergic/adrenergic receptors with active recall.',
    subjectTag: 'USMLE',
    curriculum: 'USMLE Step 1',
    cardsCount: 6,
    isPublic: true,
    authorName: 'Dr. Marcus Reed',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewsDueCount: 4,
    createdAt: '2026-02-10T00:00:00Z',
    cards: [
      {
        id: 'c1',
        deckId: 'deck_usmle_neuro',
        front: 'Which cranial nerve exits the brainstem dorsally and wraps around the midbrain?',
        back: 'Cranial Nerve IV (Trochlear Nerve)',
        options: [
          'Cranial Nerve IV (Trochlear Nerve)',
          'Cranial Nerve III (Oculomotor Nerve)',
          'Cranial Nerve VI (Abducens Nerve)',
          'Cranial Nerve V (Trigeminal Nerve)',
        ],
        hint: 'It is the only CN that decussates prior to exiting the dorsal surface.',
        explanation: 'CN IV innervates the superior oblique muscle (inversion and downward gaze) and is particularly vulnerable to vertical head trauma.',
        cardType: 'multiple_choice',
        srsInterval: 1,
        easeFactor: 2.5,
        consecutiveCorrect: 2,
        nextReviewAt: 'Today',
      },
      {
        id: 'c2',
        deckId: 'deck_usmle_neuro',
        front: 'A lesion of the Left PPRF (paramedian pontine reticular formation) results in failure of conjugate horizontal gaze toward which side?',
        back: 'The Left (ipsilateral horizontal gaze palsy)',
        options: [
          'The Left (ipsilateral horizontal gaze palsy)',
          'The Right (contralateral gaze palsy)',
          'Both eyes upward gaze palsy',
          'Selective loss of pupillary light reflex',
        ],
        hint: 'PPRF = "look towards this side"',
        explanation: 'The PPRF directs conjugate gaze ipsilaterally by firing to the abducens nucleus, which communicates via the MLF with the contralateral oculomotor nucleus.',
        cardType: 'multiple_choice',
        srsInterval: 3,
        easeFactor: 2.6,
        consecutiveCorrect: 3,
        nextReviewAt: 'Tomorrow',
      },
      {
        id: 'c3',
        deckId: 'deck_usmle_neuro',
        front: 'The primary neurotransmitter released by preganglionic sympathetic neurons is _____ which acts on _____ receptors.',
        back: 'Acetylcholine (ACh); Nicotinic (Nn) receptors',
        options: [
          'Acetylcholine (ACh); Nicotinic (Nn) receptors',
          'Norepinephrine; Alpha-1 receptors',
          'Epinephrine; Beta-2 receptors',
          'Dopamine; D2 receptors',
        ],
        hint: 'All autonomic preganglionic fibers release the same transmitter.',
        explanation: 'Both sympathetic and parasympathetic preganglionic neurons utilize acetylcholine acting on nicotinic acetylcholine receptors at the autonomic ganglia.',
        cardType: 'fill_in',
        srsInterval: 1,
        easeFactor: 2.4,
        consecutiveCorrect: 1,
        nextReviewAt: 'Today',
      },
      {
        id: 'c4',
        deckId: 'deck_usmle_neuro',
        front: 'What clinical triad classically indicates Wernicke Encephalopathy?',
        back: 'Ophthalmoplegia (nystagmus), Ataxia, and Global Confusion',
        options: [
          'Ophthalmoplegia, Ataxia, and Global Confusion',
          'Tremor, Rigidity, and Bradykinesia',
          'Headache, Fever, and Nuchal Rigidity',
          'Hypotension, Jaundice, and RUQ Pain',
        ],
        hint: 'Due to acute thiamine (Vitamin B1) deficiency, especially with glucose loading.',
        explanation: 'Mammillary body necrosis from thiamine deficiency leads to the classic triad. Always administer thiamine before dextrose!',
        cardType: 'recall',
        srsInterval: 7,
        easeFactor: 2.7,
        consecutiveCorrect: 4,
        nextReviewAt: 'In 4 days',
      },
      {
        id: 'c5',
        deckId: 'deck_usmle_neuro',
        front: 'Occlusion of the PICA (posterior inferior cerebellar artery) results in Wallenberg syndrome (lateral medullary). Which nucleus deficit causes dysphagia and hoarseness?',
        back: 'Nucleus Ambiguus (CN IX, X, XI)',
        options: [
          'Nucleus Ambiguus (CN IX, X, XI)',
          'Hypoglossal Nucleus (CN XII)',
          'Solitary Nucleus (taste/visceral)',
          'Spinal Trigeminal Nucleus',
        ],
        hint: '"Don\'t pick a (PICA) horse (hoarseness) that can\'t eat (dysphagia)"',
        explanation: 'Nucleus ambiguus innervates the muscles of the pharynx, larynx, and upper esophagus. Its destruction leads to absent gag reflex, hoarseness, and dysphagia.',
        cardType: 'multiple_choice',
        srsInterval: 2,
        easeFactor: 2.5,
        consecutiveCorrect: 1,
        nextReviewAt: 'Today',
      },
      {
        id: 'c6',
        deckId: 'deck_usmle_neuro',
        front: 'Which drug is the first-line treatment for status epilepticus during active emergency management?',
        back: 'Intravenous Lorazepam (Benzodiazepine)',
        options: [
          'Intravenous Lorazepam (Benzodiazepine)',
          'Oral Carbamazepine',
          'Subcutaneous Sumatriptan',
          'Intravenous Haloperidol',
        ],
        hint: 'Enhances GABA-A receptor chloride conductance.',
        explanation: 'IV benzodiazepines (lorazepam or diazepam) are first line, followed by fosphenytoin/levetiracetam for seizure prophylaxis.',
        cardType: 'recall',
        srsInterval: 4,
        easeFactor: 2.5,
        consecutiveCorrect: 2,
        nextReviewAt: 'In 2 days',
      },
    ],
  },
  {
    id: 'deck_mcat_bio',
    title: 'MCAT Biological & Biochemical Foundations',
    description: 'Enzyme kinetics, amino acid stereochemistry, cellular respiration, and bioenergetics.',
    subjectTag: 'MCAT',
    curriculum: 'MCAT',
    cardsCount: 4,
    isPublic: true,
    authorName: 'Sarah Jenkins, MD-PhD',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewsDueCount: 3,
    createdAt: '2026-01-20T00:00:00Z',
    cards: [
      {
        id: 'mb1',
        deckId: 'deck_mcat_bio',
        front: 'In competitive enzyme inhibition, what happens to Km and Vmax?',
        back: 'Km increases (apparent affinity decreases); Vmax remains unchanged.',
        options: [
          'Km increases; Vmax remains unchanged.',
          'Km decreases; Vmax decreases.',
          'Km remains unchanged; Vmax decreases.',
          'Both Km and Vmax increase.',
        ],
        hint: 'Substrate can overcome the inhibitor at high concentrations.',
        explanation: 'Because the inhibitor binds to the active site, adding excess substrate overcomes it, leaving Vmax unchanged while requiring more substrate (higher Km).',
        cardType: 'multiple_choice',
        srsInterval: 3,
        easeFactor: 2.6,
        consecutiveCorrect: 2,
        nextReviewAt: 'Today',
      },
      {
        id: 'mb2',
        deckId: 'deck_mcat_bio',
        front: 'Which two amino acids contain sulfur atoms?',
        back: 'Methionine and Cysteine',
        options: [
          'Methionine and Cysteine',
          'Serine and Threonine',
          'Proline and Glycine',
          'Aspartate and Glutamate',
        ],
        hint: 'One can form covalent disulfide bridges.',
        explanation: 'Cysteine has a thiol (-SH) group forming disulfide bonds; methionine contains a thioether side chain.',
        cardType: 'recall',
        srsInterval: 7,
        easeFactor: 2.8,
        consecutiveCorrect: 4,
        nextReviewAt: 'In 3 days',
      },
      {
        id: 'mb3',
        deckId: 'deck_mcat_bio',
        front: 'The rate-limiting enzyme of glycolysis is _____ which is allosterically inhibited by ATP and citrate.',
        back: 'Phosphofructokinase-1 (PFK-1)',
        options: [
          'Phosphofructokinase-1 (PFK-1)',
          'Hexokinase',
          'Pyruvate Kinase',
          'Aldolase',
        ],
        hint: 'Catalyzes Fructose-6-phosphate to Fructose-1,6-bisphosphate.',
        explanation: 'PFK-1 is the primary committed step in glycolysis, activated by AMP and Fructose-2,6-bisphosphate.',
        cardType: 'fill_in',
        srsInterval: 2,
        easeFactor: 2.5,
        consecutiveCorrect: 1,
        nextReviewAt: 'Today',
      },
      {
        id: 'mb4',
        deckId: 'deck_mcat_bio',
        front: 'How many ATP equivalents are produced per complete oxidation of one glucose molecule in aerobic eukaryotic respiration?',
        back: 'Approximately 30 to 32 ATP',
        options: [
          'Approximately 30 to 32 ATP',
          'Exactly 38 ATP',
          '12 ATP',
          '2 ATP',
        ],
        hint: 'Depends on the glycerol-3-phosphate vs malate-aspartate shuttle.',
        explanation: 'Modern stoichiometry yields ~2.5 ATP per NADH and ~1.5 ATP per FADH2, summing to 30-32 ATP.',
        cardType: 'multiple_choice',
        srsInterval: 5,
        easeFactor: 2.5,
        consecutiveCorrect: 2,
        nextReviewAt: 'In 2 days',
      },
    ],
  },
  {
    id: 'deck_cs_dist',
    title: 'Advanced Distributed Systems & Consensus',
    description: 'Raft consensus, CAP theorem, Paxos leader elections, and vector clocks.',
    subjectTag: 'Coding',
    curriculum: 'CS Algorithm / Systems',
    cardsCount: 3,
    isPublic: true,
    authorName: 'Takeshi M.',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewsDueCount: 2,
    createdAt: '2026-02-28T00:00:00Z',
    cards: [
      {
        id: 'cs1',
        deckId: 'deck_cs_dist',
        front: 'In the Raft consensus algorithm, how does a candidate win a leader election?',
        back: 'By receiving votes from a strict majority (quorum: n/2 + 1) of nodes.',
        options: [
          'By receiving votes from a strict majority (n/2 + 1) of nodes.',
          'By having the highest CPU clock speed.',
          'By having the lowest node ID.',
          'By unanimous vote from all nodes.',
        ],
        hint: 'Quorum intersection guarantees only one leader per term.',
        explanation: 'Any two majorities must overlap by at least one node, ensuring no split-brain two-leader scenario.',
        cardType: 'multiple_choice',
        srsInterval: 3,
        easeFactor: 2.6,
        consecutiveCorrect: 3,
        nextReviewAt: 'Today',
      },
      {
        id: 'cs2',
        deckId: 'deck_cs_dist',
        front: 'According to the CAP theorem, during a network partition, a distributed system must choose between _____ and _____.',
        back: 'Consistency and Availability',
        options: [
          'Consistency and Availability',
          'Concurrency and Parallelism',
          'Latency and Throughput',
          'Encryption and Authentication',
        ],
        hint: 'Partition tolerance is non-negotiable in real-world networks.',
        explanation: 'When packets are dropped between partitions, you either refuse requests (favoring consistency) or serve stale data (favoring availability).',
        cardType: 'fill_in',
        srsInterval: 5,
        easeFactor: 2.5,
        consecutiveCorrect: 2,
        nextReviewAt: 'Tomorrow',
      },
      {
        id: 'cs3',
        deckId: 'deck_cs_dist',
        front: 'What does a Vector Clock establish between two distributed events when neither clock vector dominates the other?',
        back: 'The events are concurrent (neither happened-before the other).',
        options: [
          'The events are concurrent (neither happened-before the other).',
          'The system has crashed.',
          'One event was erased by rollback.',
          'Clock drift exceeded 100ms.',
        ],
        hint: 'Concurrency indicates potential merge conflicts in state.',
        explanation: 'Vector clocks provide strict causality tracking; non-comparable vectors signify concurrent updates that require conflict resolution.',
        cardType: 'recall',
        srsInterval: 2,
        easeFactor: 2.5,
        consecutiveCorrect: 1,
        nextReviewAt: 'Today',
      },
    ],
  },
];

export const INITIAL_CREATORS: YouTubeCreator[] = [
  {
    id: 'c_lofi_girl',
    name: 'Lofi Girl',
    channelTitle: 'Lofi Girl Live',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    subscribers: '14.2M',
    isLive: true,
    streamTitle: 'Lofi Hip Hop Radio - Beats to Relax and Study to (24/7 Stream)',
    videoId: 'jfKfPfyJRdk', // 24/7 verified study stream
    currentSessionMode: 'Continuous Flowtime / 25-5 sync',
    pomodoroWorkMin: 25,
    pomodoroBreakMin: 5,
    liveViewers: 28450,
    isSubscribed: true,
  },
  {
    id: 'c_chillhop',
    name: 'Chillhop Music',
    channelTitle: 'Chillhop Study Beats',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    subscribers: '3.4M',
    isLive: true,
    streamTitle: 'Chillhop Radio - Jazzy and Lo-Fi Study Beats to Focus',
    videoId: '5yx6BWlEVcY', // verified chillhop stream
    currentSessionMode: '50m Deep Work / 10m Break',
    pomodoroWorkMin: 50,
    pomodoroBreakMin: 10,
    liveViewers: 6420,
    isSubscribed: true,
  },
  {
    id: 'c_james_scholz',
    name: 'James Scholz',
    channelTitle: 'James Scholz Focus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    subscribers: '1.24M',
    isLive: true,
    streamTitle: '12-Hour Silent Study Sprint (50-10 Pomodoro Focus Session)',
    videoId: 'turb9FvXzM8',
    currentSessionMode: '50m Deep Work / 10m Break',
    pomodoroWorkMin: 50,
    pomodoroBreakMin: 10,
    liveViewers: 4180,
    isSubscribed: true,
  },
  {
    id: 'c_tokyo_rain',
    name: 'Abao in Tokyo',
    channelTitle: 'Abao Study Ambience',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    subscribers: '890K',
    isLive: true,
    streamTitle: 'Tokyo Rainy Evening Library Study (Peaceful Rain Ambience)',
    videoId: '5qap5aO4i9A',
    currentSessionMode: '50m Deep Work / 10m Break',
    pomodoroWorkMin: 50,
    pomodoroBreakMin: 10,
    liveViewers: 2180,
    isSubscribed: false,
  },
];

export const INITIAL_ACTIVITY_FEED: ActivityFeedItem[] = [];

export const INITIAL_FOCUS_LOGS: FocusSessionLog[] = [];

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
    return INITIAL_DECKS;
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
    return INITIAL_CREATORS;
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
