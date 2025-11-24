/**
 * Accommodation Detail Pages i18n System
 * Standalone vanilla JavaScript translation system for safari.html, comfort.html, cottage.html, chalet.html
 */

// Supported languages (must match main site)
const SUPPORTED_LANGS = [
  "en-GB", "en-US", "pt-PT", "pt-BR", "nl-NL", "fr-FR", "it-IT", "de-DE", "es-ES",
  "sv", "pl", "af-ZA", "zu", "sw", "ja-JP", "zh-CN", "ru"
];

// Map country codes to primary language (IP-based fallback)
const CC_TO_LANGUAGE = {
  // English-speaking countries
  US: "en-US", GB: "en-GB", IE: "en-GB", AU: "en-GB", NZ: "en-GB", CA: "en-GB",
  ZA: "en-GB", NA: "en-GB", ZW: "en-GB", BW: "en-GB", NG: "en-GB", GH: "en-GB", ZM: "en-GB", MW: "en-GB",
  SZ: "en-GB", LS: "en-GB", MU: "en-GB", SC: "en-GB", JM: "en-GB", TT: "en-GB",
  BB: "en-GB", FJ: "en-GB", PG: "en-GB", SB: "en-GB", VU: "en-GB",
  
  // Portuguese-speaking countries
  PT: "pt-PT", BR: "pt-BR", MZ: "pt-BR", AO: "pt-BR",
  
  // Dutch-speaking countries
  NL: "nl-NL", BE: "nl-NL", SR: "nl-NL",
  
  // French-speaking countries
  FR: "fr-FR", MC: "fr-FR", LU: "fr-FR", CH: "fr-FR", RE: "fr-FR",
  SN: "fr-FR", CI: "fr-FR", CM: "fr-FR", DJ: "fr-FR", NC: "fr-FR", PF: "fr-FR",
  
  // Italian-speaking countries
  IT: "it-IT", SM: "it-IT", VA: "it-IT",
  
  // German-speaking countries
  DE: "de-DE", AT: "de-DE", LI: "de-DE",
  
  // Spanish-speaking countries
  ES: "es-ES", MX: "es-ES", AR: "es-ES", CO: "es-ES", PE: "es-ES", VE: "es-ES",
  CL: "es-ES", EC: "es-ES", GT: "es-ES", CU: "es-ES", BO: "es-ES", DO: "es-ES",
  HN: "es-ES", PY: "es-ES", SV: "es-ES", NI: "es-ES", CR: "es-ES", PA: "es-ES",
  UY: "es-ES", GQ: "es-ES",
  
  // Swedish-speaking countries
  SE: "sv", FI: "sv",
  
  // Polish-speaking countries
  PL: "pl",
  
  // Japanese-speaking countries
  JP: "ja-JP",
  
  // Chinese-speaking countries/regions
  CN: "zh-CN", HK: "zh-CN", TW: "zh-CN", SG: "zh-CN",
  
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

// Map country codes to continents (for region-aware English fallback)
const CC_TO_CONTINENT = {
  // Europe
  GB: "europe", IE: "europe", NL: "europe", BE: "europe", FR: "europe", 
  DE: "europe", IT: "europe", ES: "europe", PT: "europe", AT: "europe",
  FI: "europe", SE: "europe", PL: "europe", GR: "europe", NO: "europe",
  DK: "europe", CH: "europe", CZ: "europe", HU: "europe", RO: "europe",
  RS: "europe", HR: "europe", SI: "europe", BA: "europe", BG: "europe",
  SK: "europe", EE: "europe", LV: "europe", LT: "europe", MT: "europe",
  CY: "europe", LU: "europe", IS: "europe", LI: "europe", MC: "europe",
  UA: "europe", BY: "europe", MD: "europe", AL: "europe", MK: "europe",
  ME: "europe", XK: "europe", AD: "europe", SM: "europe", VA: "europe",
  
  // Africa
  ZA: "africa", MZ: "africa", KE: "africa", TZ: "africa", UG: "africa",
  ZW: "africa", BW: "africa", NA: "africa", EG: "africa", MA: "africa",
  SZ: "africa", RE: "africa", MU: "africa", SC: "africa", LS: "africa",
  ZM: "africa", MW: "africa", AO: "africa", GH: "africa", NG: "africa", 
  ET: "africa", SD: "africa", DZ: "africa", TN: "africa", LY: "africa", 
  SN: "africa", CI: "africa", CM: "africa", RW: "africa", BI: "africa", 
  SO: "africa", DJ: "africa",
  
  // Americas
  US: "americas", CA: "americas", MX: "americas", BR: "americas", AR: "americas",
  CL: "americas", CO: "americas", PE: "americas", VE: "americas", EC: "americas",
  UY: "americas", PY: "americas", BO: "americas", CR: "americas", PA: "americas",
  GT: "americas", HN: "americas", SV: "americas", NI: "americas", CU: "americas",
  DO: "americas", HT: "americas", JM: "americas", TT: "americas", BB: "americas",
  
  // Asia & Middle East
  CN: "asia", JP: "asia", KR: "asia", IN: "asia", TH: "asia",
  SG: "asia", MY: "asia", ID: "asia", PH: "asia", VN: "asia",
  AE: "asia", SA: "asia", QA: "asia", KW: "asia", BH: "asia",
  OM: "asia", IL: "asia", JO: "asia", LB: "asia", TR: "asia",
  PK: "asia", BD: "asia", LK: "asia", NP: "asia", MM: "asia",
  KH: "asia", LA: "asia", MN: "asia", KZ: "asia", UZ: "asia",
  RU: "asia",
  
  // Oceania
  AU: "oceania", NZ: "oceania", FJ: "oceania", PG: "oceania", NC: "oceania",
  PF: "oceania", WS: "oceania", TO: "oceania", VU: "oceania", SB: "oceania",
};

// Import translations from accommodation-translations.json
// Define base translations first
const baseTranslations = {
  "en-GB": {
    "backToAccommodations": "Back to Accommodations",
    "readyToBook": "Ready to Book",
    "secureYourEscape": "Secure your nature-immersed escape at DEVOCEAN Lodge. Direct booking means the best rates and full support from our team.",
    "bookYourStay": "Book Your Stay",
    "viewAllAccommodations": "View All Accommodations"
  },
  "pt-PT": {
    "backToAccommodations": "Voltar às Acomodações",
    "readyToBook": "Pronto para Reservar",
    "secureYourEscape": "Garanta sua escapada imersa na natureza no DEVOCEAN Lodge. Reserva direta significa melhores tarifas e suporte completo da nossa equipe.",
    "bookYourStay": "Reserve Sua Estadia",
    "viewAllAccommodations": "Ver Todas as Acomodações"
  },
  "af-ZA": {
    "backToAccommodations": "Terug na Akkommodasie",
    "readyToBook": "Gereed om te Bespreek",
    "secureYourEscape": "Verseker jou natuurgeïnspireerde ontvlugting by DEVOCEAN Lodge. Direkte bespreking beteken die beste tariewe en volledige ondersteuning van ons span.",
    "bookYourStay": "Bespreek Jou Verblyf",
    "viewAllAccommodations": "Bekyk Alle Akkommodasie"
  }
};

const TRANSLATIONS = {
  "common": {
    "en-GB": baseTranslations["en-GB"],
    "en-US": baseTranslations["en-GB"], // US English uses same translations as UK English
    "pt-PT": baseTranslations["pt-PT"], // Portugal Portuguese
    "pt-BR": baseTranslations["pt-PT"], // Brazilian Portuguese (same translations)
    "af-ZA": baseTranslations["af-ZA"], // Afrikaans (South Africa)
    "nl-NL": {
      "backToAccommodations": "Terug naar Accommodaties",
      "readyToBook": "Klaar om te Boeken",
      "secureYourEscape": "Verzeker uw natuurlijke ontsnapping bij DEVOCEAN Lodge. Direct boeken betekent de beste tarieven en volledige ondersteuning van ons team.",
      "bookYourStay": "Boek Uw Verblijf",
      "viewAllAccommodations": "Bekijk Alle Accommodaties"
    },
    "fr-FR": {
      "backToAccommodations": "Retour aux Hébergements",
      "readyToBook": "Prêt à Réserver",
      "secureYourEscape": "Sécurisez votre évasion immergée dans la nature au DEVOCEAN Lodge. La réservation directe signifie les meilleurs tarifs et un soutien complet de notre équipe.",
      "bookYourStay": "Réservez Votre Séjour",
      "viewAllAccommodations": "Voir Tous les Hébergements"
    },
    "it-IT": {
      "backToAccommodations": "Torna agli Alloggi",
      "readyToBook": "Pronto a Prenotare",
      "secureYourEscape": "Assicurati la tua fuga immersa nella natura al DEVOCEAN Lodge. La prenotazione diretta significa le migliori tariffe e il supporto completo del nostro team.",
      "bookYourStay": "Prenota il Tuo Soggiorno",
      "viewAllAccommodations": "Vedi Tutti gli Alloggi"
    },
    "de-DE": {
      "backToAccommodations": "Zurück zu Unterkünften",
      "readyToBook": "Bereit zu Buchen",
      "secureYourEscape": "Sichern Sie sich Ihren naturverbundenen Rückzugsort im DEVOCEAN Lodge. Direktbuchung bedeutet beste Preise und volle Unterstützung von unserem Team.",
      "bookYourStay": "Buchen Sie Ihren Aufenthalt",
      "viewAllAccommodations": "Alle Unterkünfte Ansehen"
    },
    "es-ES": {
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
    "ja-JP": {
      "backToAccommodations": "宿泊施設に戻る",
      "readyToBook": "予約準備完了",
      "secureYourEscape": "DEVOCEAN Lodgeで自然に浸る逃避を確保してください。直接予約は最高の料金と私たちのチームからの完全なサポートを意味します。",
      "bookYourStay": "ご滞在を予約",
      "viewAllAccommodations": "すべての宿泊施設を表示"
    },
    "zh-CN": {
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

// Normalize language code to Hotelrunner locale format
function normLang(raw) {
  if (!raw) return "en-GB";
  let s = String(raw).toLowerCase();
  
  // Preserve full Hotelrunner locale codes with proper capitalization
  if (s === "en-gb" || s === "en") return "en-GB";
  if (s === "en-us") return "en-US";
  if (s === "pt-pt") return "pt-PT";
  if (s === "pt-br") return "pt-BR";
  if (s === "pt-mz") return "pt-BR"; // Mozambique uses Brazilian variant
  if (s === "pt") return "pt-BR"; // Default Portuguese to Brazilian variant (covers Mozambique/Angola/Brazil)
  if (s === "nl-nl" || s === "nl" || s.startsWith("nl-")) return "nl-NL";
  if (s === "fr-fr" || s === "fr" || s.startsWith("fr-")) return "fr-FR";
  if (s === "it-it" || s === "it" || s.startsWith("it-")) return "it-IT";
  if (s === "de-de" || s === "de" || s.startsWith("de-")) return "de-DE";
  if (s === "es-es" || s === "es" || s.startsWith("es-")) return "es-ES";
  if (s === "ja-jp" || s === "ja" || s.startsWith("ja-")) return "ja-JP";
  if (s === "zh-cn" || s === "zh" || s.startsWith("zh-")) return "zh-CN";
  if (s === "af-za" || s === "af" || s.startsWith("af-")) return "af-ZA";
  if (s === "sv" || s.startsWith("sv-")) return "sv";
  if (s === "pl" || s.startsWith("pl-")) return "pl";
  if (s === "ru" || s.startsWith("ru-")) return "ru";
  if (s === "zu" || s.startsWith("zu-")) return "zu";
  if (s === "sw" || s.startsWith("sw-")) return "sw";
  
  return "en-GB";
}

// Get URL parameter
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Detect language
function detectLanguage() {
  // 1. Check URL parameter (for navigation from main site)
  const urlLang = getUrlParam('lang');
  if (urlLang) {
    const normalized = normLang(urlLang);
    if (SUPPORTED_LANGS.includes(normalized)) {
      // Store in localStorage for consistency
      localStorage.setItem('site.lang', normalized);
      return normalized;
    }
  }

  // 2. Check localStorage
  const stored = localStorage.getItem('site.lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  // Get country code for IP-based fallback
  const countryCode = window.__CF_COUNTRY__ || null;

  // 3. Check browser language preferences (loop through ALL preferences)
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const lower = String(l || "").toLowerCase();
    
    // Normalize browser language to our Hotelrunner codes
    const normalized = normLang(lower);
    if (SUPPORTED_LANGS.includes(normalized)) return normalized;
  }

  // 4. Use IP-based country → language mapping
  // This catches visitors with non-local browser settings (e.g., English browser in Japan)
  if (countryCode && CC_TO_LANGUAGE[countryCode]) {
    return CC_TO_LANGUAGE[countryCode];
  }

  // Final fallback to region-aware English
  // Americas → US English, others → UK English
  const continent = countryCode ? CC_TO_CONTINENT[countryCode] : null;
  if (continent === "americas") {
    return "en-US";
  }
  return 'en-GB'; // UK English for Europe, Asia, Oceania, Africa
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

// Get locale for Hotelrunner (now 1:1 mapping with unified codes)
function getHotelrunnerLocale(lang) {
  const localeMap = {
    'en-GB': 'en-GB',
    'en-US': 'en-US',
    'pt-PT': 'pt-PT',
    'pt-BR': 'pt-BR',
    'nl-NL': 'nl-NL',
    'fr-FR': 'fr-FR',
    'it-IT': 'it-IT',
    'de-DE': 'de-DE',
    'es-ES': 'es-ES',
    'sv': 'sv',
    'pl': 'pl',
    'af-ZA': 'af-ZA',
    'zu': 'en-GB', // Zulu maps to English for Hotelrunner
    'sw': 'sw',
    'ja-JP': 'ja-JP',
    'zh-CN': 'zh-CN',
    'ru': 'ru'
  };
  return localeMap[lang] || 'en-GB';
}

// Load full accommodation translations from JSON
async function loadAccommodationTranslations(lang) {
  try {
    const response = await fetch('/translations/accommodation-translation-template.json');
    if (!response.ok) throw new Error('Failed to load accommodation translations');
    const data = await response.json();
    
    // Direct lookup - JSON now uses unified Hotelrunner locale codes
    console.log('Loading accommodation translations for:', lang);
    
    return data[lang] || data['en-GB'];
  } catch (error) {
    console.error('Error loading accommodation translations:', error);
    return null;
  }
}

// Detect which unit page we're on
function detectUnitType() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('safari')) return 'safari';
  if (path.includes('comfort')) return 'comfort';
  if (path.includes('cottage')) return 'cottage';
  if (path.includes('chalet')) return 'chalet';
  return null;
}

// Apply translations to page
async function applyTranslations(lang) {
  console.log('Accommodation page detected language:', lang);
  
  // Update common UI elements (buttons, nav)
  const t = TRANSLATIONS.common[lang] || TRANSLATIONS.common['en-GB'];
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

  // Load and apply full unit translations
  const unitType = detectUnitType();
  if (unitType) {
    const translations = await loadAccommodationTranslations(lang);
    if (translations && translations[unitType]) {
      const unitData = translations[unitType];
      console.log('Applying unit translations for:', unitType, lang);
      
      // Update eyebrow (unit type badge) - support both new and legacy structure
      const eyebrowEl = document.querySelector('.dl-eyebrow');
      if (eyebrowEl) {
        eyebrowEl.textContent = unitData.eyebrow || unitData.title || eyebrowEl.textContent;
      }
      
      // Update hero title - preserve any + symbol styling - support both new and legacy structure
      const titleEl = document.querySelector('.dl-title');
      const titleText = unitData.heroTitle || unitData.title;
      if (titleEl && titleText) {
        if (titleText.includes(' + ')) {
          // Safe DOM manipulation: split text and create span element
          const parts = titleText.split(' + ');
          titleEl.textContent = ''; // Clear existing content
          titleEl.appendChild(document.createTextNode(parts[0] + ' '));
          const plusSpan = document.createElement('span');
          plusSpan.textContent = '+';
          titleEl.appendChild(plusSpan);
          if (parts[1]) {
            titleEl.appendChild(document.createTextNode(' ' + parts[1]));
          }
        } else {
          titleEl.textContent = titleText;
        }
      }
      
      // Update hero description - support both new and legacy structure
      const subEl = document.querySelector('.dl-hero .dl-sub');
      const descriptionText = unitData.heroDescription || unitData.shortDescription;
      if (subEl && descriptionText) {
        subEl.textContent = descriptionText;
      }
      
      // Update sections (headings, descriptions, features) - NEW STRUCTURE
      if (unitData.sections && Array.isArray(unitData.sections)) {
        const cards = document.querySelectorAll('.dl-card');
        
        unitData.sections.forEach((section, sectionIndex) => {
          if (sectionIndex < cards.length) {
            const card = cards[sectionIndex];
            
            // Update section heading
            const heading = card.querySelector('.dl-h2');
            if (heading && section.heading) {
              heading.textContent = section.heading;
            }
            
            // Update section description (first paragraph)
            const paragraphs = card.querySelectorAll('p');
            if (paragraphs[0] && section.description) {
              paragraphs[0].textContent = section.description;
            }
            
            // Update closing note if present (second paragraph in "Good to Know")
            if (paragraphs[1] && section.closingNote) {
              paragraphs[1].textContent = section.closingNote;
            }
            
            // Update features/bullet points
            if (section.features && Array.isArray(section.features)) {
              const bulletList = card.querySelector('ul.dl-proofs');
              if (bulletList) {
                const items = bulletList.querySelectorAll('li');
                section.features.forEach((feature, featureIndex) => {
                  if (featureIndex < items.length) {
                    const iconSpan = items[featureIndex].querySelector('.i');
                    if (iconSpan) {
                      // Safe DOM manipulation: preserve icon, update text
                      items[featureIndex].textContent = '';
                      items[featureIndex].appendChild(iconSpan.cloneNode(true));
                      items[featureIndex].appendChild(document.createTextNode(' ' + feature));
                    } else {
                      items[featureIndex].textContent = feature;
                    }
                  }
                });
              }
            }
          }
        });
        
        console.log(`Updated ${unitData.sections.length} sections`);
      }
      // LEGACY FALLBACK: Update bullet points with detailedFeatures (for comfort/cottage/chalet)
      else if (unitData.detailedFeatures && Array.isArray(unitData.detailedFeatures)) {
        const bulletLists = document.querySelectorAll('ul.dl-proofs');
        let featureIndex = 0;
        
        bulletLists.forEach(list => {
          const items = list.querySelectorAll('li');
          items.forEach(item => {
            if (featureIndex < unitData.detailedFeatures.length) {
              const iconSpan = item.querySelector('.i');
              const feature = unitData.detailedFeatures[featureIndex];
              
              if (iconSpan) {
                // Safe DOM manipulation: preserve icon, update text
                item.textContent = '';
                item.appendChild(iconSpan.cloneNode(true));
                item.appendChild(document.createTextNode(' ' + feature));
              } else {
                item.textContent = feature;
              }
              
              featureIndex++;
            }
          });
        });
        
        console.log(`Updated ${featureIndex} features (legacy structure)`);
      }
      
      // Update trust items
      if (unitData.trustItems && Array.isArray(unitData.trustItems)) {
        const trustItems = document.querySelectorAll('.dl-trust-item');
        unitData.trustItems.forEach((text, index) => {
          if (index < trustItems.length) {
            const iconSpan = trustItems[index].querySelector('.i');
            if (iconSpan) {
              // Safe DOM manipulation: preserve icon, update text
              trustItems[index].textContent = '';
              trustItems[index].appendChild(iconSpan.cloneNode(true));
              trustItems[index].appendChild(document.createTextNode(' ' + text));
            } else {
              trustItems[index].textContent = text;
            }
          }
        });
      }
      
      // Update CTA section
      if (unitData.cta) {
        const ctaHeading = document.querySelector('.dl-cta h2');
        const ctaDescription = document.querySelector('.dl-cta p');
        
        if (ctaHeading && unitData.cta.heading) {
          ctaHeading.textContent = unitData.cta.heading;
        }
        if (ctaDescription && unitData.cta.description) {
          ctaDescription.textContent = unitData.cta.description;
        }
      }
    }
  }

  // Update booking URLs - map to new static booking pages
  const currency = detectCurrency();
  
  // Map locale to booking page filename (EN.html, DE.html, etc.)
  function getBookingPage(locale) {
    const langMap = {
      'en-GB': 'EN', 'en-US': 'EN', 'en': 'EN',
      'de-DE': 'DE', 'de': 'DE',
      'pt-PT': 'PT', 'pt-BR': 'PT', 'pt': 'PT',
      'fr-FR': 'FR', 'fr': 'FR',
      'it-IT': 'IT', 'it': 'IT',
      'nl-NL': 'NL', 'nl': 'NL',
      'es-ES': 'ES', 'es': 'ES',
      'ja-JP': 'JA', 'ja': 'JA',
      'zh-CN': 'ZH', 'zh': 'ZH',
      'ru': 'RU',
      'sv': 'SV',
      'pl': 'PL',
      'af-ZA': 'AF', 'af': 'AF',
      'zu': 'ZU',
      'sw': 'SW'
    };
    return langMap[locale] || 'EN';
  }
  
  const bookingPage = getBookingPage(lang);
  const bookingUrl = `/book/${bookingPage}.html?currency=${currency}`;
  
  document.querySelectorAll('a[href*="book.devoceanlodge.com"]').forEach(link => {
    link.href = bookingUrl;
  });

  // Update page language attribute
  document.documentElement.lang = lang;
}

// Initialize on page load - handle both loading and already-loaded states
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const lang = detectLanguage();
    applyTranslations(lang);
  });
} else {
  // DOM already loaded, execute immediately
  const lang = detectLanguage();
  applyTranslations(lang);
}
