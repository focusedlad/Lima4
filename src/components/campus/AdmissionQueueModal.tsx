import React from 'react';
import { X, Check, ShieldAlert, UserCheck, Flame, Clock } from 'lucide-react';
import { AdmissionRequest } from '../../types';

interface AdmissionQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  admissions: AdmissionRequest[];
  onAccept: (admissionId: string) => void;
  onReject: (admissionId: string) => void;
}

export const AdmissionQueueModal: React.FC<AdmissionQueueModalProps> = ({
  isOpen,
  onClose,
  admissions,
  onAccept,
  onReject,
}) => {
  if (!isOpen) return null;

  const pending = admissions.filter((a) => a.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-lg w-full p-6 bg-white border border-stone-200 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Room Leader Admission Queue</h2>
              <p className="text-xs text-stone-500">
                {pending.length} pending admission knock{pending.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto py-4 space-y-3 flex-1">
          {pending.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <UserCheck className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-semibold text-stone-600">Admission Queue is Clear</p>
              <p className="text-xs text-stone-400 mt-1">No pending knocks from studiers right now.</p>
            </div>
          ) : (
            pending.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-stone-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.userAvatar}
                      alt={req.userName}
                      className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{req.userName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-medium text-amber-700">{req.spaceName}</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-600 font-semibold">
                          <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                          {req.streakDays}d Streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {req.requestedAt}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-stone-200/60 text-xs text-stone-700 italic">
                  "{req.studyGoal}"
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onReject(req.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                  <button
                    onClick={() => onAccept(req.id)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Admit to Space
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
