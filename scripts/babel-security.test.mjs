import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const patched = version => {
  const [major, minor, patch] = version.split('.').map(Number);
  return major === 7 && (minor > 29 || (minor === 29 && patch >= 6));
};

test('committed lockfiles contain only patched Babel 7 releases', () => {
  for (const path of ['package-lock.json', 'WebsiteProject/package-lock.json']) {
    const lock = JSON.parse(readFileSync(new URL(path, root), 'utf8'));
    const entries = Object.entries(lock.packages)
      .filter(([key]) => key.endsWith('node_modules/@babel/core'));
    assert.ok(entries.length, `${path}: Babel missing`);
    for (const [, pkg] of entries) assert.ok(patched(pkg.version), `${path}: ${pkg.version}`);
  }
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  const versions = [...lock.matchAll(/^  '@babel\/core@([\d.]+)':/gm)];
  assert.ok(versions.length, 'pnpm: Babel missing');
  for (const [, version] of versions) assert.ok(patched(version), `pnpm: ${version}`);
});

for (const manifest of [
  'package.json',
  'WebsiteProject/package.json',
  'voice-reception/artifacts/receptionist/package.json',
  'voice-reception/artifacts/mockup-sandbox/package.json',
]) {
  test(`${manifest}: external map disclosure blocked; supported maps preserved`, () => {
    const require = createRequire(new URL(manifest, root));
    // Resolve Babel through the actual Vite consumer, not ancestor node_modules.
    const consumer = createRequire(require.resolve('@vitejs/plugin-react'));
    const babel = consumer('@babel/core');
    assert.ok(patched(babel.version), `installed Babel ${babel.version}`);
    const dir = mkdtempSync(join(tmpdir(), 'babel-security-'));
    try {
      const project = join(dir, 'project');
      mkdirSync(project);
      writeFileSync(join(project, 'package.json'), '{}');
      const map = {
        version: 3, sources: ['original.js'], names: [], mappings: 'AAAA',
        sourcesContent: ['const disclosureMarker = "PRIVATE_SOURCE_MAP";'],
      };
      const outside = join(dir, 'private.map');
      writeFileSync(outside, JSON.stringify(map));
      writeFileSync(join(project, 'input.js.map'), JSON.stringify(map));
      const options = {
        root: project, filename: join(project, 'input.js'),
        configFile: false, babelrc: false, sourceMaps: true,
      };
      const compile = (url, opts = options) => babel.transformSync(
        `const value = 1;\n//# sourceMappingURL=${url}`, opts,
      );
      for (const url of ['../private.map', outside]) {
        for (const opts of [options, { ...options, filename: undefined }]) {
          const result = compile(url, opts);
          assert.ok(!JSON.stringify(result.map).includes('PRIVATE_SOURCE_MAP'), url);
        }
      }
      assert.ok(compile('input.js.map').map.sourcesContent.includes(map.sourcesContent[0]));
      const inline = `data:application/json;base64,${Buffer.from(JSON.stringify(map)).toString('base64')}`;
      assert.ok(compile(inline).map.sourcesContent.includes(map.sourcesContent[0]));
      assert.match(babel.transformSync('const view = <div>Hello</div>;', {
        ...options, plugins: [consumer.resolve('@babel/plugin-transform-react-jsx-self')],
        parserOpts: { plugins: ['jsx'] },
      }).code, /Hello/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}
