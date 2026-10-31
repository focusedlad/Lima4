import { syncPublicProfile } from '../src/db/profile-sync.js';
import { getUserByUid } from '../src/db/queries.js';
import { getAuthenticatedSupabaseUser } from '../src/lib/supabase-request-auth.js';

const visibilityOptions = ['public', 'friends', 'private'];
const textField = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export default async function handler(req: any, res: any) {
  const authUser = await getAuthenticatedSupabaseUser(req);
  if (!authUser) return res.status(401).json({ error: 'A valid signed-in account is required.' });

  if (req.method === 'GET') {
    try {
      const user = await getUserByUid(authUser.id);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return res.status(500).json({ error: 'Profile could not be loaded.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = req.body || {};
  const name = textField(body.name, 80);
  if (!name) return res.status(400).json({ error: 'A display name of 1–80 characters is required.' });

  try {
    const user = await syncPublicProfile({
      uid: authUser.id,
      email: authUser.email || '',
      name,
      handle: textField(body.handle, 32),
      avatar: textField(body.avatar, 2048),
      bio: textField(body.bio, 500),
      bannerUrl: textField(body.bannerUrl, 2048),
      profileVisibility: visibilityOptions.includes(body.profileVisibility) ? body.profileVisibility : 'public',
      sessionVisibility: visibilityOptions.includes(body.sessionVisibility) ? body.sessionVisibility : 'private',
      university: textField(body.university, 120),
      studyField: textField(body.studyField, 120),
      countryCode: textField(body.countryCode, 8),
      countryName: textField(body.countryName, 80),
      currentSubject: textField(body.currentSubject, 120),
      currentGoal: textField(body.currentGoal, 240),
      isGhostMode: body.isGhostMode === true,
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Profile sync failed:', error);
    return res.status(500).json({ error: 'Profile could not be saved.' });
  }
}
