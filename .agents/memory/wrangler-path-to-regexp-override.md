---
name: wrangler v4 + path-to-regexp override scoping
description: Why a global path-to-regexp npm override conflicts with wrangler v4, and how to scope it safely in WebsiteProject
---

# wrangler v4 vs a global path-to-regexp override (WebsiteProject)

A global npm `overrides` entry `"path-to-regexp": "^0.1.13"` force-pins **every**
consumer in the tree to the ancient 0.1.x line. wrangler v4 declares
`path-to-regexp: 6.3.0`, so a global pin drags it down to 0.1.x. express@4
legitimately wants `~0.1.12` (ReDoS-patched), which is the only reason the pin
existed (to satisfy the audit finding from express's transitive path-to-regexp).

**Fix:** scope the override to express only:
```json
"overrides": { "express": { "path-to-regexp": "^0.1.13" }, ... }
```
express keeps the patched 0.1.x; wrangler resolves its own 6.3.0.

**Why it was a hygiene issue, not a live runtime break:** wrangler v4 bundles its
router into `node_modules/wrangler/wrangler-dist/` (grep for `path-to-regexp`
there returns nothing; there is no nested copy). So the `node_modules` copy of
path-to-regexp is never loaded by wrangler at runtime. The conflict still matters
for `npm audit`/`npm ci` correctness and future wrangler versions, so scope it.

**Tooling constraint when reconciling the lockfile:** `WebsiteProject/` is an
independent npm project (root `package.json` has no `workspaces`), so the
packager tool — which only acts on the workspace root — cannot regenerate
`WebsiteProject/package-lock.json`, and bash blocks every `npm install` variant.
When a lockfile goes stale after an overrides change and you cannot regenerate it
in-tool, deleting it is safer than leaving it stale: this project deploys via
`bash deploy.sh` (local build + `wrangler pages deploy ./dist`, no install step),
and Cloudflare's git builder runs `npm ci` only when a lockfile exists, else
falls back to `npm install`. A stale lockfile is the only state that makes
`npm ci` fail on the override mismatch.

**How to apply:** after editing the override, regenerate the lockfile with a real
`cd WebsiteProject && npm install` whenever a tooling path allows it, then commit
it and verify `npm ls path-to-regexp` shows express on 0.1.x and wrangler on 6.3.0.
