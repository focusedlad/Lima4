-- Lima4 live study rooms and presence foundation.
CREATE TABLE IF NOT EXISTS public.lima_study_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type text NOT NULL CHECK (room_type IN ('cafe','classroom','nature','fireplace')),
  room_number integer NOT NULL CHECK (room_number > 0),
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lima_study_rooms_room_type_room_number_key UNIQUE (room_type, room_number)
);

CREATE TABLE IF NOT EXISTS public.lima_room_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.lima_study_rooms(id) ON DELETE CASCADE,
  user_uid text NOT NULL UNIQUE,
  user_name text NOT NULL,
  avatar_url text,
  avatar_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  pet_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  reading_item text NOT NULL DEFAULT 'laptop',
  study_status text NOT NULL DEFAULT 'studying' CHECK (study_status IN ('studying','break')),
  seat_index integer NOT NULL CHECK (seat_index BETWEEN 1 AND 50),
  session_started_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lima_room_presence_room_id_seat_index_key UNIQUE (room_id, seat_index)
);

CREATE INDEX IF NOT EXISTS lima_study_rooms_type_number_idx
  ON public.lima_study_rooms (room_type, room_number);
CREATE INDEX IF NOT EXISTS lima_room_presence_room_live_idx
  ON public.lima_room_presence (room_id, last_seen_at DESC);

ALTER TABLE public.lima_study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lima_room_presence ENABLE ROW LEVEL SECURITY;

DO $policy$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lima_study_rooms' AND policyname='Authenticated users can view Lima rooms') THEN
    CREATE POLICY "Authenticated users can view Lima rooms" ON public.lima_study_rooms
      FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lima_room_presence' AND policyname='Authenticated users can view live room presence') THEN
    CREATE POLICY "Authenticated users can view live room presence" ON public.lima_room_presence
      FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lima_room_presence' AND policyname='Users can update their own room presence') THEN
    CREATE POLICY "Users can update their own room presence" ON public.lima_room_presence
      FOR UPDATE TO authenticated USING (user_uid = (select auth.uid())::text) WITH CHECK (user_uid = (select auth.uid())::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lima_room_presence' AND policyname='Users can delete their own room presence') THEN
    CREATE POLICY "Users can delete their own room presence" ON public.lima_room_presence
      FOR DELETE TO authenticated USING (user_uid = (select auth.uid())::text);
  END IF;
END
$policy$;

INSERT INTO public.lima_study_rooms (room_type, room_number, display_name) VALUES
  ('cafe', 1, 'Study Cafe 1'),
  ('classroom', 1, 'Quiet Classroom 1'),
  ('nature', 1, 'Nature Park 1'),
  ('fireplace', 1, 'Fireplace Lounge 1')
ON CONFLICT (room_type, room_number) DO NOTHING;

DO $publication$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='lima_study_rooms') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.lima_study_rooms;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='lima_room_presence') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.lima_room_presence;
    END IF;
  END IF;
END
$publication$;

-- Table privileges are tightened in the subsequent room join/seat and security migrations.
GRANT SELECT ON public.lima_study_rooms TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.lima_room_presence TO authenticated;
