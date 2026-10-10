import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const workspaceLock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
const workspaceVersions = [...new Set(
  [...workspaceLock.matchAll(/^  nanoid@(\d+\.\d+\.\d+):/gm)].map(match => match[1]),
)];

function isPatched(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return (major === 3 && (minor > 3 || (minor === 3 && patch >= 18))) ||
    (major === 5 && (minor > 1 || (minor === 1 && patch >= 16))) || major > 5;
}

const packages = [];
for (const [name, directory] of [['root npm', './'], ['website npm', 'WebsiteProject/']]) {
  const packageRequire = createRequire(new URL(`${directory}package.json`, root));
  // Resolve from the real consumer, not a potentially unrelated ancestor copy.
  const postcssRequire = createRequire(packageRequire.resolve('postcss'));
  packages.push([name, postcssRequire.resolve('nanoid/package.json')]);

  test(`${name}: every locked Nano ID version fixes both advisories`, () => {
    const lock = JSON.parse(readFileSync(new URL(`${directory}package-lock.json`, root)));
    const entries = Object.entries(lock.packages).filter(([path]) => /(^|\/)node_modules\/nanoid$/.test(path));
    assert.ok(entries.length, 'Expected a locked Nano ID dependency');
    for (const [path, metadata] of entries) {
      assert.ok(isPatched(metadata.version), `${path}: vulnerable Nano ID ${metadata.version}`);
    }
  });
}

test('reception pnpm: every locked Nano ID version fixes both advisories', () => {
  assert.ok(workspaceVersions.length, 'Expected locked Nano ID dependencies');
  for (const version of workspaceVersions) {
    assert.ok(isPatched(version), `Vulnerable Nano ID ${version}`);
  }
});

for (const version of workspaceVersions) {
  packages.push([
    `reception pnpm ${version}`,
    new URL(`voice-reception/node_modules/.pnpm/nanoid@${version}/node_modules/nanoid/package.json`, root).pathname,
  ]);
}

for (const [name, manifestPath] of packages) {
  test(`${name}: installed version is patched`, () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert.ok(isPatched(manifest.version), `Vulnerable installed Nano ID ${manifest.version}`);
  });

  test(`${name}: negative non-secure sizes and zero custom sizes terminate safely`, () => {
    // A vulnerable generator blocks the event loop, so enforce an external timeout.
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      import { pathToFileURL } from 'node:url';
      const packageRequire = createRequire(${JSON.stringify(manifestPath)});
      const secure = await import(pathToFileURL(packageRequire.resolve('nanoid')));
      const nonSecure = await import(pathToFileURL(packageRequire.resolve('nanoid/non-secure')));
      for (const size of [-100, -1, 0]) {
        assert.equal(nonSecure.nanoid(size), '');
        assert.equal(nonSecure.customAlphabet('abc', size)(), '');
        assert.equal(nonSecure.customAlphabet('abc', 10)(size), '');
      }
      assert.equal(secure.customAlphabet('abc', 0)(), '');
      assert.equal(secure.customAlphabet('abc', 10)(0), '');
      const random = size => new Uint8Array(size);
      assert.equal(secure.customRandom('abc', 0, random)(), '');
      assert.equal(secure.customRandom('abc', 10, random)(0), '');
      for (const generator of [secure, nonSecure]) {
        assert.equal(generator.nanoid().length, 21);
        assert.equal(generator.nanoid(10).length, 10);
        assert.match(generator.customAlphabet('abc', 10)(), /^[abc]{10}$/);
      }
    `], { timeout: 5000, encoding: 'utf8' });
    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.signal, null);
    assert.equal(result.status, 0, result.stderr);
  });
}
