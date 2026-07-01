---
name: API schema lookup first
description: Always read SDK types or API docs before constructing request payloads — never guess at parameter names/shapes.
---

# Rule: Read types before building payloads

When integrating with any external API that has an SDK installed in node_modules, read the actual `.d.ts` type definitions before writing the request payload. Do not guess at field names or structure.

**Why:** The OpenAI Realtime GA API completely restructured its session schema vs the earlier beta — `voice`, `input_audio_format`, `output_audio_format`, and `turn_detection` all moved from top-level fields into a nested `audio: { input: {}, output: {} }` object. Audio format also changed from a string (`'pcm16'`) to an object (`{ type: 'audio/pcm', rate: 24000 }`). Guessing at the old or "obvious" names produced `Unknown parameter` errors that required multiple fix rounds.

**How to apply:**
1. Before constructing any request payload (HTTP body, WebSocket message, etc.), locate the relevant type definitions:
   - `find voice-reception/node_modules -path "*<package>/resources/<resource>*" -name "*.d.ts"`
   - `grep -n "<TypeName>" <file>` to jump to the right type
2. Read the exact fields and their types from the `.d.ts`. Pay attention to nested vs flat structure.
3. For versioned APIs (anything with a beta → GA transition, or dated aliases), verify the types match the actual API version in use, not the last known schema.
4. If no SDK is available, fetch the official API reference before writing code.

The OpenAI Realtime GA API types live at:
`voice-reception/node_modules/.pnpm/openai@<version>/node_modules/openai/resources/realtime/realtime.d.ts`

Key type for session config: `RealtimeSessionCreateRequest` (used inside `SessionUpdateEvent`).
