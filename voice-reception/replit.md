# DEVOCEAN Lodge AI Receptionist

An AI-powered voice receptionist and admin dashboard for DEVOCEAN Lodge — an eco beach lodge in Ponta do Ouro, Mozambique (devoceanlodge.com). Visitors click "Talk to DEVOCEAN" on the lodge website, speak in-browser, and get a response from Mia the AI receptionist. Lodge staff use the dashboard to review transcripts, manage booking enquiries, and get the widget embed code.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `RECEPTION_DATABASE_URL` — dedicated Reception Postgres connection string
- `pnpm --filter @workspace/api-server run test` — API/security regressions, including isolated PostgreSQL quota/migration tests; no real AI or notification calls

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

- **Live availability (read-only)**: The `check_availability` tool uses the existing automailer direct-booking API so prices match the lodge website. Mia can save guest enquiries, not confirmed reservations; staff still complete every booking. Tools execute only on the server inside an authorized conversation.
- **Live currency conversion**: Lodge prices are USD; Mia converts to a guest's currency via an OpenAI tool `convert_currency` (same tool loop as availability). Rates come from a free no-key API (`open.er-api.com`, base USD, cached 1h) in `artifacts/api-server/src/currency/client.ts`. Conversions are always framed as approximate; on any error Mia falls back to USD and never invents a rate.
- **Speech-to-speech via gpt-audio**: Browser mic → base64 audio → POST to `/api/openai/conversations/:id/voice-messages` → voiceChatStream SSE → AudioWorklet playback. No separate STT/TTS chain. Voice route prefers `voiceChatStreamWithTools` (gpt-audio + tools) and falls back to plain `voiceChatStream` if tools are unsupported.
- **SSE streaming**: Both text and voice endpoints use `text/event-stream` so the UI renders tokens/audio chunks as they arrive.
- **Contract-first API**: OpenAPI spec lives in `lib/api-spec/`; Orval generates React Query hooks + Zod schemas from it. Route handlers use those same Zod schemas to validate.
- **DEVOCEAN system prompt**: The AI persona "Mia" is baked into the voice route handler with full lodge knowledge — activities, location, season, check-in times, booking flow.
- **Bounded audio and text**: Normal JSON is limited to 32 KB. The authorized recorded-audio endpoint accepts up to 3 MB JSON containing PCM WAV audio of at most 2 MB / 45 seconds. Compressed request bodies are rejected. Active voice uses the authenticated, five-minute WebSocket relay, not a browser OpenAI session token.

## Receptionist security

- Guests receive a random public UUID and private conversation capability at creation. Store it only in memory. Text/recorded audio use `X-Conversation-Token`; WebSocket uses the `marin-v1` and `conversation.<capability>` subprotocols with the public UUID in the query. Capabilities expire after 24 hours. Staff numeric IDs and historical conversations remain behind the admin bearer key.
- The unused `/realtime/session` and `/realtime/execute-tool` HTTP surfaces are closed. Only model-issued, validated server tools can save enquiries or notify staff.
- CORS, Origin checks and iframe `frame-ancestors` allow known lodge/widget origins only. `RECEPTION_ALLOWED_ORIGINS` adds comma-separated exact HTTPS origins for additional custom/API hosts. Never trust a caller's Host header as an origin allow-list.
- `RECEPTION_TRUSTED_PROXIES` accepts only trusted peer IPs/CIDRs or proxy-addr network names; default is loopback. Render's Blueprint explicitly trusts private reverse-proxy peers. Do not use blanket trust or a hop count. A conservatively unrecognized proxy shares one IP budget instead of trusting spoofable forwarded headers.
- PostgreSQL counters and expiring leases are shared across autoscale replicas. Creation: 6/IP/10 min and 30/IP/day, 60/global/10 min and 600/global/day. AI work: text costs 1 unit, recorded voice 2, and each five-minute relay reserves 10; limits are 20/IP/min, 200/IP/day, 60/conversation/hour, 120/global/min and 1,200/global/day.
- Paid work concurrency: 1/conversation, 2/IP and 8/global. HTTP AI work has a 60-second deadline, three model rounds and four tool calls per turn; Realtime has five minutes, 30 responses and 12 tool calls. Output is capped at 1,024 tokens per response. Client WebSocket messages may contain only paced audio and playback acknowledgements.
- Tools: 30/conversation/hour, 60/IP/hour, 240/global/hour and 2,000/global/day. Enquiry inserts and operator notifications reserve an additional quota: 3/conversation/hour, 5/IP/hour, 30/global/hour and 60/global/day. Login: 5/IP/15 min and 100/global/15 min.
- Protection/database failures fail closed. Additive Drizzle migrations install capability columns and RLS-enabled protection tables; existing conversations become staff-only, with no guest data deleted. Anonymous scripts can still create their own conversations, but cannot read other guests or bypass shared budgets.

## Product

- **Voice widget** (`/widget`): "Talk to DEVOCEAN" microphone button — click to record, click again to send. Audio streams back in real-time. Includes copy-paste embed code for the lodge's website.
- **Dashboard** (`/`): Stats cards (total conversations, bookings, this week's counts) + recent items.
- **Conversations** (`/conversations`, `/conversations/:id`): Browse all AI sessions and read full transcripts. Voice widget embedded on detail page for demos.
- **Bookings** (`/bookings`): All booking enquiries captured by the AI — guest name, dates, party size, notes, contact info.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- For production schema changes, generate a Drizzle migration and keep it additive/idempotent; startup applies migrations before declaring readiness. Do not use `push-force` on the Reception database.
- The audio worklet file must live at `artifacts/receptionist/public/audio-playback-worklet.js` — it's loaded at runtime via `import.meta.env.BASE_URL`.
- `voiceChatStream` yields only `"transcript" | "audio"` event types — there is no `"user_transcript"` event from the library.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
