import { getAuthenticatedSupabaseUser } from '../../src/lib/supabase-request-auth.js';
import { getFocusLogsByUser, getUserByUid, insertFocusLog } from '../../src/db/queries.js';

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
    const requestedTimeZone = typeof body.timeZone === 'string' ? body.timeZone.trim() : 'UTC';
    let timeZone = 'UTC';
    try {
      // Accept only real IANA zones; the client cannot submit an arbitrary date.
      new Intl.DateTimeFormat('en-US', { timeZone: requestedTimeZone }).format(new Date());
      timeZone = requestedTimeZone;
    } catch {
      return res.status(400).json({ error: 'A valid IANA time zone is required.' });
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 24 * 60 || !category || !subject) {
      return res.status(400).json({ error: 'Valid duration, category and subject are required.' });
    }
    try {
      const profile = await getUserByUid(authUser.id);
      const visibility: 'private' | 'friends' | 'public' = profile?.isGhostMode
        ? 'private'
        : profile?.sessionVisibility === 'public' || profile?.sessionVisibility === 'friends' || profile?.sessionVisibility === 'private'
          ? profile.sessionVisibility
          : 'private';
      const log = await insertFocusLog({
        userUid: authUser.id,
        durationMinutes: Math.round(durationMinutes),
        category: category.slice(0, 80),
        subject: subject.slice(0, 200),
        // XP is derived server-side from accepted duration, not trusted from client input.
        xpEarned: Math.min(5760, Math.round(durationMinutes * 4)),
        // Use the server clock and validated device time zone for the student's local study day.
        date: new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
        visibility,
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
