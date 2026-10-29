# Kanban evidence — 29 October 2026

This is a repository work ledger, not a claim that a team board, meeting or tutor review occurred. Dates below record this implementation session or explicit plans. Deadline: **1 November 2026, 23:59 China Standard Time (UTC+8)**. Team ownership must be confirmed by the student.

| Task | Owner | Status | Start / planned date | Due (CST) | Evidence | Dependencies / blockers |
|---|---|---|---|---|---|---|
| Inspect existing app, routes, profiles and scripts | Codex; student review pending | Done | 29 Oct 2026 actual | 1 Nov 23:59 | Existing AGENTS.md, routes, baseline migration; week7-progress.md | Hosted inspection limited by network |
| Market Explorer search/filter/sort/details | Codex; team owner unassigned | Done | 29 Oct actual | 1 Nov 23:59 | model.ts, MarketWorkspace.tsx, market tests | Illustrative data only |
| Weighted scoring and recommendation | Codex; team owner unassigned | Done | 29 Oct actual | 1 Nov 23:59 | model.ts, unit and interaction tests | User should verify criteria |
| Cloud save/update/retrieval and archived protection | Codex; maintainer unassigned | Testing | 29 Oct actual | 1 Nov 23:59 | storage.ts; 0001 migration; isolated DB checks | Migration applied; hosted database account-isolation test passed; other browser acceptance separate |
| Rule-based market analysis and saved reports | Codex; team owner unassigned | Testing | 29 Oct actual | 1 Nov 23:59 | model.ts; workspace report and retrieval tests | Student reported guided preview retrieval; independent verification pending |
| Preserve hosted auth and verify sign-in/signup | Unassigned — confirm with team | Testing | 29 Oct actual inspection | 1 Nov 23:59 | Existing auth unchanged; unauthenticated Chromium checks | Actual test account and Supabase connectivity |
| Live database account-isolation verification | Student execution; Codex script | Done | 29 Oct 2026 actual | 1 Nov 23:59 | query-results-export-2026-10-29_15-26-59.csv; verify-hosted-isolation.sql | PASS at database RLS level; browser/JWT checks outside scope |
| Administrator role/view, if tutor requires it | Unassigned — confirm with team | Backlog | 30 Oct planned | 1 Nov 23:59 | No roles exist; scope limitation recorded | Confirm requirement; secure role model needed |
| Automated checks and browser smoke checks | Codex; student review pending | Done | 29 Oct actual | 1 Nov 23:59 | verification.md | Authenticated hosted browser checks remain separate |
| Data and flow diagrams / print layout | Codex; student review pending | Done | 29 Oct actual | 1 Nov 23:59 | data-model.md; application-flow.md; print-diagrams.html | Student must print/draw and photograph |
| Tech rationale, log and reflection draft | Codex; student completion pending | Done | 29 Oct actual | 1 Nov 23:59 | Coursework documents in docs/ | Student reflection and contributions not invented |
| Restore/verify original video asset | Unassigned — confirm with team | Backlog | 30 Oct planned | 1 Nov 23:59 | Local original resource URL returns 404 | Obtain original asset / validate on Lovable |
| Rehearse authenticated demonstration | Unassigned — confirm with team | Backlog | 31 Oct planned | 1 Nov 23:59 | demo-script.md | Live migration, account and dataset readiness |
| Tutor confirmation, paper photos and submission | Student; team owner unassigned | Backlog | 31 Oct planned | 1 Nov 23:59 | print layout and final checklist | Physical/student actions; no completion claimed |

“Done” describes the named code/artifact task and its recorded checks; it does not certify a hosted deployment, a completed team contribution, or final checkpoint acceptance.

## Subsequent student actions

On 29 October the student applied the migration and exported the resulting table/RLS state, merged upstream PR #1, opened the integrated Lovable preview, confirmed evaluation persistence after refresh, and reported report retrieval and archive/restore success. Hosted account isolation was initially deferred and subsequently completed with PASS through the database RLS check. Publication for team viewing is now authorised but not confirmed. No teammate assignment, tutor approval, personal learning narrative or physical submission has been inferred.

Subsequent hosted RLS result: the student supplied query-results-export-2026-10-29_15-26-59.csv reporting PASS for the rollback-only SQL check. Database owner access, cross-user read/write denial, anonymous denial and fixture rollback passed. Browser account switching and JWT verification are separate and remain untested.
