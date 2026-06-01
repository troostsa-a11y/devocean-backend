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

echo "▶ Setting ADMIN_API_KEY secret on Cloudflare Pages..."
if [[ -n "$ADMIN_API_KEY" ]]; then
  echo "$ADMIN_API_KEY" | npx wrangler pages secret put ADMIN_API_KEY --project-name devocean-lodge
else
  echo "⚠ ADMIN_API_KEY env var not set — skipping secret upload"
fi

echo "▶ Deploying to Cloudflare Pages..."
if [[ "$1" == "--preview" ]]; then
  npx wrangler pages deploy ./dist --branch preview
else
  npx wrangler pages deploy ./dist --branch main
fi

echo "✓ Done"
