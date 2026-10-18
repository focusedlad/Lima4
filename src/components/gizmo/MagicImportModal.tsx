import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Youtube,
  FileText,
  Camera,
  Layers,
  ArrowRight,
  Upload,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { StudyDeck, Flashcard } from '../../types';

interface MagicImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (newDeck: StudyDeck) => void;
}

type ImportTab = 'youtube' | 'document' | 'ocr' | 'quizlet';

export const MagicImportModal: React.FC<MagicImportModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated,
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('youtube');
  const [content, setContent] = useState('');
  const [deckTitle, setDeckTitle] = useState('');
  const [subjectTag, setSubjectTag] = useState('#USMLE');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSampleFill = (tab: ImportTab) => {
    if (tab === 'youtube') {
      setContent(
        'https://www.youtube.com/watch?v=k-Dq9yv7u3g (MIT OpenCourseWare: Neuroanatomy of Cranial Nerves and Brainstem Pathways). Key points: CN III oculomotor palsy presents with "down and out" eye and ptosis. CN IV trochlear controls superior oblique. CN VI abducens innervates lateral rectus.'
      );
      setDeckTitle('MIT Neuroanatomy: Cranial Nerves');
      setSubjectTag('#USMLE');
    } else if (tab === 'document') {
      setContent(
        'Cellular Respiration and Bioenergetics summary:\n1. Glycolysis converts glucose to 2 pyruvate in the cytoplasm, yielding net 2 ATP and 2 NADH. PFK-1 is rate-limiting.\n2. Pyruvate dehydrogenase complex enters mitochondria.\n3. TCA cycle generates 3 NADH, 1 FADH2, and 1 GTP per cycle.\n4. Electron transport chain uses Complex I to IV to generate proton gradient.'
      );
      setDeckTitle('Cellular Bioenergetics & Glycolysis');
      setSubjectTag('#MCAT');
    } else if (tab === 'ocr') {
      setContent(
        '[OCR SCAN FROM HANDWRITTEN CLINICAL NOTEBOOK]\nPatient presents with acute onset chest pain radiating to left arm. Troponin I elevated. EKG shows ST elevation in leads II, III, aVF indicating inferior STEMI, RCA occlusion. Immediate dual antiplatelet therapy and emergent cath lab activation.'
      );
      setDeckTitle('Cardiology EKG & STEMI Management');
      setSubjectTag('#USMLE');
    } else if (tab === 'quizlet') {
      setContent(
        'Quizlet / Anki Export:\nStrict Scrutiny = Compelling government interest + narrowly tailored\nIntermediate Scrutiny = Important government interest + substantially related\nRational Basis = Legitimate government interest + rationally related'
      );
      setDeckTitle('Constitutional Law: Tiers of Scrutiny');
      setSubjectTag('#BarExam');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/magic-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          content: content.trim(),
          title: deckTitle.trim(),
          subject: subjectTag.trim(),
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const deckData = json.data;
        const newCards: Flashcard[] = (deckData.cards || []).map((c: any, idx: number) => ({
          id: `card_${Date.now()}_${idx}`,
          deckId: `deck_${Date.now()}`,
          front: c.front || 'Concept review question',
          back: c.back || 'Key concept answer',
          options: c.options || [c.back, 'Option B', 'Option C', 'Option D'],
          hint: c.hint || 'Active recall hint',
          explanation: c.explanation || 'Key conceptual explanation.',
          cardType: c.cardType || 'multiple_choice',
          srsInterval: 1,
          easeFactor: 2.5,
          consecutiveCorrect: 0,
          nextReviewAt: 'Today',
        }));

        const newDeck: StudyDeck = {
          id: `deck_${Date.now()}`,
          title: deckData.deckTitle || deckTitle || 'Imported Study Deck',
          description: `Auto-generated via Gizmo Magic Import from ${activeTab}.`,
          subjectTag: deckData.subjectTag || subjectTag || '#HighYield',
          curriculum: subjectTag.replace('#', '') || 'General',
          cardsCount: newCards.length,
          cards: newCards,
          isPublic: true,
          authorName: 'Kai Chen (You)',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 5.0,
          reviewsDueCount: newCards.length,
          createdAt: new Date().toISOString(),
        };

        onDeckCreated(newDeck);
        onClose();
      } else {
        setErrorMsg('Failed to process materials. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to connect to AI server. Generating smart fallback deck.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="squircle-card max-w-xl w-full p-6 bg-white border border-stone-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Gizmo Magic Import Engine</h2>
              <p className="text-xs text-stone-500">
                Instant active-recall flashcards from lectures, documents & scans
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

        {/* Import Source Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-2xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
              activeTab === 'youtube'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Youtube className="w-4 h-4 text-rose-500" />
            <span>YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
              activeTab === 'document'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-500" />
            <span>PDF/Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ocr')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
              activeTab === 'ocr'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-500" />
            <span>OCR Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quizlet')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
              activeTab === 'quizlet'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Anki/Quizlet</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-stone-800">
              {activeTab === 'youtube' && 'YouTube Video URL or Lecture Transcript:'}
              {activeTab === 'document' && 'Paste Class Notes, Slides, or Textbook Excerpt:'}
              {activeTab === 'ocr' && 'OCR Scanned Handwritten Notes or Textbook Page:'}
              {activeTab === 'quizlet' && 'Anki / Quizlet Text or URL:'}
            </label>
            <button
              type="button"
              onClick={() => handleSampleFill(activeTab)}
              className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 underline"
            >
              Fill Sample {activeTab.toUpperCase()}
            </button>
          </div>

          <textarea
            rows={5}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              activeTab === 'youtube'
                ? 'https://www.youtube.com/watch?v=... or paste transcript...'
                : 'Paste notes or text to convert into smart SRS cards...'
            }
            className="w-full p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:bg-white resize-none font-mono"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Deck Title</label>
              <input
                type="text"
                placeholder="e.g. Cranial Nerves High Yield"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Subject Tag</label>
              <input
                type="text"
                placeholder="#USMLE or #MCAT"
                value={subjectTag}
                onChange={(e) => setSubjectTag(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-pink-300" />
                  Generating Smart Deck with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-pink-300" />
                  Generate Smart SRS Deck
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
