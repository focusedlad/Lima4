import { getAuthenticatedSupabaseUser } from '../../src/lib/supabase-request-auth';
import { getRegisteredUserCount, getUserByUid, upsertUser } from '../../src/db/queries';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const authUser = await getAuthenticatedSupabaseUser(req);
  if (!authUser) return res.status(401).json({ error: 'A verified Supabase account is required.' });
  if (req.method === 'GET') {
    try {
      const user = await getUserByUid(authUser.id);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Failed to load authenticated profile:', error);
      return res.status(500).json({ error: 'Database operation failed.' });
    }
  }
  const body = req.body || {};
  if (body.uid && body.uid !== authUser.id) return res.status(403).json({ error: 'Cannot update another account.' });
  try {
    const user = await upsertUser({
      uid: authUser.id,
      email: authUser.email || '',
      name: String(body.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Studier').slice(0, 100),
      avatar: typeof body.avatar === 'string' ? body.avatar.slice(0, 1000) : '',
      university: typeof body.university === 'string' ? body.university.slice(0, 200) : '',
      studyField: typeof body.studyField === 'string' ? body.studyField.slice(0, 200) : '',
      countryCode: typeof body.countryCode === 'string' ? body.countryCode.slice(0, 8) : 'GLOBAL',
      countryName: typeof body.countryName === 'string' ? body.countryName.slice(0, 80) : 'Global',
      currentSubject: typeof body.currentSubject === 'string' ? body.currentSubject.slice(0, 200) : 'General Study',
      currentGoal: typeof body.currentGoal === 'string' ? body.currentGoal.slice(0, 500) : '',
      isGhostMode: body.isGhostMode === true,
      subscriptionTier: typeof body.subscriptionTier === 'string' ? body.subscriptionTier.slice(0, 40) : 'free',
      subscriptionStatus: typeof body.subscriptionStatus === 'string' ? body.subscriptionStatus.slice(0, 40) : 'active',
      termsAccepted: body.termsAccepted === true,
      termsAcceptedAt: typeof body.termsAcceptedAt === 'string' ? body.termsAcceptedAt : undefined,
      termsVersion: typeof body.termsVersion === 'string' ? body.termsVersion.slice(0, 40) : undefined,
      xp: Math.max(0, Math.min(100000000, Number(body.xp) || 0)),
      totalHoursStudied: Math.max(0, Math.min(100000000, Number(body.totalHoursStudied) || 0)),
      currentStreak: Math.max(0, Math.min(1000000, Number(body.currentStreak) || 0)),
    });
    const registeredUserCount = await getRegisteredUserCount();
    return res.status(200).json({ success: true, user, isFirstUser: registeredUserCount === 1 });
  } catch (error) {
    console.error('Failed to sync authenticated profile:', error);
    return res.status(500).json({ error: 'Database operation failed.' });
  }
}
