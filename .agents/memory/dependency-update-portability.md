---
name: Dependency update portability
description: Deployment checks needed after dependency updates performed in Replit.
---
Dependency updates must leave committed lockfiles usable outside Replit and remain compatible with the deployed runtime.

**Why:** The package installer can write private Replit registry tarball URLs into lockfiles. A patch-level parent update can also raise the Node minimum through a transitive dependency, even when the parent package's own engine declaration does not change.

**How to apply:** After installation, check changed tarball URLs and use public npm URLs with unchanged integrity hashes for externally deployed packages. Compare transitive engine requirements with the deployment's pinned Node version, not just the workspace runtime.

For security updates, preserve the workspace's minimum release age when an older eligible release already fixes every requested advisory.

**Why:** A same-day latest release may be blocked by pnpm even though an eligible patch release contains all required fixes. Disabling the safety rule is unnecessary in that case.

**How to apply:** Check advisory fixed-version ranges and publication dates, then choose the newest eligible patched release rather than adding a release-age exception.

Check narrowly targeted pnpm updates for unrelated override and peer-resolution changes.

**Why:** A recursive transitive update can also re-resolve existing range-based overrides, upgrading unrelated packages and rewriting their peer snapshots.

**How to apply:** Inspect the entire lockfile diff, preserve unrelated resolutions, and verify the resulting lockfile with a frozen install before testing.

Verify the advisory's attack scenarios directly rather than relying solely on its first-patched-version label.

**Why:** A release marked fixed for the PostCSS source-map advisory blocked directory traversal but still disclosed absolute-path maps when the input filename was omitted.

**How to apply:** Exercise the described edge cases against the installed release. If a partial fix remains, choose an eligible newer patch and verify again.

Do not use the project's DOM emulators as the sole evidence for sanitizer browser compatibility.

**Why:** Happy DOM discarded benign content during DOMPurify smoke tests, while the installed jsdom could not start because its expected Undici internals were absent. The actual legal-page browser preview rendered normally.

**How to apply:** Check the browser-rendered page and CDN integrity independently. If sanitizer assertions fail only in an emulator, investigate the emulator rather than changing sanitizer configuration or weakening assertions.
