import { test } from 'node:test';
import assert from 'node:assert/strict';
import imaps from 'imap-simple';
import { isImapTlsEnabled } from './imap-security';
import { EmailParser } from './email-parser';

test('IMAP TLS is enabled by default and for all values except explicit false', () => {
  for (const value of [undefined, '', ' ', 'ssl', 'true', ' SSL ', 'TRUE', 'starttls', '0', 'typo']) {
    assert.equal(isImapTlsEnabled(value), true, `value: ${JSON.stringify(value)}`);
  }
  for (const value of ['false', 'FALSE', ' false ']) {
    assert.equal(isImapTlsEnabled(value), false, `value: ${JSON.stringify(value)}`);
  }
});

test('both mailbox operations pass secure defaults to imap-simple without weakening certificate validation', async (t) => {
  const connectFailure = new Error('mock connection stopped before network access');
  const calls: any[] = [];
  t.mock.method(imaps, 'connect', async (options: any) => {
    calls.push(options.imap);
    throw connectFailure;
  });
  // The production error paths log failures; keep the deliberate mock errors quiet.
  t.mock.method(console, 'error', () => {});
  const base = { host: 'mail.example.test', port: 993, user: 'test', password: 'test' };
  for (const tls of [undefined, true, false]) {
    const config = tls === undefined ? base : { ...base, tls };
    for (const operation of [
      () => EmailParser.fetchUnreadEmails(config),
      () => EmailParser.markEmailAsRead(config, 123),
    ]) {
      await assert.rejects(operation, error => error === connectFailure);
      const options = calls[calls.length - 1];
      assert.equal(options.tls, tls !== false);
      assert.equal(options.tlsOptions?.rejectUnauthorized === false, false);
      assert.equal(options.autotls, undefined);
    }
  }
  assert.equal(calls.length, 6);
});
