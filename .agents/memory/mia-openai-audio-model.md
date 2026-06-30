---
name: Mia — OpenAI audio model alias
description: The bare gpt-4o-audio-preview alias is retired; a dated alias is required or the API returns 404.
---

## Use a dated model alias

`OPENAI_AUDIO_MODEL` must be set to a dated alias (e.g. `gpt-4o-audio-preview-2024-12-17`). The bare `gpt-4o-audio-preview` alias returns 404 "model does not exist or you do not have access". Check the OpenAI platform for the current stable dated alias when rotating.

**Why:** OpenAI retired the undated alias; the API key access level (Tier 1+) is fine — the error is purely the alias name.

**How to apply:** Any Render re-deployment of `mia-voice-receptionist` must have `OPENAI_AUDIO_MODEL` set. The code default in `lib/integrations-openai-ai-server/src/audio/client.ts` is the bare alias, which no longer works.
