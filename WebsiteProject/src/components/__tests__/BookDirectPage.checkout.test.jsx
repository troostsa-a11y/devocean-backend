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
    unitsLeft:          '{count} units left',
    sleeps:             'Sleeps {count}',
    sleepsAdultsChildren: 'Sleeps {adults} + {children}',
    sleepsAdultsChildrenCompact: 'Sleeps {adults}+{children}',
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
    minUnitsSingle:     'Book one unit for single use',
    minUnitsSingleWithChildren: 'Book one unit for single use and maximum of 2 children',
    minUnitsAdults:     'Book one unit for a maximum of 2 adults',
    minUnitsAdultsWithChild: 'Book one unit for a maximum of 2 adults + 1 infant/child',
    partyTooLargeForRate: 'Some guests cannot be accommodated in fewer units.',
    amenitiesNote:      'All rooms include breakfast',
    amenitiesAllRatesInclude: 'All rates include',
    amenitiesBreakfast: 'Excellent Breakfast',
    amenitiesInternet: 'Highspeed Internet',
    amenitiesParking: 'Secure Parking Spot',
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
  perNightFromTemplate: (t, n) => (n === 1 && t.perNightFromOne) || t.perNightFrom,
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
vi.mock('../DateRangePicker', () => ({
  default: ({ onChange }) => (
    <button
      type="button"
      data-testid="mock-date-range"
      onClick={() => onChange('2027-06-01', '2027-06-03')}
    >
      Set dates
    </button>
  ),
}));
// Capture the props MarinPanel receives so tests can assert on the page
// context Marin reads (dates, room prices, totals). Rendered as null so it
// stays invisible to the DOM assertions.
const marinPanelProps = vi.hoisted(() => []);
vi.mock('../MarinPanel',      () => ({
  default: (props) => { marinPanelProps.push(props); return null; },
}));

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

function setBookingQuery({ adults, children = 0, infants = 0 }) {
  const params = new URLSearchParams({
    checkIn: CHECK_IN,
    checkOut: CHECK_OUT,
    adults: String(adults),
  });
  if (children > 0) params.set('children', String(children));
  if (infants > 0) params.set('infants', String(infants));
  const search = `?${params.toString()}`;
  Object.defineProperty(window, 'location', {
    configurable: true,
    get: () => ({
      href: '',
      search,
      assign: vi.fn(),
      replace: vi.fn(),
    }),
  });
  window.history.pushState({}, '', `/book-direct${search}`);
}

