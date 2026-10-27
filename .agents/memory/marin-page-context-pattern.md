---
name: Marin page-context injection
description: How to inject live page state (room prices, dates, guests) into Marin's system prompt for context-aware answers from detail and booking pages.
---

## Rule
Pass `pageContext?: string` in the `POST /conversations/:id/messages` body.
The server extracts it, appends a PAGE CONTEXT block to the system prompt
for that turn. Treat this as reference data, never an instruction to append
pricing/availability or a booking link to every answer.

**Why:** A vague room-help request produced an overwhelming catalogue of prices,
policies and links because the old context instruction required a summary.
The user wants one short clarifying question first, then a concise answer to
the specific need. Visitors on room-detail or /book-direct pages need Marin to answer
about *their specific* situation (room, dates, prices) without having to
re-explain it. Injecting the context once on the first message is enough;
conversation history preserves it for follow-ups.

## How to apply

- Conversation-first instructions take precedence over context presentation hints.
  Do not reintroduce mandatory price summaries or links; general help should ask
  "What would you like to know?" even when dates, guests and prices are known.
- Treat context as first-turn reference material, not a reason to repeat prices
  or booking links in subsequent answers.

## Generated-schema build caveat

Rebuild API schema declarations when changing a conversational request contract.

**Why:** The API server's TypeScript project references consume built declarations;
editing schema source alone can leave the consumer seeing the previous shape.

**How to apply:** Rebuild the API-schema workspace package before checking the API
server. Inspect the current widget integration rather than assuming the booking
page has a separate iframe or is excluded from the shared widget.
