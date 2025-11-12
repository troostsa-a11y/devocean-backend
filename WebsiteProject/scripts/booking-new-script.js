// This is the new module-based script to replace the embedded translations in booking.html
// Lines ~1339-2416 in booking.html

// ===== Safe localStorage helpers =====
function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Silent fail - storage unavailable
  }
}

// ===== Language and currency detection =====
function detectSiteLanguage(){
  const qs = new URLSearchParams(location.search);
  const urlLang = qs.get('lang') || qs.get('locale');
  
  // Priority 1: URL parameter
  if (urlLang){ 
    safeSetItem('site.lang', urlLang); 
    return urlLang; 
  }
  
  // Priority 2: localStorage
  const saved = safeGetItem('site.lang');
  if (saved) return saved;
  
  // Priority 3: Browser language
  const detected = navigator.language || 'en-GB';
  safeSetItem('site.lang', detected);
  return detected;
}

function detectSiteCurrency(){
  const qs = new URLSearchParams(location.search);
  const urlCur = qs.get('cur') || qs.get('currency');
  
  // Priority 1: URL parameter
  if (urlCur && urlCur.length === 3){ 
    safeSetItem('site.currency', urlCur.toUpperCase()); 
    return urlCur.toUpperCase(); 
  }
  
  // Priority 2: localStorage
  const saved = safeGetItem('site.currency');
  if (saved) return saved;
  
  // Priority 3: Default
  return 'USD';
}

function normalizeLangCode(langCode) {
  if (!langCode) return 'en';
  const s = String(langCode).toLowerCase();
  
  // Normalize to 2-letter codes
  if (s === 'en-gb' || s === 'en-us' || s === 'en') return 'en';
  if (s === 'de-de' || s === 'de') return 'de';
  if (s === 'es-es' || s === 'es') return 'es';
  if (s === 'fr-fr' || s === 'fr') return 'fr';
  if (s === 'it-it' || s === 'it') return 'it';
  if (s === 'nl-nl' || s === 'nl') return 'nl';
  if (s === 'pt-pt' || s === 'pt-br' || s === 'pt-mz' || s === 'pt') return 'pt';
  if (s === 'ru' || s === 'ru-ru') return 'ru';
  if (s === 'zh-cn' || s === 'zh-tw' || s === 'zh') return 'zh';
  if (s === 'sv' || s === 'sv-se') return 'sv';
  if (s === 'ja-jp' || s === 'ja') return 'ja';
  if (s === 'pl' || s === 'pl-pl') return 'pl';
  if (s === 'af-za' || s === 'af') return 'af';
  if (s === 'zu-za' || s === 'zu') return 'zu';
  if (s === 'sw' || s === 'sw-tz' || s === 'sw-ke') return 'sw';
  
  return 'en';
}

function mapToB24(code){
  return normalizeLangCode(code);
}

// ===== Dynamic translation loading with caching =====
const translationCache = new Map();
const loadingPromises = new Map();

async function loadTranslation(langCode) {
  // Return cached translation if available
  if (translationCache.has(langCode)) {
    return translationCache.get(langCode);
  }

  // If already loading this language, return existing promise
  if (loadingPromises.has(langCode)) {
    return loadingPromises.get(langCode);
  }

  const promise = (async () => {
    try {
      const url = new URL(`./booking/langs/${langCode}.js`, window.location.href);
      const module = await import(url.href);
      const translations = module.default;
      translationCache.set(langCode, translations);
      return translations;
    } catch (err) {
      console.warn(`Failed to load translation for ${langCode}`, err);
      
      // Fallback to English
      if (langCode !== 'en') {
        console.log('Falling back to English...');
        return loadTranslation('en');
      }
      
      // If English fails, show error
      console.error('Failed to load English fallback:', err);
      throw new Error('Translation loading failed');
    } finally {
      loadingPromises.delete(langCode);
    }
  })();

  loadingPromises.set(langCode, promise);
  return promise;
}

