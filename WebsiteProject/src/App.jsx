import { useEffect } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { useLocale } from './i18n/useLocale';
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
  const { lang, currency, setLang, setCurrency, ui, loading, bookingLocale, dateLocale } = useLocale();

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

  const bookUrl = buildBookingUrl(bookingLocale, currency);
  const units = localizeUnits(lang);
  const experiences = localizeExperiences(lang);

  // Show loading state while translations load
  if (loading || !ui) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e4b13] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col">
        {/* Header with topbar (fixed via CSS) */}
        <Header
          ui={ui}
          lang={lang}
          currency={currency}
          onLangChange={setLang}
          onCurrencyChange={setCurrency}
          bookUrl={bookUrl}
        />

        {/* Page content */}
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
      </div>
    </LazyMotion>
  );
}
