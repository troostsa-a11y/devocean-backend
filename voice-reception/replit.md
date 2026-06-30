# DEVOCEAN Lodge AI Receptionist

An AI-powered voice receptionist and admin dashboard for DEVOCEAN Lodge — an eco beach lodge in Ponta do Ouro, Mozambique (devoceanlodge.com). Visitors click "Talk to DEVOCEAN" on the lodge website, speak in-browser, and get a response from Mia the AI receptionist. Lodge staff use the dashboard to review transcripts, manage booking enquiries, and get the widget embed code.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- AI: OpenAI (via Replit AI Integration) — gpt-audio for voice, gpt-5.4 for text

## Where things live

- `artifacts/api-server/src/routes/` — Express route handlers (openai, bookings, stats, health)
- `artifacts/receptionist/src/` — React+Vite admin dashboard
- `lib/db/src/schema/` — Drizzle ORM schemas: conversations, messages, bookings
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all endpoints)
- `lib/api-client-react/src/generated/` — Orval-generated React Query hooks + Zod schemas
- `lib/integrations-openai-ai-server/src/audio/client.ts` — voiceChatStream, ensureCompatibleFormat, etc.
- `artifacts/receptionist/public/audio-playback-worklet.js` — AudioWorklet for in-browser audio playback

## Architecture decisions

- **Live availability (read-only) via Beds24 API v2**: Mia can quote real room availability + prices for specific dates via an OpenAI tool `check_availability`, wired into both the text route (gpt-5.4) and voice route (gpt-audio). The team still completes every booking — Mia never writes. Beds24 client lives in `artifacts/api-server/src/beds24/` (`client.ts` auth + parsing, `tool.ts` tool defs + dispatcher). Auth auto-detects credential type (long-life token / refresh token / one-time invite code) from the `BEDS24_TOKEN` or `BEDS24_INVITE_CODE` secret. See `.agents/memory/beds24-integration.md` for the offers response shape and auth gotchas.
- **Live currency conversion**: Lodge prices are USD; Mia converts to a guest's currency via an OpenAI tool `convert_currency` (same tool loop as availability). Rates come from a free no-key API (`open.er-api.com`, base USD, cached 1h) in `artifacts/api-server/src/currency/client.ts`. Conversions are always framed as approximate; on any error Mia falls back to USD and never invents a rate.
- **Speech-to-speech via gpt-audio**: Browser mic → base64 audio → POST to `/api/openai/conversations/:id/voice-messages` → voiceChatStream SSE → AudioWorklet playback. No separate STT/TTS chain. Voice route prefers `voiceChatStreamWithTools` (gpt-audio + tools) and falls back to plain `voiceChatStream` if tools are unsupported.
- **SSE streaming**: Both text and voice endpoints use `text/event-stream` so the UI renders tokens/audio chunks as they arrive.
- **Contract-first API**: OpenAPI spec lives in `lib/api-spec/`; Orval generates React Query hooks + Zod schemas from it. Route handlers use those same Zod schemas to validate.
- **DEVOCEAN system prompt**: The AI persona "Mia" is baked into the voice route handler with full lodge knowledge — activities, location, season, check-in times, booking flow.
- **Body size limit 50MB**: Express is configured with `express.json({ limit: "50mb" })` to handle base64-encoded audio payloads.

## Product

- **Voice widget** (`/widget`): "Talk to DEVOCEAN" microphone button — click to record, click again to send. Audio streams back in real-time. Includes copy-paste embed code for the lodge's website.
- **Dashboard** (`/`): Stats cards (total conversations, bookings, this week's counts) + recent items.
- **Conversations** (`/conversations`, `/conversations/:id`): Browse all AI sessions and read full transcripts. Voice widget embedded on detail page for demos.
- **Bookings** (`/bookings`): All booking enquiries captured by the AI — guest name, dates, party size, notes, contact info.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Run `pnpm --filter @workspace/db run push` after changing any schema in `lib/db/src/schema/`.
- The audio worklet file must live at `artifacts/receptionist/public/audio-playback-worklet.js` — it's loaded at runtime via `import.meta.env.BASE_URL`.
- `voiceChatStream` yields only `"transcript" | "audio"` event types — there is no `"user_transcript"` event from the library.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
