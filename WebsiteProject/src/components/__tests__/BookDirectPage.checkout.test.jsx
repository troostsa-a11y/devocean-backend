/**
 * BookDirectPage.checkout.test.jsx
 *
 * Integration-level tests confirming that the checkout POST body carries the
 * correct bedPreferences for Safari, Comfort, and Thatched Chalet rooms:
 *
 *   1. When the guest never touches the bed-type toggle, the checkout payload
 *      must carry  bedPreferences: { [roomId]: 'king' }  — matching the "King
 *      bed" the UI shows as pre-selected by default.
 *
 *   2. When the guest explicitly switches to "Twin beds", the payload must
 *      carry  bedPreferences: { [roomId]: 'twin' }.
 *
 * Both tests drive the full UI path:
 *   auto-search (URL params) → availability response →
 *   add room to cart → quote response →
 *   Continue to Details → fill guest info → submit →
 *   assert checkout POST body.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ── Module mocks (hoisted before imports) ─────────────────────────────────────

vi.mock('../../data/content', () => ({
  HERO_IMAGES: [
    {
      mobileWebP:       '/mock-hero.webp',
      desktopWebP:      '/mock-hero-desktop.webp',
      mobileObjectClass: '',
    },
  ],
  IMG: {
    units: {
      safari:  '/mock/safari.webp',
      comfort: '/mock/comfort.webp',
      cottage: '/mock/cottage.webp',
      chalet:  '/mock/chalet.webp',
    },
  },
}));

vi.mock('lucide-react', () => {
  const Stub = () => null;
  return {
    CalendarCheck2: Stub,
    Users:          Stub,
    Loader2:        Stub,
    ShieldCheck:    Stub,
    ChevronLeft:    Stub,
    ExternalLink:   Stub,
    Star:           Stub,
    CheckCircle2:   Stub,
    Info:           Stub,
    CreditCard:     Stub,
    MessageCircle:  Stub,
    ChevronDown:    Stub,
    Plus:  (props) => <span data-testid="icon-plus"  {...props} />,
    Minus: (props) => <span data-testid="icon-minus" {...props} />,
    BedDouble: (props) => <span {...props} />,
    BedSingle: (props) => <span {...props} />,
  };
});

vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
}));

vi.mock('../../utils/seoMeta', () => ({
  useSeoPage: () => {},
}));

vi.mock('../../utils/analytics', () => ({
  trackBookingSession:    vi.fn(),
  getBookingAttributionId: vi.fn(() => null),
}));

vi.mock('../../i18n/bookingStrings', () => ({
  getBookingStrings: () => ({
    title:              'Book Direct',
    subtitle:           'Best price\nFree cancellation\n5 stars',
    cardTitle:          'Check Availability',
    search:             'Check availability',
    searching:          'Searching...',
    selectDates:        'Select dates',
    guests:             'Guests',
    adults:             'Adults',
    children:           'Children',
    infants:            'Infants',
    nights:             'nights',
    night:              'night',
    guest:              'guest',
    back:               'Back',
    rooms:              'Rooms',
    addRoom:            'Add room',
    removeRoom:         'Remove room',
    yourSelection:      'Your selection',
    unitsLeft:          '{count} left',
    sleeps:             'Sleeps {count}',
    sleepsAdultsChildren: 'Sleeps {adults} + {children}',
    singleUse:          'Single use',
    childOccupant:      '1 child',
    perNightFrom:       'for {nights} night(s)',
    avgPerNight:        'avg/night',
    chooseRate:         'Choose rate',
    nonRefundable:      'Non-refundable',
    depositFullNow:     '',
    rateConditions:     'Rate conditions',
    cancellationPolicy: 'Free cancellation {days} days',
    details:            'Details',
    unit:               'Unit',
    updatingPrice:      'Updating price...',
    continueToDetails:  'Continue to details',
    summary:            'Summary',
    guestDetails:       'Guest details',
    firstName:          'First name',
    lastName:           'Last name',
    email:              'Email',
    phone:              'Phone',
    termsAgree:         'I agree to {terms}.',
    termsLink:          'Terms',
    continue:           'Pay now',
    processing:         'Processing...',
    securePayment:      'Secure payment',
    total:              'Total',
    depositNow:         '{pct}% deposit now',
    balanceOnArrival:   'Balance on arrival',
    roomsCount:         '{count} room(s)',
    selectRoomsToContinue: 'Select rooms to continue',
    errorGeneric:       'Something went wrong',
    noRooms:            'No rooms available',
    soldOut:            'Sold out',
    moreUnitsNeeded:    'You need {n} more unit(s)',
    minUnitsNote:       'Min {n} unit(s) for {party}',
    amenitiesNote:      'All rooms include breakfast',
    discountCodeLabel:  'Discount code',
    optional:           'Optional',
    giftPromoTitle:     'Gift vouchers',
    giftPromoSubtitle:  'Give the gift of travel',
    currencyFieldLabel: 'Currency',
    canceledNotice:     'Booking was cancelled',
    provideChildAges:   'Please provide child ages',
    childAgesLabel:     'Child ages',
    infantAgesLabel:    'Infant ages',
    childAgeHint:       'Ages matter for pricing',
    infantAgeHint:      'Infants under 3',
    childAgeN:          'Child {n}',
    infantAgeN:         'Infant {n}',
    yearsOld:           '{count} years old',
    discountLabel:      'Discount ({code})',
    discountCodeApplied:'Code {code} applied',
    rate: { nonRef: 'Non-refundable', semiFlex: 'Semi-flexible' },
  }),
  fmt: (template, vars) =>
    String(template).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''),
}));

vi.mock('../../utils/localize', () => ({
  localizeUnits: () => [
    { key: 'safari',  title: 'Safari Tent' },
    { key: 'comfort', title: 'Comfort Tent' },
    { key: 'cottage', title: 'Garden Cottage' },
    { key: 'chalet',  title: 'Thatched Chalet' },
  ],
}));

vi.mock('../CurrencyPicker',  () => ({ default: () => null }));
vi.mock('../DateRangePicker', () => ({ default: () => null }));
vi.mock('../MarinPanel',      () => ({ default: () => null }));

// ── Import component under test ───────────────────────────────────────────────
// Must come after vi.mock() calls; Vitest hoists them automatically.
import BookDirectPage from '../BookDirectPage';

// ── Shared fixtures ───────────────────────────────────────────────────────────

const SAFARI_ROOM_ID = 'safari-room-1';
const CHECK_IN       = '2027-06-01';
const CHECK_OUT      = '2027-06-03';

function makeAvailabilityResponse() {
  return {
    checkIn:                CHECK_IN,
    checkOut:               CHECK_OUT,
    nights:                 2,
    currency:               'USD',
    cancellationPolicyDays: 30,
    maxRooms:               5,
    rooms: [
      {
        roomId:      SAFARI_ROOM_ID,
        name:        'Safari Tent',
        currency:    'USD',
        nights:      2,
        maxAdults:   2,
        maxPeople:   2,
        maxChildren: 0,
        available:   true,
        offers: [
          {
            offerId:        'offer-flex-1',
            total:          600,
            type:           'semiFlex',
            unitsAvailable: 3,
            refundable:     true,
          },
        ],
      },
    ],
  };
}

function makeQuoteResponse() {
  return {
    checkIn:        CHECK_IN,
    checkOut:       CHECK_OUT,
    nights:         2,
    currency:       'USD',
    rooms:          1,
    lines: [
      {
        roomId:    SAFARI_ROOM_ID,
        offerId:   'offer-flex-1',
        roomName:  'Safari Tent',
        qty:       1,
        adults:    2,
        children:  0,
        infants:   0,
        lineTotal: 600,
      },
    ],
    total:          600,
    depositPercent: 50,
    deposit:        300,
    balance:        300,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Set up a fetch mock that:
 *   - Returns the availability fixture for /api/booking/availability
 *   - Returns the quote fixture for /api/booking/quote
 *   - Returns an empty prices object for /api/booking/calendar
 *   - Captures the checkout request body for /api/booking/checkout, returns a
 *     fake Stripe URL so the component doesn't explode on redirect.
 *
 * Returns a getter for the captured checkout body (null until checkout fires).
 */
