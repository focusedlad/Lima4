import React, { useState } from 'react';
import { CloudRain, Coffee, BookOpen, Disc3, Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { audioSynth } from '../../services/audioSynth';

interface SoundSynthesizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSynthesizerModal: React.FC<SoundSynthesizerModalProps> = ({ isOpen, onClose }) => {
  const [rainVol, setRainVol] = useState(0.4);
  const [cafeVol, setCafeVol] = useState(0);
  const [libraryVol, setLibraryVol] = useState(0);
  const [vinylVol, setVinylVol] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  const handleVolumeChange = (type: 'rain' | 'cafe' | 'library' | 'vinyl', val: number) => {
    if (type === 'rain') setRainVol(val);
    if (type === 'cafe') setCafeVol(val);
    if (type === 'library') setLibraryVol(val);
    if (type === 'vinyl') setVinylVol(val);
    audioSynth.setChannelVolume(type, val);
  };

  const handleToggleMute = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  const handlePreset = (preset: 'rainy_library' | 'tokyo_cafe' | 'deep_vinyl' | 'mute_all') => {
    if (preset === 'rainy_library') {
      handleVolumeChange('rain', 0.6);
      handleVolumeChange('library', 0.4);
      handleVolumeChange('cafe', 0);
      handleVolumeChange('vinyl', 0.2);
    } else if (preset === 'tokyo_cafe') {
      handleVolumeChange('cafe', 0.6);
      handleVolumeChange('vinyl', 0.3);
      handleVolumeChange('rain', 0);
      handleVolumeChange('library', 0);
    } else if (preset === 'deep_vinyl') {
      handleVolumeChange('vinyl', 0.7);
      handleVolumeChange('library', 0.2);
      handleVolumeChange('rain', 0);
      handleVolumeChange('cafe', 0);
    } else if (preset === 'mute_all') {
      handleVolumeChange('rain', 0);
      handleVolumeChange('cafe', 0);
      handleVolumeChange('library', 0);
      handleVolumeChange('vinyl', 0);
      audioSynth.stopAll();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-md w-full p-6 bg-white border border-stone-200 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Atmosphere Synthesizer</h2>
              <p className="text-xs text-stone-500">Procedural Web Audio • No streaming latency</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
              title={isMuted ? 'Unmute master' : 'Mute master'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
            Quick Ambiance Presets
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handlePreset('rainy_library')}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-sky-50 text-sky-800 border border-sky-100 hover:bg-sky-100 transition-colors text-center"
            >
              Rainy Library
            </button>
            <button
              onClick={() => handlePreset('tokyo_cafe')}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100 transition-colors text-center"
            >
              Tokyo Café
            </button>
            <button
              onClick={() => handlePreset('deep_vinyl')}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-purple-50 text-purple-800 border border-purple-100 hover:bg-purple-100 transition-colors text-center"
            >
              Lofi Vinyl
            </button>
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-4">
          {/* Rain */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-semibold text-stone-800">Rain on Window</span>
              </div>
              <span className="text-xs font-mono text-stone-500">{Math.round(rainVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={rainVol}
              onChange={(e) => handleVolumeChange('rain', parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
          </div>

          {/* Tokyo Cafe */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-stone-800">Tokyo Café Murmur</span>
              </div>
              <span className="text-xs font-mono text-stone-500">{Math.round(cafeVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={cafeVol}
              onChange={(e) => handleVolumeChange('cafe', parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
          </div>

          {/* Library Whispers */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-stone-800">Library Air & Pages</span>
              </div>
              <span className="text-xs font-mono text-stone-500">{Math.round(libraryVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={libraryVol}
              onChange={(e) => handleVolumeChange('library', parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
          </div>

          {/* Vinyl Lofi */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-stone-800">Vinyl Lofi & 60Hz Needle</span>
              </div>
              <span className="text-xs font-mono text-stone-500">{Math.round(vinylVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={vinylVol}
              onChange={(e) => handleVolumeChange('vinyl', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-100 flex justify-between items-center">
          <button
            onClick={() => handlePreset('mute_all')}
            className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
          >
            Mute All Sounds
          </button>
          <button
            onClick={() => {
              audioSynth.playChime('pomodoro_complete');
            }}
            className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
          >
            Test Zen Chime
          </button>
        </div>
      </div>
    </div>
  );
};
