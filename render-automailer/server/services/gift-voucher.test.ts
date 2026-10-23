import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderVoucherEmail } from './gift-voucher';

const voucher = {
  to: 'guest@example.com', purchaserName: 'João & María', recipientName: 'A Friend',
  message: 'Enjoy your stay!', code: 'GV-ABCD-EFGH-JKLM', amountUsd: 20,
  expiresAt: new Date('2027-01-01T12:00:00Z'), siteUrl: 'https://devoceanlodge.com',
};

test('all customer-controlled text is HTML escaped, including historical stored markup', () => {
  const attack = '<a href="https://attacker.example">Verify account</a><img src=x onerror="steal()">';
  for (const field of ['purchaserName', 'recipientName', 'message']) {
    const html = renderVoucherEmail({ ...voucher, [field]: attack });
    assert.ok(!html.includes(attack));
    assert.ok(!html.includes('<a href="https://attacker.example"'));
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;a href=&quot;https://attacker.example&quot;&gt;'));
    assert.ok(html.includes('&lt;/a&gt;&lt;img'));
  }
});

test('names, apostrophes, quotes and entity-looking text remain text', () => {
  const html = renderVoucherEmail({ ...voucher, message: `Tom & 'Sue' "welcome" &lt;a&gt;` });
  assert.ok(html.includes('João &amp; María'));
  assert.ok(html.includes('Tom &amp; &#39;Sue&#39; &quot;welcome&quot; &amp;lt;a&amp;gt;'));
  assert.ok(html.includes(voucher.code));
  assert.ok(html.includes('$20 USD'));
  assert.ok(html.includes('href="https://devoceanlodge.com/book-direct"'));
});

test('optional recipient and message are still optional', () => {
  const html = renderVoucherEmail({ ...voucher, recipientName: undefined, message: undefined });
  assert.ok(!html.includes('This voucher is for'));
  assert.ok(!html.includes('<blockquote'));
  assert.ok(html.includes('DEVOCEAN Lodge'));
});
