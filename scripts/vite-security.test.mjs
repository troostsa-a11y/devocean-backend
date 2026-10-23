import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const patched = '7.3.7'; // Fixes all five Vite advisories affecting 7.3.6.

test('all committed Vite resolutions include the security fixes', () => {
  for (const path of ['package-lock.json', 'WebsiteProject/package-lock.json']) {
    const lock = JSON.parse(readFileSync(new URL(path, root)));
    const entries = Object.entries(lock.packages).filter(([name]) => name.endsWith('node_modules/vite'));
    assert.ok(entries.length, `${path}: missing Vite`);
    for (const [, entry] of entries) {
      assert.equal(entry.version, patched);
      assert.equal(entry.resolved, `https://registry.npmjs.org/vite/-/vite-${patched}.tgz`);
    }
  }
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  const versions = [...lock.matchAll(/^  vite@([^:(]+)[:(]/gm)];
  assert.ok(versions.length);
  for (const [, version] of versions) assert.equal(version, patched);
  assert.doesNotMatch(lock, /vite@7\.3\.6/);
});

for (const manifest of [
  'package.json',
  'WebsiteProject/package.json',
  'voice-reception/artifacts/receptionist/package.json',
  'voice-reception/artifacts/mockup-sandbox/package.json',
  'voice-reception/artifacts/api-server/package.json',
]) {
  test(`${manifest}: installed Vite blocks file disclosure and cross-origin HTML proxies`, async () => {
    const require = createRequire(new URL(manifest, root));
    // The API server consumes Vite through Vitest rather than a direct dependency.
    const consumer = manifest.includes('api-server')
      ? createRequire(require.resolve('vitest/package.json'))
      : require;
    assert.equal(consumer('vite/package.json').version, patched);
    const { createServer } = await import(pathToFileURL(consumer.resolve('vite')));
    const temp = await mkdtemp(join(tmpdir(), 'vite-security-'));
    let server;
    try {
      const project = join(temp, 'project');
      const outside = join(temp, 'outside.txt');
      const decoy = join(project, outside.slice(1));
      await mkdir(join(decoy, '..'), { recursive: true });
      await writeFile(outside, 'PRIVATE SYNTHETIC FIXTURE');
      await writeFile(decoy, 'export default "safe project fixture";');
      await writeFile(join(project, 'main.js'), `import ${JSON.stringify(`.${outside}`)};`);
      await writeFile(join(project, 'package.json'), '{"type":"module"}');
      server = await createServer({
        configFile: false, root: project, logLevel: 'silent',
        server: {
          host: '127.0.0.1', port: 0, hmr: false, watch: null,
          fs: { strict: true, allow: [project] },
        },
      });
      await server.listen();
      const address = server.httpServer.address();
      const base = `http://127.0.0.1:${address.port}`;
      const main = await fetch(`${base}/main.js`);
      assert.equal(main.status, 200);
      assert.match(await main.text(), /import/);
      const denied = await fetch(`${base}/@fs${outside}`);
      assert.equal(denied.status, 403, 'in-root imports must not allow a colliding host path');
      assert.ok(!(await denied.text()).includes('PRIVATE SYNTHETIC FIXTURE'));

      const html = '<html><body><script type="module">window.safe = true;</script></body></html>';
      const safe = await server.transformIndexHtml('/index.html', html);
      assert.match(safe, /html-proxy/, 'ordinary inline modules must still work');
      const transformed = await server.transformIndexHtml(
        '//evil.invalid/payload.js?/../../package.json', html,
      );
      assert.doesNotMatch(transformed, /src=["']\/\/evil\.invalid/);
      assert.match(transformed, /html-proxy/);
    } finally {
      await server?.close();
      await rm(temp, { recursive: true, force: true });
    }
  });
}
