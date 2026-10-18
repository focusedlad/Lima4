import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Plus,
  Search,
  BookOpen,
  Play,
  Flame,
  Star,
  Users,
  Layers,
  ArrowRight,
  DownloadCloud,
} from 'lucide-react';
import { StudyDeck, UserProfile } from '../../types';

interface GizmoHubProps {
  decks: StudyDeck[];
  currentUser: UserProfile;
  onOpenDeck: (deck: StudyDeck) => void;
  onOpenMagicImport: () => void;
  onStartLiveBattle: (deck: StudyDeck) => void;
  onAddMarketplaceDeck: (deck: StudyDeck) => void;
}

const MARKETPLACE_DECKS: StudyDeck[] = [
  {
    id: 'mkt_usmle_pharm',
    title: 'Autonomic & Cardiovascular Pharmacology (First Aid 2026)',
    description: 'Adrenergic antagonists, ACE inhibitors, antiarrhythmics Class I-IV with mechanisms.',
    subjectTag: '#USMLE',
    curriculum: 'USMLE Step 1',
    cardsCount: 28,
    isPublic: true,
    authorName: 'Dr. Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    rating: 4.96,
    reviewsDueCount: 0,
    createdAt: '2026-03-01T00:00:00Z',
    cards: [
      {
        id: 'mp1',
        deckId: 'mkt_usmle_pharm',
        front: 'Which antiarrhythmic class blocks rapid inward sodium channels (Phase 0) with intermediate kinetics?',
        back: 'Class IA (Quinidine, Procainamide, Disopyramide)',
        options: [
          'Class IA (Quinidine, Procainamide, Disopyramide)',
          'Class IB (Lidocaine, Mexiletine)',
          'Class IC (Flecainide, Propafenone)',
          'Class II (Beta-blockers)',
        ],
        hint: '"Double Quarter Pounder"',
        explanation: 'Class IA prolongs action potential duration and effective refractory period by moderately blocking sodium and potassium channels.',
        cardType: 'multiple_choice',
        srsInterval: 1,
        easeFactor: 2.5,
        consecutiveCorrect: 0,
        nextReviewAt: 'Today',
      },
    ],
  },
  {
    id: 'mkt_mcat_chem',
    title: 'MCAT Chemical Foundations & Thermodynamics',
    description: 'Gibbs free energy, Le Chatelier principle, Henderson-Hasselbalch, and galvanic cells.',
    subjectTag: '#MCAT',
    curriculum: 'MCAT',
    cardsCount: 34,
    isPublic: true,
    authorName: 'Alex Thorne, MS',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 4.89,
    reviewsDueCount: 0,
    createdAt: '2026-02-15T00:00:00Z',
    cards: [
      {
        id: 'mp2',
        deckId: 'mkt_mcat_chem',
        front: 'When ΔH is negative (exothermic) and ΔS is positive (increasing entropy), the reaction is spontaneous at _____ temperatures.',
        back: 'All temperatures (ΔG is always negative)',
        options: [
          'All temperatures (ΔG is always negative)',
          'High temperatures only',
          'Low temperatures only',
          'Never spontaneous',
        ],
        hint: 'ΔG = ΔH - TΔS',
        explanation: 'Both enthalpy and entropy terms contribute favorably to negative free energy regardless of temperature magnitude.',
        cardType: 'multiple_choice',
        srsInterval: 1,
        easeFactor: 2.5,
        consecutiveCorrect: 0,
        nextReviewAt: 'Today',
      },
    ],
  },
  {
    id: 'mkt_bar_tort',
    title: 'Multistate Bar Exam (MBE): Torts & Negligence',
    description: 'Duty, breach, proximate causation, res ipsa loquitur, and strict products liability.',
    subjectTag: '#BarExam',
    curriculum: 'Bar Exam',
    cardsCount: 42,
    isPublic: true,
    authorName: 'Eleanor Vance, JD',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 4.93,
    reviewsDueCount: 0,
    createdAt: '2026-01-25T00:00:00Z',
    cards: [
      {
        id: 'mp3',
        deckId: 'mkt_bar_tort',
        front: 'Under the doctrine of Res Ipsa Loquitur, what procedural effect does meeting the prima facie elements have?',
        back: 'Creates a permissible inference of negligence sufficient to survive a directed verdict motion.',
        options: [
          'Creates a permissible inference of negligence for the jury.',
          'Shifts the ultimate burden of persuasion to the defendant permanently.',
          'Guarantees immediate summary judgment for plaintiff.',
          'Imposes strict criminal liability.',
        ],
        hint: 'The thing speaks for itself, but jury still evaluates credibility.',
        explanation: 'Res ipsa loquitur allows the jury to infer negligence without direct evidence; it does not shift the burden of persuasion.',
        cardType: 'multiple_choice',
        srsInterval: 1,
        easeFactor: 2.5,
        consecutiveCorrect: 0,
        nextReviewAt: 'Today',
      },
    ],
  },
];

