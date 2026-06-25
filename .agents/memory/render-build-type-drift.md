---
name: render-automailer build type drift (local passes, Render fails)
description: Why render-automailer tsc can fail on Render but pass locally, and how to avoid the round-trip
---

render-automailer pins `express@^4` (runtime) but `@types/express@^5` (types) and ships **no `package-lock.json`**.

**Symptom:** Render build fails with e.g. `error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'` on Express handler lines (`req.params.*`, `req.query.*`), while the local Replit `npm run build` passes cleanly.

**Why:** caret ranges + missing lockfile make type resolution non-deterministic. Render's fresh `npm install` pulls newer `@types/express@5`, where route param/query values widen to `string | string[]`. The Replit workspace's already-installed `node_modules` resolved an older/narrower typing, so local `tsc` never sees the error. A clean local build therefore does NOT guarantee Render will compile.

**How to apply:**
- When touching Express handlers in `render-automailer`, coerce request-derived values: `String(req.params.x)`, and cast headers `as string`. Don't pass `req.params.*` / `req.query.*` straight into `string` params.
- `tsc` lists *all* errors, so if Render reports only one line, fixing just that line is enough.
- Render redeploys only from the GitHub repo `troostsa-a11y/devocean-backend` (branch `main`, `rootDir: render-automailer`). Code merged into the Replit workspace must be pushed to that repo (main agent cannot run git — user pushes via Replit Git pane or a background task). Setting Render env vars alone rebuilds the *old* commit.
- Durable fix to eliminate the drift entirely: commit a `package-lock.json` (and/or align `@types/express` to v4 to match the v4 runtime) so local and Render resolve identical types.
