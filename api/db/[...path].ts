import {
  addFriend,
  cheerMilestoneInDb,
  getAllStudyChallenges,
  getStudyChallengeById,
  getCheeredMilestoneIds,
  getChallengeLeaderboard,
  getFriendsByUser,
  getJoinedChallengeProgress,
  getLeaderboardByTimeframe,
  getMilestonesFeed,
  getUserByUid,
  insertMilestone,
  insertStudyChallenge,
  joinStudyChallenge,
  removeFriend,
  searchUsersByQuery,
} from '../../src/db/queries.js';
import { getAuthenticatedSupabaseUser } from '../../src/lib/supabase-request-auth.js';

export default async function handler(req: any, res: any) {
  const authUser = await getAuthenticatedSupabaseUser(req);
  if (!authUser) return res.status(401).json({ error: 'Sign in with a verified account to use community features.' });

  const pathname = new URL(req.url || '/', 'https://lima4.invalid').pathname.replace(/^\/api\/db\/?/, '');
  const parts = pathname.split('/').filter(Boolean).map((part) => decodeURIComponent(part));
  const method = String(req.method || 'GET').toUpperCase();
  const body = req.body || {};

  try {
    if (parts.length === 1 && parts[0] === 'challenges' && method === 'GET') {
      const [rows, membership, myFriends] = await Promise.all([
        getAllStudyChallenges(),
        getJoinedChallengeProgress(authUser.id),
        getFriendsByUser(authUser.id),
      ]);
      const joined = new Map(membership.map((item: any) => [item.challengeId, item.studiedMinutes]));
      const myFriendUids = new Set(myFriends.map((friend: any) => friend.friendUid));
      const visibleRows = await Promise.all(rows.map(async (row: any) => {
        if (row.creatorUid === authUser.id || joined.has(row.challengeId) || myFriendUids.has(row.creatorUid)) return row;
        const creatorFriends = await getFriendsByUser(row.creatorUid);
        return creatorFriends.some((friend: any) => friend.friendUid === authUser.id) ? row : null;
      }));
      const challenges = visibleRows.filter(Boolean).map((row: any) => ({
        id: row.challengeId, challengeId: row.challengeId, title: row.title, description: row.description || '',
        creatorUid: row.creatorUid, creatorName: row.creatorName, creatorAvatar: row.creatorAvatar || '',
        targetHours: row.targetHours, period: row.period, startDate: row.startDate, endDate: row.endDate,
        participantsCount: row.participantsCount, category: row.category, isJoined: joined.has(row.challengeId),
        myProgressHours: Number(joined.get(row.challengeId) || 0) / 60,
      }));
      return res.status(200).json({ success: true, challenges });
    }

    if (parts.length === 1 && parts[0] === 'challenges' && method === 'POST') {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const targetHours = Number(body.targetHours);
      if (!title || title.length > 120 || !Number.isFinite(targetHours) || targetHours < 1 || targetHours > 1000) {
        return res.status(400).json({ error: 'Enter a challenge title and a target between 1 and 1000 hours.' });
      }
      const profile = await getUserByUid(authUser.id);
      const period = ['today', 'weekend', '7_days', '14_days', '30_days'].includes(body.period) ? body.period : '7_days';
      const startDate = new Date().toISOString().slice(0, 10);
      const days = period === 'today' ? 1 : period === 'weekend' ? 2 : period === '14_days' ? 14 : period === '30_days' ? 30 : 7;
      const endDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
      const challengeId = authUser.id + '_' + Date.now().toString(36);
      const row = await insertStudyChallenge({
        challengeId, title, description: typeof body.description === 'string' ? body.description.slice(0, 1000) : '',
        creatorUid: authUser.id, creatorName: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Studier',
        creatorAvatar: profile?.avatar || '', targetHours: Math.round(targetHours), period, startDate, endDate,
        category: typeof body.category === 'string' ? body.category.slice(0, 80) : 'General',
      });
      return res.status(201).json({ success: true, challenge: { ...row, id: row.challengeId, isJoined: true, myProgressHours: 0 } });
    }

    if (parts.length === 2 && parts[0] === 'challenges' && parts[1] === 'join' && method === 'POST') {
      const challengeId = typeof body.challengeId === 'string' ? body.challengeId : '';
      if (!challengeId) return res.status(400).json({ error: 'Challenge ID is required.' });
      const challenge = await getStudyChallengeById(challengeId);
      if (!challenge) return res.status(404).json({ error: 'This challenge no longer exists.' });
      if (challenge.creatorUid !== authUser.id) {
        const [myFriends, creatorFriends] = await Promise.all([
          getFriendsByUser(authUser.id),
          getFriendsByUser(challenge.creatorUid),
        ]);
        const isFriend = myFriends.some((friend: any) => friend.friendUid === challenge.creatorUid)
          || creatorFriends.some((friend: any) => friend.friendUid === authUser.id);
        if (!isFriend) return res.status(403).json({ error: 'Only friends of the challenge creator can join this challenge.' });
      }
      const profile = await getUserByUid(authUser.id);
      await joinStudyChallenge({
        challengeId, userUid: authUser.id,
        userName: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Studier',
        userAvatar: profile?.avatar || '',
      });
      return res.status(200).json({ success: true });
    }

    if (parts.length === 3 && parts[0] === 'challenges' && parts[2] === 'leaderboard' && method === 'GET') {
      const rows = await getChallengeLeaderboard(parts[1]);
      return res.status(200).json({ success: true, leaderboard: rows });
    }

    if (parts.length === 1 && parts[0] === 'leaderboard' && method === 'GET') {
      const allowed = ['today', 'week', 'month', 'all'];
      const raw = String(req.query?.timeframe || 'week');
      const timeframe = (allowed.includes(raw) ? raw : 'week') as 'today' | 'week' | 'month' | 'all';
      const rows = await getLeaderboardByTimeframe(timeframe);
      return res.status(200).json({ success: true, leaderboard: rows });
    }

    if (parts.length === 1 && parts[0] === 'friends' && method === 'GET') {
      const friends = await getFriendsByUser(authUser.id);
      return res.status(200).json({ success: true, friends });
    }

    if (parts.length === 1 && parts[0] === 'friends' && method === 'POST') {
      const friendUid = typeof body.friendUid === 'string' ? body.friendUid : '';
      if (!friendUid || friendUid === authUser.id) return res.status(400).json({ error: 'Choose another registered member.' });
      const friend = await getUserByUid(friendUid);
      if (!friend) return res.status(404).json({ error: 'That account is not a registered member.' });
      const profile = await getUserByUid(authUser.id);
      const result = await addFriend({
        userUid: authUser.id, friendUid, friendName: friend.name, friendHandle: friend.handle || '',
        friendAvatar: friend.avatar || '', friendUniversity: friend.university || '',
      });
      return res.status(201).json({ success: true, friendship: result });
    }

    if (parts.length === 2 && parts[0] === 'friends' && method === 'DELETE') {
      await removeFriend(authUser.id, parts[1]);
      return res.status(200).json({ success: true });
    }

    if (parts.length === 2 && parts[0] === 'users' && parts[1] === 'search' && method === 'GET') {
      const query = String(req.query?.q || '').slice(0, 80);
      const users = await searchUsersByQuery(query);
      return res.status(200).json({ success: true, users: users.filter((user: any) => user.uid !== authUser.id) });
    }

    if (parts.length === 1 && parts[0] === 'milestones' && method === 'GET') {
      const friendsOnly = String(req.query?.friendsOnly || 'false') === 'true';
      const rows = await getMilestonesFeed(authUser.id, friendsOnly);
      const cheeredRows = await getCheeredMilestoneIds(authUser.id, rows.map((row: any) => row.milestoneId));
      const cheeredIds = new Set(cheeredRows.map((row: any) => row.milestoneId));
      const milestones = rows.map((row: any) => ({
        ...row,
        id: row.milestoneId,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
        userHasCheered: cheeredIds.has(row.milestoneId),
      }));
      return res.status(200).json({ success: true, milestones });
    }

    if (parts.length === 1 && parts[0] === 'milestones' && method === 'POST') {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const description = typeof body.description === 'string' ? body.description.trim() : '';
      if (!title || title.length > 160 || !description || description.length > 1000) {
        return res.status(400).json({ error: 'A short title and description are required.' });
      }
      const profile = await getUserByUid(authUser.id);
      const row = await insertMilestone({
        milestoneId: authUser.id + '_' + Date.now().toString(36), userUid: authUser.id,
        userName: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Studier',
        userHandle: profile?.handle || '', userAvatar: profile?.avatar || '', university: profile?.university || '',
        type: ['session_completed', 'streak_milestone', 'challenge_completed'].includes(body.type) ? body.type : 'session_completed',
        title, description, subjectTag: typeof body.subjectTag === 'string' ? body.subjectTag.slice(0, 80) : '',
        streakDays: Number(profile?.currentStreak || 0), xpEarned: 0,
      });
      return res.status(201).json({ success: true, milestone: { ...row, id: row.milestoneId, createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '' } });
    }

    if (parts.length === 3 && parts[0] === 'milestones' && parts[2] === 'cheer' && method === 'POST') {
      const result = await cheerMilestoneInDb(parts[1], authUser.id);
      return res.status(200).json(result);
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(404).json({ error: 'Community endpoint not found.' });
  } catch (error) {
    console.error('Community API request failed:', error);
    return res.status(500).json({ error: 'The community request could not be completed.' });
  }
}
