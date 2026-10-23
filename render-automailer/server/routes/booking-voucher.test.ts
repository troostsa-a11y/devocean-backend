import assert from 'node:assert/strict';
import http from 'node:http';
import test, { after, before } from 'node:test';
import express from 'express';
import Stripe from 'stripe';
import { createBookingRouter } from './booking';
import { BookingCartError } from '../services/booking-cart';
import { EmailTemplateRenderer } from '../services/email-template-renderer';

const CODE = 'GV-TEST-ONCE';
const SECRET = 'whsec_voucher_security_fixture';
const signer = new Stripe('sk_test_voucher_security_fixture');
const fixtureEnv = {
  BEDS24_REFRESH_TOKEN: 'fixture', STRIPE_SECRET_KEY: 'sk_test_fixture',
  STRIPE_WEBHOOK_SECRET: SECRET, BOOKING_CURRENCY: 'USD',
};
const previousEnv = Object.fromEntries(Object.keys(fixtureEnv).map(key => [key, process.env[key]]));
before(() => Object.assign(process.env, fixtureEnv));
after(() => {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function record(id = 1, zero = false): any {
  return {
    id, sessionRef: `voucher-booking-${id}`, stripeSessionId: `cs_voucher_${id}`,
    roomId: 'garden-cottage', roomName: 'Garden Cottage', offerId: 2,
    checkInDate: '2030-01-10', checkOutDate: '2030-01-12',
    numAdults: 1, numChildren: 0, numInfants: 0,
    guestFirstName: 'Zoë', guestLastName: 'Guest', guestEmail: 'guest@example.test',
    guestPhone: '+000', guestPostalCode: '0000', guestLanguage: 'EN', currency: 'USD',
    totalAmount: zero ? '0.00' : '50.00', depositAmount: zero ? '0.00' : '25.00',
    balanceDue: zero ? '0.00' : '25.00', depositPercent: 50,
    voucherCode: CODE, voucherDiscount: zero ? '100.00' : '50.00',
    status: 'pending', paymentStatus: 'pending',
    legs: [{
      roomId: 'garden-cottage', roomName: 'Garden Cottage', offerId: 2,
      offerName: 'Flexible', adults: 1, children: 0, infants: 0,
      total: 100, discount: zero ? 100 : 50, deposit: zero ? 0 : 25,
      balance: zero ? 0 : 25, beds24BookingId: null,
    }],
  };
}

function fixture(initial = [record()]) {
  const records = new Map<string, any>(initial.map(item => [item.sessionRef, structuredClone(item)]));
  const credit = { status: 'active', owner: null as number | null, expired: false };
  const state = { redemptionFailures: 0, refundFailures: 0, releaseFailures: 0, failRoomAttempt: 0, soldOut: false };
  const rooms: any[] = [], refunds: string[] = [], emails: string[] = [], alerts: string[] = [];
  const emailGroups = new Set<string>();
  let roomAttempts = 0, redemptionCalls = 0, checkouts = 0;
  const snapshot = (ref: string) => records.has(ref) ? structuredClone(records.get(ref)) : undefined;
  const db: any = {
    getDirectBookingByRef: async (ref: string) => snapshot(ref),
    getDirectBookingByStripeSession: async (id: string) =>
      [...records.values()].find(item => item.stripeSessionId === id),
    createDirectBooking: async (data: any) => {
      const item = { ...structuredClone(data), id: records.size + 1 };
      records.set(item.sessionRef, item);
      return item;
    },
    updateDirectBooking: async (ref: string, patch: any) => {
      Object.assign(records.get(ref), structuredClone(patch));
      return snapshot(ref);
    },
    claimDirectBookingForProcessing: async (ref: string, intent: string | null) => {
      const item = records.get(ref);
      if (item.paymentStatus === 'refunded' ||
          !['pending', 'failed', 'sold_out_refund_pending'].includes(item.status)) return false;
      Object.assign(item, { status: 'processing', paymentStatus: 'paid', stripePaymentIntentId: intent });
      return true;
    },
    getActiveDiscountCodeByCode: async () => undefined,
    getActiveGiftVoucherByCode: async (code: string) => {
      const previouslyUsed = [...records.values()].some(item =>
        item.voucherCode === code && Number(item.voucherDiscount) > 0 &&
        (item.status === 'confirmed' || item.beds24BookingId));
      return code === CODE && credit.status === 'active' && !previouslyUsed
        ? { code: CODE, amountUsd: '200.00',
            expiresAt: new Date(credit.expired ? '2020-01-01' : '2040-01-01') }
        : undefined;
    },
    redeemGiftVoucher: async (code: string, owner: number) => {
      redemptionCalls++;
      if (state.redemptionFailures > 0) {
        state.redemptionFailures--;
        throw new Error('Temporary voucher storage failure');
      }
      if (code !== CODE || credit.expired) return false;
      if (credit.status === 'redeemed') return credit.owner === owner;
      credit.status = 'redeemed';
      credit.owner = owner;
      return true;
    },
    releaseGiftVoucherRedemption: async (_code: string, owner: number) => {
      if (state.releaseFailures > 0) {
        state.releaseFailures--;
        throw new Error('Temporary credit cleanup failure');
      }
      const item = [...records.values()].find(row => row.id === owner);
      if (credit.owner === owner && item.paymentStatus === 'refunded' &&
          !item.legs.some((leg: any) => leg.beds24BookingId)) {
        credit.status = 'active';
        credit.owner = null;
      }
    },
  };
  const beds24: any = {
    getRooms: async () => {
      if (state.soldOut) throw new BookingCartError('Sold out', 409, 'SOLD_OUT');
      return [{ roomId: 'garden-cottage', name: 'Garden Cottage', qty: 5,
        maxPeople: 2, maxAdults: 2, maxChildren: 0 }];
    },
    getPricedOffersByRoom: async () => ({
      'garden-cottage': [{ offerId: 2, offerName: 'Flexible', type: 'standard',
        refundable: true, total: 100, unitsAvailable: 5 }],
    }),
    getCurrency: () => 'USD',
    getCancellationDays: () => 30,
    getDepositPercentForOffer: () => 50,
    getDepositPercentForArrival: () => 50,
    createConfirmedBooking: async (input: any) => {
      assert.equal(credit.status, 'redeemed', 'external booking started before credit was claimed');
      if (++roomAttempts === state.failRoomAttempt) throw new Error('Temporary Beds24 failure');
      // Let the competing HTTP request reach redemption before fulfillment ends.
      await new Promise(resolve => setTimeout(resolve, 5));
      rooms.push(input);
      return { beds24BookingId: `beds-fixture-${roomAttempts}` };
    },
  };
  const deps = {
    db, beds24,
    requireAdminKey: (_req: any, _res: any, next: any) => next(),
    constructWebhookEvent: (raw: Buffer | string, signature: string | undefined) =>
      signer.webhooks.constructEvent(raw, signature!, SECRET),
    createCheckoutSession: async () => ({
      url: 'https://checkout.example.test/fixture', stripeSessionId: `cs_created_${++checkouts}`,
    }),
    refundPaymentIntent: async (intent: string) => {
      refunds.push(intent);
      if (state.refundFailures > 0) {
        state.refundFailures--;
        throw new Error('Temporary Stripe failure');
      }
    },
    sendBookingAlert: async (subject: string) => { alerts.push(subject); },
    emailService: {
      createManualBooking: async (data: any) => {
        if (emailGroups.has(data.groupRef)) throw new Error('already exists');
        emailGroups.add(data.groupRef);
        emails.push(new EmailTemplateRenderer().render('post_booking', 'en-GB', data).html);
        return { booking: {}, scheduledEmails: [] };
      },
    },
  };
  return { records, credit, state, rooms, refunds, emails, alerts, deps,
    counts: () => ({ redemptionCalls, roomAttempts, checkouts }) };
}

async function withServer(f: ReturnType<typeof fixture>, run: (url: string) => Promise<void>) {
  const app = express();
  app.use(express.json({ verify: (req: any, _res, body) => { req.rawBody = body; } }));
  app.use('/api/booking', createBookingRouter(f.deps));
  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    await run(`http://127.0.0.1:${address.port}/api/booking`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

async function webhook(url: string, item: any, type = 'checkout.session.completed', unpaid = false) {
  const noPayment = Number(item.depositAmount) === 0;
  const payload = JSON.stringify({
    id: `evt_${item.sessionRef}`, object: 'event', type,
    data: { object: {
      id: item.stripeSessionId, object: 'checkout.session', mode: 'payment',
      metadata: { sessionRef: item.sessionRef, kind: 'lodge_deposit' },
      currency: 'usd', amount_total: Math.round(Number(item.depositAmount) * 100),
      payment_status: unpaid ? 'unpaid' : noPayment ? 'no_payment_required' : 'paid',
      payment_intent: noPayment ? null : `pi_${item.id}`,
    } },
  });
  return fetch(`${url}/webhook`, {
    method: 'POST', headers: {
      'content-type': 'application/json',
      'stripe-signature': signer.webhooks.generateTestHeaderString({ payload, secret: SECRET }),
    }, body: payload,
  });
}

const checkoutBody = () => ({
  checkIn: '2030-01-10', checkOut: '2030-01-12', adults: 1, children: 0, infants: 0,
  rooms: [{ roomId: 'garden-cottage', offerId: 2, qty: 1, adults: 1, children: 0, infants: 0 }],
  voucher: CODE,
  guest: { firstName: '<a href="https://phish.invalid">Pay here</a>', lastName: 'Guest',
    email: 'guest@example.test', phone: '+000', postalCode: '0000' },
});

test('public checkout keeps unpaid credit available and paid guest markup inert in the email', async () => {
  const f = fixture([]);
  await withServer(f, async url => {
    const response = await fetch(`${url}/checkout`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(checkoutBody()),
    });
    assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
    const { sessionRef } = await response.json() as any;
    assert.equal(f.credit.status, 'active', 'an abandoned checkout must not burn credit');
    assert.equal(f.rooms.length, 0);
    assert.equal((await webhook(url, f.records.get(sessionRef))).status, 200);
    assert.equal(f.credit.status, 'redeemed');
    assert.equal(f.emails.length, 1);
    assert.ok(f.emails[0].includes('&lt;a href=&quot;https://phish.invalid&quot;&gt;Pay here&lt;/a&gt;'));
    assert.doesNotMatch(f.emails[0], /<a\b[^>]*href=["']https:\/\/phish\.invalid/i);
  });
});

test('two concurrent verified payments can create only one voucher-funded booking', async () => {
  const f = fixture([record(1), record(2)]);
  await withServer(f, async url => {
    const responses = await Promise.all([...f.records.values()].map(item => webhook(url, item)));
    assert.deepEqual(responses.map(response => response.status), [200, 200]);
    assert.equal(f.rooms.length, 1);
    assert.equal(f.refunds.length, 1);
    assert.equal([...f.records.values()].filter(item => item.status === 'confirmed').length, 1);
    const loser = [...f.records.values()].find(item => item.paymentStatus === 'refunded');
    assert.ok(loser);
    assert.notEqual(f.credit.owner, loser.id);
    assert.equal((await webhook(url, loser)).status, 200);
    assert.equal(f.refunds.length, 1, 'a replay must not refund twice or release the winner');
    assert.equal(f.credit.status, 'redeemed');
  });
});

test('credit cannot create repeated free stays with no payment intent', async () => {
  const f = fixture([record(1, true), record(2, true)]);
  await withServer(f, async url => {
    for (const item of f.records.values()) assert.equal((await webhook(url, item)).status, 200);
    assert.equal(f.rooms.length, 1);
    assert.equal(f.refunds.length, 0);
    assert.equal(f.records.get('voucher-booking-2').status, 'failed');
    assert.equal(f.credit.owner, 1);
  });
});

test('partial room creation retries retain voucher ownership and do not recreate confirmed rooms', async () => {
  const item = record();
  item.numAdults = 2;
  item.legs.push(structuredClone(item.legs[0]));
  const f = fixture([item]);
  f.state.failRoomAttempt = 2;
  await withServer(f, async url => {
    assert.equal((await webhook(url, item)).status, 500);
    assert.equal(f.credit.owner, item.id);
    assert.equal(f.rooms.length, 1);
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal(f.rooms.length, 2);
    assert.equal(f.counts().roomAttempts, 3);
    assert.equal(f.refunds.length, 0);
  });
});

test('temporary voucher storage failure retries without refunding or creating an uncredited stay', async () => {
  const f = fixture();
  f.state.redemptionFailures = 1;
  await withServer(f, async url => {
    const item = f.records.get('voucher-booking-1');
    assert.equal((await webhook(url, item)).status, 500);
    assert.equal(f.rooms.length, 0);
    assert.equal(f.refunds.length, 0);
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal(f.rooms.length, 1);
  });
});

test('confirmed webhook replays neither spend more credit nor recreate rooms or guest emails', async () => {
  const f = fixture();
  await withServer(f, async url => {
    const item = f.records.get('voucher-booking-1');
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal(f.rooms.length, 1);
    assert.equal(f.emails.length, 1);
    assert.equal(f.counts().redemptionCalls, 1);
    assert.equal(f.refunds.length, 0);
  });
});

test('a voucher conflict on an already-created room stops for review without automatic refund', async () => {
  const item = record();
  item.legs[0].beds24BookingId = 'existing-room';
  item.beds24BookingId = 'existing-room';
  const f = fixture([item]);
  f.credit.status = 'redeemed';
  f.credit.owner = 99;
  await withServer(f, async url => {
    assert.equal((await webhook(url, item)).status, 500);
    assert.equal(f.records.get(item.sessionRef).paymentStatus, 'review_required');
    assert.equal(f.rooms.length, 0);
    assert.equal(f.refunds.length, 0);
    assert.equal(f.alerts.length, 1);
    assert.equal(f.credit.owner, 99);
  });
});

test('losing-checkout refund failures remain retryable without releasing another booking credit', async () => {
  const f = fixture();
  f.credit.status = 'redeemed';
  f.credit.owner = 99;
  f.state.refundFailures = 1;
  await withServer(f, async url => {
    const item = f.records.get('voucher-booking-1');
    assert.equal((await webhook(url, item)).status, 500);
    assert.equal(f.records.get(item.sessionRef).paymentStatus, 'refund_pending');
    assert.equal(f.credit.owner, 99);
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal(f.refunds.length, 2);
    assert.equal(f.rooms.length, 0);
    assert.equal(f.credit.owner, 99);
  });
});

test('a sold-out refund restores only its owner credit, including cleanup retries after refund', async () => {
  const f = fixture();
  f.credit.status = 'redeemed';
  f.credit.owner = 1;
  f.state.soldOut = true;
  f.state.releaseFailures = 1;
  await withServer(f, async url => {
    const item = f.records.get('voucher-booking-1');
    assert.equal((await webhook(url, item)).status, 500);
    assert.equal(f.records.get(item.sessionRef).paymentStatus, 'refunded');
    assert.equal(f.credit.status, 'redeemed');
    assert.equal((await webhook(url, item)).status, 200);
    assert.equal(f.refunds.length, 1);
    assert.equal(f.credit.status, 'active');
  });
});

test('unpaid completions do not consume credit; a later verified async success does', async () => {
  const f = fixture();
  await withServer(f, async url => {
    const item = f.records.get('voucher-booking-1');
    assert.equal((await webhook(url, item, 'checkout.session.completed', true)).status, 200);
    assert.equal(f.credit.status, 'active');
    assert.equal(f.counts().redemptionCalls, 0);
    assert.equal((await webhook(url, item, 'checkout.session.async_payment_succeeded')).status, 200);
    assert.equal(f.credit.status, 'redeemed');
  });
});

test('spent, historically-used and expired vouchers block checkout instead of charging without the credit', async () => {
  for (const kind of ['spent', 'historical', 'expired']) {
    const old = record();
    if (kind === 'historical') old.status = 'confirmed';
    const f = fixture(kind === 'historical' ? [old] : []);
    if (kind === 'spent') f.credit.status = 'redeemed';
    if (kind === 'expired') f.credit.expired = true;
    await withServer(f, async url => {
      const response = await fetch(`${url}/checkout`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(checkoutBody()),
      });
      assert.equal(response.status, 409);
      assert.equal((await response.json() as any).code, 'VOUCHER_UNAVAILABLE');
      assert.equal(f.counts().checkouts, 0);
    });
  }
});
