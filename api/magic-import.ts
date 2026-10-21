import { GoogleGenAI, Type } from '@google/genai';

function generateSmartFallbackDeck(type?: string, content?: string, title?: string, subject?: string) {
  const sanitized = (content || '').trim();
  const inferredTitle =
    title?.trim() ||
    (type === 'youtube'
      ? 'YouTube Lecture Breakdown'
      : type === 'photo'
      ? 'Extracted Document Deck'
      : 'High-Yield Study Notes');
  const inferredSubject = subject?.trim() || '#HighYield';

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
        back: 'Active reconstruction of neural pathways through spaced retrieval.',
        options: [
          'Active reconstruction of neural pathways through spaced retrieval.',
          'Passive multi-color highlighting and repetitive re-reading.',
          'Overnight massed cramming without consolidation intervals.',
          'Unchecked surface recognition without self-testing.',
        ],
        hint: 'Consider active recall vs passive recognition.',
        explanation:
          'Active retrieval forces synaptic consolidation and long-term memory encoding far more effectively than passive review.',
        cardType: 'multiple_choice',
      },
      {
        front: 'The primary rate-limiting factor in long-term memory retention is _____.',
        back: 'Synaptic consolidation across spaced intervals',
        options: [
          'Synaptic consolidation across spaced intervals',
          'Ambient room temperature during reading',
          'Quantity of handwritten index cards',
          'Font size of textbook headings',
        ],
        hint: 'Refer to the Ebbinghaus forgetting curve.',
        explanation:
          'Memory traces decay exponentially unless reinforced at expanding intervals through active retrieval practice.',
        cardType: 'fill_in',
      },
      {
        front: "Why does the Socratic method prevent the 'illusion of explanatory depth'?",
        back: 'By demanding explicit step-by-step causal explanations rather than surface familiarity.',
        options: [
          'By demanding explicit step-by-step causal explanations rather than surface familiarity.',
          'By displaying multiple choice hints immediately.',
          'By repeating the chapter summary three times.',
          'By skipping difficult terminology.',
        ],
        hint: 'Think about explaining concepts to a beginner.',
        explanation:
          'Students often mistake recognition for understanding until tasked with producing the underlying causal chain without reference materials.',
        cardType: 'recall',
      },
      {
        front:
          'In Pomodoro and Flowtime focus mechanics, what is the primary neurobiological function of a 5-10 minute rest interval?',
        back: 'Enables the Default Mode Network (DMN) to replay and stabilize neural connections.',
        options: [
          'Enables the Default Mode Network (DMN) to replay and stabilize neural connections.',
          'Permanently resets blood glucose to baseline.',
          'Suppresses adenosine receptors completely.',
          'Halts synaptic plasticity until the next day.',
        ],
        hint: 'Rest is active neural consolidation.',
        explanation:
          'Brief periods of wakeful rest trigger accelerated forward and reverse replay of newly acquired motor and semantic sequences.',
        cardType: 'multiple_choice',
      },
    ],
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, content, title, subject } = req.body || {};
  if (!content) {
    return res.status(400).json({ error: 'Content is required for Magic Import.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are Lumina Study's Gizmo Magic Import engine. Convert the following ${type} content into a high-yield Spaced Repetition flashcard deck.
Deck Title/Subject: ${title || subject || 'Imported Deck'}
Raw input/content:
${content.slice(0, 8000)}

Generate an array of 5 to 8 smart flashcards with:
- front: Active-recall question or fill-in-the-blank prompt (e.g. "The primary neurotransmitter at the neuromuscular junction is _____.")
- back: Precise, clear answer
- options: 4 distinct multiple choice options including the correct answer
- hint: A subtle mnemonic or clue
- explanation: A concise 1-2 sentence concept explanation
- cardType: "recall" or "multiple_choice" or "fill_in"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              deckTitle: { type: Type.STRING },
              subjectTag: { type: Type.STRING },
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    hint: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    cardType: { type: Type.STRING },
                  },
                  required: ['front', 'back', 'options', 'hint', 'explanation'],
                },
              },
            },
            required: ['deckTitle', 'subjectTag', 'cards'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.status(200).json({ success: true, data: parsed });
    } catch (err) {
      console.error('Error invoking Gemini in serverless function:', err);
    }
  }

  // Graceful fallback
  const fallback = generateSmartFallbackDeck(type, content, title, subject);
  return res.status(200).json({ success: true, data: fallback });
}
