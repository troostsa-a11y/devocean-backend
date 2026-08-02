/**
 * check-route-descriptions.mjs
 *
 * Verifies that every route key declared in ROUTE_META (_middleware.js)
 * has a corresponding non-empty entry in ROUTE_DESCRIPTIONS (routeDescriptions.js).
 *
 * Also verifies that every key in EXPERIENCE_META has a non-empty `description`
 * field, and that EXPERIENCE_KEYS and EXPERIENCE_META are in sync (no key
 * appears in one but not the other).
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
// Parse EXPERIENCE_KEYS from _middleware.js
// Matches:  const EXPERIENCE_KEYS = new Set([...]);
// Returns a Set of bare string keys (e.g. 'diving', 'dolphins', …).
// ---------------------------------------------------------------------------
function parseExperienceKeys(source) {
  const start = source.indexOf('const EXPERIENCE_KEYS');
  if (start === -1) {
    throw new Error('Could not find "const EXPERIENCE_KEYS" in _middleware.js');
  }
  // Find the opening [ … ] of the Set constructor
  const bracketOpen = source.indexOf('[', start);
  if (bracketOpen === -1) {
    throw new Error('Could not find opening "[" for EXPERIENCE_KEYS Set in _middleware.js');
  }
  const bracketClose = source.indexOf(']', bracketOpen);
  if (bracketClose === -1) {
    throw new Error('Could not find closing "]" for EXPERIENCE_KEYS Set in _middleware.js');
  }
  const inner = source.slice(bracketOpen + 1, bracketClose);
  const keys = new Set();
  const re = /['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(inner)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Parse EXPERIENCE_META keys and their description/ogTitle/ogDescription values
// from _middleware.js.
// Returns a Map of key → { description, ogTitle, ogDescription }
// where each value is a trimmed string or null if the field is absent.
// ---------------------------------------------------------------------------
function parseExperienceMeta(source) {
  const start = source.indexOf('const EXPERIENCE_META');
  if (start === -1) {
    throw new Error('Could not find "const EXPERIENCE_META" in _middleware.js');
  }
  // Walk forward to find the matching closing brace for EXPERIENCE_META = { … };
  let depth = 0;
  let inBlock = false;
  let end = start;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') { depth++; inBlock = true; }
    else if (source[i] === '}') { depth--; }
    if (inBlock && depth === 0) { end = i + 1; break; }
  }
  const block = source.slice(start, end);

  // Match top-level entry keys (bare identifiers like  diving: { … })
  // Strategy: find each top-level key block, then look for the required fields inside.
  const entries = new Map();

  // Top-level keys in an object literal: bare words (no quotes, no /) followed by colon
  // e.g.  "  diving: {"
  const topKeyRe = /^\s{2}([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{/gm;
  let km;
  while ((km = topKeyRe.exec(block)) !== null) {
    const key = km[1];
    // Slice out the value block for this key
    const valueStart = km.index + km[0].length - 1; // position of the opening '{'
    let vDepth = 0;
    let vInBlock = false;
    let vEnd = valueStart;
    for (let i = valueStart; i < block.length; i++) {
      if (block[i] === '{') { vDepth++; vInBlock = true; }
      else if (block[i] === '}') { vDepth--; }
      if (vInBlock && vDepth === 0) { vEnd = i + 1; break; }
    }
    const valueBlock = block.slice(valueStart, vEnd);

    // Helper: extract a named string field, returns trimmed string or null if absent.
    function extractField(fieldName) {
      const re = new RegExp(`\\b${fieldName}\\s*:\\s*(['"])([\\s\\S]*?)\\1`);
      const m = re.exec(valueBlock);
      return m ? m[2].trim() : null;
    }

    entries.set(key, {
      description:   extractField('description'),
      ogTitle:       extractField('ogTitle'),
      ogDescription: extractField('ogDescription'),
    });
  }

  return entries;
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

let errors = false;

// ---------------------------------------------------------------------------
// Check 1: ROUTE_META keys all have a non-empty ROUTE_DESCRIPTIONS entry
// ---------------------------------------------------------------------------
const routeMetaKeys    = parseRouteMeta(middlewareSrc);
const descriptions     = parseRouteDescriptions(descriptionsSrc);

const missingRoutes = [];

for (const key of routeMetaKeys) {
  if (!descriptions.has(key)) {
    missingRoutes.push({ key, reason: 'key not found in ROUTE_DESCRIPTIONS' });
  } else if (descriptions.get(key) === '') {
    missingRoutes.push({ key, reason: 'entry exists but value is empty' });
  }
}

if (missingRoutes.length > 0) {
  console.error('\n[check-route-descriptions] ❌ ROUTE_META — missing description entries:\n');
  for (const { key, reason } of missingRoutes) {
    console.error(`  • ${key}  (${reason})`);
  }
  console.error(
    '\nAdd each missing key to WebsiteProject/src/utils/routeDescriptions.js before building.\n'
  );
  errors = true;
} else {
  console.log(
    `[check-route-descriptions] ✅ All ${routeMetaKeys.size} ROUTE_META keys have a description entry.`
  );
}

// ---------------------------------------------------------------------------
// Check 2: EXPERIENCE_META — every key has non-empty description, ogTitle,
//          and ogDescription fields
// ---------------------------------------------------------------------------
const experienceMeta = parseExperienceMeta(middlewareSrc);
const missingExpFields = [];

for (const [key, fields] of experienceMeta) {
  for (const fieldName of ['description', 'ogTitle', 'ogDescription']) {
    const value = fields[fieldName];
    if (value === null) {
      missingExpFields.push({ key, reason: `${fieldName} field is missing entirely` });
    } else if (value === '') {
      missingExpFields.push({ key, reason: `${fieldName} field is empty` });
    }
  }
}

if (missingExpFields.length > 0) {
  console.error('\n[check-route-descriptions] ❌ EXPERIENCE_META — missing or empty required fields:\n');
  for (const { key, reason } of missingExpFields) {
    console.error(`  • ${key}  (${reason})`);
  }
  console.error(
    '\nEach EXPERIENCE_META entry in WebsiteProject/functions/_middleware.js must have non-empty description, ogTitle, and ogDescription before building.\n'
  );
  errors = true;
} else {
  console.log(
    `[check-route-descriptions] ✅ All ${experienceMeta.size} EXPERIENCE_META keys have non-empty description, ogTitle, and ogDescription.`
  );
}

// ---------------------------------------------------------------------------
// Check 3: EXPERIENCE_KEYS ↔ EXPERIENCE_META sync check
// ---------------------------------------------------------------------------
const experienceKeys = parseExperienceKeys(middlewareSrc);
const keysOnlyInSet  = [...experienceKeys].filter(k => !experienceMeta.has(k));
const keysOnlyInMeta = [...experienceMeta.keys()].filter(k => !experienceKeys.has(k));

if (keysOnlyInSet.length > 0 || keysOnlyInMeta.length > 0) {
  console.error('\n[check-route-descriptions] ❌ EXPERIENCE_KEYS and EXPERIENCE_META are out of sync:\n');
  for (const k of keysOnlyInSet) {
    console.error(`  • '${k}' is in EXPERIENCE_KEYS but missing from EXPERIENCE_META`);
  }
  for (const k of keysOnlyInMeta) {
    console.error(`  • '${k}' is in EXPERIENCE_META but missing from EXPERIENCE_KEYS`);
  }
  console.error(
    '\nKeep EXPERIENCE_KEYS and EXPERIENCE_META in WebsiteProject/functions/_middleware.js in sync.\n'
  );
  errors = true;
} else {
  console.log(
    `[check-route-descriptions] ✅ EXPERIENCE_KEYS and EXPERIENCE_META are in sync (${experienceKeys.size} keys).`
  );
}

// ---------------------------------------------------------------------------
// Final exit
// ---------------------------------------------------------------------------
if (errors) {
  process.exit(1);
}
