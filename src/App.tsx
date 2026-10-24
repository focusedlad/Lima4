/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Timer,
  BarChart3,
  Flame,
  Volume2,
  Bell,
  Heart,
  Globe,
  Plus,
  Cloud,
  EyeOff,
  Shield,
  Crown,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Scale,
  Sun,
  Moon,
  Dog,
  Smile,
  Bird,
  Tv,
  Cherry,
  Settings,
} from 'lucide-react';
import {
  UserProfile,
  StudySpace,
  StudyDeck,
  YouTubeCreator,
  AdmissionRequest,
  FocusSessionLog,
  FocusCategory,
  SubscriptionPlan,
  GlobalAnnouncement,
  EmployeeAccount,
  SystemSettings,
  PeerUser,
} from './types';
import {
  INITIAL_USER,
  StorageService,
  generate31DayHeatmap,
} from './services/storage';
import { audioSynth } from './services/audioSynth';
import { Navbar, MainNavTab } from './components/common/Navbar';
import { NotificationCenter } from './components/common/NotificationCenter';
import { QuickActionModal } from './components/common/QuickActionModal';
import { SoundSynthesizerModal } from './components/audio/SoundSynthesizerModal';
import { FocusTimerHero } from './components/focus/FocusTimerHero';
import { FloatingStreamerWidget } from './components/focus/FloatingStreamerWidget';
import { StudyChallengesView } from './components/social/StudyChallengesView';
import { LeaderboardView } from './components/social/LeaderboardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileModal } from './components/common/ProfileModal';
import { AuthModal } from './components/common/AuthModal';
import { GlobalActivityFeed } from './components/social/GlobalActivityFeed';
import { AnnouncementBanner } from './components/common/AnnouncementBanner';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { RulesAndFeaturesModal } from './components/common/RulesAndFeaturesModal';
import { FirebaseService } from './services/firebase';
import { supabase } from './services/supabase';
import { FluidLiquidBackground } from './components/common/FluidLiquidBackground';
import { ApiDatabase } from './services/apiDatabase';
import { SettingsView } from './components/settings/SettingsView';


