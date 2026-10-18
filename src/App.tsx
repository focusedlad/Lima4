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
} from 'lucide-react';
import {
  UserProfile,
  StudySpace,
  StudyDeck,
  YouTubeCreator,
  AdmissionRequest,
  FocusSessionLog,
  FocusCategory,
  ActivityFeedItem,
} from './types';
import {
  StorageService,
  generate31DayHeatmap,
} from './services/storage';
import { audioSynth } from './services/audioSynth';
import { Navbar } from './components/common/Navbar';
import { QuickActionModal } from './components/common/QuickActionModal';
import { SoundSynthesizerModal } from './components/audio/SoundSynthesizerModal';
import { FocusTimerHero } from './components/focus/FocusTimerHero';
import { YouTubeLiveRadar } from './components/focus/YouTubeLiveRadar';
import { WorldFloor } from './components/campus/WorldFloor';
import { RoomView } from './components/campus/RoomView';
import { KnockModal } from './components/campus/KnockModal';
import { AdmissionQueueModal } from './components/campus/AdmissionQueueModal';
import { CreateSpaceModal } from './components/campus/CreateSpaceModal';
import { GizmoHub } from './components/gizmo/GizmoHub';
import { MagicImportModal } from './components/gizmo/MagicImportModal';
import { DeckPlayerModal } from './components/gizmo/DeckPlayerModal';
import { GizmoLiveBattle } from './components/gizmo/GizmoLiveBattle';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProfileModal } from './components/common/ProfileModal';
import { AuthModal } from './components/common/AuthModal';
import { GlobalActivityFeed } from './components/social/GlobalActivityFeed';
import { FirebaseService } from './services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Cloud, EyeOff } from 'lucide-react';

