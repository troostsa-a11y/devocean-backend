---
name: Mia voice architecture — Realtime API
description: The gpt-4o-audio-preview family is fully retired. Mia now uses the OpenAI Realtime API (WebRTC) for voice.
---

## gpt-4o-audio-preview is gone

All dated aliases (including `gpt-4o-audio-preview-2024-12-17`) return `model_not_found`. The chat-completions audio modality (`modalities: ["text", "audio"]`) has no supported model. The entire approach is retired.

## Current architecture — Realtime WebRTC

1. **Server** (`POST /api/openai/realtime/session`): calls `POST /v1/realtime/sessions` with system prompt + Beds24 tool definitions; returns a short-lived `client_secret` to the browser. Model controlled by `OPENAI_REALTIME_MODEL` env var (default `gpt-realtime-1.5` — **verify the exact API model ID at platform.openai.com/docs/models before first deploy**).

2. **Browser** (`useRealtimeSession` hook in `lib/integrations-openai-ai-react`): uses the ephemeral token for WebRTC directly to `https://api.openai.com/v1/realtime?model=<model>`. Audio is browser ↔ OpenAI — the server never relays audio. VAD is built in — no press/release mic.

3. **Tool calls** (`POST /api/openai/realtime/execute-tool`): `response.function_call_arguments.done` on the data channel → browser POSTs here → result sent back via `conversation.item.create` + `response.create`.

## render.yaml note

`OPENAI_REALTIME_MODEL` uses `value:` (not `sync: false`), so it is re-applied on every GitHub-push deploy, overwriting any Render dashboard override. The correct model ID must live in render.yaml's `value:` field.

## What still works unchanged

- Text chat path (`POST /api/openai/conversations/:id/messages`) — `gpt-4o`, used by chips.
- DB schema, conversation/message tables, Beds24 tools.
- Old `voice-messages` route — still mounted, unused by the new widget.

**Why:** OpenAI retired the audio-preview model family. The Realtime API (WebRTC) is the correct replacement for continuous bidirectional voice.