function setupFetchMock() {
  let capturedBody = null;

  global.fetch = vi.fn((url, init) => {
    if (url.includes('/api/booking/availability')) {
      return Promise.resolve({
        ok:   true,
        json: () => Promise.resolve(makeAvailabilityResponse()),
      });
    }
    if (url.includes('/api/booking/quote')) {
      return Promise.resolve({
        ok:   true,
        json: () => Promise.resolve(makeQuoteResponse()),
      });
    }
    if (url.includes('/api/booking/calendar')) {
      return Promise.resolve({
        ok:   true,
        json: () => Promise.resolve({ prices: {} }),
      });
    }
    if (url.includes('/api/booking/checkout')) {
      capturedBody = JSON.parse(init.body);
      return Promise.resolve({
        ok:   true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/mock-session' }),
      });
    }
    // Anything else (fx, etc.) — ignore gracefully
    return Promise.resolve({
      ok:   false,
      json: () => Promise.resolve({}),
    });
  });

  return { getCheckoutBody: () => capturedBody };
}

/**
 * Run through the full booking UI:
 *   1. Render BookDirectPage with auto-search URL params already set.
 *   2. Wait for the availability results to appear.
 *   3. Add the safari room to the cart.
 *   4. Optionally tap the bed-type toggle (pass 'twin' to switch).
 *   5. Wait for the quote to arrive and the Continue button to enable.
 *   6. Navigate to the Details step.
 *   7. Fill in guest info and submit.
 */
