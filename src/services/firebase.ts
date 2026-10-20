import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  StudySpace,
  StudyDeck,
  ActivityFeedItem,
  AdmissionRequest,
  FocusSessionLog,
  PeerUser,
  SubscriptionPlan,
  GlobalAnnouncement,
} from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in cached / offline mode.');
    }
  }
}
testConnection();

export class FirebaseService {
  /**
   * Listen to Firebase auth state changes
   */
  public static onAuthChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sign In with Email & Password
   */
  public static async loginEmail(email: string, pass: string): Promise<FirebaseUser> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }

  /**
   * Register with Email & Password
   */
  public static async registerEmail(email: string, pass: string, displayName: string): Promise<FirebaseUser> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  }

  /**
   * Sign In with Google
   */
  public static async loginGoogle(): Promise<FirebaseUser> {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  }

  /**
   * Sign In Anonymously (Guest Mode)
   */
  public static async loginGuest(): Promise<FirebaseUser> {
    const cred = await signInAnonymously(auth);
    return cred.user;
  }

  /**
   * Sign Out
   */
  public static async logout(): Promise<void> {
    await signOut(auth);
  }

  // -------------------------------------------------------------
  // USER PROFILES
  // -------------------------------------------------------------

  public static async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
    return null;
  }

  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.id}`;
    try {
      await setDoc(
        doc(db, 'users', profile.id),
        {
          ...profile,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  // -------------------------------------------------------------
  // STUDY SPACES (Real-time virtual campus rooms)
  // -------------------------------------------------------------

  public static subscribeSpaces(
    callback: (spaces: StudySpace[]) => void,
    fallbackSpaces: StudySpace[]
  ) {
    const path = 'spaces';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => docSnap.data() as StudySpace);
          callback(list);
        } else {
          // If empty in Firestore, seed fallback initial rooms without bots
          callback(fallbackSpaces);
          fallbackSpaces.forEach((space) => {
            setDoc(doc(db, 'spaces', space.id), space, { merge: true }).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        callback(fallbackSpaces);
      }
    );
  }

  public static async saveSpace(space: StudySpace): Promise<void> {
    const path = `spaces/${space.id}`;
    try {
      await setDoc(doc(db, 'spaces', space.id), space, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  public static async joinSpace(spaceId: string, member: PeerUser): Promise<void> {
    const path = `spaces/${spaceId}`;
    try {
      const spaceRef = doc(db, 'spaces', spaceId);
      const snap = await getDoc(spaceRef);
      if (snap.exists()) {
        const spaceData = snap.data() as StudySpace;
        const filtered = (spaceData.currentMembers || []).filter((m) => m.id !== member.id);
        const updatedMembers = [...filtered, member];
        await updateDoc(spaceRef, { currentMembers: updatedMembers });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  }

  public static async leaveSpace(spaceId: string, userId: string): Promise<void> {
    const path = `spaces/${spaceId}`;
    try {
      const spaceRef = doc(db, 'spaces', spaceId);
      const snap = await getDoc(spaceRef);
      if (snap.exists()) {
        const spaceData = snap.data() as StudySpace;
        const updatedMembers = (spaceData.currentMembers || []).filter((m) => m.id !== userId);
        await updateDoc(spaceRef, { currentMembers: updatedMembers });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  }

  // -------------------------------------------------------------
  // STUDY DECKS (Gizmo Active Recall Decks)
  // -------------------------------------------------------------

  public static subscribeDecks(
    callback: (decks: StudyDeck[]) => void,
    fallbackDecks: StudyDeck[]
  ) {
    const path = 'decks';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as StudyDeck);
          callback(list);
        } else {
          callback(fallbackDecks);
          fallbackDecks.forEach((deck) => {
            setDoc(doc(db, 'decks', deck.id), deck, { merge: true }).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        callback(fallbackDecks);
      }
    );
  }

  public static async saveDeck(deck: StudyDeck): Promise<void> {
    const path = `decks/${deck.id}`;
    try {
      await setDoc(doc(db, 'decks', deck.id), deck, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  // -------------------------------------------------------------
  // REAL-TIME ACTIVITY FEED
  // -------------------------------------------------------------

  public static subscribeActivityFeed(
    callback: (feed: ActivityFeedItem[]) => void,
    fallbackFeed: ActivityFeedItem[]
  ) {
    const path = 'activity_feed';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => docSnap.data() as ActivityFeedItem);
          callback(items);
        } else {
          callback(fallbackFeed);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        callback(fallbackFeed);
      }
    );
  }

  public static async addActivityItem(item: ActivityFeedItem): Promise<void> {
    const path = `activity_feed/${item.id}`;
    try {
      await setDoc(doc(db, 'activity_feed', item.id), item);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  }

  public static async cheerActivity(activityId: string): Promise<void> {
    const path = `activity_feed/${activityId}`;
    try {
      const ref = doc(db, 'activity_feed', activityId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const current = (snap.data() as ActivityFeedItem).cheersCount || 0;
        await updateDoc(ref, { cheersCount: current + 1 });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  }

  // -------------------------------------------------------------
  // ADMISSION REQUESTS / KNOCKS
  // -------------------------------------------------------------

  public static subscribeAdmissions(callback: (admissions: AdmissionRequest[]) => void) {
    const path = 'admissions';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as AdmissionRequest);
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  public static async submitAdmission(admission: AdmissionRequest): Promise<void> {
    const path = `admissions/${admission.id}`;
    try {
      await setDoc(doc(db, 'admissions', admission.id), admission);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  }

  public static async updateAdmissionStatus(
    admissionId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    const path = `admissions/${admissionId}`;
    try {
      await updateDoc(doc(db, 'admissions', admissionId), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  }

  // -------------------------------------------------------------
  // FOCUS LOGS
  // -------------------------------------------------------------

  public static async saveFocusLog(userId: string, log: FocusSessionLog): Promise<void> {
    const path = `users/${userId}/focus_logs/${log.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'focus_logs', log.id), log);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  }

  // -------------------------------------------------------------
  // SUBSCRIPTION PLANS & ANNOUNCEMENTS
  // -------------------------------------------------------------

  public static subscribePlans(
    callback: (plans: SubscriptionPlan[]) => void,
    fallback: SubscriptionPlan[]
  ) {
    const path = 'plans';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          callback(snapshot.docs.map((d) => d.data() as SubscriptionPlan));
        } else {
          callback(fallback);
        }
      },
      () => callback(fallback)
    );
  }

  public static subscribeAnnouncements(
    callback: (ann: GlobalAnnouncement[]) => void,
    fallback: GlobalAnnouncement[]
  ) {
    const path = 'announcements';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          callback(snapshot.docs.map((d) => d.data() as GlobalAnnouncement));
        } else {
          callback(fallback);
        }
      },
      () => callback(fallback)
    );
  }
}
