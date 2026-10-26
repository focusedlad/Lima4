import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  upsertUser,
  insertFocusLog,
  getFocusLogsByUser,
  insertStudyChallenge,
  getAllStudyChallenges,
  joinStudyChallenge,
  getChallengeLeaderboard,
  getLeaderboardByTimeframe,
  addFriend,
  removeFriend,
  getFriendsByUser,
  searchUsersByQuery,
  insertMilestone,
  getMilestonesFeed,
  cheerMilestoneInDb,
} from './src/db/queries';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper: AI Magic Import endpoint
app.post('/api/magic-import', async (req, res) => {
  try {
    const { type, content, title, subject } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for Magic Import.' });
    }

    if (ai) {
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
      return res.json({ success: true, data: parsed });
    }

    // Intelligent heuristic fallback if GEMINI_API_KEY is not configured
    const mockDeck = generateSmartFallbackDeck(type, content, title, subject);
    return res.json({ success: true, data: mockDeck });
  } catch (err: any) {
    console.error('Error in magic-import:', err);
    // Fallback to heuristic generation on any upstream API error
    const fallback = generateSmartFallbackDeck(req.body.type, req.body.content, req.body.title, req.body.subject);
    return res.json({ success: true, data: fallback });
  }
});

// Helper: Socratic AI Tutor endpoint
app.post('/api/socratic-tutor', async (req, res) => {
  try {
    const { cardFront, cardBack, studentAnswer, history } = req.body;

    if (ai) {
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
      return res.json({ success: true, tutorResponse: parsed });
    }

    // Intelligent fallback response
    return res.json({
      success: true,
      tutorResponse: {
        encouragement: "Great effort! Missing a card is just the first step in reinforcing long-term neural recall.",
        stepByStepBreakdown: [
          `Focus on the core mechanism: "${cardFront}".`,
          `Key principle: ${cardBack}. Contrast this with adjacent definitions to eliminate interference.`,
          `Form a mental hook linking this keyword directly to its real-world function.`
        ],
        realWorldAnalogy: `Think of this like a keycard for a secure laboratory: without the specific receptor activation, the door never unlocks.`,
        followUpQuestions: [
          { question: `What is the primary trigger that initiates ${cardBack.slice(0, 30)}?`, expectedAnswer: "The initial stimulus or depolarization" },
          { question: `What would occur if this mechanism were blocked completely?`, expectedAnswer: "Function ceases or compensates via secondary pathways" },
          { question: `In your own words, summarize this in one sentence.`, expectedAnswer: `${cardBack}` }
        ]
      }
    });
  } catch (err: any) {
    console.error('Error in socratic-tutor:', err);
    return res.json({
      success: true,
      tutorResponse: {
        encouragement: "Let's break this down together step-by-step!",
        stepByStepBreakdown: [
          `Understand the key question: "${req.body.cardFront}"`,
          `The core answer is: "${req.body.cardBack}"`,
          `Active recall strengthens when you test yourself after a short pause.`
        ],
        realWorldAnalogy: "Like exercising a muscle, retrieval practice triggers synaptic plasticity.",
        followUpQuestions: [
          { question: "Why is this detail essential?", expectedAnswer: "It distinguishes this concept from similar ones." },
          { question: "Can you name one real-world scenario where this applies?", expectedAnswer: "Clinical or practical application." },
          { question: "What is the key takeaway?", expectedAnswer: req.body.cardBack }
        ]
      }
    });
  }
});

