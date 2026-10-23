-- Lima4 multi-user RLS hardening.
-- Conservative read-only client policies; application writes remain behind authenticated server APIs.
-- Keep this migration idempotent so it can reconcile environments with earlier manual migrations.

DROP POLICY IF EXISTS "Users can read participants in visible challenges" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can read own focus logs" ON public.focus_logs;
DROP POLICY IF EXISTS "Users can read own friendship edges" ON public.friendships;
DROP POLICY IF EXISTS "Users can read cheers on visible milestones" ON public.milestone_cheers;
DROP POLICY IF EXISTS "Users can read visible milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can read visible challenges" ON public.study_challenges;
DROP POLICY IF EXISTS "Users can read shared study decks" ON public.study_decks;
DROP POLICY IF EXISTS "Users can read public or hosted study spaces" ON public.study_spaces;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

DROP POLICY IF EXISTS lima4_owner_select ON public.users;
CREATE POLICY lima4_owner_select ON public.users
  FOR SELECT TO authenticated
  USING (uid = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS lima4_owner_select ON public.focus_logs;
CREATE POLICY lima4_owner_select ON public.focus_logs
  FOR SELECT TO authenticated
  USING (user_uid = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS lima4_owner_select ON public.friendships;
CREATE POLICY lima4_owner_select ON public.friendships
  FOR SELECT TO authenticated
  USING (user_uid = (SELECT auth.uid())::text OR friend_uid = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS lima4_select_policy ON public.study_challenges;
CREATE POLICY lima4_select_policy ON public.study_challenges
  FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR creator_uid = (SELECT auth.uid())::text
    OR (
      visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE (f.user_uid = (SELECT auth.uid())::text AND f.friend_uid = study_challenges.creator_uid)
           OR (f.friend_uid = (SELECT auth.uid())::text AND f.user_uid = study_challenges.creator_uid)
      )
    )
  );

DROP POLICY IF EXISTS lima4_select_policy ON public.challenge_participants;
CREATE POLICY lima4_select_policy ON public.challenge_participants
  FOR SELECT TO authenticated
  USING (
    user_uid = (SELECT auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.study_challenges c
      WHERE c.challenge_id = challenge_participants.challenge_id
        AND (
          c.visibility = 'public'
          OR c.creator_uid = (SELECT auth.uid())::text
          OR (
            c.visibility = 'friends'
            AND EXISTS (
              SELECT 1 FROM public.friendships f
              WHERE (f.user_uid = (SELECT auth.uid())::text AND f.friend_uid = c.creator_uid)
                 OR (f.friend_uid = (SELECT auth.uid())::text AND f.user_uid = c.creator_uid)
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS lima4_select_policy ON public.milestones;
CREATE POLICY lima4_select_policy ON public.milestones
  FOR SELECT TO authenticated
  USING (
    user_uid = (SELECT auth.uid())::text
    OR (
      visibility = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.uid = milestones.user_uid AND u.is_ghost_mode = true
      )
    )
    OR (
      visibility = 'friends'
      AND EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE (f.user_uid = (SELECT auth.uid())::text AND f.friend_uid = milestones.user_uid)
           OR (f.friend_uid = (SELECT auth.uid())::text AND f.user_uid = milestones.user_uid)
      )
    )
  );

DROP POLICY IF EXISTS lima4_owner_select ON public.milestone_cheers;
CREATE POLICY lima4_owner_select ON public.milestone_cheers
  FOR SELECT TO authenticated
  USING (user_uid = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS lima4_select_policy ON public.study_decks;
CREATE POLICY lima4_select_policy ON public.study_decks
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS lima4_select_policy ON public.study_spaces;
CREATE POLICY lima4_select_policy ON public.study_spaces
  FOR SELECT TO authenticated
  USING (is_private = false OR host_uid = (SELECT auth.uid())::text);

CREATE UNIQUE INDEX IF NOT EXISTS challenge_participants_challenge_user_unique
  ON public.challenge_participants (challenge_id, user_uid);
CREATE INDEX IF NOT EXISTS idx_friendships_user_friend
  ON public.friendships (user_uid, friend_uid);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_user
  ON public.friendships (friend_uid, user_uid);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge
  ON public.challenge_participants (challenge_id);
CREATE INDEX IF NOT EXISTS idx_focus_logs_user_date
  ON public.focus_logs (user_uid, date);
CREATE INDEX IF NOT EXISTS idx_milestones_visibility_created
  ON public.milestones (visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_challenges_visibility_dates
  ON public.study_challenges (visibility, start_date, end_date);
