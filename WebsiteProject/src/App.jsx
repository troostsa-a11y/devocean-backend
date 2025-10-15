import { useEffect } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useLocale, CC_TO_CURRENCY } from './i18n/useLocale';
import { localizeUnits, localizeExperiences, buildBookingUrl } from './utils/localize';
import { HERO_IMAGES } from './data/content';

// Components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AccommodationsSection from './components/AccommodationsSection';
import ExperiencesSection from './components/ExperiencesSection';
import TodoSection from './components/TodoSection';
import GallerySection from './components/GallerySection';
import LocationSection from './components/LocationSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  const { lang, currency, region, setLang, setCurrency, setRegion, ui, criticalUI, loading, bookingLocale, dateLocale, countryCode } = useLocale();

  // Layout recalculation for sticky header
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
    
    window.addEventListener("resize", recalc, { passive: true });
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const bookUrl = buildBookingUrl(bookingLocale, currency, countryCode, CC_TO_CURRENCY);
  const units = localizeUnits(lang);
  const experiences = localizeExperiences(lang);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col">
        {/* Header with topbar (fixed via CSS) - uses full UI if loaded, otherwise critical */}
        <Header
          ui={ui || criticalUI}
          lang={lang}
          currency={currency}
          region={region}
          onLangChange={setLang}
          onCurrencyChange={setCurrency}
          onRegionChange={setRegion}
          bookUrl={bookUrl}
        />

        {/* Page content - wait for full translations */}
        {loading || !ui ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e4b13] mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            <HeroSection images={HERO_IMAGES} ui={ui} bookUrl={bookUrl} lang={lang} currency={currency} />
        <AccommodationsSection units={units} ui={ui} bookUrl={bookUrl} lang={lang} currency={currency} />
        <ExperiencesSection experiences={experiences} ui={ui} />
        <TodoSection ui={ui} />
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
          </>
        )}
      </div>
    </LazyMotion>
  );
}
