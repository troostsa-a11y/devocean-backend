-- Reusable phrase-discount coupon codes for the native /book-direct flow.
-- NOT Beds24's One-Time-Use Voucher Codes box (that stays out of scope).
-- Run this against the production Supabase database before deploying the
-- updated render-automailer to Render.

CREATE TABLE IF NOT EXISTS coupon_codes (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL,               -- 'percent' | 'fixed'
  value      DECIMAL(10,2) NOT NULL,      -- percent (0-100) or fixed major-unit amount
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Coupon fields on direct_bookings. discount_amount is the whole-cart amount
-- already subtracted from total_amount (total_amount is NET, post-discount).
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE direct_bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);
