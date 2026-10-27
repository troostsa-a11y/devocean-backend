import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const consumers = [
  ['root', createRequire(new URL('package.json', root)), '6.29.1'],
  ['website', createRequire(new URL('WebsiteProject/package.json', root)), '6.29.1'],
];
// Follow the real code-generator dependency chain, not a stale pnpm store copy.
const spec = createRequire(new URL('voice-reception/lib/api-spec/package.json', root));
const orval = createRequire(spec.resolve('orval'));
const scalar = createRequire(orval.resolve('@scalar/json-magic/bundle'));
consumers.push(['reception codegen', scalar, '7.30.1']);

test('committed resolutions and minimum versions cover all five findings', () => {
  for (const directory of ['', 'WebsiteProject/']) {
    const manifest = JSON.parse(readFileSync(new URL(`${directory}package.json`, root)));
    assert.equal(manifest.overrides.undici, '^6.29.1');
    const lock = JSON.parse(readFileSync(new URL(`${directory}package-lock.json`, root)));
    const copies = Object.entries(lock.packages).filter(([path]) => path.endsWith('/undici'));
    assert.ok(copies.length);
    for (const [, metadata] of copies) {
      assert.equal(metadata.version, '6.29.1');
      assert.equal(metadata.resolved, 'https://registry.npmjs.org/undici/-/undici-6.29.1.tgz');
    }
  }
  const lock = readFileSync(new URL('voice-reception/pnpm-lock.yaml', root), 'utf8');
  const versions = [...lock.matchAll(/^  undici@(\d+\.\d+\.\d+):/gm)].map(match => match[1]);
  assert.deepEqual([...new Set(versions)], ['7.30.1']);
  assert.match(readFileSync(new URL('voice-reception/pnpm-workspace.yaml', root), 'utf8'),
    /"undici@7": "7\.30\.1"/);
});

for (const [name, require, version] of consumers) {
  test(`${name}: installed Undici rejects malicious responses without crashing`, () => {
    assert.equal(require('undici/package.json').version, version);
    // No uncaughtException handler: an orphan-stream error must fail the child.
    const result = spawnSync(process.execPath, ['--max-old-space-size=128', '--input-type=commonjs', '-e', `
      const assert = require('node:assert/strict');
      const { createServer } = require('node:http');
      const { createHash } = require('node:crypto');
      const { once } = require('node:events');
      const { Readable } = require('node:stream');
      const { pipeline } = require('node:stream/promises');
      const { createGunzip, gzipSync } = require('node:zlib');
      const { fetch } = require(${JSON.stringify(require.resolve('undici'))});
      const { EventSourceStream } = require(${JSON.stringify(join(dirname(require.resolve('undici/package.json')), 'lib/web/eventsource/eventsource-stream.js'))});

      async function checkParser(chunks, maxEventSize) {
        const parser = new EventSourceStream({ maxEventSize });
        parser.resume();
        const error = once(parser, 'error');
        for (const chunk of chunks) {
          if (!parser.write(chunk)) break;
        }
        const [failure] = await error;
        assert.match(failure.message, /size exceeded/);
        parser.destroy();
      }

      (async () => {
        // Many tiny fields stay below the byte limit but must hit the item cap.
        await checkParser([Buffer.from('data:x\\n'.repeat(140000))], 16 * 1024 * 1024);
        // An unfinished line split into tiny buffers must hit a separate cap.
        await checkParser(Array.from({ length: 1030 }, () => Buffer.from('x')), 64 * 1024);
        // A single oversized line must also be bounded.
        await checkParser([Buffer.from('data:' + 'x'.repeat(10000))], 1024);
        // Compressed wire bytes must not bypass the decompressed state cap.
        const compressed = gzipSync(Buffer.from('data:x\\n'.repeat(140000)));
        assert.ok(compressed.length < 2048);
        const compressedParser = new EventSourceStream({ maxEventSize: 16 * 1024 * 1024 });
        compressedParser.resume();
        await assert.rejects(pipeline(Readable.from([compressed]), createGunzip(), compressedParser), /size exceeded/);
        // Positive control: ordinary multiline SSE messages still work.
        const events = [];
        const parser = new EventSourceStream({ push: event => { if (event) events.push(event); return true; } });
        parser.end(Buffer.from('data:hello\\ndata:world\\n\\n'));
        await once(parser, 'finish');
        assert.equal(events[0].options.data, 'hello\\nworld');

        const server = createServer((req, res) => {
          if (req.url === '/attack') {
            res.writeHead(200, {
              'content-encoding': 'gzip, gzip, gzip, gzip, gzip, gzip',
              'content-length': '100'
            });
            res.flushHeaders();
            // Close after headers, without the promised body.
            setTimeout(() => res.destroy(), 20);
          } else {
            res.end('safe fixture');
          }
        });
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');
        const base = 'http://127.0.0.1:' + server.address().port;
        try {
          await assert.rejects(fetch(base + '/attack'));
          await new Promise(resolve => setTimeout(resolve, 100));
          assert.equal(await (await fetch(base)).text(), 'safe fixture');
          for (const algorithm of ['sha256', 'sha384', 'sha512']) {
            const good = createHash(algorithm).update('safe fixture').digest('base64');
            const bad = createHash(algorithm).update('tampered fixture').digest('base64');
            for (const token of [algorithm, algorithm.toUpperCase(), 'Sha' + algorithm.slice(3)]) {
              assert.equal(await (await fetch(base, { integrity: token + '-' + good })).text(), 'safe fixture');
              await assert.rejects(fetch(base, { integrity: token + '-' + bad }));
            }
          }
        } finally {
          server.closeAllConnections();
          await new Promise(resolve => server.close(resolve));
        }
        console.log('UNDICI_SECURITY_OK');
      })().catch(error => { console.error(error); process.exit(1); });
    `], { encoding: 'utf8', timeout: 15000 });
    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /UNDICI_SECURITY_OK/, 'child must complete every assertion');
  });
}
