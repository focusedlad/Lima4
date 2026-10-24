-- Ensure saved study-session sharing preferences exist in every Lima4 environment.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS session_visibility text NOT NULL DEFAULT 'private';
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_session_visibility_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_session_visibility_check
  CHECK (session_visibility IN ('private','friends','public'));
