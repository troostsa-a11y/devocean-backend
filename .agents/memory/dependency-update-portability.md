---
name: Dependency update portability
description: Deployment checks needed after dependency updates performed in Replit.
---
Dependency updates must leave committed lockfiles usable outside Replit and remain compatible with the deployed runtime.

**Why:** The package installer can write private Replit registry tarball URLs into lockfiles. A patch-level parent update can also raise the Node minimum through a transitive dependency, even when the parent package's own engine declaration does not change.

**How to apply:** After installation, check changed tarball URLs and use public npm URLs with unchanged integrity hashes for externally deployed packages. Compare transitive engine requirements with the deployment's pinned Node version, not just the workspace runtime.
