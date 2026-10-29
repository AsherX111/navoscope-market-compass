# Checkpoint 2 demonstration script

Deadline: **Sunday 1 November 2026, 23:59 China Standard Time**. This is a repeatable acceptance script, not a claim the hosted demo has already passed. Use an actual test account you control; no credentials are supplied or invented here.

## Prerequisites

1. Maintainer reviews `database-setup.md` and applies the additive migration to the existing project, then verifies policies.
2. Save/apply the cloud network requirement for the existing Supabase host if running from this environment. Recheck connectivity. Do not disable TLS.
3. Log in using an actual test account or complete hosted signup, email confirmation and the existing display-name step. Do not enter production credentials into classroom demos.
4. Start with `npm run dev -- --host 0.0.0.0 --port 3000` or inspect the approved Lovable deployment after the maintainer explicitly authorizes deployment. This task did not publish it.

## Approximately five-minute journey

1. **Landing/auth (30 s):** show the original homepage and three numbered buttons. Log in; show the account initials. Explain that a homepage/login alone is not counted as a feature.
2. **Explore (60 s):** open 1 / Explore. Search `cooling`, filter Energy / Asia Pacific / minimum 15%, show the single matching illustrative market. Clear filters and sort by estimated size, then growth; verify the ordering changes. Open cooling details and show risks and the illustrative-data disclosure. Choose Evaluate this market.
3. **Score (60 s):** on 2 / Score, change demand from 3 to 5, keeping other inputs 3; total becomes 72. Show weighted contributions and Expand recommendation. Change risk resilience to 1; explain the Protect gate. Add notes; set Scored; save and wait for the real cloud-success message. Record actual result: ___
4. **Analyse (60 s):** go to 3 / Analyse. Confirm the selected market/ratings, enter a specific business assumption, generate the demo analysis, and read summary, strengths, risks, fit, gaps and actions. Explicitly say this is rule-based, with no language model call. Save the report and wait for cloud success. Record actual result: ___
5. **Persistence/status (60 s):** refresh, reselect the market, open the saved report and evaluation, and verify original notes, ratings, assumptions and category. Change status to Reviewed and save. Archive, confirm inputs become disabled, then restore by saving Researching before editing. Filter saved evaluations by status and sort by score. Record actual result: ___
6. **Model/stack (30 s):** show the diagrams. Explain profiles → own evaluations/analyses, market references, RLS and immutable report snapshots. Mention React/TypeScript/TanStack/Vite + Supabase + existing Lovable workflow.

## Required verification outside the short demo

- Two real test accounts: A's records are invisible to B. Test direct API reads and writes as B (not only hidden UI). Anonymous requests cannot access private records. Never expose tokens in screenshots/logs.
- Logout and browser back/forward cannot reveal A's workspace to another user. Direct numbered routes without login return to login.
- Invalid/empty assumptions, failed storage requests and no-match filters show appropriate messages. No save-success message appears on failure.
- Check keyboard navigation, phone layout, display-name signup, email confirmation, login, password reset, avatar and logout. Verify the real video in the intended hosting environment.
- Capture only actual evidence. Prepare two paper diagrams and photograph them yourself. Complete the student fields in Prompt Log/reflection and confirm team ownership/tutor requirements.

If hosted storage still fails, demonstrate the unsaved calculation and clearly identify the blocker; do not present it as a completed persistence acceptance test.
