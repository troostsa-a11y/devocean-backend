import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const consumers = [
  ['root', './', '1.20.9'],
  ['website', 'WebsiteProject/', '1.20.9'],
  ['automailer', 'render-automailer/', '1.20.9'],
  ['reception', 'voice-reception/artifacts/api-server/', '2.4.0'],
];

test('lockfiles and deployment manifests exclude both body-parser advisories', () => {
  for (const directory of ['./', 'WebsiteProject/']) {
    const lock = JSON.parse(readFileSync(new URL(`${directory}package-lock.json`, root)));
    const parsers = Object.entries(lock.packages).filter(([path]) => /(^|\/)node_modules\/body-parser$/.test(path));
    assert.ok(parsers.length);
    for (const [path, metadata] of parsers) {
      assert.equal(metadata.version, '1.20.9', `${directory}${path}`);
      assert.ok(metadata.resolved.startsWith('https://registry.npmjs.org/'));
    }
  }
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  const versions = [...lock.matchAll(/^  body-parser@([^:]+):/gm)].map(match => match[1]);
  assert.deepEqual([...new Set(versions)], ['2.4.0']);
  for (const directory of ['./', 'WebsiteProject/', 'render-automailer/']) {
    const manifest = JSON.parse(readFileSync(new URL(`${directory}package.json`, root)));
    assert.equal(manifest.overrides.express['body-parser'], '1.20.9');
  }
});

for (const [name, directory, version] of consumers) {
  const require = createRequire(new URL(`${directory}package.json`, root));
  const expressRequire = createRequire(require.resolve('express'));
  const parser = expressRequire('body-parser');
  const express = require('express');

  test(`${name}: consumer loads the patched body-parser`, () => {
    assert.equal(expressRequire('body-parser/package.json').version, version);
  });

  test(`${name}: compressed requests cannot crash the process via GHSA-27r3-jxmh-p828`, () => {
    // An isolated process must survive without an uncaughtException handler.
    // A strict deadline also prevents a broken stream cleanup from hanging CI.
    const result = spawnSync(process.execPath, [
      fileURLToPath(new URL('./fixtures/body-parser-compression.mjs', import.meta.url)),
      directory,
    ], { encoding: 'utf8', timeout: 12000 });
    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /compression regressions passed/);
  });

  for (const kind of ['json', 'urlencoded', 'text', 'raw']) {
    test(`${name}/${kind}: invalid limits fail at construction; defaults remain supported`, () => {
      for (const limit of ['invalid', '', {}, true]) {
        assert.throws(() => parser[kind]({ limit, extended: true }), TypeError);
        assert.throws(() => express[kind]({ limit, extended: true }), TypeError);
      }
      for (const limit of [undefined, null, '1kb', 1024]) {
        assert.equal(typeof parser[kind]({ limit, extended: true }), 'function');
      }
    });
  }

  test(`${name}: all four HTTP parsers enforce configured and default limits`, async () => {
    const app = express();
    const formats = [
      ['json', 'application/json', '{"guest":"Alice"}', { guest: 'Alice' }],
      ['urlencoded', 'application/x-www-form-urlencoded', 'guest[name]=Alice', { guest: { name: 'Alice' } }],
      ['text', 'text/plain', 'hello', 'hello'],
      ['raw', 'application/octet-stream', 'hello', 'hello'],
    ];
    for (const [kind] of formats) {
      for (const [suffix, limit] of [['explicit', '32b'], ['default', undefined], ['null', null]]) {
        app.post(`/${kind}/${suffix}`, express[kind]({ limit, extended: true }), (req, res) => {
          res.json(Buffer.isBuffer(req.body) ? req.body.toString() : req.body);
        });
      }
    }
    app.use((error, req, res, next) => res.status(error.status || 500).json({ type: error.type }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      for (const [kind, contentType, body, expected] of formats) {
        for (const suffix of ['explicit', 'default', 'null']) {
          const url = `${base}/${kind}/${suffix}`;
          const response = await fetch(url, { method: 'POST', headers: { 'content-type': contentType }, body });
          assert.equal(response.status, 200, `${kind}/${suffix}`);
          assert.deepEqual(await response.json(), expected);
          const oversized = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': contentType },
            body: 'x'.repeat(suffix === 'explicit' ? 33 : 102401),
          });
          assert.equal(oversized.status, 413, `${kind}/${suffix}`);
          assert.equal((await oversized.json()).type, 'entity.too.large');
        }
      }
    } finally {
      server.closeAllConnections();
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
}
