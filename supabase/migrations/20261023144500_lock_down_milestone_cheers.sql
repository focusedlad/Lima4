ALTER TABLE public.milestone_cheers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.milestone_cheers FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.milestone_cheers_id_seq FROM anon, authenticated;
