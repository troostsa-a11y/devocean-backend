import assert from 'node:assert/strict';
import test from 'node:test';
import { Beds24Service, Beds24Error } from './beds24';
import { parseCalendarEntry, calendarUnitsForStay } from './booking-calendar';
import { getBookingConfig } from '../config/booking-config';
import { BookingCartError, computeCartQuote, buildCartLinesFromPersistedLegs } from './booking-cart';

const cfg = { ...getBookingConfig(), beds24RefreshToken: undefined, beds24PropId: 'test', maxNights: 30 };
const stay = { checkIn: '2026-12-28', checkOut: '2026-12-31', adults: 2, children: 0, infants: 0 };
const line = { roomId: '620540', offerId: 2, qty: 1, adults: 2, children: 0, infants: 0 };

function dates(from: string, to: string) {
  const result: string[] = [];
  for (let d = new Date(`${from}T00:00:00Z`); d.toISOString().slice(0, 10) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function fixture(shape = 'range') {
  const state = {
    minStay: 1, maxStay: 28, overrides: {} as Record<string, Record<string, unknown>>,
    room: {} as Record<string, unknown>, incomplete: false, fail: false,
    bookingRules: {} as Record<string, unknown>,
  };
  const service = new Beds24Service(cfg);
  const requests: URL[] = [];
  // Mock only the HTTP boundary; use real parsing, eligibility, pricing and cart.
  (service as any).request = async (path: string) => {
    const url = new URL(path, 'https://beds24.test');
    requests.push(url);
    if (url.pathname === '/properties') {
      return { data: [{ currency: 'USD', bookingRules: state.bookingRules, rooms: [{
        id: 620540, name: 'Comfort Tent', qty: 3, maxPeople: 3,
        maxAdult: 2, maxChildren: 1, restrictionStrategy: 'stayThrough', ...state.room,
      }] }] };
    }
    assert.equal(url.pathname, '/inventory/rooms/calendar');
    for (const field of ['includeNumAvail', 'includeMinStay', 'includeMaxStay', 'includeOverride']) {
      assert.equal(url.searchParams.get(field), 'true');
    }
    if (state.fail) throw new Beds24Error('Temporary upstream failure', 502);
    const from = url.searchParams.get('startDate')!;
    const to = url.searchParams.get('endDate')!;
    let entries = dates(from, to).map(date => ({
      date, numAvail: 3, minStay: state.minStay, maxStay: state.maxStay,
      override: 'none', ...state.overrides[date],
    }));
    if (state.incomplete) entries = entries.slice(0, -1);
    const calendar = shape === 'object'
      ? Object.fromEntries(entries.map(({ date, ...e }) => [date, e]))
      : shape === 'day' ? entries
      : entries.map(({ date, ...e }) => ({ from: date, to: date, ...e }));
    return { data: [{ roomId: 620540, calendar }] };
  };
  return { service, state, requests };
}

for (const shape of ['range', 'day', 'object']) {
  test(`Christmas minimum blocks 3 nights in search and cart (${shape} calendar)`, async () => {
    const { service, state, requests } = fixture(shape);
    state.minStay = 7;
    const result = await service.getAvailability(stay);
    assert.equal(result.rooms[0].available, false);
    assert.deepEqual(result.rooms[0].offers, []);
    assert.equal(result.rooms[0].unitsAvailable, 0);
    assert.equal(requests[requests.length - 1]!.searchParams.get('endDate'), stay.checkOut);
    assert.deepEqual((await service.getRoomOffers({ ...stay, roomId: line.roomId }))!.offers, []);
    await assert.rejects(
      computeCartQuote(service, stay, [line], cfg),
      e => e instanceof BookingCartError && e.code === 'SOLD_OUT',
    );
  });
}

test('seven-night stay remains bookable with exactly the same local prices and deposits', async () => {
  const { service, state } = fixture();
  const sevenNights = { ...stay, checkOut: '2027-01-04' };
  const unrestricted = await service.getAvailability(sevenNights);
  const originalCart = await computeCartQuote(service, sevenNights, [line], cfg);
  state.minStay = 7;
  const restricted = await service.getAvailability(sevenNights);
  const restrictedCart = await computeCartQuote(service, sevenNights, [line], cfg);
  assert.equal(restricted.rooms[0].available, true);
  assert.ok(restricted.rooms[0].offers.some(o => o.offerId === 5));
  assert.deepEqual(restricted, unrestricted);
  assert.deepEqual(restrictedCart, originalCart);
});

test('calendar permission does not bypass existing weekly rate minimum', async () => {
  const { service } = fixture();
  const result = await service.getAvailability(stay);
  assert.ok(result.rooms[0].offers.some(o => o.offerId === 2));
  assert.ok(!result.rooms[0].offers.some(o => o.offerId === 5));
});

test('fresh final-confirmation quote rejects restriction introduced after checkout', async () => {
  const { service, state } = fixture();
  const paidQuote = await computeCartQuote(service, stay, [line], cfg);
  const persistedLines = buildCartLinesFromPersistedLegs(paidQuote.legs);
  state.minStay = 7;
  await assert.rejects(
    computeCartQuote(service, stay, persistedLines, cfg),
    e => e instanceof BookingCartError && e.code === 'SOLD_OUT',
  );
});

test('missing data and upstream errors remain retryable, not definitive sold-out refunds', async () => {
  const { service, state } = fixture();
  const paidQuote = await computeCartQuote(service, stay, [line], cfg);
  const persistedLines = buildCartLinesFromPersistedLegs(paidQuote.legs);
  state.incomplete = true;
  await assert.rejects(service.getAvailability(stay), e => e instanceof Beds24Error);
  await assert.rejects(computeCartQuote(service, stay, persistedLines, cfg), e => e instanceof Beds24Error);
  state.incomplete = false;
  state.fail = true;
  await assert.rejects(computeCartQuote(service, stay, persistedLines, cfg), e => e instanceof Beds24Error);
});

test('room restriction strategy selects first-night versus stay-through limits', async () => {
  for (const strategy of ['firstNight', 'stayThrough']) {
    const { service, state } = fixture();
    state.room.restrictionStrategy = strategy;
    state.overrides['2026-12-29'] = { minStay: 7 };
    assert.equal((await service.getAvailability(stay)).rooms[0].available, strategy === 'firstNight');
  }
});

test('room minimum and maximum remain binding even if calendar values are looser', async () => {
  for (const limit of [{ minStay: 7 }, { maxStay: 2 }]) {
    const { service, state } = fixture();
    Object.assign(state.room, limit);
    assert.equal((await service.getAvailability(stay)).rooms[0].available, false);
  }
});

for (const [date, override, allowed] of [
  ['2026-12-28', 'noCheckIn', false],
  ['2026-12-29', 'noCheckIn', true],
  ['2026-12-31', 'noCheckIn', true],
  ['2026-12-28', 'noCheckOut', true],
  ['2026-12-29', 'noCheckOut', true],
  ['2026-12-31', 'noCheckOut', false],
  ['2026-12-28', 'noCheckInOrCheckOut', false],
  ['2026-12-29', 'noCheckInOrCheckOut', true],
  ['2026-12-31', 'noCheckInOrCheckOut', false],
  ['2026-12-29', 'blackout', false],
  ['2026-12-31', 'blackout', true],
  ['2026-12-29', 'exception', true],
] as const) {
  test(`${override} on ${date}: ${allowed ? 'allows' : 'blocks'} stay`, async () => {
    const { service, state } = fixture();
    state.overrides[date] = { override };
    assert.equal((await service.getAvailability(stay)).rooms[0].available, allowed);
    const offers = await service.getPricedOffersByRoom(stay);
    assert.equal(offers[line.roomId].length > 0, allowed);
  });
}

test('checkout-day stock and stay limits do not consume or price an extra night', async () => {
  const { service, state } = fixture();
  const original = await service.getAvailability(stay);
  state.overrides[stay.checkOut] = { numAvail: 0, minStay: 10, maxStay: 1, closed: true };
  assert.deepEqual(await service.getAvailability(stay), original);
});

test('exception override respects an exceptional-period blackout rule', async () => {
  const { service, state } = fixture();
  state.bookingRules.bookingExceptionalType = 'blackoutPeriod';
  state.overrides['2026-12-29'] = { override: 'exception' };
  assert.equal((await service.getAvailability(stay)).rooms[0].available, false);
  assert.deepEqual((await service.getPricedOffersByRoom(stay))[line.roomId], []);
});

test('maximum stay uses the configured restriction strategy too', async () => {
  for (const strategy of ['firstNight', 'stayThrough']) {
    const { service, state } = fixture();
    state.room.restrictionStrategy = strategy;
    state.overrides['2026-12-29'] = { maxStay: 2 };
    assert.equal((await service.getAvailability(stay)).rooms[0].available, strategy === 'firstNight');
  }
});

test('actual nearest-date search skips Dec 27–30 and preserves closest-first/tie behaviour', async () => {
  const { service, state, requests } = fixture();
  for (const d of dates('2026-12-27', '2026-12-31')) {
    state.overrides[d] = { minStay: 7 };
  }
  const nearest = await service.findNearestAvailable({
    roomId: line.roomId, fromDate: stay.checkIn, nights: 3, adults: 2, children: 0,
  });
  assert.deepEqual(nearest, { found: true, checkIn: '2026-12-24', checkOut: '2026-12-27' });
  assert.equal(requests.filter(r => r.pathname === '/inventory/rooms/calendar').length, 1);
  if (!nearest.found) assert.fail('Expected an eligible alternative');
  assert.equal((await service.getAvailability({ ...stay, ...nearest })).rooms[0].available, true);
});

test('nearest-date search returns no result when every window violates minimum or maximum stay', async () => {
  for (const limits of [{ minStay: 7 }, { maxStay: 2 }]) {
    const { service, state } = fixture();
    Object.assign(state, limits);
    assert.deepEqual(await service.findNearestAvailable({
      roomId: line.roomId, fromDate: stay.checkIn, nights: 3, adults: 2, children: 0,
    }), { found: false });
  }
});

test('nearest-date search cannot offer a stay longer than the local rate plans allow', async () => {
  const { service, state } = fixture();
  state.maxStay = 365;
  assert.deepEqual(await service.findNearestAvailable({
    roomId: line.roomId, fromDate: stay.checkIn, nights: 29, adults: 2, children: 0,
  }), { found: false });
});

test('nearest-date search applies checkout and arrival overrides on both sides', async () => {
  const { service, state } = fixture();
  state.overrides['2026-12-30'] = { override: 'noCheckOut' }; // blocks Dec 27–30
  state.overrides['2026-12-29'] = { override: 'noCheckIn' }; // blocks Dec 29–Jan 1
  const nearest = await service.findNearestAvailable({
    roomId: line.roomId, fromDate: stay.checkIn, nights: 3, adults: 2, children: 0,
  });
  assert.deepEqual(nearest, { found: true, checkIn: '2026-12-26', checkOut: '2026-12-29' });
});

test('nearest-date search honours room strategy for interior-night limits', async () => {
  for (const strategy of ['firstNight', 'stayThrough']) {
    const { service, state } = fixture();
    state.room.restrictionStrategy = strategy;
    state.overrides['2026-12-28'] = { minStay: 7 };
    const nearest = await service.findNearestAvailable({
      roomId: line.roomId, fromDate: stay.checkIn, nights: 3, adults: 2, children: 0,
    });
    assert.deepEqual(nearest, strategy === 'firstNight'
      ? { found: true, checkIn: '2026-12-27', checkOut: '2026-12-30' }
      : { found: true, checkIn: '2026-12-29', checkOut: '2027-01-01' });
  }
});

test('nearest-date search propagates incomplete calendar errors instead of offering dates', async () => {
  const { service } = fixture();
  const request = (service as any).request;
  (service as any).request = async (path: string) => {
    const result = await request(path);
    if (path.startsWith('/inventory/')) {
      result.data[0].calendar = result.data[0].calendar.filter((e: any) => e.from !== '2026-12-30');
    }
    return result;
  };
  await assert.rejects(service.findNearestAvailable({
    roomId: line.roomId, fromDate: stay.checkIn, nights: 3, adults: 2, children: 0,
  }), e => e instanceof Beds24Error);
});

test('nearest-date search requires sufficient units for the entire party, including infants', async () => {
  const { service, state } = fixture();
  for (const d of dates('2026-12-07', '2027-03-25')) state.overrides[d] = { numAvail: 1 };
  assert.deepEqual(await service.findNearestAvailable({
    roomId: line.roomId, fromDate: stay.checkIn, nights: 3, adults: 2, children: 0, infants: 2,
  }), { found: false });
});

test('maximum stay, sold-out dates and legacy closed dates block all offers', async () => {
  for (const entry of [{ maxStay: 2 }, { numAvail: 0 }, { numAvail: -1 }, { closed: true }]) {
    const { service, state } = fixture();
    state.overrides['2026-12-29'] = entry;
    assert.equal((await service.getAvailability(stay)).rooms[0].available, false);
  }
});

test('malformed restrictions fail explicitly instead of opening inventory', async () => {
  for (const entry of [{ minStay: 'bad' }, { maxStay: -1 }, { override: 'unknown' }, { numAvail: 'bad' }]) {
    const { service, state } = fixture();
    state.overrides['2026-12-29'] = entry;
    await assert.rejects(service.getAvailability(stay), e => e instanceof Beds24Error);
  }
});

test('null stay limits are unset; a complete calendar without counts keeps conservative one unit', () => {
  const entry = parseCalendarEntry({ minStay: null, maxStay: null, override: null });
  const calendar = new Map(dates(stay.checkIn, stay.checkOut).map(d => [d, entry]));
  assert.equal(calendarUnitsForStay(calendar, dates(stay.checkIn, '2026-12-30'), stay.checkOut, {}), 1);
});

test('inclusive multi-day ranges are expanded with their restrictions', async () => {
  const { service } = fixture();
  const request = (service as any).request;
  (service as any).request = async (path: string) => path.startsWith('/inventory/')
    ? { data: [{ roomId: 620540, calendar: [
      { from: '2026-12-28', to: '2026-12-31', numAvail: 3, minStay: 7, maxStay: 28, override: 'none' },
    ] }] }
    : request(path);
  assert.equal((await service.getAvailability(stay)).rooms[0].available, false);
});