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
const DB_VERSION_KEY = 'lumina_prod_v2_clean';

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(DB_VERSION_KEY) !== 'true') {
      localStorage.removeItem(SPACES_KEY);
      localStorage.removeItem(ADMISSIONS_KEY);
      localStorage.removeItem(FEED_KEY);
      localStorage.removeItem(USERS_LIST_KEY);
      localStorage.setItem(DB_VERSION_KEY, 'true');
    }
  } catch (_) {}
}

export const stripHashtags = (text?: string): string => {
  if (!text) return '';
  return text.replace(/^#+/, '').replace(/\s+#+/g, ' ').trim();
};

export const INITIAL_USER: UserProfile = {
  id: 'usr_me',
  name: 'Kai Chen',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  universityOrLocation: 'Tokyo Tech / Global Campus',
  countryCode: 'JP',
  countryName: 'Japan',
  countryFlag: '🇯🇵',
  university: 'Tokyo Institute of Technology',
  studyField: 'Medicine & Healthcare (USMLE, Pre-Med)',
  isGhostMode: false,
  currentSubject: 'USMLE / Neuro',
  currentGoal: 'Consolidate cranial nerve pathways & finish 50m sprint',
  status: 'in_focus',
  currentStreak: 14,
  totalHoursStudied: 93.5,
  xp: 4120,
  deskPet: {
    name: 'Mochi',
    species: 'shiba',
    level: 4,
    currentXp: 320,
    nextLevelXp: 500,
    mood: 'focused',
    decorations: ['Steaming Matcha', 'Bonsai Tree', 'Vinyl Turntable'],
  },
};

export const INITIAL_SPACES: StudySpace[] = [
  {
    id: 'space_great_hall',
    name: 'The Great Hall (Universal Silent Floor)',
    tagline: 'Global persistent silent floor where studiers worldwide focus in peace.',
    subjectTag: 'Global Campus',
    location: 'Universal Cloud Campus',
    countryCode: 'GLOBAL',
    countryFlag: '🌐',
    university: 'Universal Cloud Campus',
    isGhostMode: false,
    mode: 'flowtime',
    isPrivate: false,
    hostId: 'system',
    hostName: 'Lumina Campus Host',
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 25000,
    isSilentMode: true,
    pomodoroInterval: { work: 50, breakTime: 10 },
    breakScheduleText: 'Hourly 10m breathing chime at :50',
    createdAt: '2026-01-01T00:00:00Z',
    currentMembers: [],
  },
  {
    id: 'space_tokyo_tech',
    name: 'Tokyo Tech Silent Wing',
    tagline: 'Quiet engineering and algorithmic architecture study pod.',
    subjectTag: 'Coding',
    location: 'Tokyo Institute of Technology',
    countryCode: 'JP',
    countryFlag: '🇯🇵',
    university: 'Tokyo Institute of Technology',
    isGhostMode: false,
    mode: 'pomodoro',
    isPrivate: false,
    hostId: 'system',
    hostName: 'Tokyo Tech Host',
    hostAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 60,
    isSilentMode: true,
    pomodoroInterval: { work: 50, breakTime: 10 },
    breakScheduleText: '50m Deep Work / 10m Stretches',
    createdAt: '2026-03-01T12:00:00Z',
    currentMembers: [],
  },
  {
    id: 'space_jh_med',
    name: 'Johns Hopkins Med Sprint Pod',
    tagline: 'Intense USMLE Step 1 sprint. Knock required with study sprint goal.',
    subjectTag: 'USMLE',
    location: 'Johns Hopkins Medical Quad',
    countryCode: 'US',
    countryFlag: '🇺🇸',
    university: 'Johns Hopkins University',
    isGhostMode: false,
    mode: 'pomodoro',
    isPrivate: true,
    hostId: 'system',
    hostName: 'Hopkins Med Host',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 12,
    isSilentMode: true,
    pomodoroInterval: { work: 50, breakTime: 10 },
    breakScheduleText: '50m Sprint / 10m Flashcard Quiz Battle',
    createdAt: '2026-03-05T08:00:00Z',
    currentMembers: [],
  },
  {
    id: 'space_oxford_bodleian',
    name: 'Oxford Bodleian Quiet Chamber',
    tagline: 'Private chamber for law and humanities scholars. Strict silent policy.',
    subjectTag: 'Bar Exam',
    location: 'Oxford Bodleian Library',
    countryCode: 'GB',
    countryFlag: '🇬🇧',
    university: 'University of Oxford',
    isGhostMode: false,
    mode: 'flowtime',
    isPrivate: true,
    hostId: 'system',
    hostName: 'Oxford Scholar',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 15,
    isSilentMode: true,
    pomodoroInterval: { work: 45, breakTime: 15 },
    breakScheduleText: 'Flowtime with quiet tea breaks',
    createdAt: '2026-02-14T09:00:00Z',
    currentMembers: [],
  },
  {
    id: 'space_makerere',
    name: 'Makerere Tech & Health Quad',
    tagline: 'Intense study space for computer science and medical researchers at Makerere.',
    subjectTag: 'Coding',
    location: 'Makerere University, Kampala',
    countryCode: 'UG',
    countryFlag: '🇺🇬',
    university: 'Makerere University',
    isGhostMode: false,
    mode: 'pomodoro',
    isPrivate: false,
    hostId: 'system',
    hostName: 'Makerere Quad Host',
    hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 45,
    isSilentMode: true,
    pomodoroInterval: { work: 50, breakTime: 10 },
    breakScheduleText: '50m Deep Work / 10m Break',
    createdAt: '2026-03-08T10:00:00Z',
    currentMembers: [],
  },
  {
    id: 'space_uon_law',
    name: 'University of Nairobi Law Chamber',
    tagline: 'Quiet sprint on jurisprudence, commercial law, and constitutional review.',
    subjectTag: 'Bar Exam',
    location: 'University of Nairobi, Parklands',
    countryCode: 'KE',
    countryFlag: '🇰🇪',
    university: 'University of Nairobi',
    isGhostMode: false,
    mode: 'flowtime',
    isPrivate: true,
    hostId: 'system',
    hostName: 'Nairobi Law Host',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 20,
    isSilentMode: true,
    pomodoroInterval: { work: 50, breakTime: 10 },
    breakScheduleText: 'Flowtime with scheduled quiet coffee intervals',
    createdAt: '2026-03-09T11:00:00Z',
    currentMembers: [],
  },
  {
    id: 'space_seoul_snu',
    name: 'Seoul SNU 24/7 Lofi Lounge',
    tagline: 'Relaxed night owls studying calculus, physics, and organic chemistry.',
    subjectTag: 'Calculus III',
    location: 'Seoul National University',
    countryCode: 'KR',
    countryFlag: '🇰🇷',
    university: 'Seoul National University (SNU)',
    isGhostMode: false,
    mode: 'animedoro',
    isPrivate: false,
    hostId: 'system',
    hostName: 'SNU Lounge Host',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    maxCapacity: 80,
    isSilentMode: false,
    pomodoroInterval: { work: 40, breakTime: 20 },
    breakScheduleText: '40m Study / 20m Anime or Music break',
    createdAt: '2026-03-10T14:00:00Z',
    currentMembers: [],
  },
];

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

export const INITIAL_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'act_welcome',
    userId: 'system_host',
    userName: 'Lumina Campus Host',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    countryFlag: '🌐',
    countryName: 'Global Campus',
    university: 'Universal Cloud Campus',
    type: 'session_completed',
    title: 'Welcome to Lumina Global Campus',
    description: 'The real-time campus is officially open for real studiers! Join study rooms, start Pomodoro focus sessions, and share milestones with peers.',
    xpEarned: 100,
    timestamp: 'Just now',
    cheersCount: 0,
    subjectTag: 'Global Campus',
  },
];

