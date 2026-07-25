---
name: Marin page-context injection
description: How to inject live page state (room prices, dates, guests) into Marin's system prompt for context-aware answers from detail and booking pages.
---

## Rule
Pass `pageContext?: string` in the `POST /conversations/:id/messages` body.
The server extracts it, appends a PAGE CONTEXT block to the system prompt
for that turn, and instructs Marin to end her reply with a one-line
pricing/availability summary + book-direct markdown link.

**Why:** Visitors on room-detail or /book-direct pages need Marin to answer
about *their specific* situation (room, dates, prices) without having to
re-explain it. Injecting the context once on the first message is enough;
conversation history preserves it for follow-ups.

## How to apply

### API layer
- `voice-reception/lib/api-zod/src/generated/api.ts` — `SendOpenaiMessageBody`
  has `pageContext: zod.string().optional()`.
- After editing api-zod source, run:
  `pnpm --filter @workspace/api-zod exec tsc -p tsconfig.json`
  to regenerate `dist/index.d.ts` (api-server uses project references,
  not the source directly).
- `voice-reception/artifacts/api-server/src/routes/openai.ts` —
  `buildSystemPrompt(lang?, currency?, pageContext?)` appends the block.

### Iframe embed (TextChatEmbed.tsx)
On mount posts `devocean:textEmbedReady` to parent.
Listens for `devocean:ask` → stores context in `pageContextRef`, auto-sends
`autoMessage` via `sendMessageRef.current(msg)`.
Context is cleared after the first send (one-shot injection).

### Widget-loader (widget-loader.js)
`window.devocean.ask({ pageContext, autoMessage })` — opens text panel,
buffers the payload in `_pendingAsk` until `devocean:textEmbedReady` fires.
Excluded from /book-direct (early-return guard already present).

### React booking page (MarinPanel.jsx)
Self-contained component: text-link trigger + fixed 360×480 iframe panel.
Loads iframe once (on first open), preserves conversation on close/reopen.
Sends context only on first open to avoid re-triggering the auto-message.
Import into BookDirectPage and pass `context` (useMemo string) + `autoMessage`.

### Static HTML detail pages (safari/comfort/cottage/chalet .html)
Add `<script src="…/widget-loader.js" defer></script>` + inline `dvAsk()`
that calls `window.devocean.ask({ pageContext, autoMessage })`.
Trigger button goes inside `.dl-cta`, before the "Explore…" paragraph.
