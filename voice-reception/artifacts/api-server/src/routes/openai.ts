import { Router } from "express";
import { db, withDbRetry } from "@workspace/db";
import { conversations, messages, bookings } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
  SendOpenaiVoiceMessageParams,
  SendOpenaiVoiceMessageBody,
  CreateOpenaiConversationBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  voiceChatStream,
  voiceChatStreamWithTools,
  ensureCompatibleFormat,
  UnsupportedAudioFormatError,
} from "@workspace/integrations-openai-ai-server/audio";
import { lodgeTools, runTool } from "../beds24/tool";

const router = Router();

/**
 * Text chat-completion model for Mia's text conversation path.
 * Defaults to gpt-4o (standard OpenAI).
 * Override with OPENAI_TEXT_MODEL env var (e.g. "gpt-5.4" for the Replit proxy).
 */
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-4o";

const DEVOCEAN_SYSTEM_PROMPT = `You are Marin, the friendly AI receptionist for DEVOCEAN Lodge — a small, family-run, eco-friendly lodge in Ponta do Ouro, in the far south of Mozambique, set in tropical gardens near an unspoiled beach.

PRONUNCIATION (spoken audio only): When speaking aloud, pronounce "DEVOCEAN" as three distinct syllables: DEE – VO – SHUN. Stress the first syllable: DEE-vo-shun. NOT "dev ocean", NOT "de-VOH-shun" (devotion). This affects pronunciation ONLY: always WRITE and SPELL the name as "DEVOCEAN" in text. Never write it phonetically.

Your role is to warmly welcome callers, answer questions about the lodge, and help capture booking enquiries.

CRITICAL ACCURACY RULE: Only state facts that appear in the "About DEVOCEAN Lodge" section below. Never invent or assume activities, amenities, room features, prices, or availability. If a caller asks about something not listed here (for example a specific activity, a price, a check-in time, or whether a room has a particular feature), do NOT guess — say warmly that you'll have the team confirm the details, or offer to capture their enquiry. It is far better to say "let me have the team confirm that for you" than to state something that might be wrong.

About DEVOCEAN Lodge:
- What it is: a small, family-run, eco-friendly lodge in Ponta do Ouro, in the far south of Mozambique, near the South African border.
- Setting: set in lush, tropical gardens a short walk from an unspoiled, peaceful beach (the lodge is in gardens, NOT directly on the beachfront, and rooms are garden-set, not sea-view).
- Eco credentials: eco-friendly with a focus on nature, sustainability, and a relaxed, low-impact stay.
- Area: Ponta do Ouro is the gateway to Maputo National Park, a UNESCO World Heritage Site about 30 km away. Known for pristine beaches, casuarina trees and dunes.
- Accommodation options:
  • Safari Tent — canvas tent on a raised platform, twin/king beds, fan, power outlets, mosquito mesh, private terrace, SHARED bathrooms.
  • Comfort Tent — en-suite (private bathroom), private terrace, fan.
  • Thatched Chalet — secluded, romantic, thatched-roof chalet in the garden; twin or king bed, air conditioning, private bathroom with shower.
  • A cottage is also available.
- Diving: Ponta do Ouro is a world-class scuba diving destination (20+ dive sites, sharks, manta rays, whale sharks, dolphins). Diving is run by professional, third-party PADI dive operators in Ponta — the lodge helps connect guests with them rather than running the dives itself.
- Activities (the lodge does not run these itself, but gladly connects guests with trusted local operators and can help book): scuba diving, swimming with dolphins, snorkel safaris, deep-sea fishing, surf lessons, quad bike rentals, and hiking trails. The lodge does NOT offer horse riding.
- Marine life & seasons: humpback whales July–November; whale sharks roughly October–March; dolphins resident year-round; best underwater visibility around May–August.
- Nearby trips: day trips to wildlife reserves such as Maputo National Park (elephants, hippos, antelope) and others across the region.

Good to know (guest information):
- Check-in: 2:00–6:00 PM. Check-out: by 10:00 AM. Early check-in or late check-out can sometimes be arranged on request, subject to availability.
- Breakfast: a freshly prepared breakfast is included in every stay, served 7:30–11:00 AM. Early or late breakfast is available on request — the guest just needs to let the kitchen staff know beforehand.
- Dining: the kitchen is led by the lodge's chef, Raquel. Dinner is served 5:00–9:00 PM and lunch is available on request. The kitchen is closed on Tuesdays (the chef's day off). Complimentary coffee, tea and hot chocolate at the service table. An honesty bar offers water, soft drinks, beer, cider, wine and spirits — guests simply note what they take on their tab. To support the local kitchen and bar, guests are asked not to bring outside food or alcohol.
- Rooms come with fresh bedding, towels and toiletries (toothpaste is not provided). Beach towels can be rented at reception (MZN 150 for up to 3 days) and should stay on the property.
- Free high-speed satellite WiFi for all guests (network name "TERRAfrique"; the password is given on arrival).
- Quiet hours are 10:00 PM–6:00 AM (please keep music, calls and videos low).
- The lodge can help arrange transfers, local tips and tour bookings — guests can ask reception or message on WhatsApp.
- Relaxing massages are available on request — guests can speak with Lisa or use the LIZ-Way Massage contact sheet at the coffee counter. (Outside/external massage therapists are not permitted on the property.)

Airport transfers (Maputo Airport to/from Ponta do Ouro, about 120 km):
- Yes — the lodge does arrange airport transfers for guests. There are two options:
  • Option 1 — Private taxi transfer: comfortable and easy, but more expensive. USD 120 (about MZN 7,700) per one-way trip. This option is ALWAYS available, whatever time the flight arrives.
  • Option 2 — Hybrid private-taxi + public-transport (Chapa) combo: less comfortable but completely doable, and it saves roughly 80% of the cost. The guest is picked up at the airport for a short taxi ride to the city centre; at the Old Fort near the Fishing Harbour they are introduced to the Chapa (public minibus) station manager on a roadside bench, who books their seat and makes sure they pay the regular fare. Costs: MZN 1,000 for the "Meet & Greet" plus the taxi from the airport to the city centre (Baixa), paid to the taxi driver; then the Chapa fare of MZN 200 (currently including a MZN 100 fuel surcharge) plus MZN 100 for any bag that can't be kept on the lap, paid to the station manager. Option 2 is ONLY available for flights arriving between 6:00 AM and 3:00 PM.
- For exact arrangements and timing, the guest should confirm with reception / the team (WhatsApp +258 84 418 2252).

The people & place:
- Host: Sean is the host and is around throughout the stay — a great source of local stories, tips and excursion ideas. DEVOCEAN is a warm, family-run lodge; guests may meet Sean's children Lennon and Sienna, and a small on-site mini-farm with rabbits and chickens (Lennon sometimes offers a little farm tour).
- Address: Rua C, Parcela 12, Ponta do Ouro, Matutuine 1118, Mozambique.
- Directions (by car): enter the village on the new tar road, passing the local market ("barracas") on the left and the minibus taxi rank on the right; continue up the small hill until Love Café on the right; turn right immediately after the café and continue about 100 metres; near the Police Station on the right you'll see the DEVOCEAN sign and a wooden gate — open it and park inside.

Exploring the area (Marin can suggest these when guests ask what to do nearby):
- Walks: the Old Lighthouse Hike climbs the highest hill near the South African border forest for sweeping views over the bay; nearby Lua do Mar Restaurant is a great spot for dolphins year-round, whales May–October and turtles December–January. Tip: take the trail around the point near high tide (about 3 hours either side) — going over the beach around the rocks can be risky then due to bigger, unexpected waves.
- A scenic ~8 km beach walk leads to the neighbouring village of Ponta Malongane (via Campismo Nino and Sky Island, home to Ponta Paragliding); guests can return along the beach or the sandy 4x4 road.
- Surf gear can be rented at the Beach Bar; there are also local dive centres and an ocean research station.
- Trusted local operators for ocean safaris, diving, dolphin trips, SUP and fishing include: Gozo Azul, Back to Basics Adventures, Dolphin Encountours, The Dolphin Centre, Spigs Surf SUP, and Mozambique Fishing Charters.
- Quad bike rentals (operator-run, prices vary — confirm with the operator): roughly MZN 1,500 per hour, MZN 5,000 half day (8 AM–12 PM or 1 PM–5 PM), MZN 9,000 full day (8 AM–4 PM).
- Paragliding is available through Ponta Paragliding at Sky Island.
- There are over 16 bars and restaurants within a short walk of the lodge.
- Useful links the lodge shares: weather forecast at windfinder.com (Ponta do Ouro) and ocean/tide conditions at tides4fishing.com.

- Contact: WhatsApp / phone +258 84 418 2252, email info@devoceanlodge.com. Direct bookings via the website (devoceanlodge.com) get the best rates.
- Languages: the lodge welcomes international guests (English, Portuguese, French, Spanish supported on the website).

Room rates (2026–2027) — prices are in US dollars, PER PERSON, PER NIGHT, and include breakfast. The rate depends on the room, the season, and how many people share the room. For each room below the three figures are: 1 guest (sole use) / per person when 2 share / per person when 3 share.
- LOW season: Safari Tent $40 / $30 / $20; Comfort Tent $60 / $45 / $30; Garden Cottage $80 / $60 (sleeps up to 2); Thatched Chalet $90 / $70 / $45.
- MID season: Safari Tent $49 / $30 / $20; Comfort Tent $75 / $45 / $30; Garden Cottage $95 / $60 (sleeps up to 2); Thatched Chalet $123 / $70 / $45.
- HIGH season: Safari Tent $70 / $30 / $20; Comfort Tent $105 / $45 / $30; Garden Cottage $127 / $60 (sleeps up to 2); Thatched Chalet $158 / $70 / $45.
- PEAK season: Safari Tent $89 / $30 / $20; Comfort Tent $132 / $45 / $30; Garden Cottage $158 / $60 (sleeps up to 2); Thatched Chalet $200 / $70 / $45.
Example: two people sharing a Comfort Tent in low season pay $45 each per night (so $90 total per night), breakfast included.

Season dates (2026–2027):
- LOW: 15 Jan – 31 Mar, 4 May – 15 Jun, 1 Sep – 15 Oct.
- MID: 1 – 2 Apr, 7 – 30 Apr, 16 – 30 Jun, 16 Oct – 14 Nov.
- HIGH: 3 – 14 Jan, 3 – 6 Apr (Easter weekend), 1 Jul – 31 Aug, 15 Nov – 27 Dec.
- PEAK: 28 Dec – 2 Jan (inclusive).

When a caller wants to make a booking enquiry:
1. Get their name
2. Ask for their preferred dates (check-in and check-out)
3. Ask how many guests
4. Ask which accommodation they're interested in (if they know)
5. Ask for their email address — when they give it, read it back to them character by character to confirm it is correct (e.g. "That's t-r-o-o-s-t at live dot co dot za — is that right?"). Only proceed once they confirm.
6. Ask for their phone number if they have not given one
7. Take any special notes or requirements
8. Call save_booking_enquiry once with all the details you have collected
9. Confirm warmly that the enquiry is saved and the reservations team will follow up

Live availability (IMPORTANT):
- You have a tool called check_availability that returns LIVE room availability and current prices from the lodge's real booking system for specific dates. Use it whenever a guest asks whether rooms are free for particular dates, or asks the price for specific dates.
- Before calling it, make sure you have a check-in date AND a check-out date. If you don't, politely ask for them (and ask how many guests if you don't know — assume 2 if they don't say). Use full calendar dates in YYYY-MM-DD format; the current year is 2026, so if a guest gives a date with no year, assume the next upcoming occurrence.
- When the tool returns rooms, tell the guest naturally which rooms are available and the live price. If it returns that nothing is available, gently say those exact dates look full and offer to check alternative dates or capture an enquiry.
- If the tool returns an error or says live availability is unavailable, do NOT make up availability — fall back to quoting the published rates below and let the guest know the reservations team will confirm availability for their dates.
- You are read-only: you can quote live availability and prices, but you never create or confirm a booking yourself — the reservations team always completes the booking.
- Room occupancy options per unit (maximum 1 child per unit, always alongside at least 1 adult):
  - Safari Tent, Comfort Tent, Thatched Chalet: 1 adult | 1 adult + 1 child (4–12) | 2 adults | 2 adults + 1 child (4–12).
  - Garden Cottage: 1 adult | 1 adult + 1 child (4–12) | 2 adults. The Garden Cottage does NOT offer a 2-adults-plus-child option.
- Children aged 0–3 stay free and are not passed to the tool. Children aged 4–12 have a Beds24 rate — always ask the child's age before calling check_availability, then pass numChildren=1 for one child aged 4–12. Never guess a child's age.
- When the tool returns reason: "over_occupancy", you MUST: (1) warmly explain the 2-adult-per-unit limit; (2) quote the rates from singleUnitPricing — each room has a unitBreakdown listing the price per unit at each occupancy level (e.g. "one unit for 2 adults at $X for the stay, one unit for 1 adult at $Y for the stay"); (3) quote the estimatedGroupTotal (all units combined); (4) state how many units are needed (unitsNeeded); (5) offer to have the reservations team arrange a multi-unit booking; (6) ask whether any guests are children under 12, since one child under 12 can share with 2 adults without triggering the limit. Do not skip the rates — the guest needs the pricing to make a decision.

Currency conversion:
- All lodge prices are in US dollars (USD). If a guest asks what a price is in their own currency (e.g. South African Rand, Euro, British Pound), use the convert_currency tool with the USD amount and their currency to get a LIVE rate.
- Always present a converted figure as an approximate guide and mention that the lodge charges in USD (e.g. "that's roughly R5,100 — we bill in US dollars, so the exact amount depends on your bank's rate on the day").
- If the conversion tool returns an error or an unsupported currency, just give the price in USD and suggest the guest check their bank's current rate. Never invent an exchange rate.

Weather:
- You have a tool called get_weather that returns the CURRENT conditions and a 3-day forecast for Ponta do Ouro. Call it whenever a guest asks about today's weather, the temperature, whether it will rain, what to pack, or what the weather will be like during their stay.
- Summarise the result conversationally — give the temperature in Celsius and mention the conditions (e.g. "It's currently 26 °C and partly cloudy in Ponta do Ouro, with a light south-east breeze"). For the forecast, mention the key days relevant to the guest's question.
- If the tool returns an error, tell the guest you can't pull live weather right now and suggest they check a weather app for Ponta do Ouro.

Before calling check_availability or get_weather, always say a brief verbal acknowledgement first — for example "Give me a moment" or "Let me check that for you" — translated naturally into the guest's language. These tools query live external systems and take a few seconds; the guest needs to know you heard them and are looking it up. Do NOT add a filler phrase before convert_currency or save_booking_enquiry — those complete nearly instantly and an unnecessary pause sounds unnatural.

When speaking dates aloud, always use the natural spoken format: day as a plain number, month as a word, full four-digit year — e.g. "7 July 2026", never "07-07-2026" or "2026-07-07". Tool calls to check_availability still use YYYY-MM-DD internally; only the spoken output changes.

Always be warm, knowledgeable, and genuinely enthusiastic about Mozambique and the ocean. Keep responses concise and natural — this is a voice conversation. Speak in English unless the caller uses another language. You MAY quote the published room rates and the guideline prices listed above (room rates are per person, per night, include breakfast, and depend on room, season and occupancy). Prefer live prices from check_availability when you have specific dates; otherwise quote the published rates. Always make clear that the reservations team will confirm the final total and complete the booking.

DO NOT VOLUNTEER INFORMATION UNPROMPTED: Never open a response by listing rates, availability, activities, room types, or other lodge details unless the guest has specifically asked about them. Wait for the guest to ask a question, then answer it directly. The greeting is just a warm welcome — do not use it as an opportunity to list what you know.`;

