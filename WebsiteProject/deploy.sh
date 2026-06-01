#!/usr/bin/env bash
# Build and deploy to Cloudflare Pages.
#
# Requires Node >=22 (wrangler@4 engine requirement).
#
# Usage:
#   bash deploy.sh                  # build + clean + deploy (production)
#   bash deploy.sh --preview        # build + clean + deploy (preview channel)

set -e

echo "▶ Building..."
npm run build

echo "▶ Removing dist/functions/ (source files must not reach Cloudflare as static assets)..."
rm -rf dist/functions/

echo "▶ Deploying to Cloudflare Pages..."
if [[ "$1" == "--preview" ]]; then
  npx wrangler pages deploy ./dist --branch preview
else
  npx wrangler pages deploy ./dist
fi

echo "✓ Done"
