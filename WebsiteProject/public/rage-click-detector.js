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
    maxToastsPerSession: 3    // Limit notifications per session
  };
  
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
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 999999;
        animation: slideInUp 0.3s ease-out, fadeOut 0.3s ease-in 3.7s;
        pointer-events: none;
        max-width: 320px;
        line-height: 1.5;
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
    
    injectStyles();
    toastCount++;
    
    const toast = document.createElement('div');
    toast.className = 'rage-click-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
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
    
    // Skip if element is in cooldown
    if (cooldowns.has(element)) {
      event.preventDefault();
      event.stopPropagation();
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
    
    // Show toast notification
    const messages = [
      '👋 Easy there! This element isn\'t clickable.',
      '🤔 That area doesn\'t respond to clicks.',
      '💡 Try clicking on buttons or links instead.'
    ];
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
  
  // Initialize detector
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Add click listener with capture phase to catch all clicks early
    document.addEventListener('click', handleClick, { capture: true, passive: false });
    
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
