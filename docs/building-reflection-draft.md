# Week 7 Individual Building Reflection — Draft for Student Review

Project: Navoscope Market Compass
Checkpoint: Week 7 / Checkpoint 2
Date: 29 October 2026
Student name / ID: [Complete personally]

This English draft was prepared with Codex from the student's recorded actions and supplied evidence. The student should review it, correct anything that does not match their experience, and complete the personal-learning fields. It does not claim independent authorship of AI-generated code.

## My contribution and the outcome

During Week 7, I worked on moving Navoscope from an existing landing and authentication experience towards three usable market-intelligence workflows. Codex implemented Market Explorer, Opportunity Scoring and a clearly labelled rule-based analysis feature. My recorded contribution was to coordinate the GitHub-to-Lovable integration, execute the supplied database scripts in the existing project, and perform guided checks in the Lovable preview.

I created the cross-fork pull request and merged the feature changes into the original AsherX111 repository after reviewing the integration path. I opened the updated preview and checked the new interface. I also completed the Lovable publication steps and supplied a screenshot stating “Your website was updated.” This confirms the platform's publication completion, although a separate post-publication acceptance run on the public URL has not been recorded.

## A difficulty I encountered and how it was resolved

An important difficulty was understanding which repository and database belonged to the running application. The code changes were initially in my personal GitHub fork, while the original Lovable project was connected to AsherX111/navoscope-market-compass. I opened Lovable's Git settings and confirmed the repository address. This explained why changes in my fork would not automatically appear in the original project. The solution was a cross-fork pull request into the repository that Lovable actually synchronises with, rather than changing the project's connection or creating another application.

A similar issue arose with the database. The Supabase dashboard I opened showed a different project. Instead of creating tables there, I navigated to the existing Lovable project's Database and SQL editor. I ran a read-only inspection and supplied its exported results before applying the additive migration. This preserved the existing profiles and authentication architecture.

## What I checked

For Opportunity Scoring, I followed the guided example of changing Demand potential from 3 to 5 while keeping the other ratings at 3. The expected total was 72/100. I saved the evaluation and confirmed that the score, status and notes remained after refreshing the preview. I also reported successful report generation/save/retrieval and archive/restore checks. Those latter confirmations were brief replies; they should not be presented as independently captured browser test reports.

For data access, I executed the supplied rollback-only SQL test in the existing Lovable database and exported the result. It reported PASS for owner access, cross-user read/write denial, anonymous denial and fixture rollback. Therefore, my account-isolation result is PASS at the hosted database RLS level. The script uses controlled SQL identities; it does not test browser account switching or JWT validation.

The automated implementation checks were performed by Codex: 25 application tests, 12 original isolated PostgreSQL checks, TypeScript, the production build, focused lint and four unauthenticated Chromium smoke checks passed. I did not personally write or execute those automated suites. Full-repository lint still has existing issues.

## Technical points I can explain from this work

The scoring formula is transparent: each rating is divided by 5, multiplied by its criterion weight and by 100, then summed. Raising demand from 3 to 5 adds 12 points because demand has a 30% weight. Saved report snapshots retain the ratings and assumptions used at generation time, so later evaluation edits should not rewrite a previous report.

The application uses illustrative market data and deterministic rule-based reports. I should describe it as a demo analysis feature, rather than claim it called a language model or produced verified market research. RLS provides a database-level ownership boundary; hiding records in the interface alone would not establish data isolation.

These are technical explanations supported by the implementation, not a substitute for my personal reflection. My own learning should be completed below.

## What remains and what I would improve

The core workflows are implemented and the hosted database isolation check passed. Remaining evidence work includes a public-site smoke check after publication, stronger captured evidence for report retrieval and archive/restore, the two actual paper-diagram photographs, and confirmed team roles and tutor requirements. There is no administrator management view or live language-model provider in this implementation. Neither should be claimed as completed. Existing lint debt should be prioritised separately from this checkpoint's functional work.

## Personal completion fields

- The part I personally found most difficult, and why: [Complete in my own words.]
- A correction or decision I made myself, with evidence: [Complete; do not invent a code fix.]
- What I learned and can now do independently: [Complete in my own words.]
- How I worked with named teammates: [Confirm actual names, roles and interactions.]
- My remaining responsibilities and planned completion time: [Complete before 1 November 2026, 23:59 CST.]
