ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS evidence_kind text NOT NULL DEFAULT 'legacy_illustrative';
ALTER TABLE public.markets DROP CONSTRAINT IF EXISTS markets_illustrative_check;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.markets'::regclass AND conname = 'markets_evidence_kind_check') THEN
    ALTER TABLE public.markets ADD CONSTRAINT markets_evidence_kind_check CHECK ((evidence_kind = 'legacy_illustrative' AND illustrative) OR (evidence_kind = 'manufacturer_statement' AND NOT illustrative));
  END IF;
END $$;
COMMENT ON COLUMN public.markets.evidence_kind IS 'Application evidence classification, not verification of market size, growth, demand or commercial validation.';
COMMENT ON COLUMN public.markets.illustrative IS 'True for legacy teaching records; false for manufacturer-sourced application relevance only. No market metrics implied.';