async function renderMinimumUnitsNotice({ adults, children = 0, infants = 0 }) {
  setBookingQuery({ adults, children, infants });
  const view = render(
    <BookDirectPage
      lang="en-GB"
      currency="USD"
    />,
  );

  if (children > 0) {
    fireEvent.click(screen.getByTestId('mock-date-range'));
    fireEvent.change(screen.getByTestId('select-child-age-0'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('button-search'));
  }

  const notice = await screen.findByTestId('notice-min-units');
  return { notice, unmount: view.unmount };
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

  it('renders the four amenities badges in two rows before the left-aligned minimum-units notice', async () => {
    render(
      <BookDirectPage
        lang="en-GB"
        currency="USD"
      />,
    );

    const amenities = await screen.findByTestId('text-amenities-note');
    const topRow = screen.getByTestId('amenities-badges-top-row');
    const benefitsRow = screen.getByTestId('amenities-badges-benefits-row');
    const notice = await screen.findByTestId('notice-min-units');
    const resultsRoomArea = screen.getByTestId('booking-results-room-area');
    const roomGrid = screen.getByTestId('booking-room-grid');

    expect(topRow.children).toHaveLength(1);
    expect(benefitsRow.children).toHaveLength(3);
    expect(screen.getByTestId('amenities-badge-all-rates').textContent).toBe('All rates include');
    expect(screen.getByTestId('amenities-badge-breakfast').textContent).toBe('Excellent Breakfast');
    expect(screen.getByTestId('amenities-badge-internet').textContent).toBe('Highspeed Internet');
    expect(screen.getByTestId('amenities-badge-parking').textContent).toBe('Secure Parking Spot');
    for (const badgeId of ['amenities-badge-breakfast', 'amenities-badge-internet', 'amenities-badge-parking']) {
      const className = screen.getByTestId(badgeId).className;
      expect(className).toContain('bg-[#9e4b13]');
      expect(className).toContain('text-white');
    }
    expect(screen.getByTestId('amenities-badge-all-rates').className).not.toContain('bg-[#9e4b13]');
    expect(notice.className).toContain('px-3 py-1');
    expect(notice.className).toContain('text-xs');
    expect(notice.className).toContain('items-center');
    expect(resultsRoomArea.className).toContain('space-y-1');
    expect(amenities.compareDocumentPosition(notice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(notice.compareDocumentPosition(roomGrid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(notice.parentElement.className).toContain('justify-start');
  });

  it('keeps the selection summary details inline with wrapping segments', async () => {
    render(
      <BookDirectPage
        lang="en-GB"
        currency="USD"
      />,
    );

    const summary = await screen.findByTestId('badge-selection-summary');
    const details = summary.querySelector('.min-w-0');
    const detailSegments = details.querySelectorAll('.whitespace-nowrap');

    expect(summary.textContent).toContain('1 Jun 2027 → 3 Jun 2027');
    expect(summary.textContent).toContain('· 2 nights');
    expect(summary.textContent).toContain('· 2 Guests');
    expect(details.className).toContain('flex-wrap');
    expect(details.className).toContain('min-w-0');
    expect(detailSegments).toHaveLength(3);
  });

  it.each([
    [{ adults: 1 }, 'Book one unit for single use'],
    [{ adults: 1, infants: 1 }, 'Book one unit for single use and maximum of 2 children'],
    [{ adults: 2 }, 'Book one unit for a maximum of 2 adults'],
    [{ adults: 3 }, 'Book one unit for a maximum of 2 adults'],
    [{ adults: 2, infants: 1 }, 'Book one unit for a maximum of 2 adults + 1 infant/child'],
  ])('shows the correct minimum-units message for %o', async (guestCounts, expected) => {
    const { notice, unmount } = await renderMinimumUnitsNotice(guestCounts);

    expect(notice.textContent).toContain(expected);
    unmount();
  });

  it('uses the child branch for one adult with a child', async () => {
    const { notice, unmount } = await renderMinimumUnitsNotice({ adults: 1, children: 1 });

    expect(notice.textContent).toContain('Book one unit for single use and maximum of 2 children');
    unmount();
  });
});

// ── occupancy + rate-switch integration test ──────────────────────────────────

/**
 * Regression: when a guest books 2 units with per-unit occupancy (children in
 * the party) and then switches to a rate plan whose unitsAvailable=1,
 * BookDirectPage's setRoomRate clamps cart qty 2→1 but does NOT trim
 * roomOccupancy (it still holds 2 entries).  The cartLines memo must use
 * .slice(0, qty) so only unit 0's occupancy reaches /checkout — never the
 * stale unit 1 entry.
 *
 * This is a full component-level integration test: it renders BookDirectPage,
 * drives the real setRoomRate / cartLines / checkout path through the UI,
 * and asserts the actual /api/booking/checkout POST body.
 */
describe('checkout occupancy: multi-unit rate-switch with children', () => {
  // Separate room/date constants so this suite is fully independent of the
  // bedPreferences suite above — no shared state risk.
  const ROOM_ID     = 'safari-room-rate-switch';
  const CHECK_IN_RS  = '2027-10-01';
  const CHECK_OUT_RS = '2027-10-03';

  /**
   * Room with two offers:
   *   offer-nonref-rs  cheapest (nonRef)  → 2 units available (default active)
   *   offer-flex-rs    semiFlex           → only 1 unit available
   *
   * Because the cheapest offer is nonRef, the availableRooms memo surfaces both
   * offers in the RoomCard.  Switching to offer-flex-rs clamps qty 2 → 1.
   */
  function makeAvailabilityRS() {
    return {
      checkIn:                CHECK_IN_RS,
      checkOut:               CHECK_OUT_RS,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      ROOM_ID,
          name:        'Safari Tent',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            { offerId: 'offer-nonref-rs', total: 500, type: 'nonRef',   unitsAvailable: 2, refundable: false },
            { offerId: 'offer-flex-rs',   total: 600, type: 'semiFlex', unitsAvailable: 1, refundable: true  },
          ],
        },
      ],
    };
  }

  function makeQuoteRS() {
    return {
      checkIn: CHECK_IN_RS, checkOut: CHECK_OUT_RS, nights: 2, currency: 'USD', rooms: 1,
      lines: [{ roomId: ROOM_ID, offerId: 'offer-nonref-rs', roomName: 'Safari Tent', qty: 1, adults: 2, children: 1, infants: 0, lineTotal: 500 }],
      total: 500, depositPercent: 50, deposit: 250, balance: 250,
    };
  }

  let capturedCheckoutBody;

  beforeEach(() => {
    capturedCheckoutBody = null;

    // infants=1 in URL: auto-search still fires (pChildren=0 so !pChildren=true),
    // but setInfants(1) runs in useEffect → effInfants=1 → per-unit occ steppers
    // appear without requiring child-age inputs.
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:    '',
        search:  `?checkIn=${CHECK_IN_RS}&checkOut=${CHECK_OUT_RS}&infants=1`,
        assign:  vi.fn(),
        replace: vi.fn(),
      }),
    });

    global.fetch = vi.fn((url, init) => {
      if (url.includes('/api/booking/availability')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeAvailabilityRS()) });
      }
      if (url.includes('/api/booking/quote')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeQuoteRS()) });
      }
      if (url.includes('/api/booking/calendar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ prices: {} }) });
      }
      if (url.includes('/api/booking/checkout')) {
        capturedCheckoutBody = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ url: 'https://checkout.stripe.com/mock' }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => window._locationBackup ?? location,
    });
  });

  /**
   * Shared setup: render the component, wait for auto-search to resolve to
   * the results step, add 2 units, then wait for the per-unit occupancy steppers
   * to appear.  Returns the + button so callers can reuse it if needed.
   */
  async function setupTwoUnits() {
    render(<BookDirectPage lang="en-GB" currency="USD" />);

    // Auto-search fires on mount: infants in URL don't block !pChildren check.
    const incBtn = await waitFor(
      () => screen.getByTestId(`button-inc-${ROOM_ID}`),
      { timeout: 3000 },
    );

    // The refundable (semi-flexible) plan is the default now, but this suite
    // tests the nonRef→flex rate-switch clamp, so explicitly select the
    // non-refundable plan first (it has 2 units available).
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-rate-${ROOM_ID}-offer-nonref-rs`));
    });

    await act(async () => { fireEvent.click(incBtn); });
    await act(async () => { fireEvent.click(incBtn); });

    // Both per-unit infants rows must be visible (effInfants=1 from URL param).
    await waitFor(() => screen.getByTestId(`text-occ-${ROOM_ID}-0-infants`), { timeout: 3000 });
    await waitFor(() => screen.getByTestId(`text-occ-${ROOM_ID}-1-infants`), { timeout: 3000 });

    return incBtn;
  }

  /**
   * Switch rate to offer-flex-rs (unitsAvailable=1), wait for qty counter to
   * reach 1, then complete the checkout flow.  Only call this when the switch
   * is expected to SUCCEED (no overflow).
   */
  async function switchAndCheckout() {
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-rate-${ROOM_ID}-offer-flex-rs`));
    });

    await waitFor(() => {
      expect(screen.getByTestId(`text-qty-${ROOM_ID}`).textContent).toBe('1');
    });
    await waitFor(() => {
      expect(screen.queryByTestId(`text-occ-${ROOM_ID}-1-infants`)).toBeNull();
    });

    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );
    await act(async () => { fireEvent.click(continueBtn); });

    await waitFor(() => screen.getByTestId('input-first-name'));
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Smith' } });
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByTestId('input-phone'),      { target: { value: '+1234567890' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-checkout'));
    });
  }

  it('retained unit: infant on unit 0 is preserved in /checkout after rate-switch clamps qty 2→1', async () => {
    await setupTwoUnits();

    // Increment unit 0's infants → 1; unit 1 stays at 0.
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-occ-inc-${ROOM_ID}-0-infants`));
    });
    await waitFor(() => {
      expect(screen.getByTestId(`text-occ-${ROOM_ID}-0-infants`).textContent).toBe('1');
      expect(screen.getByTestId(`text-occ-${ROOM_ID}-1-infants`).textContent).toBe('0');
    });

    await switchAndCheckout();

    expect(capturedCheckoutBody).not.toBeNull();
    expect(capturedCheckoutBody.rooms).toHaveLength(1);

    const line = capturedCheckoutBody.rooms[0];
    expect(line.roomId).toBe(ROOM_ID);
    expect(line.offerId).toBe('offer-flex-rs');
    expect(line.qty).toBe(1);
    expect(line.adults).toBe(2);
    expect(line.infants).toBe(1); // unit 0's infant retained
  });

  it('redistribution: infant on dropped unit 1 is consolidated into unit 0 — not silently lost', async () => {
    await setupTwoUnits();

    // Increment unit 1's infants → 1; unit 0 stays at infants=0.
    // This is the bug path: unit 1 will be the one dropped when qty is clamped.
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-occ-inc-${ROOM_ID}-1-infants`));
    });
    await waitFor(() => {
      expect(screen.getByTestId(`text-occ-${ROOM_ID}-0-infants`).textContent).toBe('0');
      expect(screen.getByTestId(`text-occ-${ROOM_ID}-1-infants`).textContent).toBe('1');
    });

    await switchAndCheckout();

    // setRoomRate must have consolidated the dropped unit's infant back into
    // unit 0 — if it only sliced without redistributing, infants would be 0.
    expect(capturedCheckoutBody).not.toBeNull();
    expect(capturedCheckoutBody.rooms).toHaveLength(1);

    const line = capturedCheckoutBody.rooms[0];
    expect(line.roomId).toBe(ROOM_ID);
    expect(line.offerId).toBe('offer-flex-rs');
    expect(line.qty).toBe(1);
    expect(line.adults).toBe(2);
    expect(line.infants).toBe(1); // infant consolidated from dropped unit 1 → unit 0
  });

  it('overflow: rate switch blocked when infant from dropped unit cannot fit — no checkout sent', async () => {
    // This test verifies that when surviving unit 0 is already at max capacity
    // (adults=2, infants=1 → 3 guests = maxP for safari childUnit), any infant
    // from the dropped unit 1 has nowhere to go — setRoomRate must block the
    // switch and show an error rather than silently truncating the party.
    await setupTwoUnits();

    // Fill unit 0 to capacity: {adults:2, infants:1} → maxP=3 → no room left.
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-occ-inc-${ROOM_ID}-0-infants`));
    });
    await waitFor(() => {
      expect(screen.getByTestId(`text-occ-${ROOM_ID}-0-infants`).textContent).toBe('1');
    });

    // Unit 1 also has an infant that needs somewhere to go after the rate switch.
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-occ-inc-${ROOM_ID}-1-infants`));
    });
    await waitFor(() => {
      expect(screen.getByTestId(`text-occ-${ROOM_ID}-1-infants`).textContent).toBe('1');
    });

    // Attempt to switch rate → setRoomRate detects overflow, blocks the switch.
    await act(async () => {
      fireEvent.click(screen.getByTestId(`button-rate-${ROOM_ID}-offer-flex-rs`));
    });

    // Error message must appear; switch must NOT have been applied.
    await waitFor(() => {
      expect(screen.getByTestId('status-error').textContent).toContain(
        'Some guests cannot be accommodated in fewer units.',
      );
    });

    // Cart qty must stay at 2 — the rate change was rejected.
    expect(screen.getByTestId(`text-qty-${ROOM_ID}`).textContent).toBe('2');

    // Unit 1's occupancy block must still be visible (qty unchanged).
    expect(screen.getByTestId(`text-occ-${ROOM_ID}-1-infants`).textContent).toBe('1');

    // No /api/booking/checkout POST must have been issued.
    expect(capturedCheckoutBody).toBeNull();
  });
});

