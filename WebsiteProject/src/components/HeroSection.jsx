import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import LazyImage from './LazyImage';

export default function HeroSection({ images = [], ui, bookUrl }) {
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
    <section id="home" className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Brand fallback */}
      <div className="absolute inset-0 bg-[#9e4b13]" />

      {/* Slides */}
      <div className="absolute inset-0">
        {list.map((src, i) => (
          <LazyImage
            key={src}
            src={src}
            alt={`Hero slide ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: i === idx ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 md:py-40 text-white w-full">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">{ui.hero.title}</h1>
        <p className="mt-4 md:text-xl max-w-2xl">{ui.hero.subtitle}</p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={bookUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-cta w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#9e4b13] text-white shadow hover:shadow-lg text-center"
          >
            {ui.hero.ctaPrimary}
          </a>
          <a
            href="#stay"
            className="btn-secondary w-full sm:w-auto px-5 py-3 rounded-2xl border border-white/60 bg-white/10 text-white hover:bg-white/20 text-center"
            aria-label={ui.hero.ctaSecondary}
          >
            {ui.hero.ctaSecondary}
          </a>
        </div>
        <div className="mt-6 sm:mt-10 flex items-center gap-1 text-yellow-300">
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
