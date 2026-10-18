import React from 'react';
import { X, Timer, Sparkles, Plus, Zap, Volume2 } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'start_focus' | 'magic_import' | 'create_space' | 'live_battle' | 'sound_synth') => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-sm w-full p-6 bg-white border border-stone-200 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <h2 className="text-base font-bold text-stone-900">Quick Actions</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <button
            onClick={() => onAction('start_focus')}
            className="w-full p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-semibold border border-sky-100 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-200 text-sky-800 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900">Start Deep Focus Sprint</div>
              <div className="text-[11px] text-stone-500 font-normal">Launch dark hero timer & radar</div>
            </div>
          </button>

          <button
            onClick={() => onAction('magic_import')}
            className="w-full p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-950 font-semibold border border-pink-100 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-200 text-pink-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900">Gizmo Magic Import</div>
              <div className="text-[11px] text-stone-500 font-normal">YouTube, notes, or OCR to cards</div>
            </div>
          </button>

          <button
            onClick={() => onAction('create_space')}
            className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold border border-amber-100 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900">Host Study Space</div>
              <div className="text-[11px] text-stone-500 font-normal">Public or private knock-to-enter</div>
            </div>
          </button>

          <button
            onClick={() => onAction('live_battle')}
            className="w-full p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-semibold border border-purple-100 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900">Multiplayer Quiz Battle</div>
              <div className="text-[11px] text-stone-500 font-normal">Real-time synchronized battle</div>
            </div>
          </button>

          <button
            onClick={() => onAction('sound_synth')}
            className="w-full p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold border border-stone-200 flex items-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-stone-900">Ambient Sound Synthesizer</div>
              <div className="text-[11px] text-stone-500 font-normal">Rain, Tokyo cafe, library whispers</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
