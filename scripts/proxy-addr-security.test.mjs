import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const json = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

test('npm projects require the patched proxy-addr release', () => {
  for (const dir of ['', 'WebsiteProject/', 'render-automailer/']) {
    assert.equal(json(`${dir}package.json`).overrides['proxy-addr'], '^2.0.8');
  }
  for (const dir of ['', 'WebsiteProject/']) {
    const packages = json(`${dir}package-lock.json`).packages;
    const entries = Object.entries(packages).filter(([path]) => path.endsWith('node_modules/proxy-addr'));
    assert.ok(entries.length > 0);
    for (const [, pkg] of entries) assert.equal(pkg.version, '2.0.8');
  }
});

test('pnpm workspace locks proxy-addr to the patched release', () => {
  const workspace = readFileSync(new URL('voice-reception/pnpm-workspace.yaml', root), 'utf8');
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  assert.match(workspace, /"proxy-addr": "\^2\.0\.8"/);
  assert.match(lock, /proxy-addr: \^2\.0\.8/);
  assert.match(lock, /proxy-addr@2\.0\.8:/);
  assert.doesNotMatch(lock, /proxy-addr(?:@|: )2\.0\.7/);
});

for (const [name, manifest] of [
  ['Express 4', 'package.json'],
  ['Express 5', 'voice-reception/artifacts/api-server/package.json'],
]) {
  const require = createRequire(new URL(manifest, root));
  const expressRequire = createRequire(require.resolve('express'));
  const proxyaddr = expressRequire('proxy-addr');

  test(`${name}: malformed IPv6 trust ranges cannot spoof the client IP`, () => {
    assert.equal(expressRequire('proxy-addr/package.json').version, '2.0.8');
    const req = {
      socket: { remoteAddress: '203.0.113.20' },
      headers: { 'x-forwarded-for': '10.1.2.3' },
    };
    for (const subnet of ['::ffff:a00:0/8', '::/1']) {
      const trust = proxyaddr.compile(subnet);
      assert.equal(trust(req.socket.remoteAddress), false);
      assert.equal(proxyaddr(req, trust), req.socket.remoteAddress);
    }
  });

  test(`${name}: valid IPv4 and mapped IPv6 proxy ranges still work`, () => {
    const req = {
      socket: { remoteAddress: '10.1.2.3' },
      headers: { 'x-forwarded-for': '203.0.113.20' },
    };
    for (const subnet of ['10.0.0.0/8', '::ffff:10.0.0.0/104']) {
      assert.equal(proxyaddr(req, proxyaddr.compile(subnet)), '203.0.113.20');
    }
  });
}
