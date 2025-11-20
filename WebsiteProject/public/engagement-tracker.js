// User Engagement Detection for GTM optimization
// Loaded asynchronously to avoid blocking main thread
(function() {
  let engaged = false;
  let consentGranted = false;
  let marketingAllowedFired = false;
  
  function checkMarketingAllowed() {
    if (engaged && consentGranted && !marketingAllowedFired) {
      marketingAllowedFired = true;
      
      // Additional 3-second delay specifically for ads conversion tracking
      // This reduces main-thread blocking from Google Ads tags
      setTimeout(function() {
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'marketing_allowed',
            timestamp: Date.now()
          });
        } catch (e) {
          // Silently handle errors from third-party scripts
        }
      }, 3000);
    }
  }
  
  function fireEngagement() {
    if (engaged) return;
    engaged = true;
    
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'user_engaged',
        engagement_type: 'interaction'
      });
    } catch (e) {
      // Silently handle errors from third-party scripts
    }
    
    checkMarketingAllowed();
  }
  
  function checkConsentInItem(item) {
    if (!item || typeof item !== 'object') return false;
    
    // Normalize array-like objects (Arguments) to real arrays
    let normalized = item;
    if (!Array.isArray(item) && typeof item === 'object' && '0' in item) {
      // This is an Arguments object or array-like, convert to array
      try {
        normalized = Array.from(item);
      } catch (e) {
        normalized = Array.prototype.slice.call(item);
      }
    }
    
    // Handle gtag consent pushes: ['consent', 'default'/'update', {ad_storage: 'granted', ...}]
    if (Array.isArray(normalized) && normalized[0] === 'consent' && normalized[2]) {
      if (normalized[2].ad_storage === 'granted') {
        consentGranted = true;
        return true;
      }
    }
    // Handle object-based consent events: {event: 'consent', ad_storage: 'granted'}
    else if (!Array.isArray(item) && item.event) {
      if ((item.event === 'consent' || item.event === 'consent_update') && item.ad_storage === 'granted') {
        consentGranted = true;
        return true;
      }
    }
    return false;
  }
  
  // Initialize by scanning existing dataLayer entries
  try {
    window.dataLayer = window.dataLayer || [];
    for (let i = 0; i < window.dataLayer.length; i++) {
      if (checkConsentInItem(window.dataLayer[i])) {
        break; // Found granted consent, stop scanning
      }
    }
    
    // Intercept future dataLayer.push calls to detect consent updates
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function() {
      try {
        const args = Array.from(arguments);
        
        // Check each pushed item for consent
        args.forEach(function(item) {
          if (checkConsentInItem(item)) {
            checkMarketingAllowed();
          }
        });
        
        return originalPush.apply(window.dataLayer, args);
      } catch (e) {
        // Silently handle errors, still call original push
        return originalPush.apply(window.dataLayer, arguments);
      }
    };
  } catch (e) {
    // Silently handle initialization errors
  }
  
  // Detect engagement via scroll (past 25% of page)
  let scrollFired = false;
  window.addEventListener('scroll', function() {
    if (scrollFired) return;
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollPercent > 25) {
      scrollFired = true;
      fireEngagement();
    }
  }, { passive: true });
  
  // Detect engagement via any click
  document.addEventListener('click', fireEngagement, { once: true, passive: true });
  
  // Detect engagement via time on page (20 seconds)
  setTimeout(fireEngagement, 20000);
})();
