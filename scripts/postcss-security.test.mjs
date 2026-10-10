import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const workspaceLock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
const atLeast = (version, minimum) => {
  const parts = version.split('.').map(Number);
  for (const [index, part] of minimum.entries()) {
    if (parts[index] !== part) return parts[index] > part;
  }
  return true;
};

test('all committed locks fix the three PostCSS advisories', () => {
  for (const path of ['package-lock.json', 'WebsiteProject/package-lock.json']) {
    const lock = JSON.parse(readFileSync(new URL(path, root), 'utf8'));
    for (const [name, minimum] of [
      ['postcss', [8, 5, 23]],
      ['postcss-selector-parser', [7, 1, 6]],
    ]) {
      const entries = Object.entries(lock.packages)
        .filter(([key]) => key.endsWith(`node_modules/${name}`));
      assert.ok(entries.length, `${path}: missing ${name}`);
      for (const [, pkg] of entries) {
        assert.ok(atLeast(pkg.version, minimum), `${path}: vulnerable ${name}@${pkg.version}`);
      }
    }
  }
  for (const [name, minimum] of [
    ['postcss', [8, 5, 23]],
    ['postcss-selector-parser', [7, 1, 6]],
  ]) {
    const versions = [...workspaceLock.matchAll(new RegExp(`^  ${name}@(\\d+\\.\\d+\\.\\d+):`, 'gm'))];
    assert.ok(versions.length, `pnpm: missing ${name}`);
    for (const [, version] of versions) assert.ok(atLeast(version, minimum), `${name}@${version}`);
  }
});

function runIsolated(manifest, source) {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    const require = createRequire(${JSON.stringify(manifest)});
    ${source}
  `], { timeout: 8000, encoding: 'utf8' });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr);
}

const parserConsumers = [
  ['root Tailwind', 'package.json', 'tailwindcss'],
  ['website Tailwind', 'WebsiteProject/package.json', 'tailwindcss'],
  ['reception typography', 'voice-reception/artifacts/receptionist/package.json', '@tailwindcss/typography'],
];

for (const [name, manifest, consumer] of parserConsumers) {
  const require = createRequire(new URL(manifest, root));
  const consumerRequire = createRequire(require.resolve(consumer));
  const parserManifest = consumerRequire.resolve('postcss-selector-parser/package.json');

  test(`${name}: patched selector parsing and serialization terminate safely`, () => {
    runIsolated(parserManifest, `
      const parser = require('postcss-selector-parser');
      assert.equal(require('postcss-selector-parser/package.json').version, '7.1.6');
      // The old quadratic implementation takes tens of seconds for this input.
      const flat = '.a'.repeat(200_000);
      assert.equal(parser().processSync(flat), flat);
      // Build an AST directly so the serialization guard, not parsing, is tested.
      const root = parser.root();
      let current = parser.selector();
      root.append(current);
      for (let depth = 0; depth < 512; depth++) {
        const pseudo = parser.pseudo({ value: ':is' });
        const child = parser.selector();
        current.append(pseudo);
        pseudo.append(child);
        current = child;
      }
      current.append(parser.className({ value: 'safe' }));
      assert.throws(() => root.toString(), /nesting depth exceeds the maximum/);
      assert.throws(
        () => parser().processSync(':is('.repeat(512) + '.safe' + ')'.repeat(512)),
        /nesting depth exceeds the maximum/,
      );
      for (const selector of [
        '.group:hover .group-hover\\\\:text-white',
        ':merge(.group):hover > .item',
        'a[href^="https://"]:not(.disabled)',
        ':is(h1, h2) + p::before',
      ]) assert.equal(parser().processSync(selector), selector);
    `);
  });
}

for (const manifest of [
  'package.json',
  'WebsiteProject/package.json',
  'voice-reception/artifacts/receptionist/package.json',
  'voice-reception/artifacts/mockup-sandbox/package.json',
  'voice-reception/artifacts/api-server/package.json',
]) {
  const require = createRequire(new URL(manifest, root));
  const viteRequire = createRequire(require.resolve('vite'));
  const postcssManifest = viteRequire.resolve('postcss/package.json');

  test(`${manifest}: PostCSS does not disclose external maps without a source filename`, () => {
    runIsolated(postcssManifest, `
      import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
      import { tmpdir } from 'node:os';
      import { join } from 'node:path';
      const postcss = require('postcss');
      assert.equal(require('postcss/package.json').version, '8.5.29');
      const directory = mkdtempSync(join(tmpdir(), 'postcss-security-'));
      const previousCwd = process.cwd();
      try {
        const working = join(directory, 'css');
        mkdirSync(working);
        const secret = join(directory, 'external.map');
        const contents = JSON.stringify({
          version: 3, sources: ['private-source.css'], names: [], mappings: 'AAAA',
          sourcesContent: ['PRIVATE_MAP_SENTINEL'],
        });
        writeFileSync(secret, contents);
        process.chdir(working);
        for (const annotation of [secret, '../external.map']) {
          for (const options of [{}, { from: join(working, 'input.css') }]) {
            const result = await postcss([]).process(
              'a{color:red}/*# sourceMappingURL=' + annotation + ' */',
              { ...options, map: { inline: false } },
            );
            assert.ok(!JSON.stringify(result.map?.toJSON()).includes('PRIVATE_MAP_SENTINEL'));
          }
        }
        // Ordinary maps adjacent to a known source file must still work.
        writeFileSync(join(working, 'input.css.map'), contents);
        const benign = await postcss([]).process(
          'a{color:red}/*# sourceMappingURL=input.css.map */',
          { from: join(working, 'input.css'), map: { inline: false } },
        );
        assert.ok(JSON.stringify(benign.map.toJSON()).includes('PRIVATE_MAP_SENTINEL'));
      } finally {
        process.chdir(previousCwd);
        rmSync(directory, { recursive: true, force: true });
      }
    `);
  });
}
