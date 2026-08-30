---
name: Google Ads postal-code import requirement
description: The PostgreSQL-to-Google Ads import skips records without a postal or ZIP code.
---

The booking-to-Google Ads export path must provide a non-empty postal/ZIP code for each new customer record.

**Why:** The connected Google Ads PostgreSQL importer does not import rows when the postal-code value is missing.

**How to apply:** Keep postal code collection required in direct booking checkout and persist it through the booking and guest CRM records. Do not use placeholder values; preserve the guest's real country-specific postal format.