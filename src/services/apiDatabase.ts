import { UserProfile, FocusSessionLog, StudySpace, StudyDeck } from '../types';

export const ApiDatabase = {
  async syncUser(user: UserProfile, idToken?: string) {
    try {
      if (!idToken) return null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` };

      const res = await fetch('/api/db/sync-user', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          uid: user.id,
          email: user.email || '',
          name: user.name,
          handle: user.handle,
          avatar: user.avatar,
          bio: user.bio || '',
          bannerUrl: user.bannerUrl || '',
          profileVisibility: user.profileVisibility || 'public',
          bio: user.bio || '',
          bannerUrl: user.bannerUrl || '',
          profileVisibility: user.profileVisibility || 'public',
          university: user.university || user.universityOrLocation,
          studyField: user.studyField,
          countryCode: user.countryCode,
          countryName: user.countryName,
          currentSubject: user.currentSubject,
          currentGoal: user.currentGoal,
          isGhostMode: user.isGhostMode,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          termsAccepted: user.termsAccepted,
          termsAcceptedAt: user.termsAcceptedAt,
          termsVersion: user.termsVersion,
          xp: user.xp,
          totalHoursStudied: Math.round(user.totalHoursStudied),
          currentStreak: user.currentStreak,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('ApiDatabase.syncUser skipped (offline/demo mode):', e);
      return null;
    }
  },

  async logFocusSession(log: FocusSessionLog, userUid: string, idToken?: string) {
    try {
      if (!idToken) return null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` };

      const res = await fetch('/api/db/focus-logs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userUid,
          durationMinutes: log.durationMinutes,
          category: log.category,
          subject: log.subject,
          xpEarned: log.xpEarned,
          date: log.date,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('ApiDatabase.logFocusSession skipped:', e);
      return null;
    }
  },

  async saveStudySpace(space: StudySpace, idToken?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/db/study-spaces', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          spaceId: space.id,
          name: space.name,
          tagline: space.tagline,
          subjectTag: space.subjectTag,
          hostUid: space.hostId,
          hostName: space.hostName,
          hostAvatar: space.hostAvatar,
          mode: space.mode,
          isPrivate: space.isPrivate,
          workMin: space.pomodoroInterval?.work || 50,
          breakMin: space.pomodoroInterval?.breakTime || 10,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('ApiDatabase.saveStudySpace skipped:', e);
      return null;
    }
  },

  async saveStudyDeck(deck: StudyDeck, idToken?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/db/study-decks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deckId: deck.id,
          title: deck.title,
          description: deck.description,
          subjectTag: deck.subjectTag,
          curriculum: deck.curriculum,
          cardsCount: deck.cardsCount,
          authorUid: deck.authorName || 'author',
          authorName: deck.authorName,
          cardsJson: JSON.stringify(deck.cards || []),
          rating: deck.rating || 5,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('ApiDatabase.saveStudyDeck skipped:', e);
      return null;
    }
  },
};
