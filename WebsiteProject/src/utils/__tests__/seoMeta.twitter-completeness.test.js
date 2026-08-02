/**
 * seoMeta.twitter-completeness.test.js
 *
 * Static-analysis guard: every `useSeoPage` call that provides any OG prop
 * (ogTitle, ogDescription, ogImage) must also provide all three Twitter props
 * (twitterTitle, twitterDescription, twitterImage).
 *
 * This test reads the actual source files so it catches regressions the moment
 * a developer edits a page component — no runtime required.
 *
 * Rule: if a useSeoPage({…}) call contains any of
 *   ogTitle | ogDescription | ogImage
 * then it must also contain ALL of
 *   twitterTitle | twitterDescription | twitterImage
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Recursively collect every .jsx/.js/.tsx/.ts file under a directory. */
function collectSourceFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // Skip node_modules and __tests__ (we don't want to scan test fixtures)
      if (entry === 'node_modules' || entry === '__tests__') continue;
      results.push(...collectSourceFiles(full));
    } else if (/\.(jsx?|tsx?)$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Very lightweight brace-balancing extractor.
 * Given source text and the index of the opening `{` of a useSeoPage call,
 * returns the substring of that argument object (without outer braces).
 */
function extractArgBody(src, openBraceIdx) {
  let depth = 0;
  let i = openBraceIdx;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(openBraceIdx + 1, i);
    }
    i++;
  }
  return '';
}

/**
 * Extract all useSeoPage({…}) argument bodies from a source string.
 * Returns an array of { body: string, lineNumber: number } objects.
 */
function extractUseSeoPageCalls(src) {
  const calls = [];
  // Match "useSeoPage(" then find the opening brace
  const callPattern = /useSeoPage\s*\(/g;
  let match;
  while ((match = callPattern.exec(src)) !== null) {
    const afterParen = src.indexOf('{', match.index + match[0].length);
    if (afterParen === -1) continue;
    const body = extractArgBody(src, afterParen);
    // Compute 1-based line number for the call site
    const lineNumber = src.slice(0, match.index).split('\n').length;
    calls.push({ body, lineNumber });
  }
  return calls;
}

/** Return true if the arg-body string contains a given prop key. */
function hasProp(body, key) {
  // Match "key:" or "key :" — covers shorthand and spread-less object props
  return new RegExp(`\\b${key}\\s*:`).test(body);
}

// ─── constants ──────────────────────────────────────────────────────────────

const OG_PROPS = ['ogTitle', 'ogDescription', 'ogImage'];
const TWITTER_PROPS = ['twitterTitle', 'twitterDescription', 'twitterImage'];

// Resolve src root relative to this test file's location
const SRC_ROOT = resolve(new URL(import.meta.url).pathname, '../../../');

// ─── test ───────────────────────────────────────────────────────────────────

describe('useSeoPage Twitter-completeness guard', () => {
  it('every useSeoPage call with any OG prop also provides all three Twitter props', () => {
    const files = collectSourceFiles(SRC_ROOT);
    const violations = [];

    for (const filePath of files) {
      const src = readFileSync(filePath, 'utf8');
      if (!src.includes('useSeoPage')) continue;

      const calls = extractUseSeoPageCalls(src);
      for (const { body, lineNumber } of calls) {
        const hasAnyOg = OG_PROPS.some(p => hasProp(body, p));
        if (!hasAnyOg) continue; // no OG props → rule doesn't apply

        const missingTwitter = TWITTER_PROPS.filter(p => !hasProp(body, p));
        if (missingTwitter.length > 0) {
          const rel = filePath.replace(SRC_ROOT, 'src');
          violations.push(
            `${rel}:${lineNumber} — has OG props but is missing: ${missingTwitter.join(', ')}`
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `useSeoPage calls with OG props must also supply twitterTitle, twitterDescription, and twitterImage.\n\n` +
        `Violations found:\n${violations.map(v => `  • ${v}`).join('\n')}\n\n` +
        `Fix: add the missing Twitter props to each call site listed above.`
      );
    }

    expect(violations).toHaveLength(0);
  });
});
