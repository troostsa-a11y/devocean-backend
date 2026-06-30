---
name: Mia prompt runtime context
description: Why Mia's system prompt must inject today's date, and how pronunciation guidance is scoped.
---

# Mia system prompt — runtime context rules

## Inject today's date so relative-date availability works
Mia's system prompt must include the current date, computed **per request** in the
lodge's timezone (`Africa/Maputo`, CAT/UTC+2) via `Intl.DateTimeFormat`. Without it,
the model only knows the year and cannot turn "next weekend" / "tomorrow" into the
`YYYY-MM-DD` check-in/check-out the Beds24 `check_availability` tool needs — so it
silently fails to quote availability.

**Why:** A guest asking "availability for next weekend" got no answer because the
prompt only stated the year. A static date would also go stale; compute it at request
time, not as a module constant.

**How to apply:** The prompt is built by a helper (not a static const) used at every
call site — text route system message AND both voice paths (tools + plain fallback).
If you add a new route that talks to Mia, build the prompt through the same helper, not
the raw constant.

## Pronunciation guidance is spoken-audio-only
The rule "pronounce DEVOCEAN like 'devotion'" must be explicitly scoped to spoken
audio. The text (gpt-5.4) and voice (gpt-audio) routes share one prompt, so an
unscoped "say it like de-VOH-shun" leaks the phonetic spelling into written replies.
Always instruct: pronounce it that way aloud, but WRITE/SPELL it as "DEVOCEAN".
