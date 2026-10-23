-- Persist the full editable account profile so settings survive sign-in on any device.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'GLOBAL',
  ADD COLUMN IF NOT EXISTS country_name text NOT NULL DEFAULT 'Global',
  ADD COLUMN IF NOT EXISTS current_subject text NOT NULL DEFAULT 'General Study',
  ADD COLUMN IF NOT EXISTS current_goal text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_ghost_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS terms_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version text;
