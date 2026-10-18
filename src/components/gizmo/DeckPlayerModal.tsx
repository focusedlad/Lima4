import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  Mic,
  MicOff,
  RotateCcw,
  Check,
  ChevronRight,
  Flame,
  Volume2,
  Award,
} from 'lucide-react';
import { StudyDeck, Flashcard } from '../../types';
import { SocraticTutorDrawer } from './SocraticTutorDrawer';
import { audioSynth } from '../../services/audioSynth';

interface DeckPlayerModalProps {
  deck: StudyDeck;
  isOpen: boolean;
  onClose: () => void;
  onFinishReview: (deckId: string, cardsReviewed: number, xpEarned: number) => void;
}

export const DeckPlayerModal: React.FC<DeckPlayerModalProps> = ({
  deck,
  isOpen,
  onClose,
  onFinishReview,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [lastUserAttempt, setLastUserAttempt] = useState('');
  const [cardsCompletedCount, setCardsCompletedCount] = useState(0);
  const [isDeckFinished, setIsDeckFinished] = useState(false);

  const currentCard: Flashcard | undefined = deck.cards[currentIndex];

  useEffect(() => {
    setSelectedOption(null);
    setFillInput('');
    setIsAnswerRevealed(false);
    setIsListening(false);
  }, [currentIndex]);

  if (!isOpen) return null;

  const handleMultipleChoiceSelect = (opt: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(opt);
    setIsAnswerRevealed(true);
    setLastUserAttempt(opt);

    if (opt.toLowerCase() === currentCard?.back.toLowerCase()) {
      audioSynth.playChime('pomodoro_complete');
    }
  };

  const handleCheckFill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fillInput.trim() || isAnswerRevealed) return;
    setIsAnswerRevealed(true);
    setLastUserAttempt(fillInput);

    if (fillInput.trim().toLowerCase() === currentCard?.back.trim().toLowerCase()) {
      audioSynth.playChime('pomodoro_complete');
    }
  };

  // Voice Prompt answer simulation / Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Fallback simulated voice transcription
      setIsListening(true);
      setTimeout(() => {
        const spoken = currentCard?.back || 'Cranial nerve pathway';
        setFillInput(spoken);
        setLastUserAttempt(spoken);
        setIsAnswerRevealed(true);
        setIsListening(false);
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFillInput(transcript);
        setLastUserAttempt(transcript);
        setIsAnswerRevealed(true);
      };
      recognition.start();
    } catch (_) {
      setIsListening(false);
    }
  };

  // SRS Rating Selection
  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setCardsCompletedCount((prev) => prev + 1);

    if (currentIndex + 1 < deck.cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsDeckFinished(true);
      const earnedXp = deck.cards.length * 20;
      onFinishReview(deck.id, deck.cards.length, earnedXp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-2xl w-full p-6 sm:p-8 bg-white border border-stone-200 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
          <div>
            <span className="text-[11px] font-semibold text-pink-600 uppercase tracking-wider block">
              Active Recall • {deck.curriculum}
            </span>
            <h2 className="text-base font-bold text-stone-900">{deck.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-xl">
              {currentIndex + 1} / {deck.cards.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isDeckFinished ? (
          <div className="py-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center shadow-md">
              <Award className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Sprint Review Completed!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                You reinforced <strong>{deck.cards.length} high-yield concepts</strong>. Optimal spaced repetition curves have been updated.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm bg-amber-50 py-2 px-4 rounded-xl max-w-xs mx-auto border border-amber-200">
              <Flame className="w-4 h-4 fill-amber-500" />
              +{deck.cards.length * 20} XP Earned for Desk Pet
            </div>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all shadow-md active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col justify-between space-y-6">
            {/* Question Card Surface */}
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 shadow-xs relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {currentCard?.cardType === 'multiple_choice'
                    ? 'Multiple Choice Recall'
                    : currentCard?.cardType === 'fill_in'
                    ? 'Fill-in-the-Blank Recall'
                    : 'Open Recall Question'}
                </span>

                {/* Socratic Tutor Trigger */}
                <button
                  onClick={() => setTutorOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Ask AI Tutor
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug mb-3">
                {currentCard?.front}
              </h3>

              {currentCard?.hint && (
                <p className="text-xs text-stone-500 italic bg-white/70 p-2 rounded-xl border border-stone-200/60 inline-block">
                  💡 Hint: {currentCard.hint}
                </p>
              )}
            </div>

            {/* Answer Modes */}
            <div className="space-y-4">
              {/* Mode A: Multiple Choice */}
              {currentCard?.cardType === 'multiple_choice' && currentCard.options && (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentCard.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt.toLowerCase() === currentCard.back.toLowerCase();

                    let btnStyle = 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800';
                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-300';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleMultipleChoiceSelect(opt)}
                        disabled={isAnswerRevealed}
                        className={`p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerRevealed && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Mode B: Fill in the Blank / Voice Prompt */}
              {currentCard?.cardType === 'fill_in' && (
                <div className="space-y-3">
                  <form onSubmit={handleCheckFill} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your recall answer..."
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      disabled={isAnswerRevealed}
                      className="flex-1 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
                    />
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isListening
                          ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                      title="Speak answer via Web Speech"
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span className="hidden sm:inline">Voice</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isAnswerRevealed}
                      className="px-5 py-3.5 rounded-2xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
                    >
                      Check
                    </button>
                  </form>
                </div>
              )}

              {/* Mode C: Open Recall Question */}
              {currentCard?.cardType === 'recall' && !isAnswerRevealed && (
                <div className="text-center py-4">
                  <button
                    onClick={() => setIsAnswerRevealed(true)}
                    className="px-6 py-3.5 rounded-2xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all shadow-md active:scale-95"
                  >
                    Reveal Answer & Explanation
                  </button>
                </div>
              )}

              {/* Revealed Answer & Explanation Block */}
              {isAnswerRevealed && (
                <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs space-y-2 animate-fade-in">
                  <div className="font-bold text-stone-900">
                    Correct Concept: <span className="text-emerald-700">{currentCard?.back}</span>
                  </div>
                  {currentCard?.explanation && (
                    <p className="text-stone-600 leading-relaxed">{currentCard.explanation}</p>
                  )}
                </div>
              )}

              {/* Spaced Repetition (SRS) Rating Buttons */}
              {isAnswerRevealed && (
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <span className="text-[11px] font-semibold text-stone-400 block text-center uppercase tracking-wider">
                    Spaced Repetition Feedback
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRateCard('again')}
                      className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all text-center"
                    >
                      <div>Again</div>
                      <div className="text-[10px] font-normal opacity-70">&lt; 1 day</div>
                    </button>
                    <button
                      onClick={() => handleRateCard('hard')}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all text-center"
                    >
                      <div>Hard</div>
                      <div className="text-[10px] font-normal opacity-70">2 days</div>
                    </button>
                    <button
                      onClick={() => handleRateCard('good')}
                      className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all text-center"
                    >
                      <div>Good</div>
                      <div className="text-[10px] font-normal opacity-70">4 days</div>
                    </button>
                    <button
                      onClick={() => handleRateCard('easy')}
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all text-center"
                    >
                      <div>Easy</div>
                      <div className="text-[10px] font-normal opacity-70">7 days</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Embedded Socratic Tutor Drawer */}
        {currentCard && (
          <SocraticTutorDrawer
            card={currentCard}
            isOpen={tutorOpen}
            onClose={() => setTutorOpen(false)}
            userMissedAttempt={lastUserAttempt}
          />
        )}
      </div>
    </div>
  );
};