// ── Garden Cottage: no bed toggle → bedPreferences undefined ─────────────────
//
// Garden Cottage (unitKey='cottage') has no king/twin selector. The checkout
// payload must NOT include a bedPreferences entry for it — not an empty object,
// not a spurious 'king' value. The two tests below cover:
//   1. Cottage booked alone          → bedPreferences is undefined
//   2. Safari + Cottage in same cart → bedPreferences has ONLY the safari key

describe('checkout bedPreferences — Garden Cottage edge cases', () => {
  const COTTAGE_ROOM_ID = 'cottage-room-1';
  const SAFARI_ROOM_ID2 = 'safari-room-2';
  const CHECK_IN_GC  = '2027-07-01';
  const CHECK_OUT_GC = '2027-07-03';

  function makeCottageOnlyAvailability() {
    return {
      checkIn:                CHECK_IN_GC,
      checkOut:               CHECK_OUT_GC,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      COTTAGE_ROOM_ID,
          name:        'Garden Cottage',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            {
              offerId:        'offer-cottage-1',
              total:          500,
              type:           'semiFlex',
              unitsAvailable: 3,
              refundable:     true,
            },
          ],
        },
      ],
    };
  }

  function makeCottageOnlyQuote() {
    return {
      checkIn:        CHECK_IN_GC,
      checkOut:       CHECK_OUT_GC,
      nights:         2,
      currency:       'USD',
      rooms:          1,
      lines: [
        {
          roomId:    COTTAGE_ROOM_ID,
          offerId:   'offer-cottage-1',
          roomName:  'Garden Cottage',
          qty:       1,
          adults:    2,
          children:  0,
          infants:   0,
          lineTotal: 500,
        },
      ],
      total:          500,
      depositPercent: 50,
      deposit:        250,
      balance:        250,
    };
  }

  function makeMixedAvailability() {
    return {
      checkIn:                CHECK_IN_GC,
      checkOut:               CHECK_OUT_GC,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      SAFARI_ROOM_ID2,
          name:        'Safari Tent',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            {
              offerId:        'offer-safari-2',
              total:          600,
              type:           'semiFlex',
              unitsAvailable: 3,
              refundable:     true,
            },
          ],
        },
        {
          roomId:      COTTAGE_ROOM_ID,
          name:        'Garden Cottage',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            {
              offerId:        'offer-cottage-1',
              total:          500,
              type:           'semiFlex',
              unitsAvailable: 3,
              refundable:     true,
            },
          ],
        },
      ],
    };
  }

  function makeMixedQuote() {
    return {
      checkIn:        CHECK_IN_GC,
      checkOut:       CHECK_OUT_GC,
      nights:         2,
      currency:       'USD',
      rooms:          2,
      lines: [
        {
          roomId:    SAFARI_ROOM_ID2,
          offerId:   'offer-safari-2',
          roomName:  'Safari Tent',
          qty:       1,
          adults:    2,
          children:  0,
          infants:   0,
          lineTotal: 600,
        },
        {
          roomId:    COTTAGE_ROOM_ID,
          offerId:   'offer-cottage-1',
          roomName:  'Garden Cottage',
          qty:       1,
          adults:    2,
          children:  0,
          infants:   0,
          lineTotal: 500,
        },
      ],
      total:          1100,
      depositPercent: 50,
      deposit:        550,
      balance:        550,
    };
  }

  let capturedGCBody;

  beforeEach(() => {
    capturedGCBody = null;

    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:    '',
        search:  `?checkIn=${CHECK_IN_GC}&checkOut=${CHECK_OUT_GC}`,
        assign:  vi.fn(),
        replace: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => window._locationBackup ?? location,
    });
  });

  /**
   * Generic helper: render BookDirectPage with a custom fetch mock, add the
   * specified room(s) to the cart, advance to the details step, fill guest info,
   * and submit.  `roomIds` is an array of testId suffixes to click + for.
   */
  async function runGCFlow(availFn, quoteFn, roomIds) {
    global.fetch = vi.fn((url, init) => {
      if (url.includes('/api/booking/availability'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve(availFn()) });
      if (url.includes('/api/booking/quote'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve(quoteFn()) });
      if (url.includes('/api/booking/calendar'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ prices: {} }) });
      if (url.includes('/api/booking/checkout')) {
        capturedGCBody = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ url: 'https://checkout.stripe.com/mock-gc' }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<BookDirectPage lang="en-GB" currency="USD" />);

    // Wait for the first room card to appear (auto-search resolves on mount).
    await waitFor(
      () => screen.getByTestId(`button-inc-${roomIds[0]}`),
      { timeout: 3000 },
    );

    // Add each requested room to the cart.
    for (const rid of roomIds) {
      await act(async () => {
        fireEvent.click(screen.getByTestId(`button-inc-${rid}`));
      });
    }

    // Wait for the Continue button to enable (quote fetched).
    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );

    await act(async () => { fireEvent.click(continueBtn); });

    await waitFor(() => screen.getByTestId('input-first-name'));
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Jo' } });
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Guest' } });
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'jo@example.com' } });
    fireEvent.change(screen.getByTestId('input-phone'),      { target: { value: '+9876543210' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-checkout'));
    });
  }

  it('cottage alone: bedPreferences is undefined — no bed toggle for Garden Cottage', async () => {
    await runGCFlow(makeCottageOnlyAvailability, makeCottageOnlyQuote, [COTTAGE_ROOM_ID]);

    expect(capturedGCBody).not.toBeNull();
    expect(capturedGCBody.bedPreferences).toBeUndefined();
  });

  it('safari + cottage: bedPreferences contains only the safari roomId', async () => {
    await runGCFlow(makeMixedAvailability, makeMixedQuote, [SAFARI_ROOM_ID2, COTTAGE_ROOM_ID]);

    expect(capturedGCBody).not.toBeNull();
    // Safari gets the default 'king' preference.
    expect(capturedGCBody.bedPreferences).toBeDefined();
    expect(capturedGCBody.bedPreferences[SAFARI_ROOM_ID2]).toBe('king');
    // Cottage must NOT appear — it has no bed toggle.
    expect(capturedGCBody.bedPreferences[COTTAGE_ROOM_ID]).toBeUndefined();
  });
});