export const INITIAL_FOCUS_LOGS: FocusSessionLog[] = [
  { id: 'log_1', date: '2026-10-17', durationMinutes: 50, category: 'deep_work', subject: 'USMLE', xpEarned: 100 },
  { id: 'log_2', date: '2026-10-17', durationMinutes: 25, category: 'recall', subject: 'USMLE', xpEarned: 60 },
  { id: 'log_3', date: '2026-10-17', durationMinutes: 40, category: 'review', subject: 'USMLE', xpEarned: 80 },
  { id: 'log_4', date: '2026-10-16', durationMinutes: 120, category: 'deep_work', subject: 'Coding', xpEarned: 240 },
  { id: 'log_5', date: '2026-10-16', durationMinutes: 45, category: 'recall', subject: 'Coding', xpEarned: 90 },
  { id: 'log_6', date: '2026-10-15', durationMinutes: 180, category: 'deep_work', subject: 'USMLE', xpEarned: 360 },
  { id: 'log_7', date: '2026-10-14', durationMinutes: 90, category: 'recall', subject: 'MCAT', xpEarned: 180 },
  { id: 'log_8', date: '2026-10-13', durationMinutes: 150, category: 'deep_work', subject: 'Bar Exam', xpEarned: 300 },
];

export function generate31DayHeatmap(): DayActivity[] {
  const days: DayActivity[] = [];
  // Generate for days 1 to 31 of current month
  for (let d = 1; d <= 31; d++) {
    // Deterministic realistic study curve
    let hours = 0;
    let deepWork = 0;
    let recall = 0;
    let review = 0;

    if (d % 7 === 0) {
      // Light rest day
      hours = 1.2;
      deepWork = 0.5;
      recall = 0.5;
      review = 0.2;
    } else if (d % 3 === 0) {
      // Very high sprint day (>6h pastel pink)
      hours = 6.8;
      deepWork = 3.8;
      recall = 2.0;
      review = 1.0;
    } else if (d % 2 === 0) {
      // High day (4-6h mint)
      hours = 4.7;
      deepWork = 2.7;
      recall = 1.3;
      review = 0.7;
    } else {
      // Moderate day (2-4h cyan)
      hours = 3.2;
      deepWork = 1.8;
      recall = 0.9;
      review = 0.5;
    }

    const dayStr = d < 10 ? `0${d}` : `${d}`;
    days.push({
      date: `2026-10-${dayStr}`,
      dayNumber: d,
      hours: Math.round(hours * 10) / 10,
      deepWorkHours: Math.round(deepWork * 10) / 10,
      recallHours: Math.round(recall * 10) / 10,
      reviewHours: Math.round(review * 10) / 10,
      sessionsCount: Math.max(1, Math.round(hours / 1.2)),
    });
  }
  return days;
}

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

