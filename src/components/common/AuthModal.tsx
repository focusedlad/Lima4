import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Globe,
  BookOpen,
  EyeOff,
  Scale,
  FileText,
  Check,
  Award,
} from 'lucide-react';
import {
  SupabaseService,
  getCustomSupabaseConfig,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  isSupabaseConfigured,
} from '../../services/supabase';
import { StorageService } from '../../services/storage';
import { UserProfile } from '../../types';
import { COUNTRIES_CATALOG, STUDY_FIELDS } from '../../services/universityCatalog';
import { RulesAndFeaturesModal } from './RulesAndFeaturesModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAuthSuccess: (userProfile: UserProfile) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onUpdateProfile,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(currentUser.name || '');

  // Campus, Country & Ghost Mode Settings
  const [selectedCountryCode, setSelectedCountryCode] = useState(currentUser.countryCode || 'GLOBAL');
  const [selectedUniversity, setSelectedUniversity] = useState(
    currentUser.university || currentUser.universityOrLocation || 'Independent Scholar'
  );
  const [customUniversity, setCustomUniversity] = useState('');
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [selectedStudyField, setSelectedStudyField] = useState(currentUser.studyField || STUDY_FIELDS[0]);
  const [isGhostMode, setIsGhostMode] = useState(currentUser.isGhostMode || false);

  // Mandatory Rules, Regulations & Features Acceptance
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => Boolean(currentUser.termsAccepted));
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCountry =
    COUNTRIES_CATALOG.find((c) => c.code === selectedCountryCode) || COUNTRIES_CATALOG[0];

  const getResolvedUniversity = () => {
    return isCustomUni ? (customUniversity.trim() || 'Global Campus') : selectedUniversity;
  };

  const syncProfileUpdates = async (profile: UserProfile, newlyRegistered = false) => {
    const uni = getResolvedUniversity();
    const updates: Partial<UserProfile> = {
      countryCode: currentCountry.code, countryName: currentCountry.name, countryFlag: currentCountry.flag,
      university: uni, universityOrLocation: `${uni} (${currentCountry.name})`,
      studyField: selectedStudyField, isGhostMode, termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(), termsVersion: '2026.1',
    };
    const updatedFull = { ...profile, ...updates };
    onUpdateProfile?.(updates);
    StorageService.saveUser(updatedFull);
    const syncResult = await SupabaseService.syncUser(updatedFull);
    return { profile: updatedFull, isFirstUser: newlyRegistered && Boolean(syncResult?.isFirstUser) };
  };
  const handleAppleSignIn = async () => {
    if (!hasAcceptedTerms) { setTermsError(true); setErrorMsg('Please accept the platform agreement before signing in.'); return; }
    setLoading(true); setErrorMsg(null); setTermsError(false);
    try { const res = await SupabaseService.signInWithApple(); if (!res.success) setErrorMsg(res.error || 'Apple sign-in could not start.'); }
    catch (err: any) { setErrorMsg(err.message || 'Could not start Apple sign-in.'); }
    finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    if (!hasAcceptedTerms) { setTermsError(true); setErrorMsg('Please accept the platform agreement before signing in.'); return; }
    setLoading(true); setErrorMsg(null); setTermsError(false);
    try { const res = await SupabaseService.signInWithGoogle(); if (!res.success) setErrorMsg(res.error || 'Google sign-in could not start.'); }
    catch (err: any) { setErrorMsg(err.message || 'Could not start Google sign-in.'); }
    finally { setLoading(false); }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAcceptedTerms) {
      setTermsError(true);
      setErrorMsg('Please accept the platform rules agreement before continuing.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setTermsError(false);

    try {
      if (mode === 'login') {
        const res = await SupabaseService.signInWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid email or password.');
          return;
        }
        setSuccessMsg('Welcome back to cheri!');
        // If stored student details exist, use them
        const baseUser = res.profile || currentUser;
        const updatedUser: UserProfile = {
          ...baseUser, id: res.user?.id || baseUser.id,
          email: email.trim().toLowerCase(),
          name: res.user?.user_metadata?.full_name || res.user?.user_metadata?.name || (baseUser.id === currentUser.id && baseUser.name !== 'New Studier' ? baseUser.name : displayName || email.split('@')[0]),
        };
        const { profile: finalUser } = await syncProfileUpdates(updatedUser, false);
        onAuthSuccess(finalUser);
      } else {
        const res = await SupabaseService.signUpWithEmail(email, password, displayName || 'New Studier');
        if (!res.success) { setErrorMsg(res.error || 'Signup failed.'); return; }
        if (!res.session) {
          localStorage.setItem('cheri_pending_first_user_welcome', email.trim().toLowerCase());
          setSuccessMsg('Account created. Check your email and open the verification link to finish setting up your account. The link will return you to this app.');
          return;
        }
        setSuccessMsg('Student account created successfully!');
        const uni = getResolvedUniversity();
        const updatedUser: UserProfile = {
          ...currentUser,
          id: res.user?.id || currentUser.id,
          email: email.trim().toLowerCase(),
          name: displayName || email.split('@')[0],
          handle: `@${(displayName || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          university: uni,
          universityOrLocation: `${uni} (${currentCountry.name})`,
          countryCode: currentCountry.code,
          countryName: currentCountry.name,
          studyField: selectedStudyField,
          isGhostMode,
          currentStreak: currentUser.currentStreak || 1,
          totalHoursStudied: currentUser.totalHoursStudied || 0,
          xp: currentUser.xp || 100,
        };
        const { profile: finalUser, isFirstUser } = await syncProfileUpdates(updatedUser, true);
        onAuthSuccess(finalUser);
        if (isFirstUser) {
          setSuccessMsg('Welcome — you are the first registered member of cheri. You are helping start the real community; other members will appear as they join.');
          return;
        }
      }

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

    const handleSignOut = async () => {
    setLoading(true);
    try {
      await SupabaseService.signOut();
      onLogout();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-x-hidden">
      <div className="auth-modal-card squircle-card w-[calc(100vw-1rem)] max-w-lg min-w-0 p-4 sm:p-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl relative max-h-[calc(100dvh-1rem)] overflow-y-auto overflow-x-hidden overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-stone-900 dark:text-amber-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Student Account & Cloud Sync
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Supabase & PostgreSQL Social Study Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Rules and Legal Agreement Container (Clean, zero emojis) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              termsError
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300'
                : hasAcceptedTerms
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50/60 border-amber-200 text-stone-900 dark:bg-stone-800 dark:border-stone-700 dark:text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900 dark:text-white">
                <Scale className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Platform Study Rules & Terms</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(true)}
                className="text-[11px] font-bold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>Read Full Terms</span>
              </button>
            </div>

            {/* Feature Pills (No Emojis) */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Respectful Community
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                <BookOpen className="w-3 h-3 text-indigo-500" /> Academic Integrity
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                <EyeOff className="w-3 h-3 text-amber-500" /> Ghost Mode Privacy
              </span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={(e) => {
                  setHasAcceptedTerms(e.target.checked);
                  if (e.target.checked) {
                    setTermsError(false);
                    setErrorMsg(null);
                  }
                }}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 shrink-0"
              />
              <span className="text-[11px] leading-tight font-medium text-stone-800 dark:text-stone-300">
                I have read and agree to the platform community guidelines and terms.
              </span>
            </label>

            {hasAcceptedTerms && (
              <div className="mt-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-1 rounded-lg">
                <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                <span>Agreement accepted for this device.</span>
              </div>
            )}
          </div>

          {/* Social Sign In Options: Apple & Google */}
          <div className="space-y-2 pt-1">
            {/* Apple Login Button (Official Apple Design) */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-stone-900 text-white font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.77-8.15-12.23-15.22-5.75-9.12-10.23-19.46-13.43-30.98-3.21-11.53-4.81-22.75-4.81-33.68 0-14.15 3.37-26.04 10.12-35.68 6.74-9.64 15.42-14.54 26.03-14.71 4.7 0 10.11 1.25 16.24 3.75 6.13 2.5 9.94 3.76 11.43 3.76 1.83 0 5.86-1.3 12.08-3.9 6.22-2.6 11.45-3.79 15.7-3.58 11.66.57 21.14 4.88 28.43 12.93-10.37 6.29-15.4 15.15-15.08 26.58.33 8.97 3.86 16.48 10.6 22.52 6.73 6.04 14.58 9.5 23.54 10.39-2.29 7.08-5.21 14.62-8.77 22.61zM119.22 31.84c0-7.39 2.68-14.39 8.04-21.01 5.36-6.62 11.89-10.53 19.59-11.73.1 1.13.15 2.14.15 3.03 0 7.23-2.8 14.34-8.4 21.32-5.6 6.98-12.08 10.82-19.44 11.53-.1-1.04-.15-2.08-.15-3.14z" />
              </svg>
              <span>Sign in with Apple</span>
            </button>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-white font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-stone-750"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              or email
            </span>
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Liam Parker"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 text-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : mode === 'login' ? (
                'Sign In to cheri'
              ) : (
                'Create Student Account'
              )}
            </button>
          </form>


        </div>

        {/* Legal Terms Modal */}
        <RulesAndFeaturesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          onAccept={() => {
            setHasAcceptedTerms(true);
            setTermsError(false);
            setIsRulesModalOpen(false);
          }}
          hasAccepted={hasAcceptedTerms}
        />
      </div>
    </div>
  );
};