// ── Thatched Chalet: bed toggle default + explicit twin ───────────────────────
//
// Thatched Chalet (unitKey='chalet') has the same king/twin selector as Safari
// and Comfort tents.  The tests below confirm:
//   1. No toggle touch  → bedPreferences: { [chaletRoomId]: 'king' }
//   2. Toggle switched  → bedPreferences: { [chaletRoomId]: 'twin' }

describe('checkout bedPreferences — Thatched Chalet', () => {
  const CHALET_ROOM_ID  = 'chalet-room-1';
  const CHECK_IN_CH     = '2027-08-01';
  const CHECK_OUT_CH    = '2027-08-03';

  function makeChaletAvailability() {
    return {
      checkIn:                CHECK_IN_CH,
      checkOut:               CHECK_OUT_CH,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      CHALET_ROOM_ID,
          name:        'Thatched Chalet',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            {
              offerId:        'offer-chalet-1',
              total:          700,
              type:           'semiFlex',
              unitsAvailable: 2,
              refundable:     true,
            },
          ],
        },
      ],
    };
  }

  function makeChaletQuote() {
    return {
      checkIn:        CHECK_IN_CH,
      checkOut:       CHECK_OUT_CH,
      nights:         2,
      currency:       'USD',
      rooms:          1,
      lines: [
        {
          roomId:    CHALET_ROOM_ID,
          offerId:   'offer-chalet-1',
          roomName:  'Thatched Chalet',
          qty:       1,
          adults:    2,
          children:  0,
          infants:   0,
          lineTotal: 700,
        },
      ],
      total:          700,
      depositPercent: 50,
      deposit:        350,
      balance:        350,
    };
  }

  let capturedChaletBody;

  beforeEach(() => {
    capturedChaletBody = null;

    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:    '',
        search:  `?checkIn=${CHECK_IN_CH}&checkOut=${CHECK_OUT_CH}`,
        assign:  vi.fn(),
        replace: vi.fn(),
      }),
    });

    global.fetch = vi.fn((url, init) => {
      if (url.includes('/api/booking/availability'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeChaletAvailability()) });
      if (url.includes('/api/booking/quote'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeChaletQuote()) });
      if (url.includes('/api/booking/calendar'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ prices: {} }) });
      if (url.includes('/api/booking/checkout')) {
        capturedChaletBody = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ url: 'https://checkout.stripe.com/mock-chalet' }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => window._locationBackup ?? location,
    });
  });

  /**
   * Render the page, add the chalet to the cart, optionally click the twin
   * toggle, advance to the details step, fill guest info, and submit.
   */
  async function runChaletFlow({ bedChoice } = {}) {
    render(<BookDirectPage lang="en-GB" currency="USD" />);

    const incBtn = await waitFor(
      () => screen.getByTestId(`button-inc-${CHALET_ROOM_ID}`),
      { timeout: 3000 },
    );

    await act(async () => { fireEvent.click(incBtn); });

    if (bedChoice === 'twin') {
      const twinBtn = screen.getByTitle(/twin/i);
      await act(async () => { fireEvent.click(twinBtn); });
    }

    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );

    await act(async () => { fireEvent.click(continueBtn); });

    await waitFor(() => screen.getByTestId('input-first-name'));
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Sam' } });
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Lodge' } });
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'sam@example.com' } });
    fireEvent.change(screen.getByTestId('input-phone'),      { target: { value: '+27123456789' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-checkout'));
    });
  }

  it('sends bedPreferences: { [chaletRoomId]: "king" } when the guest never touches the toggle', async () => {
    await runChaletFlow(); // no bedChoice → toggle untouched

    expect(capturedChaletBody).not.toBeNull();
    expect(capturedChaletBody.bedPreferences).toBeDefined();
    expect(capturedChaletBody.bedPreferences[CHALET_ROOM_ID]).toBe('king');
  });

  it('sends bedPreferences: { [chaletRoomId]: "twin" } when the guest switches to twin', async () => {
    await runChaletFlow({ bedChoice: 'twin' });

    expect(capturedChaletBody).not.toBeNull();
    expect(capturedChaletBody.bedPreferences).toBeDefined();
    expect(capturedChaletBody.bedPreferences[CHALET_ROOM_ID]).toBe('twin');
  });
});

