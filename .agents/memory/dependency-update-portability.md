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

An advisory can remain in the installed dependency tree after committed lockfiles already contain its fix.

**Why:** Independent website and pnpm installations can retain older packages after another dependency update changes their lockfiles. Filtered pnpm adds can also remove old packages while leaving other consumers' symlinks pointing at the removed resolution; a successful filtered install does not prove the full workspace can run.

**How to apply:** Compare installed consumer-resolved versions with lockfiles before updating manifests. Refresh stale trees with clean or whole-workspace frozen installs after a filtered add when other consumers' links are stale, and run attack regressions against the actual installed copies.

Check narrowly targeted pnpm updates for unrelated override and peer-resolution changes.

**Why:** A recursive transitive update can also re-resolve existing range-based overrides, upgrading unrelated packages and rewriting their peer snapshots.

**How to apply:** Inspect the entire lockfile diff, preserve unrelated resolutions, and verify the resulting lockfile with a frozen install before testing.

Preserving unrelated lockfile resolutions still requires matching the new release's published metadata exactly.

**Why:** Even a patch release can change an optional peer from an exact version to a range; globally replacing version strings can create metadata that differs from the registry.

**How to apply:** Compare dependency and peer declarations with the actual new package metadata, not only its version and integrity. Verify both package managers can install their committed lockfiles.

A direct Vite update does not necessarily update the Vite copy consumed by Vitest.

**Why:** pnpm can retain an older Vite resolution under Vitest while updating the frontend importers, and can also upgrade optional peers unrelated to the requested security fix.

**How to apply:** Check every Vite package and snapshot in the lockfile, resolve Vite from each actual consumer, and preserve unrelated peer versions.

Do not reconstruct large lockfiles from unchecked shell callback output.

**Why:** Large output can be bounded even when the callback result does not signal truncation; accepting that output as complete can silently discard the beginning of a file.

**How to apply:** Use file reads or bounded chunks and verify the complete byte count before writing a reconstructed file; confirm the final lockfile with a frozen install.

Verify the advisory's attack scenarios directly rather than relying solely on its first-patched-version label.

**Why:** A release marked fixed for the PostCSS source-map advisory blocked directory traversal but still disclosed absolute-path maps when the input filename was omitted.

**How to apply:** Exercise the described edge cases against the installed release. If a partial fix remains, choose an eligible newer patch and verify again.

Do not use the project's DOM emulators as the sole evidence for sanitizer browser compatibility.

**Why:** Happy DOM discarded benign content during DOMPurify smoke tests, while the installed jsdom could not start because its expected Undici internals were absent. The actual legal-page browser preview rendered normally.

**How to apply:** Check the browser-rendered page and CDN integrity independently. If sanitizer assertions fail only in an emulator, investigate the emulator rather than changing sanitizer configuration or weakening assertions.

Sanitizer attack tests need benign positive controls separate from expression-bearing text nodes.

**Why:** Safe-for-template rules can intentionally strip from an expression opener to the end of its text node. Requiring that node's suffix to survive mislabels defensive behavior as a failure; accepting completely empty output can instead hide a parser problem.

**How to apply:** Assert that independent safe elements survive alongside the attack being removed. Split both opening and closing delimiters across nodes when testing post-normalization protection, so per-node stripping cannot make the regression pass accidentally.

Selector-parser security fixes may require crossing the major-version range used by Tailwind consumers.

**Why:** The legacy 6.x patch fixes recursive serialization, but the flat-selector CPU-exhaustion fix is available only in 7.1.6 or later.

**How to apply:** Check all requested advisories before selecting a legacy patch. When overriding a consumer's major range, verify representative selectors and production CSS builds as well as attack regressions.

For local security patches, verify both unified-diff validity and the installed patched source, then run the attack regression against the actual consumer's dependency.

**Why:** pnpm can finish a frozen install with a malformed patch without applying every intended change. Node's ancestor resolution can also accidentally test the root npm dependency instead of the workspace's patched copy.

**How to apply:** Check the patch with `git apply --check` against pristine source, assert that every guard is installed, and resolve the dependency from its locked pnpm patch identity or its real consumer.

A pnpm frozen install can reuse an unpatched cached package even under its patched store identity.

**Why:** A regular frozen install created the expected patch-hash directory but its files still lacked the committed guards. A forced frozen reinstall applied them correctly.

**How to apply:** If a valid committed patch is missing from installed source after a frozen install, force a whole-workspace frozen reinstall and rerun installed-source and attack checks; do not assume the patch-hash directory proves the mitigation is present.

For streaming-parser regressions, a successful HTTP response is not proof that the server survives the request.

**Why:** A decompressor can finish a valid frame and allow a response before later input triggers a fatal, unhandled stream error. An exception handler in the test process can conceal that failure mode.

**How to apply:** Exercise real HTTP chunk boundaries in an isolated child without an uncaught-exception handler, verify a subsequent health request, and bound both network and child-process timeouts.