// ===== Promise-based DOM ready helper =====
function waitForDom(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for ${selector}`));
      }
    }, 50);

    // Also listen for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector(selector)) {
          clearInterval(interval);
          resolve();
        }
      });
    }
  });
}

// ===== Apply translations to DOM =====
function applyTranslations(TT, code, siteCurrency) {
  // Set document title and meta
  document.title = TT.title;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', TT.desc);

  // Main headings
  const elH1 = document.getElementById("t-h1");
  const elHowtoHeading = document.getElementById("t-howto-heading");
  const elCurrencyNote = document.getElementById("t-currency-note");
  const elCurrencyConverter = document.getElementById("t-currency-converter");
  const elChildHeading = document.getElementById("t-child-heading");
  const elBack = document.getElementById("t-back");
  const elHome = document.getElementById("t-home");
  
  if (elH1) elH1.textContent = TT.h1;
  if (elHowtoHeading) elHowtoHeading.textContent = TT.howtoHeading;
  if (elCurrencyNote) elCurrencyNote.textContent = TT.currencyNote;
  if (elCurrencyConverter) elCurrencyConverter.textContent = TT.currencyConverter;
  if (elChildHeading) elChildHeading.textContent = TT.childHeading;
  if (elBack) elBack.textContent = TT.back;
  if (elHome) elHome.textContent = TT.home;
  
  // How to Book badges
  const elHowtoStep1 = document.getElementById("t-howto-step1-desc");
  const elHowtoStep2 = document.getElementById("t-howto-step2-desc");
  const elHowtoStep3 = document.getElementById("t-howto-step3-desc");
  const elHowtoStep4 = document.getElementById("t-howto-step4-desc");
  
  if (elHowtoStep1) elHowtoStep1.textContent = TT.howtoStep1;
  if (elHowtoStep2) elHowtoStep2.textContent = TT.howtoStep2;
  if (elHowtoStep3) elHowtoStep3.textContent = TT.howtoStep3;
  if (elHowtoStep4) elHowtoStep4.textContent = TT.howtoStep4;
  
  // Child policy badges
  const elBabyTitle = document.getElementById("t-child-baby-title");
  const elBabyPrice = document.getElementById("t-child-baby-price");
  const elBabyBooking = document.getElementById("t-child-baby-booking");
  const elBabyNote = document.getElementById("t-child-baby-note");
  const elChildrenTitle = document.getElementById("t-child-children-title");
  const elChildrenPrice = document.getElementById("t-child-children-price");
  const elChildrenBooking = document.getElementById("t-child-children-booking");
  const elChildrenBed = document.getElementById("t-child-children-bed");
  const elYoungsterTitle = document.getElementById("t-child-youngster-title");
  const elYoungsterPrice = document.getElementById("t-child-youngster-price");
  
  if (elBabyTitle) elBabyTitle.textContent = TT.childBabyTitle;
  if (elBabyPrice) elBabyPrice.textContent = TT.childBabyPrice;
  if (elBabyBooking) elBabyBooking.textContent = TT.childBabyBooking;
  if (elBabyNote) elBabyNote.textContent = TT.childBabyNote;
  if (elChildrenTitle) elChildrenTitle.textContent = TT.childChildrenTitle;
  if (elChildrenPrice) elChildrenPrice.textContent = TT.childChildrenPrice;
  if (elChildrenBooking) elChildrenBooking.textContent = TT.childChildrenBooking;
  if (elChildrenBed) elChildrenBed.textContent = TT.childChildrenBed;
  if (elYoungsterTitle) elYoungsterTitle.textContent = TT.childYoungsterTitle;
  if (elYoungsterPrice) elYoungsterPrice.textContent = TT.childYoungsterPrice;
  
  // Modal translations
  const elModalTitle = document.getElementById("t-modal-title");
  const elModalRate = document.getElementById("t-modal-rate");
  const elModalRateDesc = document.getElementById("t-modal-rate-desc");
  const elModalSecure = document.getElementById("t-modal-secure");
  const elModalSecureDesc = document.getElementById("t-modal-secure-desc");
  const elModalNofees = document.getElementById("t-modal-nofees");
  const elModalNofeesDesc = document.getElementById("t-modal-nofees-desc");
  const elModalInstant = document.getElementById("t-modal-instant");
  const elModalInstantDesc = document.getElementById("t-modal-instant-desc");
  const elModalSupport = document.getElementById("t-modal-support");
  const elModalSupportDesc = document.getElementById("t-modal-support-desc");
  
  if (elModalTitle) elModalTitle.textContent = TT.modalTitle;
  if (elModalRate) elModalRate.textContent = TT.modalRate;
  if (elModalRateDesc) elModalRateDesc.textContent = TT.modalRateDesc;
  if (elModalSecure) elModalSecure.textContent = TT.modalSecure;
  if (elModalSecureDesc) elModalSecureDesc.textContent = TT.modalSecureDesc;
  if (elModalNofees) elModalNofees.textContent = TT.modalNofees;
  if (elModalNofeesDesc) elModalNofeesDesc.textContent = TT.modalNofeesDesc;
  if (elModalInstant) elModalInstant.textContent = TT.modalInstant;
  if (elModalInstantDesc) elModalInstantDesc.textContent = TT.modalInstantDesc;
  if (elModalSupport) elModalSupport.textContent = TT.modalSupport;
  if (elModalSupportDesc) elModalSupportDesc.textContent = TT.modalSupportDesc;
  
  // Update home button to preserve language
  const homeBtn = document.getElementById("homeBtn"); 
  if (homeBtn) {
    homeBtn.href = `https://devoceanlodge.com?lang=${code}&cur=${siteCurrency}`;
  }
  
  // Update currency converter link
  const ccLink = document.getElementById("currency-converter-link");
  if (ccLink) {
    ccLink.href = `https://fx-rate.net/calculator/?c_input=USD&cp_input=${siteCurrency}&amount_from=32`;
  }
}