// ── Comfort Tent: bed toggle default + explicit twin ──────────────────────────
//
// Comfort Tent (unitKey='comfort') has the same king/twin selector as Safari
// Tent and Thatched Chalet.  The tests below confirm:
//   1. No toggle touch  → bedPreferences: { [comfortRoomId]: 'king' }
//   2. Toggle switched  → bedPreferences: { [comfortRoomId]: 'twin' }

describe('checkout bedPreferences — Comfort Tent', () => {
  const COMFORT_ROOM_ID = 'comfort-room-1';
  const CHECK_IN_CT     = '2027-09-01';
  const CHECK_OUT_CT    = '2027-09-03';

  function makeComfortAvailability() {
    return {
      checkIn:                CHECK_IN_CT,
      checkOut:               CHECK_OUT_CT,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      COMFORT_ROOM_ID,
          name:        'Comfort Tent',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            {
              offerId:        'offer-comfort-1',
              total:          650,
              type:           'semiFlex',
              unitsAvailable: 2,
              refundable:     true,
            },
          ],
        },
      ],
    };
  }

  function makeComfortQuote() {
    return {
      checkIn:        CHECK_IN_CT,
      checkOut:       CHECK_OUT_CT,
      nights:         2,
      currency:       'USD',
      rooms:          1,
      lines: [
        {
          roomId:    COMFORT_ROOM_ID,
          offerId:   'offer-comfort-1',
          roomName:  'Comfort Tent',
          qty:       1,
          adults:    2,
          children:  0,
          infants:   0,
          lineTotal: 650,
        },
      ],
      total:          650,
      depositPercent: 50,
      deposit:        325,
      balance:        325,
    };
  }

  let capturedComfortBody;

  beforeEach(() => {
    capturedComfortBody = null;

    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:    '',
        search:  `?checkIn=${CHECK_IN_CT}&checkOut=${CHECK_OUT_CT}`,
        assign:  vi.fn(),
        replace: vi.fn(),
      }),
    });

    global.fetch = vi.fn((url, init) => {
      if (url.includes('/api/booking/availability'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeComfortAvailability()) });
      if (url.includes('/api/booking/quote'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeComfortQuote()) });
      if (url.includes('/api/booking/calendar'))
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ prices: {} }) });
      if (url.includes('/api/booking/checkout')) {
        capturedComfortBody = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ url: 'https://checkout.stripe.com/mock-comfort' }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => window._locationBackup ?? location,
    });
  });

  /**
   * Render the page, add the comfort tent to the cart, optionally click the twin
   * toggle, advance to the details step, fill guest info, and submit.
   */
  async function runComfortFlow({ bedChoice } = {}) {
    render(<BookDirectPage lang="en-GB" currency="USD" />);

    const incBtn = await waitFor(
      () => screen.getByTestId(`button-inc-${COMFORT_ROOM_ID}`),
      { timeout: 3000 },
    );

    await act(async () => { fireEvent.click(incBtn); });

    if (bedChoice === 'twin') {
      const twinBtn = screen.getByTitle(/twin/i);
      await act(async () => { fireEvent.click(twinBtn); });
    }

    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );

    await act(async () => { fireEvent.click(continueBtn); });

    await waitFor(() => screen.getByTestId('input-first-name'));
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Pat' } });
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Guest' } });
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'pat@example.com' } });
    fireEvent.change(screen.getByTestId('input-phone'),      { target: { value: '+27987654321' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-checkout'));
    });
  }

  it('sends bedPreferences: { [comfortRoomId]: "king" } when the guest never touches the toggle', async () => {
    await runComfortFlow(); // no bedChoice → toggle untouched

    expect(capturedComfortBody).not.toBeNull();
    expect(capturedComfortBody.bedPreferences).toBeDefined();
    expect(capturedComfortBody.bedPreferences[COMFORT_ROOM_ID]).toBe('king');
  });

  it('sends bedPreferences: { [comfortRoomId]: "twin" } when the guest switches to twin', async () => {
    await runComfortFlow({ bedChoice: 'twin' });

    expect(capturedComfortBody).not.toBeNull();
    expect(capturedComfortBody.bedPreferences).toBeDefined();
    expect(capturedComfortBody.bedPreferences[COMFORT_ROOM_ID]).toBe('twin');
  });
});

