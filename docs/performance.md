# WebsiteProject — Performance, Features & Architecture Notes

## Lazy Loading

- **Eager (must NOT lazy-load)**: `Header`, `HeroSection`, `AccommodationsSection`, `ExperiencesSection`, `TodoSection` — they render immediately on the homepage; lazy-loading them regresses CLS/TBT.
- **Lazy**: `GallerySection`, `LocationSection`, `ContactSection`, `Footer`, all route pages.
- **ExcelJS**: dynamically imported in `AdminPage.jsx` only on export — keeps the 920 KB chunk off the critical path.

## Hero Image Mobile Focal Points

- On mobile, hero photos are cropped (portrait viewport, landscape photo). `mobileObjectClass` in `HERO_IMAGES` (`src/data/content.js`) sets CSS `object-position`. Desktop (`sm:`+) reverts to `object-center`.
- Current (Jun 2026): hero01 65/50 (lodge), hero02 75/30 (divers), hero03 45/50 (dolphins), hero04 70/50 (game), hero05 87/50 (hike). Adjust `mobileObjectClass` then redeploy.

## Hero Overlay + LCP

Full reasoning in `.agents/memory/hero-overlay-lcp.md` + `hero-cls-fix.md`. Key rules:
- **LCP = `#hero-title` text, not the hero image** — full-viewport `<img>` is excluded by Chrome's "full-viewport = background" heuristic. No image change can fix hero LCP.
- **Do NOT re-enable CookieYes IAB TCF v2.3** — fetches 118 KB IAB vendor list, wins LCP at ~10 s on Slow 4G. Disabled Jun 2026; standard GDPR banner only.
- **`HeroSection` uses `items-start`, NOT `items-center`** — centering shifts text when translations load.
- **Do NOT hide `#root`** during overlay (`html.hero-active #root { opacity: 0 }` delays LCP).
- **Placeholder + React padding must stay in lockstep**: React uses `--header-h`; placeholder uses `--stack-h`. Do NOT give `HeroSection` `--stack-h` padding — double-counts the topbar → CLS jump.
- **CLS sync values** (small phones `<640px`): React content padding `pt-[calc(var(--header-h)_-_1rem)]`; placeholder mirrors `calc(var(--stack-h) - 1rem)`. Use `639.98px` not `639px` to exactly complement Tailwind `sm:`.
- **Mobile (`<640px`) hides `#hero-title`** (display:none, stays in DOM for SEO/i18n); LCP falls to `#hero-subtitle`. React subtitle: `mt-14 sm:mt-4 text-xl` at all widths.
- **Script at bottom**: React entry `<script type="module">` is re-appended to `<body>` end by `moveScriptToBody` plugin in `vite.config.js`. Do NOT set `build.modulePreload: false` — removes parallel chunk hints → sequential waterfall.
- **Homepage guard**: placeholder bails on non-`/` paths and on `/#hash` deep links to avoid 5 s flash.

## Consent & Analytics

- **CookieYes**: loaded immediately (GDPR); `<link rel="preconnect" href="https://cdn-cookieyes.com">` in `<head>`.
- **GTM + Engagement Tracker**: deferred until first interaction (click/keydown/touchstart), 15 s fallback — keeps GTM out of Lighthouse TBT.

## GA4 Attribution Pipeline

