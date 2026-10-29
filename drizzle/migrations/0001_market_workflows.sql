-- Additive Week 7 migration. Apply to the EXISTING Supabase project only.
-- Catalog figures live in src/lib/market/model.ts and are explicitly illustrative.
CREATE TABLE public.markets (
  id text PRIMARY KEY,
  name text NOT NULL,
  industry text NOT NULL,
  region text NOT NULL,
  illustrative boolean NOT NULL DEFAULT true CHECK (illustrative)
);
INSERT INTO public.markets (id, name, industry, region) VALUES
 ('eu-heat-pumps', 'European heat pumps', 'Energy', 'Europe'),
 ('asia-water', 'Asian water treatment', 'Infrastructure', 'Asia Pacific'),
 ('na-automation', 'North American automation', 'Manufacturing', 'North America'),
 ('eu-medical', 'European medical devices', 'Healthcare', 'Europe'),
 ('asia-cooling', 'Asian data-centre cooling', 'Energy', 'Asia Pacific'),
 ('na-recycling', 'North American recycling', 'Infrastructure', 'North America');
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.markets FROM anon, authenticated;
GRANT SELECT ON public.markets TO authenticated;
CREATE POLICY markets_read ON public.markets FOR SELECT TO authenticated USING (true);

CREATE FUNCTION public.navoscope_valid_scores(value jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
 SELECT jsonb_typeof(value) = 'object'
   AND value ?& ARRAY['demand','growth','fit','feasibility','resilience']
   AND (value - ARRAY['demand','growth','fit','feasibility','resilience']) = '{}'::jsonb
   AND NOT EXISTS (
     SELECT 1 FROM unnest(ARRAY['demand','growth','fit','feasibility','resilience']) AS key
     WHERE jsonb_typeof(value -> key) IS DISTINCT FROM 'number' OR (value ->> key) !~ '^[1-5]$'
   );
$$;
CREATE TABLE public.opportunity_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id text NOT NULL REFERENCES public.markets(id),
  scores jsonb NOT NULL CHECK (public.navoscope_valid_scores(scores)),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 3000),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New','Researching','Scored','Reviewed','Archived')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, market_id)
);
CREATE INDEX evaluations_owner_updated ON public.opportunity_evaluations(user_id, updated_at DESC);
ALTER TABLE public.opportunity_evaluations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.opportunity_evaluations FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.opportunity_evaluations TO authenticated;
CREATE POLICY evaluations_read_own ON public.opportunity_evaluations FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY evaluations_insert_own ON public.opportunity_evaluations FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY evaluations_update_own ON public.opportunity_evaluations FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE FUNCTION public.navoscope_guard_evaluation() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF TG_OP = 'UPDATE' THEN
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.market_id IS DISTINCT FROM OLD.market_id THEN
     RAISE EXCEPTION 'Evaluation identity cannot be changed' USING ERRCODE = '42501';
   END IF;
   IF OLD.status = 'Archived' AND (NEW.scores IS DISTINCT FROM OLD.scores OR NEW.notes IS DISTINCT FROM OLD.notes) THEN
     RAISE EXCEPTION 'Restore archived evaluation before editing content' USING ERRCODE = '42501';
   END IF;
 END IF;
 NEW.updated_at = now();
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_evaluation BEFORE INSERT OR UPDATE ON public.opportunity_evaluations FOR EACH ROW EXECUTE FUNCTION public.navoscope_guard_evaluation();
CREATE TABLE public.market_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  market_id text NOT NULL REFERENCES public.markets(id),
  scores jsonb NOT NULL CHECK (public.navoscope_valid_scores(scores)),
  assumptions text NOT NULL CHECK (char_length(trim(assumptions)) BETWEEN 1 AND 3000),
  report jsonb NOT NULL CHECK (coalesce(jsonb_typeof(report) = 'object' AND report ->> 'mode' = 'Rule-based demo — no language model called', false)),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analyses_owner_market ON public.market_analyses(user_id, market_id, created_at DESC);
ALTER TABLE public.market_analyses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.market_analyses FROM anon, authenticated;
GRANT SELECT, INSERT ON public.market_analyses TO authenticated;
CREATE POLICY analyses_read_own ON public.market_analyses FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY analyses_insert_own ON public.market_analyses FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
-- Reports are immutable user-authored snapshots. No update/delete grants or policies.
-- No client-controlled role or administrator elevation is introduced.
