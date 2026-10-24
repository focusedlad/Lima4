import React, { useState } from 'react';
import {
  User,
  AtSign,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Shield,
  EyeOff,
  Clock,
  Save,
  Check,
  GraduationCap,
  Mail,
  Cherry,
  Sliders,
  Bell,
  RefreshCw,
  LogOut,
  Flame,
  Award,
  Monitor,
  Database,
  Link2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynth';
import { ApiDatabase } from '../../services/apiDatabase';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  getCustomSupabaseConfig,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  isSupabaseConfigured,
} from '../../services/supabase';

interface SettingsViewProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  themePreference: 'system' | 'dark' | 'light';
  onSelectThemePreference: (pref: 'system' | 'dark' | 'light') => void;
  isDarkMode: boolean;
  onOpenAuthModal?: () => void;
  onSignOut?: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateUser,
  themePreference,
  onSelectThemePreference,
  isDarkMode,
  onOpenAuthModal,
  onSignOut,
}) => {
  // Form State for editing account details
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`);
  const [email, setEmail] = useState(currentUser.email || '');
  const [university, setUniversity] = useState(currentUser.university || currentUser.universityOrLocation || '');
  const [studyField, setStudyField] = useState(currentUser.studyField || '');
  const [currentGoal, setCurrentGoal] = useState(currentUser.currentGoal || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Focus Preferences State
  const [defaultWorkMin, setDefaultWorkMin] = useState<number>(25);
  const [defaultBreakMin, setDefaultBreakMin] = useState<number>(5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(false);

  // UI state
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Custom Supabase Connection State
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(() => getCustomSupabaseConfig()?.url || '');
  const [customSupabaseKey, setCustomSupabaseKey] = useState(() => getCustomSupabaseConfig()?.anonKey || '');
  const [supabaseMsg, setSupabaseMsg] = useState<string | null>(null);

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSupabaseUrl.trim() || !customSupabaseKey.trim()) {
      clearCustomSupabaseConfig();
      setSupabaseMsg('Reset to built-in local database');
      setTimeout(() => setSupabaseMsg(null), 3000);
      return;
    }
    setCustomSupabaseConfig(customSupabaseUrl.trim(), customSupabaseKey.trim());
    setSupabaseMsg('Connected! Live Supabase credentials saved.');
    setTimeout(() => setSupabaseMsg(null), 3000);
  };

  // Sample curated avatar collection
  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle.trim()}`;
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      handle: cleanHandle,
      email: email.trim(),
      university: university.trim(),
      universityOrLocation: university.trim() || currentUser.universityOrLocation,
      studyField: studyField.trim(),
      currentGoal: currentGoal.trim(),
      avatar: avatar,
    };

    onUpdateUser(updated);
    ApiDatabase.syncUser(updated);

    if (soundEnabled) {
      audioSynth.playChime('peer_nudge');
    }

    setIsSaved(true);
    setSaveMessage('Account settings updated successfully');
    setTimeout(() => {
      setIsSaved(false);
      setSaveMessage('');
    }, 3000);
  };

  const handleToggleGhost = () => {
    const nextGhost = !currentUser.isGhostMode;
    const updated = { ...currentUser, isGhostMode: nextGhost };
    onUpdateUser(updated);
    ApiDatabase.syncUser(updated);
    if (soundEnabled) {
      audioSynth.playChime('peer_nudge');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#221F21] rounded-3xl p-6 sm:p-8 border border-pink-100 dark:border-pink-950/60 shadow-[0_8px_30px_rgb(244,114,182,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 dark:bg-pink-950/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-sky-50 dark:bg-sky-950/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl ring-4 ring-pink-200 dark:ring-pink-900 overflow-hidden shadow-sm shrink-0 relative bg-pink-100">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-900">
                  {currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-pink-500" />
                <span>{currentUser.university || currentUser.universityOrLocation || 'Campus Studier'}</span>
                <span>•</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">{currentUser.studyField || 'General Studies'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="px-3 py-2 rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1A1B] border border-pink-100 dark:border-pink-900 flex items-center gap-2 text-xs">
              <Flame className="w-4 h-4 text-pink-500" />
              <span className="font-bold text-stone-800 dark:text-stone-200">{currentUser.currentStreak} Day Streak</span>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1A1B] border border-sky-100 dark:border-sky-900 flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-stone-800 dark:text-stone-200">{currentUser.totalHoursStudied}h Studied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Appearance & Preferences */}
        <div className="space-y-6 lg:col-span-1">
          {/* Appearance Card */}
          <div className="bg-white dark:bg-[#141315] rounded-3xl p-6 border border-pink-100 dark:border-stone-800 shadow-[0_4px_20px_rgb(244,114,182,0.04)]">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-pink-500" />
              <span>Theme & Display</span>
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-4">
              Sync automatically with your device OS or lock to pure dark or light
            </p>

            <div className="space-y-2.5">
              {/* System Sync Option */}
              <button
                type="button"
                onClick={() => onSelectThemePreference('system')}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                  themePreference === 'system'
                    ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/40 ring-2 ring-pink-400 dark:ring-pink-700 text-stone-900 dark:text-white font-bold'
                    : 'border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#1A181C] text-stone-600 dark:text-stone-400 hover:border-pink-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Sync with System</span>
                  </div>
                  {themePreference === 'system' && <Check className="w-4 h-4 text-pink-500" />}
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                  Automatically changes when your phone or computer switches theme (currently: {isDarkMode ? 'Dark' : 'Light'})
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Full Dark */}
                <button
                  type="button"
                  onClick={() => onSelectThemePreference('dark')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    themePreference === 'dark'
                      ? 'border-pink-500 bg-pink-950/50 ring-2 ring-pink-700 text-white font-bold'
                      : 'border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#1A181C] text-stone-600 dark:text-stone-400 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Moon className="w-4 h-4 text-sky-400" />
                    {themePreference === 'dark' && <Check className="w-4 h-4 text-pink-400" />}
                  </div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Full Dark</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">Deep pitch dark</div>
                </button>

                {/* Light Cream */}
                <button
                  type="button"
                  onClick={() => onSelectThemePreference('light')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    themePreference === 'light'
                      ? 'border-pink-400 bg-pink-50/70 ring-2 ring-pink-300 text-stone-900 font-bold'
                      : 'border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#1A181C] text-stone-600 dark:text-stone-400 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Sun className="w-4 h-4 text-pink-500" />
                    {themePreference === 'light' && <Check className="w-4 h-4 text-pink-600" />}
                  </div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Light Cream</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">Ivory & soft pink</div>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Presence */}
          <div className="bg-white dark:bg-[#221F21] rounded-3xl p-6 border border-pink-100 dark:border-pink-950/60 shadow-[0_4px_20px_rgb(244,114,182,0.04)]">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-500" />
              <span>Study Privacy</span>
            </h2>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100/80 dark:border-pink-950/80">
              <div className="pr-3">
                <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-pink-500" />
                  <span>Ghost Mode</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Hide active focus sessions from campus feeds & public directories
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleGhost}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                  currentUser.isGhostMode ? 'bg-pink-500' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentUser.isGhostMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Audio Chime Notification */}
          <div className="bg-white dark:bg-[#221F21] rounded-3xl p-6 border border-pink-100 dark:border-pink-950/60 shadow-[0_4px_20px_rgb(244,114,182,0.04)]">
            <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-pink-500" />
              <span>Chimes & Audio</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100/80 dark:border-pink-950/80">
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-white">Timer Bells</div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Soft meditative wooden chime on completion</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) audioSynth.playChime('pomodoro_complete');
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                    soundEnabled ? 'bg-pink-500' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => audioSynth.playChime('peer_nudge')}
                className="w-full py-2 px-3 rounded-xl bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 text-xs font-bold transition-colors border border-pink-200 dark:border-pink-900 flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Test Notification Chime</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Account Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#221F21] rounded-3xl p-6 sm:p-8 border border-pink-100 dark:border-pink-950/60 shadow-[0_4px_20px_rgb(244,114,182,0.04)]">
            <div className="flex items-center justify-between pb-4 border-b border-pink-50 dark:border-pink-950/60 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-pink-500" />
                  <span>Account & Profile Details</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Update your public name, unique handle, and academic campus
                </p>
              </div>

              {isSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-800 animate-fade-in">
                  <Check className="w-3.5 h-3.5 text-pink-600" />
                  <span>{saveMessage || 'Saved'}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-5">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Choose Profile Picture
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {AVATAR_OPTIONS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 transition-transform ${
                        avatar === url
                          ? 'ring-3 ring-pink-500 scale-105 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Option" className="w-full h-full object-cover" />
                      {avatar === url && (
                        <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Unique Username Handle
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@username"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all font-mono"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Friends can search and follow you using this unique handle
                  </span>
                </div>
              </div>

              {/* Email & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    University / Institution
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. Oxford, Stanford, MIT"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Field of Study & Current Study Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Field of Study / Major
                  </label>
                  <input
                    type="text"
                    value={studyField}
                    onChange={(e) => setStudyField(e.target.value)}
                    placeholder="e.g. Computer Science, Medicine, Law"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Current Study Goal or Bio
                  </label>
                  <input
                    type="text"
                    value={currentGoal}
                    onChange={(e) => setCurrentGoal(e.target.value)}
                    placeholder="e.g. 100 hours of Deep Work this month"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900 text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs font-extrabold text-stone-900 dark:text-white">Sign out of Lima4</p><p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">Your saved study history stays with your account.</p></div>
                  <button type="button" onClick={() => { if (onSignOut) void onSignOut(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-stone-900 dark:text-rose-300"><LogOut className="h-4 w-4" />Sign out</button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Account Details</span>
                </button>

                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="px-4 py-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-xs font-bold border border-sky-200 dark:border-sky-900 transition-colors"
                  >
                    Cloud Sync & Sign In
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Pomodoro & Study Time Configuration */}
          <div className="bg-white dark:bg-[#221F21] rounded-3xl p-6 sm:p-8 border border-pink-100 dark:border-pink-950/60 shadow-[0_4px_20px_rgb(244,114,182,0.04)]">
            <h2 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-sky-500" />
              <span>Pomodoro & Focus Timer Defaults</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Configure your default intervals for Pomodoro cycles and open-ended Study Time
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-pink-100 dark:border-pink-900/60">
                <div className="text-xs font-bold text-stone-900 dark:text-white mb-2">
                  Default Pomodoro Work Interval
                </div>
                <div className="flex items-center gap-2">
                  {[25, 45, 50, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDefaultWorkMin(m)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        defaultWorkMin === m
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-pink-50'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-[#1A1819] border border-sky-100 dark:border-sky-900/60">
                <div className="text-xs font-bold text-stone-900 dark:text-white mb-2">
                  Default Short Break Interval
                </div>
                <div className="flex items-center gap-2">
                  {[3, 5, 10, 15].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDefaultBreakMin(m)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        defaultBreakMin === m
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-sky-50'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
