---
name: Marin VAD response-level muting + sessionGreetingSent guard
description: Two coupled patterns required for stable gpt-realtime-2 relay: mute VAD for full response duration, and guard the opening greeting against infinite loop.
---

## VAD response-level muting

**Rule:** Disable server VAD (`turn_detection: null`) on `response.created`; re-enable (`turn_detection: SERVER_VAD`) on `response.done`. Do NOT mute only around tool calls — that is too late and leaves the opening speech vulnerable to false interrupts.

**Why:** Server VAD runs on the mic signal continuously. Even with browser `echoCancellation: true`, the VAD can detect Marin's speaker output as user speech and fire `input_audio_buffer.speech_started`, which causes the client to call `stopPlayback()` mid-sentence. Muting for the full response duration eliminates this entirely.

**How to apply:** In `openaiRealtimeRelay.ts`, listen for `response.created` and `response.done` in the `openaiWs.on("message")` handler, send `session.update` accordingly. The `SERVER_VAD` constant must live at the outer handler scope (not inside the `open` callback) so both handlers can reference it.

---

## sessionGreetingSent guard

**Rule:** The `session.updated` handler must only fire `response.create` (opening greeting) **once** — on the first `session.updated` after initial session setup. Use a `sessionGreetingSent` boolean flag.

**Why:** Every `session.update` call (including VAD mute/unmute) triggers another `session.updated` event from OpenAI. Without the guard, each VAD update causes: `session.updated → response.create → response.created → session.update (mute) → session.updated → response.create → ...` — infinite loop, Marin never starts.

**How to apply:** Declare `let sessionGreetingSent = false` in the relay handler scope. In the `session.updated` branch: `if (!sessionGreetingSent) { sessionGreetingSent = true; openaiWs.send(response.create); }`.
