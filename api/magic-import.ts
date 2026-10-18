import { GoogleGenAI, Type } from '@google/genai';
import { generateSmartDeck } from '../src/services/deckGenerator';

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
  const fallback = generateSmartDeck(type, content, title, subject);
  return res.status(200).json({ success: true, data: fallback });
}
