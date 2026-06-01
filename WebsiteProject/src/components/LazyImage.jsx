import { useState, useEffect, useRef } from 'react';

/**
 * LazyImage — responsive image with WebP support and optional LCP fast-path.
 *
 * isLCP=true  → renders a pure <picture> with no JavaScript state, no placeholder,
 *               no fade-in. All srcSet values are bound directly as HTML attributes
 *               so the browser preload scanner can discover them. Use for the first
 *               above-the-fold hero slide only.
 *
 * isLCP=false → IntersectionObserver-based lazy load with fade-in (default).
 */
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
  aspectRatio = '3/2',
  isLCP = false,
  ...props
}) {
  // ─── LCP fast-path ────────────────────────────────────────────────────────
  // No useState, no placeholder, no fade animation.
  // Mobile-WebP source is listed first to match the <link rel="preload"> order
  // in index.html (breakpoint 800px matches the preload media queries).
  if (isLCP) {
    const sharedStyle = {
      ...(aspectRatio && { aspectRatio }),
      ...props.style,
    };
    return (
      <picture>
        {srcMobileWebP && (
          <source media="(max-width: 800px)" type="image/webp" srcSet={srcMobileWebP} />
        )}
        {srcMobile && (
          <source media="(max-width: 800px)" type="image/jpeg" srcSet={srcMobile} />
        )}
        {srcWebP && (
          <source type="image/webp" srcSet={srcWebP} />
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          loading="eager"
          fetchpriority="high"
          decoding="async"
          {...(width && { width })}
          {...(height && { height })}
          style={sharedStyle}
        />
      </picture>
    );
  }

  // ─── Standard lazy-load path ───────────────────────────────────────────────
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E';
  const isEager = loading === 'eager';
  const [desktopSrc, setDesktopSrc] = useState(isEager ? src : placeholder);
  const [mobileSrc, setMobileSrc] = useState(isEager && srcMobile ? srcMobile : placeholder);
  const [desktopWebP, setDesktopWebP] = useState(isEager && srcWebP ? srcWebP : placeholder);
  const [mobileWebP, setMobileWebP] = useState(isEager && srcMobileWebP ? srcMobileWebP : placeholder);
  const [imageLoaded, setImageLoaded] = useState(isEager);
  const imgRef = useRef(null);

  useEffect(() => {
    if (isEager || (!src && !srcWebP && !srcMobile && !srcMobileWebP)) return;

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
      { rootMargin: '50px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, srcMobile, srcWebP, srcMobileWebP, isEager]);

  const imgProps = {
    ref: imgRef,
    alt,
    onLoad: () => setImageLoaded(true),
    loading,
    decoding: 'async',
    ...(fetchpriority && { fetchpriority }),
    ...(width && { width }),
    ...(height && { height }),
    style: {
      ...(aspectRatio && { aspectRatio }),
      ...props.style,
    },
  };

  const opacityClass = isEager
    ? `transition-opacity duration-300 ${className}`
    : `transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`;

  if (srcMobile || srcWebP) {
    return (
      <picture>
        {mobileWebP && mobileWebP !== placeholder && (
          <source media="(max-width: 800px)" type="image/webp" srcSet={mobileWebP} />
        )}
        {mobileSrc && mobileSrc !== placeholder && (
          <source media="(max-width: 800px)" type="image/jpeg" srcSet={mobileSrc} />
        )}
        {desktopWebP && desktopWebP !== placeholder && (
          <source type="image/webp" srcSet={desktopWebP} />
        )}
        <img {...imgProps} src={desktopSrc} className={opacityClass} />
      </picture>
    );
  }

  return <img {...imgProps} src={desktopSrc} className={opacityClass} />;
}
