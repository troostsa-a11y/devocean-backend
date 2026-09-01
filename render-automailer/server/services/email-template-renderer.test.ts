import assert from 'node:assert/strict';
import test from 'node:test';
import { EmailTemplateRenderer } from './email-template-renderer';

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