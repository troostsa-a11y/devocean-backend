---
name: Supabase MCP + opencode agentic coding
description: Supabase MCP server enables AI agents to query, migrate, and manage Supabase projects directly. Relevant to both DB projects in this monorepo and the Marin agentic-booking roadmap.
---

# Supabase MCP + Agentic Coding

**Source**: https://supabase.com/blog/agentic-coding-on-supabase-with-opencode (July 2026)

## What it is

Supabase now has an official MCP server that gives AI coding agents direct access to Supabase projects — schema inspection, SQL execution, migrations, Edge Function deployment, and log access. The MCP server also exposes a `search_docs` tool for self-RAG against live Supabase docs.

OpenCode (180k GitHub stars, 7.5M MAU) is the featured agent; the integration is `/supabase` → authenticate → MCP tools active.

**Key links:**
- MCP docs: https://supabase.com/docs/guides/ai-tools/mcp
- Agent skills (Postgres best practices): https://github.com/supabase/agent-skills
- Remote MCP server: https://supabase.com/blog/remote-mcp-server

## Relevance to this project

### 1. Two live Supabase projects
- **Lodge/automailer DB** (eu-west-3 pooler) — bookings, scheduled emails, guests, sessions
- **Reception DB** (aws-0-eu-west-3, separate project) — conversations, messages, Marin session data

Both can be connected to the Supabase MCP server. This would give an agent direct schema visibility and safe query/migration capability without manual SQL steps.

### 2. Marin agentic-booking roadmap
`docs/agentic-booking-roadmap.md` is phasing toward Marin writing bookings back to Beds24 and handling payments. The Supabase MCP would be the natural DB tool layer for Marin's booking-confirmation flow — the agent (Marin or a background task) could verify, write, and confirm booking records directly.

### 3. Schema management workflow note
Supabase's recommended agent workflow: **iterate schema directly via `execute_sql`** (no migration per DDL), run DB advisors when stable, then commit one migration. This conflicts with the Drizzle ORM approach used here (Drizzle migrations are the source of truth). **Stick with Drizzle migrations** for this project — do not use the raw `execute_sql` schema pattern.

### 4. Postgres best-practice skills
The agent skills repo (8 categories: Query Performance, Connection Management, etc.) is worth reviewing before any DB work — especially the critical-priority categories.

## How to use (if connecting in future)

```bash
# stdio transport (local)
npx @supabase/mcp-server-supabase --project-ref <ref> --read-only
```

The `--read-only` flag is important for production: limits the agent to SELECT queries, preventing accidental mutations.

**Why:** Both Replit's `database` skill and this MCP approach serve overlapping purposes. MCP is more capable (schema introspection, migrations) but requires explicit setup per project. The existing `database` skill is sufficient for read-only production queries. MCP becomes the better choice when an agent needs to write migrations or deploy functions.
