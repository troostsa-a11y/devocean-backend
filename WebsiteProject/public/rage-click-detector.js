// Rage Click Detection & Prevention System
// Detects spam clicking and discourages malicious behavior
// Integrates with Microsoft Clarity via GTM dataLayer
(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    clickThreshold: 3,        // Number of clicks to trigger detection
    timeWindow: 1000,         // Time window in ms (1 second)
    cooldownDuration: 2000,   // Cooldown period after detection (2 seconds)
    toastDuration: 4000,      // How long to show the toast message
    maxToastsPerSession: 10   // Limit notifications per session (increased for multi-language testing)
  };
  
  // Multi-language toast messages (17 languages)
  const MESSAGES = {
    'en-GB': [
      '👋 Easy there! This element isn\'t clickable.',
      '🤔 That area doesn\'t respond to clicks.',
      '💡 Try clicking on buttons or links instead.'
    ],
    'en-US': [
      '👋 Easy there! This element isn\'t clickable.',
      '🤔 That area doesn\'t respond to clicks.',
      '💡 Try clicking on buttons or links instead.'
    ],
    'pt-PT': [
      '👋 Calma! Este elemento não é clicável.',
      '🤔 Essa área não responde a cliques.',
      '💡 Tente clicar em botões ou links.'
    ],
    'pt-BR': [
      '👋 Calma! Este elemento não é clicável.',
      '🤔 Essa área não responde a cliques.',
      '💡 Tente clicar em botões ou links.'
    ],
    'nl-NL': [
      '👋 Rustig aan! Dit element is niet klikbaar.',
      '🤔 Dit gebied reageert niet op klikken.',
      '💡 Probeer in plaats daarvan op knoppen of links te klikken.'
    ],
    'fr-FR': [
      '👋 Doucement ! Cet élément n\'est pas cliquable.',
      '🤔 Cette zone ne répond pas aux clics.',
      '💡 Essayez de cliquer sur des boutons ou des liens.'
    ],
    'it-IT': [
      '👋 Piano! Questo elemento non è cliccabile.',
      '🤔 Quest\'area non risponde ai clic.',
      '💡 Prova a cliccare su pulsanti o link.'
    ],
    'de-DE': [
      '👋 Langsam! Dieses Element ist nicht anklickbar.',
      '🤔 Dieser Bereich reagiert nicht auf Klicks.',
      '💡 Versuchen Sie stattdessen auf Schaltflächen oder Links zu klicken.'
    ],
    'es-ES': [
      '👋 ¡Tranquilo! Este elemento no es clicable.',
      '🤔 Esa área no responde a los clics.',
      '💡 Intenta hacer clic en botones o enlaces.'
    ],
    'sv': [
      '👋 Ta det lugnt! Det här elementet är inte klickbart.',
      '🤔 Det området svarar inte på klick.',
      '💡 Försök klicka på knappar eller länkar istället.'
    ],
    'pl': [
      '👋 Spokojnie! Ten element nie jest klikalny.',
      '🤔 Ten obszar nie reaguje na kliknięcia.',
      '💡 Spróbuj kliknąć przyciski lub linki.'
    ],
    'af-ZA': [
      '👋 Kalm aan! Hierdie element is nie klikbaar nie.',
      '🤔 Daardie area reageer nie op klieke nie.',
      '💡 Probeer eerder op knoppies of skakels klik.'
    ],
    'zu': [
      '👋 Kancane! Lesi sici asichofozi.',
      '🤔 Lelo ndawo ayiphenduli ekuchofozeni.',
      '💡 Zama ukuchofoza izinkinobho noma izixhumanisi.'
    ],
    'sw': [
      '👋 Polepole! Kipengee hiki hakiwezi kubonyezwa.',
      '🤔 Eneo hilo halijibu mabonyezo.',
      '💡 Jaribu kubonyeza vitufe au viungo badala yake.'
    ],
    'ru': [
      '👋 Потише! Этот элемент не кликабелен.',
      '🤔 Эта область не реагирует на клики.',
      '💡 Попробуйте нажимать на кнопки или ссылки.'
    ],
    'ja-JP': [
      '👋 落ち着いて！この要素はクリックできません。',
      '🤔 この領域はクリックに反応しません。',
      '💡 代わりにボタンやリンクをクリックしてみてください。'
    ],
    'zh-CN': [
      '👋 慢点！此元素不可点击。',
      '🤔 该区域不响应点击。',
      '💡 请尝试点击按钮或链接。'
    ]
  };
  
  // Normalize language codes (matches React app logic)
  function normalizeLangCode(langCode) {
    if (!langCode) return null;
    
    const normalized = langCode.toLowerCase().trim();
    
    // Direct mapping of short codes to full locale codes
    const SHORT_TO_FULL = {
      'en': 'en-GB',
      'pt': 'pt-PT',  // Portuguese Portugal as default
      'nl': 'nl-NL',
      'fr': 'fr-FR',
      'it': 'it-IT',
      'de': 'de-DE',
      'es': 'es-ES',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'af': 'af-ZA',
      'ru': 'ru'      // Russian uses 2-letter code
    };
    
    // Check if it's a short code that needs expansion
    if (SHORT_TO_FULL[normalized]) {
      return SHORT_TO_FULL[normalized];
    }
    
    // Check if it's already a supported code (case-insensitive)
    // Try to find exact match in MESSAGES keys
    for (const key in MESSAGES) {
      if (key.toLowerCase() === normalized) {
        return key;
      }
    }
    
    // Try to extract language from locale (e.g., 'pt-BR' -> 'pt')
    const baseCode = normalized.split('-')[0];
    if (SHORT_TO_FULL[baseCode]) {
      return SHORT_TO_FULL[baseCode];
    }
    
    return null;
  }
  
  // Detect current language from localStorage first (React's source of truth)
  function detectLanguage() {
    // Priority 1: localStorage (React app's source of truth - updated immediately on change)
    try {
      const stored = localStorage.getItem('site.lang');
      if (stored) {
        const normalized = normalizeLangCode(stored);
        if (normalized && MESSAGES[normalized]) {
          return normalized;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Priority 2: URL parameter (for initial page load or standalone pages)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam) {
      const normalized = normalizeLangCode(langParam);
      if (normalized && MESSAGES[normalized]) {
        return normalized;
      }
    }
    
    // Priority 3: HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const normalized = normalizeLangCode(htmlLang);
      if (normalized && MESSAGES[normalized]) {
        return normalized;
      }
    }
    
    // Default to English
    return 'en-GB';
  }
  
  // State tracking
  const clickTracker = new Map(); // element -> click timestamps array
  const cooldowns = new WeakSet(); // elements currently in cooldown
  let toastCount = 0;
  let clarityTagged = false;
  
  // Toast notification styles (injected once)
  function injectStyles() {
    if (document.getElementById('rage-click-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'rage-click-styles';
    style.textContent = `
      .rage-click-toast {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        background: linear-gradient(135deg, #c86414 0%, #9e4b13 100%) !important;
        color: white !important;
        padding: 16px 24px !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        z-index: 2147483647 !important;
        animation: slideInUp 0.3s ease-out, fadeOut 0.3s ease-in 3.7s !important;
        pointer-events: none !important;
        max-width: 320px !important;
        line-height: 1.5 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @media (max-width: 480px) {
        .rage-click-toast {
          left: 20px;
          right: 20px;
          bottom: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Show toast notification
  function showToast(message) {
    if (toastCount >= CONFIG.maxToastsPerSession) return;
    
    // Create overlay container to ensure visibility
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:2147483647;';
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #c86414 0%, #9e4b13 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 320px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    overlay.appendChild(toast);
    document.body.appendChild(overlay);
    toastCount++;
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, CONFIG.toastDuration);
  }
  
  // Tag session in Clarity via dataLayer
  function tagClaritySession() {
    if (clarityTagged) return;
    clarityTagged = true;
    
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'rage_click_detected',
        rage_click: {
          detected: true,
          timestamp: new Date().toISOString(),
          session_flagged: true
        }
      });
      
      // Also set a custom Clarity tag if available
      if (window.clarity) {
        window.clarity('set', 'rage_clicker', 'true');
      }
    } catch (e) {
      // Silently handle errors
    }
  }
  
  // Get a stable identifier for an element
  function getElementId(element) {
    // Use data-testid, id, or create a path-based identifier
    if (element.dataset && element.dataset.testid) {
      return `testid:${element.dataset.testid}`;
    }
    if (element.id) {
      return `id:${element.id}`;
    }
    
    // Create a simple path-based identifier
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? `.${element.className.split(' ')[0]}` : '';
    return `${tagName}${className}`;
  }
  
  // Check if element is interactive
  function isInteractiveElement(element) {
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
    const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option'];
    
    // Check tag name
    if (interactiveTags.includes(element.tagName)) {
      return true;
    }
    
    // Check role attribute
    const role = element.getAttribute('role');
    if (role && interactiveRoles.includes(role)) {
      return true;
    }
    
    // Check if element has click handlers (rough check)
    if (element.onclick || element.hasAttribute('onclick')) {
      return true;
    }
    
    return false;
  }
  
  // Main click handler
  function handleClick(event) {
    const element = event.target;
    
    // Skip interactive elements (they're supposed to be clicked)
    if (isInteractiveElement(element)) {
      return;
    }
    
    // Skip if element is in cooldown (just ignore, don't prevent)
    if (cooldowns.has(element)) {
      return;
    }
    
    // Get or create click history for this element
    const elementId = getElementId(element);
    const now = Date.now();
    
    if (!clickTracker.has(elementId)) {
      clickTracker.set(elementId, []);
    }
    
    const clicks = clickTracker.get(elementId);
    
    // Add current click
    clicks.push(now);
    
    // Remove clicks outside the time window
    const recentClicks = clicks.filter(timestamp => now - timestamp < CONFIG.timeWindow);
    clickTracker.set(elementId, recentClicks);
    
    // Check if rage click detected
    if (recentClicks.length >= CONFIG.clickThreshold) {
      handleRageClick(element, elementId);
    }
  }
  
  // Handle rage click detection
  function handleRageClick(element, elementId) {
    // Clear click history for this element
    clickTracker.set(elementId, []);
    
    // Add to cooldown
    cooldowns.add(element);
    
    // Tag session in Clarity
    tagClaritySession();
    
    // Show toast notification in user's language
    // Detect language fresh on each rage click to get current state from localStorage
    const lang = detectLanguage();
    const messages = MESSAGES[lang] || MESSAGES['en-GB'];
    const message = messages[Math.min(toastCount, messages.length - 1)];
    showToast(message);
    
    // Add visual feedback (subtle pulse)
    const originalTransition = element.style.transition;
    element.style.transition = 'opacity 0.2s ease';
    element.style.opacity = '0.5';
    
    setTimeout(() => {
      element.style.opacity = '';
      element.style.transition = originalTransition;
    }, 200);
    
    // Remove from cooldown after duration
    setTimeout(() => {
      cooldowns.delete(element);
    }, CONFIG.cooldownDuration);
    
    // Track event in dataLayer for analytics
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'rage_click',
        element_type: element.tagName.toLowerCase(),
        element_id: elementId,
        click_count: CONFIG.clickThreshold
      });
    } catch (e) {
      // Silently handle errors
    }
  }
  
  // Track if listener is active
  let listenerActive = false;
  
  // Initialize detector
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Prevent multiple initializations
    if (listenerActive) {
      return;
    }
    listenerActive = true;
    
    // Add click listener with capture phase to catch all clicks early
    // Use passive: true since we don't actually prevent default for most clicks
    document.addEventListener('click', handleClick, { capture: true, passive: true });
    
    // Cleanup old entries periodically to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [elementId, clicks] of clickTracker.entries()) {
        const recentClicks = clicks.filter(timestamp => now - timestamp < CONFIG.timeWindow * 2);
        if (recentClicks.length === 0) {
          clickTracker.delete(elementId);
        } else {
          clickTracker.set(elementId, recentClicks);
        }
      }
    }, 30000); // Cleanup every 30 seconds
  }
  
  // Start the detector
  init();
})();