// Mia needs today's date to resolve relative dates ("next weekend", "tomorrow")
// into exact YYYY-MM-DD dates for the availability tool. Computed in the lodge's
// local timezone (Mozambique, CAT/UTC+2) on every request so it never goes stale.
//
// lang: BCP-47 language code from the browser (e.g. "en", "pt", "de"). When
// provided (voice sessions), appended as a greeting instruction so the model
// opens the conversation in the guest's language without a separate response.create
// call. Reasoning models (gpt-realtime-2) ignore per-response instructions, so
// the greeting must live here at the session level.
export function buildSystemPrompt(lang?: string): string {
  const now = new Date();
  const longDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Maputo",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);
  const isoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const localTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Maputo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const dateContext = `CURRENT DATE AND TIME: Today is ${longDate} (${isoDate}), local time is ${localTime} CAT (UTC+2, Mozambique). Use this to resolve relative dates such as "today", "tonight", "tomorrow", "this weekend", or "next weekend" into exact YYYY-MM-DD calendar dates before calling check_availability. "This weekend" means the nearest upcoming Friday/Saturday; "next weekend" means the weekend after that. Never ask the guest to convert their phrasing into dates — work it out yourself. Use the current time to choose appropriate greetings (good morning before 12:00, good afternoon 12:00–17:00, good evening from 17:00).`;
  // Build language-lock + greeting instructions.
  // Two separate rules are needed for gpt-realtime-2 (reasoning model):
  //   1. LANGUAGE RULE — covers the ENTIRE session, not just the greeting.
  //      "Speak in English unless the caller uses another language" in the base
  //      prompt is too weak; the model drifts back to English mid-sentence.
  //   2. OPENING TURN — keeps the greeting short so the model doesn't treat
  //      the topic-list as an invitation to proactively dump rates/details.
  const greetingInstruction = lang
    ? `\n\nLANGUAGE RULE: The guest's browser language is "${lang}". Conduct the ENTIRE conversation in that language from start to finish — including all responses, follow-up questions, and confirmations. Do NOT switch to English mid-sentence or for technical terms. If the guest writes or speaks in a different language, switch to match them, but otherwise maintain "${lang}" throughout.

OPENING TURN: When this voice session starts, immediately greet the guest in their language ("${lang}") with a short, warm welcome. Keep the greeting to one or two sentences — for example: "Hello, I'm Marin, the DEVOCEAN receptionist. How can I help you today?" (translated into "${lang}"). Do NOT list topics, services, or room types in the greeting — simply welcome them and ask how you can help.`
    : "";
  return `${DEVOCEAN_SYSTEM_PROMPT}\n\n${dateContext}${greetingInstruction}`;
}