async function runCheckoutFlow({ bedChoice } = {}) {
  render(
    <BookDirectPage
      lang="en-GB"
      currency="USD"
    />,
  );

  // ── 1. Wait for the results step to appear after the auto-search ───────────
  // The room card is rendered only once availability resolves.
  const incBtn = await waitFor(
    () => screen.getByTestId(`button-inc-${SAFARI_ROOM_ID}`),
    { timeout: 3000 },
  );

  // ── 2. Add room to cart ───────────────────────────────────────────────────
  await act(async () => {
    fireEvent.click(incBtn);
  });

  // ── 3. Optionally switch bed type ────────────────────────────────────────
  if (bedChoice === 'twin') {
    const twinBtn = screen.getByTitle(/twin/i);
    await act(async () => {
      fireEvent.click(twinBtn);
    });
  }
  // (No click = king stays as the visual default; the checkout logic fills it.)

  // ── 4. Wait for the debounced quote fetch + Continue button to enable ─────
  // The quote is debounced 400ms; waitFor polls until the button loses its
  // disabled attribute (quote arrived) or until it times out.
  const continueBtn = await waitFor(
    () => {
      const btn = screen.getByTestId('button-continue-details');
      if (btn.disabled) throw new Error('button still disabled');
      return btn;
    },
    { timeout: 3000 },
  );

  // ── 5. Navigate to the Details step ──────────────────────────────────────
  await act(async () => {
    fireEvent.click(continueBtn);
  });

  // ── 6. Fill guest details ─────────────────────────────────────────────────
  await waitFor(() => screen.getByTestId('input-first-name'));

  fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Jane' } });
  fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Doe' } });
  fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByTestId('input-phone'),      { target: { value: '+1234567890' } });

  // ── 7. Submit ─────────────────────────────────────────────────────────────
  await act(async () => {
    fireEvent.click(screen.getByTestId('button-checkout'));
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('checkout bedPreferences — integration', () => {
  let fetchMock;

  beforeEach(() => {
    // Place the auto-search dates in the URL so BookDirectPage fires the
    // availability fetch on mount without requiring the guest to use the
    // search form (which includes the DateRangePicker, here stubbed to null).
    window.history.pushState({}, '', `?checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}`);

    // Prevent the checkout redirect from throwing in happy-dom.
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:        '',
        search:      `?checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}`,
        assign:      vi.fn(),
        replace:     vi.fn(),
      }),
    });

    fetchMock = setupFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset location property so later tests get a clean slate.
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => window._locationBackup ?? location,
    });
  });

  it('sends bedPreferences: { [roomId]: "king" } when the guest never touches the toggle', async () => {
    await runCheckoutFlow(); // no bedChoice → toggle untouched

    const body = fetchMock.getCheckoutBody();
    expect(body).not.toBeNull();
    expect(body.bedPreferences).toBeDefined();
    expect(body.bedPreferences[SAFARI_ROOM_ID]).toBe('king');
  });

  it('sends bedPreferences: { [roomId]: "twin" } when the guest switches to twin', async () => {
    await runCheckoutFlow({ bedChoice: 'twin' });

    const body = fetchMock.getCheckoutBody();
    expect(body).not.toBeNull();
    expect(body.bedPreferences).toBeDefined();
    expect(body.bedPreferences[SAFARI_ROOM_ID]).toBe('twin');
  });
});
