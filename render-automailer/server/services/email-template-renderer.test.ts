import assert from 'node:assert/strict';
import test from 'node:test';
import { EmailTemplateRenderer } from './email-template-renderer';
import { EmailSenderService } from './email-sender';
import type { DatabaseService } from './database';

const MARIN_EMAIL_TYPES = ['post_booking', 'pre_arrival', 'arrival'];

test('Marin receptionist panel renders in every supported guest locale', () => {
  const renderer = new EmailTemplateRenderer();

  for (const emailType of MARIN_EMAIL_TYPES) {
    for (const locale of renderer.getAvailableLanguages(emailType)) {
      const { html } = renderer.render(emailType, locale, {
        firstName: 'Alex',
        guestName: 'Alex Guest',
        checkInDate: '2026-10-10',
        checkOutDate: '2026-10-12',
        wifiNetwork: 'DEVOCEAN',
        wifiPassword: 'example',
        lodgeAddress: 'Ponta do Ouro',
      });

      assert.match(html, /https:\/\/www\.devoceanlodge\.com\//);
      assert.match(html, /Marin/i);
      assert.doesNotMatch(html, /\{\{t\.marin(?:Title|Text|Cta)\}\}/);
    }
  }
});

test('Marin receptionist panel stays out of cancellation and post-departure emails', () => {
  const renderer = new EmailTemplateRenderer();

  for (const emailType of ['cancellation', 'post_departure']) {
    const { html } = renderer.render(emailType, 'en-GB', {
      firstName: 'Alex',
      guestName: 'Alex Guest',
      checkInDate: '2026-10-10',
      checkOutDate: '2026-10-12',
    });

    assert.doesNotMatch(html, /marin/i);
  }
});

for (const emailType of [...MARIN_EMAIL_TYPES, 'post_departure', 'cancellation']) {
  test(`${emailType}: guest markup is inert in nested greetings in every locale`, () => {
    const renderer = new EmailTemplateRenderer();
    const attack = '<a href="https://phish.invalid">Pay here</a>';
    for (const locale of renderer.getAvailableLanguages(emailType)) {
      const { html } = renderer.render(emailType, locale, {
        firstName: attack, guestName: attack,
        checkInDate: '2030-01-10', checkOutDate: '2030-01-12',
      });
      assert.ok(html.includes('&lt;a href=&quot;https://phish.invalid&quot;&gt;Pay here&lt;/a&gt;'),
        `${emailType}/${locale}: guest text disappeared or was not escaped`);
      assert.doesNotMatch(html, /<a\b[^>]*href=["']https:\/\/phish\.invalid/i);
      assert.doesNotMatch(html, /\{\{t\.greeting\}\}/);
      assert.match(html, /<table\b/); // Trusted template formatting is preserved.
    }
  });
}

test('guest values cannot invoke translation placeholders on later render passes', () => {
  const { html } = new EmailTemplateRenderer().render('post_booking', 'en-GB', {
    firstName: '{{t.marinTitle}}', guestName: '{{t.marinTitle}}',
  });
  assert.ok(html.includes('&#123;&#123;t.marinTitle&#125;&#125;'));
});

test('Unicode names and punctuation remain literal without enabling attributes or tags', () => {
  const { html } = new EmailTemplateRenderer().render('post_booking', 'en-GB', {
    firstName: 'Zoë O\'Connor & José <"family">',
  });
  assert.ok(html.includes('Zoë O&#39;Connor &amp; José &lt;&quot;family&quot;&gt;'));
});

test('fresh guest input in previously queued emails is escaped in both guest and BCC copies', async () => {
  const db = {
    getBookingById: async () => ({
      status: 'active', firstName: '<img src=x onerror="alert(1)">',
    }),
    markEmailAsSent: async () => {},
    logEmail: async () => {},
    updateBookingEmailStatus: async () => {},
  } as unknown as DatabaseService;
  const sender = new EmailSenderService(
    { host: 'smtp.invalid', port: 25, secure: false, auth: { user: 'fixture', pass: 'fixture' } },
    db, 'booking@example.test', 'Lodge Bookings', 'bcc@example.test',
  );
  let sent: any;
  // No SMTP connection or attachment reads: capture the final production body.
  (sender as any).transporter = {
    sendMail: async (options: any) => {
      sent = options;
      return { messageId: 'fixture', accepted: [options.to, options.bcc], rejected: [] };
    },
  };
  assert.equal(await sender.sendScheduledEmail({
    id: 1, bookingId: 1, emailType: 'post_booking', language: 'en-GB',
    recipientEmail: 'guest@example.test', templateData: { firstName: 'Old name' },
  } as any), true);
  assert.equal(sent.to, 'guest@example.test');
  assert.equal(sent.bcc, 'bcc@example.test');
  assert.ok(sent.html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  assert.doesNotMatch(sent.html, /<img\b[^>]*onerror/i);
});