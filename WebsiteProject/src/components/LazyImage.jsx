import { useState, useEffect, useRef } from 'react';

export default function LazyImage({
  src,
  srcMobile,
  srcWebP,
  srcMobileWebP,
  alt,
  className = '',
  loading = 'lazy',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  ...props
}) {
  const [desktopSrc, setDesktopSrc] = useState(loading === 'eager' ? src : placeholder);
  const [mobileSrc, setMobileSrc] = useState(loading === 'eager' && srcMobile ? srcMobile : placeholder);
  const [desktopWebP, setDesktopWebP] = useState(loading === 'eager' && srcWebP ? srcWebP : placeholder);
  const [mobileWebP, setMobileWebP] = useState(loading === 'eager' && srcMobileWebP ? srcMobileWebP : placeholder);
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
            if (srcWebP) setDesktopWebP(srcWebP);
            if (srcMobileWebP) setMobileWebP(srcMobileWebP);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src, srcMobile, srcWebP, srcMobileWebP, loading]);

  // Use picture element for responsive/WebP images
  if (srcMobile || srcWebP) {
    return (
      <picture>
        {mobileWebP && mobileWebP !== placeholder && (
          <source media="(max-width: 768px)" type="image/webp" srcSet={mobileWebP} />
        )}
        {mobileSrc && mobileSrc !== placeholder && (
          <source media="(max-width: 768px)" type="image/jpeg" srcSet={mobileSrc} />
        )}
        {desktopWebP && desktopWebP !== placeholder && (
          <source type="image/webp" srcSet={desktopWebP} />
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

  // Fallback to regular img if no responsive/WebP sources
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
