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
function toggleMobileMenu() {
 const mobileNav = document.getElementById('mobile-nav');
 const btn = document.querySelector('.mobile-menu-btn');
 const isOpen = mobileNav.classList.contains('show');
 const header = document.querySelector('.sticky-header');
 
 function updateHeaderHeight() {
 if (header) {
 const height = header.offsetHeight;
 document.documentElement.style.setProperty('--header-height', height + 'px');
 }
 }
 
 if (isOpen) {
 mobileNav.classList.remove('show');
 btn.setAttribute('aria-expanded', 'false');
 setTimeout(updateHeaderHeight, 50);
 } else {
 mobileNav.classList.add('show');
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
        
        // Close mobile menu
        mobileNav.classList.remove('show');
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
