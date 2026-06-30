---
name: Mia voice receptionist — database connection
description: Supabase connection setup for mia-voice-receptionist Render service; pooler shard, dedicated DB, migration idempotency.
---

## Dedicated Reception Supabase project

Mia uses its own Supabase project (ref `rrtbnknothjiowvqxbjo`, eu-west-3 Paris) — separate from the Lodge/automailer DB. Session pooler: `aws-0-eu-west-3.pooler.supabase.com:5432`. Tables: `conversations`, `messages`, `bookings`, `integration_tokens`.

**Why:** Lodge DB collision with automailer's `bookings` table was an early workaround (see migration `0001_rename_mia_bookings` which reversed itself once the dedicated project was created). With a dedicated DB the schema uses the plain name `bookings`.

## Session Pooler shard is not guessable

The shard suffix (`aws-0-*`, `aws-1-*`) is assigned per-project by Supabase. Get the exact URI from Supabase dashboard → Connect → Session pooler. Direct Connection (`db.PROJECT.supabase.co:5432`) is IPv6-only on Render free tier → ENETUNREACH. Session Pooler is IPv4, no add-on needed.

## ENOTFOUND = wrong pooler shard, not DNS

When Drizzle logs `(ENOTFOUND) tenant/user postgres.PROJECT_REF not found`, PgBouncer is rejecting the tenant because the shard doesn't own it. The hostname resolves; pg-node maps the FATAL to ENOTFOUND. Fix: copy URL from Supabase Connect UI verbatim.

## SSL stripping

`lib/db/src/index.ts` strips `sslmode=` from DATABASE_URL and sets `ssl: { rejectUnauthorized: false }`. Required because pg-connection-string maps `sslmode=require` → verify-full (`rejectUnauthorized: true`), which rejects Supabase's cert.

## Drizzle migrations are transactional

Each migration file runs in a transaction. Partial failure rolls back. Make SQL idempotent (`CREATE TABLE IF NOT EXISTS`, `DO $$ EXCEPTION WHEN duplicate_object THEN NULL END $$` for FKs) in case an earlier attempt created tables before the commit.
