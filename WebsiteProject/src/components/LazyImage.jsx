import { useState, useEffect, useRef } from 'react';

export default function LazyImage({
  src,
  srcMobile,
  srcWebP,
  srcMobileWebP,
  alt,
  className = '',
  loading = 'lazy',
  fetchpriority,
  width,
  height,
  aspectRatio = '3/2', // Default 3:2 ratio - prevents CLS
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  ...props
}) {
  const isEager = loading === 'eager';
  const [desktopSrc, setDesktopSrc] = useState(isEager ? src : placeholder);
  const [mobileSrc, setMobileSrc] = useState(isEager && srcMobile ? srcMobile : placeholder);
  const [desktopWebP, setDesktopWebP] = useState(isEager && srcWebP ? srcWebP : placeholder);
  const [mobileWebP, setMobileWebP] = useState(isEager && srcMobileWebP ? srcMobileWebP : placeholder);
  const [imageLoaded, setImageLoaded] = useState(isEager); // LCP images start visible
  const imgRef = useRef(null);

  useEffect(() => {
    // Skip if eager loading or no image sources at all
    if (loading === 'eager' || (!src && !srcWebP && !srcMobile && !srcMobileWebP)) return;

    // For lazy loading, use IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (src) setDesktopSrc(src);
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

  // Build common img props with explicit dimensions to prevent CLS
  const imgProps = {
    ref: imgRef,
    alt,
    onLoad: () => setImageLoaded(true),
    loading,
    decoding: "async",
    ...(fetchpriority && { fetchpriority }), // Add fetchpriority for LCP optimization
    ...(width && { width }), // Explicit width prevents CLS
    ...(height && { height }), // Explicit height prevents CLS
    style: {
      ...(aspectRatio && { aspectRatio }), // CSS aspect-ratio prevents CLS when dimensions not provided
      ...props.style
    },
    ...props
  };

  // LCP images (eager) start visible but keep transition for fade-out
  // Lazy images fade in on load
  const opacityClass = isEager 
    ? `transition-opacity duration-300 ${className}` // Eager: starts visible, fades out smoothly
    : `transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`; // Lazy: fades in

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
          {...imgProps}
          src={desktopSrc}
          className={opacityClass}
        />
      </picture>
    );
  }

  // Fallback to regular img if no responsive/WebP sources
  return (
    <img
      {...imgProps}
      src={desktopSrc}
      className={opacityClass}
    />
  );
}
