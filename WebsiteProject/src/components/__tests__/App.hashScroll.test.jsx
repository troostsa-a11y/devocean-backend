/**
 * App.hashScroll.test.jsx
 *
 * Confirms that the hash-scroll rAF retry loop in App.jsx cannot call
 * scrollIntoView after the component unmounts.
 *
 * Covers:
 *   1. Normal path — scrollIntoView IS called when the target element exists
 *      and the component stays mounted.
 *   2. A lazy section that mounts after the initial short retry window still
 *      receives the requested hash scroll.
 *   3. Unmount before scroll — component unmounts while the rAF retry loop is
 *      in-flight (target element not yet in DOM); scrollIntoView must NOT be
 *      called after unmount.
 *   4. Route change — effect cleanup fires (cancelled=true) before the next
 *      rAF; stale loop must not call scrollIntoView.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ── Wouter mocks ──────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
let mockLocation = '/';

vi.mock('wouter', () => ({
  useLocation: () => [mockLocation, mockNavigate],
  Router: ({ children }) => <>{children}</>,
  Switch: ({ children }) => {
    const arr = Array.isArray(children) ? children : [children];
    const home = arr.find(c => c?.props?.path === '/');
    return home ? <>{home.props.children}</> : null;
  },
  Route: ({ children }) => <>{children}</>,
}));

vi.mock('wouter/use-browser-location', () => ({
  useBrowserLocation: () => [mockLocation, mockNavigate],
}));

// ── Heavy internal dependencies ───────────────────────────────────────────────

vi.mock('../../i18n/useLocale', () => ({
  useLocale: () => ({
    lang: 'en',
    currency: 'USD',
    region: 'westEu',
    setLang: vi.fn(),
    setRegion: vi.fn(),
    setCurrency: vi.fn(),
    ui: { nav: {}, stay: {}, contact: {}, regions: {} },
    criticalUI: { nav: {}, stay: {}, contact: {}, regions: {} },
    loading: false,
    bookingLocale: 'en',
    dateLocale: 'en-GB',
    countryCode: 'ZZ',
  }),
  CC_TO_CURRENCY: {},
}));

vi.mock('../../utils/localize', () => ({
  localizeUnits: () => [],
  localizeExperiences: () => [],
  buildBookingUrl: () => '/book-direct',
}));

vi.mock('../../data/content', () => ({
  HERO_IMAGES: [],
  IMG: { units: {} },
}));

vi.mock('../../utils/debounce', () => ({
  throttle: fn => fn,
}));

vi.mock('../../utils/safeStorage', () => ({
  safeLocalStorage:   { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() },
  safeSessionStorage: { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() },
}));

vi.mock('../../utils/seoMeta', () => ({
  useSeoPage: vi.fn(),
  getHomeDescription: () => null,
  getHomeTitle: () => null,
}));

// ── Section stubs ─────────────────────────────────────────────────────────────

vi.mock('../Header',                () => ({ default: () => <header><div className="topbar" /></header> }));
vi.mock('../HeroSection',           () => ({ default: () => <div><h1>Hero</h1></div> }));
vi.mock('../AccommodationsSection', () => ({ default: () => <div id="stay" /> }));
vi.mock('../ExperiencesSection',    () => ({ default: () => <div id="experiences" /> }));
vi.mock('../GallerySection',        () => ({ default: () => <div id="gallery" /> }));
vi.mock('../LocationSection',       () => ({ default: () => <div id="location" /> }));
vi.mock('../ContactSection',        () => ({ default: () => <div id="contact" /> }));
vi.mock('../Footer',                () => ({ default: () => <footer /> }));

vi.mock('../ExperienceDetailPage',   () => ({ default: () => null }));
vi.mock('../WhyPontaPage',           () => ({ default: () => null }));
vi.mock('../AdminPage',              () => ({ default: () => null }));
vi.mock('../BookDirectPage',         () => ({ default: () => null }));
vi.mock('../BookingConfirmedPage',   () => ({ default: () => null }));
vi.mock('../GiftVouchersPage',       () => ({ default: () => null }));
vi.mock('../GiftConfirmedPage',      () => ({ default: () => null }));
vi.mock('../StoryPage',              () => ({ default: () => null }));
vi.mock('../MealsPage',             () => ({ default: () => null }));
vi.mock('../PontaDoOuroPage',       () => ({ default: () => null }));
vi.mock('../GettingTherePage',      () => ({ default: () => null }));
vi.mock('../WithoutFourByFourPage', () => ({ default: () => null }));
vi.mock('../AccommodationPage',     () => ({ default: () => null }));
vi.mock('../SafariTentsPage',       () => ({ default: () => null }));
vi.mock('../DivingDolphinsPage',    () => ({ default: () => null }));

// ── App under test ────────────────────────────────────────────────────────────

import App from '../../App';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Point window.location at a pathname + hash without triggering a real
 * navigation. The hash-scroll effect reads window.location.hash directly.
 */
