import { useEffect, useMemo, lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useLocale, CC_TO_CURRENCY } from './i18n/useLocale';
import { localizeUnits, localizeExperiences, buildBookingUrl } from './utils/localize';
import { HERO_IMAGES } from './data/content';
import { throttle } from './utils/debounce';

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
    const storedCurrency = localStorage.getItem('site.currency');
    const storedLang = localStorage.getItem('site.lang');
    
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

  // Measure actual header for accurate scroll positioning (without causing CLS)
  // Note: --stack-h stays conservative (120px) to prevent CLS, --stack-h-active is accurate
  useEffect(() => {
    let observer = null;
    
    const measureScrollOffset = () => {
      const topbar = document.querySelector(".topbar");
      const header = document.querySelector("header");
      if (!topbar || !header) return;
      
      // Batch all reads together to minimize forced reflow
      const actualHeight = topbar.offsetHeight + header.offsetHeight;
      
      // ONLY update --stack-h-active (for scroll-margin-top)
      // DO NOT update --stack-h (conservative value prevents CLS)
      document.documentElement.style.setProperty("--stack-h-active", `${actualHeight}px`);
    };

    // Measure once after initial render
    requestAnimationFrame(() => {
      measureScrollOffset();
      
      // Keep synced when header size changes (translation hydration, locale switch, font load)
      const topbar = document.querySelector(".topbar");
      const header = document.querySelector("header");
      
      if (topbar && header) {
        observer = new ResizeObserver(measureScrollOffset);
        observer.observe(topbar);
        observer.observe(header);
      }
    });

    // Also update on window resize
    const throttledMeasure = throttle(measureScrollOffset, 200);
    window.addEventListener("resize", throttledMeasure, { passive: true });
    
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", throttledMeasure);
    };
  }, []);

  // Handle hash navigation on route changes (immediate, with retry until element exists)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (location !== '/') return;

    // Ensure hero placeholder stays hidden when navigating back to homepage
    const heroPlaceholder = document.getElementById('hero-placeholder');
    if (heroPlaceholder && (sessionStorage.getItem('devocean-hero-seen') || localStorage.getItem('devocean-hero-seen'))) {
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
    <div className="min-h-screen flex flex-col">
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

      {/* Main content - offset by fixed header */}
      <main className="pt-[var(--stack-h)]">
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
                <Footer units={units} experiences={experiences} ui={ui} />
              </Suspense>
            </>
          )}
        </Route>
        </Switch>
      </main>
    </div>
  );
}
