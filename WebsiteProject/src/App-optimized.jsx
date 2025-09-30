import { useEffect } from 'react';
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
  const { lang, currency, setLang, setCurrency, ui, bookingLocale, dateLocale } = useLocale();

  // Layout recalculation for sticky header
  useEffect(() => {
    const recalc = () => {
      const topbar = document.querySelector(".topbar");
      const header = document.querySelector("header");
      const stack = (topbar?.offsetHeight || 0) + (header?.offsetHeight || 0);
      document.documentElement.style.setProperty("--stack-h", `${stack}px`);
    };

    recalc();
    window.addEventListener("resize", recalc, { passive: true });
    return () => window.removeEventListener("resize", recalc);
  }, []);

  const bookUrl = buildBookingUrl(bookingLocale, currency);
  const units = localizeUnits(lang);
  const experiences = localizeExperiences(lang);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed stack: topbar + header */}
      <div className="sticky top-0 z-50">
        <Header
          ui={ui}
          lang={lang}
          currency={currency}
          onLangChange={setLang}
          onCurrencyChange={setCurrency}
          bookUrl={bookUrl}
        />
      </div>

      {/* Page content */}
      <HeroSection images={HERO_IMAGES} ui={ui} bookUrl={bookUrl} />
      <AccommodationsSection units={units} ui={ui} bookUrl={bookUrl} />
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
  );
}
