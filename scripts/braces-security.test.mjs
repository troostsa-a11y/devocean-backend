import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, mkdtempSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const require = createRequire(import.meta.url);
const { edits, patchPackage } = require('../WebsiteProject/scripts/patch-braces.cjs');
const npmBraces = require.resolve('braces');
const websiteRequire = createRequire(new URL('WebsiteProject/package.json', root));
const pnpmStore = new URL('voice-reception/node_modules/.pnpm/', root);
const pnpmLock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
const patchHash = pnpmLock.match(/braces@3\.0\.3:\n    hash: ([a-f0-9]+)/)?.[1];
assert.ok(patchHash, 'Expected a locked pnpm braces patch');
const packages = [
  ['root npm', npmBraces],
  ['website npm', websiteRequire.resolve('braces')],
  ['reception pnpm', new URL(`braces@3.0.3_patch_hash=${patchHash}/node_modules/braces/index.js`, pnpmStore).pathname],
];

test('reception micromatch consumers resolve the locked patched braces copy', () => {
  // A patched store directory alone is not enough: stale consumer symlinks
  // can still point at an unpatched package after restoring node_modules.
  const consumers = readdirSync(pnpmStore).filter(name => name.startsWith('micromatch@'));
  assert.ok(consumers.length > 0, 'Expected an installed micromatch consumer');
  const expected = realpathSync(packages[2][1]);
  for (const consumer of consumers) {
    const consumerRequire = createRequire(new URL(`${consumer}/node_modules/micromatch/package.json`, pnpmStore));
    const entry = consumerRequire.resolve('braces');
    assert.equal(realpathSync(entry), expected, `${consumer} must use the patched dependency`);
    const braces = consumerRequire('braces');
    assert.deepEqual(braces.expand('src/{a,b}.js'), ['src/a.js', 'src/b.js']);
    assert.throws(
      () => braces.compile('{'.repeat(4000) + 'a,b' + '}'.repeat(4000)),
      error => error instanceof SyntaxError && /braces nesting exceeds safety limit/.test(error.message),
    );
  }
});

