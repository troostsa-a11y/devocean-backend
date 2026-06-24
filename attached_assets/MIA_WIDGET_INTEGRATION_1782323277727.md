# Integrating "Mia" — the DEVOCEAN Lodge AI Receptionist — into devoceanlodge.com

**Audience:** the Replit Agent (or any developer) maintaining the **devoceanlodge.com** website.
**Goal:** add the "Talk to DEVOCEAN" voice widget so visitors can speak with Mia, the lodge's AI receptionist, directly in their browser.

You do **not** need any API keys, accounts, or backend changes on the website. Mia is a self-contained app hosted separately; you only add a small snippet to the site.

---

## What Mia is

Mia is a voice receptionist. A visitor clicks a microphone button, speaks a question ("Do you have a tent free for the first weekend of July? What's that in rand?"), and Mia answers out loud in real time. She can:

- Quote **live room availability and prices** for specific dates (read-only — she never makes or changes a booking).
- Convert prices into a guest's **currency** (e.g. Rand, Euro, Pound) at live rates.
- Answer questions about the lodge — activities, location, the diving and the beach, check-in times, the booking process.

When she captures a booking enquiry, the lodge's reservations team follows up to complete it.

---

## The hosted widget URL

Everything is served from the receptionist app's permanent address:

```
https://voice-reception.replit.app
```

- Floating-button loader script: `https://voice-reception.replit.app/widget-loader.js`
- Standalone widget page (for iframes): `https://voice-reception.replit.app/widget`

> If the receptionist app is ever moved to a custom domain, swap `voice-reception.replit.app` for the new domain in the snippets below. Nothing else changes.

---

## Requirements (read before integrating)

1. **HTTPS only.** Browsers only grant microphone access on secure (`https://`) pages. devoceanlodge.com must be served over HTTPS (it already should be).
2. **Microphone permission.** The visitor's browser will ask permission to use the mic the first time they talk to Mia. This is expected.
3. **No Content-Security-Policy blocking.** If the site sets a `Content-Security-Policy` header, it must allow:
   - loading a script from `https://voice-reception.replit.app` (for Option 1), and/or
   - framing `https://voice-reception.replit.app` (for Option 2).
   See "Troubleshooting" if you're unsure.

---

## Option 1 — Floating button (recommended)

A terracotta microphone button hovers in the bottom-right corner of **every page**. Clicking it opens Mia in a popup. No layout changes needed anywhere on the site, and it loads lazily (no impact on page speed until the button is clicked).

Add this **once**, inside `<head>` or just before the closing `</body>` tag of the site's shared layout/template:

```html
<!-- DEVOCEAN AI Receptionist — floating button -->
<script src="https://voice-reception.replit.app/widget-loader.js" defer></script>
```

That's the entire integration. Because it's in the shared layout, it appears on all pages automatically.

**Where to put it in this codebase:**
- A static HTML site → add it to the shared header/footer partial (or every page's `<head>`).
- WordPress → add it via the theme's `header.php`, or a "header/footer scripts" plugin, or the Customizer's "Additional Scripts" if available.
- React/Next/Vue/Astro etc. → add it once to the root layout/`<head>` component (e.g. `app/layout.tsx`, `_document.tsx`, `index.html`, `App.vue`).

---

## Option 2 — Inline iframe (embed in a specific spot)

Use this if you want Mia to live inside a particular section of a page — for example a dedicated "Contact" or "Enquiries" area — rather than as a floating button. Paste this wherever you want the widget to appear:

```html
<!-- DEVOCEAN AI Receptionist — inline widget -->
<iframe
  src="https://voice-reception.replit.app/widget"
  width="400"
  height="520"
  style="border:none; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1);"
  allow="microphone"
  title="Talk to DEVOCEAN">
</iframe>
```

**Important:** the `allow="microphone"` attribute is required — without it the iframe cannot access the mic and Mia won't hear the visitor. You can adjust `width`/`height` to fit your layout; keep it at least ~360px wide so the controls render comfortably.

You can use **either** option, or both. Most lodges only need Option 1.

---

## How to verify it works

1. Deploy the website change to a live **HTTPS** URL (the mic will not work on a plain `http://` or some local previews).
2. Open devoceanlodge.com in a normal browser tab.
3. Option 1: look for the terracotta microphone button in the bottom-right corner and click it. Option 2: scroll to where you placed the iframe.
4. Allow microphone access when prompted.
5. Say: *"Do you have any rooms available for two people next weekend?"* — Mia should reply out loud, and for dated questions she'll quote live availability.
6. Try: *"How much is that in South African Rand?"* — she should give an approximate converted figure and note the lodge bills in US dollars.

---

## Troubleshooting

| Symptom | Likely cause & fix |
| --- | --- |
| No floating button appears | Script not loaded. Confirm the `<script>` tag is present in the served HTML and that the site is HTTPS. Check the browser console for a blocked-script error (see CSP below). |
| Button appears but nothing happens / mic never prompts | Page is not HTTPS, or the browser blocked the mic. Use an `https://` URL and allow microphone permission. |
| Iframe shows but Mia can't hear | The `allow="microphone"` attribute is missing from the `<iframe>`. Add it. |
| Console error mentioning "Content Security Policy" | The site's CSP is blocking the widget. Update the policy to allow `https://voice-reception.replit.app` — typically `script-src` (Option 1) and `frame-src`/`child-src` (Option 2). |
| Widget loads but availability/prices look wrong or unavailable | That's handled inside the receptionist app, not the website. Report it to whoever maintains the receptionist app — no website change will fix it. |

---

## What NOT to do

- Do **not** copy Mia's code into the website or rebuild the widget by hand — always load it from the hosted URL so updates (new lodge info, pricing logic, currency support) take effect automatically.
- Do **not** add API keys, tokens, or backend endpoints to the website for this — none are required.
- Do **not** place the snippet on a non-HTTPS page; the microphone will silently fail.

---

*Questions about Mia's behaviour, availability accuracy, or pricing belong to the receptionist app (`voice-reception.replit.app`), not the website. This document only covers embedding the widget on devoceanlodge.com.*
