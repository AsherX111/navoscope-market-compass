<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Navoscope
- The whole Navoscope UI (video, nav, curtain, auth dialog) is one persistent shell rendered in `__root.tsx`; route files only supply head() and return null. Why: the background video must keep playing across route changes.
- Demo accounts are browser-local only (localStorage + PBKDF2, see `src/lib/navoscope-accounts.ts`); no backend. Why: the source app is a browser-only demo by design.
- Visual styles are the original CSS carried over in `src/styles.css`. Why: the imported app is the source of truth for the design.
