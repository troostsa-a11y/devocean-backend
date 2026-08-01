#!/usr/bin/env bash
# Build and deploy to Cloudflare Pages.
#
# Requires Node >=22 (wrangler@4 engine requirement).
#
# Usage (from the WebsiteProject/ directory):
#   bash deploy.sh              # build + deploy → production (main branch)
#   bash deploy.sh --preview    # build + deploy → preview channel

set -e

# Replit's sandbox has no real git repo; wrangler needs GIT_DIR to be set
# to *something* or it errors out trying to detect the branch.
# On a local machine with a proper git repo this variable is already set,
# so this line is a no-op there.
export GIT_DIR="${GIT_DIR:-/tmp/fakegit}"

echo "▶ Building..."
npm run build

echo "▶ Removing dist/functions/ (source files must not reach Cloudflare as static assets)..."
rm -rf dist/functions/

# Per-deploy build marker. Injecting a unique comment into every HTML page:
#  1. changes each file's content hash so wrangler can never "already uploaded"
#     dedupe-skip a page (the Task 82 silent-stale-deploy failure mode), and
#  2. gives the post-deploy smoke check below a string to verify on the live site.
BUILD_MARKER="build-$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM"
echo "▶ Injecting build marker into HTML pages: $BUILD_MARKER"
find dist -name '*.html' -print0 | while IFS= read -r -d '' f; do
  printf '\n<!-- %s -->\n' "$BUILD_MARKER" >> "$f"
done

echo "▶ Setting ADMIN_API_KEY secret on Cloudflare Pages..."
if [[ -n "$ADMIN_API_KEY" ]]; then
  echo "$ADMIN_API_KEY" | npx wrangler pages secret put ADMIN_API_KEY --project-name devocean-lodge
else
  echo "⚠ ADMIN_API_KEY env var not set — skipping secret upload"
fi

echo "▶ Setting GOOGLE_MAPS_API_KEY secret on Cloudflare Pages..."
if [[ -n "$GOOGLE_MAPS_API_KEY" ]]; then
  echo "$GOOGLE_MAPS_API_KEY" | npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name devocean-lodge
else
  echo "⚠ GOOGLE_MAPS_API_KEY env var not set — skipping secret upload"
fi

echo "▶ Deploying to Cloudflare Pages..."
if [[ "$1" == "--preview" ]]; then
  npx wrangler pages deploy ./dist --branch preview
else
  npx wrangler pages deploy ./dist --branch main
fi

if [[ "$1" == "--preview" ]]; then
  echo "▶ Preview deploy — skipping production smoke check"
  echo "✓ Done"
  exit 0
fi

echo "▶ Verifying live site serves the new build (marker: $BUILD_MARKER)..."
SMOKE_BASE="https://devoceanlodge.com"
SMOKE_PATHS=(
  "/"
  "/story"
  "/book-direct"
  "/thankyou"
  "/canceled"
  # Guide pages — previously existed as standalone HTML files; verify they now
  # serve the SPA shell (which carries the build marker) rather than a stale
  # pre-React standalone page (which would not).
  "/ponta-do-ouro-without-4x4"
  "/ponta-do-ouro"
  "/getting-to-ponta-do-ouro"
  "/ponta-do-ouro-accommodation"
  "/safari-tents-ponta-do-ouro"
  "/devocean-lodge-meals"
)
SMOKE_FAILED=0
STALE_PATHS=()

# Guide pages that were once standalone HTML files (loaded /js/shared-nav.js).
# These must be tested at the BARE URL — adding a ?query string bypasses
# CF Pages' clean-URL static-file matching and causes a false pass (the SPA
# shell is served for the query URL while the stale file still wins the clean
# URL).  We also assert shared-nav.js is absent to catch the old format.
GUIDE_PATHS=(
  "/ponta-do-ouro-without-4x4"
  "/ponta-do-ouro"
  "/getting-to-ponta-do-ouro"
  "/ponta-do-ouro-accommodation"
  "/safari-tents-ponta-do-ouro"
  "/devocean-lodge-meals"
)

for path in "${SMOKE_PATHS[@]}"; do
  ok=0
  # Determine whether to use a cache-busting query string.
  # Guide pages must be tested at the bare URL (see comment above).
  is_guide=0
  for gp in "${GUIDE_PATHS[@]}"; do
    [[ "$path" == "$gp" ]] && is_guide=1 && break
  done

  # Edge propagation can lag a few seconds; retry briefly before failing.
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if [[ $is_guide -eq 1 ]]; then
      # Bare URL — no query string — so CF Pages' clean-URL file matching
      # is exercised.  Cache-Control: no-cache asks edges not to serve stale.
      body=$(curl -fsS -H 'Accept: text/html' -H 'Cache-Control: no-cache' \
        "${SMOKE_BASE}${path}" 2>/dev/null || true)
      # If old standalone format is detected (shared-nav.js present), log a
      # warning and let the retry loop continue — edge propagation may lag.
      if [[ "$body" == *"shared-nav.js"* ]]; then
        echo "  ⚠ ${path} — old standalone HTML on attempt $attempt (retrying…)"
      fi
    else
      body=$(curl -fsS -H 'Accept: text/html' -H 'Cache-Control: no-cache' \
        "${SMOKE_BASE}${path}?smoke=$(date +%s)" 2>/dev/null || true)
    fi
    if [[ "$body" == *"$BUILD_MARKER"* ]]; then
      ok=1
      break
    fi
    sleep 10
  done
  if [[ $ok -eq 1 ]]; then
    echo "  ✓ ${path} serves new build"
  else
    echo "  ✗ ${path} is STALE — marker $BUILD_MARKER not found after retries"
    SMOKE_FAILED=1
    STALE_PATHS+=("$path")
  fi
done

if [[ $SMOKE_FAILED -ne 0 ]]; then
  echo "✗ DEPLOY VERIFICATION FAILED: production is serving stale pages."
  echo "  Wrangler may have dedupe-skipped uploads or the edge cache is stuck."

  # Email an ops alert via the automailer's alert transport so a stale deploy
  # is never missed even when nobody is watching this terminal. Best-effort:
  # a failed alert must not mask the real exit-1 failure below.
  AUTOMAILER_URL="${AUTOMAILER_URL:-https://devocean-automailer.onrender.com}"
  if [[ -n "$ADMIN_API_KEY" ]]; then
    echo "▶ Sending stale-deploy ops alert email..."
    alert_lines=""
    for path in "${STALE_PATHS[@]}"; do
      alert_lines+="\"Stale path: ${SMOKE_BASE}${path}\","
    done
    alert_payload=$(printf '{"subject":"Stale deploy: devoceanlodge.com serving old build","lines":[%s"Missing build marker: %s","Deployed at: %s","Wrangler may have dedupe-skipped uploads or the edge cache is stuck.","Action: re-run deploy.sh or purge the Cloudflare cache, then verify the marker appears in view-source."]}' \
      "$alert_lines" "$BUILD_MARKER" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")
    if curl -fsS -m 30 -X POST "${AUTOMAILER_URL}/api/booking/ops-alert" \
      -H 'Content-Type: application/json' -H "x-admin-key: $ADMIN_API_KEY" \
      -d "$alert_payload" >/dev/null 2>&1; then
      echo "  ✓ Ops alert email sent"
    else
      echo "  ⚠ Ops alert email FAILED to send — stale deploy is only visible here"
    fi
  else
    echo "  ⚠ ADMIN_API_KEY not set — cannot send stale-deploy ops alert email"
  fi

  exit 1
fi

echo "✓ Done — live site verified on: ${SMOKE_PATHS[*]}"
