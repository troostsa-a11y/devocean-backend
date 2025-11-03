/**
 * Debounce function for performance optimization
 * Reduces frequency of expensive function calls
 */
export function debounce(func, wait = 150) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function runs at most once per interval
 * Better for scroll/resize where you want regular updates
 */
export function throttle(func, limit = 150) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request Idle Callback polyfill for older browsers
 */
export function requestIdleCallbackPolyfill(cb) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(cb);
  }
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
}
