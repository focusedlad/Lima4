import React, { useState } from 'react';
import {
  X,
  User,
  School,
  Target,
  Flame,
  Award,
  LogOut,
  Save,
  Check,
  Cloud,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SupabaseService } from '../../services/supabase';
import { COUNTRIES_CATALOG, STUDY_FIELDS } from '../../services/universityCatalog';
import { EyeOff, Globe, Crown, Scale } from 'lucide-react';

interface ProfileModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void | Promise<void>;
  onOpenTerms?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateProfile,
  onOpenTerms,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [selectedCountryCode, setSelectedCountryCode] = useState(currentUser.countryCode || 'GLOBAL');
  const [selectedUniversity, setSelectedUniversity] = useState(
    currentUser.university || currentUser.universityOrLocation || 'Independent Scholar'
  );
  const [customUniversity, setCustomUniversity] = useState('');
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [selectedStudyField, setSelectedStudyField] = useState(currentUser.studyField || STUDY_FIELDS[0]);
  const [isGhostMode, setIsGhostMode] = useState(currentUser.isGhostMode || false);

  const [subject, setSubjectTag] = useState(currentUser.currentSubject);
  const [goal, setGoal] = useState(currentUser.currentGoal);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [bannerUrl, setBannerUrl] = useState(currentUser.bannerUrl || '');
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>(currentUser.profileVisibility || 'public');
  const [isUploading, setIsUploading] = useState<'avatar' | 'banner' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCountry =
    COUNTRIES_CATALOG.find((c) => c.code === selectedCountryCode) || COUNTRIES_CATALOG[0];

  const getResolvedUniversity = () => {
    return isCustomUni ? (customUniversity.trim() || 'Global Campus') : selectedUniversity;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const uni = getResolvedUniversity();
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      countryCode: currentCountry.code,
      countryName: currentCountry.name,
      countryFlag: currentCountry.flag,
      university: uni,
      universityOrLocation: `${uni} (${currentCountry.flag} ${currentCountry.name})`,
      studyField: selectedStudyField,
      isGhostMode,
      currentSubject: subject.trim() || currentUser.currentSubject,
      currentGoal: goal.trim() || currentUser.currentGoal,
      avatar: avatar.trim() || currentUser.avatar,
      bio: bio.trim().slice(0, 500),
      bannerUrl: bannerUrl.trim(),
      profileVisibility,
    };
    setIsSaving(true);
    setSaveError(null);
    try {
      await onUpdateProfile(updated);
      setIsSaved(true);
      setTimeout(() => { setIsSaved(false); onClose(); }, 900);
    } catch (error: any) {
      setSaveError(error?.message || 'Your profile could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-x-hidden">
      <div className="profile-modal-card squircle-card w-[calc(100vw-1rem)] max-w-md min-w-0 p-4 sm:p-6 bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-2xl relative max-h-[calc(100dvh-1rem)] overflow-y-auto overflow-x-hidden overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Your profile</h2>
              <p className="text-xs text-stone-500">Personal details and study preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Profile photo and banner */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Profile picture</label>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={!!isUploading} onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setIsUploading('avatar'); setSaveError(null);
                    try { setAvatar(await SupabaseService.uploadProfileMedia(file, 'avatar')); }
                    catch (error: any) { setSaveError(error?.message || 'Profile picture upload failed.'); }
                    finally { setIsUploading(null); e.target.value = ''; }
                  }} className="w-full text-[10px] text-stone-600" />
                  <p className="text-[10px] text-stone-500 mt-1">{isUploading === 'avatar' ? 'Uploading picture…' : 'PNG, JPG, WEBP or AVIF · up to 5 MB'}</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Profile banner</label>
                {bannerUrl && <img src={bannerUrl} alt="Profile banner preview" className="w-full h-20 rounded-xl object-cover mb-2" />}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={!!isUploading} onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setIsUploading('banner'); setSaveError(null);
                  try { setBannerUrl(await SupabaseService.uploadProfileMedia(file, 'banner')); }
                  catch (error: any) { setSaveError(error?.message || 'Banner upload failed.'); }
                  finally { setIsUploading(null); e.target.value = ''; }
                }} className="w-full text-[10px] text-stone-600" />
                <p className="text-[10px] text-stone-500 mt-1">{isUploading === 'banner' ? 'Uploading banner…' : 'Optional wide image · up to 5 MB'}</p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kai Chen"
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Country and University Picker */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Country / Region</label>
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
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {currentCountry.universities.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                    <option value="__OTHER__">+ Custom Campus...</option>
                  </select>
                ) : (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={customUniversity}
                      onChange={(e) => setCustomUniversity(e.target.value)}
                      placeholder="Type university..."
                      className="w-full p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomUni(false)}
                      className="px-2 py-1 bg-stone-200 rounded-lg text-[10px] font-bold shrink-0"
                    >
                      List
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Study Field / Track</label>
                <select
                  value={selectedStudyField}
                  onChange={(e) => setSelectedStudyField(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {STUDY_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Current Subject Tag</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubjectTag(e.target.value)}
                  placeholder="e.g. #USMLE / #MCAT"
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Sprint Study Goal</label>
              <textarea
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What are you currently conquering?"
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Public bio</label>
              <textarea rows={3} maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other students a little about yourself…" className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-y" />
              <p className="text-[10px] text-stone-500 mt-1">{bio.length}/500 characters</p>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Who can view your profile?</label>
              <select value={profileVisibility} onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'friends' | 'private')} className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900">
                <option value="public">Everyone</option><option value="friends">Friends only</option><option value="private">Only me</option>
              </select>
            </div>

            {/* Membership Tier Info */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>
                      {currentUser.subscriptionTier === 'campus_elite'
                        ? 'Campus Elite Tier'
                        : currentUser.subscriptionTier === 'pro'
                        ? 'Pro Academic Tier'
                        : 'Free Scholar Tier'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-200 text-indigo-900 font-bold uppercase">
                      {currentUser.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-800">
                    {currentUser.subscriptionTier === 'campus_elite'
                      ? 'Verified leader, unlimited AI & private rooms'
                      : currentUser.subscriptionTier === 'pro'
                      ? 'Unlimited AI Magic Imports & Ghost mode'
                      : 'Essential focus tools and public campus rooms'}
                  </div>
                </div>
              </div>
            </div>

            {/* Ghost Mode Toggle */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isGhostMode}
                onChange={(e) => setIsGhostMode(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 mt-0.5"
              />
              <div className="text-purple-950">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <EyeOff className="w-3.5 h-3.5 text-purple-700" />
                  Ghost Mode (Incognito Study)
                </span>
                <span className="text-[11px] text-purple-800 leading-relaxed block mt-0.5">
                  Keep your study sessions, live sprint status, and university presence hidden from other users in the global directory and live activity feed.
                </span>
              </div>
            </label>

            {saveError && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-950/40 dark:text-rose-200">
                {saveError}
              </p>
            )}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTerms?.();
                }}
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white underline flex items-center gap-1.5 self-start sm:self-center"
              >
                <Scale className="w-3.5 h-3.5 text-indigo-700" />
                <span>View Platform Rules & Terms of Service</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xs active:scale-95"
                >
                  {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving…' : isSaved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
</form>
      </div>
    </div>
  );
};
