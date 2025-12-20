import { useState, useEffect, useCallback } from 'react';
import { IMG } from '../data/content';
import LazyImage from './LazyImage';

export default function GallerySection({ ui }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? IMG.gallery.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === IMG.gallery.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToPrev, goToNext]);

  useEffect(() => {
    if (!lightboxOpen) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToNext();
        else goToPrev();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightboxOpen, goToNext, goToPrev]);

  return (
    <section id="gallery" className="bg-slate-50 max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold">{ui.galleryHeading}</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {IMG.gallery.map((image, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="relative group rounded-xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9e4b13] focus:ring-offset-2"
            aria-label={`View ${image.alt} full size`}
            data-testid={`button-gallery-image-${i}`}
          >
            <LazyImage
              srcWebP={image.desktop}
              srcMobileWebP={image.mobile}
              alt={image.alt}
              className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-20 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close lightbox"
            data-testid="button-lightbox-close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={goToPrev}
            className="absolute left-2 md:left-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Previous image"
            data-testid="button-lightbox-prev"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Next image"
            data-testid="button-lightbox-next"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {currentIndex + 1} / {IMG.gallery.length}
          </div>

          <div 
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={closeLightbox}
          >
            <img
              src={IMG.gallery[currentIndex].desktop}
              alt={IMG.gallery[currentIndex].alt}
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
}
