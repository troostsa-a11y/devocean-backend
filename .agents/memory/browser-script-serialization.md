---
name: Browser script serialization
description: Cloudflare compilation can introduce hidden dependencies into functions serialized for early browser execution.
---

Functions serialized into browser HTML must remain self-contained after the actual Cloudflare compilation, not just when imported directly in unit tests.

**Why:** Wrangler's function-name preservation inserts external naming-helper calls into nested named functions. Serializing their enclosing function carries those calls into HTML without the helper definition, causing a browser ReferenceError even though compilation and source-level tests pass. Object-method helpers avoid this instrumentation.

**How to apply:** Avoid nested named function declarations or named arrow assignments in serialized factories. Execute the emitted script from the minified Cloudflare worker when changing these factories or compiler settings. Verify real language choices and storage/currency preservation, not only that compilation succeeds.

Use the Node test environment for server-header assertions and file-backed VM checks; keep actual UI rendering tests in the DOM environment.

**Why:** The browser-like test environment hid Set-Cookie response headers and changed filesystem URL handling, producing false failures that disappeared in Node.

**How to apply:** A DOM environment is not a faithful substitute for Worker/Node HTTP headers or filesystem URLs. Use native server APIs for those assertions.
