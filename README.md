# Navoscope Market Compass

Import the attached Navoscope source ZIP as a Lovable project. The existing app is the source of truth for copy, page count, visual design, and interaction logic. Rebuild it in Lovable’s supported stack without adding features, buttons, placeholder marketing sections, or alternative copy.

Acceptance criteria:
1. Homepage: use the supplied assets/navoscope-loop.mp4 as a muted, looping, full-viewport background over black. Preserve the silver particle ribbon, dark editorial style, and visible text “Navoscope”, “See clearly. Move forward.”, and “AI-assisted market intelligence.”
2. Keep exactly four centered navigation buttons 1, 2, 3, 4 and the top-right “Log in / Create account” control on the homepage. Each numbered page needs a direct URL. On a numbered page, replace its number with “Main Page” at the far left; show the other three numbers in original order. The account control appears only on the homepage.
3. Entering a numbered page raises the translucent frosted-glass curtain from the bottom. The homepage video keeps moving behind it. Return to homepage restores original navigation order. Respect reduced-motion preferences.
4. Preserve the login dialog, create-account dialog and user-name step. Signup asks for email or phone and password first, then user name; no full name. After creation, return to login. After login, show a circular avatar with initials from the first two name parts, or one initial for a single-part name. Avatar menu contains only “Log out”; logout returns to the initial homepage.
5. Preserve the existing browser-local demonstration behavior for accounts and its notice that test accounts are stored only in this browser. Do not imply production authentication, request real credentials, or connect a backend.
6. Preserve keyboard accessibility, responsive layout, direct route loading and status/error messages. Check homepage, all four numbered pages, signup, login, avatar, logout and browser back/forward.

First report what was imported and any differences you could not preserve. Do not publish automatically; wait for inspection.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://navoscope-market-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cf5b745f-4fed-4118-84ee-65ba3c3c2db8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
