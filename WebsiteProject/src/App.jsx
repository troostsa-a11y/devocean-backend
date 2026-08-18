import { useEffect, useMemo, lazy, Suspense, useTransition, useCallback } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { useBrowserLocation } from 'wouter/use-browser-location';

/**
 * Custom Wouter location hook that wraps every navigate() call in
 * React 18's startTransition. This keeps the *old* route content on screen
 * while the new lazy chunk downloads, so the Suspense fallback (spinner) is
 * never shown during in-app navigation — eliminating the "black on white
 * between screens" flash that appears when chunks take >1 frame to load.
 *
 * First-load (direct URL visit) still shows the fallback normally because
 * there is no previous route to keep on screen.
 */
function useTransitionLocation() {
  const [location, navigate] = useBrowserLocation();
  const [, startTransition] = useTransition();
  const transitionNavigate = useCallback(
    (to, opts) => startTransition(() => navigate(to, opts)),
    [navigate] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return [location, transitionNavigate];
}
import { useLocale, CC_TO_CURRENCY } from './i18n/useLocale';
import { localizeUnits, localizeExperiences, buildBookingUrl } from './utils/localize';
import { HERO_IMAGES } from './data/content';
import { throttle } from './utils/debounce';
import { safeLocalStorage, safeSessionStorage } from './utils/safeStorage';
import { useSeoPage, getHomeDescription, getHomeTitle } from './utils/seoMeta';

// Critical above-the-fold components (loaded immediately)
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AccommodationsSection from './components/AccommodationsSection';
import ExperiencesSection from './components/ExperiencesSection';

// Route-level components (lazy loaded - only fetched when their route is visited)
const ExperienceDetailPage = lazy(() => import('./components/ExperienceDetailPage'));
const WhyPontaPage = lazy(() => import('./components/WhyPontaPage'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const BookDirectPage = lazy(() => import('./components/BookDirectPage'));
const BookingConfirmedPage = lazy(() => import('./components/BookingConfirmedPage'));
const GiftVouchersPage = lazy(() => import('./components/GiftVouchersPage'));
const GiftConfirmedPage = lazy(() => import('./components/GiftConfirmedPage'));
const StoryPage              = lazy(() => import('./components/StoryPage'));
const MealsPage              = lazy(() => import('./components/MealsPage'));
const PontaDoOuroPage        = lazy(() => import('./components/PontaDoOuroPage'));
const GettingTherePage       = lazy(() => import('./components/GettingTherePage'));
const WithoutFourByFourPage  = lazy(() => import('./components/WithoutFourByFourPage'));
const AccommodationPage      = lazy(() => import('./components/AccommodationPage'));
const SafariTentsPage        = lazy(() => import('./components/SafariTentsPage'));
const DivingDolphinsPage     = lazy(() => import('./components/DivingDolphinsPage'));

// Below-the-fold components (lazy loaded for better INP)
const GallerySection = lazy(() => import('./components/GallerySection'));
const LocationSection = lazy(() => import('./components/LocationSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

export default function App() {
  const { lang, currency, region, setLang, setRegion, setCurrency, ui, criticalUI, loading, bookingLocale, dateLocale, countryCode } = useLocale();
  const [location] = useLocation();

  // Handle Hotelrunner locale redirects (e.g., /af-ZA from booking engine)
  useEffect(() => {
    const path = window.location.pathname;
    
    // Only run redirects for locale paths, not root or other paths
    if (path === '/' || path === '/index.html') {
      return;
    }
    
    // Currency is determined by IP detection in useLocale — do not include
    // ?currency= in redirect targets. URL currency params are never read by
    // the locale hook, so they only pollute history and shareable links.
    const localeRedirects = {
      '/af-ZA': '/?lang=af',
      '/en-GB': '/?lang=en',
      '/en-US': '/?lang=en-us',
      '/pt-PT': '/?lang=pt-PT',
      '/pt-BR': '/?lang=pt-BR',
      '/nl-NL': '/?lang=nl',
      '/fr-FR': '/?lang=fr',
      '/it-IT': '/?lang=it',
      '/de-DE': '/?lang=de',
      '/es-ES': '/?lang=es',
      '/sv-SE': '/?lang=sv',
      '/pl-PL': '/?lang=pl',
      '/ja-JP': '/?lang=ja',
      '/zh-CN': '/?lang=zh',
      '/ru-RU': '/?lang=ru',
      '/zu-ZA': '/?lang=zu',
      '/sw-TZ': '/?lang=sw',
    };

    if (localeRedirects[path]) {
      window.location.replace(localeRedirects[path]);
    }
  }, []);

  // Layout recalculation using ResizeObserver (avoids forced reflows during interactions)
  // Note: Initial values set in <head> to prevent CLS, this only handles actual size changes
  useEffect(() => {
    const topbar = document.querySelector(".topbar");
    const header = document.querySelector("header");
    if (!topbar || !header) return;

    // Cache previous values to avoid redundant CSS variable updates
    let cachedTopbarH = 0;
    let cachedHeaderH = 0;
    let cachedStack = 0;

    const updateStackHeight = () => {
      // Read computed sizes (ResizeObserver already triggered layout)
      const topbarH = topbar.offsetHeight;
      const headerH = header.offsetHeight;
      const stack = topbarH + headerH;

      // Short-circuit if values haven't changed (prevents DOM writes during interactions)
      if (topbarH === cachedTopbarH && headerH === cachedHeaderH && stack === cachedStack) {
        return;
      }

      // Update cache
      cachedTopbarH = topbarH;
      cachedHeaderH = headerH;
      cachedStack = stack;

      // Schedule CSS variable updates for next frame (async, non-blocking)
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--stack-h", `${stack}px`);
        document.documentElement.style.setProperty("--topbar-h", `${topbarH}px`);
        document.documentElement.style.setProperty("--header-h", `${headerH}px`);
      });
    };

    // Use ResizeObserver to watch for size changes (more efficient than resize events)
    const observer = new ResizeObserver(() => {
      // Defer measurement until browser has settled layout (with Safari-safe idle callback detection)
      const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
      schedule(updateStackHeight);
    });

    observer.observe(topbar);
    observer.observe(header);

    // Initial measurement (deferred to idle so it doesn't force a layout
    // during React's first commit on the critical render path)
    const scheduleInitial = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
    scheduleInitial(updateStackHeight);

    return () => observer.disconnect();
    // Re-run on route change so the observer re-initializes when the global
    // header re-appears (it is hidden on /book-direct). Without this, a deep
    // link to /book-direct → home could leave --stack-h on stale defaults.
  }, [location]);

  // Eagerly preload primary navigation route chunks at app mount so that cold
  // Story ↔ Food navigation never suspends. With these modules cached before
  // any user interaction, startTransition can swap routes instantly rather than
  // waiting for a network fetch — eliminating the blank body beneath the header.
  useEffect(() => {
    import('./components/StoryPage').catch(() => {});
    import('./components/MealsPage').catch(() => {});
  }, []);

  // --- Back/forward: clear data-nav-type marker (animation suppression) ---
  // The @keyframes animation was removed so this listener is now a no-op visually,
  // but the marker is kept so the CSS rule can be reinstated cheaply if needed.
  useEffect(() => {
    const handler = () => {
      document.documentElement.dataset.navType = 'popstate';
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Clear the marker after each location change (runs after the new route paints).
  // Also move keyboard focus to the new page's H1 so screen-reader and keyboard
  // users land on the right content without having to Tab through the header.
  useEffect(() => {
    // Clear back/forward marker set by the popstate listener above.
    delete document.documentElement.dataset.navType;

    // Focus management — skip homepage (hero manages its own focus) and
    // skip on the very first render (location hasn't changed yet).
    if (location === '/') return;

    // Two rAF frames: let React commit and the browser paint before we probe
    // the new H1, otherwise we may grab the departing route's H1.
    // The cleanup cancels both frames so a rapid location change (or unmount)
    // between frames cannot call focus() on a detached element.
    let cancelled = false;
    let outerRafId;
    let innerRafId;

    outerRafId = requestAnimationFrame(() => {
      innerRafId = requestAnimationFrame(() => {
        if (cancelled) return;
        const h1 = document.querySelector('main h1, h1');
        if (!h1) return;
        if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
        // preventScroll: preserve the scroll position restored by the browser
        // for back/forward; for forward navigation, scroll to top is expected.
        h1.focus({ preventScroll: true });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRafId);
      cancelAnimationFrame(innerRafId);
    };
  }, [location]);

  // Handle hash navigation on route changes (immediate, with retry until element exists)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (location !== '/') return;

    // Ensure hero placeholder stays hidden when navigating back to homepage.
    // Double-rAF: give React's LCP <picture> (slide 0, decoding="async") two
    // paint frames to finish decoding before we pull the placeholder. Without
    // this, there can be a 1-frame gap where the placeholder is gone but the
    // hero image hasn't been composited yet, briefly revealing the brand
    // fallback bg-[#9e4b13] between the placeholder photo and the React photo.
    const heroPlaceholder = document.getElementById('hero-placeholder');
    if (heroPlaceholder && (safeSessionStorage.getItem('devocean-hero-seen') || safeLocalStorage.getItem('devocean-hero-seen'))) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heroPlaceholder.style.display = 'none';
          document.documentElement.classList.remove('hero-active');
        });
      });
    }

    if (!hash) return;

    // Retry scroll until element is found (max 20 attempts over 1 second)
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryScroll = () => {
      // Re-read the live hash on every attempt. If the user navigated to '/'
      // without an anchor (e.g. clicked Back after visiting /#stay), the hash
      // is now empty and we must not scroll to the stale captured target.
      if (window.location.hash.slice(1) !== hash) return;

      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      }
    };
    
    // Start trying immediately
    requestAnimationFrame(tryScroll);
  }, [location]);

  // Memoize expensive computations to reduce re-renders
  const bookUrl = useMemo(() => 
    buildBookingUrl(bookingLocale, currency, countryCode, CC_TO_CURRENCY),
    [bookingLocale, currency, countryCode]
  );
  
  // Include 'ui' in dependencies to recompute after translations load (prevents race condition)
  const units = useMemo(() => localizeUnits(lang), [lang, ui]);
  const experiences = useMemo(() => localizeExperiences(lang), [lang, ui]);

  // Update meta title/description for homepage based on language (SEO).
  // useSeoPage skips the update when description is null/undefined (non-home routes).
  const isHomePage = location === '/' || location.startsWith('/?');
  const homeDesc = isHomePage ? getHomeDescription(lang) : null;
  const homeTitle = isHomePage ? getHomeTitle(lang) : null;
  useSeoPage({
    title: homeTitle || undefined,
    description: homeDesc,
    ogTitle: homeTitle || undefined,
    ogDescription: homeDesc || undefined,
    ogImage: isHomePage ? 'https://devoceanlodge.com/photos/hero01.jpg' : undefined,
    twitterTitle: homeTitle || undefined,
    twitterDescription: homeDesc || undefined,
    twitterImage: isHomePage ? 'https://devoceanlodge.com/photos/hero01.jpg' : undefined,
  });

  // WebMCP — expose site tools to AI agents via the browser (progressive enhancement)
  // navigator.modelContext is experimental; this is a no-op in unsupporting browsers.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.modelContext?.provideContext) return;
    navigator.modelContext.provideContext({
      tools: [
        {
          name: 'checkAvailability',
          description: 'Check live room availability and nightly pricing at DEVOCEAN Lodge, Ponta do Ouro, Mozambique for a given date range. Returns available rooms with prices in USD.',
          inputSchema: {
            type: 'object',
            properties: {
              checkIn:  { type: 'string', description: 'Check-in date (YYYY-MM-DD)' },
              checkOut: { type: 'string', description: 'Check-out date (YYYY-MM-DD)' }
            },
            required: ['checkIn', 'checkOut']
          },
          execute: async ({ checkIn, checkOut }) => {
            const res = await fetch(`/api/booking/availability?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`);
            return res.json();
          }
        },
        {
          name: 'convertCurrency',
          description: 'Convert an amount from one currency to another using live exchange rates. Useful for displaying lodge pricing in the guest\'s local currency.',
          inputSchema: {
            type: 'object',
            properties: {
              from:   { type: 'string', description: 'Source currency code, e.g. USD' },
              to:     { type: 'string', description: 'Target currency code, e.g. ZAR, EUR, GBP' },
              amount: { type: 'number', description: 'Amount to convert' }
            },
            required: ['from', 'to', 'amount']
          },
          execute: async ({ from, to, amount }) => {
            const res = await fetch(`/api/fx?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`);
            return res.json();
          }
        }
      ]
    });
  }, []);

  return (
    <Router hook={useTransitionLocation}>
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with topbar (fixed via CSS) - uses full UI if loaded, otherwise critical. */}
      <Header
        ui={ui || criticalUI}
        lang={lang}
        currency={currency}
        region={region}
        onLangChange={setLang}
        onRegionChange={setRegion}
        bookUrl={bookUrl}
      />

      {/* Outer Suspense: first-visit chunk loads only (in-app navigation stays on old route via startTransition) */}
      <Suspense fallback={
        <div className="flex-1 min-h-[50vh] bg-slate-50" />
      }>
      {/* key=location remounts this div on every pathname change, restarting the
          CSS fade-in animation. Combined with startTransition (old route stays
          visible during chunk download), this ensures no blank or unstyled frame
          is ever shown between pages. */}
      <div key={location} className="route-fade-in">
      <Switch>
        {/* Our Story page */}
        <Route path="/story">
          <StoryPage lang={lang} bookUrl={bookUrl} />
        </Route>

        {/* Meals & Dining page */}
        <Route path="/devocean-lodge-meals">
          <MealsPage lang={lang} bookUrl={bookUrl} />
        </Route>
        <Route path="/ponta-do-ouro">
          <PontaDoOuroPage lang={lang} bookUrl={bookUrl} />
        </Route>
        <Route path="/getting-to-ponta-do-ouro">
          <GettingTherePage lang={lang} bookUrl={bookUrl} />
        </Route>
        <Route path="/ponta-do-ouro-without-4x4">
          <WithoutFourByFourPage lang={lang} bookUrl={bookUrl} />
        </Route>
        <Route path="/ponta-do-ouro-accommodation">
          <AccommodationPage bookUrl={bookUrl} />
        </Route>
        <Route path="/safari-tents-ponta-do-ouro">
          <SafariTentsPage bookUrl={bookUrl} />
        </Route>
        <Route path="/diving-dolphin-accommodation">
          <DivingDolphinsPage bookUrl={bookUrl} />
        </Route>

        {/* Admin panel (not linked from navigation - staff only) */}
        <Route path="/admin">
          <AdminPage />
        </Route>

        {/* Native direct booking flow */}
        <Route path="/book-direct">
          <BookDirectPage lang={lang} countryCode={countryCode} ui={ui || criticalUI} currency={currency} region={region} onLangChange={setLang} onRegionChange={setRegion} onCurrencyChange={setCurrency} />
        </Route>

        {/* Stripe redirect target — booking confirmation / result */}
        <Route path="/booking-confirmed">
          <BookingConfirmedPage lang={lang} />
        </Route>

        {/* Gift voucher purchase flow */}
        <Route path="/gift-vouchers">
          <GiftVouchersPage lang={lang} />
        </Route>

        {/* Gift voucher Stripe redirect target */}
        <Route path="/gift-confirmed">
          <GiftConfirmedPage lang={lang} />
        </Route>

        {/* Route for Why Ponta do Ouro destination page */}
        <Route path="/why-ponta">
          <WhyPontaPage
            units={units}
            experiences={experiences}
            ui={ui || criticalUI}
            lang={lang}
            currency={currency}
            bookUrl={bookUrl}
          />
        </Route>

        {/* Route for experience detail pages */}
        <Route path="/experiences/:key">
          <ExperienceDetailPage
            units={units}
            experiences={experiences}
            ui={ui || criticalUI}
            lang={lang}
            currency={currency}
            bookUrl={bookUrl}
          />
        </Route>

        {/* Route for homepage */}
        <Route path="/">
          {/* Hero - always render immediately for LCP optimization */}
          <HeroSection images={HERO_IMAGES} ui={ui || criticalUI} bookUrl={bookUrl} lang={lang} currency={currency} />
          
          {/* Below-fold content - render immediately with criticalUI fallback, upgrade when full translations arrive */}
          <AccommodationsSection units={units} ui={ui || criticalUI} bookUrl={bookUrl} lang={lang} currency={currency} />
          <ExperiencesSection experiences={experiences} ui={ui || criticalUI} lang={lang} />

          {/* Lazy load below-the-fold sections for better INP performance */}
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <GallerySection ui={ui || criticalUI} />
            <LocationSection ui={ui || criticalUI} />
            <ContactSection
              ui={ui || criticalUI}
              lang={lang}
              currency={currency}
              bookUrl={bookUrl}
              dateLocale={dateLocale}
            />
            <Footer units={units} experiences={experiences} ui={ui || criticalUI} lang={lang} />
          </Suspense>
        </Route>
      </Switch>
      </div>
      </Suspense>
    </div>
    </Router>
  );
}
