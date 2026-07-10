-- Migration: gift_vouchers table + voucher columns on direct_bookings
-- Run manually against production Supabase SQL editor.
-- All statements are idempotent (IF NOT EXISTS / IF NOT EXISTS column).

CREATE TABLE IF NOT EXISTS gift_vouchers (
  id                      SERIAL PRIMARY KEY,
  code                    TEXT UNIQUE,
  amount_usd              DECIMAL(10,2) NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'pending',
  purchaser_email         TEXT NOT NULL,
  purchaser_name          TEXT,
  recipient_name          TEXT,
  message                 TEXT,
  stripe_session_id       TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  expires_at              TIMESTAMPTZ NOT NULL,
  redeemed_at             TIMESTAMPTZ,
  redeemed_booking_id     INTEGER,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_vouchers_code           ON gift_vouchers(code);
CREATE INDEX IF NOT EXISTS idx_gift_vouchers_stripe_session ON gift_vouchers(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_gift_vouchers_status         ON gift_vouchers(status);

-- Voucher redemption columns on direct_bookings (idempotent)
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS voucher_code     TEXT;
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS voucher_discount DECIMAL(10,2);
