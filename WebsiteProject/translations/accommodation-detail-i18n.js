/**
 * Accommodation Detail Pages i18n System
 * Standalone vanilla JavaScript translation system for safari.html, comfort.html, cottage.html, chalet.html
 */

// Supported languages (must match main site)
const SUPPORTED_LANGS = [
  "en", "en-US", "pt-PT", "pt-BR", "nl", "fr", "it", "de", "es",
  "sv", "pl", "af-ZA", "zu", "sw", "ja", "zh", "ru"
];

// Map country codes to primary language (IP-based fallback)
const CC_TO_LANGUAGE = {
  // English-speaking countries
  US: "en-US", GB: "en", IE: "en", AU: "en", NZ: "en", CA: "en",
  ZA: "en", NA: "en", ZW: "en", BW: "en", NG: "en", GH: "en", ZM: "en", MW: "en",
  SZ: "en", LS: "en", MU: "en", SC: "en", JM: "en", TT: "en",
  BB: "en", FJ: "en", PG: "en", SB: "en", VU: "en",
  
  // Portuguese-speaking countries
  PT: "pt-PT", BR: "pt-BR", MZ: "pt-BR", AO: "pt-BR",
  
  // Dutch-speaking countries
  NL: "nl", BE: "nl", SR: "nl",
  
  // French-speaking countries
  FR: "fr", MC: "fr", LU: "fr", CH: "fr", RE: "fr",
  SN: "fr", CI: "fr", CM: "fr", DJ: "fr", NC: "fr", PF: "fr",
  
  // Italian-speaking countries
  IT: "it", SM: "it", VA: "it",
  
  // German-speaking countries
  DE: "de", AT: "de", LI: "de",
  
  // Spanish-speaking countries
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es",
  CL: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es",
  HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es",
  UY: "es", GQ: "es",
  
  // Swedish-speaking countries
  SE: "sv", FI: "sv",
  
  // Polish-speaking countries
  PL: "pl",
  
  // Japanese-speaking countries
  JP: "ja",
  
  // Chinese-speaking countries/regions
  CN: "zh", HK: "zh", TW: "zh", SG: "zh",
  
  // Russian-speaking countries
  RU: "ru", BY: "ru", KZ: "ru", UA: "ru", UZ: "ru", KG: "ru",
  
  // Swahili-speaking countries
  KE: "sw", TZ: "sw", UG: "sw",
};

// Comprehensive country-to-currency mapping
const CC_TO_CURRENCY = {
  // Europe
  GB: "GBP", IE: "EUR", NL: "EUR", BE: "EUR", FR: "EUR",
  DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", AT: "EUR",
  FI: "EUR", SE: "SEK", PL: "PLN", NO: "NOK", DK: "DKK",
  CH: "CHF", CZ: "CZK", HU: "HUF",
  
  // Africa
  ZA: "ZAR", MZ: "MZN", KE: "KES", TZ: "TZS", UG: "UGX",
  ZW: "USD", BW: "BWP", NA: "NAD",
  
  // Americas
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS",
  
  // Asia & Middle East
  CN: "CNY", JP: "JPY", IN: "INR", TH: "THB",
  SG: "SGD", RU: "RUB",
  
  // Oceania
  AU: "AUD", NZ: "NZD",
};

