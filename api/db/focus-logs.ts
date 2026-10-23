import { getAuthenticatedSupabaseUser } from '../../src/lib/supabase-request-auth';
import { getFocusLogsByUser, insertFocusLog } from '../../src/db/queries';

export default async function handler(req: any, res: any) {
  const authUser = await getAuthenticatedSupabaseUser(req);
  if (!authUser) return res.status(401).json({ error: 'A verified Supabase account is required.' });

  if (req.method === 'GET') {
    try {
      const logs = await getFocusLogsByUser(authUser.id);
      return res.status(200).json({ success: true, logs });
    } catch (error) {
      console.error('Failed to fetch focus logs:', error);
      return res.status(500).json({ error: 'Database operation failed.' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const durationMinutes = Number(body.durationMinutes);
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 24 * 60 || !category || !subject) {
      return res.status(400).json({ error: 'Valid duration, category and subject are required.' });
    }
    try {
      const log = await insertFocusLog({
        userUid: authUser.id,
        durationMinutes: Math.round(durationMinutes),
        category: category.slice(0, 80),
        subject: subject.slice(0, 200),
        // XP is derived server-side from accepted duration, not trusted from client input.
        xpEarned: Math.min(1440, Math.round(durationMinutes)),
        // Sessions use the server's current date to prevent retroactive challenge credit.
        date: new Date().toISOString().slice(0, 10),
      });
      return res.status(201).json({ success: true, log });
    } catch (error) {
      console.error('Failed to save focus log:', error);
      return res.status(500).json({ error: 'Database operation failed.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
