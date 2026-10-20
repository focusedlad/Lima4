import React, { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  Users,
  Lock,
  Globe,
  Plus,
  VolumeX,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { StudySpace, UserProfile } from '../../types';

interface WorldFloorProps {
  spaces: StudySpace[];
  currentUser: UserProfile;
  onSelectSpace: (space: StudySpace) => void;
  onKnockSpace: (space: StudySpace) => void;
  onCreateSpaceOpen: () => void;
  onOpenAdmissions: () => void;
  pendingKnocksCount: number;
}

import { COUNTRIES_CATALOG } from '../../services/universityCatalog';
import { EyeOff, School, MapPin } from 'lucide-react';

const POPULAR_TAGS = [
  'All',
  'USMLE',
  'MCAT',
  'Coding',
  'Calculus III',
  'Bar Exam',
  'A-Levels',
  'Architecture',
];

export const WorldFloor: React.FC<WorldFloorProps> = ({
  spaces,
  currentUser,
  onSelectSpace,
  onKnockSpace,
  onCreateSpaceOpen,
  onOpenAdmissions,
  pendingKnocksCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedCountryCode, setSelectedCountryCode] = useState('ALL');
  const [selectedUniversity, setSelectedUniversity] = useState('ALL');
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'pomodoro' | 'flowtime' | 'animedoro'>('all');

  // Great Hall persistent space
  const greatHall = spaces.find((s) => s.id === 'space_great_hall') || spaces[0];

  const currentCountry = COUNTRIES_CATALOG.find((c) => c.code === selectedCountryCode);

  // Filtered spaces
  const filteredSpaces = spaces.filter((space) => {
    // Exclude the Great Hall from the regular listing since it has its own dedicated spotlight hero!
    if (space.id === 'space_great_hall') return false;

    // Ghost Mode enforcement: if space is in Ghost Mode, only the host can see it!
    if (space.isGhostMode && space.hostId !== currentUser.id) {
      return false;
    }

    const matchesSearch =
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (space.university && space.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
      space.subjectTag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTag === 'All' ||
      space.subjectTag.toLowerCase().replace(/^#/, '') === selectedTag.toLowerCase().replace(/^#/, '');

    const matchesCountry =
      selectedCountryCode === 'ALL' || space.countryCode === selectedCountryCode;

    const matchesUniversity =
      selectedUniversity === 'ALL' || space.university === selectedUniversity;

    const matchesPrivacy =
      privacyFilter === 'all' ||
      (privacyFilter === 'public' && !space.isPrivate) ||
      (privacyFilter === 'private' && space.isPrivate);

    const matchesMode = modeFilter === 'all' || space.mode === modeFilter;

    return matchesSearch && matchesTag && matchesCountry && matchesUniversity && matchesPrivacy && matchesMode;
  });

  return (
    <div className="space-y-6 pb-20 w-full max-w-full overflow-x-hidden">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1">
            <Compass className="w-4 h-4" />
            <span>The World Floor • Global Virtual Campus</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Study Directory</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Discover active global studiers, join silent libraries, or knock into private sprint rooms.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {pendingKnocksCount > 0 && (
            <button
              onClick={onOpenAdmissions}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{pendingKnocksCount} Knocks Waiting</span>
            </button>
          )}

          <button
            onClick={onCreateSpaceOpen}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Host Space
          </button>
        </div>
      </div>

      {/* The Great Hall Hero Spotlight (Universal Silent Floor) */}
      <div className="squircle-card p-6 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white relative overflow-hidden shadow-xl border border-stone-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Worldwide Floor
              </span>
              <span className="text-xs text-stone-400">Universal Silent Floor</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              The Great Hall (Universal Silent Floor)
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {greatHall.currentMembers && greatHall.currentMembers.length > 0 ? (
                <>
                  <strong className="text-emerald-400">{greatHall.currentMembers.length} studier{greatHall.currentMembers.length === 1 ? '' : 's'}</strong> in the room right now. Real-time synchronous quiet focus.
                </>
              ) : (
                <>
                  Universal quiet room open for students worldwide. Step in, turn on your timer, and study in shared focus.
                </>
              )}
            </p>

            {/* Live Real Members Cluster */}
            <div className="flex items-center gap-3 pt-2">
              {greatHall.currentMembers && greatHall.currentMembers.length > 0 ? (
                <div className="flex -space-x-2.5 overflow-hidden">
                  {greatHall.currentMembers.slice(0, 5).map((m) => (
                    <img
                      key={m.id}
                      src={m.avatar}
                      alt={m.name}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-stone-900 object-cover"
                      title={m.name}
                    />
                  ))}
                  {greatHall.currentMembers.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-stone-800 ring-2 ring-stone-900 flex items-center justify-center text-[10px] font-bold text-amber-300">
                      +{greatHall.currentMembers.length - 5}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-stone-600" />
                  <span>Silent space ready • Enter to start</span>
                </div>
              )}
              <span className="text-xs text-stone-300 font-medium">Tokyo, Oxford, Seoul, Kampala, Boston...</span>
            </div>
          </div>

          <button
            onClick={() => onSelectSpace(greatHall)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-stone-900 font-bold text-xs hover:bg-stone-100 transition-all shadow-lg active:scale-95 shrink-0"
          >
            Enter Great Hall
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="squircle-card p-4 sm:p-5 bg-white border border-stone-200 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search by subject (MCAT, Coding), university (Oxford, Tokyo Tech), or room name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:bg-white"
          />
        </div>

        {/* Tag Filters (Subject / Exam Tag) - Wrapped neatly without horizontal scroll */}
        <div className="flex flex-wrap items-center gap-1.5 py-0.5">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-amber-100 text-stone-900 shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Country & University Explorer Bar */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-stone-400" />
              Filter by Country & University
            </span>
            {selectedCountryCode !== 'ALL' && (
              <button
                onClick={() => {
                  setSelectedCountryCode('ALL');
                  setSelectedUniversity('ALL');
                }}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
              >
                Reset Country Filter
              </button>
            )}
          </div>

          {/* Country Flag Pills - Wrapped neatly without horizontal scroll */}
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            <button
              onClick={() => {
                setSelectedCountryCode('ALL');
                setSelectedUniversity('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCountryCode === 'ALL'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>🌐</span>
              <span>All Countries</span>
            </button>

            {COUNTRIES_CATALOG.filter((c) => c.code !== 'GLOBAL').map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setSelectedCountryCode(c.code);
                  setSelectedUniversity('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCountryCode === c.code
                    ? 'bg-amber-100 text-stone-900 border border-amber-300 shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Sub-Filter: Universities in Selected Country - Wrapped without horizontal scroll */}
          {currentCountry && currentCountry.code !== 'GLOBAL' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-stone-400 text-[11px] font-medium shrink-0">Campus:</span>
              <button
                onClick={() => setSelectedUniversity('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedUniversity === 'ALL'
                    ? 'bg-stone-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All in {currentCountry.name}
              </button>

              {currentCountry.universities.map((uni) => (
                <button
                  key={uni}
                  onClick={() => setSelectedUniversity(uni)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    selectedUniversity === uni
                      ? 'bg-amber-200 text-stone-950 font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {uni}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Secondary Filters: Privacy & Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Access:</span>
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl">
              <button
                onClick={() => setPrivacyFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  privacyFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPrivacyFilter('public')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  privacyFilter === 'public' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setPrivacyFilter('private')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  privacyFilter === 'private' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Knock-to-Enter
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Mode:</span>
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl">
              <button
                onClick={() => setModeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  modeFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setModeFilter('pomodoro')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  modeFilter === 'pomodoro' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Pomodoro
              </button>
              <button
                onClick={() => setModeFilter('flowtime')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  modeFilter === 'flowtime' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Flowtime
              </button>
              <button
                onClick={() => setModeFilter('animedoro')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  modeFilter === 'animedoro' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Animedoro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpaces.map((space) => {
          const isHost = space.hostId === currentUser.id;

          return (
            <div
              key={space.id}
              className="squircle-card p-5 bg-white border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Space Top Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    {space.subjectTag.replace(/^#/, '')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {space.isGhostMode && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        <EyeOff className="w-3 h-3 text-purple-600" />
                        Ghost Mode
                      </span>
                    )}

                    {space.isPrivate ? (
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                        title="Knock required for admission"
                      >
                        <Lock className="w-3 h-3 text-amber-600" />
                        Knock to Enter
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        Public
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-stone-900 mb-1">{space.name}</h3>
                <p className="text-xs text-stone-500 mb-3 line-clamp-2">{space.tagline}</p>

                {/* Location & Interval Info */}
                <div className="space-y-1.5 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Campus:</span>
                    <span className="font-semibold text-stone-900 flex items-center gap-1">
                      <span>{space.countryFlag || '🌐'}</span>
                      <span className="truncate max-w-[160px]">{space.university || space.location}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Schedule:</span>
                    <span className="font-medium text-stone-800">{space.breakScheduleText || `${space.pomodoroInterval.work}m Focus`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Host:</span>
                    <span className="font-medium text-stone-800">
                      {isHost ? 'You (Room Leader)' : space.hostName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Member Avatars & Join/Knock Button */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {space.currentMembers.slice(0, 3).map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {space.currentMembers.length} / {space.maxCapacity}
                  </span>
                </div>

                {space.isPrivate && !isHost ? (
                  <button
                    onClick={() => onKnockSpace(space)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Knock to Enter
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectSpace(space)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {isHost ? 'Host Controls' : 'Join Space'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
