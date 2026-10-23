import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const consumers = [
  'WebsiteProject/package.json',
  'voice-reception/artifacts/api-server/package.json',
];

test('both lockfiles and manifests require the patched Vitest release', () => {
  for (const manifest of consumers) {
    assert.equal(JSON.parse(readFileSync(new URL(manifest, root))).devDependencies.vitest, '^4.1.12');
  }
  const npm = JSON.parse(readFileSync(new URL('WebsiteProject/package-lock.json', root)));
  assert.equal(npm.packages[''].devDependencies.vitest, '^4.1.12');
  for (const name of ['vitest', '@vitest/mocker']) {
    const entry = npm.packages[`node_modules/${name}`];
    assert.equal(entry.version, '4.1.12');
    assert.ok(entry.resolved.startsWith('https://registry.npmjs.org/'));
  }
  const pnpm = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  assert.match(pnpm, /'@vitest\/mocker@4\.1\.12':/);
  assert.match(pnpm, /vitest@4\.1\.12:/);
  assert.doesNotMatch(pnpm, /(?:vitest|@vitest\/[^@\s']+)@4\.1\.11/);
});

for (const manifest of consumers) {
  test(`${manifest}: manual mocks escape code and redirect mocks cannot escape the root`, async () => {
    const consumer = createRequire(new URL(manifest, root));
    const vitest = createRequire(consumer.resolve('vitest/package.json'));
    assert.equal(vitest('vitest/package.json').version, '4.1.12');
    const mockerPath = vitest.resolve('@vitest/mocker/node');
    const mockerManifest = JSON.parse(readFileSync(new URL('../package.json', pathToFileURL(mockerPath))));
    assert.equal(mockerManifest.version, '4.1.12');
    const { interceptorPlugin } = await import(pathToFileURL(mockerPath));
    const { createServer } = await import(pathToFileURL(vitest.resolve('vite')));
    const temp = await mkdtemp(join(tmpdir(), 'vitest-mocker-security-'));
    const project = join(temp, 'root');
    let server;
    try {
      await mkdir(project);
      await writeFile(join(temp, 'secret.js'), 'PRIVATE_SYNTHETIC_CANARY');
      await writeFile(join(project, 'safe.js'), 'export const safe = true;');
      server = await createServer({
        configFile: false, root: project, logLevel: 'silent',
        server: { fs: { allow: [project] }, watch: null },
      });
      const handlers = new Map();
      const keys = ['safe', 'quoted"name'];
      const plugin = interceptorPlugin();
      // Exercise the same handlers used by the public WebSocket registration,
      // without exposing a network listener or relying on socket timing.
      plugin.configureServer({
        config: server.config,
        ws: {
          on: (event, handler) => handlers.set(event, handler),
          send: (event, url) => {
            if (event === 'vitest:interceptor:resolve') {
              queueMicrotask(() => handlers.get('vitest:interceptor:resolved')({ url, keys }));
            }
          },
        },
      });
      const register = handlers.get('vitest:interceptor:register');
      const url = 'x");globalThis.__mockerSecurityInjected=true;void("';
      register({ type: 'manual', raw: '', id: '/manual.js', url });
      const source = await plugin.load.handler('/manual.js');
      const factory = { safe: 42, 'quoted"name': 'preserved' };
      const calls = [];
      globalThis.__vitest_mocker__ = {
        getFactoryModule(value) { calls.push(value); return factory; },
      };
      const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${encodeURIComponent(manifest)}`);
      assert.equal(globalThis.__mockerSecurityInjected, undefined);
      assert.deepEqual(calls, [url]);
      assert.equal(module.safe, 42);
      assert.equal(module['quoted"name'], 'preserved');

      for (const [index, redirect] of ['traversal:../secret.js', 'traversal:..\\secret.js'].entries()) {
        const id = `/denied-${index}.js`;
        register({ type: 'redirect', raw: '', id, url: id, redirect });
        assert.equal(await plugin.load.handler(id), undefined, `${redirect} must be rejected`);
      }
      register({ type: 'redirect', raw: '', id: '/allowed.js', url: '/allowed.js', redirect: 'file:///safe.js' });
      assert.equal(await plugin.load.handler('/allowed.js'), 'export const safe = true;');
    } finally {
      delete globalThis.__vitest_mocker__;
      delete globalThis.__mockerSecurityInjected;
      await server?.close();
      await rm(temp, { recursive: true, force: true });
    }
  });
}
