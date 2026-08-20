import assert from 'node:assert/strict';
import http from 'node:http';
import test, { after, before } from 'node:test';
import express from 'express';
import Stripe from 'stripe';
import type { DatabaseService } from '../services/database';
import { createBookingRouter } from './booking';
import { BookingCartError } from '../services/booking-cart';
import type { Beds24Service } from '../services/beds24';
import type { BookingConfig } from '../config/booking-config';

const WEBHOOK_SECRET = 'whsec_booking_webhook_test_secret';
const STRIPE_SECRET_KEY = 'sk_test_booking_webhook_secret';

const savedStripeSecret = process.env.STRIPE_SECRET_KEY;
const savedWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

before(() => {
  process.env.STRIPE_SECRET_KEY = STRIPE_SECRET_KEY;
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

after(() => {
  if (savedStripeSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = savedStripeSecret;
  if (savedWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = savedWebhookSecret;
});

type BookingRecord = {
  sessionRef: string;
  status: string;
  paymentStatus: string;
  errorMessage?: string;
  stripePaymentIntentId?: string | null;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  numInfants: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestLanguage: string;
  currency: string;
  legs: Array<{
    roomId: string;
    roomName: string;
    offerId: number;
    offerName: string;
    adults: number;
    children: number;
    infants: number;
    total: number;
    discount: number;
    deposit: number;
    balance: number;
    beds24BookingId: null;
  }>;
};

function makeRecord(): BookingRecord {
  return {
    sessionRef: 'booking-ref-sold-out',
    status: 'pending',
    paymentStatus: 'pending',
    checkInDate: '2026-10-10',
    checkOutDate: '2026-10-12',
    numAdults: 1,
    numChildren: 0,
    numInfants: 0,
    guestFirstName: 'Test',
    guestLastName: 'Guest',
    guestEmail: 'guest@example.test',
    guestLanguage: 'EN',
    currency: 'USD',
    legs: [{
      roomId: 'garden-cottage',
      roomName: 'Garden Cottage',
      offerId: 2,
      offerName: 'Flexible',
      adults: 1,
      children: 0,
      infants: 0,
      total: 100,
      discount: 0,
      deposit: 50,
      balance: 50,
      beds24BookingId: null,
    }],
  };
}

function makeDatabase(record: BookingRecord) {
  const claims: string[] = [];
  const updates: Array<Record<string, unknown>> = [];

  const db = {
    async getDirectBookingByRef(sessionRef: string) {
      return sessionRef === record.sessionRef ? record : undefined;
    },
    async getDirectBookingByStripeSession() {
      return undefined;
    },
    async claimDirectBookingForProcessing(sessionRef: string, paymentIntentId: string | null) {
      if (
        sessionRef !== record.sessionRef ||
        !['pending', 'failed', 'sold_out_refund_pending'].includes(record.status)
      ) {
        return false;
      }
      claims.push(paymentIntentId || '');
      record.status = 'processing';
      record.paymentStatus = 'paid';
      record.stripePaymentIntentId = paymentIntentId;
      return true;
    },
    async updateDirectBooking(_sessionRef: string, patch: Record<string, unknown>) {
      updates.push({ ...patch });
      Object.assign(record, patch);
      return record;
    },
  } as unknown as DatabaseService;

  return { db, claims, updates };
}

function makeSoldOutBeds24(): Beds24Service {
  return {
    getRooms: async () => {
      throw new BookingCartError('The selected room is no longer available.', 409, 'SOLD_OUT');
    },
  } as unknown as Beds24Service;
}

function makeSignedEvent() {
  const session = {
    id: 'cs_test_sold_out',
    object: 'checkout.session',
    metadata: { sessionRef: 'booking-ref-sold-out', type: 'lodge_deposit' },
    payment_intent: 'pi_test_sold_out',
  };
  const payload = JSON.stringify({
    id: 'evt_test_sold_out',
    object: 'event',
    api_version: '2025-01-27.acacia',
    created: 1_766_000_000,
    data: { object: session },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: 'checkout.session.completed',
  });
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as any,
  });
  return {
    payload,
    signature: stripe.webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    }),
  };
}

