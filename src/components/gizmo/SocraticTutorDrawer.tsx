import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Flashcard } from '../../types';

interface SocraticTutorDrawerProps {
  card: Flashcard;
  isOpen: boolean;
  onClose: () => void;
  userMissedAttempt?: string;
}

interface TutorResponseData {
  encouragement: string;
  stepByStepBreakdown: string[];
  realWorldAnalogy: string;
  followUpQuestions: Array<{
    question: string;
    expectedAnswer: string;
  }>;
}

export const SocraticTutorDrawer: React.FC<SocraticTutorDrawerProps> = ({
  card,
  isOpen,
  onClose,
  userMissedAttempt,
}) => {
  const [loading, setLoading] = useState(false);
  const [tutorData, setTutorData] = useState<TutorResponseData | null>(null);
  const [activeFollowUpIndex, setActiveFollowUpIndex] = useState<number>(0);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpFeedback, setFollowUpFeedback] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<boolean[]>([]);

  useEffect(() => {
    if (isOpen && card) {
      fetchTutorGuidance();
    }
  }, [isOpen, card]);

  const fetchTutorGuidance = async () => {
    setLoading(true);
    setFollowUpFeedback(null);
    setFollowUpAnswer('');
    try {
      const res = await fetch('/api/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardFront: card.front,
          cardBack: card.back,
          studentAnswer: userMissedAttempt || '',
        }),
      });
      const json = await res.json();
      if (json.success && json.tutorResponse) {
        setTutorData(json.tutorResponse);
        setRevealedAnswers(new Array(json.tutorResponse.followUpQuestions.length).fill(false));
      }
    } catch (err) {
      console.error('Tutor fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCheckFollowUp = (expected: string) => {
    if (!followUpAnswer.trim()) return;
    const isClose =
      followUpAnswer.toLowerCase().includes(expected.toLowerCase().slice(0, 10)) ||
      expected.toLowerCase().includes(followUpAnswer.toLowerCase().trim());

    if (isClose) {
      setFollowUpFeedback('Spot on! You have nailed this concept principle.');
    } else {
      setFollowUpFeedback(`Close attempt! Master concept: "${expected}".`);
    }
  };

  const toggleRevealAnswer = (index: number) => {
    setRevealedAnswers((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-amber-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Embedded Socratic Tutor</h3>
            <p className="text-[11px] text-stone-500">Step-by-step guidance & conceptual analogies</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Targeted Card Context */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Card Question</span>
          <p className="font-semibold text-stone-900">{card.front}</p>
          <div className="pt-1.5 border-t border-stone-200/60 flex items-center gap-2 text-emerald-700 font-medium">
            <span className="text-[10px] text-stone-400">Target Concept:</span>
            <span>{card.back}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-stone-500 font-medium">AI Socratic Tutor is deconstructing this concept...</p>
          </div>
        ) : tutorData ? (
          <div className="space-y-4">
            {/* Encouragement Quote */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
              <span className="font-bold block mb-1">Encouragement</span>
              <p className="italic">{tutorData.encouragement}</p>
            </div>

            {/* Step-by-Step Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Step-by-Step Conceptual Breakdown
              </h4>
              <div className="space-y-2">
                {tutorData.stepByStepBreakdown.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5 text-stone-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-World Analogy */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-sky-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-800">
                <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
                Real-World Mental Analogy
              </div>
              <p className="leading-relaxed">{tutorData.realWorldAnalogy}</p>
            </div>

            {/* 3 Instant Follow-up Check Questions */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                3 Instant Follow-up Comprehension Checks
              </h4>

              {tutorData.followUpQuestions.map((fq, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">Check #{idx + 1}</span>
                    <button
                      onClick={() => toggleRevealAnswer(idx)}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
                    >
                      {revealedAnswers[idx] ? 'Hide Answer' : 'Reveal Answer'}
                    </button>
                  </div>

                  <p className="text-stone-800 font-medium">{fq.question}</p>

                  {revealedAnswers[idx] && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-semibold animate-fade-in text-[11px]">
                      Key Answer: {fq.expectedAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
        >
          Return to Deck Practice
        </button>
      </div>
    </div>
  );
};
