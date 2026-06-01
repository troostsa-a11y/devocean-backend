#!/usr/bin/env bash
# Build and deploy to Cloudflare Pages.
#
# Uses wrangler@3 explicitly — wrangler 4 requires Node >=22 but this
# environment runs Node 20. Wrangler 3 supports Node 18+.
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
  npx wrangler@3 pages deploy ./dist --branch preview
else
  npx wrangler@3 pages deploy ./dist
fi

echo "✓ Done"