async function withWebhookServer(
  db: DatabaseService,
  refundPaymentIntent: (paymentIntentId: string, reason: 'requested_by_customer', cfg: BookingConfig) => Promise<void>,
  run: (signedEvent: ReturnType<typeof makeSignedEvent>, baseUrl: string) => Promise<void>,
) {
  const app = express();
  app.use(express.json({
    verify: (req: any, _res, buf) => { req.rawBody = buf; },
  }));
  app.use('/api/booking', createBookingRouter({
    db,
    requireAdminKey: (_req, _res, next) => next(),
    beds24: makeSoldOutBeds24(),
    refundPaymentIntent,
  }));

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');

  try {
    const signedEvent = makeSignedEvent();
    await run(signedEvent, `http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function postSignedWebhook(baseUrl: string, signedEvent: ReturnType<typeof makeSignedEvent>) {
  const response = await fetch(`${baseUrl}/api/booking/webhook`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': signedEvent.signature,
    },
    body: signedEvent.payload,
  });
  return {
    status: response.status,
    body: await response.json(),
  };
}

test('marks a paid sold-out booking refunded after Stripe refund succeeds', async () => {
  const record = makeRecord();
  const { db, claims, updates } = makeDatabase(record);
  const refunded: string[] = [];

  await withWebhookServer(
    db,
    async (paymentIntentId) => { refunded.push(paymentIntentId); },
    async (signedEvent, baseUrl) => {
      const result = await postSignedWebhook(baseUrl, signedEvent);
      assert.equal(result.status, 200);
      assert.deepEqual(result.body, { received: true });
    },
  );

  assert.deepEqual(refunded, ['pi_test_sold_out']);
  assert.deepEqual(claims, ['pi_test_sold_out']);
  assert.equal(record.status, 'sold_out_refunded');
  assert.equal(record.paymentStatus, 'refunded');
  assert.deepEqual(updates[updates.length - 1], {
    status: 'sold_out_refunded',
    paymentStatus: 'refunded',
    errorMessage: 'Room sold out before confirmation; deposit refunded.',
  });
});

test('keeps a failed sold-out refund pending and lets the signed retry recover it', async () => {
  const record = makeRecord();
  const { db, claims, updates } = makeDatabase(record);
  let shouldFail = true;
  const refundAttempts: string[] = [];

  await withWebhookServer(
    db,
    async (paymentIntentId) => {
      refundAttempts.push(paymentIntentId);
      if (shouldFail) throw new Error('Stripe refund unavailable');
    },
    async (signedEvent, baseUrl) => {
      const first = await postSignedWebhook(baseUrl, signedEvent);
      assert.equal(first.status, 500);
      assert.deepEqual(first.body, { error: 'Webhook processing failed' });
      assert.equal(record.status, 'sold_out_refund_pending');
      assert.equal(record.paymentStatus, 'refund_pending');
      assert.match(String(record.errorMessage), /auto-refund failed: Stripe refund unavailable/);
      assert.deepEqual(updates[updates.length - 1], {
        status: 'sold_out_refund_pending',
        paymentStatus: 'refund_pending',
        errorMessage: 'Room sold out; auto-refund failed: Stripe refund unavailable',
      });

      shouldFail = false;
      const retry = await postSignedWebhook(baseUrl, signedEvent);
      assert.equal(retry.status, 200);
      assert.deepEqual(retry.body, { received: true });
    },
  );

  assert.deepEqual(refundAttempts, ['pi_test_sold_out', 'pi_test_sold_out']);
  assert.deepEqual(claims, ['pi_test_sold_out', 'pi_test_sold_out']);
  assert.equal(record.status, 'sold_out_refunded');
  assert.equal(record.paymentStatus, 'refunded');
  assert.equal(updates.length, 2);
});