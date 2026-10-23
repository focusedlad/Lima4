CREATE TABLE IF NOT EXISTS public.milestone_cheers (
  id bigserial PRIMARY KEY,
  milestone_id text NOT NULL REFERENCES public.milestones(milestone_id) ON DELETE CASCADE,
  user_uid text NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT milestone_cheers_one_per_user UNIQUE (milestone_id, user_uid)
);
CREATE INDEX IF NOT EXISTS milestone_cheers_user_uid_idx ON public.milestone_cheers(user_uid);
