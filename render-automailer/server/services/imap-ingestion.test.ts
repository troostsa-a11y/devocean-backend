import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import imaps from 'imap-simple';
import { fetchUnreadBatch, IMAP_LIMITS } from './imap-ingestion';
import { EmailParser } from './email-parser';
import { EmailAutomationService } from './email-automation';

interface Mail {
  uid: number;
  size: number;
  flags?: string[];
  body?: Buffer | string;
  announcedSize?: number;
}

function mailbox(mail: Mail[]) {
  const connection: any = new EventEmitter();
  const metadataRequests: string[] = [];
  const bodyRequests: number[] = [];
  let destroyed = false;
  let ended = false;
  const emitFetch = (rows: Mail[], bodies: boolean) => {
    const fetch = new EventEmitter();
    setImmediate(async () => {
      for (const row of rows) {
        if (destroyed) return;
        const message = new EventEmitter();
        fetch.emit('message', message, mail.indexOf(row) + 1);
        if (bodies) {
          const stream = new PassThrough();
          const body = row.body ?? 'From: booking@beds24.com\r\n\r\nBooking Ref: 123';
          message.emit('body', stream, { which: '', size: row.announcedSize ?? Buffer.byteLength(body) });
          await new Promise<void>(resolve => {
            stream.on('end', resolve);
            stream.end(body);
          });
        }
        message.emit('attributes', { uid: row.uid, size: row.size, flags: row.flags ?? [] });
        message.emit('end');
      }
      fetch.emit('end');
    });
    return fetch;
  };
  connection.imap = {
    seq: {
      fetch(range: string, options: any) {
        metadataRequests.push(range);
        assert.deepEqual(options, { size: true }); // No bodies/structure/attachments.
        const [start, end] = range.split(':').map(Number);
        return emitFetch(mail.slice(start - 1, end), false);
      },
    },
    fetch(uid: number, options: any) {
      assert.deepEqual(options, { bodies: [''], markSeen: false });
      bodyRequests.push(uid);
      return emitFetch(mail.filter(row => row.uid === uid), true);
    },
    destroy() { destroyed = true; },
  };
  connection.openBox = async () => ({ uidvalidity: 1, messages: { total: mail.length } });
  connection.end = () => { ended = true; };
  return { connection, metadataRequests, bodyRequests, get destroyed() { return destroyed; }, get ended() { return ended; } };
}

test('bounds a large unread backlog before fetching bodies, and advances on the next batch', async () => {
  const mail: Mail[] = Array.from({ length: 10_000 }, (_, i) => ({ uid: i + 1, size: 100 }));
  const mock = mailbox(mail);
  const first = await fetchUnreadBatch(mock.connection, 10_000, 1);
  assert.equal(first.messages.length, IMAP_LIMITS.batchMessages);
  assert.deepEqual(mock.metadataRequests, ['9901:10000', '1:100']);
  assert.equal(mock.bodyRequests.length, IMAP_LIMITS.batchMessages);
  assert.equal(first.nextSequence, 14); // Recent mail uses at most 12 slots.
  for (const message of first.messages) mail[message.attributes.uid - 1].flags = ['\\Seen'];
  const second = await fetchUnreadBatch(mock.connection, 10_000, first.nextSequence);
  assert.equal(second.messages[0].attributes.uid, 9913);
  assert.equal(second.nextSequence, 27);
});

test('25 persistent recent non-booking emails cannot starve an older unread booking across checks', async () => {
  const mail: Mail[] = Array.from({ length: 1000 }, (_, i) => ({
    uid: i + 1, size: 100, flags: i >= 975 ? [] : ['\\Seen'],
    body: 'From: newsletter@example.invalid\r\n\r\nOrdinary non-booking email',
  }));
  mail[149] = { uid: 150, size: 100, flags: [],
    body: 'From: bookings@beds24.com\r\n\r\nBooking Ref: 123' };
  const mock = mailbox(mail);
  const first = await fetchUnreadBatch(mock.connection, mail.length, 1);
  assert.equal(first.messages.length, 12);
  assert.equal(first.nextSequence, 101);
  // Deliberately do not mark any of the ordinary recent mail Seen.
  const second = await fetchUnreadBatch(mock.connection, mail.length, first.nextSequence);
  assert.ok(second.messages.some(message => message.attributes.uid === 150));
  assert.equal(second.nextSequence, 201);
  assert.equal(mail[975].flags?.length, 0);
});

