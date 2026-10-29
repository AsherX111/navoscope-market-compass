# Verification evidence — 29 October 2026

Local branch: `feat/week7-market-workflows`. The automated commands below ran against the personal fork checkout during initial implementation. Later manual actions and evidence are recorded separately below; they do not change the scope of the original automated results.

| Check actually run | Outcome | What it establishes / limit |
|---|---|---|
| `npm test` | PASS — 5 files, 25 tests | Existing 9 tests plus 16 scoring/discovery/report/component checks. Includes form changes, filtering, navigation callback, save/remount/retrieve, archive/restore and error/retry. Component persistence boundary is mocked, not live cloud. |
| `./node_modules/.bin/tsc --noEmit` | PASS | Application and test TypeScript compiles. |
| `npm run build` | PASS | Client/SSR/Nitro production output built; no deployment. Existing large-chunk and tsconfig-paths notices remain. |
| `./node_modules/.bin/eslint src/lib/market src/components/market src/test/market-*.test* src/integrations/supabase/types.ts scripts/verify-market-db.mjs` | PASS | Focused new/extended modules and database harness. |
| `npm run lint` | FAIL — 227 errors, 9 warnings | Remaining existing formatting and refresh-export warnings, mainly legacy files. Initial onboarding baseline was 282 errors, 9 warnings. New files are formatted; no broad legacy formatting rewrite was performed. |
| `PGLITE_MODULE=/workspace/.navoscope-db-test/node_modules/@electric-sql/pglite/dist/index.js node scripts/verify-market-db.mjs` | PASS — 12 checks | Real PostgreSQL migration/constraint/trigger/RLS behavior in disposable PGlite. No hosted service contacted; fixture auth roles are not real Supabase sessions. |
| System Chromium + external Playwright script (`scripts/verify-browser.mjs`) | PASS — 4 smoke assertions | Real landing/navigation redirects, direct protected route redirect, 375px layout/Escape dialog close, no uncaught browser exceptions in those unauthenticated flows. Does not certify authenticated feature screens or live cloud persistence. |
| Read-only Supabase `/auth/v1/settings` through inherited proxy | BLOCKED — CONNECT 403 Forbidden | Existing configured host still denied by current runtime policy. No new credentials requested. |
| Original local video resource URL | FAIL — HTTP 404 | Existing Lovable `/__l5e/assets-v1/.../navoscope-loop.mp4` is absent here; no MP4 is in the checkout. This was present before feature changes. |
| `git diff --check` | PASS | No whitespace-error hunks. |

## Repeatable browser smoke check

With the dev server started from this repository and system Chromium installed:

```sh
npm install --prefix /tmp/navoscope-browser-check --no-audit --no-fund playwright-core@1.56.1
PLAYWRIGHT_MODULE=/tmp/navoscope-browser-check/node_modules/playwright-core/index.mjs node scripts/verify-browser.mjs
```

The script uses loopback only for testing, does not create accounts or send messages, and reports failures via a nonzero exit. Browser resource-console errors from the missing original video are a known baseline limitation; the script's exception check covers uncaught JavaScript exceptions, not a claim of a clean console across every route.

## Still unrun / requiring real configuration

- Verify live Supabase RLS/PostgREST with two actual test accounts. The migration has now been applied; do not rerun it blindly.
- Real signup, confirmation, username, password reset, login, avatar and logout acceptance.
- Independent hosted browser/API acceptance, complete Explorer search/filter/sort coverage, back/forward, account switch, phone/keyboard behavior and network-loss recovery. Guided persistence checks were student-reported as described below.
- Original video playback in the intended Lovable hosting context.
- Print/draw and photograph two paper diagrams, student reflection, team allocation, tutor confirmation and final submission.

Use `demo-script.md`. Do not convert pending checks into passes merely because local code, mocked interactions or the migration file exist.

## Subsequent manual evidence — 29 October 2026

| Action / check | Recorded outcome | Evidence and limit |
|---|---|---|
| Existing Lovable database inspection | `profiles.id` and `profiles.display_name`; owner SELECT/UPDATE policies; RLS enabled | Uploaded `query-results-export-2026-10-29_14-38-33.csv`; no user rows were read by the inspection query. |
| Additive migration executed by the student in Lovable SQL editor | Four application tables present, all with RLS enabled | Uploaded `query-results-export-2026-10-29_14-43-02.csv`: profiles, markets, opportunity_evaluations, market_analyses. This export confirms table/RLS state, not a full live access-policy test. |
| Upstream code integration | PR #1 merged into AsherX111/main by the student | Uploaded GitHub screenshot shows Merged. No force-push was used by Codex. |
| Lovable preview loads new features | Explorer and Opportunity Scoring visible | Uploaded preview screenshots; this is preview evidence, not published-site verification. |
| Evaluation persistence after refresh | Student confirmed score, status and notes remained | Explicit student reply to the guided refresh checklist. No record values or credentials were exported. |
| Analysis save/retrieval | Student reported success with a brief “ok” | Guided sequence included generation, save, refresh and retrieval. No independent browser capture/API verification of the saved report was supplied. |
| Archive and restore | Student reported success with a brief “ok” | Guided UI sequence; live direct-API archive enforcement was not tested. |
| Account isolation — hosted database RLS | PASS — completed by the student | Uploaded query-results-export-2026-10-29_15-26-59.csv reports owner access, cross-user read/write denial, anonymous denial and fixture rollback passed. Controlled SQL identities only; browser login/JWT verification remain untested. |
| Website publication | Confirmed by supplied Lovable screenshot | The student supplied “Your website was updated” for navoscope-market-compass.lovable.app. Independent public-site functional acceptance is not yet recorded. |

The initial cloud-proxy 403 and local video 404 were cloud/local observations, not evidence that the student's Lovable preview cannot use its backend/video. The background appears in preview screenshots; looping playback has not been independently verified.

## Completed hosted account-isolation test — PASS (database RLS)

The rollback-only `scripts/sql/verify-hosted-isolation.sql` was added at the student's request. The isolated PostgreSQL harness successfully exercised it and confirmed unchanged market/evaluation/report row counts. The student subsequently ran it in the original Lovable SQL editor and supplied query-results-export-2026-10-29_15-26-59.csv with result PASS. It uses two existing profiles with controlled SQL request claims; it does not create credentials, validate JWTs or certify browser account switching. The original 12 database checks still pass, plus this script regression check.

Hosted SQL RLS isolation is now verified by the supplied export. Real-browser account switching and JWT validation remain outside this check. The student subsequently supplied Lovable publication confirmation; public-site functional acceptance remains separate.
