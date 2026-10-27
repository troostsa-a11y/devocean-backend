import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

// Follow the actual API generator's dependency chain, not an unrelated root copy.
let require = createRequire(new URL('../voice-reception/lib/api-spec/package.json', import.meta.url));
for (const dependency of [
  'orval',
  '@scalar/openapi-parser',
  '@scalar/openapi-validator',
  '@scalar/json-schema-validator',
  'ajv',
]) {
  require = createRequire(require.resolve(dependency));
}
const uri = require('fast-uri');

test('the API generator and committed lockfile use patched fast-uri', () => {
  assert.equal(require('fast-uri/package.json').version, '3.1.9');
  const lock = readFileSync(new URL('../voice-reception/pnpm-lock.yaml', import.meta.url), 'utf8');
  assert.match(lock, /fast-uri@3\.1\.9:/);
  assert.doesNotMatch(lock, /fast-uri(?:@|: )3\.1\.8/);
});

test('GHSA-w74x-v6f9-j3xg: encoded schemes cannot become executable schemes', () => {
  for (const scheme of ['javascript', 'data', 'vbscript']) {
    for (const prefix of [
      `%${scheme.charCodeAt(0).toString(16)}`,
      `%u${scheme.charCodeAt(0).toString(16).padStart(4, '0')}`,
    ]) {
      const encoded = `${prefix}${scheme.slice(1)}:alert(1)`;
      assert.ok(uri.parse(encoded).error);
      assert.notEqual(uri.parse(uri.normalize(encoded)).scheme, scheme);
      assert.throws(() => uri.resolve('https://example.com/', encoded), /URI scheme is malformed/);
    }
  }
  assert.equal(uri.equal('%68ttp://a/', 'http://a/'), false);
});

test('GHSA-wjr9-j795-jxcr: ambiguous authorities report errors instead of clean hosts', () => {
  for (const scheme of ['http', 'https', 'ws', 'wss']) {
    for (const host of ['a@b@evil.example', 'exa\tmple.com', 'exa\rmple.com', 'exa\nmple.com']) {
      const input = `${scheme}://${host}/`;
      const parsed = uri.parse(input);
      assert.ok(parsed.error, input);
      assert.notEqual(parsed.host, host.includes('@') ? 'evil.example' : 'example.com');
      assert.equal(uri.equal(input, `${scheme}://${host.includes('@') ? 'evil.example' : 'example.com'}/`), false);
    }
    assert.equal(uri.parse(`${scheme}://example.com/`).error, undefined);
  }
  assert.ok(uri.parse('custom://exa\tmple.com/', { domainHost: true }).error);
});

test('GHSA-333x-w4r6-6crp: suffix serialization escapes first-segment colons', () => {
  for (const scheme of ['javascript', 'data', 'vbscript']) {
    const output = uri.serialize({ path: `${scheme}:alert(1)` }, { reference: 'suffix' });
    assert.equal(output, `${scheme}%3Aalert(1)`);
    assert.equal(uri.parse(output).scheme, undefined);
  }
  assert.equal(uri.serialize({ path: 'safe/path' }, { reference: 'suffix' }), 'safe/path');
});

test('GHSA-xhq7-xmqj-769h: relative normalization preserves resolution semantics', () => {
  const base = 'https://example.com/dir/nested/document';
  for (const reference of ['../x', '../../x', 'a/../b', './b', 'a/../../b']) {
    const normalized = uri.normalize(reference);
    assert.equal(uri.resolve(base, normalized), uri.resolve(base, reference), reference);
    assert.equal(uri.resolve(base, uri.serialize(uri.parse(reference))), uri.resolve(base, reference), reference);
  }
  assert.equal(uri.equal('../x', 'x'), false);
  assert.equal(uri.equal('a/../b', '/b'), false);
  assert.equal(uri.normalize('https://example.com/a/../b'), 'https://example.com/b');
});
