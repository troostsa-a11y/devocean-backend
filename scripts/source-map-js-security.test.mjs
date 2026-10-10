import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const flatMap = {
  version: 3,
  sources: ['input.js'],
  names: [],
  mappings: 'AAAA',
  sourcesContent: ['console.log("safe");'],
};
const indexedMap = (line, column = 0, map = flatMap) => ({
  version: 3,
  sections: [{ offset: { line, column }, map }],
});

test('all committed dependency locks use patched source-map-js', () => {
  for (const path of ['package-lock.json', 'WebsiteProject/package-lock.json']) {
    const lock = JSON.parse(readFileSync(new URL(path, root), 'utf8'));
    const entries = Object.entries(lock.packages)
      .filter(([name]) => name.endsWith('node_modules/source-map-js'));
    assert.ok(entries.length > 0, `${path}: missing source-map-js`);
    for (const [, pkg] of entries) assert.equal(pkg.version, '1.2.2', path);
  }
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  const versions = [...lock.matchAll(/^\s+source-map-js@([^:]+):/gm)];
  assert.ok(versions.length > 0);
  for (const [, version] of versions) assert.equal(version, '1.2.2');
  assert.doesNotMatch(lock, /source-map-js: (?!1\.2\.2(?:\s|$))/m);
});

for (const manifest of [
  'package.json',
  'WebsiteProject/package.json',
  'voice-reception/artifacts/receptionist/package.json',
  'voice-reception/artifacts/mockup-sandbox/package.json',
  'voice-reception/artifacts/api-server/package.json',
]) {
  // Resolve through Vite's PostCSS dependency, including pnpm's isolated tree.
  const require = createRequire(new URL(manifest, root));
  const viteRequire = createRequire(require.resolve('vite'));
  const postcssRequire = createRequire(viteRequire.resolve('postcss'));
  const { SourceMapConsumer } = postcssRequire('source-map-js');

  test(`${manifest}: installed source-map-js is patched`, () => {
    assert.equal(postcssRequire('source-map-js/package.json').version, '1.2.2');
  });

  test(`${manifest}: rejects malicious section offsets before serialization`, () => {
    // Construct only: never serialize a malicious map, which hangs old releases.
    for (const line of [10_000_001, Number.MAX_SAFE_INTEGER]) {
      assert.throws(() => new SourceMapConsumer(indexedMap(line)), /must not exceed/);
    }
    for (const value of [-1, 0.5, NaN, Infinity, '1']) {
      assert.throws(() => new SourceMapConsumer(indexedMap(value)), /non-negative integers/);
      assert.throws(() => new SourceMapConsumer(indexedMap(0, value)), /non-negative integers/);
    }
    assert.throws(
      () => new SourceMapConsumer(indexedMap(6_000_000, 0, indexedMap(6_000_000))),
      /including offsets of nested sections/,
    );
  });

  test(`${manifest}: valid indexed source maps still resolve mappings`, () => {
    const consumer = new SourceMapConsumer(indexedMap(2));
    const mappings = [];
    consumer.eachMapping((mapping) => mappings.push(mapping));
    assert.equal(mappings.length, 1);
    assert.equal(mappings[0].source, 'input.js');
    assert.equal(mappings[0].generatedLine, 3);
    assert.equal(mappings[0].generatedColumn, 0);
    assert.equal(mappings[0].originalLine, 1);
    assert.equal(mappings[0].originalColumn, 0);
    assert.equal(consumer.sourceContentFor('input.js'), flatMap.sourcesContent[0]);
  });
}
