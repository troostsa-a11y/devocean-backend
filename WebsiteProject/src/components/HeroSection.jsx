import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Star, Anchor } from 'lucide-react';
import LazyImage from './LazyImage';
import { trackBookingSession } from '../utils/analytics';

export default function HeroSection({ images = [], ui, bookUrl, lang, currency }) {
  const [idx, setIdx] = useState(0);
  // Only mount images in the DOM when they're needed — all slides are full-screen
  // (absolute inset-0) so the browser treats them all as in-viewport, loading them
  // all at once. Controlling mount order limits initial downloads to just slide 0.
  const [mountedIndices, setMountedIndices] = useState(() => new Set([0]));
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  const trustindexRef = useRef(null);
  
  const buildUrl = (path, hash = '') => {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    if (currency) params.set('currency', currency);
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}${hash}` : `${path}${hash}`;
  };

  useEffect(() => {
    if (list.length <= 1) return;

    // Mount slide 1 after 3s so it has time to load before the first 6s transition
    const preload = setTimeout(() => {
      setMountedIndices(prev => new Set([...prev, 1]));
    }, 3000);

    const id = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % list.length;
        const upcoming = (next + 1) % list.length;
        // Mount the slide-after-next now — it has a full 6s interval to download
        setMountedIndices(m => new Set([...m, upcoming]));
        return next;
      });
    }, 6000);

    return () => { clearTimeout(preload); clearInterval(id); };
  }, [list.length]);

  // Lazy load Trustindex widget using IntersectionObserver (avoids blocking INP)
  useEffect(() => {
    if (!trustindexRef.current) return;

    const loadTrustindex = () => {
      if (trustindexRef.current && !trustindexRef.current.querySelector('script')) {
        // Use requestIdleCallback to avoid blocking interactions
        const loadScript = () => {
          const script = document.createElement('script');
          script.src = 'https://cdn.trustindex.io/loader.js?c8556c556ccd96056816d94c005';
          script.defer = true;
          script.async = true;
          trustindexRef.current.appendChild(script);
        };

        if (window.requestIdleCallback) {
          requestIdleCallback(loadScript, { timeout: 2000 });
        } else {
          setTimeout(loadScript, 0);
        }
      }
    };

    // Feature detection: use IntersectionObserver if available
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadTrustindex();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' } // Start loading 200px before widget is visible
      );

      observer.observe(trustindexRef.current);
      return () => observer.disconnect();
    } else {
      // Fallback for older browsers: load after delay
      setTimeout(loadTrustindex, 1000);
    }
  }, []);

  const go = (i) =>
    list.length ? setIdx(((i % list.length) + list.length) % list.length) : null;

  return (
    <section id="home" className="relative overflow-hidden min-h-screen flex items-start">
      {/* Brand fallback */}
      <div className="absolute inset-0 bg-[#9e4b13]" />

      {/* Slides — only mounted images are in the DOM to prevent mass-loading */}
      <div className="absolute inset-0">
        {list.map((img, i) => {
          const src = typeof img === 'string' ? img : img.desktop;
          const srcMobile = typeof img === 'object' ? img.mobile : undefined;
          const srcWebP = typeof img === 'object' ? img.desktopWebP : undefined;
          const srcMobileWebP = typeof img === 'object' ? img.mobileWebP : undefined;
          const isFirst = i === 0;
          return (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === idx ? 1 : 0 }}
            >
              {mountedIndices.has(i) && (
                <LazyImage
                  src={src}
                  srcMobile={srcMobile}
                  srcWebP={srcWebP}
                  srcMobileWebP={srcMobileWebP}
                  alt={`Hero slide ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover ${img.mobileObjectClass || 'object-center'}`}
                  loading={isFirst ? "eager" : "lazy"}
                  fetchpriority={isFirst ? "high" : undefined}
                  isLCP={isFirst}
                  width={1920}
                  height={1080}
                  aspectRatio="16/9"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-white w-full pb-52 sm:pb-24 pt-[calc(var(--header-h)_-_1rem)] sm:pt-[calc(var(--header-h)_+_4rem)]">
        <h1 className="mt-14 font-bold max-w-3xl leading-tight hidden sm:block [@media_(max-height:600px)_and_(min-width:640px)]:hidden" style={{ fontSize: 'var(--hero-h1-size, clamp(3.5rem, 14vw, 3.75rem))' }}>{ui.hero.title}</h1>
        <p className="mt-[8.5rem] [@media_(max-width:639.98px)_and_(max-height:700px)]:mt-[7rem] [@media_(max-width:639.98px)_and_(max-height:700px)]:text-base sm:mt-4 text-xl max-w-[54.5rem] [@media_(min-width:768px)_and_(max-width:1279.98px)]:max-w-[31.5rem] text-white font-semibold">{ui.hero.subtitle}</p>
        
        {/* CTA Buttons */}
        <div className="mt-[58px] [@media_(max-width:639.98px)_and_(max-height:700px)]:mt-[42px] sm:mt-[66px] [@media_(max-height:600px)_and_(min-width:640px)]:mt-[20px]">
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 [@media_(max-width:639.98px)_and_(max-height:700px)]:gap-y-3 max-w-[25rem] sm:max-w-[28rem]">
            {/* Why Ponta do Ouro - Destination Page */}
            <Link
              href={buildUrl('/why-ponta')}
              className="group w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center font-bold text-base flex items-center justify-center gap-2"
              data-testid="link-why-ponta"
            >
              <span className="sm:whitespace-nowrap">{ui.hero.villageHighlights || "Village Highlights"}</span>
            </Link>

            {/* Go Diving */}
            <Link
              href={buildUrl('/experiences/diving')}
              className="group w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center font-bold text-base flex items-center justify-center gap-2"
              data-testid="link-go-diving"
            >
              <Anchor className="w-4 h-4 shrink-0" />
              <span className="sm:whitespace-nowrap">{ui.hero.goDiving || "Go Diving"}</span>
            </Link>

            {/* Explore Lodge */}
            <a
              href="#stay"
              className="group btn-secondary w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl border-2 border-white bg-white/15 backdrop-blur-sm text-white shadow-xl transition-all duration-300 text-center font-bold text-base flex items-center justify-center gap-2"
              aria-label={ui.hero.ctaSecondary}
              data-testid="button-explore-lodge"
            >
              <span className="sm:whitespace-nowrap">{ui.hero.ctaSecondary}</span>
            </a>

            {/* Book Now */}
            <a
              href={bookUrl}
              target="_blank"
              rel="noreferrer"
              className="group btn-cta w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl bg-gradient-to-r from-[#b65a1a] to-[#9e4b13] text-white shadow-2xl hover:shadow-[0_10px_40px_rgba(158,75,19,0.6)] transform hover:scale-105 transition-all duration-300 text-center font-bold text-base flex items-center justify-center gap-2 border-2 border-white/20"
              onClick={() => {
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'reservation_initiated',
                    button_location: 'hero_section',
                    language: lang,
                    currency: currency
                  });
                }
                trackBookingSession(lang, currency);
              }}
            >
              <span className="sm:whitespace-nowrap">{ui.hero.ctaPrimary}</span>
            </a>
          </div>
        </div>
        
      </div>

      {/* Stars, badge and Trustindex widget — kept together at the bottom so
          "Click the reviews!" visually leads into the widget badge directly below.
          Absolutely positioned outside the flex container to avoid CLS. */}
      <div className="absolute bottom-20 sm:bottom-10 [@media_(max-width:639.98px)_and_(max-height:700px)]:bottom-[9rem] [@media_(max-width:639.98px)_and_(min-height:701px)_and_(max-height:800px)]:bottom-[3rem] left-0 right-0 z-10 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 text-yellow-300">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <div className="text-white/90 text-sm sm:text-base mt-1">{ui.hero.badge}</div>
        <div className="text-white/60 text-xs mt-0.5">Click the reviews!</div>
        <div ref={trustindexRef} className="mt-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:hidden" />
      </div>

    </section>
  );
}