// ── Semi-flexible rate stays the default through /quote and /checkout ────────
//
// Regression guard for the refundable-by-default policy: when a room offers a
// cheaper non-refundable plan AND a semi-flexible plan, and the guest never
// touches the rate chooser, the semiFlex offerId must be the one sent to BOTH
// /api/booking/quote and /api/booking/checkout, and the card must display the
// semiFlex total (not the cheaper nonRef price). A refactor that reverts to
// "cheapest offer wins" would fail all three assertions.

describe('semi-flexible rate is the untouched default through quote and checkout', () => {
  const ROOM_ID       = 'safari-room-semiflex-default';
  const CHECK_IN_SF   = '2027-09-01';
  const CHECK_OUT_SF  = '2027-09-03';
  const NONREF_ID     = 'offer-nonref-sf';
  const SEMIFLEX_ID   = 'offer-flex-sf';
  const NONREF_TOTAL  = 500;
  const SEMIFLEX_TOTAL = 620;

  function makeAvailabilitySF() {
    return {
      checkIn:                CHECK_IN_SF,
      checkOut:               CHECK_OUT_SF,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      ROOM_ID,
          name:        'Safari Tent',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            // Cheapest offer is non-refundable — the old buggy default.
            { offerId: NONREF_ID,   total: NONREF_TOTAL,   type: 'nonRef',   unitsAvailable: 3, refundable: false },
            { offerId: SEMIFLEX_ID, total: SEMIFLEX_TOTAL, type: 'semiFlex', unitsAvailable: 3, refundable: true  },
          ],
        },
      ],
    };
  }

  function makeQuoteSF() {
    return {
      checkIn: CHECK_IN_SF, checkOut: CHECK_OUT_SF, nights: 2, currency: 'USD', rooms: 1,
      lines: [{
        roomId: ROOM_ID, offerId: SEMIFLEX_ID, roomName: 'Safari Tent',
        qty: 1, adults: 2, children: 0, infants: 0, lineTotal: SEMIFLEX_TOTAL,
      }],
      total: SEMIFLEX_TOTAL, depositPercent: 50, deposit: SEMIFLEX_TOTAL / 2, balance: SEMIFLEX_TOTAL / 2,
    };
  }

  let capturedQuoteBodies;
  let capturedCheckoutBody;
  let originalLocationDescriptor;

  beforeEach(() => {
    capturedQuoteBodies  = [];
    capturedCheckoutBody = null;
    marinPanelProps.length = 0;
    originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:    '',
        search:  `?checkIn=${CHECK_IN_SF}&checkOut=${CHECK_OUT_SF}`,
        assign:  vi.fn(),
        replace: vi.fn(),
      }),
    });

    global.fetch = vi.fn((url, init) => {
      if (url.includes('/api/booking/availability')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeAvailabilitySF()) });
      }
      if (url.includes('/api/booking/quote')) {
        capturedQuoteBodies.push(JSON.parse(init.body));
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeQuoteSF()) });
      }
      if (url.includes('/api/booking/calendar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ prices: {} }) });
      }
      if (url.includes('/api/booking/checkout')) {
        capturedCheckoutBody = JSON.parse(init.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ url: 'https://checkout.stripe.com/mock' }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalLocationDescriptor) {
      Object.defineProperty(window, 'location', originalLocationDescriptor);
    } else {
      delete window.location;
    }
  });

  it('untouched rate chooser: semiFlex offerId reaches /quote and /checkout, card shows semiFlex total', async () => {
    render(<BookDirectPage lang="en-GB" currency="USD" />);

    const incBtn = await waitFor(
      () => screen.getByTestId(`button-inc-${ROOM_ID}`),
      { timeout: 3000 },
    );

    // The card price must already show the semiFlex total (not the cheaper
    // nonRef price) before the guest interacts with anything.
    const priceEl = screen.getByTestId(`text-offer-total-${ROOM_ID}`);
    expect(priceEl.textContent).toContain(String(SEMIFLEX_TOTAL));
    expect(priceEl.textContent).not.toContain(String(NONREF_TOTAL));

    // Add one unit — deliberately never touch the rate chooser.
    await act(async () => { fireEvent.click(incBtn); });

    // Wait for the debounced /quote to fire and the Continue button to enable.
    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );

    // /quote must have been called with the semiFlex offerId.
    expect(capturedQuoteBodies.length).toBeGreaterThan(0);
    for (const body of capturedQuoteBodies) {
      expect(body.rooms).toHaveLength(1);
      expect(body.rooms[0].roomId).toBe(ROOM_ID);
      expect(body.rooms[0].offerId).toBe(SEMIFLEX_ID);
    }

    // Card price still reflects the semiFlex total after the quote resolves.
    expect(
      screen.getByTestId(`text-offer-total-${ROOM_ID}`).textContent,
    ).toContain(String(SEMIFLEX_TOTAL));

    // Continue → fill guest details → submit.
    await act(async () => { fireEvent.click(continueBtn); });

    await waitFor(() => screen.getByTestId('input-first-name'));
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Sam' } });
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Flex' } });
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'sam@example.com' } });
    fireEvent.change(screen.getByTestId('input-phone'),      { target: { value: '+1234567890' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-checkout'));
    });

    // /checkout must carry the semiFlex offerId too.
    expect(capturedCheckoutBody).not.toBeNull();
    expect(capturedCheckoutBody.rooms).toHaveLength(1);
    expect(capturedCheckoutBody.rooms[0].roomId).toBe(ROOM_ID);
    expect(capturedCheckoutBody.rooms[0].offerId).toBe(SEMIFLEX_ID);
    expect(capturedCheckoutBody.rooms[0].qty).toBe(1);
  });

  it('Marin page context quotes the semiFlex total, not the cheaper nonRef price', async () => {
    render(<BookDirectPage lang="en-GB" currency="USD" />);

    // Wait for the results step to render (room card visible).
    await waitFor(
      () => screen.getByTestId(`button-inc-${ROOM_ID}`),
      { timeout: 3000 },
    );

    // The results-step MarinPanel context now lists every rate plan by name
    // with its price and a one-line policy summary, plus a per-room deep link
    // that preserves dates/guests/currency and the unit key.
    const resultsCtx = marinPanelProps
      .map((p) => p.context)
      .find((c) => c && c.includes('Available options:'));
    expect(resultsCtx).toBeTruthy();
    expect(resultsCtx).toContain('Safari Tent');
    expect(resultsCtx).toContain('Semi-flexible (refundable)');
    expect(resultsCtx).toContain('Non-refundable');
    expect(resultsCtx).toContain(String(SEMIFLEX_TOTAL));
    expect(resultsCtx).toContain(String(NONREF_TOTAL));
    expect(resultsCtx).toContain('Policy: 50% deposit');
    expect(resultsCtx).toMatch(/Continue with this option: https:\/\/devoceanlodge\.com\/book-direct\?[^\n]*&unit=safari/);

    // Add a unit and continue so the pre-payment MarinPanel context is built
    // from the quote — it must also carry the semiFlex totals.
    fireEvent.click(screen.getByTestId(`button-inc-${ROOM_ID}`));
    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );
    marinPanelProps.length = 0;
    await act(async () => { fireEvent.click(continueBtn); });
    await waitFor(() => screen.getByTestId('input-first-name'));

    const detailsCtx = marinPanelProps
      .map((p) => p.context)
      .find((c) => c && c.includes('pre-payment stage'));
    expect(detailsCtx).toBeTruthy();
    expect(detailsCtx).toContain(String(SEMIFLEX_TOTAL));
    expect(detailsCtx).not.toContain(String(NONREF_TOTAL));
  });
});

