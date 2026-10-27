#!/usr/bin/env bash
# Build and deploy to Cloudflare Pages.
#
# Requires Node >=22 (wrangler@4 engine requirement).
#
# Usage (from the WebsiteProject/ directory):
#   bash deploy.sh              # build + deploy → production (main branch)
#   bash deploy.sh --preview    # build + deploy → preview channel

set -e
source "$(dirname "${BASH_SOURCE[0]}")/scripts/verify-live-page.sh"

# Replit's sandbox has no real git repo; wrangler needs GIT_DIR to be set
# to *something* or it errors out trying to detect the branch.
# On a local machine with a proper git repo this variable is already set,
# so this line is a no-op there.
export GIT_DIR="${GIT_DIR:-/tmp/fakegit}"

echo "▶ Building..."
npm run build

echo "▶ Removing dist/functions/ (source files must not reach Cloudflare as static assets)..."
rm -rf dist/functions/

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

# Per-deploy build marker. This must be the final operation on dist before
# upload: another build can otherwise finish while secrets are syncing and
# replace index.html after it was marked, causing a false stale-deploy failure.
# Injecting a unique comment into every HTML page:
#  1. changes each file's content hash so wrangler can never "already uploaded"
#     dedupe-skip a page, and
#  2. gives the post-deploy smoke check below a string to verify on the live site.
BUILD_MARKER="build-$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM"
echo "▶ Injecting build marker into HTML pages: $BUILD_MARKER"
find dist -name '*.html' -print0 | while IFS= read -r -d '' f; do
  printf '\n<!-- %s -->\n' "$BUILD_MARKER" >> "$f"
done

if ! grep -Fq "$BUILD_MARKER" dist/index.html; then
  echo "✗ DEPLOY ABORTED: dist/index.html lost its build marker before upload."
  echo "  Another build may be writing to dist; wait for it to finish and retry."
  exit 1
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
  "/canceled.html"
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
    if verify_live_page "$SMOKE_BASE" "$path" "$BUILD_MARKER" "$is_guide" 2>/dev/null; then
      ok=1
      break
    fi
    [[ "$LIVE_VERIFY_ERROR" == *"standalone guide"* ]] &&
      echo "  ⚠ ${path} — old standalone HTML on attempt $attempt (retrying…)"
    if [[ $attempt -lt 10 ]]; then sleep 10; fi
  done
  if [[ $ok -eq 1 ]]; then
    if [[ "$path" == "/canceled" || "$path" == "/canceled.html" ]]; then
      echo "  ✓ ${path} redirects correctly; destination serves new build"
    else
      echo "  ✓ ${path} serves new build"
    fi
  else
    echo "  ✗ ${path} verification failed after retries: $LIVE_VERIFY_ERROR"
    SMOKE_FAILED=1
    STALE_PATHS+=("$path")
  fi
done

if [[ $SMOKE_FAILED -ne 0 ]]; then
  echo "✗ DEPLOY VERIFICATION FAILED: live build or route checks did not pass."
  echo "  Check the reported HTTP, redirect, or build-marker failure before assuming stale cache."

  # Email an ops alert via the automailer's alert transport so a failed check
  # is never missed even when nobody is watching this terminal. Best-effort:
  # a failed alert must not mask the real exit-1 failure below.
  AUTOMAILER_URL="${AUTOMAILER_URL:-https://devocean-automailer.onrender.com}"
  if [[ -n "$ADMIN_API_KEY" ]]; then
    echo "▶ Sending deployment-verification ops alert email..."
    alert_lines=""
    for path in "${STALE_PATHS[@]}"; do
      alert_lines+="\"Failed verification: ${SMOKE_BASE}${path}\","
    done
    alert_payload=$(printf '{"subject":"Deployment verification failed: devoceanlodge.com","lines":[%s"Expected build marker: %s","Deployed at: %s","One or more HTML, redirect, or build-marker checks failed.","Action: inspect the verification output before rebuilding or purging the Cloudflare cache."]}' \
      "$alert_lines" "$BUILD_MARKER" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")
    if curl -fsS -m 30 -X POST "${AUTOMAILER_URL}/api/booking/ops-alert" \
      -H 'Content-Type: application/json' -H "x-admin-key: $ADMIN_API_KEY" \
      -d "$alert_payload" >/dev/null 2>&1; then
      echo "  ✓ Ops alert email sent"
    else
      echo "  ⚠ Ops alert email FAILED to send — verification failure is only visible here"
    fi
  else
    echo "  ⚠ ADMIN_API_KEY not set — cannot send stale-deploy ops alert email"
  fi

  exit 1
fi

echo "✓ Done — live site verified on: ${SMOKE_PATHS[*]}"
