import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const consumers = [
  ['root', './'],
  ['website', 'WebsiteProject/'],
  ['reception', 'voice-reception/artifacts/api-server/'],
];
const workspaceLock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');

test('all npm and pnpm locks exclude the five reported qs findings', () => {
  for (const directory of ['./', 'WebsiteProject/']) {
    const lock = JSON.parse(readFileSync(new URL(`${directory}package-lock.json`, root)));
    const entries = Object.entries(lock.packages).filter(([path]) => /(^|\/)node_modules\/qs$/.test(path));
    assert.ok(entries.length);
    for (const [path, metadata] of entries) {
      assert.equal(metadata.version, '6.16.0', `${directory}${path}`);
      assert.ok(metadata.resolved.startsWith('https://registry.npmjs.org/'));
    }
  }
  const versions = [...workspaceLock.matchAll(/^  qs@([^:]+):/gm)].map(match => match[1]);
  assert.ok(versions.length);
  assert.ok(versions.every(version => version === '6.16.0'));
});

test('every independently deployed project enforces patched qs on fresh installs', () => {
  for (const directory of ['./', 'WebsiteProject/', 'render-automailer/']) {
    const manifest = JSON.parse(readFileSync(new URL(`${directory}package.json`, root)));
    assert.equal(manifest.overrides.qs, '6.16.0', directory);
  }
  assert.match(readFileSync(new URL('voice-reception/pnpm-workspace.yaml', root), 'utf8'),
    /overrides:\n(?:  .*\n)*  "qs": "6\.16\.0"/);
});

for (const [name, directory] of consumers) {
  const projectRequire = createRequire(new URL(`${directory}package.json`, root));
  const expressRequire = createRequire(projectRequire.resolve('express'));
  const bodyParserRequire = createRequire(expressRequire.resolve('body-parser'));

  for (const [parent, require] of [['express', expressRequire], ['body-parser', bodyParserRequire]]) {
    const qs = require('qs');

    test(`${name}/${parent}: actual consumer resolves patched qs`, () => {
      assert.equal(require('qs/package.json').version, '6.16.0');
    });

    test(`${name}/${parent}: hostile constructor.isBuffer no longer crashes stringify`, () => {
      for (const options of [{ plainObjects: true }, { allowPrototypes: true }]) {
        const parsed = qs.parse('x%5Bconstructor%5D%5BisBuffer%5D=y', options);
        assert.equal(parsed.x.constructor.isBuffer, 'y');
        assert.equal(qs.stringify(parsed), 'x%5Bconstructor%5D%5BisBuffer%5D=y');
      }
      assert.doesNotThrow(() => qs.stringify(JSON.parse('{"a":{"constructor":{"isBuffer":"x"}}}')));
      assert.equal(qs.stringify({ value: Buffer.from('hello') }), 'value=hello');
    });

    test(`${name}/${parent}: comma serialization accepts null and undefined`, () => {
      const options = { arrayFormat: 'comma', encodeValuesOnly: true };
      for (const value of [null, undefined]) {
        assert.equal(qs.stringify({ a: [value, 'b'] }, options), 'a=,b');
        assert.equal(qs.stringify({ a: [value] }, options), 'a=');
        assert.equal(qs.stringify({ a: [value] }, { ...options, skipNulls: true }), '');
        assert.equal(qs.stringify({ a: [value] }, { ...options, strictNullHandling: true }), 'a');
      }
    });

    test(`${name}/${parent}: bracket comma inputs cannot bypass enforced array limits`, () => {
      const options = { comma: true, arrayLimit: 3, throwOnLimitExceeded: true };
      for (const key of ['a', 'a[]', 'a[0]']) {
        assert.throws(() => qs.parse(`${key}=1,2,3,4`, options), RangeError);
        assert.throws(() => qs.parse(`${key}=${'1,'.repeat(10000)}1`, options), RangeError);
      }
      assert.deepEqual(qs.parse('a[]=1,2,3', options), { a: [['1', '2', '3']] });
    });

    test(`${name}/${parent}: ordinary nested queries and forms retain their behavior`, () => {
      const value = { guest: { name: 'A B' }, rooms: ['safari', 'cottage'] };
      assert.deepEqual(qs.parse(qs.stringify(value)), value);
      assert.deepEqual(qs.parse('a=1&a=2'), { a: ['1', '2'] });
      assert.deepEqual(qs.parse('__proto__[polluted]=yes'), {});
      assert.equal({}.polluted, undefined);
    });
  }

  test(`${name}: Express query and extended form parsing work over HTTP`, async () => {
    const express = projectRequire('express');
    const app = express();
    app.set('query parser', 'extended');
    app.use(express.urlencoded({ extended: true }));
    app.get('/query', (req, res) => res.json(req.query));
    app.post('/form', (req, res) => res.json(req.body));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const query = 'guest[name]=A%20B&rooms[]=safari&rooms[]=cottage';
      const expected = { guest: { name: 'A B' }, rooms: ['safari', 'cottage'] };
      const get = await fetch(`${base}/query?${query}`);
      assert.equal(get.status, 200);
      assert.deepEqual(await get.json(), expected);
      const post = await fetch(`${base}/form`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: query,
      });
      assert.equal(post.status, 200);
      assert.deepEqual(await post.json(), expected);
    } finally {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
}
