#!/bin/bash
set -e
npm ci --no-audit --no-fund
# The website has its own npm tree; root installation alone leaves stale parsers.
npm --prefix WebsiteProject ci --no-audit --no-fund
# Force a clean workspace link so cached pnpm patches are actually applied.
pnpm --dir voice-reception install --frozen-lockfile --force
