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
- Accounts use the generated hosted SDK with private profiles created by an auth trigger; credentials remain only in the two-step signup component memory. Why: email ownership and cross-browser identity must be hosted, not trusted to browser-local demo records.
- Numbered pages 1–3 and their default alias live under the client-only authenticated layout; the persistent shell suppresses their curtain until a verified SDK user and profile are available. Why: direct loads must be gated without remounting the background video.
- Visual styles are the original CSS carried over in `src/styles.css`. Why: the imported app is the source of truth for the design.
