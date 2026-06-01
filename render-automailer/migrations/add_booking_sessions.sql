-- GA4 attribution: stores browser client_id at "Book Now" click time.
-- Run this against the production Supabase database before deploying the
-- updated render-automailer to Render.

CREATE TABLE IF NOT EXISTS booking_sessions (
  id           SERIAL PRIMARY KEY,
  ga_client_id VARCHAR(64) NOT NULL,
  language     VARCHAR(8),
  country      VARCHAR(8),
  currency     VARCHAR(8),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Composite index covers the match query: language + time window DESC
CREATE INDEX IF NOT EXISTS idx_sessions_time_lang
  ON booking_sessions (language, created_at DESC);