// ===== Setup Beds24 iframe =====
function setupBeds24Iframe(code, siteCurrency) {
  const frame = document.getElementById('beds24frame');
  if (!frame) return;

  const pageQS = new URLSearchParams(location.search);
  const curr = pageQS.get('currency') || pageQS.get('cur') || siteCurrency;
  
  const url = new URL('https://beds24.com/booking2.php?propid=297012&layout=5');
  url.searchParams.set('lang', code);
  if (curr) url.searchParams.set('cur', curr.toUpperCase());

  // Carry through other params (UTM, etc.)
  pageQS.forEach((v,k)=>{ 
    if (k !== 'lang' && k !== 'currency' && k !== 'cur' && !url.searchParams.has(k)) {
      url.searchParams.set(k, v); 
    }
  });

  frame.src = url.toString();
}

// ===== Main initialization =====
async function init() {
  try {
    const siteLang = detectSiteLanguage();
    const siteCurrency = detectSiteCurrency();
    const code = mapToB24(siteLang);
    
    // Set language attribute immediately
    document.documentElement.setAttribute('lang', code);
    
    // Load translations
    console.log(`Loading translations for: ${code}`);
    const TT = await loadTranslation(code);
    
    // Wait for critical DOM elements
    await waitForDom('#t-h1');
    
    // Apply translations
    applyTranslations(TT, code, siteCurrency);
    
    // Setup iframe
    setupBeds24Iframe(code, siteCurrency);
    
    console.log(`Booking page initialized in ${code}`);
  } catch (err) {
    console.error('Failed to initialize booking page:', err);
    // Show error message to user
    const body = document.body;
    if (body) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:12px 24px;border-radius:4px;z-index:9999;';
      errorDiv.textContent = 'Translation loading failed. Please refresh the page.';
      body.appendChild(errorDiv);
    }
  }
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===== Legal link helper =====
function setLegalLink(page) {
  const lang = mapToB24(detectSiteLanguage());
  window.location.href = `/legal/${page}.html?lang=${lang}`;
  return false;
}

