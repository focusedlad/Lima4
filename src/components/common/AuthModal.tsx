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
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

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
    setSuccessMsg(null);
    setCanResendVerification(false);
    setTermsError(false);

    try {
      if (mode === 'login') {
        const res = await SupabaseService.signInWithEmail(email, password);
        if (!res.success) {
          const message = res.error || 'Invalid email or password.';
          setErrorMsg(message);
          setCanResendVerification(/email not confirmed|not confirmed|confirm your email/i.test(message));
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
          currentStreak: currentUser.currentStreak || 0,
          totalHoursStudied: currentUser.totalHoursStudied || 0,
          xp: currentUser.xp || 0,
        };
        const { profile: finalUser, isFirstUser } = await syncProfileUpdates(updatedUser, true);
        onAuthSuccess(finalUser);
        if (isFirstUser) {
          setSuccessMsg('Welcome — you are the first registered member of cheri. You are helping start the real community; other members will appear as they join.');
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

  const handleResendVerification = async () => {
    if (!email.trim()) { setErrorMsg('Enter your email address first.'); return; }
    setResendingVerification(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await SupabaseService.resendVerificationEmail(email);
      if (!result.success) { setErrorMsg(result.error || 'Could not resend the verification email.'); return; }
      setSuccessMsg('A fresh verification email has been sent. Open its link to finish creating your account.');
      setCanResendVerification(false);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Could not resend the verification email.');
    } finally {
      setResendingVerification(false);
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-stone-900 dark:text-indigo-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Welcome to cheri
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sign in to save your focus sessions and study progress.
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
        {canResendVerification && (
          <button type="button" onClick={() => void handleResendVerification()} disabled={resendingVerification} className="mb-4 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-400/20 dark:bg-indigo-950/40 dark:text-indigo-200">
            {resendingVerification ? 'Sending verification email…' : 'Resend verification email'}
          </button>
        )}

        <div className="space-y-4 text-xs">
          {/* Rules and Legal Agreement Container (Clean, zero emojis) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              termsError
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300'
                : hasAcceptedTerms
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-indigo-50/60 border-indigo-200 text-stone-900 dark:bg-stone-800 dark:border-stone-700 dark:text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900 dark:text-white">
                <Scale className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                <span>Platform Study Rules & Terms</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(true)}
                className="text-[11px] font-bold text-indigo-800 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
                <EyeOff className="w-3 h-3 text-indigo-500" /> Ghost Mode Privacy
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
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 shrink-0"
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

          {/* Email-only authentication */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Continue with email
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
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