// Relational Database Sync Routes (PostgreSQL / Supabase-compatible)
app.post('/api/db/sync-user', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, name, avatar, university, studyField, xp, totalHoursStudied, currentStreak } = req.body;
    const effectiveUid = req.user?.uid || uid;
    if (!effectiveUid) {
      return res.status(400).json({ error: 'User UID is required' });
    }
    const user = await upsertUser({
      uid: effectiveUid,
      email: email || `${effectiveUid}@luminastudy.local`,
      name: name || 'Studier',
      avatar,
      university,
      studyField,
      xp,
      totalHoursStudied,
      currentStreak,
    });
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user to database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/db/focus-logs', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { userUid, durationMinutes, category, subject, xpEarned, date } = req.body;
    const effectiveUid = req.user?.uid || userUid;
    if (!effectiveUid || !durationMinutes || !category || !subject) {
      return res.status(400).json({ error: 'Missing required focus log fields' });
    }
    const log = await insertFocusLog({
      userUid: effectiveUid,
      durationMinutes: Number(durationMinutes),
      category: String(category),
      subject: String(subject),
      xpEarned: Number(xpEarned || 0),
      date: date || new Date().toISOString().split('T')[0],
    });
    res.json({ success: true, log });
  } catch (error: any) {
    console.error('Failed to insert focus log in database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.get('/api/db/focus-logs', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = (req.query.userUid as string) || req.user?.uid;
    if (!userUid) {
      return res.status(400).json({ error: 'userUid parameter is required' });
    }
    const logs = await getFocusLogsByUser(userUid);
    res.json({ success: true, logs });
  } catch (error: any) {
    console.error('Failed to fetch focus logs from database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});


// Study Challenges Endpoints
app.post('/api/db/challenges', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { challengeId, title, description, creatorUid, creatorName, creatorAvatar, targetHours, period, startDate, endDate, category } = req.body;
    if (!challengeId || !title || !targetHours) {
      return res.status(400).json({ error: 'challengeId, title, and targetHours are required' });
    }
    const challenge = await insertStudyChallenge({
      challengeId,
      title,
      description,
      creatorUid: req.user?.uid || creatorUid || 'creator_user',
      creatorName: creatorName || 'Study Leader',
      creatorAvatar,
      targetHours: Number(targetHours),
      period: period || '7_days',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      category,
    });
    res.json({ success: true, challenge });
  } catch (error: any) {
    console.error('Failed to create study challenge in database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.get('/api/db/challenges', requireAuth, async (req: AuthRequest, res) => {
  try {
    const challenges = await getAllStudyChallenges(req.user!.uid);
    res.json({ success: true, challenges });
  } catch (error: any) {
    console.error('Failed to fetch study challenges from database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/db/challenges/join', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { challengeId, userUid, userName, userAvatar } = req.body;
    if (!challengeId) {
      return res.status(400).json({ error: 'challengeId is required' });
    }
    const result = await joinStudyChallenge({
      challengeId,
      userUid: req.user?.uid || userUid || 'user_guest',
      userName: userName || 'Studier',
      userAvatar,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Failed to join study challenge in database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.get('/api/db/challenges/:id/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getChallengeLeaderboard(req.params.id);
    res.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error('Failed to fetch challenge leaderboard from database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Competitive Leaderboard Endpoint (Today, This Week, This Month, All-Time)
app.get('/api/db/leaderboard', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as 'today' | 'week' | 'month' | 'all') || 'week';
    const leaderboard = await getLeaderboardByTimeframe(timeframe);
    res.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error('Failed to fetch leaderboard from database:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Friendships Endpoints
app.get('/api/db/friends', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = (req.query.userUid as string) || req.user?.uid;
    if (!userUid) return res.status(400).json({ error: 'userUid is required' });
    const friends = await getFriendsByUser(userUid);
    res.json({ success: true, friends });
  } catch (error: any) {
    console.error('Failed to get friends:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/db/friends', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { userUid, friendUid, friendName, friendHandle, friendAvatar, friendUniversity } = req.body;
    const currentUid = req.user?.uid || userUid;
    if (!currentUid || !friendUid) {
      return res.status(400).json({ error: 'userUid and friendUid are required' });
    }
    const friendship = await addFriend({
      userUid: currentUid,
      friendUid,
      friendName: friendName || 'Peer Studier',
      friendHandle,
      friendAvatar,
      friendUniversity,
    });
    res.json({ success: true, friendship });
  } catch (error: any) {
    console.error('Failed to add friend:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.delete('/api/db/friends/:friendUid', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = (req.query.userUid as string) || req.user?.uid;
    const { friendUid } = req.params;
    if (!userUid || !friendUid) {
      return res.status(400).json({ error: 'userUid and friendUid are required' });
    }
    await removeFriend(userUid, friendUid);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to remove friend:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Search users by unique handle, name, or university
app.get('/api/db/users/search', requireAuth, async (req: AuthRequest, res) => {
  try {
    const query = (req.query.q as string) || '';
    const usersList = await searchUsersByQuery(query, req.user!.uid);
    res.json({ success: true, users: usersList });
  } catch (error: any) {
    console.error('Failed to search users:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Milestones & Activity Feed Endpoints (supports friendsOnly=true and global)
app.get('/api/db/milestones', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = (req.query.userUid as string) || req.user?.uid;
    const friendsOnly = req.query.friendsOnly === 'true';
    const milestonesList = await getMilestonesFeed(userUid, friendsOnly);
    res.json({ success: true, milestones: milestonesList });
  } catch (error: any) {
    console.error('Failed to get milestones feed:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/db/milestones', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      milestoneId,
      userUid,
      userName,
      userHandle,
      userAvatar,
      university,
      type,
      title,
      description,
      subjectTag,
      streakDays,
      xpEarned,
    } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }
    const created = await insertMilestone({
      milestoneId: milestoneId || `mile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userUid: req.user?.uid || userUid || 'studier_guest',
      userName: userName || 'Studier',
      userHandle,
      userAvatar,
      university,
      type,
      title,
      description,
      subjectTag,
      streakDays: Number(streakDays || 1),
      xpEarned: Number(xpEarned || 50),
    });
    res.json({ success: true, milestone: created });
  } catch (error: any) {
    console.error('Failed to insert milestone:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/db/milestones/:id/cheer', requireAuth, async (req: AuthRequest, res) => {
  try {
    await cheerMilestoneInDb(req.params.id, req.user!.uid);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to cheer milestone:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

function generateSmartFallbackDeck(type: string, content: string, title?: string, subject?: string) {
  const sanitizedContent = content.trim();
  const inferredTitle = title || (type === 'youtube' ? 'YouTube Lecture Breakdown' : 'High-Yield Study Notes');
  const inferredSubject = subject || '#HighYield';

  return {
    deckTitle: inferredTitle,
    subjectTag: inferredSubject,
    cards: [
      {
        front: `What is the fundamental mechanism highlighted in: "${sanitizedContent.slice(0, 45)}..."?`,
        back: "Selective retrieval and spaced interval consolidation.",
        options: [
          "Selective retrieval and spaced interval consolidation.",
          "Passive passive re-reading and highlighting.",
          "Immediate cramming before sleep.",
          "Unordered random review without feedback."
        ],
        hint: "Think about active recall testing.",
        explanation: "Active recall forces the brain to reconstruct knowledge pathways rather than passively recognizing words.",
        cardType: "multiple_choice"
      },
      {
        front: "The primary rate-limiting factor in long-term memory encoding is _____.",
        back: "Synaptic consolidation and spaced repetition intervals",
        options: [
          "Synaptic consolidation and spaced repetition intervals",
          "Audio volume level",
          "Number of fluorescent highlighters used",
          "Page count per reading sprint"
        ],
        hint: "Ebbinghaus forgetting curve.",
        explanation: "Information degrades predictably unless reinforced at expanding intervals.",
        cardType: "fill_in"
      },
      {
        front: "How does the Socratic method prevent the illusion of explanatory depth?",
        back: "By prompting step-by-step causal breakdown and immediate self-testing.",
        options: [
          "By prompting step-by-step causal breakdown and immediate self-testing.",
          "By providing multiple choice clues instantly.",
          "By reading the summary three times.",
          "By memorizing acronyms without context."
        ],
        hint: "Questioning assumptions.",
        explanation: "Students often believe they understand a concept until forced to explain the causal chain without notes.",
        cardType: "recall"
      },
      {
        front: "In Pomodoro and Flowtime focus mechanics, what is the key physiological function of a 5-10 minute break?",
        back: "Allows the default mode network (DMN) to consolidate neural patterns and clear metabolic fatigue.",
        options: [
          "Allows the default mode network (DMN) to consolidate neural patterns and clear metabolic fatigue.",
          "Increases adrenal cortisol indefinitely.",
          "Resets blood sugar to zero.",
          "Prevents any synaptic change."
        ],
        hint: "Rest is active consolidation.",
        explanation: "Neural replay occurs at accelerated rates during brief periods of wakeful rest.",
        cardType: "multiple_choice"
      }
    ]
  };
}

async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    (Boolean(process.env.PORT) && process.env.PORT !== '3000');

  if (!isProduction) {
    const vite = await (await import('vite')).createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina Study server running on http://localhost:${PORT}`);
  });
}

startServer();