test('persistent historical unread mail also advances and cannot starve recent bookings', async () => {
  const mail: Mail[] = Array.from({ length: 1000 }, (_, i) => ({
    uid: i + 1, size: 100, flags: i < 30 || i === 999 ? [] : ['\\Seen'],
  }));
  const mock = mailbox(mail);
  const first = await fetchUnreadBatch(mock.connection, mail.length, 1);
  assert.ok(first.messages.some(message => message.attributes.uid === 1000));
  assert.equal(first.nextSequence, 25);
  const second = await fetchUnreadBatch(mock.connection, mail.length, first.nextSequence);
  assert.ok(second.messages.some(message => message.attributes.uid === 26));
  assert.equal(second.nextSequence, 125);
});

test('new bookings are not delayed by a large read history, while historical unread mail still advances', async () => {
  const mail: Mail[] = Array.from({ length: 10_000 }, (_, i) => ({
    uid: i + 1, size: 100, flags: ['\\Seen'],
  }));
  mail[0].flags = [];
  mail[9999].flags = [];
  const mock = mailbox(mail);
  const result = await fetchUnreadBatch(mock.connection, mail.length, 1);
  assert.deepEqual(mock.bodyRequests, [10_000, 1]);
  assert.equal(result.nextSequence, 101);
});

test('skips oversized messages (including attachments) without downloading or marking them read', async () => {
  const mail = [
    { uid: 1, size: IMAP_LIMITS.messageBytes + 1 },
    { uid: 2, size: 100 },
    { uid: 3, size: Number.NaN },
    { uid: 4, size: 100, flags: ['\\Seen'] },
  ];
  const mock = mailbox(mail);
  const result = await fetchUnreadBatch(mock.connection, mail.length, 1);
  assert.deepEqual(mock.bodyRequests, [2]);
  assert.deepEqual(result.messages.map(m => m.attributes.uid), [2]);
  assert.equal(result.nextSequence, 1);
  assert.equal(mail[0].flags, undefined);
});

test('caps total batch bytes and defers the next message instead of dropping it', async () => {
  const body = Buffer.alloc(IMAP_LIMITS.messageBytes, 'a');
  const mock = mailbox(Array.from({ length: 5 }, (_, i) => ({ uid: i + 1, size: body.length, body })));
  const result = await fetchUnreadBatch(mock.connection, 5, 1);
  assert.equal(result.messages.length, 4);
  assert.equal(result.nextSequence, 5);
  assert.deepEqual(mock.bodyRequests, [1, 2, 3, 4]);
  const next = await fetchUnreadBatch(mock.connection, 5, result.nextSequence);
  assert.equal(next.messages[0].attributes.uid, 5);
});

test('checks actual stream bytes even if RFC822.SIZE and body size are underreported', async () => {
  const mock = mailbox([{ uid: 1, size: 100, announcedSize: 100,
    body: Buffer.alloc(IMAP_LIMITS.messageBytes + 1) }]);
  await assert.rejects(fetchUnreadBatch(mock.connection, 1, 1), /byte limit/);
  assert.equal(mock.destroyed, true);
});

test('rejects oversized announced literals before accumulating chunks', async () => {
  const mock = mailbox([{ uid: 1, size: 100, announcedSize: IMAP_LIMITS.messageBytes + 1 }]);
  await assert.rejects(fetchUnreadBatch(mock.connection, 1, 1), /byte limit/);
  assert.equal(mock.destroyed, true);
});

test('empty mailboxes do not issue FETCH, and stale cursors wrap safely', async () => {
  const empty = mailbox([]);
  assert.deepEqual(await fetchUnreadBatch(empty.connection, 0, 1), { messages: [], nextSequence: 1 });
  assert.deepEqual(empty.metadataRequests, []);
  const mock = mailbox([{ uid: 12, size: 100 }]);
  const result = await fetchUnreadBatch(mock.connection, 1, 400);
  assert.equal(result.messages[0].attributes.uid, 12);
  assert.deepEqual(mock.metadataRequests, ['1:1']);
});

