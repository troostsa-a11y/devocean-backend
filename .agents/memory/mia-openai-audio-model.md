---
name: Mia — OpenAI audio model alias
description: The bare gpt-4o-audio-preview alias is retired; dated alias required in render.yaml value: field, not just the dashboard.
---

## Use a dated model alias

`OPENAI_AUDIO_MODEL` must be set to a dated alias (e.g. `gpt-4o-audio-preview-2024-12-17`). The bare `gpt-4o-audio-preview` alias returns 404 "model does not exist or you do not have access". Check the OpenAI platform for the current stable dated alias when rotating.

**Why:** OpenAI retired the undated alias. The API key access level (Tier 1+) is fine — the error is purely the alias name.

## render.yaml value: clobbers the Render dashboard on every deploy

`OPENAI_AUDIO_MODEL` in `render.yaml` uses `value:` (not `sync: false`). Render re-applies `value:` fields from render.yaml on every GitHub-push-triggered deploy, overwriting anything the user set in the Render dashboard. Setting it to the dated alias in the **dashboard** only is not durable — the next push resets it to whatever is in render.yaml.

**Fix:** The dated alias must live in render.yaml's `value:` field itself.

**How to apply:** Whenever OpenAI retires the current dated alias, update `render.yaml` (the `OPENAI_AUDIO_MODEL` value line) and push to GitHub — do NOT rely on the Render dashboard override surviving the next deploy.

## Route-level resilience: outer try/catch required

`voiceChatStreamWithTools` and `voiceChatStream` both use the same `AUDIO_MODEL`. If both fail (e.g. wrong model), the exception escapes the inner try/catch and reaches Express's default error handler. Because `res.setHeader()` was called but no `res.write()` has happened yet, Express can still send an HTML 404 page — and `streamVoiceResponse` in the widget interprets a non-2xx response as a fatal error, displaying the raw HTML.

**Fix:** Wrap the inner try/catch in an outer one that writes an SSE `{ error: "..." }` + `{ done: true }` frame and ends the response. This way the widget shows a readable error string instead of HTML.
