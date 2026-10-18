import React, { useState } from 'react';
import { Plus, X, Lock, Globe, VolumeX, Clock } from 'lucide-react';
import { StudySpace, UserProfile } from '../../types';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateSpace: (newSpace: StudySpace) => void;
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateSpace,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [subjectTag, setSubjectTag] = useState('#USMLE');
  const [location, setLocation] = useState('Global Silent Wing');
  const [mode, setMode] = useState<'pomodoro' | 'flowtime' | 'animedoro' | 'discussion'>('pomodoro');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(true);
  const [workMin, setWorkMin] = useState(50);
  const [breakMin, setBreakMin] = useState(10);
  const [maxCapacity, setMaxCapacity] = useState(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSpace: StudySpace = {
      id: 'space_' + Date.now(),
      name: name.trim(),
      tagline: tagline.trim() || 'Focused study and deep accountability room.',
      subjectTag: subjectTag.startsWith('#') ? subjectTag : `#${subjectTag}`,
      location: location.trim() || 'Global Campus',
      mode,
      isPrivate,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatar,
      currentMembers: [
        {
          id: currentUser.id,
          name: `${currentUser.name} (Host)`,
          avatar: currentUser.avatar,
          location: currentUser.universityOrLocation,
          subjectTag: subjectTag,
          currentGoal: currentUser.currentGoal,
          status: 'in_focus',
          streakDays: currentUser.currentStreak,
          focusMinutesToday: 0,
        },
      ],
      maxCapacity,
      isSilentMode,
      pomodoroInterval: { work: workMin, breakTime: breakMin },
      breakScheduleText: `${workMin}m Focus / ${breakMin}m Break sync`,
      createdAt: new Date().toISOString(),
    };

    onCreateSpace(newSpace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-lg w-full p-6 bg-white border border-stone-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Create Study Space</h2>
              <p className="text-xs text-stone-500">Host your own public floor or private knock room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Space Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Oxford Radcliffe Camera Law Sprint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Tagline / Mission</label>
            <input
              type="text"
              placeholder="e.g. Silent sprints, strictly no phones, 50m intervals"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Subject / Exam Tag</label>
              <select
                value={subjectTag}
                onChange={(e) => setSubjectTag(e.target.value)}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="#USMLE">#USMLE</option>
                <option value="#MCAT">#MCAT</option>
                <option value="#Coding">#Coding</option>
                <option value="#CalculusIII">#CalculusIII</option>
                <option value="#BarExam">#BarExam</option>
                <option value="#A-Levels">#A-Levels</option>
                <option value="#Architecture">#Architecture</option>
                <option value="#GlobalAllSubjects">#GlobalAllSubjects</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">University / Location</label>
              <input
                type="text"
                placeholder="e.g. Tokyo Tech / Seoul SNU"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          {/* Privacy Toggle: Public vs Knock to Enter */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-semibold text-stone-800 block">Access Control & Admission</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  !isPrivate
                    ? 'bg-white text-stone-900 border-amber-300 shadow-xs ring-2 ring-amber-100'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/60'
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">Public Space</div>
                  <div className="text-[10px] text-stone-500">Anyone can join immediately</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  isPrivate
                    ? 'bg-white text-stone-900 border-amber-300 shadow-xs ring-2 ring-amber-100'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/60'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold">Knock to Enter</div>
                  <div className="text-[10px] text-stone-500">Host reviews study sprint goal</div>
                </div>
              </button>
            </div>
          </div>

          {/* Timer Mode & Interval */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Focus Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="pomodoro">Pomodoro (Synced)</option>
                <option value="flowtime">Flowtime (Continuous)</option>
                <option value="animedoro">Animedoro (40/20)</option>
                <option value="discussion">Group Discussion</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Max Capacity</label>
              <input
                type="number"
                min="2"
                max="500"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          {/* Silent Mode Policy */}
          <label className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isSilentMode}
              onChange={(e) => setIsSilentMode(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
            />
            <div className="text-stone-700">
              <span className="font-semibold block">Enforce Silent Mode (Mics forced off)</span>
              <span className="text-[11px] text-stone-500">
                Maintains universal quiet atmosphere. Communication only via silent board or nudges.
              </span>
            </div>
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95"
            >
              Create & Host Space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
