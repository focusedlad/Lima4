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
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

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

  /**
   * Load user profile from Firestore or return null if none
   */
  public static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Could not fetch user profile from Firestore:', e);
    }
    return null;
  }

  /**
   * Save / Sync user profile to Firestore
   */
  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', profile.id), {
        ...profile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not sync user profile to Firestore:', e);
    }
  }
}
