import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Users,
  Trophy,
  Flame,
  Award,
  Clock,
  Sparkles,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { StudyDeck, LiveBattlePlayer, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynth';

interface GizmoLiveBattleProps {
  deck: StudyDeck;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onBattleComplete: (earnedXp: number, rank: number) => void;
}

export const GizmoLiveBattle: React.FC<GizmoLiveBattleProps> = ({
  deck,
  currentUser,
  isOpen,
  onClose,
  onBattleComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userCombo, setUserCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Live Multiplayer Peers
  const [players, setPlayers] = useState<LiveBattlePlayer[]>([
    {
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      avatar: currentUser.avatar,
      score: 0,
      combo: 0,
      statusText: 'Ready',
    },
    {
      id: 'p_jin',
      name: 'Jin-Woo (Seoul SNU)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      score: 0,
      combo: 0,
      statusText: 'Ready',
    },
    {
      id: 'p_eleanor',
      name: 'Eleanor (Oxford)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      score: 0,
      combo: 0,
      statusText: 'Ready',
    },
    {
      id: 'p_lucas',
      name: 'Lucas (MIT)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      score: 0,
      combo: 0,
      statusText: 'Ready',
    },
  ]);

  const currentCard = deck.cards[currentQuestionIndex];

  // 15-second countdown timer for each question
  useEffect(() => {
    if (!isOpen || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentQuestionIndex, isGameOver, hasAnswered]);

  // Peer random simulated answering
  useEffect(() => {
    if (!isOpen || isGameOver || hasAnswered) return;

    const peerInterval = setTimeout(() => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === currentUser.id) return p;
          // Random 75% accuracy
          const isRight = Math.random() < 0.8;
          const points = isRight ? Math.round(100 + timeLeft * 5) : 0;
          return {
            ...p,
            score: p.score + points,
            combo: isRight ? p.combo + 1 : 0,
            statusText: isRight ? 'Answered (+100)' : 'Missed',
          };
        })
      );
    }, Math.random() * 4000 + 1500);

    return () => clearTimeout(peerInterval);
  }, [currentQuestionIndex, isOpen, isGameOver, hasAnswered]);

  const handleTimeExpired = () => {
    if (!hasAnswered) {
      setHasAnswered(true);
      setUserCombo(0);
    }
    setTimeout(proceedToNextQuestion, 2000);
  };

  const handleSelectAnswer = (option: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(option);
    setHasAnswered(true);

    const isCorrect = option.toLowerCase() === currentCard?.back.toLowerCase();

    if (isCorrect) {
      audioSynth.playChime('pomodoro_complete');
      const newCombo = userCombo + 1;
      setUserCombo(newCombo);
      const points = 100 + timeLeft * 10 * Math.min(newCombo, 3);

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentUser.id
            ? {
                ...p,
                score: p.score + points,
                combo: newCombo,
                statusText: `+${points} pts (${newCombo}x Combo!)`,
              }
            : p
        )
      );
    } else {
      setUserCombo(0);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentUser.id
            ? { ...p, combo: 0, statusText: 'Incorrect' }
            : p
        )
      );
    }

    setTimeout(proceedToNextQuestion, 2200);
  };

  const proceedToNextQuestion = () => {
    if (currentQuestionIndex + 1 < deck.cards.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setIsGameOver(true);
      const sorted = [...players].sort((a, b) => b.score - a.score);
      const userRank = sorted.findIndex((p) => p.id === currentUser.id) + 1;
      const earnedXp = Math.max(50, 200 - userRank * 30);
      onBattleComplete(earnedXp, userRank);
    }
  };

  if (!isOpen) return null;

  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-2xl w-full p-6 sm:p-8 bg-white border border-stone-200 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                Gizmo Live • Synchronized Battle
              </span>
              <h2 className="text-base font-bold text-stone-900">{deck.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 font-mono font-bold text-xs text-stone-800">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>{timeLeft}s</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Synchronized 15s Progress Bar */}
        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-5">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 5 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>

        {isGameOver ? (
          /* Battle Podium & Results */
          <div className="py-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-md">
              <Trophy className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-stone-900">Battle Finished!</h3>
              <p className="text-xs text-stone-500">Live leaderboard results computed across room peers.</p>
            </div>

            {/* Final Standings */}
            <div className="max-w-md mx-auto space-y-2 text-left">
              {sortedLeaderboard.map((p, idx) => {
                const isMe = p.id === currentUser.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                      isMe
                        ? 'bg-amber-50 border-amber-300 shadow-xs'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[11px]">
                        #{idx + 1}
                      </span>
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className={isMe ? 'text-stone-900 font-bold' : 'text-stone-700'}>{p.name}</span>
                    </div>
                    <span className="font-mono text-amber-700 font-bold">{p.score} pts</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all shadow-md active:scale-95"
              >
                Return to Campus
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Surface + Live Leaderboard */
          <div className="flex-1 flex flex-col justify-between space-y-5">
            {/* Live Question Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-stone-50 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-stone-400 font-mono">
                  Question {currentQuestionIndex + 1} of {deck.cards.length}
                </span>
                {userCombo > 1 && (
                  <span className="flex items-center gap-1 font-extrabold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-lg text-xs animate-bounce">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    {userCombo}x COMBO!
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                {currentCard?.front}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(currentCard?.options || [currentCard?.back, 'Option B', 'Option C', 'Option D']).map(
                (opt, idx) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt.toLowerCase() === currentCard?.back.toLowerCase();

                  let btnStyle = 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(opt)}
                      disabled={hasAnswered}
                      className={`p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                }
              )}
            </div>

            {/* Real-time Peer Scores Leaderboard Strip */}
            <div className="pt-4 border-t border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Live Room Standings
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sortedLeaderboard.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      p.id === currentUser.id
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-stone-50 border-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      <span className="font-semibold text-stone-800 truncate text-[11px]">{p.name.split(' ')[0]}</span>
                    </div>
                    <span className="font-mono font-bold text-stone-900 text-[11px] shrink-0 ml-1">
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