for (const [name, entry] of packages) {
  test(`${name}: installed source includes every mitigation`, () => {
    for (const [file, replacements] of Object.entries(edits)) {
      const source = readFileSync(join(dirname(entry), file), 'utf8');
      for (const [, patched] of replacements) assert.ok(source.includes(patched), `${file}: ${patched}`);
    }
  });

  test(`${name}: ordinary glob behavior is preserved`, () => {
    const braces = require(entry);
    assert.deepEqual(braces.expand('src/{a,b}/{1..3}.js'), [
      'src/a/1.js', 'src/a/2.js', 'src/a/3.js',
      'src/b/1.js', 'src/b/2.js', 'src/b/3.js',
    ]);
    assert.equal(braces.compile('a/{b,{c,d}}/e'), 'a/(b|(c|d))/e');
    assert.equal(braces.stringify(braces.parse('a/{b,c}/d')), 'a/{b,c}/d');
    assert.deepEqual(braces.expand('{a,a,}', { nodupes: true, noempty: true }), ['a']);
    assert.deepEqual(braces.expand('\\{a,b\\}'), ['{a,b}']);
    assert.deepEqual(braces.expand('"{{{a}}}"'), ['{{{a}}}']);
    assert.deepEqual(braces.expand('[{{a}}]'), ['[{{a}}]']);
    assert.throws(() => braces.expand('{1..1001}'), /range limit/);
    assert.equal(braces.stringify('('.repeat(127) + 'x' + ')'.repeat(127)),
      '('.repeat(127) + 'x' + ')'.repeat(127));
  });

  test(`${name}: hostile strings and caller-supplied ASTs fail safely in an isolated process`, () => {
    const result = spawnSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const braces = require(${JSON.stringify(entry)});
      const safeError = error => error instanceof SyntaxError &&
        /braces nesting exceeds safety limit/.test(error.message);
      for (const depth of [128, 1000, 4000]) {
        for (const pattern of [
          '{'.repeat(depth) + 'a,b' + '}'.repeat(depth),
          '('.repeat(depth) + 'x' + ')'.repeat(depth),
          '{('.repeat(depth) + 'a,b' + ')}'.repeat(depth),
          '{'.repeat(depth) + 'a',
        ]) {
          if (pattern.length > 10000) continue;
          for (const method of ['parse', 'compile', 'expand', 'stringify', 'create']) {
            assert.throws(() => braces[method](pattern, { maxDepth: Infinity }), safeError);
          }
          assert.throws(() => braces(pattern), safeError);
          assert.throws(() => braces(pattern, { expand: true }), safeError);
        }
      }
      // Supplying an AST bypasses parsing, so walkers must enforce their own limits.
      for (const method of ['compile', 'expand', 'stringify']) {
        const ast = { type: 'root', nodes: [] };
        let parent = ast;
        for (let i = 0; i < 1000; i++) {
          const child = { type: 'paren', nodes: [], parent };
          parent.nodes.push(child);
          parent = child;
        }
        parent.nodes.push({ type: 'text', value: 'x' });
        assert.throws(() => braces[method](ast), safeError);
      }
    `], { timeout: 10000, encoding: 'utf8' });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, 0, result.stderr);
  });
}

test('npm mitigation is idempotent and fails closed for unknown source or versions', () => {
  const temp = mkdtempSync(join(tmpdir(), 'braces-security-'));
  try {
    const directory = join(temp, 'braces');
    cpSync(dirname(npmBraces), directory, { recursive: true });
    patchPackage(directory);
    patchPackage(directory);
    writeFileSync(join(directory, 'lib/compile.js'), '// unknown upstream source\n');
    assert.throws(() => patchPackage(directory), /Cannot safely apply/);
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: 'braces', version: '3.0.4' }));
    assert.throws(() => patchPackage(directory), /Review the braces security patch/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('npm install hooks and pnpm native patch remain enabled', () => {
  for (const [path, expected] of [
    ['package.json', 'node WebsiteProject/scripts/patch-braces.cjs'],
    ['WebsiteProject/package.json', 'node scripts/patch-braces.cjs'],
  ]) {
    const manifest = JSON.parse(readFileSync(new URL(path, root), 'utf8'));
    assert.equal(manifest.scripts.postinstall, expected);
  }
  const workspace = readFileSync(new URL('voice-reception/pnpm-workspace.yaml', root), 'utf8');
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  assert.match(workspace, /patchedDependencies:\n  braces@3\.0\.3: patches\/braces@3\.0\.3\.patch/);
  assert.match(lock, /braces: 3\.0\.3\(patch_hash=[a-f0-9]+\)/);
});

test('root installation also patches an independently installed website tree', () => {
  const temp = mkdtempSync(join(tmpdir(), 'braces-install-'));
  try {
    // Use pristine source so the test proves both trees are patched, not just
    // that already-patched packages survive a repeated installation.
    for (const tree of ['node_modules', 'WebsiteProject/node_modules']) {
      const directory = join(temp, tree, 'braces');
      cpSync(dirname(npmBraces), directory, { recursive: true });
      for (const [file, replacements] of Object.entries(edits)) {
        const filename = join(directory, file);
        let source = readFileSync(filename, 'utf8');
        for (const [before, after] of replacements) source = source.replace(after, before);
        writeFileSync(filename, source);
      }
    }
    const result = spawnSync(process.execPath, [
      new URL('WebsiteProject/scripts/patch-braces.cjs', root).pathname,
    ], { cwd: temp, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    for (const tree of ['node_modules', 'WebsiteProject/node_modules']) {
      for (const [file, replacements] of Object.entries(edits)) {
        const source = readFileSync(join(temp, tree, 'braces', file), 'utf8');
        for (const [, patched] of replacements) assert.ok(source.includes(patched), `${tree}/${file}`);
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