export const INITIAL_ANNOUNCEMENTS: GlobalAnnouncement[] = [
  {
    id: 'ann_welcome',
    title: '🌟 Welcome to Lumina Global Virtual Campus',
    message: 'Connect with students across Makerere, Oxford, Tokyo Tech, and worldwide. Stream high-yield Study With Me sessions and leverage AI Magic Import for your exam prep.',
    type: 'info',
    priority: 'high',
    author: 'Platform Admin',
    createdAt: '2026-10-18T00:00:00Z',
    isActive: true,
    actionLabel: 'Explore Campus',
  },
  {
    id: 'ann_exam_cram',
    title: '2x XP Boost Active for Global Exam Cram Week!',
    message: 'Double experience points are currently awarded for all Pomodoro sessions. Level up your desk pet and climb the global university leaderboard!',
    type: 'event',
    priority: 'normal',
    author: 'Academic Ops',
    createdAt: '2026-10-17T12:00:00Z',
    isActive: true,
    actionLabel: 'Start Sprint',
  },
];

export const INITIAL_EMPLOYEES: EmployeeAccount[] = [
  {
    id: 'emp_maya',
    name: 'Maya Lin',
    email: 'maya.lin@lumina.study',
    roleTitle: 'Senior Campus Moderator',
    status: 'active',
    permissions: ['overview', 'spaces', 'users', 'announcements'],
    accessKey: 'EMP-MOD-771',
    hiredAt: '2026-08-15',
    lastActive: '5 mins ago',
  },
  {
    id: 'emp_david',
    name: 'David Kigozi',
    email: 'david.k@lumina.study',
    roleTitle: 'Curriculum & Decks Admin',
    status: 'active',
    permissions: ['overview', 'spaces', 'announcements'],
    accessKey: 'EMP-CUR-342',
    hiredAt: '2026-09-01',
    lastActive: '1 hour ago',
  },
  {
    id: 'emp_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@lumina.study',
    roleTitle: 'Finance & Subscriptions Specialist',
    status: 'active',
    permissions: ['overview', 'subscriptions'],
    accessKey: 'EMP-FIN-908',
    hiredAt: '2026-09-20',
    lastActive: 'Yesterday',
  },
];

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

export const INITIAL_ALL_USERS: UserProfile[] = [
  {
    id: 'usr_admin_ian',
    name: 'Ian Tumwebaze',
    email: 'iantumwebaze75@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    universityOrLocation: 'Makerere University / Uganda',
    countryCode: 'UG',
    countryName: 'Uganda',
    countryFlag: '🇺🇬',
    university: 'Makerere University',
    studyField: 'Computer Science, Engineering & Math',
    isGhostMode: false,
    currentSubject: 'FullStack / AI Systems',
    currentGoal: 'Overseeing global platform launch & system scaling',
    status: 'in_focus',
    currentStreak: 42,
    totalHoursStudied: 215.0,
    xp: 14800,
    role: 'superadmin',
    subscriptionTier: 'campus_elite',
    subscriptionStatus: 'active',
    isSuspended: false,
    joinedDate: '2026-01-10',
    deskPet: {
      name: 'Titan',
      species: 'owl',
      level: 10,
      currentXp: 850,
      nextLevelXp: 1000,
      mood: 'focused',
      decorations: ['Crown of Wisdom', 'Golden Quill', 'Cosmic Aura'],
    },
  },
];

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
    return INITIAL_SPACES;
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
    return INITIAL_FOCUS_LOGS;
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
    return INITIAL_ACTIVITY_FEED;
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
    return INITIAL_ALL_USERS;
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
    return INITIAL_EMPLOYEES;
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
