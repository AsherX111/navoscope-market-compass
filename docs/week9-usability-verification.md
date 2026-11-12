# Week 9 usability verification

## Changes
- Public introduction now describes existing signed-in DeepSeek Q&A, reference-file upload and report generation, with AI verification and data-sharing disclosures.
- Existing Explorer CTA is unchanged; guest scoring anchor and team-provided UnoAnalyzer feedback link were added. Feedback opens in a new tab with `noopener noreferrer` and an accessible new-tab notice.
- European heat pumps is an isolated, unsaved public guest example. Initial ratings are 5/3/3/3/3, total 72/100. All five selectors offer integer ratings 1–5. Weighted points and total use the existing weights and model.
- Shared criterion help now uses plain English in both public and signed-in scoring. Existing accounts, saved records, routes, persistent shell and DeepSeek implementation were not modified.
- Homepage and shared metadata no longer falsely claim that no live model is used.

## Observed results — 2026-11-12
- `bunx vitest run`: 55 tests passed across seven files, including eight new guest scoring cases covering starting values, each criterion's contribution, 20/100 and 100/100 bounds, and state isolation.
- Targeted ESLint: passed for all changed TypeScript files.
- Automatic preview build: `build OK` in `/tmp/observability/build-errors.log`. No separate manual production build or typecheck was run; these are managed by the project harness.
- Playwright public flow: guest anchor scrolls within the page, score changes 72 → 48 → 100, Explorer redirects signed-out visitors to login, and the video element persists.
- Feedback href exactly matches the team URL; its new-tab and safe link attributes were checked. No feedback was submitted.
- Desktop 1280×1800 and mobile 375×812 / 320×740: no horizontal overflow. Screenshots confirm readable guest controls and criterion help.
- Authenticated `/page-2`: existing saved-work loading completed; all five shared criterion explanations rendered. Public introduction remained hidden and inert. No evaluation save or DeepSeek request was made.
- No uncaught browser errors in the tested flow.

## Not claimed
No publication, external feedback submission, new DeepSeek request, email delivery test, or new saved-record write was performed. Video element persistence was verified; actual video playback was not newly verified in the headless browser.