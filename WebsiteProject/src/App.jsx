import { useEffect, useMemo, lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
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

  // Layout recalculation for sticky header (throttled for performance)
  useEffect(() => {
    const recalc = () => {
      const topbar = document.querySelector(".topbar");
      const header = document.querySelector("header");
      if (!topbar || !header) return;
      
      const stack = topbar.offsetHeight + header.offsetHeight;
      document.documentElement.style.setProperty("--stack-h", `${stack}px`);
      document.documentElement.style.setProperty("--topbar-h", `${topbar.offsetHeight}px`);
    };

    // Run immediately and after delays to ensure proper calculation
    recalc();
    setTimeout(recalc, 100);
    setTimeout(recalc, 500);
    
    // Throttled resize handler to reduce main thread blocking
    const throttledRecalc = throttle(recalc, 200);
    window.addEventListener("resize", throttledRecalc, { passive: true });
    return () => window.removeEventListener("resize", throttledRecalc);
  }, []);

  // Handle initial hash navigation (e.g., when navigating from story.html to /#stay)
  useEffect(() => {
    if (!loading && ui && window.location.hash) {
      // Wait for React to finish rendering all sections
      setTimeout(() => {
        const hash = window.location.hash.slice(1);
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [loading, ui]);

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
    </div>
  );
}
