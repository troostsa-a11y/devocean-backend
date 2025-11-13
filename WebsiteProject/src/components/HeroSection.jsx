import { useState, useEffect, useRef } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import LazyImage from './LazyImage';

export default function HeroSection({ images = [], ui, bookUrl, lang, currency }) {
  const [idx, setIdx] = useState(0);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  const trustindexRef = useRef(null);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setIdx(i => (i + 1) % list.length), 6000);
    return () => clearInterval(id);
  }, [list.length]);

  // Load Trustindex widget
  useEffect(() => {
    if (trustindexRef.current && !trustindexRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.trustindex.io/loader.js?c8556c556ccd96056816d94c005';
      script.defer = true;
      script.async = true;
      trustindexRef.current.appendChild(script);
    }
  }, []);

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
          const isFirst = i === 0;
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
              loading={isFirst ? "eager" : "lazy"}
              fetchpriority={isFirst ? "high" : undefined}
              width={1920}
              height={1080}
              aspectRatio="16/9"
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
        
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center gap-1 text-yellow-300">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <div className="text-white/90 text-sm sm:text-base mt-1">{ui.hero.badge}</div>
        </div>

        {/* Trustindex Review Widget - Reserve space to prevent CLS */}
        <div ref={trustindexRef} className="mt-6"></div>
      </div>

    </section>
  );
}