// Import translations from accommodation-translations.json
const TRANSLATIONS = {
  "common": {
    "en": {
      "backToAccommodations": "Back to Accommodations",
      "readyToBook": "Ready to Book",
      "secureYourEscape": "Secure your nature-immersed escape at DEVOCEAN Lodge. Direct booking means the best rates and full support from our team.",
      "bookYourStay": "Book Your Stay",
      "viewAllAccommodations": "View All Accommodations"
    },
    "en-us": {
      "backToAccommodations": "Back to Accommodations",
      "readyToBook": "Ready to Book",
      "secureYourEscape": "Secure your nature-immersed escape at DEVOCEAN Lodge. Direct booking means the best rates and full support from our team.",
      "bookYourStay": "Book Your Stay",
      "viewAllAccommodations": "View All Accommodations"
    },
    "pt": {
      "backToAccommodations": "Voltar às Acomodações",
      "readyToBook": "Pronto para Reservar",
      "secureYourEscape": "Garanta sua escapada imersa na natureza no DEVOCEAN Lodge. Reserva direta significa melhores tarifas e suporte completo da nossa equipe.",
      "bookYourStay": "Reserve Sua Estadia",
      "viewAllAccommodations": "Ver Todas as Acomodações"
    },
    "nl": {
      "backToAccommodations": "Terug naar Accommodaties",
      "readyToBook": "Klaar om te Boeken",
      "secureYourEscape": "Verzeker uw natuurlijke ontsnapping bij DEVOCEAN Lodge. Direct boeken betekent de beste tarieven en volledige ondersteuning van ons team.",
      "bookYourStay": "Boek Uw Verblijf",
      "viewAllAccommodations": "Bekijk Alle Accommodaties"
    },
    "fr": {
      "backToAccommodations": "Retour aux Hébergements",
      "readyToBook": "Prêt à Réserver",
      "secureYourEscape": "Sécurisez votre évasion immergée dans la nature au DEVOCEAN Lodge. La réservation directe signifie les meilleurs tarifs et un soutien complet de notre équipe.",
      "bookYourStay": "Réservez Votre Séjour",
      "viewAllAccommodations": "Voir Tous les Hébergements"
    },
    "it": {
      "backToAccommodations": "Torna agli Alloggi",
      "readyToBook": "Pronto a Prenotare",
      "secureYourEscape": "Assicurati la tua fuga immersa nella natura al DEVOCEAN Lodge. La prenotazione diretta significa le migliori tariffe e il supporto completo del nostro team.",
      "bookYourStay": "Prenota il Tuo Soggiorno",
      "viewAllAccommodations": "Vedi Tutti gli Alloggi"
    },
    "de": {
      "backToAccommodations": "Zurück zu Unterkünften",
      "readyToBook": "Bereit zu Buchen",
      "secureYourEscape": "Sichern Sie sich Ihren naturverbundenen Rückzugsort im DEVOCEAN Lodge. Direktbuchung bedeutet beste Preise und volle Unterstützung von unserem Team.",
      "bookYourStay": "Buchen Sie Ihren Aufenthalt",
      "viewAllAccommodations": "Alle Unterkünfte Ansehen"
    },
    "es": {
      "backToAccommodations": "Volver a Alojamientos",
      "readyToBook": "Listo para Reservar",
      "secureYourEscape": "Asegure su escape inmerso en la naturaleza en DEVOCEAN Lodge. La reserva directa significa las mejores tarifas y el apoyo completo de nuestro equipo.",
      "bookYourStay": "Reserve Su Estadía",
      "viewAllAccommodations": "Ver Todos los Alojamientos"
    },
    "sv": {
      "backToAccommodations": "Tillbaka till Boenden",
      "readyToBook": "Redo att Boka",
      "secureYourEscape": "Säkra din naturinspirerade flykt på DEVOCEAN Lodge. Direktbokning innebär bästa priser och fullt stöd från vårt team.",
      "bookYourStay": "Boka Din Vistelse",
      "viewAllAccommodations": "Se Alla Boenden"
    },
    "pl": {
      "backToAccommodations": "Powrót do Zakwaterowania",
      "readyToBook": "Gotowy do Rezerwacji",
      "secureYourEscape": "Zabezpiecz swój pobyt w przyrodzie w DEVOCEAN Lodge. Bezpośrednia rezerwacja oznacza najlepsze ceny i pełne wsparcie naszego zespołu.",
      "bookYourStay": "Zarezerwuj Swój Pobyt",
      "viewAllAccommodations": "Zobacz Wszystkie Zakwaterowanie"
    },
    "af": {
      "backToAccommodations": "Terug na Akkommodasie",
      "readyToBook": "Gereed om te Bespreek",
      "secureYourEscape": "Verseker jou natuurgeïnspireerde ontvlugting by DEVOCEAN Lodge. Direkte bespreking beteken die beste tariewe en volledige ondersteuning van ons span.",
      "bookYourStay": "Bespreek Jou Verblyf",
      "viewAllAccommodations": "Bekyk Alle Akkommodasie"
    },
    "zu": {
      "backToAccommodations": "Buyela Ezindaweni Zokuhlala",
      "readyToBook": "Kulungele Ukubhukha",
      "secureYourEscape": "Qinisekisa ukubaleka kwakho emvelweni ku-DEVOCEAN Lodge. Ukubhukha ngqo kusho amanani angcono nokusekelwa okugcwele yithimba lethu.",
      "bookYourStay": "Bhukha Ukunhlala Kwakho",
      "viewAllAccommodations": "Buka Zonke Izindawo Zokuhlala"
    },
    "sw": {
      "backToAccommodations": "Rudi kwa Malazi",
      "readyToBook": "Tayari Kuhifadhi",
      "secureYourEscape": "Hakikisha utoroaji wako katika asili katika DEVOCEAN Lodge. Uhifadhi wa moja kwa moja maana bei bora na usaidizi kamili kutoka kwa timu yetu.",
      "bookYourStay": "Hifadhi Kukaa Kwako",
      "viewAllAccommodations": "Tazama Malazi Yote"
    },
    "ja": {
      "backToAccommodations": "宿泊施設に戻る",
      "readyToBook": "予約準備完了",
      "secureYourEscape": "DEVOCEAN Lodgeで自然に浸る逃避を確保してください。直接予約は最高の料金と私たちのチームからの完全なサポートを意味します。",
      "bookYourStay": "ご滞在を予約",
      "viewAllAccommodations": "すべての宿泊施設を表示"
    },
    "zh": {
      "backToAccommodations": "返回住宿",
      "readyToBook": "准备预订",
      "secureYourEscape": "在DEVOCEAN Lodge确保您沉浸在大自然中的逃离。直接预订意味着最优惠的价格和我们团队的全力支持。",
      "bookYourStay": "预订您的住宿",
      "viewAllAccommodations": "查看所有住宿"
    },
    "ru": {
      "backToAccommodations": "Вернуться к Размещению",
      "readyToBook": "Готовы Забронировать",
      "secureYourEscape": "Обеспечьте свой побег в природу в DEVOCEAN Lodge. Прямое бронирование означает лучшие цены и полную поддержку от нашей команды.",
      "bookYourStay": "Забронируйте Ваше Пребывание",
      "viewAllAccommodations": "Посмотреть Все Варианты Размещения"
    }
  }
};

