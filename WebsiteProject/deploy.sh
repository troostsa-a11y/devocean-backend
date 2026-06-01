#!/usr/bin/env bash
# Build and deploy to Cloudflare Pages.
#
# The npm build script copies functions/ into dist/ (for legacy reasons),
# but dist/functions/ must not exist when wrangler deploys — Cloudflare Pages
# would try to use the raw unbundled source files as Workers, causing Error 1101.
# Wrangler compiles the real functions/ bundle automatically from the project root.
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
