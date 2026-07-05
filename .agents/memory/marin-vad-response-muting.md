---
name: Marin VAD response-level muting + sessionGreetingSent guard
description: Two coupled patterns required for stable gpt-realtime-2 relay: mute VAD for full response duration, and guard the opening greeting against infinite loop.
---

## VAD response-level muting

**Rule:** Disable server VAD (`turn_detection: null`) on `response.created`. Do NOT re-enable on `response.done` alone — `response.done` only means OpenAI finished GENERATING the turn, not that the browser finished PLAYING it. Only re-enable once the browser explicitly acks that its local audio queue is empty (custom WS message `client.mia_playback_done`, sent from `setMiaSpeakingState(false)` in `useRealtimeSession.ts`). Track two separate flags in the relay (`responseInFlight`, `playbackDrained`) and unmute only when both are false/true respectively; always force-remute + reset `playbackDrained=false` on every `response.created` regardless of prior state (handles tool-call chained-response races, since OpenAI guarantees `response.done` for the old turn arrives before `response.created` for the new one). Keep a generous (~20s) fallback timer to force-unmute if the browser ack is ever dropped.

**Why:** Server VAD runs on the mic signal continuously. Even with browser `echoCancellation: true`, the VAD can detect Marin's speaker output as user speech and fire `input_audio_buffer.speech_started`, which causes the client to call `stopPlayback()` mid-sentence. Muting only until `response.done` still leaves a gap: for longer responses (e.g. reciting back a full reservation summary), OpenAI's generation regularly outpaces real-time client-side playback (scheduled via `nextPlayTimeRef`), so several seconds of audio can still be queued/playing after `response.done` fires — during that unmuted gap, echo/ambient noise triggers a false interrupt and cuts off audio that's still playing. `interrupt_response: false` on `SERVER_VAD` alone only closes the *pre-response* race (right after `response.created`, before OpenAI processes the mute), not this *post-generation* playback-tail race.

**How to apply:** In `openaiRealtimeRelay.ts`, listen for `response.created`/`response.done` in `openaiWs.on("message")`, and for `client.mia_playback_done` in `clientWs.on("message")` (intercept and do NOT forward to OpenAI — it's a relay-local signal). The `SERVER_VAD` constant must live at the outer handler scope (not inside the `open` callback) so all handlers can reference it.

---

## sessionGreetingSent guard

**Rule:** The `session.updated` handler must only fire `response.create` (opening greeting) **once** — on the first `session.updated` after initial session setup. Use a `sessionGreetingSent` boolean flag.

**Why:** Every `session.update` call (including VAD mute/unmute) triggers another `session.updated` event from OpenAI. Without the guard, each VAD update causes: `session.updated → response.create → response.created → session.update (mute) → session.updated → response.create → ...` — infinite loop, Marin never starts.

**How to apply:** Declare `let sessionGreetingSent = false` in the relay handler scope. In the `session.updated` branch: `if (!sessionGreetingSent) { sessionGreetingSent = true; openaiWs.send(response.create); }`.
