---
name: Voice fallback diagnostics
description: Distinguish automatic voice failure messages from guest speech and preserve safe reasons.
---
Voice fallback messages are inserted into text chat as an automatic first message;
the transcript's Guest label does not mean the guest typed the failure.

**Why:** Repeated generic failures could not distinguish permissions, browser audio,
network or provider problems. A successful server WebSocket test does not test a
guest's microphone permissions or browser playback.

**How to apply:** Preserve safe diagnostic categories and provider error codes,
not raw provider payloads, in fallback text. Label these messages as automatic.
When increasing permission timeouts, also cancel pending asynchronous microphone
startup so late permission approval cannot start voice after switching to text.