# Building reflection — student completion draft

Evidence basis: local implementation on 29 October 2026, documented in `week7-progress.md` and `verification.md`. This is a technical draft by Codex, not a statement of the student's personal experiences or team contributions.

## What was difficult

The existing numbered destinations were empty, while navigation, animation and auth lived in one persistent shell. Adding independent page shells would have risked remounting the background; the implementation renders the feature workspace inside the existing curtain. Persistence also needed enforcement beyond client-side filters, so the additive SQL migration includes ownership policies, rating constraints and archive protection.

Hosted validation is limited by the current cloud network policy and unapplied migration. Local database tests exercise PostgreSQL behavior but do not prove live Supabase/PostgREST integration. The original video uses a Lovable-specific resource path missing in this local environment. Existing lint debt remains.

**Student's own difficult moment and how I investigated it:** ___

## What changed during development

Three empty private destinations now contain market exploration, weighted evaluation and structured rule-based analysis. The new save layer reuses Supabase and does not fall back to fake browser-local accounts. Analysis explicitly discloses the absence of a model provider. Archived evaluations require a separate restore before content can change.

**What I personally changed, reviewed or rejected, with file/example evidence:** ___

## What worked and what did not

Automated scoring, discovery and component workflows passed. The isolated database checks confirmed owner isolation and archived protection in a disposable PostgreSQL engine. Build and type checks passed. Full lint fails on existing formatting issues; real hosted account/persistence acceptance remains outstanding. No deployment or physical submission was performed.

**My own browser observations, including a failure and correction if one occurred:** ___

## Learning prompts — not claims of learning

Explain in your own words why UI filtering is insufficient for data security, how the weights produce the displayed total, why report snapshots retain their original assumptions, and how an honest rule-based demonstration differs from an AI API call.

**My learning and evidence:** ___

## Remaining work / ownership

| Remaining task | Responsible person | Due (CST) |
|---|---|---|
| Apply additive migration and live two-user validation | Unassigned — confirm with team | 1 Nov 2026 23:59 |
| Rehearse actual-account demo and verify video | Unassigned — confirm with team | 1 Nov 2026 23:59 |
| Confirm tutor/platform and any admin-view requirement | Student / confirm named owner | 1 Nov 2026 23:59 |
| Complete personal Prompt Log / team evidence | Student / confirm named owner | 1 Nov 2026 23:59 |
| Prepare paper diagrams, take real photographs, submit | Student / confirm named owner | 1 Nov 2026 23:59 |

**Actual team allocation, meetings, tutor feedback and personal reflection:** ___
