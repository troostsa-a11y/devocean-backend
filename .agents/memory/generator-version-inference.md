---
name: Generator version inference
description: Why API generator upgrades must preserve the consumer library versions rather than trust automatic detection.
---
API code generation must target the library major versions used by the consuming workspace, not the generator's defaults or its own dependencies.

**Why:** pnpm catalog references can prevent Orval from detecting React Query and Zod versions. A generator upgrade defaulted to React Query 4 and Zod 4 despite consumers using React Query 5 and Zod 3. Updating the generator should not require migrating those runtime libraries.

**How to apply:** When upgrading generators, verify version detection against consumer dependencies and keep production generation and temporary synchronization-check generation configured identically. Validate regenerated output with both the synchronization check and the whole workspace type check.
