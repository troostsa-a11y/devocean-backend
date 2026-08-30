-- Postal / ZIP code support for Google Ads PostgreSQL customer matching.
-- Safe to run against databases that already contain any of these tables.

ALTER TABLE IF EXISTS bookings
  ADD COLUMN IF NOT EXISTS guest_postal_code TEXT;

ALTER TABLE IF EXISTS direct_bookings
  ADD COLUMN IF NOT EXISTS guest_postal_code TEXT;

ALTER TABLE IF EXISTS guests
  ADD COLUMN IF NOT EXISTS postal_code TEXT;