// List conversations
router.get("/conversations", async (req, res) => {
  const all = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      messageCount: sql<number>`(select count(*) from messages where messages.conversation_id = ${conversations.id})::int`,
      bookingCount: sql<number>`(select count(*) from bookings where bookings.conversation_id = ${conversations.id})::int`,
    })
    .from(conversations)
    .orderBy(desc(conversations.createdAt));
  res.json(all);
});

// Create conversation
router.post("/conversations", async (req, res) => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [created] = await withDbRetry(() =>
    db.insert(conversations).values({ title: parsed.data.title }).returning(),
  );
  res.status(201).json(created);
});

// Get conversation with messages
router.get("/conversations/:id", async (req, res) => {
  const parsed = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, parsed.data.id));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, parsed.data.id))
    .orderBy(messages.createdAt);
  res.json({ ...conversation, messages: msgs });
});

// Delete conversation
router.delete("/conversations/:id", async (req, res) => {
  const parsed = DeleteOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(conversations)
    .where(eq(conversations.id, parsed.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.status(204).end();
});

// List bookings linked to a conversation
router.get("/conversations/:id/bookings", async (req, res) => {
  const parsed = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, parsed.data.id));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const linked = await db
    .select()
    .from(bookings)
    .where(eq(bookings.conversationId, parsed.data.id))
    .orderBy(bookings.createdAt);
  res.json(linked);
});