describe('Marin context quotes FX display currency alongside charged USD', () => {
  const ROOM_ID      = 'safari-room-fx';
  const CHECK_IN_FX  = '2027-11-01';
  const CHECK_OUT_FX = '2027-11-03';
  const OFFER_ID     = 'offer-flex-fx';
  const TOTAL        = 620;
  const EUR_RATE     = 0.9; // 620 → €558, deposit 310 → €279

  function makeAvailabilityFX() {
    return {
      checkIn:                CHECK_IN_FX,
      checkOut:               CHECK_OUT_FX,
      nights:                 2,
      currency:               'USD',
      cancellationPolicyDays: 30,
      maxRooms:               5,
      rooms: [
        {
          roomId:      ROOM_ID,
          name:        'Safari Tent',
          currency:    'USD',
          nights:      2,
          maxAdults:   2,
          maxPeople:   2,
          maxChildren: 0,
          available:   true,
          offers: [
            { offerId: OFFER_ID, total: TOTAL, type: 'semiFlex', unitsAvailable: 3, refundable: true },
          ],
        },
      ],
    };
  }

  function makeQuoteFX() {
    return {
      checkIn: CHECK_IN_FX, checkOut: CHECK_OUT_FX, nights: 2, currency: 'USD', rooms: 1,
      lines: [{
        roomId: ROOM_ID, offerId: OFFER_ID, roomName: 'Safari Tent',
        qty: 1, adults: 2, children: 0, infants: 0, lineTotal: TOTAL,
      }],
      total: TOTAL, depositPercent: 50, deposit: TOTAL / 2, balance: TOTAL / 2,
    };
  }

  let originalLocationDescriptor;

  beforeEach(() => {
    marinPanelProps.length = 0;
    localStorage.clear(); // fx_<base> cache must not leak between tests
    originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        href:    '',
        search:  `?checkIn=${CHECK_IN_FX}&checkOut=${CHECK_OUT_FX}`,
        assign:  vi.fn(),
        replace: vi.fn(),
      }),
    });

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/booking/availability')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeAvailabilityFX()) });
      }
      if (url.includes('/api/booking/quote')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeQuoteFX()) });
      }
      if (url.includes('/api/booking/calendar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ prices: {} }) });
      }
      if (url.includes('/api/fx')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ rates: { EUR: EUR_RATE } }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    if (originalLocationDescriptor) {
      Object.defineProperty(window, 'location', originalLocationDescriptor);
    } else {
      delete window.location;
    }
  });

  it('results + details contexts carry approx EUR amounts and a charged-in-USD note', async () => {
    render(<BookDirectPage lang="en-GB" currency="EUR" />);

    await waitFor(
      () => screen.getByTestId(`button-inc-${ROOM_ID}`),
      { timeout: 3000 },
    );

    // Wait until the FX rates have arrived and the results context re-renders
    // with the approximate conversion (≈ marker) and the explicit USD note.
    const resultsCtx = await waitFor(
      () => {
        const ctx = marinPanelProps
          .map((p) => p.context)
          .find((c) => c && c.includes('Available options:') && c.includes('≈'));
        if (!ctx) throw new Error('FX results context not yet rendered');
        return ctx;
      },
      { timeout: 3000 },
    );
    expect(resultsCtx).toContain(String(TOTAL));           // charged USD total
    expect(resultsCtx).toContain(String(TOTAL * EUR_RATE)); // 558 approx EUR
    expect(resultsCtx).toContain('all charges are made in USD');
    expect(resultsCtx).toContain('EUR amounts are approximate');

    // Continue to the details step and assert the pre-payment context too.
    fireEvent.click(screen.getByTestId(`button-inc-${ROOM_ID}`));
    const continueBtn = await waitFor(
      () => {
        const btn = screen.getByTestId('button-continue-details');
        if (btn.disabled) throw new Error('button still disabled');
        return btn;
      },
      { timeout: 3000 },
    );
    marinPanelProps.length = 0;
    await act(async () => { fireEvent.click(continueBtn); });
    await waitFor(() => screen.getByTestId('input-first-name'));

    const detailsCtx = await waitFor(
      () => {
        const ctx = marinPanelProps
          .map((p) => p.context)
          .find((c) => c && c.includes('pre-payment stage') && c.includes('≈'));
        if (!ctx) throw new Error('FX details context not yet rendered');
        return ctx;
      },
      { timeout: 3000 },
    );
    expect(detailsCtx).toContain(String(TOTAL));            // charged USD total
    expect(detailsCtx).toContain(String(TOTAL * EUR_RATE));  // approx EUR total
    expect(detailsCtx).toContain(String((TOTAL / 2) * EUR_RATE)); // approx EUR deposit
    expect(detailsCtx).toContain('all charges are made in USD');
  });
});
