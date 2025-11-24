// Store the referring URL when page loads (before any redirects)
(function() {
  // Check for return URL in query parameter first (most reliable)
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get('return') || urlParams.get('returnUrl') || urlParams.get('back');
  
  if (returnUrl) {
    sessionStorage.setItem('legalPageReferrer', returnUrl);
  } else if (document.referrer && !sessionStorage.getItem('legalPageReferrer')) {
    sessionStorage.setItem('legalPageReferrer', document.referrer);
  }
})();

// Smart back button that handles external referrers (like Hotelrunner)
function smartBack() {
  // Try to get the stored referrer first (most reliable)
  const storedReferrer = sessionStorage.getItem('legalPageReferrer');
  const referrer = storedReferrer || document.referrer;
  
  // Clear the stored referrer after using it
  if (storedReferrer) {
    sessionStorage.removeItem('legalPageReferrer');
  }
  
  // Get current language from localStorage to preserve it
  let currentLang = null;
  try {
    currentLang = localStorage.getItem('site.lang');
  } catch (_) {}
  
  // Helper to append lang parameter to URL
  function addLangParam(url, lang) {
    if (!lang) return url;
    try {
      const urlObj = new URL(url, window.location.origin);
      // Only add lang param if it's not already present
      if (!urlObj.searchParams.has('lang')) {
        urlObj.searchParams.set('lang', lang);
      }
      return urlObj.toString();
    } catch (_) {
      return url;
    }
  }
  
  // Check if there's browser history to go back to (internal navigation)
  if (window.history.length > 1 && referrer && referrer.indexOf(window.location.host) !== -1) {
    // Same-site navigation - preserve language by appending to referrer URL
    if (currentLang) {
      window.location.href = addLangParam(referrer, currentLang);
    } else {
      window.history.back();
    }
  } else if (referrer) {
    // External referrer (like Hotelrunner) - redirect to referrer
    window.location.href = referrer;
  } else {
    // No referrer - go to home page with language
    const homeUrl = currentLang ? addLangParam('/', currentLang) : '/';
    window.location.href = homeUrl;
  }
}

// Utility functions for copy link and mobile menu toggle
function copySectionLink(sectionId) {
 const url = window.location.origin + window.location.pathname + '#' + sectionId;
 
 navigator.clipboard.writeText(url).then(() => {
 const button = event.target;
 const originalText = button.innerHTML;
 button.innerHTML = '✓ Copied!';
 button.style.opacity = '1';
 
 setTimeout(() => {
 button.innerHTML = originalText;
 }, 2000);
 }).catch(err => {
 console.error('Failed to copy link:', err);
 const textArea = document.createElement('textarea');
 textArea.value = url;
 document.body.appendChild(textArea);
 textArea.select();
 try {
 document.execCommand('copy');
 const button = event.target;
 const originalText = button.innerHTML;
 button.innerHTML = '✓ Copied!';
 button.style.opacity = '1';
 setTimeout(() => {
 button.innerHTML = originalText;
 }, 2000);
 } catch (err2) {
 console.error('Fallback copy failed:', err2);
 }
 document.body.removeChild(textArea);
 });
}