test('a full window of oversized unread mail cannot prevent the next window being processed', async () => {
  const mock = mailbox([
    ...Array.from({ length: 100 }, (_, i) => ({ uid: i + 1, size: IMAP_LIMITS.messageBytes + 1 })),
    { uid: 101, size: 100 },
    ...Array.from({ length: 200 }, (_, i) => ({ uid: i + 102, size: 100, flags: ['\\Seen'] })),
  ]);
  const first = await fetchUnreadBatch(mock.connection, 301, 1);
  assert.equal(first.messages.length, 0);
  assert.equal(first.nextSequence, 101);
  const second = await fetchUnreadBatch(mock.connection, 301, first.nextSequence);
  assert.deepEqual(mock.bodyRequests, [101]);
  assert.equal(second.messages.length, 1);
});

test('normal RFC822 messages retain their full content exactly once', async () => {
  const body = 'From: bookings@beds24.com\r\nSubject: New Booking\r\n\r\nBooking Ref: 123\r\nName: Guest';
  const mock = mailbox([{ uid: 1, size: Buffer.byteLength(body), body }]);
  const result = await fetchUnreadBatch(mock.connection, 1, 1);
  assert.deepEqual(result.messages[0], { attributes: { uid: 1 }, parts: [{ which: '', body }] });
});

test('connection is closed if mailbox opening fails', async (t) => {
  const mock = mailbox([]);
  mock.connection.openBox = async () => { throw new Error('open failed'); };
  t.mock.method(imaps, 'connect', async () => mock.connection);
  await assert.rejects(EmailParser.fetchUnreadEmails({
    host: 'example.invalid', port: 993, user: 'test', password: 'test', tls: true,
  }), /open failed/);
  assert.equal(mock.ended, true);
});

test('stalled FETCH times out and destroys the connection', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const mock = mailbox([]);
  mock.connection.imap.seq.fetch = () => new EventEmitter();
  const pending = assert.rejects(fetchUnreadBatch(mock.connection, 1, 1), /time limit/);
  t.mock.timers.tick(IMAP_LIMITS.fetchTimeoutMs);
  await pending;
  assert.equal(mock.destroyed, true);
});

test('manual/scheduled checks cannot overlap and release the guard after failure', async (t) => {
  const service: any = Object.create(EmailAutomationService.prototype);
  let finish: () => void;
  let calls = 0;
  service.db = { logEmailCheck: async () => {} };
  t.mock.method(EmailParser, 'fetchUnreadEmails', async () => {
    calls++;
    await new Promise<void>(resolve => { finish = resolve; });
    throw new Error('fetch failed');
  });
  const first = service.runManualCheck();
  await service.runManualCheck();
  assert.equal(calls, 1);
  finish!();
  await first;
  assert.equal(service.emailCheckInProgress, false);
});

test('untrusted mail cannot reach booking handlers; header authentication excludes the body', async (t) => {
  const body = 'From: attacker@example.invalid\r\nSubject: Spoof\r\n\r\nAuthentication-Results: forged; spf=pass';
  const service: any = Object.create(EmailAutomationService.prototype);
  service.db = { logEmailCheck: async () => {} };
  service.validateSenderAuthenticity = (address: string, headers: Map<string, unknown>) => {
    assert.equal(address, 'attacker@example.invalid');
    assert.equal(headers.has('authentication-results'), false);
    return { trusted: false, reason: 'untrusted' };
  };
  service.cancellationHandler = { processCancellationEmail: () => assert.fail('untrusted handler') };
  t.mock.method(EmailParser, 'fetchUnreadEmails', async () => [
    { attributes: { uid: 1 }, parts: [{ which: '', body }] },
  ]);
  const mark = t.mock.method(EmailParser, 'markEmailAsRead', async () => {});
  await service.runManualCheck();
  assert.equal(mark.mock.callCount(), 1);
});
