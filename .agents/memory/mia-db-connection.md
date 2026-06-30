---
name: Mia voice receptionist — database connection
description: Supabase connection setup for mia-voice-receptionist Render service; pooler shard, shared DB workaround, migration idempotency.
---

## Supabase Session Pooler shard is NOT guessable

The Lodge Supabase project (`fozgrzqwumnynpedpmth`, eu-west-1 Ireland) uses shard **`aws-1-eu-west-1.pooler.supabase.com`** — NOT `aws-0-*`.
The shard suffix (`aws-0`, `aws-1`, …) is assigned by Supabase and varies per project. The only reliable source is Supabase dashboard → **Connect → Session pooler** → copy the URI.
Direct Connection (`db.PROJECT.supabase.co:5432`) is IPv6 on Render free tier → ENETUNREACH. Session Pooler is IPv4, free, no add-on needed.

**Why:** Render free tier has no outbound IPv6. Session Pooler is always IPv4.

## Shared Lodge database — mia_bookings rename

Mia shares the Lodge Supabase DB with the automailer (separate DB was the intent; blocked by Supabase outage on day of setup). To avoid collision with automailer's `bookings` table, Mia's Drizzle schema uses SQL table name `mia_bookings` while the TypeScript export stays `bookings` (all routes unaffected).

**Why:** `pgTable("mia_bookings", …)` changes only the SQL name; TS variable name is independent.

Files changed: `lib/db/src/schema/bookings.ts`, `lib/db/drizzle/0000_natural_sue_storm.sql`, `lib/db/drizzle/meta/0000_snapshot.json`.

When a dedicated Mia Supabase project is created, rename back to `bookings` and update these same three files + regenerate the migration.

## Drizzle migration is transactional — no partial state

Drizzle's `migrate()` wraps each migration file in a transaction. A failure mid-file rolls back all statements in that file. On retry the migrator re-runs the whole file from scratch (tag not yet in `drizzle.__drizzle_migrations`).

**Consequence:** Make migration SQL idempotent with `CREATE TABLE IF NOT EXISTS` and `DO $$ … EXCEPTION WHEN duplicate_object THEN NULL END $$` for FK constraints, because the DB may already contain tables from an earlier attempt that succeeded before the transaction was committed.

## ENOTFOUND in Drizzle error = wrong pooler shard

When Drizzle logs `(ENOTFOUND) tenant/user postgres.PROJECT_REF not found`, this is NOT a DNS failure — it is PgBouncer rejecting the connection because the pooler shard (`aws-0-*` vs `aws-1-*`) doesn't own this project's tenant. The host resolves fine but PgBouncer returns FATAL and pg-node maps it to code ENOTFOUND.

**Fix:** get the exact pooler URL from Supabase Connect UI, don't construct it.

## SSL stripping

`lib/db/src/index.ts` strips `sslmode=` from DATABASE_URL before passing to pg Pool, then sets `ssl: { rejectUnauthorized: false }`. This is required because pg-connection-string interprets `sslmode=require` as verify-full (`rejectUnauthorized: true`), which rejects Supabase's cert.