function requestData(type) {
 const email = 'info@devoceanlodge.com';
 const subjects = {
   access: 'GDPR Data Access Request',
   erasure: 'GDPR Data Deletion Request'
 };
 const bodies = {
   access: 'Hello,\n\nI would like to request access to my personal data in accordance with GDPR Article 15.\n\nPlease provide:\n- All personal data you hold about me\n- Categories of data processed\n- Purposes of processing\n- Recipients of the data\n- Retention periods\n\nThank you.',
   erasure: 'Hello,\n\nI would like to request the deletion of my personal data in accordance with GDPR Article 17 (Right to Erasure).\n\nPlease delete all personal data you hold about me and confirm once completed.\n\nThank you.'
 };
 
 const subject = encodeURIComponent(subjects[type] || 'GDPR Request');
 const body = encodeURIComponent(bodies[type] || '');
 
 window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
function toggleMobileMenu() {
 const mobileNav = document.getElementById('mobile-nav');
 const btn = document.querySelector('.mobile-menu-btn');
 const isOpen = mobileNav.classList.contains('show');
 const header = document.querySelector('.sticky-header');
 
 // Get or create overlay
 let overlay = document.getElementById('mobile-menu-overlay');
 if (!overlay) {
 overlay = document.createElement('div');
 overlay.id = 'mobile-menu-overlay';
 overlay.className = 'mobile-menu-overlay';
 overlay.onclick = toggleMobileMenu; // Close menu when clicking overlay
 document.body.appendChild(overlay);
 }
 
 function updateHeaderHeight() {
 if (header) {
 const height = header.offsetHeight;
 document.documentElement.style.setProperty('--header-height', height + 'px');
 }
 }
 
 if (isOpen) {
 mobileNav.classList.remove('show');
 overlay.classList.remove('show');
 btn.setAttribute('aria-expanded', 'false');
 setTimeout(updateHeaderHeight, 50);
 } else {
 mobileNav.classList.add('show');
 overlay.classList.add('show');
 btn.setAttribute('aria-expanded', 'true');
 setTimeout(updateHeaderHeight, 50);
 }
}
// Prevent browser scroll restoration
if ('scrollRestoration' in history) {
 history.scrollRestoration = 'manual';
}

/* === Sticky header & quick-links bootstrap (final) === */
(function () {
  var header = document.querySelector('.sticky-header');

  function setHeaderVar() {
    if (!header) header = document.querySelector('.sticky-header');
    if (header) {
      document.documentElement.style.setProperty(
        '--header-height',
        (header.offsetHeight || 0) + 'px'
      );
    }
  }

  // Measure early & often
  setHeaderVar();
  document.addEventListener('DOMContentLoaded', setHeaderVar, { once: true });
  window.addEventListener('load', setHeaderVar, { once: true });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setHeaderVar); }
  window.addEventListener('resize', setHeaderVar);

  // Re-measure whenever header text/links change (i18n, badge, etc.)
  if (header) {
    new MutationObserver(function () { requestAnimationFrame(setHeaderVar); })
      .observe(header, { subtree: true, childList: true, characterData: true });
  }

  // Populate mobile menu from desktop links
  function rebuildMobileMenu() {
    var desktopLinks = document.querySelector('.quick-nav-links');
    var mobileNav = document.getElementById('mobile-nav');
    if (!desktopLinks || !mobileNav) return;
    
    var links = desktopLinks.querySelectorAll('a[href^="#"]');
    if (links.length === 0) return;
    
    mobileNav.innerHTML = '';
    links.forEach(function(link) {
      var a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent;
      a.addEventListener('click', function(e){
        e.preventDefault();
        var id = (a.getAttribute('href') || '').slice(1);
        if (!id) return;
        
        // Close mobile menu and overlay
        mobileNav.classList.remove('show');
        var overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) overlay.classList.remove('show');
        var btn = document.querySelector('.mobile-menu-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        
        // Recalculate header height after menu closes (fixes white space)
        requestAnimationFrame(function() {
          setHeaderVar();
          
          // Now scroll with updated header height
          history.replaceState(null, '', '#' + id);
          var el = document.getElementById(id);
          if (!el) return;
          var h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
          var y = window.scrollY + el.getBoundingClientRect().top - h - 8;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        });
      });
      mobileNav.appendChild(a);
    });
  }

  // Wire desktop quick links
  function wireDesktopLinks(){
    document.querySelectorAll('.quick-nav-links a[href^="#"]')
      .forEach(function(a){
        if (a.__wired) return;
        a.__wired = true;
        a.addEventListener('click', function(e){
          e.preventDefault();
          var id = (a.getAttribute('href') || '').slice(1);
          if (!id) return;
          history.replaceState(null, '', '#' + id);
          var el = document.getElementById(id);
          if (!el) return;
          var h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
          var y = window.scrollY + el.getBoundingClientRect().top - h - 8;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        });
      });
  }
  
  // Initial wire and rebuild
  wireDesktopLinks();
  rebuildMobileMenu();
  
  // Watch ONLY the desktop quick-nav-links container for changes (i18n populating links)
  var desktopLinksContainer = document.querySelector('.quick-nav-links');
  if (desktopLinksContainer) {
    var linkObserver = new MutationObserver(function(mutations){ 
      var hasNewLinks = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) hasNewLinks = true;
      });
      if (hasNewLinks) {
        wireDesktopLinks();
        rebuildMobileMenu();
      }
    });
    linkObserver.observe(desktopLinksContainer, { childList: true, subtree: true });
  }

  // If opening on a deep link, correct once instantly (no smooth)
  if (window.location.hash) {
    requestAnimationFrame(function () {
      setHeaderVar();
      var id = window.location.hash.slice(1), el = document.getElementById(id);
      if (!el) return;
      var h = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
      var y = window.scrollY + el.getBoundingClientRect().top - h - 8;
      window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
    });
  }
})();
