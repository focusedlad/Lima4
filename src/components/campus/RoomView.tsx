import React, { useState } from 'react';
import {
  ArrowLeft,
  VolumeX,
  Lock,
  Globe,
  Bell,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Flame,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { StudySpace, UserProfile, PeerUser } from '../../types';
import { audioSynth } from '../../services/audioSynth';

interface RoomViewProps {
  space: StudySpace;
  currentUser: UserProfile;
  onLeaveSpace: () => void;
  onOpenAdmissions?: () => void;
  pendingKnocksCount?: number;
}

export const RoomView: React.FC<RoomViewProps> = ({
  space,
  currentUser,
  onLeaveSpace,
  onOpenAdmissions,
  pendingKnocksCount = 0,
}) => {
  const isHost = space.hostId === currentUser.id;
  const [boardMessages, setBoardMessages] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: '1', user: 'Kai Chen', text: '50m sprint: finishing Cranial Nerve IV & VI lesions.', time: 'Just now' },
    { id: '2', user: 'Eleanor Vance', text: 'Contract law remedies drill - phone locked in drawer.', time: '5m ago' },
    { id: '3', user: 'Jin-Woo Park', text: 'Renal cell histology review. Good luck everyone!', time: '12m ago' },
  ]);
  const [newIntention, setNewIntention] = useState('');
  const [nudgeNotice, setNudgeNotice] = useState<string | null>(null);

  const handleSendNudge = (peer: PeerUser) => {
    audioSynth.playChime('peer_nudge');
    setNudgeNotice(`Sent gentle focus chime to ${peer.name}`);
    setTimeout(() => setNudgeNotice(null), 3000);
  };

  const handlePostIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntention.trim()) return;
    setBoardMessages([
      {
        id: Date.now().toString(),
        user: currentUser.name,
        text: newIntention.trim(),
        time: 'Just now',
      },
      ...boardMessages,
    ]);
    setNewIntention('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notice */}
      {nudgeNotice && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <span>{nudgeNotice}</span>
          <button onClick={() => setNudgeNotice(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Room Header Banner */}
      <div className="squircle-card p-6 bg-white border border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <button
            onClick={onLeaveSpace}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </button>

          <div className="flex items-center gap-2">
            {space.isPrivate ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Knock-to-Enter Private Space
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Public Global Space
              </span>
            )}

            {space.isSilentMode && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
                <VolumeX className="w-3.5 h-3.5" />
                Silent Floor Enforced
              </span>
            )}

            {isHost && onOpenAdmissions && (
              <button
                onClick={onOpenAdmissions}
                className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                Admission Queue
                {pendingKnocksCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white">
                    {pendingKnocksCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="font-semibold text-amber-700">{space.subjectTag.replace(/^#/, '')}</span>
              <span>•</span>
              <span>{space.location}</span>
              <span>•</span>
              <span>Host: {space.hostName}</span>
            </div>
            <h1 className="text-xl font-bold text-stone-900">{space.name}</h1>
            <p className="text-xs text-stone-600 mt-1">{space.tagline}</p>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
            <div className="text-right">
              <div className="text-xs font-semibold text-stone-500">Room Focus Interval</div>
              <div className="text-sm font-bold text-stone-900">
                {space.pomodoroInterval.work}m Work / {space.pomodoroInterval.breakTime}m Rest
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left = Active Studiers Grid; Right = Silent Focus Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns Peer Studiers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-600" />
              Active Studiers in this Room ({space.currentMembers.length} / {space.maxCapacity})
            </h2>

            <div className="flex items-center gap-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" /> In Focus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" /> On Break
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" /> Away
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {space.currentMembers.map((peer) => {
              const ringColor =
                peer.status === 'in_focus'
                  ? 'ring-emerald-500 ring-offset-2'
                  : peer.status === 'on_break'
                  ? 'ring-amber-500 ring-offset-2'
                  : 'ring-rose-500 ring-offset-2';

              const statusBadge =
                peer.status === 'in_focus' ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    In Focus
                  </span>
                ) : peer.status === 'on_break' ? (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                    On Break
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                    Away (Phone)
                  </span>
                );

              return (
                <div
                  key={peer.id}
                  className="squircle-card p-4 bg-white border border-stone-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={peer.avatar}
                          alt={peer.name}
                          className={`w-11 h-11 rounded-full object-cover ring-2 ${ringColor}`}
                        />
                        {peer.status === 'in_focus' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-stone-900">{peer.name}</h3>
                        <p className="text-[11px] text-stone-500">{peer.location}</p>
                      </div>
                    </div>
                    {statusBadge}
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 mb-3">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Sprint Goal</span>
                    <p className="line-clamp-2 italic font-serif">"{peer.currentGoal}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="flex items-center text-amber-600 font-semibold text-[11px]">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                      {peer.streakDays}d Streak
                    </span>

                    {peer.id !== currentUser.id && (
                      <button
                        onClick={() => handleSendNudge(peer)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors"
                        title="Send focus chime"
                      >
                        <Bell className="w-3 h-3 text-amber-600" />
                        Nudge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Silent Intention & Accountability Board */}
        <div className="space-y-4">
          <div className="squircle-card p-5 bg-white border border-stone-200 flex flex-col h-full max-h-[600px]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-stone-900">Silent Intention Board</h3>
              </div>
              <span className="text-[10px] text-stone-400">Quiet accountability only</span>
            </div>

            {/* Post Intention Form */}
            <form onSubmit={handlePostIntention} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Share your current sprint focus..."
                  value={newIntention}
                  onChange={(e) => setNewIntention(e.target.value)}
                  className="w-full px-3 py-2 pr-9 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Messages Feed */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {boardMessages.map((msg) => (
                <div key={msg.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-[11px]">{msg.user}</span>
                    <span className="text-[10px] text-stone-400">{msg.time}</span>
                  </div>
                  <p className="text-stone-700">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