- "Book Now" clicks fire `trackBookingSession()` → CF Function `functions/api/track-session.js` → automailer `/api/track-session` → `booking_sessions` (Supabase). When a Beds24 confirmation email arrives, `matchBookingSession()` joins by language + country within a 30-min window, then `fireGA4Conversion()` sends a `purchase` event via GA4 Measurement Protocol with the original browser `client_id`.
- **Render env**: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`. **CF env**: `AUTOMAILER_URL` (in `wrangler.toml`); `ADMIN_API_KEY` (CF secret, uploaded by `deploy.sh`).

## Native Direct Booking (Beds24 REST API + Stripe deposit)

- Native flow at `/book-direct` (confirmation `/booking-confirmed`). Guest picks dates/room, pays a deposit via Stripe Checkout, balance on arrival.
- **Payment is the source of truth**: Beds24 booking created only from a signature-verified Stripe `checkout.session.completed` webhook. Server recomputes price + deposit from a fresh Beds24 quote at checkout and again at webhook — client amounts never trusted.
- **Double-booking guard**: room re-checked at webhook time; if sold out, deposit auto-refunded and booking marked `sold_out_refunded`.
- **Emails + GA4 fire from the webhook, not IMAP**: Beds24 sends no notification email for REST-API bookings. Stripe webhook calls `emailService.createManualBooking(...)` which schedules guest emails and is the GA4 fire point. Attribution via `EmailAutomationService.attributeBooking()` (shared by native + IMAP paths); `ga4_conversion_fired_at` enforces single-fire.
- **Data**: `direct_bookings` table (deposit/balance/Stripe refs/Beds24 id/status); SQL in `render-automailer/migrations/add_direct_bookings.sql`.
- **Backend**: `server/services/beds24.ts`, `stripe-booking.ts`, `server/config/booking-config.ts`. Routes in `server/routes/booking.ts`.
- **Frontend proxy**: CF Functions in `functions/api/booking/*` inject `x-admin-key` + `cf-ipcountry`; browser never sees the admin key.
- **Render env**: `BEDS24_REFRESH_TOKEN`, `BEDS24_PROP_ID`, `BEDS24_API_BASE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; optional `DEPOSIT_PERCENT` (50), `CANCELLATION_POLICY_DAYS` (30), `BOOKING_CURRENCY` (USD), `PUBLIC_SITE_URL`.
- **Stripe webhook**: `https://devocean-automailer.onrender.com/api/booking/webhook` for `checkout.session.completed`.

## Discount Codes (book-direct discounts)

- **Naming**: UI labels say "Discount Code" throughout. The underlying DB table and column are still `coupon_codes` / `coupon_code` — do NOT rename the DB objects. `BOOKING_STRINGS` key is `discountCodeApplied`; admin API endpoint is `/api/admin/discount-codes`.
- Reusable phrase codes only (e.g. `DEVOCEANVIP` 10% percent-off, `TRTS0807` $32 fixed-off) — Beds24's One-Time-Use Voucher box is out of scope.
- **Admin-managed, no redeploy needed**: created/edited/deactivated from the existing `/admin` page's "Discount Codes" tab, backed by the `coupon_codes` table (`code`, `type` percent|fixed, `value`, `active`). Admin routes live in `render-automailer/server.ts`.
- **Discount math**: applied to the quoted total before the deposit split, except last-minute offers — those keep the existing 100% deposit rule regardless of discount. Normal stays still split 50/50 on the *discounted* total.
- **NR (non-refundable) rate plans ARE shown to guests**: displayed as the cheaper option in the rate picker. Deposit for NR is always 100% upfront (same as LM last-minute) — handled in `getDepositPercentForOffer`. Under the NR option the UI shows "Non-refundable · Full payment now · Rate conditions" where "Rate conditions" links to `https://devoceanlodge.com/legal/terms#cancel`. Cart summary appends `(Full payment now)` via `withRateNote()`. NR is sorted first (cheapest) by `priceOffers()` since offers are sorted ascending by price.
- **Beds24 record**: the discount is written into the Beds24 booking (not just Stripe/DB-side) so the PMS reflects the real charged amount.
- **Data**: `coupon_code` and `discount_amount` columns on `direct_bookings`; migration in `render-automailer/migrations/add_coupon_codes.sql`. Applied directly via the Supabase SQL editor (this DB isn't Replit-managed, so there's no Publish-time schema diff step — migrations here are run by hand against production).
- **Frontend**: discount code input + discount line in `BookDirectPage.jsx` and `BookingConfirmedPage.jsx`; i18n keys in `bookingStrings.js` across all 20 base langs for both `BOOKING_STRINGS` and `CONFIRM_STRINGS`.

## Gift Vouchers

- **Flow**: purchaser visits `/gift-vouchers` (`GiftVouchersPage.jsx`), picks a denomination ($20/$50/$100/$200/$500), enters their name + email (+ optional recipient name + personal message), pays via Stripe Checkout. On `checkout.session.completed` webhook the server generates a one-time-use code (`GV-XXXX-XXXX-XXXX`), stores it in the `gift_vouchers` table, and emails the code to the purchaser. Confirmation page at `/gift-confirmed` (`GiftConfirmedPage.jsx`).
- **Redemption**: `/book-direct` search form has a "Gift Voucher Code" input alongside the discount code field. The quote endpoint (`/api/booking/quote`) validates the code, deducts the voucher amount from the total, and returns `voucherApplied`, `voucherAmountApplied`, `voucherError`. The voucher code and discount amount are written to `direct_bookings` (`voucher_code`, `voucher_discount`) at checkout; the voucher row is marked `redeemed` at Stripe webhook time.
- **DB table** (`gift_vouchers`): `id`, `code` (unique, `GV-XXXX-XXXX-XXXX`), `amount_usd`, `purchaser_email`, `purchaser_name`, `recipient_name`, `message`, `stripe_session_id`, `status` (active/redeemed/expired/cancelled), `redeemed_at`, `redeemed_by_booking_id`, `created_at`.
- **DB migration** (run manually in Supabase SQL editor, Automailer project):
  ```sql
  -- gift_vouchers table (see render-automailer/migrations/add_gift_vouchers.sql)
  -- Plus columns on direct_bookings:
  ALTER TABLE direct_bookings
    ADD COLUMN IF NOT EXISTS voucher_code     text,
    ADD COLUMN IF NOT EXISTS voucher_discount numeric(10,2);
  ```
- **Backend routes** (all in `render-automailer/server.ts` + `server/routes/booking.ts`): `POST /api/gift-voucher/checkout` (creates Stripe session), `GET /api/gift-voucher/confirm/:sessionId` (polls status after redirect), `GET /api/gift-voucher/validate?code=` (used by quote endpoint).
- **Stripe webhook**: same `checkout.session.completed` handler as direct bookings; gift-voucher sessions are distinguished by `metadata.type === 'gift_voucher'`.
- **CF Functions**: `functions/api/gift-voucher/checkout.js` and `confirm.js` — proxy to automailer, inject `x-admin-key`.
- **Drizzle schema**: `giftVouchers` table in `render-automailer/shared/schema.ts`; `voucherCode` + `voucherDiscount` columns on `directBookings`.
- **Email**: sent via automailer's existing SMTP credentials (`MAIL_HOST` / `MAIL_PORT` / `IMAP_USER` / `IMAP_PASSWORD`). No new env vars required.
- **Promo banner**: amber gift-icon banner at the bottom of the `/book-direct` search card links to `/gift-vouchers`.
- **Page layout**: `GiftVouchersPage` and `GiftConfirmedPage` use `pt-[var(--stack-h)]` to clear the fixed site Header; no secondary header bar — a simple inline "← Back to booking" link sits at the top of the content area.

## Date Range Picker (book-direct search)

- `DateRangePicker.jsx`: dual-month range calendar built on **luxon** (not react-day-picker). Monday-first, names via `DateTime.setLocale(lang)` / `Info.weekdays`. Dates stay `YYYY-MM-DD` strings throughout.
- First click sets check-in + default 1-night checkout; second click sets checkout and closes. Checkout always strictly after check-in.
- **Rate-tier coloring**: cells tinted Blue→Red by relative Beds24 per-date rates (display-only). Backend: `getPriceCalendar` → `GET /api/booking/calendar`. Bucketing: ≤5 distinct prices = exact map; else p5/p95-trimmed equal-width bands.
- **i18n**: booking copy in all 20 base langs (`bookingStrings.js`). Each lang object must carry every key — partial objects render `undefined`, not EN fallback.

## Mobile Menu Accessibility

- `#mnav` drawer is always in the DOM (CSS transform/opacity). When closed: `inert=""` + `visibility: hidden`. Do NOT reintroduce `aria-hidden` — triggers Chrome WAI-ARIA warning when a focused descendant is hidden.