function setWindowLocation({ pathname = '/', hash = '' } = {}) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      pathname,
      hash,
      search: '',
      href: `http://localhost${pathname}${hash}`,
      assign:  vi.fn(),
      replace: vi.fn(),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('App — hash-scroll rAF unmount guard', () => {
  let originalResizeObserver;

  beforeEach(() => {
    originalResizeObserver = global.ResizeObserver;
    // Provide a no-op ResizeObserver so the layout effect doesn't throw
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    vi.useFakeTimers();
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '#stay' });
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    mockLocation = '/';
  });

  // ── Test 1: normal path — scrollIntoView fires when element exists ─────────
  //
  // Mount with /#stay in the URL. The #stay element is already in the DOM
  // (rendered by the AccommodationsSection stub). Flush one rAF frame — the
  // tryScroll callback finds the element and calls scrollIntoView.

  it('calls scrollIntoView when the target element exists and the component stays mounted', async () => {
    const scrollSpy = vi.fn();

    await act(async () => { render(<App />); });

    // Attach the spy to the already-rendered #stay element
    const stayEl = document.getElementById('stay');
    expect(stayEl).not.toBeNull();
    stayEl.scrollIntoView = scrollSpy;

    // Flush the rAF that kicks off tryScroll
    await act(async () => { vi.runAllTimers(); });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('scrolls to a section that mounts after a lazy chunk finishes loading', async () => {
    setWindowLocation({ pathname: '/nl/', hash: '#late-location' });
    const scrollSpy = vi.fn();

    await act(async () => { render(<App />); });

    setTimeout(() => {
      const lateSection = document.createElement('section');
      lateSection.id = 'late-location';
      lateSection.scrollIntoView = scrollSpy;
      document.body.appendChild(lateSection);
    }, 500);

    await act(async () => { vi.advanceTimersByTime(600); });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  // ── Test 3: unmount before scroll — scrollIntoView must NOT fire ───────────
  //
  // Mount with /#missing in the URL (no element with that id exists).
  // The loop will keep retrying via rAF. Unmount the component mid-flight —
  // the cleanup sets cancelled=true and calls cancelAnimationFrame.
  // After flushing all pending timers/rAFs, scrollIntoView must not have been
  // called on any element.

  it('does not call scrollIntoView after the component unmounts while retrying', async () => {
    setWindowLocation({ pathname: '/', hash: '#missing' });

    // Spy on scrollIntoView at the prototype level so we catch any element
    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;

    let unmountFn;
    await act(async () => {
      const result = render(<App />);
      unmountFn = result.unmount;
    });

    // At this point a rAF has been queued for the first tryScroll attempt.
    // Unmount BEFORE flushing — cleanup cancels the pending rAF.
    unmountFn();

    // Flush all remaining rAFs/timers — cancelled guard must block any call
    await act(async () => { vi.runAllTimers(); });

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  // ── Test 3: route change — stale loop must not call scrollIntoView ─────────
  //
  // Mount with /#missing in the URL. Navigate away before the rAF fires.
  // React cleans up the old effect (cancelled=true, cancelAnimationFrame).
  // Verify scrollIntoView is never called from the stale loop.

  it('does not call scrollIntoView from a stale rAF when a route change re-runs the effect', async () => {
    setWindowLocation({ pathname: '/', hash: '#missing' });

    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });

    // Change location before flushing rAFs — React cleans up the old effect
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Flush everything — stale rAF's cancelled guard must prevent scrollIntoView
    await act(async () => { vi.runAllTimers(); });

    expect(scrollSpy).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Hero-placeholder double-rAF unmount guard
// ─────────────────────────────────────────────────────────────────────────────

describe('App — hero-placeholder double-rAF unmount guard', () => {
  let originalResizeObserver;

  beforeEach(() => {
    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    mockLocation = '/';
    setWindowLocation({ pathname: '/', hash: '' });
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    mockLocation = '/';
  });

  // ── Test 4: unmount between the two rAF frames — style.display must NOT mutate
  //
  // Strategy: replace requestAnimationFrame with a manual queue so we can fire
  // the outer frame (which schedules the inner frame) without firing the inner
  // frame yet.  Unmounting between the two frames sets heroCancelled=true.
  // Firing the inner frame afterwards must be a no-op due to the guard.

  it('does not set heroPlaceholder.style.display="none" after unmount between the two rAF frames', async () => {
    // Insert #hero-placeholder into DOM so the branch executes
    const heroEl = document.createElement('div');
    heroEl.id = 'hero-placeholder';
    heroEl.style.display = '';
    document.body.appendChild(heroEl);

    // Make the "hero-seen" storage flag truthy so the double-rAF branch runs.
    // The vi.mock factory returns a plain object — we can mutate getItem directly.
    const storageModule = await import('../../utils/safeStorage');
    const origSessionGetItem = storageModule.safeSessionStorage.getItem;
    storageModule.safeSessionStorage.getItem = () => 'true';

    // Install a manual rAF queue: captures callbacks by id so we can fire them
    // one batch at a time (outer frame, then inner frame separately).
    const rafQueue = new Map();
    let rafIdCounter = 1;
    const origRAF = globalThis.requestAnimationFrame;
    const origCAF = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(cb => {
      const id = rafIdCounter++;
      rafQueue.set(id, cb);
      return id;
    });
    globalThis.cancelAnimationFrame = vi.fn(id => rafQueue.delete(id));

    let unmountFn;
    await act(async () => {
      const { unmount } = render(<App />);
      unmountFn = unmount;
    });

    // First batch: fire every rAF queued during mount.
    // This includes the outer hero-placeholder rAF, which schedules the inner one.
    const firstBatch = [...rafQueue.entries()];
    rafQueue.clear();
    for (const [, cb] of firstBatch) cb(performance.now());

    // The inner rAF is now in the queue. Unmount before it fires.
    // Cleanup sets heroCancelled=true (and calls cancelAnimationFrame on the
    // already-fired outer id, which is now a no-op via our mock).
    unmountFn();

    // Second batch: fire all remaining rAFs including the inner hero frame.
    // The heroCancelled guard must prevent any mutation to heroEl.style.display.
    const secondBatch = [...rafQueue.entries()];
    rafQueue.clear();
    for (const [, cb] of secondBatch) cb(performance.now());

    expect(heroEl.style.display).not.toBe('none');

    // Restore everything
    globalThis.requestAnimationFrame = origRAF;
    globalThis.cancelAnimationFrame = origCAF;
    storageModule.safeSessionStorage.getItem = origSessionGetItem;
  });
});
