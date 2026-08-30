-- Dedicated Google Ads Customer Match source.
-- Keeps the connector input deliberately simple: two normalized, non-null
-- identifiers and only contacts who remain subscribed.
CREATE OR REPLACE VIEW public.google_ads_customer_match AS
SELECT
  lower(btrim(email)) AS email,
  regexp_replace(phone, '[^0-9+]', '', 'g') AS phone
FROM public.guests
WHERE subscribed IS TRUE
  AND btrim(email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  AND regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g') ~ '^\+[1-9][0-9]{7,14}$';

COMMENT ON VIEW public.google_ads_customer_match IS
  'Normalized, consent-filtered email and phone identifiers for Google Ads Customer Match.';