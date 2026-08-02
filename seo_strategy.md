# SEO Strategy — DEVOCEAN Lodge

## Site overview
Marketing website for a small eco-lodge in Ponta do Ouro, Mozambique. Built as a React/Vite SPA hosted on Cloudflare Pages. A Cloudflare Pages Functions middleware (`_middleware.js`) handles pre-render injection of metadata and static HTML content for crawlers. Selected static HTML files (accommodation pages) are copied directly to the build output for crawler-direct access.

## Public marketing pages (in scope)
- `/` (homepage)
- `/story`
- `/why-ponta`
- `/ponta-do-ouro` (destination guide)
- `/experiences/diving`, `/experiences/dolphins`, `/experiences/seafari`, `/experiences/safari`, `/experiences/fishing`, `/experiences/surfing`, `/experiences/lighthouse`
- `/safari.html`, `/comfort.html`, `/cottage.html`, `/chalet.html` (accommodation unit pages)
- `/ponta-do-ouro-accommodation`, `/safari-tents-ponta-do-ouro`, `/diving-dolphin-accommodation`
- `/getting-to-ponta-do-ouro`, `/ponta-do-ouro-without-4x4`
- `/devocean-lodge-meals`
- `/book-direct`

## Out of scope
- `/admin` — private admin area
- `/booking-confirmed`, `/gift-confirmed`, `/thankyou`, `/canceled`, `/gift-canceled` — conversion/transactional pages (correctly noindexed)

## Target audience
- International and South African travellers planning beach/nature holidays in southern Mozambique
- Scuba divers, wildlife enthusiasts, dolphin swimmers, surfers

## Primary keywords
- "DEVOCEAN Lodge Ponta do Ouro"
- "accommodation Ponta do Ouro", "safari tents Ponta do Ouro"
- "scuba diving Ponta do Ouro", "dolphin swims Ponta do Ouro"
- "whale watching Ponta do Ouro", "game safari Ponta do Ouro"
- "getting to Ponta do Ouro", "Ponta do Ouro without 4x4"

## Crawler / GEO strategy
- AI retrieval crawlers (Perplexity, ChatGPT, Claude-User) are explicitly allowed via robots.txt.
- AI training crawlers (GPTBot, ClaudeBot, Applebot-Extended) are blocked.
- `llms.txt` and `llms-full.txt` are present for AI citation.
- Content-Signal header: `ai-train=no, search=yes, ai-input=yes` — intentional.
- Cloudflare WAF rule allows Googlebot/Bingbot — intentional, documented.
- ClaudeBot is blocked (bulk training) while Claude-User (live retrieval) is allowed — intentional.

## Rendering architecture
- SPA (React/Wouter) with Cloudflare Pages Functions middleware pre-rendering for crawlers.
- Middleware injects route-specific title, description, canonical, OG, and static HTML body for ROUTE_META routes.
- Experience pages (`/experiences/*`) get metadata injection but their `#static-content` block is emptied (content renders via React). This is a known GEO gap.
- Accommodation pages (`safari.html` etc.) are statically copied to build output and served directly.

## Dismissed categories
- HTTPS warnings — Cloudflare handles HTTPS automatically.
- Mixed content — not applicable.
