-- Keep presence heartbeats server-timestamped so clients cannot hold seats
-- indefinitely by submitting a future last_seen_at value.
BEGIN;
REVOKE UPDATE (last_seen_at) ON TABLE public.lima_room_presence FROM authenticated;
GRANT UPDATE (study_status) ON TABLE public.lima_room_presence TO authenticated;

CREATE OR REPLACE FUNCTION public.heartbeat_lima_study_room()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Please sign in first.';
  END IF;
  UPDATE public.lima_room_presence
    SET last_seen_at = now()
    WHERE user_uid = (select auth.uid())::text;
END;
$function$;

REVOKE ALL ON FUNCTION public.heartbeat_lima_study_room() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.heartbeat_lima_study_room() TO authenticated, service_role;
COMMIT;
