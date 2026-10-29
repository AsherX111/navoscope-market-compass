# Week 7 Evidence Pack and Figure Captions

All captions are in English. Capture actual screens; do not use mockups or AI-generated screenshots as evidence. This pack distinguishes supplied visual evidence, uploaded database exports and student-reported checks. Personal identifiers and credentials should be cropped or redacted from submission copies.

## Recommended figures

| Figure / suggested filename | What to capture | Current evidence | Ready-to-use English caption | Limit |
|---|---|---|---|---|
| 01-market-explorer.png | Explorer with search/filter controls and market cards; preferably one filtered result and visible controls | Explorer screenshot supplied in chat shows six markets and controls; filtered-result capture still needed | Market Explorer displays clearly labelled illustrative opportunities with search, industry, region and growth filters, sorting, and market details. | A screenshot of controls alone does not prove every interaction works. |
| 02-opportunity-score-72.png | Demand rating 5, other ratings 3, total 72 and weighted breakdown together | Supplied Lovable screenshot shows the 72/100 result and breakdown | Increasing Demand potential from 3 to 5, while retaining the other ratings at 3, changes the weighted opportunity score from 60 to 72 out of 100. | This screenshot proves the displayed calculation, not persistence. |
| 03-evaluation-after-refresh.png | Selected market, saved note/status and 72 score after refresh; a short screen recording can show the refresh | Student confirmed persistence; a dedicated after-refresh capture is not supplied | A saved evaluation was retrieved after refreshing the Lovable preview, retaining its score, status and research notes. | Only use this caption with a capture you actually take during that sequence. |
| 04-demo-analysis-report.png | Market identity, explicit rule-based label, assumptions, structured report and saved history | Student reported success; report image still needed | The selected market's rule-based demo report records assumptions, strengths, risks, evidence gaps and recommendations. No language model is called. | Do not describe it as live AI output. |
| 05-archive-restore.png | Archived status with disabled content inputs; second capture after restore | Student reported success; screenshots still needed | Archived evaluations are read-only in the interface; an explicit saved status restoration enables editing again. | UI screenshots do not by themselves test direct API enforcement. |
| 06-database-tables-rls.png | SQL result listing all four tables and true RLS flags | Uploaded table/RLS CSV is included in this pack | The existing hosted project contains profiles, markets, opportunity_evaluations and market_analyses, with Row Level Security enabled on all four tables. | RLS enabled is not sufficient alone to prove correct policy behaviour. |
| 07-account-isolation-pass.png | Lovable SQL result with PASS, details and scope; hide unrelated data | Uploaded hosted isolation PASS CSV is included | The hosted database RLS account-isolation check passed owner access, cross-user read/write denial, anonymous denial and rollback of test fixtures. | Controlled SQL identities; browser login and JWT validation are outside this test. |
| 08-github-merged-pr.png | Original AsherX111 PR with purple Merged state and source/target repositories | Screenshot supplied in chat | The feature implementation was integrated from the personal fork into the original repository through a merged pull request. | A merged PR does not prove publication or tutor review. |
| 09-lovable-published.png | Lovable message “Your website was updated” and site address | Screenshot supplied in chat | Lovable confirmed that the Navoscope website was updated at navoscope-market-compass.lovable.app. | Publication confirmation; a separate public-site functional check is not yet recorded. |
| 10-team-kanban.png | Actual updated team board or rendered task ledger with honest ownership/status | Repository ledger exists; real team allocation still needs confirmation | The Week 7 task ledger records implementation, testing, evidence preparation and remaining work, with status and dependencies. | Label it a repository ledger unless an actual team board was used. |
| 11-data-model-paper.jpg | Photograph of the actual paper data-model diagram | Not yet supplied | Paper data-model diagram showing users/profiles, markets, owner-scoped evaluations and immutable analysis snapshots. | Must be an actual student-taken photograph, not a PDF or generated image. |
| 12-application-flow-paper.jpg | Photograph of the actual paper application-flow diagram | Not yet supplied | Paper application-flow diagram tracing authentication, market discovery, scoring, analysis generation and saved-record retrieval. | Must be an actual student-taken photograph. |

## Which existing images to use first

Save the original images already sent in chat: the Explorer screen; the scoring screen showing 72/100; the upstream Merged PR screen; and the final “Your website was updated” screen. These are actual supplied images. They are not available as local image files in the execution workspace, so this download pack does not claim to contain copies of them. Download/save them from the chat or capture the same screens again.

For the two database figures, reopen the existing results or CSV exports and take actual screenshots. Keep the CSV originals as supporting machine-readable evidence. Do not rerun the migration to obtain another screenshot. The rollback-only isolation check can be rerun for a fresh regression result if needed, but the supplied PASS export already records its completed run.

## Printing the required diagrams

Use `week7-print-diagrams.pdf` in the download pack: page 1 is the data model, page 2 is the application flow. Print or redraw them as required by the tutor, check readability, then take the two physical photographs yourself. The PDF is preparation material, not proof that physical submission was completed.

## Suggested submission order

1. Project URL and a brief explanation of the three features.
2. Feature figures 01–05, supported by actual interaction/refresh recordings where available.
3. Database and isolation figures 06–07, with CSV exports if accepted.
4. Integration/publication figures 08–09.
5. Kanban/task evidence and the two paper-diagram photographs.
6. Four-column Prompt Log, stack rationale and reviewed individual reflection.

Do not state that unprovided screenshots, meetings, tutor approval, teammate work, personal learning or public-site acceptance have already occurred.
