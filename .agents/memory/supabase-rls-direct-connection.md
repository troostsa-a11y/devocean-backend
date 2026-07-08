---
name: Supabase RLS vs. direct-connection backends
description: Why enabling Row Level Security is free defense-in-depth even when the app never uses Supabase's anon/authenticated keys.
---

## The situation

Supabase's SQL editor warns when creating a table without RLS ("clients using anon or authenticated keys may access this table"). Backends that connect via a plain Postgres connection string (e.g. `drizzle-orm/postgres-js` with `DATABASE_URL`) never go through PostgREST/anon/authenticated roles, so RLS has zero effect on their own queries.

**Why:** RLS is only enforced for roles subject to it (the `anon`/`authenticated` PostgREST roles). A direct `postgres()` connection authenticates as a role that bypasses RLS entirely, so app functionality is unaffected either way.

**How to apply:** Enable RLS anyway, with no policies, on every table — it costs nothing functionally and closes off the anon/authenticated key exposure path if that key is ever leaked or reused later (e.g. shipped in frontend code by mistake). Before deciding, grep the codebase for `@supabase/supabase-js` / anon key usage to confirm the app really is direct-connection-only; if it uses the Supabase client library anywhere, RLS *does* affect it and needs real policies, not just "enable with no policies."
