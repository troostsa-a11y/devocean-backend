import { useEffect, useMemo, lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useLocale, CC_TO_CURRENCY } from './i18n/useLocale';
import { localizeUnits, localizeExperiences, buildBookingUrl } from './utils/localize';
import { HERO_IMAGES } from './data/content';
import { throttle } from './utils/debounce';
import { safeLocalStorage, safeSessionStorage } from './utils/safeStorage';

// Critical above-the-fold components (loaded immediately)
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AccommodationsSection from './components/AccommodationsSection';
import ExperiencesSection from './components/ExperiencesSection';
import TodoSection from './components/TodoSection';
import ExperienceDetailPage from './components/ExperienceDetailPage';

// Below-the-fold components (lazy loaded for better INP)
const GallerySection = lazy(() => import('./components/GallerySection'));
const LocationSection = lazy(() => import('./components/LocationSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

export default function App() {
  const { lang, currency, region, setLang, setRegion, ui, criticalUI, loading, bookingLocale, dateLocale, countryCode } = useLocale();
  const [location] = useLocation();

  // Handle Hotelrunner locale redirects (e.g., /af-ZA from booking engine)
  useEffect(() => {
    const path = window.location.pathname;
    
    // Only run redirects for locale paths, not root or other paths
    if (path === '/' || path === '/index.html') {
      return;
    }
    
    // Check stored currency to preserve MZN for Mozambican Afrikaans speakers
    const storedCurrency = safeLocalStorage.getItem('site.currency');
    const storedLang = safeLocalStorage.getItem('site.lang');
    
    const localeRedirects = {
      '/af-ZA': storedCurrency === 'MZN' ? '/?lang=af&currency=MZN' : '/?lang=af&currency=ZAR', // Preserve currency (MZN or ZAR)
      '/en-GB': '/?lang=en&currency=GBP',
      '/en-US': '/?lang=en-us&currency=USD',
      '/pt-PT': '/?lang=pt-PT&currency=EUR',
      '/pt-BR': storedCurrency === 'MZN' ? '/?lang=pt-BR&currency=MZN' : '/?lang=pt-BR&currency=BRL', // Preserve MZN for Mozambique
      '/nl-NL': '/?lang=nl&currency=EUR',
      '/fr-FR': '/?lang=fr&currency=EUR',
      '/it-IT': '/?lang=it&currency=EUR',
      '/de-DE': '/?lang=de&currency=EUR',
      '/es-ES': '/?lang=es&currency=EUR',
      '/sv-SE': '/?lang=sv&currency=SEK',
      '/pl-PL': '/?lang=pl&currency=PLN',
      '/ja-JP': '/?lang=ja&currency=JPY',
      '/zh-CN': '/?lang=zh&currency=CNY',
      '/ru-RU': '/?lang=ru&currency=RUB',
      '/zu-ZA': '/?lang=zu&currency=ZAR',
      '/sw-TZ': '/?lang=sw&currency=TZS',
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

    // Initial measurement
    updateStackHeight();

    return () => observer.disconnect();
  }, []);

  // Handle hash navigation on route changes (immediate, with retry until element exists)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (location !== '/') return;

    // Ensure hero placeholder stays hidden when navigating back to homepage
    const heroPlaceholder = document.getElementById('hero-placeholder');
    if (heroPlaceholder && (safeSessionStorage.getItem('devocean-hero-seen') || safeLocalStorage.getItem('devocean-hero-seen'))) {
      heroPlaceholder.style.display = 'none';
      document.documentElement.classList.remove('hero-active');
    }

    if (!hash) return;

    // Retry scroll until element is found (max 20 attempts over 1 second)
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryScroll = () => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      }
      return false;
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with topbar (fixed via CSS) - uses full UI if loaded, otherwise critical */}
      <Header
        ui={ui || criticalUI}
        lang={lang}
        currency={currency}
        region={region}
        onLangChange={setLang}
        onRegionChange={setRegion}
        bookUrl={bookUrl}
      />

      <Switch>
        {/* Route for experience detail pages */}
        <Route path="/experiences/:key">
          {loading || !ui ? (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e4b13] mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading...</p>
              </div>
            </div>
          ) : (
            <ExperienceDetailPage
              units={units}
              experiences={experiences}
              ui={ui}
              lang={lang}
              currency={currency}
              bookUrl={bookUrl}
            />
          )}
        </Route>

        {/* Route for homepage */}
        <Route path="/">
          {/* Hero - always render immediately for LCP optimization */}
          <HeroSection images={HERO_IMAGES} ui={ui || criticalUI} bookUrl={bookUrl} lang={lang} currency={currency} />
          
          {/* Below-fold content - wait for full translations */}
          {loading || !ui ? (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e4b13] mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              <AccommodationsSection units={units} ui={ui} bookUrl={bookUrl} lang={lang} currency={currency} />
              <ExperiencesSection experiences={experiences} ui={ui} />
              <TodoSection ui={ui} />
              
              {/* Lazy load below-the-fold sections for better INP performance */}
              <Suspense fallback={<div className="min-h-[200px]" />}>
                <GallerySection ui={ui} />
                <LocationSection ui={ui} />
                <ContactSection
                  ui={ui}
                  lang={lang}
                  currency={currency}
                  bookUrl={bookUrl}
                  dateLocale={dateLocale}
                />
                <Footer units={units} experiences={experiences} ui={ui} lang={lang} />
              </Suspense>
            </>
          )}
        </Route>
      </Switch>
    </div>
  );
}
