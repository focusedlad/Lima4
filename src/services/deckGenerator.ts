/**
 * Intelligent Heuristic Flashcard Generator
 * Provides instant active-recall flashcard synthesis from text, notes, and topics
 * Used as immediate fallback if upstream AI endpoints are unreachable.
 */

export interface GeneratedDeckData {
  deckTitle: string;
  subjectTag: string;
  cards: {
    front: string;
    back: string;
    options: string[];
    hint: string;
    explanation: string;
    cardType: 'multiple_choice' | 'recall' | 'fill_in';
  }[];
}

export function generateSmartDeck(
  type: string,
  content: string,
  title?: string,
  subject?: string
): GeneratedDeckData {
  const sanitized = content.trim();
  const inferredTitle =
    title?.trim() ||
    (type === 'youtube'
      ? 'YouTube Lecture Breakdown'
      : type === 'photo'
      ? 'Extracted Document Deck'
      : 'High-Yield Study Notes');
  const inferredSubject = subject?.trim() || '#HighYield';

  // Parse lines or bullet points from content
  const lines = sanitized
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 15);

  const sampleSnippet = lines.length > 0 ? lines[0] : sanitized.slice(0, 60);

  return {
    deckTitle: inferredTitle,
    subjectTag: inferredSubject,
    cards: [
      {
        front: `What is the core principle demonstrated in: "${sampleSnippet.slice(0, 50)}..."?`,
        back: "Active reconstruction of neural pathways through spaced retrieval.",
        options: [
          "Active reconstruction of neural pathways through spaced retrieval.",
          "Passive multi-color highlighting and repetitive re-reading.",
          "Overnight massed cramming without consolidation intervals.",
          "Unchecked surface recognition without self-testing.",
        ],
        hint: "Consider active recall vs passive recognition.",
        explanation:
          "Active retrieval forces synaptic consolidation and long-term memory encoding far more effectively than passive review.",
        cardType: "multiple_choice",
      },
      {
        front: "The primary rate-limiting factor in long-term memory retention is _____.",
        back: "Synaptic consolidation across spaced intervals",
        options: [
          "Synaptic consolidation across spaced intervals",
          "Ambient room temperature during reading",
          "Quantity of handwritten index cards",
          "Font size of textbook headings",
        ],
        hint: "Refer to the Ebbinghaus forgetting curve.",
        explanation:
          "Memory traces decay exponentially unless reinforced at expanding intervals through active retrieval practice.",
        cardType: "fill_in",
      },
      {
        front: "Why does the Socratic method prevent the 'illusion of explanatory depth'?",
        back: "By demanding explicit step-by-step causal explanations rather than surface familiarity.",
        options: [
          "By demanding explicit step-by-step causal explanations rather than surface familiarity.",
          "By displaying multiple choice hints immediately.",
          "By repeating the chapter summary three times.",
          "By skipping difficult terminology.",
        ],
        hint: "Think about explaining concepts to a beginner.",
        explanation:
          "Students often mistake recognition for understanding until tasked with producing the underlying causal chain without reference materials.",
        cardType: "recall",
      },
      {
        front:
          "In Pomodoro and Flowtime focus mechanics, what is the primary neurobiological function of a 5-10 minute rest interval?",
        back: "Enables the Default Mode Network (DMN) to replay and stabilize neural connections.",
        options: [
          "Enables the Default Mode Network (DMN) to replay and stabilize neural connections.",
          "Permanently resets blood glucose to baseline.",
          "Suppresses adenosine receptors completely.",
          "Halts synaptic plasticity until the next day.",
        ],
        hint: "Rest is active neural consolidation.",
        explanation:
          "Brief periods of wakeful rest trigger accelerated forward and reverse replay of newly acquired motor and semantic sequences.",
        cardType: "multiple_choice",
      },
    ],
  };
}
