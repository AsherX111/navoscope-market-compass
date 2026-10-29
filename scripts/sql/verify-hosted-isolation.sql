-- Run in the EXISTING Lovable project's privileged SQL editor.
-- Uses two existing profile IDs without displaying them or reading passwords.
-- All fixture writes and request-role settings are rolled back inside a subtransaction.
-- This tests database RLS; it does not test browser login or JWT validation.
DO $test$
DECLARE
  identities uuid[];
  user_a uuid;
  user_b uuid;
  test_market text := 'isolation-test-' || gen_random_uuid()::text;
  evaluation_a uuid := gen_random_uuid();
  report_a uuid := gen_random_uuid();
  test_scores jsonb := '{"demand":3,"growth":3,"fit":3,"feasibility":3,"resilience":3}';
  test_report jsonb := '{"mode":"Rule-based demo — no language model called"}';
  affected integer;
BEGIN
  SELECT array_agg(id) INTO identities
  FROM (SELECT id FROM public.profiles ORDER BY id LIMIT 2) AS existing_profiles;
  IF coalesce(array_length(identities, 1), 0) < 2 THEN
    RAISE EXCEPTION 'Two existing profiles are required. No accounts were created.';
  END IF;
  user_a := identities[1];
  user_b := identities[2];

  BEGIN
    INSERT INTO public.markets(id, name, industry, region)
    VALUES (test_market, 'Temporary isolation test', 'Test fixture', 'Test fixture');

    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM set_config('request.jwt.claim.sub', user_a::text, true);
    PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', user_a, 'role', 'authenticated')::text, true);
    INSERT INTO public.opportunity_evaluations(id, user_id, market_id, scores, notes)
    VALUES (evaluation_a, user_a, test_market, test_scores, 'Temporary RLS fixture');
    INSERT INTO public.market_analyses(id, user_id, market_id, scores, assumptions, report)
    VALUES (report_a, user_a, test_market, test_scores, 'Temporary RLS fixture', test_report);
    IF (SELECT count(*) FROM public.opportunity_evaluations WHERE market_id = test_market) <> 1
       OR (SELECT count(*) FROM public.market_analyses WHERE market_id = test_market) <> 1 THEN
      RAISE EXCEPTION 'FAIL: owner cannot save and retrieve own records';
    END IF;

    PERFORM set_config('request.jwt.claim.sub', user_b::text, true);
    PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', user_b, 'role', 'authenticated')::text, true);
    IF EXISTS (SELECT 1 FROM public.opportunity_evaluations WHERE market_id = test_market)
       OR EXISTS (SELECT 1 FROM public.market_analyses WHERE market_id = test_market) THEN
      RAISE EXCEPTION 'FAIL: second user can read first user records';
    END IF;
    UPDATE public.opportunity_evaluations SET notes = 'Unauthorized change' WHERE id = evaluation_a;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 0 THEN
      RAISE EXCEPTION 'FAIL: second user can update first user evaluation';
    END IF;

    BEGIN
      INSERT INTO public.opportunity_evaluations(user_id, market_id, scores)
      VALUES (user_a, test_market, test_scores);
      RAISE EXCEPTION 'FAIL: second user can insert an evaluation as first user';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
      INSERT INTO public.market_analyses(user_id, market_id, scores, assumptions, report)
      VALUES (user_a, test_market, test_scores, 'Unauthorized owner', test_report);
      RAISE EXCEPTION 'FAIL: second user can insert an analysis as first user';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;

    INSERT INTO public.opportunity_evaluations(user_id, market_id, scores)
    VALUES (user_b, test_market, test_scores);
    INSERT INTO public.market_analyses(user_id, market_id, scores, assumptions, report)
    VALUES (user_b, test_market, test_scores, 'Second owner fixture', test_report);
    IF (SELECT count(*) FROM public.opportunity_evaluations WHERE market_id = test_market) <> 1
       OR (SELECT count(*) FROM public.market_analyses WHERE market_id = test_market) <> 1 THEN
      RAISE EXCEPTION 'FAIL: second user cannot access only own records';
    END IF;

    PERFORM set_config('request.jwt.claim.sub', user_a::text, true);
    PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', user_a, 'role', 'authenticated')::text, true);
    IF (SELECT count(*) FROM public.opportunity_evaluations WHERE market_id = test_market) <> 1
       OR (SELECT count(*) FROM public.market_analyses WHERE market_id = test_market) <> 1
       OR (SELECT notes FROM public.opportunity_evaluations WHERE id = evaluation_a) <> 'Temporary RLS fixture' THEN
      RAISE EXCEPTION 'FAIL: owner records are not isolated or were changed';
    END IF;

    EXECUTE 'RESET ROLE';
    EXECUTE 'SET LOCAL ROLE anon';
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
    BEGIN
      PERFORM 1 FROM public.opportunity_evaluations WHERE market_id = test_market;
      RAISE EXCEPTION 'FAIL: anonymous client has evaluation read access';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
      PERFORM 1 FROM public.market_analyses WHERE market_id = test_market;
      RAISE EXCEPTION 'FAIL: anonymous client has analysis read access';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;

    -- Deliberately roll back every fixture write and role/claim setting above.
    RAISE EXCEPTION USING ERRCODE = 'PZ001', MESSAGE = 'Rollback successful test fixtures';
  EXCEPTION WHEN SQLSTATE 'PZ001' THEN NULL;
  END;

  IF EXISTS (SELECT 1 FROM public.markets WHERE id = test_market) THEN
    RAISE EXCEPTION 'FAIL: temporary fixture cleanup did not complete';
  END IF;
END;
$test$;

SELECT
  'PASS' AS result,
  'Owner access, cross-user read/write denial, anonymous denial and fixture rollback passed.' AS details,
  'Database RLS only; browser login and JWT verification are not tested.' AS scope;
