import { insertFocusLog, getFocusLogsByUser } from '../src/db/queries.js';
import { getAuthenticatedSupabaseUser } from '../src/lib/supabase-request-auth.js';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req: any, res: any) {
  const authUser = await getAuthenticatedSupabaseUser(req);
  if (!authUser) return res.status(401).json({ error: 'A valid signed-in account is required.' });

  if (req.method === 'GET') {
    try {
      // Identity is derived from the verified token, never from a query parameter.
      const logs = await getFocusLogsByUser(authUser.id);
      return res.status(200).json({ success: true, logs });
    } catch (error) {
      console.error('Focus log fetch failed:', error);
      return res.status(500).json({ error: 'Focus sessions could not be loaded.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = req.body || {};
  const durationMinutes = Number(body.durationMinutes);
  const category = typeof body.category === 'string' ? body.category.trim().slice(0, 40) : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 120) : '';
  const date = typeof body.date === 'string' ? body.date : '';
  const parsedDate = datePattern.test(date) ? new Date(date + 'T00:00:00.000Z') : null;
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 720 ||
      !category || !subject || !parsedDate || Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ error: 'A valid duration (1–720 minutes), category, subject and YYYY-MM-DD date are required.' });
  }

  try {
    const requestedXp = Number(body.xpEarned);
    const xpEarned = Number.isFinite(requestedXp)
      ? Math.max(0, Math.min(Math.floor(requestedXp), durationMinutes * 10))
      : 0;
    const log = await insertFocusLog({
      userUid: authUser.id,
      durationMinutes,
      category,
      subject,
      xpEarned,
      date,
    });
    return res.status(201).json({ success: true, log });
  } catch (error) {
    console.error('Focus log write failed:', error);
    return res.status(500).json({ error: 'Focus session could not be saved.' });
  }
}