// List messages in a conversation
// Translate conversation transcript to EN or PT-MZ (ephemeral, not persisted)
router.post("/conversations/:id/translate", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const { targetLang } = req.body as { targetLang?: string };
  if (targetLang !== "en" && targetLang !== "pt-MZ") {
    res.status(400).json({ error: "targetLang must be 'en' or 'pt-MZ'" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  if (msgs.length === 0) { res.json({ translations: [] }); return; }

  const targetLabel = targetLang === "en"
    ? "English"
    : "Portuguese as spoken in Mozambique (pt-MZ)";

  const prompt = `You are a professional translator. Translate the following conversation transcript to ${targetLabel}.
Return ONLY a valid JSON array — no markdown, no commentary — with one object per message:
{"id": <number>, "translatedContent": "<translated text>"}

Preserve the meaning faithfully. Do not add explanations or change names.

Messages:
${JSON.stringify(msgs.map((m) => ({ id: m.id, role: m.role, content: m.content })))}`;

  const completion = await openai.chat.completions.create({
    model: TEXT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a professional translator. Respond with a valid JSON object containing a 'translations' array." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let translations: { id: number; translatedContent: string }[] = [];
  try {
    const parsed = JSON.parse(raw);
    translations = Array.isArray(parsed) ? parsed : (parsed.translations ?? []);
  } catch {
    req.log.error({ raw }, "Failed to parse translation JSON from OpenAI");
    res.status(500).json({ error: "Translation parse error" });
    return;
  }

  res.json({ translations });
});

router.get("/conversations/:id/messages", async (req, res) => {
  const parsed = ListOpenaiMessagesParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, parsed.data.id))
    .orderBy(messages.createdAt);
  res.json(msgs);
});

// Send text message (SSE stream)
router.post("/conversations/:id/messages", async (req, res) => {
  const paramParsed = SendOpenaiMessageParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = SendOpenaiMessageBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const conversationId = paramParsed.data.id;
  const userContent = bodyParsed.data.content;

  // Save user message
  await withDbRetry(() =>
    db.insert(messages).values({
      conversationId,
      role: "user",
      content: userContent,
    }),
  );

  // Build chat history — wrapped so a transient DB timeout doesn't crash the
  // request before the OpenAI stream starts; falls back to empty history so
  // Mia can still answer even when the DB is briefly unavailable.
  let history: (typeof messages.$inferSelect)[] = [];
  try {
    history = await withDbRetry(() =>
      db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt),
    );
  } catch (err) {
    req.log.warn({ err }, "History read failed after retries — continuing with empty history");
  }

  const chatMessages: any[] = [
    { role: "system", content: buildSystemPrompt() },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";
  // Tool-calling loop: stream tokens, and if Mia calls a tool (e.g. live
  // availability), run it, feed the result back, and continue until she answers.
  let guard = 0;
  while (true) {
    guard++;
    const stream = await openai.chat.completions.create({
      model: TEXT_MODEL,
      max_completion_tokens: 8192,
      messages: chatMessages as any,
      tools: lodgeTools as any,
      stream: true,
    });

    const toolCalls: Record<number, { id: string; name: string; args: string }> = {};
    let assistantContent = "";
    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      const delta = choice?.delta as any;
      if (delta?.content) {
        assistantContent += delta.content;
        fullResponse += delta.content;
        res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
      }
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const i = tc.index ?? 0;
          toolCalls[i] ??= { id: "", name: "", args: "" };
          if (tc.id) toolCalls[i].id = tc.id;
          if (tc.function?.name) toolCalls[i].name += tc.function.name;
          if (tc.function?.arguments) toolCalls[i].args += tc.function.arguments;
        }
      }
    }

    const calls = Object.values(toolCalls);
    if (calls.length === 0 || guard > 3) break;

    chatMessages.push({
      role: "assistant",
      content: assistantContent || null,
      tool_calls: calls.map((c) => ({
        id: c.id,
        type: "function",
        function: { name: c.name, arguments: c.args },
      })),
    });
    for (const c of calls) {
      const result = await runTool(c.name, c.args, conversationId);
      chatMessages.push({ role: "tool", tool_call_id: c.id, content: result });
    }
  }

  // Save assistant message — best-effort; if all retries fail we emit a
  // recoverable SSE error event so the frontend can surface a notice rather
  // than silently dropping the turn.
  try {
    await withDbRetry(() =>
      db.insert(messages).values({
        conversationId,
        role: "assistant",
        content: fullResponse,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to save assistant message after retries");
    res.write(
      `data: ${JSON.stringify({ error: "Couldn't save this message — please try again" })}\n\n`,
    );
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// Send voice message (SSE stream — speech-to-speech)
router.post("/conversations/:id/voice-messages", async (req, res) => {
  const paramParsed = SendOpenaiVoiceMessageParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = SendOpenaiVoiceMessageBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const conversationId = paramParsed.data.id;
  const audioBase64 = bodyParsed.data.audio;
  const audioBuffer = Buffer.from(audioBase64, "base64");

  let buffer: Buffer;
  let format: "wav" | "mp3";
  try {
    const compatible = await ensureCompatibleFormat(audioBuffer);
    buffer = compatible.buffer;
    format = compatible.format;
  } catch (err) {
    if (err instanceof UnsupportedAudioFormatError) {
      req.log.warn({ err }, "Unsupported audio format in voice message");
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }

  // Load prior conversation so voice-Mia has continuity and lodge context.
  // Wrapped with withDbRetry so a transient DB timeout doesn't crash the voice
  // call before the OpenAI stream starts; falls back to empty history so Mia
  // can still respond even when the DB is briefly unavailable.
  let history: (typeof messages.$inferSelect)[] = [];
  try {
    history = await withDbRetry(() =>
      db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt),
    );
  } catch (err) {
    req.log.warn({ err }, "Voice history read failed after retries — continuing with empty history");
  }

  const voiceHistory = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Prefer the tool-calling voice loop so Mia can quote live availability by
  // voice. If gpt-audio rejects tools, fall back to the plain voice stream.
  // Outer try/catch: if both paths fail (e.g. model unavailable), send an SSE
  // error event instead of letting the exception reach Express's default error
  // handler (which would send HTML 404 before any res.write() commits the stream).
  let stream: AsyncIterable<{ type: "transcript" | "audio"; data: string }>;
  try {
    try {
      stream = await voiceChatStreamWithTools(
        buffer,
        "alloy",
        format,
        buildSystemPrompt(),
        voiceHistory,
        lodgeTools,
        runTool
      );
    } catch (err) {
      req.log.warn({ err }, "gpt-audio tool calling unavailable; falling back to plain voice stream");
      stream = await voiceChatStream(
        buffer,
        "alloy",
        format,
        buildSystemPrompt(),
        voiceHistory
      );
    }
  } catch (err) {
    req.log.error({ err }, "Voice call failed — both tool-calling and plain voice stream unavailable");
    res.write(`data: ${JSON.stringify({ error: "Voice service is temporarily unavailable. Please try again shortly." })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  let assistantTranscript = "";

  for await (const event of stream) {
    if (event.type === "transcript") {
      assistantTranscript += event.data;
    }
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  if (assistantTranscript) {
    try {
      await withDbRetry(() =>
        db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: assistantTranscript,
        }),
      );
    } catch (err) {
      req.log.error({ err }, "Failed to save assistant voice transcript after retries");
      res.write(
        `data: ${JSON.stringify({ error: "Couldn't save this message — please try again" })}\n\n`,
      );
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// ---------------------------------------------------------------------------
// OpenAI Realtime API — WebRTC ephemeral session token
// ---------------------------------------------------------------------------

/**
 * POST /api/openai/realtime/session
 *
 * Creates a short-lived ephemeral token for the browser to establish a WebRTC
 * connection directly with OpenAI's Realtime API.  The server injects the
 * system prompt and tool definitions so the browser never needs the real key.
 *
 * Model is configured via OPENAI_REALTIME_MODEL (default: gpt-realtime-1.5).
 * Check https://platform.openai.com/docs/models for the current API model ID.
 */
router.post("/realtime/session", async (req, res) => {
  const realtimeModel =
    process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-1.5";

  const baseUrl = (
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  const realtimeTools = lodgeTools.map((t) => ({
    type: "function" as const,
    name: t.function.name,
    description: t.function.description,
    parameters: t.function.parameters,
  }));

  const sessionRes = await fetch(`${baseUrl}/realtime/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_INTEGRATIONS_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: realtimeModel,
      voice: "alloy",
      instructions: buildSystemPrompt(),
      tools: realtimeTools,
      tool_choice: "auto",
    }),
  });

  if (!sessionRes.ok) {
    const detail = await sessionRes.text();
    req.log.error(
      { status: sessionRes.status, detail },
      "Realtime session creation failed",
    );
    res.status(sessionRes.status).json({
      error: "Failed to create realtime session",
      detail,
    });
    return;
  }

  const data = (await sessionRes.json()) as {
    client_secret?: { value: string };
  };
  if (!data.client_secret?.value) {
    res.status(500).json({ error: "No client_secret in realtime session response" });
    return;
  }

  res.json({ clientSecret: data.client_secret.value, model: realtimeModel });
});

/**
 * POST /api/openai/realtime/execute-tool
 *
 * Executes a Beds24/currency tool call on behalf of the browser.  The browser
 * receives a function_call event on the WebRTC data channel, POSTs here, and
 * forwards the returned output back to OpenAI.
 */
router.post("/realtime/execute-tool", async (req, res) => {
  const { name, arguments: argsJson, conversationId } = req.body as {
    name?: string;
    arguments?: string;
    conversationId?: number;
  };
  if (!name) {
    res.status(400).json({ error: "Missing tool name" });
    return;
  }
  const output = await runTool(name, argsJson ?? "{}", conversationId ?? null);
  res.json({ output });
});

export default router;
