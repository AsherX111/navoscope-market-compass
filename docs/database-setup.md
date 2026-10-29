# Database setup and security verification

## Existing project only

The inspected code uses Supabase hosted auth, an existing `profiles` migration and generated SDK types. No new application database or auth system is needed. The new migration was tested only in disposable, in-memory PostgreSQL; it has **not** been applied to the hosted project. This task does not run a production migration or deploy an application.

1. A project maintainer should confirm the existing Supabase project, inspect current schema/policies and take the normal backup appropriate to that project. Keep connection strings and keys in secure settings; do not paste them into chat or commit them.
2. Verify that `profiles`, its auth-user FK, ownership policies and signup trigger match `drizzle/migrations/0000_navoscope_private_profiles.sql`. Do not rerun that existing migration blindly. If missing, investigate which baseline has been applied before proceeding; do not drop or replace existing objects.
3. Review `drizzle/migrations/0001_market_workflows.sql`. It only adds a six-row illustrative catalog, evaluations, reports, supporting constraints/indexes/functions/triggers and RLS. Apply that migration once through the existing project's authorized SQL/migration workflow, inside a transaction. If any target name already exists, investigate the migration state rather than replacing it. No existing user rows need to be deleted or rewritten.
4. The migration journal has the new entry. `drizzle/schema.ts` is intentionally blank in the original repository; do **not** use `drizzle-kit push` or generate schema replacements from that blank file. This change supplies explicit SQL; it does not claim generated schema snapshots are complete. Record actual application in the team's migration ledger.
5. SDK types were extended for the three new tables; after hosted application, regenerate through the existing project tooling if needed, preserving the actual row structures.
6. Save/apply the existing Supabase host's allowed-domain requirement in cloud environment settings if testing here. Current proxy read-only check of `/auth/v1/settings` returns CONNECT 403. No extra API key is requested; existing public configuration is present. The saved onboarding draft was not applied by this coding task.

## Isolated migration/RLS regression test

Run from repository root. The external test-tool installation does not change application dependencies and creates no persistent application service:

```sh
npm install --prefix /tmp/navoscope-db-check --no-audit --no-fund @electric-sql/pglite@0.3.14
PGLITE_MODULE=/tmp/navoscope-db-check/node_modules/@electric-sql/pglite/dist/index.js node scripts/verify-market-db.mjs
```

This bootstraps fixture auth roles/tables in memory, applies the actual baseline and new migrations, and runs 12 checks. It verifies profile trigger/visibility, catalog permissions, persistence, rating and status constraints, identity protection, archive guard/restore, report immutability, cross-user read/write denial and anonymous denial. Fixture UUIDs are not credentials. It never reads `.env` or contacts hosted Supabase. PostgreSQL engine checks do not validate Supabase's deployed configuration, PostgREST behavior or real sessions.

## Hosted acceptance — maintainer/student to perform

- Use two real test users A and B after confirming actual email ownership.
- A saves an evaluation and report. Reload a new browser tab/session; retrieve both and check original ratings/notes/assumptions.
- B cannot read A's rows via the UI **or direct authenticated API queries**. Attempts to insert as A, change A's rows, or change ownership fail or affect zero rows. Do not log access tokens.
- An unauthenticated client cannot read evaluations/reports. A cannot modify the market catalog, delete records or update a saved report.
- Archive as A. A direct update to scores/notes fails, even if the same request changes status away from Archived. Restore status in a separate request, then edit successfully.
- Confirm row-level security is enabled on all new tables and owner policies are active; do not treat UI filtering as a security test.
- Test existing signup/display-name trigger and profile policies. Review any pre-existing policies that the migration did not alter; local source is not proof of current hosted policy state.

No administrator role was found. Normal users cannot self-elevate because this change adds no role field/control. If an admin management view is required by the tutor, confirm that scope and implement a server-controlled membership/policy design separately before claiming it is delivered.

## Hosted account-isolation check — completed, PASS

`scripts/sql/verify-hosted-isolation.sql` provides a rollback-only RLS check for the existing project's privileged Lovable SQL editor. It selects two existing profile IDs without displaying them, uses transaction-local authenticated/anonymous roles and request claims, verifies owner access and cross-user/anonymous denial, and deliberately rolls back every fixture write. It creates no accounts and reads no passwords. It requires at least two existing profiles and permission to switch roles.

The script was exercised against the isolated PostgreSQL test engine; fixture row counts were unchanged afterwards. The student ran it against the hosted project on 29 October 2026 and uploaded query-results-export-2026-10-29_15-26-59.csv, reporting PASS. The supplied export is retained as the evidence for this completed check; no rerun is required to record this result. Future regression runs should retain their own result or error. A successful result is `PASS`; any error means the check has not passed. This validates database policies under controlled SQL identities, not real JWT verification or browser account switching. Do not label browser isolation passed on this evidence alone.