// Make setLegalLink global
window.setLegalLink = setLegalLink;

// ===== Beds24 iframe message handlers =====
window.addEventListener('message', function(e){
  try{
    const d = typeof e.data==='string' ? JSON.parse(e.data) : e.data;
    
    // Handle dynamic height updates
    if (d && (d.type==='setHeight' || d.height)){
      const h = parseInt(d.height,10);
      if (Number.isFinite(h) && h > 400){
        document.getElementById('beds24frame').style.height = (h + 40) + 'px';
      }
    }
    
    // Handle scroll-to-top
    if (d && d.type === 'scrollToTop') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }catch(_){}
});

// ===== Year update =====
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ===== Back to Top button =====
(function() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;
  
  function toggleBackToTopButton() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }
  
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  window.addEventListener('scroll', toggleBackToTopButton);
  toggleBackToTopButton();
})();

// ===== Unit navigation and button translation =====
(async function() {
  const ROOM_IDS = {
    'safari': 28169,
    'comfort': 28168,
    'cottage': 28167,
    'chalet': 28166
  };
  
  async function initUnitNavigation() {
    const unitBtns = document.querySelectorAll('.unit-btn');
    if (unitBtns.length === 0) return;
    
    // Load translations for unit button labels
    const siteLang = detectSiteLanguage();
    const code = mapToB24(siteLang);
    const TT = await loadTranslation(code);
    
    // Translate unit buttons
    const btnSafari = document.getElementById('t-safari');
    const btnComfort = document.getElementById('t-comfort');
    const btnCottage = document.getElementById('t-cottage');
    const btnChalet = document.getElementById('t-chalet');
    
    if (btnSafari && TT.units) btnSafari.textContent = TT.units.safari;
    if (btnComfort && TT.units) btnComfort.textContent = TT.units.comfort;
    if (btnCottage && TT.units) btnCottage.textContent = TT.units.cottage;
    if (btnChalet && TT.units) btnChalet.textContent = TT.units.chalet;
    
    // Setup click handlers
    unitBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const unitKey = this.getAttribute('data-unit');
        const roomId = ROOM_IDS[unitKey];
        if (roomId) {
          switchToRoom(roomId, unitKey);
        }
      });
    });
    
    // Check for preselected unit in URL
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedUnit = urlParams.get('unit');
    
    if (preselectedUnit && ROOM_IDS[preselectedUnit]) {
      switchToRoom(ROOM_IDS[preselectedUnit], preselectedUnit);
    } else {
      // Default: show all rooms
      document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    }
  }
  
  function switchToRoom(roomId, unitKey) {
    const iframe = document.getElementById('beds24frame');
    if (!iframe) return;
    
    const siteLang = detectSiteLanguage();
    const siteCurrency = detectSiteCurrency();
    const lang = mapToB24(siteLang);
    
    const url = new URL('https://beds24.com/booking2.php?propid=297012&layout=5');
    url.searchParams.set('lang', lang);
    if (siteCurrency) url.searchParams.set('cur', siteCurrency.toUpperCase());
    if (roomId) url.searchParams.set('roomid', roomId);
    
    // Carry through other params
    const pageQS = new URLSearchParams(location.search);
    pageQS.forEach((v, k) => {
      if (k !== 'lang' && k !== 'currency' && k !== 'cur' && k !== 'unit' && !url.searchParams.has(k)) {
        url.searchParams.set(k, v);
      }
    });
    
    iframe.src = url.toString();
    console.log('Switched to unit:', unitKey, 'Room ID:', roomId || 'all');
    
    // Update active button
    document.querySelectorAll('.unit-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-unit="${unitKey}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // Scroll to booking iframe
    setTimeout(() => {
      const bookSection = document.getElementById('book');
      if (bookSection) {
        bookSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }
  
  // Make switchToRoom available globally for onclick handlers if needed
  window.switchToRoom = switchToRoom;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUnitNavigation);
  } else {
    initUnitNavigation();
  }
})();
