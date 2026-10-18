import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cardFront, cardBack, studentAnswer } = req.body || {};
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

      const prompt = `You are Lumina Study's embedded Socratic Tutor. A student missed or is reviewing this flashcard:
Question: "${cardFront}"
Correct Concept: "${cardBack}"
Student's attempt/question: "${studentAnswer || 'I am struggling with this concept.'}"

Provide a friendly, encouraging Socratic response:
1. Validate their effort and gently break down the concept step-by-step.
2. Provide a vivid, real-world intuitive analogy.
3. Formulate exactly 3 quick active-recall follow-up check questions to confirm mastery.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              encouragement: { type: Type.STRING },
              stepByStepBreakdown: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              realWorldAnalogy: { type: Type.STRING },
              followUpQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    expectedAnswer: { type: Type.STRING },
                  },
                  required: ['question', 'expectedAnswer'],
                },
              },
            },
            required: ['encouragement', 'stepByStepBreakdown', 'realWorldAnalogy', 'followUpQuestions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.status(200).json({ success: true, tutorResponse: parsed });
    } catch (err) {
      console.error('Error invoking Gemini in socratic tutor serverless function:', err);
    }
  }

  // Heuristic fallback
  return res.status(200).json({
    success: true,
    tutorResponse: {
      encouragement: "Great effort! Missing a card is just the first step in reinforcing long-term neural recall.",
      stepByStepBreakdown: [
        `Focus on the core mechanism: "${cardFront || 'Key concept'}".`,
        `Key principle: ${cardBack || 'Underlying rule'}. Contrast this with adjacent definitions to eliminate interference.`,
        `Form a mental hook linking this keyword directly to its real-world function.`
      ],
      realWorldAnalogy: "Like exercising a muscle, neural retrieval practice triggers synaptic plasticity.",
      followUpQuestions: [
        { question: "Why is this distinction critical?", expectedAnswer: "It prevents conceptual confusion during timed retrieval." },
        { question: "What would occur if this mechanism were blocked completely?", expectedAnswer: "Function ceases or compensates via secondary pathways." },
        { question: "In your own words, summarize this in one sentence.", expectedAnswer: cardBack || "Fundamental principle." }
      ]
    }
  });
}
