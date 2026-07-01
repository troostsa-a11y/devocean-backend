---
name: gpt-realtime-2 session schema
description: Confirmed correct session.update shape for gpt-realtime-2 — differs significantly from gpt-4o-realtime-preview
---

# gpt-realtime-2 Session Schema

Confirmed working payload (Jul 2026, via OpenAI support + live testing):

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "instructions": "...",
    "audio": {
      "input":  { "turn_detection": { "type": "server_vad" } },
      "output": { "voice": "alloy" }
    },
    "tools": [
      { "type": "function", "name": "...", "description": "...", "parameters": {} }
    ],
    "tool_choice": "auto"
  }
}
```

**Why:** gpt-realtime-2 uses a different session schema than gpt-4o-realtime-preview. Audio config is nested under `session.audio.{input,output}` rather than at the top level.

**How to apply:** Any change to session.update for this model must use the nested audio shape. Do NOT use top-level `voice`, `modalities`, or `turn_detection` — all are unknown_parameter errors for this model.

## Confirmed INVALID fields for gpt-realtime-2
- `session.modalities` → unknown_parameter
- `session.voice` → unknown_parameter  
- `session.turn_detection` → unknown_parameter (must be nested under audio.input)

## Confirmed REQUIRED fields
- `session.type` = `"realtime"` (for live voice) or `"transcription"` (for STT only)

## Valid session.type values
- `"realtime"` — live assistant / voice conversations
- `"transcription"` — audio-to-text only

## Voice options
alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar (or custom voice object).
Voice can only be changed before the model has produced audio in the session.

## gpt-4o-realtime-preview-2024-12-17
This model was NOT accessible on this API key — only gpt-realtime-2 is available.