// Detect language
function detectLanguage() {
  // 1. Check localStorage
  const stored = localStorage.getItem('site.lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  // 2. Check browser language
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  
  // Special cases: preserve specific language-region codes with proper capitalization
  if (browserLang === "en-us" || browserLang.startsWith("en-us")) return "en-US";
  if (browserLang === "af-za" || browserLang.startsWith("af-za")) return "af-ZA";
  if (browserLang === "pt-pt" || browserLang.startsWith("pt-pt")) return "pt-PT";
  if (browserLang === "pt-br" || browserLang.startsWith("pt-br")) return "pt-BR";
  if (browserLang === "pt-mz" || browserLang.startsWith("pt-mz")) return "pt-BR";
  
  // Check if it's a base language we support
  const baseLang = browserLang.split('-')[0];
  if (SUPPORTED_LANGS.includes(baseLang)) {
    return baseLang;
  }

  // 3. Check Cloudflare IP geolocation
  const countryCode = window.__CF_COUNTRY__ || null;
  if (countryCode && CC_TO_LANGUAGE[countryCode]) {
    return CC_TO_LANGUAGE[countryCode];
  }

  // 4. Default to English
  return 'en';
}

// Detect currency
function detectCurrency() {
  // 1. Check localStorage
  const stored = localStorage.getItem('site.currency');
  if (stored) {
    return stored;
  }

  // 2. Check Cloudflare IP geolocation
  const countryCode = window.__CF_COUNTRY__ || null;
  if (countryCode && CC_TO_CURRENCY[countryCode]) {
    return CC_TO_CURRENCY[countryCode];
  }

  // 3. Default to USD
  return 'USD';
}

// Get locale for Hotelrunner
function getHotelrunnerLocale(lang) {
  const localeMap = {
    'en': 'en-GB',
    'en-US': 'en-US',
    'pt-PT': 'pt-PT',
    'pt-BR': 'pt-BR',
    'nl': 'nl-NL',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'de': 'de-DE',
    'es': 'es-ES',
    'sv': 'sv',
    'pl': 'pl',
    'af-ZA': 'af-ZA',
    'zu': 'en-GB',
    'sw': 'sw',
    'ja': 'ja-JP',
    'zh': 'zh-CN',
    'ru': 'ru'
  };
  return localeMap[lang] || 'en-GB';
}

// Apply translations to page
function applyTranslations(lang) {
  // Map language-region codes to base language keys for translations
  const translationKey = 
    (lang === "en-US") ? "en" :
    (lang === "pt-PT" || lang === "pt-BR") ? "pt" :
    (lang === "af-ZA") ? "af" :
    lang;
  
  const t = TRANSLATIONS.common[translationKey] || TRANSLATIONS.common['en'];
  
  // Update common text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update booking URLs
  const currency = detectCurrency();
  const locale = getHotelrunnerLocale(lang);
  const bookingUrl = `https://book.devoceanlodge.com/bv3/search?locale=${locale}&currency=${currency}`;
  
  document.querySelectorAll('a[href*="book.devoceanlodge.com"]').forEach(link => {
    link.href = bookingUrl;
  });

  // Update page language attribute
  document.documentElement.lang = lang;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const lang = detectLanguage();
  applyTranslations(lang);
});
