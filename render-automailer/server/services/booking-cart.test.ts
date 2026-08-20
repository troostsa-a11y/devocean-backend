import assert from 'node:assert/strict';
import test from 'node:test';
import type { Beds24Room, Beds24Service, RoomOffer } from './beds24';
import {
  BookingCartError,
  buildCartLinesFromPersistedLegs,
  computeCartQuote,
  getPersistedInfantCount,
} from './booking-cart';
import type { DirectBookingLeg } from '../../shared/schema';
import type { BookingConfig } from '../config/booking-config';

const cfg: BookingConfig = {
  beds24RefreshToken: undefined,
  beds24PropId: 'test-property',
  beds24ApiBase: 'https://beds24.test',
  stripeSecretKey: undefined,
  stripeWebhookSecret: undefined,
  depositPercent: 50,
  cancellationPolicyDays: 30,
  currency: 'USD',
  publicSiteUrl: 'https://example.test',
  maxNights: 30,
  maxGuests: 12,
  maxRooms: 8,
};

const rooms: Beds24Room[] = [
  {
    roomId: 'garden-cottage',
    name: 'Garden Cottage',
    qty: 5,
    maxPeople: 2,
    maxAdults: 2,
    maxChildren: 0,
  },
  {
    roomId: 'garden-suite',
    name: 'Garden Suite',
    qty: 5,
    maxPeople: 3,
    maxAdults: 2,
    maxChildren: 0,
  },
];

function makeOffer(roomId: string, adults: number, children: number): RoomOffer {
  return {
    offerId: 2,
    offerName: `Test rate ${roomId} ${adults}A${children}C`,
    type: 'standard',
    refundable: true,
    total: 100 + adults * 10 + children * 5,
    unitsAvailable: 5,
  };
}

function makeBeds24(): Beds24Service {
  return {
    getRooms: async () => rooms,
    getPricedOffersByRoom: async ({ adults, children }) =>
      Object.fromEntries(rooms.map((room) => [
        room.roomId,
        [makeOffer(room.roomId, adults, children)],
      ])),
    getCurrency: () => 'USD',
    getCancellationDays: () => 30,
    getDepositPercentForOffer: () => 50,
    getDepositPercentForArrival: () => 50,
  } as unknown as Beds24Service;
}

function leg(
  roomId: string,
  adults: number,
  infants: number,
): DirectBookingLeg {
  return {
    roomId,
    roomName: rooms.find((room) => room.roomId === roomId)!.name,
    offerId: 2,
    offerName: 'Test rate',
    adults,
    children: 0,
    infants,
    total: 100,
    discount: 0,
    deposit: 50,
    balance: 50,
    beds24BookingId: null,
  };
}

const stay = {
  checkIn: '2026-10-10',
  checkOut: '2026-10-12',
  adults: 2,
  children: 0,
  infants: 1,
};

test('rejects a persisted 2-adult + infant party in a strict two-person Garden Cottage', async () => {
  const persistedLegs = [leg('garden-cottage', 2, 1)];
  const cartLines = buildCartLinesFromPersistedLegs(persistedLegs);

  await assert.rejects(
    computeCartQuote(makeBeds24(), stay, cartLines, cfg),
    (error: unknown) =>
      error instanceof BookingCartError &&
      error.code === 'PARTY_TOO_LARGE' &&
      error.status === 409,
  );
});

test('rechecks persisted infant occupancy for a larger room and a multi-unit cart', async () => {
  const largerRoomLegs = [leg('garden-suite', 2, 1)];
  assert.equal(getPersistedInfantCount({}, largerRoomLegs), 1);
  const largerRoomQuote = await computeCartQuote(
    makeBeds24(),
    stay,
    buildCartLinesFromPersistedLegs(largerRoomLegs),
    cfg,
  );
  assert.equal(largerRoomQuote.rooms, 1);
  assert.deepEqual(largerRoomQuote.legs.map((item) => ({
    adults: item.adults,
    infants: item.infants,
  })), [{ adults: 2, infants: 1 }]);
  assert.equal(largerRoomQuote.infants, 1);

  const multiUnitLegs = [
    leg('garden-cottage', 1, 1),
    leg('garden-cottage', 1, 0),
  ];
  const multiUnitQuote = await computeCartQuote(
    makeBeds24(),
    stay,
    buildCartLinesFromPersistedLegs(multiUnitLegs),
    cfg,
  );
  assert.equal(multiUnitQuote.rooms, 2);
  assert.deepEqual(multiUnitQuote.legs.map((item) => ({
    adults: item.adults,
    infants: item.infants,
  })), [
    { adults: 1, infants: 1 },
    { adults: 1, infants: 0 },
  ]);
  assert.equal(multiUnitQuote.infants, 1);
});