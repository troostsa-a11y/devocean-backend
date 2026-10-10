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

**Tooling constraint when reconciling independent npm projects:** The package
installer acts on the workspace root, not on independent subprojects.
Preserve subproject lockfiles instead of deleting them to get around that limitation.

**Why:** Removing a lockfile allows unrelated dependency changes at deployment
and weakens the reproducibility of a narrowly scoped security update.
The shell permits `npm ci` for clean-install validation in the independent website project.

**How to apply:** Synchronize affected lockfile metadata with trusted package-manager
output, preserve unrelated resolutions, and verify with a clean `npm ci`.
Check `npm ls` to confirm that overrides resolve the intended dependency tree.

## Narrow dependency reinstalls

When using the root package installer to apply a transitive override, reinstall
the parent at its exact currently locked version, not a caret range. The installer
requires at least one package; an empty package list cannot refresh the tree.

**Why:** reinstalling a parent with a caret range can upgrade that parent and
its other dependencies, expanding an otherwise narrow security patch.

**How to apply:** read the parent's locked version first, request that exact
version, and verify the final manifest and lockfile diff contains only intended
changes.