export default function App() {
  // Application Data States
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getUser());
  const [spaces, setSpaces] = useState<StudySpace[]>(() => StorageService.getSpaces());
  const [decks, setDecks] = useState<StudyDeck[]>(() => StorageService.getDecks());
  const [creators, setCreators] = useState<YouTubeCreator[]>(() => StorageService.getCreators());
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>(() => StorageService.getAdmissions());
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(() => StorageService.getFocusLogs());
  const [heatmapDays, setHeatmapDays] = useState(() => generate31DayHeatmap());
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(() => StorageService.getActivityFeed());

  // Navigation & Active Screen
  const [currentTab, setCurrentTab] = useState<'campus' | 'social' | 'gizmo' | 'focus' | 'analytics'>('campus');
  const [activeSpace, setActiveSpace] = useState<StudySpace | null>(null);

  // Sync state
  const [syncedCreator, setSyncedCreator] = useState<YouTubeCreator | null>(null);

  // Firebase Auth & Cloud Sync
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(false);
  const [isMagicImportOpen, setIsMagicImportOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [knockTargetSpace, setKnockTargetSpace] = useState<StudySpace | null>(null);
  const [activeDeckToPlay, setActiveDeckToPlay] = useState<StudyDeck | null>(null);
  const [activeDeckToBattle, setActiveDeckToBattle] = useState<StudyDeck | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = FirebaseService.onAuthChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const remoteProfile = await FirebaseService.getUserProfile(fbUser.uid);
        if (remoteProfile) {
          setCurrentUser(remoteProfile);
        } else {
          const initialProfile: UserProfile = {
            ...currentUser,
            id: fbUser.uid,
            name: fbUser.displayName || currentUser.name,
            avatar: fbUser.photoURL || currentUser.avatar,
          };
          setCurrentUser(initialProfile);
          await FirebaseService.saveUserProfile(initialProfile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync profile to Firestore if authenticated
  useEffect(() => {
    if (firebaseUser) {
      FirebaseService.saveUserProfile(currentUser);
    }
  }, [currentUser, firebaseUser]);

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

  useEffect(() => {
    StorageService.saveActivityFeed(activityFeed);
  }, [activityFeed]);

  // Social feed handlers
  const handleCheerActivity = (activityId: string) => {
    setActivityFeed((prev) =>
      prev.map((item) => {
        if (item.id === activityId) {
          const cheered = !item.userHasCheered;
          return {
            ...item,
            userHasCheered: cheered,
            cheersCount: cheered ? item.cheersCount + 1 : Math.max(0, item.cheersCount - 1),
          };
        }
        return item;
      })
    );
  };

  const handlePostMilestone = (title: string, description: string, subjectTag: string) => {
    const newItem: ActivityFeedItem = {
      id: `act_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      countryFlag: currentUser.countryFlag || '🌐',
      countryName: currentUser.countryName || 'Global',
      university: currentUser.university || currentUser.universityOrLocation,
      type: 'streak_milestone',
      title,
      description,
      xpEarned: 50,
      streakDays: currentUser.currentStreak,
      timestamp: 'Just now',
      cheersCount: 1,
      userHasCheered: true,
      subjectTag,
    };
    setActivityFeed([newItem, ...activityFeed]);
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

    // Append log
    const newLog: FocusSessionLog = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      category,
      subject,
      xpEarned: earnedXp,
    };
    setFocusLogs([newLog, ...focusLogs]);

    // If Ghost Mode is OFF, broadcast to Global Activity Feed
    if (!currentUser.isGhostMode) {
      const newFeedItem: ActivityFeedItem = {
        id: `act_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        countryFlag: currentUser.countryFlag || '🌐',
        countryName: currentUser.countryName || 'Global',
        university: currentUser.university || currentUser.universityOrLocation,
        type: 'session_completed',
        title: `Completed ${durationMinutes}m ${category === 'recall' ? 'Active Recall' : 'Deep Work'} Sprint`,
        description: `Focused sprint on ${subject} at ${currentUser.university || 'Global Campus'}.`,
        xpEarned: earnedXp,
        streakDays: currentUser.currentStreak,
        timestamp: 'Just now',
        cheersCount: 0,
        userHasCheered: false,
        subjectTag: subject,
      };
      setActivityFeed((prev) => [newFeedItem, ...prev]);
    }
  };

  // Admission knock handlers
  const handleKnockSpace = (space: StudySpace) => {
    setKnockTargetSpace(space);
  };

  const handleSubmitKnock = (spaceId: string, studyGoal: string) => {
    const target = spaces.find((s) => s.id === spaceId);
    if (!target) return;

    const newAdmission: AdmissionRequest = {
      id: `adm_${Date.now()}`,
      spaceId,
      spaceName: target.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      studyGoal,
      subjectTag: target.subjectTag,
      streakDays: currentUser.currentStreak,
      requestedAt: 'Just now',
      status: 'pending',
    };

    setAdmissions([newAdmission, ...admissions]);
  };

  const handleAcceptAdmission = (admissionId: string) => {
    const adm = admissions.find((a) => a.id === admissionId);
    if (!adm) return;

    setAdmissions((prev) =>
      prev.map((a) => (a.id === admissionId ? { ...a, status: 'approved' } : a))
    );

    // Add admitted member to space
    setSpaces((prev) =>
      prev.map((space) => {
        if (space.id === adm.spaceId) {
          const already = space.currentMembers.some((m) => m.id === adm.userId);
          if (already) return space;
          return {
            ...space,
            currentMembers: [
              ...space.currentMembers,
              {
                id: adm.userId,
                name: adm.userName,
                avatar: adm.userAvatar,
                location: 'Global Campus',
                subjectTag: adm.subjectTag,
                currentGoal: adm.studyGoal,
                status: 'in_focus',
                streakDays: adm.streakDays,
                focusMinutesToday: 0,
              },
            ],
          };
        }
        return space;
      })
    );
  };

  const handleRejectAdmission = (admissionId: string) => {
    setAdmissions((prev) =>
      prev.map((a) => (a.id === admissionId ? { ...a, status: 'rejected' } : a))
    );
  };

  const handleCreateSpace = (newSpace: StudySpace) => {
    setSpaces([newSpace, ...spaces]);
    setActiveSpace(newSpace);
  };

  const handleToggleCreatorSub = (creatorId: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, isSubscribed: !c.isSubscribed } : c))
    );
  };

  const handleSyncWithCreator = (creator: YouTubeCreator) => {
    setSyncedCreator(creator);
    setCurrentTab('focus');
  };

  const handleAddMarketplaceDeck = (deck: StudyDeck) => {
    setDecks([deck, ...decks]);
  };

  const handleFinishDeckReview = (deckId: string, cardsCount: number, earnedXp: number) => {
    handleSessionComplete(Math.round(cardsCount * 3), 'recall', '#ActiveRecall');
  };

  const handleFinishLiveBattle = (earnedXp: number, rank: number) => {
    handleSessionComplete(15, 'recall', '#GizmoBattle');
  };

  const pendingKnocks = admissions.filter((a) => a.status === 'pending');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Global Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/70 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-stone-950 flex items-center justify-center font-bold text-lg shadow-xs ring-2 ring-white">
              ✦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-stone-900">
                  Lumina Study
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  Aura v2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Social Focus • Global Campus • Gizmo AI
              </p>
            </div>
          </div>

          {/* Quick Metrics & Ambiance Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ghost Mode Quick Toggle */}
            <button
              onClick={handleToggleGhostMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
                currentUser.isGhostMode
                  ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold ring-1 ring-purple-300'
                  : 'bg-white border-stone-200/80 text-stone-600 hover:bg-stone-50'
              }`}
              title={currentUser.isGhostMode ? 'Ghost Mode ON: Presence hidden from directory' : 'Ghost Mode OFF: Presence visible to peers'}
            >
              <EyeOff className={`w-3.5 h-3.5 ${currentUser.isGhostMode ? 'text-purple-700' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">{currentUser.isGhostMode ? 'Ghost 👻' : 'Visible'}</span>
            </button>

            <button
              onClick={() => setIsAudioModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 text-xs font-semibold text-stone-700 shadow-xs transition-colors"
              title="Open Web Audio Synthesizer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Ambiance</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 text-xs font-bold text-stone-800 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{currentUser.currentStreak}d</span>
            </div>

            {/* Desk Pet Peek */}
            <div
              onClick={() => setCurrentTab('analytics')}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 hover:border-amber-300 text-xs font-semibold text-stone-800 shadow-xs transition-colors"
              title={`Desk Pet: ${currentUser.deskPet.name} Lv.${currentUser.deskPet.level}`}
            >
              <span>
                {currentUser.deskPet.species === 'shiba'
                  ? '🐕'
                  : currentUser.deskPet.species === 'capybara'
                  ? '🦫'
                  : '🦉'}
              </span>
              <span className="hidden sm:inline font-mono text-[11px] text-amber-700 font-bold">
                Lv.{currentUser.deskPet.level}
              </span>
            </div>

            {/* Cloud Login / Sync Button */}
            {firebaseUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs hover:bg-emerald-100 transition-colors"
                title="Cloud Sync Active (Click to manage)"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Cloud Synced</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-xs hover:bg-stone-800 transition-all active:scale-95"
                title="Sign In with Google or Email"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-300" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Profile & Account Switcher Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-300 text-xs font-semibold text-stone-800 shadow-xs transition-all hover:scale-102"
              title="Edit Profile or Switch Account"
            >
              <span className="hidden sm:inline font-bold text-stone-900">{currentUser.name.split(' ')[0]}</span>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-400"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        {/* If user is inside a specific space, render RoomView */}
        {activeSpace ? (
          <RoomView
            space={activeSpace}
            currentUser={currentUser}
            onLeaveSpace={() => setActiveSpace(null)}
            onOpenAdmissions={() => setIsAdmissionsOpen(true)}
            pendingKnocksCount={pendingKnocks.length}
          />
        ) : (
          <>
            {/* Tab 1: Campus & Study Directory */}
            {currentTab === 'campus' && (
              <WorldFloor
                spaces={spaces}
                currentUser={currentUser}
                onSelectSpace={(space) => setActiveSpace(space)}
                onKnockSpace={handleKnockSpace}
                onCreateSpaceOpen={() => setIsCreateSpaceOpen(true)}
                onOpenAdmissions={() => setIsAdmissionsOpen(true)}
                pendingKnocksCount={pendingKnocks.length}
              />
            )}

            {/* Tab 2: Social Hub & Global Activity Feed */}
            {currentTab === 'social' && (
              <GlobalActivityFeed
                feed={activityFeed}
                currentUser={currentUser}
                onCheerActivity={handleCheerActivity}
                onPostMilestone={handlePostMilestone}
                onToggleGhostMode={handleToggleGhostMode}
              />
            )}

            {/* Tab 3: Gizmo AI Study Suite */}
            {currentTab === 'gizmo' && (
              <GizmoHub
                decks={decks}
                currentUser={currentUser}
                onOpenDeck={(deck) => setActiveDeckToPlay(deck)}
                onOpenMagicImport={() => setIsMagicImportOpen(true)}
                onStartLiveBattle={(deck) => setActiveDeckToBattle(deck)}
                onAddMarketplaceDeck={handleAddMarketplaceDeck}
              />
            )}

            {/* Tab 3: Focus Timer & YouTube Live Radar */}
            {currentTab === 'focus' && (
              <div className="space-y-8 pb-20">
                <FocusTimerHero
                  onOpenAudioModal={() => setIsAudioModalOpen(true)}
                  onSessionComplete={handleSessionComplete}
                  syncedCreator={syncedCreator}
                  onDisconnectSync={() => setSyncedCreator(null)}
                  activeSubject={currentUser.currentSubject}
                />

                <YouTubeLiveRadar
                  creators={creators}
                  onToggleSubscribe={handleToggleCreatorSub}
                  onSyncWithCreator={handleSyncWithCreator}
                  syncedCreatorId={syncedCreator?.id}
                />
              </div>
            )}

            {/* Tab 4: Analytics, Macronutrients & Desk Pet */}
            {currentTab === 'analytics' && (
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
            )}
          </>
        )}
      </main>

      {/* Floating Pill Navigation Dock */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveSpace(null);
          setCurrentTab(tab);
        }}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        pendingKnocksCount={pendingKnocks.length}
        onOpenAdmissions={() => setIsAdmissionsOpen(true)}
      />

      {/* Quick Action Hub Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAction={(action) => {
          setIsQuickActionOpen(false);
          if (action === 'start_focus') {
            setActiveSpace(null);
            setCurrentTab('focus');
          } else if (action === 'magic_import') {
            setIsMagicImportOpen(true);
          } else if (action === 'create_space') {
            setIsCreateSpaceOpen(true);
          } else if (action === 'live_battle') {
            if (decks.length > 0) setActiveDeckToBattle(decks[0]);
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

      {/* Knock to Enter Modal */}
      <KnockModal
        space={knockTargetSpace}
        currentUser={currentUser}
        isOpen={!!knockTargetSpace}
        onClose={() => setKnockTargetSpace(null)}
        onSubmitKnock={handleSubmitKnock}
      />

      {/* Host Admission Queue Modal */}
      <AdmissionQueueModal
        isOpen={isAdmissionsOpen}
        onClose={() => setIsAdmissionsOpen(false)}
        admissions={admissions}
        onAccept={handleAcceptAdmission}
        onReject={handleRejectAdmission}
      />

      {/* Create Study Space Modal */}
      <CreateSpaceModal
        isOpen={isCreateSpaceOpen}
        onClose={() => setIsCreateSpaceOpen(false)}
        currentUser={currentUser}
        onCreateSpace={handleCreateSpace}
      />

      {/* Magic Import Engine Modal */}
      <MagicImportModal
        isOpen={isMagicImportOpen}
        onClose={() => setIsMagicImportOpen(false)}
        onDeckCreated={(newDeck) => {
          setDecks([newDeck, ...decks]);
          setActiveDeckToPlay(newDeck);
        }}
      />

      {/* Active Recall Deck Player Modal */}
      {activeDeckToPlay && (
        <DeckPlayerModal
          deck={activeDeckToPlay}
          isOpen={!!activeDeckToPlay}
          onClose={() => setActiveDeckToPlay(null)}
          onFinishReview={handleFinishDeckReview}
        />
      )}

      {/* Gizmo Live Multiplayer Battle Modal */}
      {activeDeckToBattle && (
        <GizmoLiveBattle
          deck={activeDeckToBattle}
          currentUser={currentUser}
          isOpen={!!activeDeckToBattle}
          onClose={() => setActiveDeckToBattle(null)}
          onBattleComplete={handleFinishLiveBattle}
        />
      )}

      {/* Studier Profile & Account Switcher Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={(updated) => setCurrentUser(updated)}
        onSwitchUser={(newUser) => setCurrentUser(newUser)}
      />

      {/* Firebase Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        firebaseUser={firebaseUser}
        currentUser={currentUser}
        onAuthSuccess={(fbUser) => {
          setFirebaseUser(fbUser);
        }}
        onUpdateProfile={(updates) => {
          setCurrentUser((prev) => ({ ...prev, ...updates }));
        }}
        onLogout={() => {
          setFirebaseUser(null);
        }}
      />
    </div>
  );
}
