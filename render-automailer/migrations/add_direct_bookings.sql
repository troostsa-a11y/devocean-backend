-- Native direct-booking flow: deposit/balance + Stripe + Beds24 tracking.
-- Run this against the production Supabase database before deploying the
-- updated render-automailer to Render.

CREATE TABLE IF NOT EXISTS direct_bookings (
  id                       SERIAL PRIMARY KEY,
  session_ref              TEXT NOT NULL UNIQUE,

  stripe_session_id        TEXT,
  stripe_payment_intent_id TEXT,

  room_id                  TEXT NOT NULL,
  room_name                TEXT,
  check_in_date            TEXT NOT NULL,
  check_out_date           TEXT NOT NULL,
  num_adults               INTEGER NOT NULL DEFAULT 2,
  num_children             INTEGER NOT NULL DEFAULT 0,

  offer_id                 INTEGER,
  offer_name               TEXT,

  guest_first_name         TEXT NOT NULL,
  guest_last_name          TEXT,
  guest_email              TEXT NOT NULL,
  guest_phone              TEXT,
  guest_country            TEXT,
  guest_language           TEXT NOT NULL DEFAULT 'EN',

  currency                 TEXT NOT NULL DEFAULT 'USD',
  total_amount             DECIMAL(10,2) NOT NULL,
  deposit_amount           DECIMAL(10,2) NOT NULL,
  balance_due              DECIMAL(10,2) NOT NULL,
  deposit_percent          INTEGER NOT NULL DEFAULT 30,

  -- Multi-room ("per-type cart") expansion: one leg per physical room reserved.
  legs                     JSONB,

  payment_status           TEXT NOT NULL DEFAULT 'pending',
  status                   TEXT NOT NULL DEFAULT 'pending',
  beds24_booking_id        TEXT,
  error_message            TEXT,

  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_direct_bookings_stripe_session
  ON direct_bookings (stripe_session_id);

-- Idempotent upgrades for tables created before the rate-plan columns existed.
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS offer_id INTEGER;
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS offer_name TEXT;

-- Idempotent upgrade for multi-room ("per-type cart") bookings.
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS legs JSONB;
