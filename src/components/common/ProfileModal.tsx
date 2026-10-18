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
  UserPlus,
  Cloud,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { COUNTRIES_CATALOG, STUDY_FIELDS } from '../../services/universityCatalog';
import { EyeOff, Globe, Crown } from 'lucide-react';

interface ProfileModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onSwitchUser: (newUser: UserProfile) => void;
}

const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr_kai',
    name: 'Kai Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    universityOrLocation: 'Tokyo Institute of Technology (🇯🇵 Japan)',
    countryCode: 'JP',
    countryName: 'Japan',
    countryFlag: '🇯🇵',
    university: 'Tokyo Institute of Technology',
    studyField: 'Medicine & Healthcare (USMLE, Pre-Med)',
    isGhostMode: false,
    currentSubject: '#USMLE / Neuro',
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
  },
  {
    id: 'usr_eleanor',
    name: 'Eleanor Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    universityOrLocation: 'University of Oxford (🇬🇧 United Kingdom)',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    countryFlag: '🇬🇧',
    university: 'University of Oxford',
    studyField: 'Law & Jurisprudence (Bar Exam, LLB)',
    isGhostMode: false,
    currentSubject: '#BarExam / Torts',
    currentGoal: 'Civil procedure summary memo & contract precedent',
    status: 'in_focus',
    currentStreak: 22,
    totalHoursStudied: 142.0,
    xp: 6850,
    deskPet: {
      name: 'Matcha',
      species: 'owl',
      level: 6,
      currentXp: 180,
      nextLevelXp: 700,
      mood: 'focused',
      decorations: ['Antique Bookshelf', 'Warm Desk Lamp'],
    },
  },
  {
    id: 'usr_jinwoo',
    name: 'Jin-Woo Park',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    universityOrLocation: 'Seoul National University (SNU) (🇰🇷 South Korea)',
    countryCode: 'KR',
    countryName: 'South Korea',
    countryFlag: '🇰🇷',
    university: 'Seoul National University (SNU)',
    studyField: 'Medicine & Healthcare (USMLE, Pre-Med)',
    isGhostMode: false,
    currentSubject: '#USMLE / Pathology',
    currentGoal: 'Renal cell carcinoma histology & pharmacology',
    status: 'in_focus',
    currentStreak: 31,
    totalHoursStudied: 188.5,
    xp: 8900,
    deskPet: {
      name: 'Boba',
      species: 'capybara',
      level: 7,
      currentXp: 410,
      nextLevelXp: 850,
      mood: 'happy',
      decorations: ['Hot Spring Tub', 'Bonsai Tree'],
    },
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateProfile,
  onSwitchUser,
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
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'switch'>('edit');

  if (!isOpen) return null;

  const currentCountry =
    COUNTRIES_CATALOG.find((c) => c.code === selectedCountryCode) || COUNTRIES_CATALOG[0];

  const getResolvedUniversity = () => {
    return isCustomUni ? (customUniversity.trim() || 'Global Campus') : selectedUniversity;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const uni = getResolvedUniversity();
    onUpdateProfile({
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
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleCreateNewAccount = () => {
    const newName = `Studier_${Math.floor(1000 + Math.random() * 9000)}`;
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: newName,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      universityOrLocation: 'Global Campus (🌐 Global)',
      countryCode: 'GLOBAL',
      countryName: 'Global',
      countryFlag: '🌐',
      university: 'Independent Scholar',
      studyField: STUDY_FIELDS[0],
      isGhostMode: false,
      currentSubject: '#DeepFocus',
      currentGoal: 'Daily focus sprint',
      status: 'in_focus',
      currentStreak: 1,
      totalHoursStudied: 0,
      xp: 100,
      deskPet: {
        name: 'Pip',
        species: 'shiba',
        level: 1,
        currentXp: 50,
        nextLevelXp: 200,
        mood: 'happy',
        decorations: ['Steaming Matcha'],
      },
    };
    onSwitchUser(newProfile);
    setName(newProfile.name);
    setSelectedCountryCode('GLOBAL');
    setSelectedUniversity('Independent Scholar');
    setSelectedStudyField(STUDY_FIELDS[0]);
    setIsGhostMode(false);
    setSubjectTag(newProfile.currentSubject);
    setGoal(newProfile.currentGoal);
    setAvatar(newProfile.avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-md w-full p-6 bg-white border border-stone-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Studier Profile & Account</h2>
              <p className="text-xs text-stone-500">Identity, exam tags, and account switching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'edit' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'switch' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Switch Account ({PRESET_ACCOUNTS.length})
          </button>
        </div>

        {activeTab === 'edit' ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Avatar Preview */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2"
              />
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
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
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                    className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                  className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
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
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
              />
            </div>

            {/* Membership Tier Info */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>
                      {currentUser.subscriptionTier === 'campus_elite'
                        ? 'Campus Elite Tier'
                        : currentUser.subscriptionTier === 'pro'
                        ? 'Pro Academic Tier'
                        : 'Free Scholar Tier'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-200 text-amber-900 font-bold uppercase">
                      {currentUser.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800">
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

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-xs active:scale-95"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
              Switch to Another Studier
            </span>

            {PRESET_ACCOUNTS.map((acc) => {
              const isCurrent = acc.id === currentUser.id || acc.name === currentUser.name;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    onSwitchUser(acc);
                    setName(acc.name);
                    setSelectedCountryCode(acc.countryCode || 'GLOBAL');
                    setSelectedUniversity(acc.university || acc.universityOrLocation);
                    setSelectedStudyField(acc.studyField || STUDY_FIELDS[0]);
                    setIsGhostMode(acc.isGhostMode || false);
                    setSubjectTag(acc.currentSubject);
                    setGoal(acc.currentGoal);
                    setAvatar(acc.avatar);
                    onClose();
                  }}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-50 border-amber-300 shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        {acc.name}
                        {isCurrent && (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-md font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-stone-500 text-[11px]">{acc.universityOrLocation}</div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-stone-500">
                    <div className="font-mono font-bold text-stone-800">{acc.totalHoursStudied}h</div>
                    <div className="text-amber-600 font-semibold">{acc.currentStreak}d streak</div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={handleCreateNewAccount}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                <UserPlus className="w-4 h-4 text-stone-500" />
                Create New Studier Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
