import { useState, useEffect, useRef } from 'react';

export default function LazyImage({
  src,
  srcMobile,
  alt,
  className = '',
  loading = 'lazy',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  ...props
}) {
  const [desktopSrc, setDesktopSrc] = useState(loading === 'eager' ? src : placeholder);
  const [mobileSrc, setMobileSrc] = useState(loading === 'eager' && srcMobile ? srcMobile : placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src || loading === 'eager') return;

    // For lazy loading, use IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setDesktopSrc(src);
            if (srcMobile) setMobileSrc(srcMobile);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src, srcMobile, loading]);

  // Use picture element for responsive images if mobile source is provided
  if (srcMobile) {
    return (
      <picture>
        {mobileSrc && mobileSrc !== placeholder && (
          <source media="(max-width: 768px)" srcSet={mobileSrc} />
        )}
        <img
          ref={imgRef}
          src={desktopSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={() => setImageLoaded(true)}
          loading={loading}
          decoding="async"
          {...props}
        />
      </picture>
    );
  }

  // Fallback to regular img if no mobile source
  return (
    <img
      ref={imgRef}
      src={desktopSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={() => setImageLoaded(true)}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
}