export default function App() {
  // Quiet, brief haptic feedback for taps where the browser/device supports it.
  // iOS Safari does not expose navigator.vibrate; the guard keeps unsupported devices silent.
  useEffect(() => {
    const handleTapFeedback = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('button,[role="button"]')) return;
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(8);
      }
    };
    document.addEventListener('pointerdown', handleTapFeedback, true);
    return () => document.removeEventListener('pointerdown', handleTapFeedback, true);
  }, []);

  // Application Data States
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => INITIAL_USER);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [spaces, setSpaces] = useState<StudySpace[]>(() => StorageService.getSpaces());
  const [decks, setDecks] = useState<StudyDeck[]>(() => StorageService.getDecks());
  const [creators, setCreators] = useState<YouTubeCreator[]>(() => StorageService.getCreators());
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>(() => StorageService.getAdmissions());
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(() => StorageService.getFocusLogs());
  const [heatmapDays, setHeatmapDays] = useState(() => generate31DayHeatmap());
  const [firstUserNotice, setFirstUserNotice] = useState(false);

  // Navigation & Active Screen (Study Timer, Challenges, Leaderboard, Analytics)
  const [currentTab, setCurrentTab] = useState<MainNavTab>('focus');

  // Sync state & Floating Streamer Pop-up State
  const [syncedCreator, setSyncedCreator] = useState<YouTubeCreator | null>(null);
  const [activeWatchingStream, setActiveWatchingStream] = useState<YouTubeCreator | null>(null);
  const [isStreamWidgetVisible, setIsStreamWidgetVisible] = useState<boolean>(true);
  const [videoBackground, setVideoBackground] = useState<YouTubeCreator | null>(null);

  // Deep Dark Mode Theme State with System Preference Sync
  const [themePreference, setThemePreference] = useState<'system' | 'dark' | 'light'>(() => {
    const saved = localStorage.getItem('cheri_theme_preference');
    if (saved === 'system' || saved === 'dark' || saved === 'light') return saved;
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = themePreference === 'system' ? systemPrefersDark : themePreference === 'dark';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cheri_theme_preference', themePreference);
  }, [isDarkMode, themePreference]);

  // Persist profile edits only after the signed-in user's backend profile has been loaded.
  useEffect(() => {
    let cancelled = false;
    const syncAuthenticatedProfile = async () => {
      if (!profileLoaded) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.id !== currentUser.id) return;
      const result = await ApiDatabase.syncUser(currentUser, session.access_token);
      const createdAt = Date.parse(session.user.created_at || '');
      const accountIsNew = Number.isFinite(createdAt) && Date.now() - createdAt < 15 * 60 * 1000;
      const pendingWelcomeEmail = localStorage.getItem('cheri_pending_first_user_welcome');
      const pendingWelcome = pendingWelcomeEmail === (session.user.email || '').toLowerCase();
      if (!cancelled && result?.isFirstUser && (accountIsNew || pendingWelcome)) setFirstUserNotice(true);
      if (result && pendingWelcome) localStorage.removeItem('cheri_pending_first_user_welcome');
    };
    void syncAuthenticatedProfile();
    return () => { cancelled = true; };
  }, [profileLoaded, currentUser.id, currentUser.name, currentUser.handle, currentUser.email, currentUser.avatar, currentUser.university, currentUser.universityOrLocation, currentUser.studyField, currentUser.countryCode, currentUser.countryName, currentUser.currentSubject, currentUser.currentGoal, currentUser.isGhostMode, currentUser.bio, currentUser.bannerUrl, currentUser.profileVisibility, currentUser.sessionVisibility, currentUser.subscriptionTier, currentUser.subscriptionStatus, currentUser.termsAccepted, currentUser.termsAcceptedAt, currentUser.termsVersion, currentUser.xp, currentUser.totalHoursStudied, currentUser.currentStreak]);

  const toggleTheme = () => {
    setThemePreference((prev) => {
      const currentDark = prev === 'system' ? systemPrefersDark : prev === 'dark';
      return currentDark ? 'light' : 'dark';
    });
  };

  // Modals & Auth
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Admin & Subscription States
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => StorageService.getAllUsers());
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => StorageService.getSubscriptionPlans());
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>(() => StorageService.getAnnouncements());
  const [employees, setEmployees] = useState<EmployeeAccount[]>(() => StorageService.getEmployees());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => StorageService.getSystemSettings());

  // Admin Navigation & Modals
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [dismissedAnnouncementId, setDismissedAnnouncementId] = useState<string | null>(null);

  const [currentAdmin, setCurrentAdmin] = useState<{
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'employee';
    employeeId?: string;
    permissions: string[];
  }>({
    name: 'Ian Tumwebaze',
    email: 'iantumwebaze75@gmail.com',
    role: 'superadmin',
    permissions: ['overview', 'users', 'spaces', 'announcements', 'subscriptions', 'settings', 'team'],
  });

  const handleUpdateUsers = (updated: UserProfile[]) => {
    setAllUsers(updated);
    StorageService.saveAllUsers(updated);
    const self = updated.find((u) => u.id === currentUser.id);
    if (self) setCurrentUser(self);
  };

  const handleUpdatePlans = (updated: SubscriptionPlan[]) => {
    setSubscriptionPlans(updated);
    StorageService.saveSubscriptionPlans(updated);
  };

  const handleUpdateAnnouncements = (updated: GlobalAnnouncement[]) => {
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
  };

  const handleUpdateEmployees = (updated: EmployeeAccount[]) => {
    setEmployees(updated);
    StorageService.saveEmployees(updated);
  };

  const handleUpdateSettings = (updated: SystemSettings) => {
    setSystemSettings(updated);
    StorageService.saveSystemSettings(updated);
  };

  const handleSelectPlan = (planId: string) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      subscriptionTier: planId,
      subscriptionStatus: 'active',
    };
    setCurrentUser(updatedUser);
    StorageService.saveUser(updatedUser);
    const updatedUsers = allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setAllUsers(updatedUsers);
    StorageService.saveAllUsers(updatedUsers);
  };

  const activeAnnouncement =
    announcements.find((a) => a.isActive && a.id !== dismissedAnnouncementId) || null;

  // Hydrate the current account from the server after Supabase verifies the session.
  useEffect(() => {
    let cancelled = false;
    const applySession = async (session: any) => {
      if (!session?.user) {
        setProfileLoaded(false);
        setCurrentUser(INITIAL_USER);
        setIsAuthModalOpen(true);
        return;
      }
      setProfileLoaded(false);
      const authUser = session.user;
      const email = authUser.email || '';
      const metadataName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
      let saved: any = null;
      try {
        const response = await fetch('/api/db/sync-user', { headers: { Authorization: 'Bearer ' + session.access_token } });
        if (response.ok) {
          const payload = await response.json();
          saved = payload?.user || null;
        }
      } catch (error) {
        console.warn('Could not load saved account profile:', error);
      }
      try {
        const logsResponse = await fetch('/api/db/focus-logs', { headers: { Authorization: 'Bearer ' + session.access_token } });
        if (logsResponse.ok) {
          const logsPayload = await logsResponse.json();
          if (Array.isArray(logsPayload?.logs)) {
            setFocusLogs(logsPayload.logs.map((log: any) => ({
              id: String(log.id),
              date: String(log.date || ''),
              durationMinutes: Number(log.durationMinutes || 0),
              category: log.category as FocusCategory,
              subject: String(log.subject || ''),
              xpEarned: Number(log.xpEarned || 0),
            })));
          }
        }
      } catch (error) {
        console.warn('Could not load saved focus history:', error);
      }
      if (cancelled) return;
      const base = saved ? {
        ...INITIAL_USER,
        id: authUser.id, email,
        name: saved.name || metadataName || email.split('@')[0] || 'New Studier',
        handle: saved.handle || (saved.name || metadataName || email.split('@')[0] || 'studier').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        avatar: saved.avatar || INITIAL_USER.avatar,
        bio: saved.bio || '',
        bannerUrl: saved.bannerUrl || '',
        profileVisibility: saved.profileVisibility || 'public',
        sessionVisibility: saved.sessionVisibility || 'private',
        university: saved.university || INITIAL_USER.university,
        universityOrLocation: saved.university || INITIAL_USER.universityOrLocation,
        studyField: saved.studyField || INITIAL_USER.studyField,
        countryCode: saved.countryCode || INITIAL_USER.countryCode,
        countryName: saved.countryName || INITIAL_USER.countryName,
        currentSubject: saved.currentSubject || INITIAL_USER.currentSubject,
        currentGoal: saved.currentGoal || INITIAL_USER.currentGoal,
        isGhostMode: Boolean(saved.isGhostMode),
        subscriptionTier: saved.subscriptionTier || 'free',
        subscriptionStatus: saved.subscriptionStatus || 'active',
        termsAccepted: Boolean(saved.termsAccepted),
        termsAcceptedAt: saved.termsAcceptedAt || undefined,
        termsVersion: saved.termsVersion || undefined,
        xp: Number(saved.xp || 0),
        totalHoursStudied: Number(saved.totalHoursStudied || 0),
        currentStreak: Number(saved.currentStreak || 0),
      } : { ...INITIAL_USER, id: authUser.id, email, name: metadataName || email.split('@')[0] || 'New Studier', bio: '', bannerUrl: '', profileVisibility: 'public', sessionVisibility: 'private', xp: 0, totalHoursStudied: 0, currentStreak: 0, deskPet: { ...INITIAL_USER.deskPet, level: 1, currentXp: 0, nextLevelXp: 250 } };
      setCurrentUser(base);
      setProfileLoaded(true);
      setIsAuthModalOpen(false);
    };
    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { void applySession(session); });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);
  // Activity feed is intentionally empty until real-user feed APIs are available.

  // Save changes to storage
  useEffect(() => {
    StorageService.saveUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    StorageService.saveSpaces(spaces);
  }, [spaces]);

  useEffect(() => {
    StorageService.saveDecks(decks);
  }, [decks]);

  useEffect(() => {
    StorageService.saveCreators(creators);
  }, [creators]);

  useEffect(() => {
    StorageService.saveAdmissions(admissions);
  }, [admissions]);

  useEffect(() => {
    StorageService.saveFocusLogs(focusLogs);
  }, [focusLogs]);

  // Dedicated Admin Portal Link routing & secret access  // Dedicated Admin Portal Link routing & secret access
  const [badgeClicks, setBadgeClicks] = useState<number>(0);

  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);

      const isDirectAdminLink =
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#admin-portal' ||
        hash === '#staff' ||
        pathname === '/admin' ||
        pathname === '/admin/' ||
        searchParams.get('portal') === 'admin' ||
        searchParams.get('admin') === 'true';

      if (isDirectAdminLink) {
        if (
          currentUser.email === systemSettings.superAdminEmail ||
          currentUser.role === 'superadmin' ||
          currentUser.role === 'admin'
        ) {
          setIsAdminMode(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    // Check upon component load
    checkAdminRoute();

    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    // Discreet keyboard shortcut for admins: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (
          currentUser.email === systemSettings.superAdminEmail ||
          currentUser.role === 'superadmin' ||
          currentUser.role === 'admin'
        ) {
          setIsAdminMode((prev) => !prev);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser, systemSettings]);

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    if (
      window.location.hash.toLowerCase().includes('admin') ||
      window.location.hash.toLowerCase().includes('staff')
    ) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (
      window.location.pathname.toLowerCase() === '/admin' ||
      window.location.pathname.toLowerCase() === '/admin/'
    ) {
      window.history.replaceState(null, '', '/' + window.location.search);
    }
  };

    const handleToggleGhostMode = () => {
    setCurrentUser((prev) => {
      const updatedGhost = !prev.isGhostMode;
      return {
        ...prev,
        isGhostMode: updatedGhost,
      };
    });
  };

  // Handle Focus Session Completion
  const handleSessionComplete = (durationMinutes: number, category: FocusCategory, subject: string) => {
    const earnedXp = durationMinutes * 4;
    const newTotalHours = Math.round((currentUser.totalHoursStudied + durationMinutes / 60) * 10) / 10;

    // Update desk pet XP & Level
    const newXp = currentUser.deskPet.currentXp + earnedXp;
    let newLevel = currentUser.deskPet.level;
    let nextLevelXp = currentUser.deskPet.nextLevelXp;
    if (newXp >= nextLevelXp) {
      newLevel += 1;
      nextLevelXp += 250;
      audioSynth.playChime('pomodoro_complete');
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      xp: currentUser.xp + earnedXp,
      totalHoursStudied: newTotalHours,
      deskPet: {
        ...currentUser.deskPet,
        level: newLevel,
        currentXp: newXp >= nextLevelXp ? newXp - nextLevelXp : newXp,
        nextLevelXp,
        mood: 'happy',
      },
    };
    setCurrentUser(updatedUser);

    const newLog: FocusSessionLog = {
      id: 'log_' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      durationMinutes, category, subject, xpEarned: earnedXp,
    };
    setFocusLogs((previous) => [newLog, ...previous]);
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.id !== currentUser.id) return;
      const saved = await ApiDatabase.logFocusSession(newLog, currentUser.id, session.access_token);
      if (!saved) {
        console.warn('This focus session could not be synced to the server.');
        return;
      }
      if (!updatedUser.isGhostMode) {
        await SupabaseService.postMilestone({
          user: updatedUser,
          title: 'Completed ' + durationMinutes + 'm focus session',
          description: 'Focused on ' + subject + ' in a real study session.',
          subjectTag: subject,
          type: 'session_completed',
        });
      }
    })().catch((error) => console.warn('Could not sync focus session:', error));
  };



  const handleToggleCreatorSub = (creatorId: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, isSubscribed: !c.isSubscribed } : c))
    );
  };

  const handleSyncWithCreator = (creator: YouTubeCreator) => {
    setSyncedCreator(creator);
    setActiveWatchingStream(creator);
    setIsStreamWidgetVisible(true);
    setCurrentTab('focus');
  };

  const handleWatchStream = (creator: YouTubeCreator) => {
    setActiveWatchingStream(creator);
    setIsStreamWidgetVisible(true);
  };

  const handleAddMarketplaceDeck = (deck: StudyDeck) => {
    setDecks([deck, ...decks]);
    FirebaseService.saveDeck(deck).catch(() => {});
  };

  const handleFinishDeckReview = (deckId: string, cardsCount: number, earnedXp: number) => {
    handleSessionComplete(Math.round(cardsCount * 3), 'recall', 'Active Recall');
  };

  const handleFinishLiveBattle = (earnedXp: number, rank: number) => {
    handleSessionComplete(15, 'recall', 'Gizmo Battle');
  };

  const pendingKnocks = admissions.filter((a) => a.status === 'pending');

  // If in Admin Command Center mode, render full-screen AdminDashboard
  if (isAdminMode) {
    return (
      <AdminDashboard
        currentAdmin={currentAdmin}
        onExitAdmin={handleExitAdmin}
        users={allUsers}
        onUpdateUsers={handleUpdateUsers}
        spaces={spaces}
        onUpdateSpaces={setSpaces}
        plans={subscriptionPlans}
        onUpdatePlans={handleUpdatePlans}
        announcements={announcements}
        onUpdateAnnouncements={handleUpdateAnnouncements}
        employees={employees}
        onUpdateEmployees={handleUpdateEmployees}
        settings={systemSettings}
        onUpdateSettings={handleUpdateSettings}
      />
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#F8FAFC] dark:bg-[#05070B] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-indigo-200 dark:selection:bg-indigo-900 transition-colors duration-200 relative">
      {/* Fluid Liquid Motion Interactive Background */}
      <FluidLiquidBackground />
      {/* Top Global Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/90 dark:bg-[#05070B]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-3 sm:px-6 py-3 transition-all pt-safe w-full max-w-full overflow-x-hidden md:pl-[100px]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-base sm:text-lg shadow-xs ring-2 ring-pink-200/70 dark:ring-pink-900 shrink-0">
              <Cherry className="w-5 h-5 text-pink-600 dark:text-pink-400 fill-pink-500/20" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900 dark:text-white truncate">
                  cheri
                </span>
                <span
                  onClick={() => {
                    setBadgeClicks((c) => {
                      const next = c + 1;
                      if (next >= 3) {
                        setIsAdminLoginOpen(true);
                        return 0;
                      }
                      return next;
                    });
                  }}
                  className="hidden md:inline-block px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[10px] font-bold cursor-default select-none border border-pink-200/80 dark:border-pink-900 shrink-0"
                  title="Campus Admin Access"
                >
                  Focus App
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden md:block truncate">
                Aesthetic Focus • Pomodoro & Study Time
              </p>
            </div>
          </div>

          {/* Quick Metrics & Ambiance Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NotificationCenter />
            {/* Ghost Mode Quick Toggle */}
            <button
              onClick={handleToggleGhostMode}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors min-h-[40px] ${
                currentUser.isGhostMode
                  ? 'bg-pink-100 dark:bg-pink-950 border-pink-300 dark:border-pink-800 text-pink-900 dark:text-pink-200 font-bold ring-1 ring-pink-300'
                  : 'bg-white dark:bg-[#141315] border-pink-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-pink-50/50 dark:hover:bg-[#1A181C]'
              }`}
              title={currentUser.isGhostMode ? 'Ghost Mode ON: Presence hidden from directory' : 'Ghost Mode OFF: Presence visible to peers'}
            >
              <EyeOff className={`w-3.5 h-3.5 ${currentUser.isGhostMode ? 'text-pink-700 dark:text-pink-300' : 'text-stone-400'}`} />
              <span>{currentUser.isGhostMode ? 'Ghost' : 'Visible'}</span>
            </button>

            <button
              onClick={() => setIsAudioModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-[#141315] hover:bg-pink-50/50 dark:hover:bg-[#1A181C] border border-pink-100 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-xs transition-colors min-h-[40px]"
              title="Open Web Audio Synthesizer"
            >
              <Volume2 className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
              <span>Ambience</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-[#141315] border border-pink-100 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-xs min-h-[40px]">
              <Flame className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              <span>{currentUser.currentStreak}d</span>
            </div>

            {/* Dark / Light / System Mode Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#141315] hover:bg-pink-50/50 dark:hover:bg-[#1A181C] border border-pink-100 dark:border-stone-800 text-stone-700 dark:text-stone-200 shadow-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isDarkMode ? 'Switch to Light Cream Mode' : 'Switch to Full Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-pink-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-500" />
              )}
            </button>

            {/* Cloud Sync Button */}
            {currentUser.email ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs font-semibold shadow-xs hover:bg-sky-100 transition-colors min-h-[40px]"
                title="Cloud Sync Active"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="hidden sm:inline">Synced</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-all active:scale-95 min-h-[40px]"
                title="Sign In with Apple, Google, or Email"
              >
                <Cloud className="w-3.5 h-3.5 text-white" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Profile & Settings Quick Button */}
            <button
              onClick={() => setCurrentTab('settings')}
              className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-2xl bg-white dark:bg-[#141315] border border-pink-100 dark:border-stone-800 hover:border-pink-300 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-xs transition-all hover:scale-102"
              title="Open cheri Settings & Profile"
            >
              <span className="hidden sm:inline font-bold text-stone-900 dark:text-stone-100">{currentUser.name.split(' ')[0]}</span>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-400"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Real-Time Global Announcement Banner */}
      <AnnouncementBanner
        announcement={activeAnnouncement}
        onDismiss={() => setDismissedAnnouncementId(activeAnnouncement?.id || null)}
        onActionClick={(ann) => {
          if (ann.type === 'event') {
            setCurrentTab('focus');
          } else if (
            ann.actionLabel?.toLowerCase().includes('plan') ||
            ann.actionLabel?.toLowerCase().includes('upgrade')
          ) {
            setIsSubscriptionModalOpen(true);
          } else {
            setCurrentTab('challenges');
          }
        }}
      />

      {/* Emergency Maintenance Mode Notice (if active) */}
      {systemSettings.maintenanceMode && (
        <div className="bg-rose-900 text-rose-100 px-4 py-3 border-b border-rose-700 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-rose-300 flex-shrink-0 animate-bounce" />
            <span>
              <strong>Platform Notice:</strong> {systemSettings.maintenanceNotice}
            </span>
          </div>
          <button
            onClick={() => setIsAdminMode(true)}
            className="px-3 py-1 rounded-lg bg-white text-rose-950 font-bold text-xs hover:bg-rose-100 transition-colors flex-shrink-0"
          >
            Admin Bypass
          </button>
        </div>
      )}

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 pb-24 sm:p-8 md:ml-[84px] md:mr-0 md:w-[calc(100%-84px)] md:max-w-none md:pb-8 overflow-x-hidden">
        {firstUserNotice && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950 dark:border-indigo-400/20 dark:bg-indigo-950/40 dark:text-indigo-100" role="status">
            <p className="m-0">Welcome — you are the first registered member of cheri. You are helping start the real community; other members will appear as they join.</p>
            <button type="button" onClick={() => setFirstUserNotice(false)} className="shrink-0 rounded-xl px-3 py-2 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60">Dismiss</button>
          </div>
        )}
        {/* Tab 1: Pure Distraction-Free Study Space (Pomodoro & Study Time Stopwatch) */}
        {currentTab === 'focus' && (
          <div className="pb-20">
            <FocusTimerHero
              onOpenAudioModal={() => setIsAudioModalOpen(true)}
              onSessionComplete={handleSessionComplete}
              syncedCreator={syncedCreator}
              onDisconnectSync={() => setSyncedCreator(null)}
              activeSubject={currentUser.currentSubject?.replace(/^#/, '')}
              onToggleFloatingStream={() => {
                if (!activeWatchingStream && !syncedCreator && creators.length > 0) {
                  setActiveWatchingStream(creators[0]);
                }
                setIsStreamWidgetVisible((prev) => !prev);
              }}
              isStreamActive={Boolean(isStreamWidgetVisible && (activeWatchingStream || syncedCreator))}
              videoBackground={videoBackground}
              onSetVideoBackground={(stream) => setVideoBackground(stream)}
              onPopOutVideo={(stream) => {
                setActiveWatchingStream(stream);
                setIsStreamWidgetVisible(true);
                setVideoBackground(null);
              }}
            />
          </div>
        )}

        {/* Tab 2: Friends & Global Milestones Feed */}
        {currentTab === 'feed' && (
          <div className="pb-20">
            <GlobalActivityFeed
              currentUser={currentUser}
              onToggleGhostMode={handleToggleGhostMode}
            />
          </div>
        )}

        {/* Tab 3: Study Challenges */}
        {currentTab === 'challenges' && (
          <StudyChallengesView
            currentUser={currentUser}
            onSelectChallengeLeaderboard={() => {
              setCurrentTab('leaderboard');
            }}
          />
        )}

        {/* Tab 4: Competitive Leaderboards */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView currentUser={currentUser} />
        )}

        {/* Tab 5: Analytics, Macronutrients & Desk Pet */}
        {currentTab === 'analytics' && (
          <div className="pb-24">
            <AnalyticsView
              currentUser={currentUser}
              heatmapDays={heatmapDays}
              logs={focusLogs}
              onUpdateDeskPet={(pet) =>
                setCurrentUser((prev) => ({
                  ...prev,
                  deskPet: pet,
                }))
              }
            />
          </div>
        )}

        {/* Tab 6: Settings (Theme, Account Details, Focus Preferences) */}
        {currentTab === 'settings' && (
          <div className="pb-24">
            <SettingsView
              currentUser={currentUser}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                StorageService.saveUser(updated);
              }}
              themePreference={themePreference}
              onSelectThemePreference={setThemePreference}
              isDarkMode={isDarkMode}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onSignOut={async () => { await SupabaseService.signOut(); setFocusLogs([]); setCurrentUser(INITIAL_USER); setProfileLoaded(false); setIsAuthModalOpen(true); setCurrentTab('focus'); }}
            />
          </div>
        )}
      </main>

      {/* Global Platform Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#05070B]/90 py-6 px-4 sm:px-8 text-xs text-stone-500 pb-28 sm:pb-24">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cherry className="w-4 h-4 text-pink-500 fill-pink-500/20" />
            <span className="font-extrabold text-stone-800 dark:text-stone-200">cheri</span>
            <span>•</span>
            <span className="text-stone-600 dark:text-stone-400 font-medium">Aesthetic Focus & Study Timer</span>
            <span>•</span>
            <span className="text-pink-600 dark:text-pink-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              Beta preview
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="font-bold text-stone-700 dark:text-stone-300 hover:text-pink-600 underline flex items-center gap-1.5 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-pink-500" />
              <span>Platform Rules & Legal Terms</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('settings')}
              className="hover:text-pink-600 transition-colors font-medium"
            >
              Account Settings
            </button>
            <span>•</span>
            <span className="text-stone-400">© 2026 cheri</span>
          </div>
        </div>
      </footer>

      {/* Floating Pill Navigation Dock */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Quick Action Hub Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAction={(action) => {
          setIsQuickActionOpen(false);
          if (action === 'start_focus') {
            setCurrentTab('focus');
          } else if (action === 'view_feed') {
            setCurrentTab('feed');
          } else if (action === 'create_challenge') {
            setCurrentTab('challenges');
          } else if (action === 'view_rankings') {
            setCurrentTab('leaderboard');
          } else if (action === 'paste_video') {
            if (!activeWatchingStream && creators.length > 0) {
              setActiveWatchingStream(creators[0]);
            }
            setIsStreamWidgetVisible(true);
          } else if (action === 'sound_synth') {
            setIsAudioModalOpen(true);
          }
        }}
      />

      {/* Sound Synthesizer Modal */}
      <SoundSynthesizerModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />

      {/* Studier Profile & Account Switcher Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={async (updated) => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user || session.user.id !== updated.id) throw new Error('Your session expired. Sign in again before saving your profile.');
          const saved = await ApiDatabase.syncUser(updated, session.access_token);
          if (!saved?.success) throw new Error('Your profile could not be saved to the server. Please check your connection and try again.');
          StorageService.saveUser(updated);
          setCurrentUser(updated);
        }}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      {/* Supabase Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) setIsAuthModalOpen(false);
        }}
        currentUser={currentUser}
        onAuthSuccess={(profile) => {
          setCurrentUser(profile);
          StorageService.saveUser(profile);
        }}
        onUpdateProfile={(updates) => {
          setCurrentUser((prev) => {
            const next = { ...prev, ...updates };
            StorageService.saveUser(next);
            return next;
          });
        }}
        onLogout={() => {
          // Keep current guest or default user
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        currentUser={currentUser}
        employees={employees}
        onAuthorize={(adminData) => {
          setCurrentAdmin({
            name: adminData.name,
            email: adminData.email,
            role: adminData.role,
            employeeId: adminData.employeeId,
            permissions: adminData.permissions,
          });
          setIsAdminMode(true);
        }}
      />

      {/* Subscription Plans & Upgrade Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={currentUser}
        plans={subscriptionPlans}
        onSelectPlan={handleSelectPlan}
      />

      {/* Global Platform Rules, Regulations & Features Legal Modal */}
      <RulesAndFeaturesModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          const updatedUser: UserProfile = {
            ...currentUser,
            termsAccepted: true,
            termsAcceptedAt: new Date().toISOString(),
            termsVersion: '2026.1',
          };
          setCurrentUser(updatedUser);
          StorageService.saveUser(updatedUser);
          setIsTermsModalOpen(false);
        }}
        hasAccepted={Boolean(currentUser.termsAccepted)}
      />

      {/* Floating Picture-in-Picture YouTube & Any Video Player (Top Right) */}
      <FloatingStreamerWidget
        stream={activeWatchingStream || syncedCreator}
        isVisible={Boolean((activeWatchingStream || syncedCreator) && isStreamWidgetVisible)}
        onClose={() => setIsStreamWidgetVisible(false)}
        onSyncTimer={(stream) => handleSyncWithCreator(stream)}
        onSetAsBackground={(stream) => {
          setVideoBackground(stream);
          setIsStreamWidgetVisible(false);
          setCurrentTab('focus');
        }}
        onChangeVideo={(newVideo) => {
          setActiveWatchingStream(newVideo);
          setIsStreamWidgetVisible(true);
        }}
        onOpenRadar={() => {
          setCurrentTab('focus');
        }}
        isSynced={syncedCreator?.id === (activeWatchingStream?.id || syncedCreator?.id)}
      />
    </div>
  );
}
