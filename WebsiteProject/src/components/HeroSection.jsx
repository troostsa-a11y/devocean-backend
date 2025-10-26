import { useState, useEffect } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import LazyImage from './LazyImage';

export default function HeroSection({ images = [], ui, bookUrl, lang, currency }) {
  const [idx, setIdx] = useState(0);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setIdx(i => (i + 1) % list.length), 6000);
    return () => clearInterval(id);
  }, [list.length]);

  const go = (i) =>
    list.length ? setIdx(((i % list.length) + list.length) % list.length) : null;

  return (
    <section id="home" className="relative overflow-hidden min-h-screen flex items-center">
      {/* Brand fallback */}
      <div className="absolute inset-0 bg-[#9e4b13]" />

      {/* Slides */}
      <div className="absolute inset-0">
        {list.map((img, i) => {
          const src = typeof img === 'string' ? img : img.desktop;
          const srcMobile = typeof img === 'object' ? img.mobile : undefined;
          const srcWebP = typeof img === 'object' ? img.desktopWebP : undefined;
          const srcMobileWebP = typeof img === 'object' ? img.mobileWebP : undefined;
          return (
            <LazyImage
              key={src}
              src={src}
              srcMobile={srcMobile}
              srcWebP={srcWebP}
              srcMobileWebP={srcMobileWebP}
              alt={`Hero slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ opacity: i === idx ? 1 : 0 }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          );
        })}
      </div>

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-white w-full" style={{ paddingTop: 'calc(var(--stack-h) + 4rem)', paddingBottom: '6rem' }}>
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">{ui.hero.title}</h1>
        <p className="mt-4 md:text-xl max-w-2xl">{ui.hero.subtitle}</p>
        
        {/* Enhanced CTA Buttons with visual prominence */}
        <div className="mt-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Primary CTA - Explore Lodge */}
            <a
              href="#stay"
              className="group btn-secondary w-full sm:w-auto px-7 py-4 rounded-2xl border-2 border-white bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center font-bold text-lg flex items-center justify-center gap-3"
              aria-label={ui.hero.ctaSecondary}
            >
              <span>{ui.hero.ctaSecondary}</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
            </a>
            
            {/* Secondary CTA - Book Now */}
            <a
              href={bookUrl}
              target="_blank"
              rel="noreferrer"
              className="group btn-cta w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-[#b65a1a] to-[#9e4b13] text-white shadow-2xl hover:shadow-[0_10px_40px_rgba(158,75,19,0.6)] transform hover:scale-105 transition-all duration-300 text-center font-bold text-lg flex items-center justify-center gap-3 border-2 border-white/20"
              onClick={() => {
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'reservation_complete',
                    button_location: 'hero_section',
                    language: lang,
                    currency: currency
                  });
                }
              }}
            >
              <span>{ui.hero.ctaPrimary}</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-10 flex items-center gap-1 text-yellow-300">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          <span className="ml-2 text-white/90 text-sm sm:text-base">{ui.hero.badge}</span>
        </div>
      </div>

      {/* Controls */}
      {list.length > 1 && (
        <>
          <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => go(idx - 1)}
            className="absolute z-20 left-3 bottom-3 px-3 py-1.5 rounded-full bg-black/30 text-white text-sm"
            aria-label="Previous slide"
          >‹</button>
          <button
            onClick={() => go(idx + 1)}
            className="absolute z-20 right-3 bottom-3 px-3 py-1.5 rounded-full bg-black/30 text-white text-sm"
            aria-label="Next slide"
          >›</button>
        </>
      )}
    </section>
  );
}
