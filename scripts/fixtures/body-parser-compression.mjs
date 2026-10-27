// Runs in a disposable child: do not add an uncaughtException handler here.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import { brotliCompressSync, deflateSync, gzipSync } from 'node:zlib';

const root = new URL('../../', import.meta.url);
const require = createRequire(new URL(`${process.argv[2]}package.json`, root));
const express = require('express');
const expressRequire = createRequire(require.resolve('express'));
const onFinished = expressRequire('on-finished');
const major = Number(expressRequire('body-parser/package.json').version.split('.')[0]);
const formats = [
  ['json', 'application/json', '{"guest":"José"}', { guest: 'José' }],
  ['urlencoded', 'application/x-www-form-urlencoded', 'guest[name]=Jos%C3%A9', { guest: { name: 'José' } }],
  ['text', 'text/plain', 'Olá guest', 'Olá guest'],
  ['raw', 'application/octet-stream', Buffer.from([0, 1, 2, 255]), '000102ff'],
];
const app = express();
let finishDelayedRequest;
app.use((req, _res, next) => {
  req.auditHash = createHash('sha256');
  req.pipe(req.auditHash); // Another body consumer must not be detached.
  next();
});
for (const [kind] of formats) {
  app.use(`/${kind}`, express[kind]({
    extended: true,
    verify: (req, _res, buffer) => { req.verified = buffer.toString('hex'); },
  }));
}
const result = req => ({
  body: Buffer.isBuffer(req.body) ? req.body.toString('hex') : req.body,
  verified: req.verified,
});
app.post('/:kind', (req, res) => res.json(result(req)));
app.post('/json/wait', (req, res) => {
  onFinished(req, () => res.json(result(req)));
  finishDelayedRequest();
});
app.post('/json/audit', (req, res) => {
  req.auditHash.once('finish', () => res.json({
    ...result(req), hash: req.auditHash.read().toString('hex'),
  }));
  finishDelayedRequest();
});
app.get('/health', (_req, res) => res.end('OK'));
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ type: error.type }));
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));

function request(path, encoding, bytes, contentType, deferredTail) {
  return new Promise((resolve, reject) => {
    const client = http.request({
      host: '127.0.0.1', port: server.address().port, path, agent: false,
      method: bytes ? 'POST' : 'GET',
      headers: bytes ? {
        'content-type': contentType, 'content-encoding': encoding,
        'content-length': bytes.length + (deferredTail?.length || 0),
      } : {},
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
      response.on('error', reject);
    });
    client.on('error', reject);
    client.setTimeout(2000, () => client.destroy(new Error('Request did not finish')));
    if (deferredTail) {
      finishDelayedRequest = () => client.end(deferredTail);
      client.write(bytes);
    } else client.end(bytes);
  });
}

try {
  const encoders = [['gzip', gzipSync], ['deflate', deflateSync]];
  if (major >= 2) encoders.push(['br', brotliCompressSync]);
  for (const [kind, contentType, body, expected] of formats) {
    const plain = Buffer.from(body);
    for (const [encoding, compress] of encoders) {
      const response = await request(`/${kind}`, encoding, compress(plain), contentType);
      assert.equal(response.status, 200, `${kind}/${encoding}`);
      assert.deepEqual(JSON.parse(response.body), { body: expected, verified: plain.toString('hex') });
    }
    // The complete gzip frame finishes before a later input chunk reaches zlib.
    const malicious = Buffer.concat([
      gzipSync(plain), Buffer.from([0]), Buffer.alloc(100 * 1024, 0x58),
    ]);
    assert.equal((await request(`/${kind}`, 'gzip', malicious, contentType)).status, 200);
  }
  const json = Buffer.from('{"guest":"José"}');
  const first = Buffer.concat([deflateSync(json), Buffer.from([0])]);
  const trailing = Buffer.alloc(1024);
  for (const mode of ['wait', 'audit']) {
    const response = await request(`/json/${mode}`, 'deflate', first, 'application/json', trailing);
    assert.equal(response.status, 200, `${mode}: request body must drain after decoding ends`);
    if (mode === 'audit') {
      assert.equal(JSON.parse(response.body).hash,
        createHash('sha256').update(first).update(trailing).digest('hex'));
    }
  }
  const malformed = Buffer.concat([gzipSync(json), Buffer.from([0]), Buffer.alloc(100 * 1024, 0x58)]);
  assert.equal((await request('/json', 'gzip', malformed, 'application/json; charset=utf-999')).status, 415);
  assert.equal((await request('/json/missing', 'gzip', malformed, 'application/json')).status, 404);
  await delay(250); // Late decoder errors must not kill an apparently successful request.
  assert.equal((await request('/health')).status, 200);
  console.log('compression regressions passed');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
