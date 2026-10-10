/**
 * App.hashScroll.test.jsx
 *
 * Confirms that hash scrolling waits for lazy sections without calling
 * scrollIntoView after the component unmounts.
 *
 * Covers:
 *   1. Normal path — scrollIntoView IS called when the target element exists
 *      and the component stays mounted.
 *   2. A lazy section that mounts after the initial render still
 *      receives the requested hash scroll.
 *   3. Unmount before scroll — component unmounts while the observer is
 *      in-flight (target element not yet in DOM); scrollIntoView must NOT be
 *      called after unmount.
 *   4. Route change — effect cleanup disconnects the observer before it can
 *      scroll to a stale target.
 *   5. Unknown hashes stop DOM lookups at the 10-second deadline, including
 *      localized homepages and targets inserted after expiry.
 *   6. Finding a target or unmounting cancels the pending deadline.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';

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

describe('App — hash-scroll lazy-section guard', () => {
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
    cleanup();
    global.ResizeObserver = originalResizeObserver;
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    mockLocation = '/';
  });

  // ── Test 1: normal path — scrollIntoView fires when element exists ─────────
  //
  // Mount with /#stay in the URL. The #stay element is already in the DOM
  // (rendered by the AccommodationsSection stub).

  it('calls scrollIntoView when the target element exists and the component stays mounted', async () => {
    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;

    await act(async () => { render(<App />); });

    // The already-rendered #stay element is found during the initial effect.
    const stayEl = document.getElementById('stay');
    expect(stayEl).not.toBeNull();

    // Flush the effect's timers.
    await act(async () => { vi.runAllTimers(); });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('scrolls to a section that mounts after a lazy chunk finishes loading', async () => {
    mockLocation = '/nl/';
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

  it.each(['/', '/de/'])(
    '%s: stops observing a missing anchor at 10 seconds and ignores later DOM mutations',
    async pathname => {
      const targetId = 'nonexistent-id';
      mockLocation = pathname;
      setWindowLocation({ pathname, hash: `#${targetId}` });
      const scrollSpy = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollSpy;
      const lookupSpy = vi.spyOn(document, 'getElementById');
      const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
      const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
      const targetLookups = () => lookupSpy.mock.calls.filter(([id]) => id === targetId).length;

      await act(async () => { render(<App />); });
      expect(observeSpy).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });

      await act(async () => { vi.advanceTimersByTime(9_999); });
      expect(disconnectSpy).not.toHaveBeenCalled();

      // Prove the observer is actually active, rather than merely asserting
      // that a test double never called anything.
      const beforeMutation = targetLookups();
      await act(async () => {
        document.body.appendChild(document.createElement('aside'));
      });
      expect(targetLookups()).toBeGreaterThan(beforeMutation);

      await act(async () => { vi.advanceTimersByTime(1); });
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      const atExpiry = targetLookups();

      // Even the formerly missing target must not restart scrolling once
      // the finite wait has ended.
      await act(async () => {
        const target = document.createElement('section');
        target.id = targetId;
        document.body.appendChild(target);
      });
      await act(async () => {
        vi.advanceTimersByTime(30_000);
        document.body.appendChild(document.createElement('aside'));
      });

      expect(targetLookups()).toBe(atExpiry);
      expect(scrollSpy).not.toHaveBeenCalled();
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    },
  );

  it('finds a target just before the deadline and cancels the expiry timer', async () => {
    setWindowLocation({ hash: '#last-moment-section' });
    const scrollSpy = vi.fn();
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');

    await act(async () => { render(<App />); });
    await act(async () => { vi.advanceTimersByTime(9_999); });
    expect(disconnectSpy).not.toHaveBeenCalled();

    await act(async () => {
      const target = document.createElement('section');
      target.id = 'last-moment-section';
      target.scrollIntoView = scrollSpy;
      document.body.appendChild(target);
    });

    expect(scrollSpy).toHaveBeenCalledExactlyOnceWith({ behavior: 'smooth', block: 'start' });
    expect(disconnectSpy).toHaveBeenCalledTimes(1);

    // If the timeout was not cleared, it would disconnect a second time.
    await act(async () => { vi.advanceTimersByTime(20_000); });
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  it('responds to hash-only navigation on a localized homepage', async () => {
    mockLocation = '/nl/';
    setWindowLocation({ pathname: '/nl/', hash: '' });
    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;

    await act(async () => { render(<App />); });

    window.location.hash = '#location';
    await act(async () => {
      window.dispatchEvent(new Event('pushState'));
      vi.runAllTimers();
    });

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  // ── Test 3: unmount before scroll — scrollIntoView must NOT fire ───────────
  //
  // Mount with /#missing in the URL (no element with that id exists).
  // The observer stays active while the target is absent. Unmount the component
  // mid-flight. After flushing pending timers, scrollIntoView must not have been
  // called on any element.

  it('does not call scrollIntoView after the component unmounts while retrying', async () => {
    setWindowLocation({ pathname: '/', hash: '#missing' });

    // Spy on scrollIntoView at the prototype level so we catch any element
    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const lookupSpy = vi.spyOn(document, 'getElementById');
    const targetLookups = () => lookupSpy.mock.calls.filter(([id]) => id === 'missing').length;

    let unmountFn;
    await act(async () => {
      const result = render(<App />);
      unmountFn = result.unmount;
    });

    // Unmount before a lazy target can mount.
    await act(async () => { unmountFn(); });
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    const atUnmount = targetLookups();

    // Flush all remaining timers — cleanup must block any call.
    await act(async () => {
      vi.runAllTimers();
      const target = document.createElement('section');
      target.id = 'missing';
      document.body.appendChild(target);
    });

    expect(scrollSpy).not.toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(targetLookups()).toBe(atUnmount);
  });

  // ── Test 4: route change — stale observer must not call scrollIntoView ─────
  //
  // Mount with /#missing in the URL. Navigate away before the target mounts.
  // React cleans up the old effect before a stale observer can scroll.

  it('does not call scrollIntoView from a stale observer when a route change re-runs the effect', async () => {
    setWindowLocation({ pathname: '/', hash: '#missing' });

    const scrollSpy = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollSpy;

    let rerenderFn;
    await act(async () => {
      const result = render(<App />);
      rerenderFn = result.rerender;
    });

    // Change location before the target mounts — React cleans up the old effect.
    mockLocation = '/story';
    setWindowLocation({ pathname: '/story', hash: '' });
    await act(async () => { rerenderFn(<App />); });

    // Flush everything — observer cleanup must prevent a stale scroll.
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
