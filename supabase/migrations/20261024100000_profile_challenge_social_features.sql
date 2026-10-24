-- Lima4 public profiles, safe session sharing and challenge lifecycle.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS profile_visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS session_visibility text NOT NULL DEFAULT 'private';

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_profile_visibility_check;
ALTER TABLE public.users ADD CONSTRAINT users_profile_visibility_check CHECK (profile_visibility IN ('public','friends','private'));
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_session_visibility_check;
ALTER TABLE public.users ADD CONSTRAINT users_session_visibility_check CHECK (session_visibility IN ('private','friends','public'));

ALTER TABLE public.study_challenges
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'waiting',
  ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.study_challenges DROP CONSTRAINT IF EXISTS study_challenges_status_check;
ALTER TABLE public.study_challenges ADD CONSTRAINT study_challenges_status_check CHECK (status IN ('waiting','active','completed','cancelled'));

ALTER TABLE public.challenge_participants
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted',
  ADD COLUMN IF NOT EXISTS requested_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS decided_at timestamptz;
ALTER TABLE public.challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_status_check;
ALTER TABLE public.challenge_participants ADD CONSTRAINT challenge_participants_status_check CHECK (status IN ('pending','accepted','rejected'));

ALTER TABLE public.focus_logs ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private';
ALTER TABLE public.focus_logs DROP CONSTRAINT IF EXISTS focus_logs_visibility_check;
ALTER TABLE public.focus_logs ADD CONSTRAINT focus_logs_visibility_check CHECK (visibility IN ('private','friends','public'));

CREATE UNIQUE INDEX IF NOT EXISTS challenge_participants_challenge_user_unique ON public.challenge_participants (challenge_id,user_uid);
CREATE INDEX IF NOT EXISTS focus_logs_user_date_created_idx ON public.focus_logs (user_uid,date DESC,created_at DESC);
CREATE INDEX IF NOT EXISTS focus_logs_visibility_date_idx ON public.focus_logs (visibility,date DESC,created_at DESC);
CREATE INDEX IF NOT EXISTS challenge_participants_status_idx ON public.challenge_participants (challenge_id,status,requested_at);
CREATE INDEX IF NOT EXISTS users_handle_lower_idx ON public.users (lower(handle));

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('profile-media','profile-media',true,5242880,ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;
DROP POLICY IF EXISTS "Public can view Lima4 profile media" ON storage.objects;
CREATE POLICY "Public can view Lima4 profile media" ON storage.objects FOR SELECT USING (bucket_id='profile-media');
DROP POLICY IF EXISTS "Users upload own Lima4 profile media" ON storage.objects;
CREATE POLICY "Users upload own Lima4 profile media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS "Users update own Lima4 profile media" ON storage.objects;
CREATE POLICY "Users update own Lima4 profile media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text) WITH CHECK (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS "Users delete own Lima4 profile media" ON storage.objects;
CREATE POLICY "Users delete own Lima4 profile media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);
