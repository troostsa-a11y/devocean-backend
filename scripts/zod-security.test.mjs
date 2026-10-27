import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { posix } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const consumers = [
  'package.json',
  'WebsiteProject/package.json',
  'render-automailer/package.json',
  'voice-reception/artifacts/api-server/package.json',
  'voice-reception/artifacts/receptionist/package.json',
  'voice-reception/artifacts/mockup-sandbox/package.json',
  'voice-reception/lib/api-zod/package.json',
  'voice-reception/lib/db/package.json',
  'voice-reception/lib/api-spec/package.json',
  'voice-reception/lib/integrations-openai-ai-server/package.json',
];

test('npm lockfiles give the updated database tooling compatible build dependencies', () => {
  for (const path of ['package-lock.json', 'WebsiteProject/package-lock.json']) {
    const lock = JSON.parse(readFileSync(new URL(path, root)));
    let checked = 0;
    for (const [name, pkg] of Object.entries(lock.packages)) {
      if (!name.endsWith('/tsx') && pkg.name !== 'tsx') continue;
      let directory = name;
      let esbuild;
      while (!esbuild) {
        esbuild = lock.packages[posix.join(directory, 'node_modules/esbuild')];
        if (directory === '.') break;
        directory = posix.dirname(directory);
      }
      assert.equal(esbuild?.version, '0.28.2', `${path}: ${name} needs esbuild ~0.28.0`);
      checked++;
    }
    assert.ok(checked >= 2, `${path} includes both tsx and the maintained loader alias`);
    assert.ok(!Object.keys(lock.packages).some(name => name.endsWith('/@esbuild-kit/core-utils')));
    assert.doesNotMatch(JSON.stringify(lock), /package-firewall\.replit\.(internal|local)/);
  }
});

test('all committed Zod resolutions and deployment requirements exclude vulnerable versions', () => {
  for (const path of ['package-lock.json', 'WebsiteProject/package-lock.json']) {
    const lock = JSON.parse(readFileSync(new URL(path, root)));
    const versions = Object.entries(lock.packages)
      .filter(([name]) => name.endsWith('/zod'))
      .map(([, entry]) => entry.version);
    assert.deepEqual(versions, ['4.6.7'], path);
  }
  for (const path of ['package.json', 'WebsiteProject/package.json', 'render-automailer/package.json']) {
    const manifest = JSON.parse(readFileSync(new URL(path, root)));
    assert.equal(manifest.dependencies.zod, '^4.6.7', path);
  }
  const pnpm = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  assert.deepEqual([...new Set([...pnpm.matchAll(/^  zod@([^:]+):/gm)].map(match => match[1]))], ['4.6.7']);
  assert.doesNotMatch(pnpm, /zod(?:@|: )(?:3\.25\.76|4\.1\.12|4\.6\.5)\b/);
  for (const config of ['orval.config.ts', 'orval.check.config.ts']) {
    assert.match(readFileSync(new URL(`voice-reception/lib/api-spec/${config}`, root), 'utf8'), /zod:\s*\{\s*version: 4,/);
  }
});

for (const consumer of consumers) {
  test(`${consumer}: oversized constrained collections reject before parsing elements`, async () => {
    const require = createRequire(new URL(consumer, root));
    assert.equal(require('zod/package.json').version, '4.6.7');
    for (const entry of ['zod', 'zod/v4']) {
      const z = require(entry);
      let visits = 0;
      const element = z.preprocess(value => {
        visits++;
        return value;
      }, z.string().uuid());
      const array = Array(20_000).fill(0);
      const cases = [
        [z.array(element).max(100), array],
        [z.array(element).length(100), array],
        [z.set(element).max(100), new Set(Array.from({ length: 20_000 }, (_, i) => i))],
        [z.set(element).size(100), new Set(Array.from({ length: 20_000 }, (_, i) => i))],
        [z.map(element, element).max(100), new Map(Array.from({ length: 20_000 }, (_, i) => [i, i]))],
        [z.map(element, element).size(100), new Map(Array.from({ length: 20_000 }, (_, i) => [i, i]))],
      ];
      for (const [schema, input] of cases) {
        for (const result of [schema.safeParse(input), await schema.safeParseAsync(input)]) {
          assert.equal(result.success, false, entry);
          assert.equal(result.error.issues.length, 1, entry);
          assert.equal(result.error.issues[0].code, 'too_big', entry);
        }
      }
      assert.equal(visits, 0, `${entry} must not traverse oversized collections`);
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      assert.deepEqual(z.array(element).max(100).parse([uuid]), [uuid]);
      assert.equal(z.array(element).max(100).safeParse([0]).success, false);
      assert.ok(visits > 0, 'valid-sized collections still validate their elements');
    }
  });
}
