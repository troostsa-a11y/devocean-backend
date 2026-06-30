---
name: OpenAI gpt-audio input format
description: Why browser voice recordings must be converted to WAV before reaching OpenAI's chat completions input_audio API
---

# OpenAI `input_audio` accepts ONLY `wav` and `mp3`

OpenAI's chat completions `input_audio.format` (used by `gpt-audio` speech-to-speech)
rejects everything except `wav` and `mp3` with a hard `400 Invalid value: '<fmt>'.
Supported values are: 'wav' and 'mp3'.` Containers like `webm`/`opus` (Chrome/Firefox
record `audio/webm;codecs=opus`), `mp4`/`aac` (Safari/iOS), and `ogg` are NOT accepted —
do not try to pass them through "natively".

**Why:** We first tried a passthrough that claimed webm/ogg/m4a were accepted to avoid
ffmpeg. It produced 400s in production. ffmpeg is present in dev (Nix) but NOT on the
production deployment PATH, so server-side `convertToWav` via `spawn("ffmpeg")` throws
`ENOENT` in prod (this earlier caused 500s).

**How to apply:** Convert the recording to 16-bit PCM mono 16kHz WAV **in the browser**
via Web Audio API (`decodeAudioData` → downmix → resample → WAV) before upload — no
server dependency. Browsers can always decode what they recorded. Keep the server's
`ensureCompatibleFormat` contract truthful: only `wav`/`mp3` pass through; anything else
attempts ffmpeg and, on failure, throws a typed error the route surfaces as a clean 400
(never forward an invalid format to OpenAI and let it 400 opaquely).

# Silent voice playback = suspended AudioContext

If voice transcript arrives but there's no speaker sound, the AudioWorklet is running
but the AudioContext is `suspended` (browser autoplay policy) — it outputs silence, not
an error. Fix: call `ctx.resume()` inside `init()` after creation AND defensively before
each `pushAudio` (resume if `ctx.state === "suspended"`). Audio output is PCM16 @ 24kHz
from gpt-audio, so the playback AudioContext must be created at `sampleRate: 24000`
(wrong rate = distorted pitch, not silence). Worklet served fine at BASE_URL — not the
cause of silence.

# voiceChatStream needs system prompt passed explicitly

The voice (gpt-audio) path does NOT share the text route's messages — `voiceChatStream`
builds its own messages array. If you only pass the audio, the model has zero persona /
domain knowledge even when a system prompt is defined elsewhere in the route. Always pass
the system prompt (and prior conversation history as text messages) into voiceChatStream;
gpt-audio accepts mixed text + input_audio messages in one request.
