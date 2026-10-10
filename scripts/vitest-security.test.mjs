import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('committed locks contain patched Vitest and mocker releases', () => {
  const lock = JSON.parse(readFileSync(new URL('WebsiteProject/package-lock.json', root)));
  for (const name of ['vitest', '@vitest/mocker']) {
    assert.equal(lock.packages[`node_modules/${name}`].version, '4.1.11');
  }
  const pnpm = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  for (const name of ['vitest', '@vitest/mocker']) {
    const versions = [...pnpm.matchAll(new RegExp(`^  '?${name}@([^:(']+)`, 'gm'))];
    assert.ok(versions.length > 0, `${name} missing from pnpm lock`);
    for (const [, version] of versions) assert.equal(version, '4.1.11');
  }
});

for (const manifest of [
  'WebsiteProject/package.json',
  'voice-reception/artifacts/api-server/package.json',
]) {
  test(`${manifest}: redirect mocks respect file-serving boundaries`, async () => {
    const require = createRequire(new URL(manifest, root));
    assert.equal(require('vitest/package.json').version, '4.1.11');
    const vitestRequire = createRequire(require.resolve('vitest/package.json'));
    assert.equal(vitestRequire('@vitest/mocker/package.json').version, '4.1.11');
    const { interceptorPlugin } = await import(pathToFileURL(vitestRequire.resolve('@vitest/mocker/node')));
    const { resolveConfig } = await import(pathToFileURL(vitestRequire.resolve('vite')));
    const temp = await mkdtemp(join(tmpdir(), 'vitest-redirect-'));
    try {
      const project = join(temp, 'project');
      await mkdir(project);
      // Synthetic fixtures only; never read actual environment files.
      await writeFile(join(temp, 'outside.txt'), 'outside fixture');
      await writeFile(join(project, '.env'), 'denied fixture');
      await writeFile(join(project, 'safe.js'), 'export const safe = true;');
      const config = await resolveConfig({
        root: project, configFile: false,
        server: { fs: { strict: true, allow: [project], deny: ['**/.env'] } },
      }, 'serve');
      const handlers = new Map();
      const plugin = interceptorPlugin();
      plugin.configureServer({
        config,
        ws: { on: (name, handler) => handlers.set(name, handler), send() {} },
      });
      const register = handlers.get('vitest:interceptor:register');
      for (const [id, redirect] of [
        ['/outside.js', 'opaque:../outside.txt'],
        ['/denied.js', 'file:///.env'],
      ]) {
        register({ type: 'redirect', raw: id, id, url: id, redirect });
        assert.equal(await plugin.load.handler(id), undefined, `${redirect} must not be registered`);
      }
      register({
        type: 'redirect', raw: '/allowed.js', id: '/allowed.js',
        url: '/allowed.js', redirect: 'file:///safe.js',
      });
      assert.equal(await plugin.load.handler('/allowed.js'), 'export const safe = true;');
      const authenticatedOnly = interceptorPlugin({ registerWebSocketEvents: false });
      authenticatedOnly.configureServer({
        ws: { on() { assert.fail('authenticated mode must not register HMR mock handlers'); } },
      });
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
}
