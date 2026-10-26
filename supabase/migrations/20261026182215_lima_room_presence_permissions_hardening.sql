-- Lima4 live-room security hardening.
-- SECURITY DEFINER is retained for atomic room allocation/cleanup; access is
-- restricted to authenticated callers, and direct updates cannot alter identity,
-- room, seat, or session-start fields.
BEGIN;
REVOKE ALL ON TABLE public.lima_room_presence FROM anon;
REVOKE ALL ON TABLE public.lima_room_presence FROM authenticated;
GRANT SELECT ON TABLE public.lima_room_presence TO authenticated;
GRANT UPDATE (study_status, last_seen_at) ON TABLE public.lima_room_presence TO authenticated;
REVOKE EXECUTE ON FUNCTION public.join_lima_study_room(text,text,text,jsonb,jsonb,text,uuid,integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.leave_lima_study_room() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_lima_study_room(text,text,text,jsonb,jsonb,text,uuid,integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.leave_lima_study_room() TO authenticated, service_role;
COMMIT;
