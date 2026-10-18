import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  LogOut,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Globe,
  School,
  BookOpen,
  EyeOff,
  MapPin,
  Scale,
  FileText,
  Check,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { FirebaseService } from '../../services/firebase';
import { UserProfile } from '../../types';
import { COUNTRIES_CATALOG, STUDY_FIELDS } from '../../services/universityCatalog';
import { RulesAndFeaturesModal } from './RulesAndFeaturesModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile;
  onAuthSuccess: (fbUser: FirebaseUser) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  firebaseUser,
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

  const syncProfileUpdates = async (fbUser: FirebaseUser) => {
    const uni = getResolvedUniversity();
    const updates: Partial<UserProfile> = {
      countryCode: currentCountry.code,
      countryName: currentCountry.name,
      countryFlag: currentCountry.flag,
      university: uni,
      universityOrLocation: `${uni} (${currentCountry.flag} ${currentCountry.name})`,
      studyField: selectedStudyField,
      isGhostMode,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: '2026.1',
    };

    if (onUpdateProfile) {
      onUpdateProfile(updates);
    }

    try {
      await FirebaseService.saveUserProfile({
        ...currentUser,
        id: fbUser.uid,
        name: displayName.trim() || fbUser.displayName || currentUser.name,
        avatar: fbUser.photoURL || currentUser.avatar,
        ...updates,
      });
    } catch (e) {
      console.warn('Could not sync profile to Firebase:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasAcceptedTerms) {
      setTermsError(true);
      setErrorMsg('Mandatory: Please review and accept the Rules, Regulations, and Feature Terms before signing in.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setTermsError(false);
    try {
      const user = await FirebaseService.loginGoogle();
      await syncProfileUpdates(user);
      setSuccessMsg('Successfully signed in with Google!');
      onAuthSuccess(user);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAcceptedTerms) {
      setTermsError(true);
      setErrorMsg('Mandatory: Please review and check the agreement box for Rules, Regulations & Features.');
      return;
    }
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg(null);
    setTermsError(false);

    try {
      let user: FirebaseUser;
      if (mode === 'login') {
        user = await FirebaseService.loginEmail(email.trim(), password);
        await syncProfileUpdates(user);
        setSuccessMsg('Welcome back! Signed in successfully.');
      } else {
        user = await FirebaseService.registerEmail(email.trim(), password, displayName.trim());
        await syncProfileUpdates(user);
        setSuccessMsg('Account created! Signed in successfully.');
      }
      onAuthSuccess(user);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    if (!hasAcceptedTerms) {
      setTermsError(true);
      setErrorMsg('Mandatory: Please review and check the agreement box before continuing as Guest.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setTermsError(false);
    try {
      const user = await FirebaseService.loginGuest();
      await syncProfileUpdates(user);
      setSuccessMsg('Signed in as Guest with cloud session!');
      onAuthSuccess(user);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not sign in anonymously.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActiveSettings = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      await syncProfileUpdates(firebaseUser);
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await FirebaseService.logout();
      onLogout();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-lg w-full p-6 sm:p-7 bg-white border border-stone-200 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-stone-900 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Student Account & Location</h2>
              <p className="text-xs text-stone-500">Global Campus, Universities & Privacy Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* If Already Logged In: Show Account info and Location/Ghost Controls */}
        {firebaseUser ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Logged in with Firebase Cloud</span>
                <span className="text-stone-600 block mt-0.5">
                  {firebaseUser.email || (firebaseUser.isAnonymous ? 'Guest Studier Session' : firebaseUser.displayName || 'Studier')}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 block mt-0.5">
                  UID: {firebaseUser.uid.slice(0, 16)}...
                </span>
              </div>
            </div>

            {/* Location & Ghost Mode Settings for Active User */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <h3 className="font-bold text-stone-800 flex items-center gap-1.5">
                <School className="w-4 h-4 text-amber-600" />
                <span>Your University & Country Presence</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Country</label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      const found = COUNTRIES_CATALOG.find((c) => c.code === e.target.value);
                      if (found && found.universities.length > 0) {
                        setSelectedUniversity(found.universities[0]);
                        setIsCustomUni(false);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {COUNTRIES_CATALOG.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">University / Campus</label>
                  {!isCustomUni ? (
                    <select
                      value={selectedUniversity}
                      onChange={(e) => {
                        if (e.target.value === '__OTHER__') {
                          setIsCustomUni(true);
                        } else {
                          setSelectedUniversity(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    >
                      {currentCountry.universities.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                      <option value="__OTHER__">+ Enter Custom University...</option>
                    </select>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        placeholder="Type campus name..."
                        className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomUni(false)}
                        className="px-2 py-1 bg-stone-200 rounded-lg text-[10px] font-bold"
                      >
                        List
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Study Field / Exam Track</label>
                <select
                  value={selectedStudyField}
                  onChange={(e) => setSelectedStudyField(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {STUDY_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ghost Mode Privacy Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGhostMode}
                  onChange={(e) => setIsGhostMode(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 mt-0.5"
                />
                <div className="text-purple-950">
                  <span className="font-bold flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-purple-700" />
                    Ghost Mode (Incognito Study)
                  </span>
                  <span className="text-[11px] text-purple-800 leading-relaxed block mt-0.5">
                    Hide my active study session and university from other studiers online. My rooms will be private and unlisted.
                  </span>
                </div>
              </label>

              <button
                type="button"
                onClick={handleSaveActiveSettings}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-xs"
              >
                Save Location & Ghost Mode Settings
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-4 text-xs">
            {/* Mandatory Rules, Regulations & Features Legal Agreement Container */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                termsError
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300 animate-pulse'
                  : hasAcceptedTerms
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/60 border-amber-200 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Platform Rules & Feature Agreement</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Read Full Legal Terms</span>
                </button>
              </div>

              {/* Feature Highlights Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <span className="px-2 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[10px] font-medium text-stone-700">
                  🛡️ Zero Harassment
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[10px] font-medium text-stone-700">
                  🎓 Academic Integrity
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[10px] font-medium text-stone-700">
                  ⚡ AI Tools As-Is
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[10px] font-medium text-stone-700">
                  🔒 Ghost Mode Privacy
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[10px] font-medium text-stone-700">
                  ⚖️ Liability Waiver
                </span>
              </div>

              {/* Mandatory Acceptance Checkbox */}
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
                <span className="text-[11px] leading-tight font-medium text-stone-800">
                  I have read, understand, and agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRulesModalOpen(true);
                    }}
                    className="font-bold underline text-amber-900 hover:text-stone-950"
                  >
                    Lumina Study Rules, Regulations, App Features Terms, and Legal Liability Waiver
                  </button>
                  .
                </span>
              </label>

              {termsError && (
                <p className="mt-2 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Required: You must check this box to proceed with login or registration.</span>
                </p>
              )}

              {hasAcceptedTerms && (
                <div className="mt-2 text-[10px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-100/70 px-2 py-1 rounded-lg">
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Agreement verified & legally accepted for this session.</span>
                </div>
              )}
            </div>

            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-2xl bg-white border text-stone-800 font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 ${
                !hasAcceptedTerms ? 'border-stone-200 opacity-70 hover:border-amber-400' : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'
              }`}
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

            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">or email</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                  mode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'register' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Kai Chen"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {/* Campus, Country & Field Configuration for Account */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-amber-700" />
                    Your Country & University Presence
                  </span>
                  <span className="text-[10px] text-amber-700">Shown in World Floor</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Country</label>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => {
                        setSelectedCountryCode(e.target.value);
                        const found = COUNTRIES_CATALOG.find((c) => c.code === e.target.value);
                        if (found && found.universities.length > 0) {
                          setSelectedUniversity(found.universities[0]);
                          setIsCustomUni(false);
                        }
                      }}
                      className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                    >
                      {COUNTRIES_CATALOG.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">University / Campus</label>
                    {!isCustomUni ? (
                      <select
                        value={selectedUniversity}
                        onChange={(e) => {
                          if (e.target.value === '__OTHER__') {
                            setIsCustomUni(true);
                          } else {
                            setSelectedUniversity(e.target.value);
                          }
                        }}
                        className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                      >
                        {currentCountry.universities.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                        <option value="__OTHER__">+ Enter Custom...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        placeholder="Campus name"
                        className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Study Track / Field</label>
                  <select
                    value={selectedStudyField}
                    onChange={(e) => setSelectedStudyField(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {STUDY_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ghost Mode Option */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGhostMode}
                    onChange={(e) => setIsGhostMode(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400"
                  />
                  <span className="text-[11px] text-stone-700">
                    <strong className="text-purple-900">Enable Ghost Mode 👻</strong> (Keep my study sessions hidden from online directory)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-300" />}
                <span>{mode === 'login' ? 'Sign In to Lumina' : 'Create Lumina Account'}</span>
              </button>
            </form>

            {/* Guest Mode option */}
            <div className="pt-2 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Or continue as Instant Guest with above country settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Interactive Rules, Regulations & Features Terms Modal */}
      <RulesAndFeaturesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onAccept={() => {
          setHasAcceptedTerms(true);
          setTermsError(false);
          setErrorMsg(null);
        }}
        hasAccepted={hasAcceptedTerms}
      />
    </div>
  );
};
