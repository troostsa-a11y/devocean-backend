import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Star, Anchor } from 'lucide-react';
import LazyImage from './LazyImage';
import { trackBookingSession } from '../utils/analytics';

export default function HeroSection({ images = [], ui, bookUrl, lang, currency }) {
  // mountedIndices is React state because it controls DOM mount/unmount of slides.
  // idx is a ref — carousel ticks mutate DOM opacity directly, bypassing React
  // re-render entirely. This prevents the 6-second setState cycle from occupying
  // the main thread and causing INP spikes when a user interacts mid-tick.
  const [mountedIndices, setMountedIndices] = useState(() => new Set([0]));
  const idxRef = useRef(0);
  // DOM refs for each slide wrapper — used for direct opacity mutation
  const slideEls = useRef([]);
  // Mirrors mountedIndices as a ref so setInterval can read it without needing
  // it as an effect dependency (which would restart the timer on every mount).
  const mountedRef = useRef(new Set([0]));
  const trustindexRef = useRef(null);
  const resolvedRef = useRef(new Set([0]));
  const stallTicksRef = useRef(0);

  const list = Array.isArray(images) ? images.filter(Boolean) : [];

  const buildUrl = (path, hash = '') => {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    if (currency) params.set('currency', currency);
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}${hash}` : `${path}${hash}`;
  };

  // Helper: mount new slide indices only when genuinely adding — guards prevent
  // setMountedIndices from being called (and triggering a re-render) when the
  // indices are already mounted.
  const ensureMounted = (indices) => {
    const toAdd = indices.filter(i => !mountedRef.current.has(i));
    if (toAdd.length === 0) return;
    toAdd.forEach(i => mountedRef.current.add(i));
    setMountedIndices(new Set(mountedRef.current));
  };

  useEffect(() => {
    if (list.length <= 1) return;

    // Mount slide 1 after 3s so it has time to load before the first 6s transition
    const preload = setTimeout(() => ensureMounted([1]), 3000);

    const id = setInterval(() => {
      const prev = idxRef.current;
      const next = (prev + 1) % list.length;

      // Hold on current slide if the next image hasn't loaded yet (up to 2 ticks)
      if (!resolvedRef.current.has(next) && stallTicksRef.current < 2) {
        stallTicksRef.current += 1;
        const retryUpcoming = (next + 1) % list.length;
        ensureMounted([next, retryUpcoming]);
        return;
      }

      stallTicksRef.current = 0;
      const upcoming = (next + 1) % list.length;
      ensureMounted([upcoming]);

      // Advance — direct DOM mutation, no React state change, no re-render
      idxRef.current = next;
      if (slideEls.current[prev]) slideEls.current[prev].style.opacity = '0';
      if (slideEls.current[next]) slideEls.current[next].style.opacity = '1';
    }, 6000);

    return () => { clearTimeout(preload); clearInterval(id); };
  }, [list.length]);

  // Lazy load Trustindex widget using IntersectionObserver (avoids blocking INP)
  useEffect(() => {
    if (!trustindexRef.current) return;

    const loadTrustindex = () => {
      if (trustindexRef.current && !trustindexRef.current.querySelector('script')) {
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

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadTrustindex();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(trustindexRef.current);
      return () => observer.disconnect();
    } else {
      setTimeout(loadTrustindex, 1000);
    }
  }, []);

  // Manual navigation — also uses direct DOM mutation
  const go = (i) => {
    if (!list.length) return;
    const target = ((i % list.length) + list.length) % list.length;
    const prev = idxRef.current;
    if (prev === target) return;
    idxRef.current = target;
    if (slideEls.current[prev]) slideEls.current[prev].style.opacity = '0';
    if (slideEls.current[target]) slideEls.current[target].style.opacity = '1';
  };

  return (
    <section id="home" className="relative overflow-hidden min-h-screen">
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
              ref={el => { slideEls.current[i] = el; }}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === idxRef.current ? 1 : 0 }}
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
                  onLoadComplete={() => resolvedRef.current.add(i)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-white w-full pb-6 sm:pb-24 pt-[calc(var(--header-h)_-_1rem)] sm:pt-[calc(var(--header-h)_+_4rem)]">
        <h1 className="mt-14 font-bold max-w-3xl leading-tight hidden sm:block [@media_(max-height:700px)_and_(min-width:640px)]:hidden" style={{ fontSize: 'var(--hero-h1-size, clamp(3.5rem, 14vw, 3.75rem))' }}>{ui.hero.title}</h1>
        <p className="mt-[6rem] [@media_(max-width:639.98px)_and_(max-height:700px)]:mt-[5rem] [@media_(max-width:639.98px)_and_(max-height:700px)]:text-base sm:mt-4 text-xl max-w-[54.5rem] [@media_(min-width:768px)_and_(max-width:1279.98px)]:max-w-[31.5rem] text-white font-semibold">{ui.hero.subtitle}</p>
        
        {/* CTA Buttons */}
        <div className="mt-[58px] [@media_(max-width:639.98px)_and_(max-height:700px)]:mt-[28px] sm:mt-[66px] [@media_(max-height:700px)_and_(min-width:640px)]:mt-[20px]">
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 [@media_(max-width:639.98px)_and_(max-height:700px)]:gap-y-3 max-w-[25rem] sm:max-w-[28rem]">
            {/* Why Ponta do Ouro - Destination Page */}
            <Link
              href={buildUrl('/why-ponta')}
              className="group w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center font-bold text-base [@media_(max-width:639.98px)_and_(max-height:700px)]:text-sm flex items-center justify-center gap-2"
              data-testid="link-why-ponta"
            >
              <span className="sm:whitespace-nowrap">{ui.hero.villageHighlights || "Village Highlights"}</span>
            </Link>

            {/* Go Diving */}
            <Link
              href={buildUrl('/experiences/diving')}
              className="group w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center font-bold text-base [@media_(max-width:639.98px)_and_(max-height:700px)]:text-sm flex items-center justify-center gap-2"
              data-testid="link-go-diving"
            >
              <Anchor className="w-4 h-4 shrink-0" />
              <span className="sm:whitespace-nowrap">{ui.hero.goDiving || "Go Diving"}</span>
            </Link>

            {/* Explore Lodge */}
            <a
              href="#stay"
              className="group btn-secondary w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl border-2 border-white bg-white/15 backdrop-blur-sm text-white shadow-xl transition-all duration-300 text-center font-bold text-base [@media_(max-width:639.98px)_and_(max-height:700px)]:text-sm flex items-center justify-center gap-2"
              aria-label={ui.hero.ctaSecondary}
              data-testid="button-explore-lodge"
            >
              <span className="sm:whitespace-nowrap">{ui.hero.ctaSecondary}</span>
            </a>

            {/* Book Now */}
            <a
              href={bookUrl}
              className="group btn-cta w-full sm:w-auto sm:min-w-[13rem] px-5 [@media_(max-width:639.98px)_and_(max-height:700px)]:px-3 py-3 [@media_(max-width:639.98px)_and_(max-height:700px)]:py-2 rounded-2xl bg-gradient-to-r from-[#b65a1a] to-[#9e4b13] text-white shadow-2xl hover:shadow-[0_10px_40px_rgba(158,75,19,0.6)] transform hover:scale-105 transition-all duration-300 text-center font-bold text-base [@media_(max-width:639.98px)_and_(max-height:700px)]:text-sm flex items-center justify-center gap-2 border-2 border-white/20"
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

      {/* Stars, badge and Trustindex widget. In-flow (static) by default, so it
          always sits directly below the CTA grid's actual rendered height —
          it can never overlap the buttons regardless of viewport height,
          button-label wrapping, or translation string length. (Previously
          `absolute bottom-*` anchored to the section, hand-tuned per device
          height band — that broke on any real viewport outside the tuned
          bands, per Clarity recordings.) Only switches to the original
          absolute-bottom-pinned desktop placement when BOTH width >= 640px
          AND height > 700px — matching the `max-height:700px` threshold used
          elsewhere in this file (h1 hide, CTA margin). Raised from 600 to 700
          after a Clarity recording at ~1323x624 showed the h1 still visible
          (hidden only below 600) while this block had already switched to
          absolute-bottom, overlapping the CTA grid — the two thresholds must
          stay in lockstep. Plain `sm:` (width-only) would wrongly route
          landscape phones (e.g. 667x375, 932x430 — width >= 640px but just as
          short as a portrait phone) into the desktop path and reintroduce
          the bug. */}
      <div className="relative [@media_(min-width:640px)_and_(min-height:701px)]:absolute mt-6 [@media_(min-width:640px)_and_(min-height:701px)]:mt-0 [@media_(min-width:640px)_and_(min-height:701px)]:bottom-10 [@media_(min-width:640px)_and_(min-height:701px)]:left-0 [@media_(min-width:640px)_and_(min-height:701px)]:right-0 z-10 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 text-yellow-300">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <div className="text-white/90 text-sm sm:text-base mt-1">{ui.hero.badge}</div>
        <div className="text-white/60 text-xs mt-0.5">Click the reviews!</div>
        {/* min-h reserves space for the async-loaded Trustindex badge so it
            doesn't shift content when the script mounts (CLS guard). */}
        <div ref={trustindexRef} className="mt-3 sm:min-h-[90px]" />
      </div>

    </section>
  );
}
