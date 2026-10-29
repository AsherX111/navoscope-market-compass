# Technology stack rationale

## Actual implementation

- React 19 and TypeScript implement interactive forms and report views. Vite 8 handles development and bundling; TanStack Start / React Router provide the existing application shell, file routing, client-only private layout and SSR boundary.
- Existing TanStack Query supports the application's authentication-related cache lifecycle. The new small workspace uses React state and the existing Supabase SDK directly rather than adding another data framework.
- Supabase JS provides hosted email/password authentication and PostgreSQL access. Profiles and signup handling already existed. New SQL migrations add markets, owner-scoped evaluations and report snapshots, with RLS. The presence of code and a tracked configuration file does not prove hosted migration or end-to-end login readiness.
- Existing dependencies include Radix UI, Tailwind and Lucide. The new work reuses the original CSS and adds scoped monochrome workspace styles; no application dependency was added.
- The existing Lovable project remains the editing/hosting workflow, using `@lovable.dev/vite-tanstack-config`, TanStack Start and Nitro. Changes in this local working branch have not been pushed, deployed or published. Published-branch history must not be rewritten.
- Vitest, Testing Library, jsdom, TypeScript and ESLint provide checks. Disposable PGlite and Playwright tooling was installed outside the repository for database and Chromium validation, respectively; neither is a new production dependency.

## Why this fits the MVP

This preserves the existing visual design and hosting investment. React supports the three interactive features; TypeScript makes rating and record shapes explicit; Supabase retains a single identity/database model and enforces ownership independently of UI filtering. SQL constraints and triggers protect invalid ratings and archived data. Bundling six clearly labelled illustrative markets makes the classroom exploration reproducible without a paid research-data feed.

The deterministic analysis fallback is transparent, reproducible and does not require a provider key. It cannot perform original research or general language-model reasoning. Scores and recommendations reflect user judgments and invented teaching scenarios; they are not investment advice.

## Alternatives and limits

Base44, bolt.new and Luna-Park are course-listed alternatives, not tools tested during this task. Migrating would introduce platform and data migration risk with little checkpoint benefit; keeping Lovable avoids unnecessary change. A custom API/database deployment could allow more control but adds hosting, operational and authentication work. Browser-local storage would simplify a prototype but would not provide the required hosted identity and RLS isolation, so it was not used as a persistence substitute.

Remaining dependencies: existing Supabase service and public configuration; the additive migration; network access; an actual student-controlled test account; and the original Lovable video-resource route (404 in this local environment). The tracked `.env` is a repository hygiene risk: keep all privileged credentials out of Git and review classification/history securely without printing or copying its values. No credentials were rotated.

## Enabling real AI in a later change

No working AI provider integration or provider credential was found in the inspected implementation/runtime names. The current feature calls no model. To add one, choose a provider and model, provision the credential securely on a server/Edge Function, authenticate each request, enforce rate/usage limits, validate market/rating inputs and structured outputs, and store provider/model/provenance metadata alongside reports. Never put a provider secret in a `VITE_*` variable or browser bundle. Keep the explicit demo fallback/error handling. Provider configuration alone will not enable AI: a server integration and tests are still required.

Tutor approval/platform confirmation is a student task; no tutor approval or migration approval is claimed.
