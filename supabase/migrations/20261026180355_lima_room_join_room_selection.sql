-- Atomic room join/leave with seat selection and automatic overflow rooms.
CREATE OR REPLACE FUNCTION public.join_lima_study_room(
  p_room_type text,
  p_user_name text,
  p_avatar_url text,
  p_avatar_config jsonb DEFAULT '{}'::jsonb,
  p_pet_config jsonb DEFAULT '{}'::jsonb,
  p_reading_item text DEFAULT 'laptop',
  p_requested_room_id uuid DEFAULT NULL,
  p_requested_seat integer DEFAULT NULL
)
RETURNS TABLE(room_id uuid, room_number integer, seat_index integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_uid text;
  v_room public.lima_study_rooms%rowtype;
  v_seat integer;
BEGIN
  v_uid := (select auth.uid())::text;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Please sign in to enter a live room.'; END IF;
  IF p_room_type NOT IN ('cafe','classroom','nature','fireplace') THEN
    RAISE EXCEPTION 'That room type is not available.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('lima-room:' || p_room_type));
  DELETE FROM public.lima_room_presence WHERE last_seen_at < now() - interval '90 seconds';

  IF p_requested_room_id IS NOT NULL THEN
    SELECT r.* INTO v_room
    FROM public.lima_study_rooms r
    WHERE r.id = p_requested_room_id AND r.room_type = p_room_type
      AND (SELECT count(*) FROM public.lima_room_presence p WHERE p.room_id = r.id) < 50
    FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    SELECT r.* INTO v_room
    FROM public.lima_study_rooms r
    WHERE r.room_type = p_room_type
      AND (SELECT count(*) FROM public.lima_room_presence p WHERE p.room_id = r.id) < 50
    ORDER BY r.room_number
    LIMIT 1
    FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    INSERT INTO public.lima_study_rooms(room_type, room_number, display_name)
    VALUES (
      p_room_type,
      coalesce((SELECT max(room_number) + 1 FROM public.lima_study_rooms WHERE room_type = p_room_type), 1),
      CASE p_room_type
        WHEN 'cafe' THEN 'Cafe'
        WHEN 'classroom' THEN 'Classroom'
        WHEN 'nature' THEN 'Nature Park'
        ELSE 'Fireplace Lounge'
      END || ' ' || coalesce((SELECT max(room_number) + 1 FROM public.lima_study_rooms WHERE room_type = p_room_type), 1)
    ) RETURNING * INTO v_room;
  END IF;

  DELETE FROM public.lima_room_presence WHERE user_uid = v_uid;

  IF p_requested_seat BETWEEN 1 AND 50 AND NOT EXISTS (
    SELECT 1 FROM public.lima_room_presence p WHERE p.room_id = v_room.id AND p.seat_index = p_requested_seat
  ) THEN
    v_seat := p_requested_seat;
  ELSE
    SELECT s INTO v_seat
    FROM generate_series(1,50) s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.lima_room_presence p WHERE p.room_id = v_room.id AND p.seat_index = s
    )
    ORDER BY s LIMIT 1;
  END IF;

  IF v_seat IS NULL THEN RAISE EXCEPTION 'This room just filled up. Please choose another room.'; END IF;

  INSERT INTO public.lima_room_presence(
    room_id, user_uid, user_name, avatar_url, avatar_config, pet_config,
    reading_item, study_status, seat_index, session_started_at, joined_at, last_seen_at
  ) VALUES (
    v_room.id, v_uid, left(coalesce(nullif(trim(p_user_name), ''), 'Student'), 80),
    nullif(p_avatar_url, ''), coalesce(p_avatar_config, '{}'::jsonb), coalesce(p_pet_config, '{}'::jsonb),
    CASE WHEN p_reading_item IN ('laptop','book','tablet','notebook') THEN p_reading_item ELSE 'laptop' END,
    'studying', v_seat, now(), now(), now()
  );

  RETURN QUERY SELECT v_room.id, v_room.room_number, v_seat;
END;
$function$;

CREATE OR REPLACE FUNCTION public.leave_lima_study_room()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF (select auth.uid()) IS NULL THEN RAISE EXCEPTION 'Please sign in first.'; END IF;
  DELETE FROM public.lima_room_presence WHERE user_uid = (select auth.uid())::text;
END;
$function$;

REVOKE ALL ON FUNCTION public.join_lima_study_room(text,text,text,jsonb,jsonb,text,uuid,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_lima_study_room() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_lima_study_room(text,text,text,jsonb,jsonb,text,uuid,integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.leave_lima_study_room() TO authenticated, service_role;
