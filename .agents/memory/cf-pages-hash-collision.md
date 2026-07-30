---
name: CF Pages asset hash collision
description: Wrangler skips uploading files whose hash already exists in CF Pages' store — even if the local file content differs from what was previously stored under that hash.
---

## The rule
When `wrangler pages deploy` reports "0 files (N already uploaded)", it matched every filename by hash and skipped all uploads. If a previous deployment uploaded a file with the same Vite hash but different content (e.g. an older Header.jsx that happened to produce the same truncated hash), CF Pages silently serves the stale version.

**Why:** CF Pages uses the content-addressed filename as the dedupe key. It does not re-verify content against what was stored. So a hash collision between two different builds causes the old content to persist indefinitely — even across new deployments.

**How to detect:** Production visual looks different from dev despite the deploy reporting success and all checks passing.

**Fix:** Make a trivial whitespace or no-op change to the file that produced the colliding chunk (e.g. App.jsx or Header.jsx), rebuild, and redeploy. This forces Vite to generate a new hash, giving the file a new filename that has never been uploaded, which forces wrangler to actually upload the correct content.