export const GizmoHub: React.FC<GizmoHubProps> = ({
  decks,
  currentUser,
  onOpenDeck,
  onOpenMagicImport,
  onStartLiveBattle,
  onAddMarketplaceDeck,
}) => {
  const [viewTab, setViewTab] = useState<'my_decks' | 'marketplace'>('my_decks');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const totalDueCount = decks.reduce((acc, d) => acc + (d.reviewsDueCount || 0), 0);

  const filteredDecks = (viewTab === 'my_decks' ? decks : MARKETPLACE_DECKS).filter(
    (deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.subjectTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.curriculum.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFromMarketplace = (deck: StudyDeck) => {
    onAddMarketplaceDeck(deck);
    setAddedIds((prev) => [...prev, deck.id]);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Magic Import Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Gizmo Active Recall & AI Flashcards</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">AI Study Suite</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Convert any video, lecture, or notes into smart SRS cards. Battle room peers in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenMagicImport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-900 text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-pink-600" />
            Magic Import
          </button>

          {decks.length > 0 && (
            <button
              onClick={() => onStartLiveBattle(decks[0])}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Zap className="w-4 h-4 fill-amber-500" />
              Gizmo Live Battle
            </button>
          )}
        </div>
      </div>

      {/* SRS Due Banner */}
      {totalDueCount > 0 && viewTab === 'my_decks' && (
        <div className="squircle-card p-5 bg-gradient-to-r from-pink-50 via-amber-50 to-pink-50 border border-pink-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-200 text-pink-800 flex items-center justify-center font-bold text-sm">
              {totalDueCount}
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">Spaced Repetition Reviews Due Today</h3>
              <p className="text-[11px] text-stone-600">
                Reinforce these concepts right at the optimal forgetting curve threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenDeck(decks[0])}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors shadow-xs"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="squircle-card p-4 sm:p-5 bg-white border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setViewTab('my_decks')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'my_decks'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            My Decks ({decks.length})
          </button>
          <button
            onClick={() => setViewTab('marketplace')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'marketplace'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Community Marketplace
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search decks by curriculum, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecks.map((deck) => {
          const isAdded = addedIds.includes(deck.id);

          return (
            <div
              key={deck.id}
              className="squircle-card p-5 bg-white border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                    {deck.subjectTag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {deck.rating.toFixed(2)}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-stone-900 mb-1">{deck.title}</h3>
                <p className="text-xs text-stone-500 mb-4 line-clamp-2">{deck.description}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img src={deck.authorAvatar} alt={deck.authorName} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[11px] text-stone-500 truncate max-w-[100px]">{deck.authorName}</span>
                </div>

                {viewTab === 'my_decks' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartLiveBattle(deck)}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition-colors"
                      title="Battle peers with this deck"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    </button>
                    <button
                      onClick={() => onOpenDeck(deck)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Practice
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddFromMarketplace(deck)}
                    disabled={isAdded}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors shadow-xs ${
                      isAdded
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    {isAdded ? 'Added' : 'Add Deck'}
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
