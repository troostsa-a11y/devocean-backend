-- GA4 attribution for the native /book-direct flow.
-- Stores the visitor's GA4 client_id (captured at checkout) on the direct
-- booking, plus the timestamp its server-side `purchase` event was fired so the
-- IMAP email-ingest path attributes each booking exactly once with real revenue.
-- Run this against the production Supabase database BEFORE deploying the updated
-- render-automailer to Render. (The automailer also self-applies these columns
-- idempotently at startup via initDirectBookingsTable(); this file just makes
-- the change explicit and auditable.)

ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS ga_client_id TEXT;
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS ga4_conversion_fired_at TIMESTAMP;

-- Covers the attribution fallback lookup (guest email + check-in date among
-- recent confirmed rows).
CREATE INDEX IF NOT EXISTS idx_direct_bookings_attribution
  ON direct_bookings (lower(guest_email), check_in_date, status, created_at);
