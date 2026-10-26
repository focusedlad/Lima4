-- Remove the redundant unique index on (challenge_id, user_uid).
-- Keep challenge_participants_challenge_user_unique as the canonical constraint
-- backing the one-membership-per-user invariant.
DROP INDEX IF EXISTS public.challenge_participants_one_per_user;
