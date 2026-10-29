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

## Suggested personal reflection — confirm against my own experience

The following first-person wording is an AI-assisted proposal based on the recorded workflow. I need to review it and change any feeling or learning statement that does not reflect my experience before submitting it.

### What I found most difficult

The part I found most difficult was understanding how the personal GitHub fork, the original group repository, Lovable and the database were connected. At first, it was not obvious to me why code could be finished in one place while the original website still showed an older version. Checking the actual repository address in Lovable made the delivery path clearer. The many separate steps between implementation, database setup, preview and publication made this a more involved task than simply editing a page.

### A decision I made and why it mattered

When the Supabase project I opened did not match the existing application, I did not continue creating tables there. With guidance, I located the existing database inside Lovable, inspected its structure and then applied the supplied migration. This kept the work connected to the existing application rather than introducing a parallel database. My contribution here was carrying out and checking the integration steps, not independently writing the migration or application code.

### What I learned

A useful lesson for me is that code being committed, a pull request being merged, a preview working and a website being published are different milestones. I also have a clearer explanation for the difference between persistence and isolation: refreshing a page checks whether saved work remains available, while the database RLS test checks whether another identity can access records it should not see. The PASS export gives concrete evidence for the database check, rather than relying only on the appearance of the interface.

The scoring example also gives me a simple calculation I can explain during the demonstration. Raising demand from 3 to 5 adds 12 points because its weight is 30%, producing 72/100 when the other ratings remain at 3. I should be equally precise about the analysis feature: it generates a deterministic demonstration report, not verified research or a response from a live language model.

### What I would do differently next time

Next time, I would confirm the connected repository, database and publication workflow at the start. I would keep a short checklist separating implementation, integration, persistence, access control and publication, and save screenshots or result exports immediately after each check. That would make the final evidence easier to assemble and reduce confusion about what had actually been completed.

### My remaining responsibilities

Before the checkpoint deadline, I need to review this draft in my own words, capture any missing feature evidence, prepare and photograph the two paper diagrams, and rehearse the demonstration with the group. I also need to confirm actual team roles and tutor requirements. Specific teammate contributions, meetings and tutor feedback are not documented in this conversation, so I will add those details only after checking them with the team.
