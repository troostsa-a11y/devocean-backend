/**
 * check-route-descriptions.mjs
 *
 * Verifies that every route key declared in ROUTE_META (_middleware.js)
 * has a corresponding non-empty entry in ROUTE_DESCRIPTIONS (routeDescriptions.js).
 *
 * Run automatically as "prebuild" so a missing description fails the build
 * before Vite starts.
 *
 * Usage (manual):
 *   node scripts/check-route-descriptions.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Parse keys from a JS object literal using a simple regex.
// Matches lines like:   '/some-route': ...
// ---------------------------------------------------------------------------
function parseObjectKeys(source) {
  const keys = new Set();
  // Match single- or double-quoted keys at any indentation level.
  const re = /^\s*(['"])(\/.+?)\1\s*:/gm;
  let m;
  while ((m = re.exec(source)) !== null) {
    keys.add(m[2]);
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Parse ROUTE_META keys from _middleware.js
// We only want keys inside the ROUTE_META block, so we slice to that section.
// ---------------------------------------------------------------------------
function parseRouteMeta(source) {
  const start = source.indexOf('const ROUTE_META');
  if (start === -1) {
    throw new Error('Could not find "const ROUTE_META" in _middleware.js');
  }
  // Walk forward to find the matching closing brace for ROUTE_META = { … };
  let depth = 0;
  let inBlock = false;
  let end = start;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') { depth++; inBlock = true; }
    else if (source[i] === '}') { depth--; }
    if (inBlock && depth === 0) { end = i + 1; break; }
  }
  return parseObjectKeys(source.slice(start, end));
}

// ---------------------------------------------------------------------------
// Parse ROUTE_DESCRIPTIONS keys from routeDescriptions.js
// We also check that the value is a non-empty string.
// ---------------------------------------------------------------------------
function parseRouteDescriptions(source) {
  const descriptions = new Map(); // key → value (trimmed string or empty)

  const start = source.indexOf('export const ROUTE_DESCRIPTIONS');
  if (start === -1) {
    throw new Error('Could not find "export const ROUTE_DESCRIPTIONS" in routeDescriptions.js');
  }

  // Slice out just the ROUTE_DESCRIPTIONS block
  let depth = 0;
  let inBlock = false;
  let end = start;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') { depth++; inBlock = true; }
    else if (source[i] === '}') { depth--; }
    if (inBlock && depth === 0) { end = i + 1; break; }
  }
  const block = source.slice(start, end);

  // Match:  '/route-key':   'description text',
  //    or:  '/route-key':   "description text",
  // Capture the value so we can check it is non-empty.
  const entryRe = /(['"])(\/.+?)\1\s*:\s*(['"])([\s\S]*?)\3/g;
  let m;
  while ((m = entryRe.exec(block)) !== null) {
    descriptions.set(m[2], m[4].trim());
  }
  return descriptions;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const middlewarePath        = resolve(root, 'functions/_middleware.js');
const routeDescriptionsPath = resolve(root, 'src/utils/routeDescriptions.js');

let middlewareSrc, descriptionsSrc;
try {
  middlewareSrc    = readFileSync(middlewarePath,        'utf8');
  descriptionsSrc  = readFileSync(routeDescriptionsPath, 'utf8');
} catch (err) {
  console.error(`[check-route-descriptions] Could not read file: ${err.message}`);
  process.exit(1);
}

const routeMetaKeys    = parseRouteMeta(middlewareSrc);
const descriptions     = parseRouteDescriptions(descriptionsSrc);

const missing = [];

for (const key of routeMetaKeys) {
  if (!descriptions.has(key)) {
    missing.push({ key, reason: 'key not found in ROUTE_DESCRIPTIONS' });
  } else if (descriptions.get(key) === '') {
    missing.push({ key, reason: 'entry exists but value is empty' });
  }
}

if (missing.length > 0) {
  console.error('\n[check-route-descriptions] ❌ Build aborted — missing description entries:\n');
  for (const { key, reason } of missing) {
    console.error(`  • ${key}  (${reason})`);
  }
  console.error(
    '\nAdd each missing key to WebsiteProject/src/utils/routeDescriptions.js before building.\n'
  );
  process.exit(1);
}

console.log(
  `[check-route-descriptions] ✅ All ${routeMetaKeys.size} ROUTE_META keys have a description entry.`
);
