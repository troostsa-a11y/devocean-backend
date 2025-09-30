import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Menu, X, Phone, Mail, MapPin, CalendarCheck2,
  Globe2 as Globe,
  Star, Facebook, Instagram, Bird, Briefcase,
  PlayCircle, Pin, Music, ChevronDown,
  MessageCircle
} from "lucide-react";

function App() {
  // ===== 1) Keep your layout recalculation =====
  useEffect(() => {
    const docEl = document.documentElement;

    const recalc = () => {
      const topbar = document.querySelector(".topbar");
      const header = document.querySelector("header"); // your main nav bar
      const stack =
        (topbar?.offsetHeight || 0) + (header?.offsetHeight || 0);
      docEl.style.setProperty("--stack-h", `${stack}px`);
    };

    recalc();
    window.addEventListener("resize", recalc, { passive: true });
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // ===== 2) Bootstrap language/currency + expose global setter =====
  useEffect(() => {
    // --- migrate any legacy keys you may have used previously ---
    try {
      // 1) pref.lang → site.lang (once)
      const legacyLang = localStorage.getItem("pref.lang");
      if (legacyLang && !localStorage.getItem("site.lang")) {
        localStorage.setItem("site.lang", normLang(legacyLang));
        localStorage.setItem("site.lang_source", "user");
      }

      // 2) pref.currency → site.currency (once)
      const legacyCur = localStorage.getItem("pref.currency");
      if (legacyCur && !localStorage.getItem("site.currency")) {
        localStorage.setItem("site.currency", clampCur(legacyCur) || "EUR");
      }

      // 3) site:currency (colon) → site.currency (dot)
      const weirdCur = localStorage.getItem("site:currency");
      if (weirdCur && !localStorage.getItem("site.currency")) {
        localStorage.setItem("site.currency", clampCur(weirdCur) || "EUR");
      }

      // 4) site:lang (colon) → site.lang (dot)
      const weirdLang = localStorage.getItem("site:lang");
      if (weirdLang && !localStorage.getItem("site.lang")) {
        localStorage.setItem("site.lang", normLang(weirdLang));
        localStorage.setItem("site.lang_source", "user");
      }

      // 5) ensure lang_source always set
      if (!localStorage.getItem("site.lang_source")) {
        localStorage.setItem("site.lang_source", "auto");
      }
    } catch { }

    // --- resolve language (AUTO on first boot, USER once selected) ---
    let lang = localStorage.getItem("site.lang");
    let source = localStorage.getItem("site.lang_source"); // "auto" | "user"

    if (!lang || !source) {
      const base = pickInitialLang(); // from browser, see helpers below
      lang = normLang(base);
      try {
        localStorage.setItem("site.lang", lang);
        localStorage.setItem("site.lang_source", "auto");
      } catch { }
    }

    // --- resolve currency (URL → saved → hints/region → EUR) ---
    let currency = localStorage.getItem("site.currency");
    if (!currency) {
      currency = pickInitialCurrency(lang);
      try {
        localStorage.setItem("site.currency", clampCur(currency) || "EUR");
      } catch { }
    }

    // reflect on <html lang="..."> for consistency
    try { document.documentElement.setAttribute("lang", lang); } catch { }

    // --- expose a cross-app global used by legal pages too ---
    if (!window.setSiteLocale) {
      // helper: write cross-page cookies (domain only on prod)
      const COOKIE_DOMAIN = ".devoceanlodge.com"; // ← change if your apex differs
      function setPrefCookies(lang, currency) {
        const isLocal =
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1" ||
          /^\d+\.\d+\.\d+\.\d+$/.test(location.hostname);

        const domainPart = isLocal ? "" : `;domain=${COOKIE_DOMAIN}`;
        const securePart = location.protocol === "https:" ? ";Secure" : "";
        const base = `;max-age=31536000;path=/;SameSite=Lax${domainPart}${securePart}`; // 1 year

        if (lang) document.cookie = `lang=${lang}${base}`;
        if (currency) document.cookie = `currency=${currency}${base}`;
      }

      window.setSiteLocale = function setSiteLocale({ lang: newLang, currency: newCur } = {}) {
        const L = newLang ? normLang(newLang) : (localStorage.getItem("site.lang") || "en");
        const C = newCur ? clampCur(newCur) : (localStorage.getItem("site.currency") || "EUR");

        try {
          localStorage.setItem("site.lang", L);
          localStorage.setItem("site.currency", C || "EUR");
          localStorage.setItem("site.lang_source", "user"); // mark as user-chosen
          document.documentElement.setAttribute("lang", L);
        } catch { }

        // NEW: sync across subdomains / legal pages
        setPrefCookies(L, C || "EUR");

        // If your app’s i18n needs to refresh immediately, you can:
        // window.location.reload();
      };
    }
  }, []);
}

/* ===== Auto-defaults (language & currency) ===== */
const SUPPORTED_LANGS = ["en", "pt", "nl", "fr", "it", "de", "es"]; // add "ptmz" if you want to expose the Moz flavor in the app

// Keep your exposed set; order doesn’t matter for logic
const ALLOWED_CURRENCIES = ["USD", "MZN", "ZAR", "EUR", "GBP"];

// Explicit country → currency (make sure NL is EUR)
const CC_TO_CURRENCY = {
  US: "USD",
  GB: "GBP",

  NL: "EUR", BE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR",
  PT: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",

  ZA: "ZAR",
  MZ: "MZN",
};

// Language hints (covers cases where region parsing fails)
const LANG_TO_CURRENCY_HINT = {
  "nl": "EUR",
  "de": "EUR",
  "fr": "EUR",
  "pt": "EUR",    // PT-PT; use a separate option if you ever want pt-BR → BRL
  "es": "EUR",
  "it": "EUR",
  "en-gb": "GBP",
  "en-us": "USD",
};

// Pull best-fit region from the browser’s locale list
function getRegionFromNavigator() {
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const m = String(l || "").toUpperCase().match(/-([A-Z]{2})/);
    if (m) return m[1]; // e.g. "GB", "ZA"
  }
  try {
    const loc = new Intl.DateTimeFormat().resolvedOptions().locale || "";
    const m = loc.toUpperCase().match(/-([A-Z]{2})/);
    if (m) return m[1];
  } catch { }
  return null;
}

function pickInitialLang() {
  // first check new key
  const stored = localStorage.getItem("site.lang");
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  // fallback to legacy key once (kept for safety)
  const legacy = localStorage.getItem("pref.lang");
  if (legacy && SUPPORTED_LANGS.includes(legacy)) return legacy;

  // browser list
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  for (const l of list) {
    const base = String(l || "").toLowerCase().split("-")[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
  }
  return "en";
}

// --- helpers ---
function normLang(raw) {
  if (!raw) return "en";
  let s = String(raw).toLowerCase();
  // collapse regional tags to base
  if (/^[a-z]{2}-[a-z]{2}$/i.test(s)) s = s.split("-")[0];
  // your special flavor key used on the legal pages
  if (s === "pt-mz") s = "ptmz";
  // collapse pt-pt / pt-br to generic 'pt' (your app exposes 'pt' today)
  if (s === "pt-pt" || s === "pt-br") s = "pt";
  return SUPPORTED_LANGS.includes(s) ? s : "en";
}

function clampCur(cur) {
  if (!cur) return null;
  const c = String(cur).toUpperCase().replace(/[^A-Z]/g, "");
  return c.length === 3 ? c : null;
}

function getUrlCurrencyParam() {
  const m = location.search.match(/[?&]currency=([A-Za-z]{3})/i);
  return m ? m[1].toUpperCase() : null;
}

// Currency resolver: URL → saved (site.currency) → language hint → country → fallback (EUR)
function pickInitialCurrency(langBase) {
  // 1) URL override
  const urlCur = getUrlCurrencyParam();
  if (urlCur && ALLOWED_CURRENCIES.includes(urlCur)) return urlCur;

  // 2) saved choice (new key)
  const saved = localStorage.getItem("site.currency");
  if (saved && ALLOWED_CURRENCIES.includes(saved)) return saved;

  // 3) language hint (exact langBase or full navigator tag)
  if (langBase && LANG_TO_CURRENCY_HINT[langBase]) return LANG_TO_CURRENCY_HINT[langBase];
  const nav = (navigator.language || "").toLowerCase(); // e.g. "en-gb"
  if (LANG_TO_CURRENCY_HINT[nav]) return LANG_TO_CURRENCY_HINT[nav];

  // 4) country from navigator
  const cc = getRegionFromNavigator();                       // e.g. "NL"
  const byCC = (cc && CC_TO_CURRENCY[cc]) || null;
  if (byCC && ALLOWED_CURRENCIES.includes(byCC)) return byCC;

  // 5) final fallback
  return "EUR";
}

/* ===== Contact & Booking ===== */
const EMAIL = "info@devoceanlodge.com";

// Booking engine locale (HotelRunner)
const LOCALE_BY_LANG = {
  en: "en-US",
  pt: "pt-BR",
  nl: "nl-NL",
  fr: "fr-FR",
  it: "it-IT",
  de: "de-DE",
  es: "es-ES",
};

// Native date pickers: force dd/mm/yyyy display where supported
const DATE_LANG_BY_LANG = {
  en: "en-GB",
  pt: "pt-PT",
  nl: "nl-NL",
  fr: "fr-FR",
  it: "it-IT",
  de: "de-DE",
  es: "es-ES",
};

// Contact form i18n
const I18N = {
  en: { toast: { ok: "Thanks! We received your message.", err: "Sorry, something went wrong. Please try again or email us at {email}." } },
  pt: { toast: { ok: "Obrigado! Recebemos a sua mensagem.", err: "Lamentamos, algo correu mal. Tente novamente ou envie-nos um email para {email}." } },
  nl: { toast: { ok: "Bedankt! We hebben je bericht ontvangen.", err: "Er ging iets mis. Probeer het opnieuw of mail ons op {email}." } },
  fr: { toast: { ok: "Merci ! Nous avons bien reçu votre message.", err: "Désolé, une erreur s’est produite. Réessayez ou écrivez-nous à {email}." } },
  it: { toast: { ok: "Grazie! Abbiamo ricevuto il tuo messaggio.", err: "Si è verificato un errore. Riprova oppure scrivici a {email}." } },
  de: { toast: { ok: "Danke! Wir haben Ihre Nachricht erhalten.", err: "Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns an {email}." } },
  es: { toast: { ok: "¡Gracias! Hemos recibido tu mensaje.", err: "Se produjo un error. Vuelve a intentarlo o escríbenos a {email}." } },
};

// Convert ISO (yyyy-mm-dd) -> dd/mm/yyyy
const toDDMMYYYY = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

// Convert dd/mm/yyyy (or dd.mm.yyyy / dd-mm-yyyy) -> ISO yyyy-mm-dd
const fromDDMMYYYY = (s) => {
  if (!s) return "";
  const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (!m) return "";
  const d = m[1].padStart(2, "0");
  const mo = m[2].padStart(2, "0");
  return `${m[3]}-${mo}-${d}`;
};

/* ===== Map (coordinates + sane zoom) ===== */
const MAP = { lat: -26.841994852732736, lng: 32.88504331196165, zoom: 13 };
const mapEmbed = (z = MAP.zoom) => `https://www.google.com/maps?q=${MAP.lat},${MAP.lng}&z=${z}&output=embed`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${MAP.lat},${MAP.lng}`;

/* ===== Assets served from /public ===== */
const IMG = {
  logo: "/Logo2.png",
  units: {
    safari: "/photos/units/safari-tent.jpg",
    comfort: "/photos/units/comfort-tent.jpg",
    cottage: "/photos/units/garden-cottage.jpg",
    chalet: "/photos/units/thatched-chalet.jpg",
  },
  experiences: {
    diving: "/photos/experiences/diving.jpg",
    dolphins: "/photos/experiences/dolphins.jpg",
    lighthouse: "/photos/experiences/lighthouse.jpg",
    seafari: "/photos/experiences/seafari.jpg",
    safari: "/photos/experiences/safari.jpg",
    fishing: "/photos/experiences/fishing.jpg",
    surfing: "/photos/experiences/surfing.jpg",
  },
  gallery: [
    "/photos/gallery/01.jpg", "/photos/gallery/02.jpg", "/photos/gallery/03.jpg", "/photos/gallery/04.jpg",
    "/photos/gallery/05.jpg", "/photos/gallery/06.jpg", "/photos/gallery/07.jpg", "/photos/gallery/08.jpg",
  ],
};

/* ===== Base content (EN canonical) ===== */
const UNIT_BASE = [
  {
    key: "safari", img: IMG.units.safari, title: "Safari Tent",
    short: "12 m² canvas tent on a 3×6 m platform. Twin/King, fan, power points, mosquito mesh, private terrace. Shared ablutions.",
    details: [
      "Two single beds (or King) with pedestals and shaded lamps",
      "Mosquito mesh on doors/windows • strong fan • power points",
      "Small shelving unit for clothing/essentials",
      "Private terrace with rolled palm-leaf chairs facing the tropical garden",
      "Shared bathrooms (ladies/gents): 2 hot/cold showers & 2 toilets each",
      "Village can be lively during holidays; free earplugs at reception",
    ],
  },
  {
    key: "comfort", img: IMG.units.comfort, title: "Comfort Tent",
    short: "Upgraded 12 m² tent with extra privacy (side/back walls), private terrace and your own en-suite bathroom under a thatched roof.",
    details: [
      "Twin/King bed setup • lamps • convenient light switches",
      "Mosquito mesh • strong fan • power points",
      "Private wood terrace with rolled palm-leaf chairs",
      "At the back: private bathroom (shower, toilet, sink) under a grass-thatched roof",
      "Village liveliness during peak/holidays; earplugs available",
    ],
  },
  {
    key: "cottage", img: IMG.units.cottage, title: "Garden Cottage",
    short: "Airy cottage with queen bed, A/C (inverter), desk & dining table, private terrace and bathroom in a charming roundavel.",
    details: [
      "Roman-tiled roof, high white ceiling with dark wood beams",
      "Terracotta floor, warm wheatfields-painted walls",
      "Queen bed • working desk with shaded lamp • dining table with chairs",
      "Suitcase shelves, clothes rack and extra shelving",
      "Inverter A/C (cool & heat) • dimmable main light",
      "Private bath in grass-thatched roundavel (shower, sink, toilet)",
      "Private wooden terrace with camping chairs and side table",
    ],
  },
  {
    key: "chalet", img: IMG.units.chalet, title: "Thatched Chalet",
    short: "Secluded, romantic tiny chalet under palms and strelitzia. A/C, private bathroom, terrace, Twin/King bed setup.",
    details: [
      "Grass-thatched roof on bluegum poles • autumn-slate floor",
      "Wheatfields-painted walls • tranquil, shaded setting",
      "Dinner table with chairs • air conditioning",
      "Private bathroom (shower, sink, toilet)",
      "Two singles or King with pedestals • private terrace with palm-leaf chairs",
    ],
  },
];

const EXP_BASE = [
  { key: "diving", img: IMG.experiences.diving, title: "Scuba Diving", desc: "Offshore reefs with rich marine life." },
  { key: "dolphins", img: IMG.experiences.dolphins, title: "Dolphin Swim", desc: "Ethical encounters with resident dolphins." },
  { key: "lighthouse", img: IMG.experiences.lighthouse, title: "Lighthouse Walk", desc: "Hike the hill to the old lighthouse for sweeping views." },
  { key: "seafari", img: IMG.experiences.seafari, title: "Seafaris", desc: "Ocean safaris for whales (May–Oct) & more." },
  { key: "safari", img: IMG.experiences.safari, title: "Game Safaris", desc: "Bush adventures a short drive away." },
  { key: "fishing", img: IMG.experiences.fishing, title: "Beach & Deep Sea Fishing", desc: "From shore casts to charters offshore." },
  { key: "surfing", img: IMG.experiences.surfing, title: "Surf Boards & Lessons", desc: "Catch a wave or learn the basics." },
];

const HERO_IMAGES = [
  "/photos/hero01.jpg",
  "/photos/hero02.jpg",
  "/photos/hero03.jpg",
  "/photos/hero04.jpg",
  "/photos/hero05.jpg",
];

/* === HomeHero (single definition) === */
function HomeHero({ images = [], ui, bookUrl, interval = 6000 }) {
  const [idx, setIdx] = React.useState(0);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];

  React.useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setIdx(i => (i + 1) % list.length), interval);
    return () => clearInterval(id);
  }, [list.length, interval]);

  const go = (i) =>
    list.length ? setIdx(((i % list.length) + list.length) % list.length) : null;

  return (
    <section id="home" className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* z-0: brand fallback always visible */}
      <div className="absolute inset-0 z-0 bg-[#9e4b13]" />

      {/* z-10: slides */}
      <div className="absolute inset-0 z-10">
        {list.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Hero slide ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={(e) => {
              console.warn("Hero slide not found:", e.currentTarget.src);
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>

      {/* z-20: dim overlay */}
      <div className="absolute inset-0 z-20 bg-black/40 pointer-events-none" />

      {/* z-30: content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 py-24 md:py-40 text-white w-full">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">{ui.hero.title}</h1>
        <p className="mt-4 md:text-xl max-w-2xl">{ui.hero.subtitle}</p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={bookUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-cta w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#9e4b13] text-white shadow hover:shadow-lg text-center"
          >
            {ui.hero.ctaPrimary}
          </a>
          <a
            href="#stay"
            className="btn-secondary w-full sm:w-auto px-5 py-3 rounded-2xl border border-white/60 bg-white/10 text-white hover:bg-white/20 text-center"
            aria-label={ui.hero.ctaSecondary}
          >
            {ui.hero.ctaSecondary}
          </a>
        </div>
        <div className="mt-6 sm:mt-10 flex items-center gap-1 text-yellow-300">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} />)}
          <span className="ml-2 text-white/90 text-sm sm:text-base">{ui.hero.badge}</span>
        </div>
      </div>

      {/* z-40: controls, only if multiple slides */}
      {list.length > 1 && (
        <>
          <div className="absolute z-40 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => go(idx - 1)}
            className="absolute z-40 left-3 bottom-3 px-3 py-1.5 rounded-full bg-black/30 text-white text-sm"
            aria-label="Previous slide"
          >‹</button>
          <button
            onClick={() => go(idx + 1)}
            className="absolute z-40 right-3 bottom-3 px-3 py-1.5 rounded-full bg-black/30 text-white text-sm"
            aria-label="Next slide"
          >›</button>
        </>
      )}
    </section>
  );
}

/* ===== Translations for UNITS + EXPERIENCES ===== */
const L10N = {
  pt: {
    units: {
      safari: {
        title: "Tenda Safari",
        short:
          "Tenda de lona 12 m² em plataforma 3×6 m. Twin/King, ventoinha, tomadas, rede mosquiteira, terraço privado. Casas de banho partilhadas.",
        details: [
          "Duas camas individuais (ou King) com mesas de cabeceira e candeeiros",
          "Rede mosquiteira • ventoinha potente • tomadas",
          "Terraço privado com cadeiras de folhas de palmeira",
          "Instalações partilhadas: duches quente/frio e sanitários",
        ],
      },
      comfort: {
        title: "Tenda Conforto",
        short:
          "Tenda de 12 m² com mais privacidade (paredes laterais/traseiras), terraço privado e casa de banho privativa sob teto de colmo.",
        details: [
          "Configuração Twin/King com iluminação prática",
          "Rede mosquiteira • ventoinha potente • tomadas",
          "Terraço de madeira com cadeiras",
          "Casa de banho privativa (duche, sanita, lavatório) sob teto de colmo",
        ],
      },
      cottage: {
        title: "Chalé Jardim",
        short:
          "Chalé arejado com cama queen, A/C (inverter), secretária e mesa, terraço privado e casa de banho em rondavel.",
        details: [
          "Cama queen • secretária e mesa de jantar",
          "A/C inverter (frio/quente) • luz regulável",
          "Casa de banho em rondavel (duche, lavatório, sanita)",
          "Terraço de madeira com cadeiras",
        ],
      },
      chalet: {
        title: "Chalé de Colmo",
        short:
          "Pequeno chalé romântico entre palmeiras. A/C, casa de banho privada, terraço, Twin/King.",
        details: [
          "Ambiente tranquilo sob palmeiras • ar-condicionado",
          "Casa de banho privativa (duche, lavatório, sanita)",
          "Camas Twin/King com mesas de cabeceira",
          "Terraço privado com cadeiras de palha",
        ],
      },
    },
    experiences: {
      diving: { title: "Mergulho", desc: "Recifes ao largo com rica vida marinha." },
      dolphins: { title: "Nado com Golfinhos", desc: "Encontros éticos com golfinhos residentes." },
      lighthouse: { title: "Caminhada ao Farol", desc: "Suba até o farol antigo para vistas amplas." },
      seafari: { title: "Safáris Oceânicos", desc: "Safáris no mar para baleias (mai–out) e mais." },
      safari: { title: "Safáris Terrestres", desc: "Aventuras no mato a curta distância." },
      fishing: { title: "Pesca de Praia e Alto-mar", desc: "Do lançamento na praia aos charters offshore." },
      surfing: { title: "Pranchas & Aulas de Surf", desc: "Aproveite as ondas ou aprenda o básico." },
    },
  },

  nl: {
    units: {
      safari: {
        title: "Safaritent",
        short:
          "12 m² canvistent op een 3×6 m platform. Twin/King, ventilator, stopcontacten, muskietengaas, privéterras. Gedeeld sanitair.",
        details: [
          "Twee eenpersoonsbedden (of King) met nachtkastjes en lampen",
          "Muskietengaas • krachtige ventilator • stopcontacten",
          "Privéterras met stoelen van palmblad",
          "Gedeelde douches (warm/koud) en toiletten",
        ],
      },
      comfort: {
        title: "Comforttent",
        short:
          "Verbeterde 12 m² tent met extra privacy, privéterras en eigen badkamer onder rietdak.",
        details: [
          "Twin/King-opstelling met handige verlichting",
          "Muskietengaas • krachtige ventilator • stopcontacten",
          "Houten terras met stoelen",
          "Eigen badkamer (douche, toilet, wastafel) onder riet",
        ],
      },
      cottage: {
        title: "Tuincottage",
        short:
          "Luchtige cottage met queensize bed, airco (inverter), bureau & eettafel, privéterras en badkamer in rondavel.",
        details: [
          "Queensize bed • bureau en eettafel",
          "Inverter-airco (koel/verwarm) • dimbaar licht",
          "Badkamer in rondavel (douche, wastafel, toilet)",
          "Houten terras met stoelen",
        ],
      },
      chalet: {
        title: "Rieten Chalet",
        short:
          "Afgelegen, romantisch tiny chalet onder palmen. Airco, eigen badkamer, terras, Twin/King.",
        details: [
          "Rustige ligging tussen palmen • airco",
          "Eigen badkamer (douche, wastafel, toilet)",
          "Twin/King-opstelling met nachtkastjes",
          "Privéterras met stoelen",
        ],
      },
    },
    experiences: {
      diving: { title: "Duiken", desc: "Offshore riffen met rijke onderwaterwereld." },
      dolphins: { title: "Zwemmen met dolfijnen", desc: "Ethische ontmoetingen met residentiële dolfijnen." },
      lighthouse: { title: "Vuurtorenwandeling", desc: "Beklim de heuvel naar de oude vuurtoren voor panorama’s." },
      seafari: { title: "Zee-safari’s", desc: "Zeesafari’s voor walvissen (mei–okt) en meer." },
      safari: { title: "Wildsafari’s", desc: "Bush-avonturen op korte rijafstand." },
      fishing: { title: "Strand- & Big-game vissen", desc: "Van strandwerpen tot offshore charters." },
      surfing: { title: "Surfplanken & lessen", desc: "Pak een golf of leer de basis." },
    },
  },

  fr: {
    units: {
      safari: {
        title: "Tente safari",
        short:
          "Tente de 12 m² sur plateforme 3×6 m. Twin/King, ventilateur, prises, moustiquaire, terrasse privée. Sanitaires partagés.",
        details: [
          "Deux lits simples (ou King) avec chevets et lampes",
          "Moustiquaire • ventilateur puissant • prises électriques",
          "Terrasse privée avec chaises en feuilles de palmier",
          "Douches (chaud/froid) et toilettes partagées",
        ],
      },
      comfort: {
        title: "Tente confort",
        short:
          "Tente 12 m² avec plus d’intimité, terrasse privée et salle d’eau attenante sous toit de chaume.",
        details: [
          "Configuration Twin/King avec éclairage pratique",
          "Moustiquaire • ventilateur puissant • prises",
          "Terrasse en bois avec chaises",
          "Salle d’eau privative (douche, WC, lavabo) sous chaume",
        ],
      },
      cottage: {
        title: "Cottage jardin",
        short:
          "Cottage lumineux avec lit queen, clim (inverter), bureau & table, terrasse privée et salle d’eau dans un rondavel.",
        details: [
          "Lit queen • bureau et table à manger",
          "Clim inverter (froid/chaud) • lumière réglable",
          "Salle d’eau en rondavel (douche, lavabo, WC)",
          "Terrasse en bois avec chaises",
        ],
      },
      chalet: {
        title: "Chalet au toit de chaume",
        short:
          "Petit chalet romantique sous les palmiers. Clim, salle d’eau privée, terrasse, Twin/King.",
        details: [
          "Cadre paisible sous les palmiers • climatisation",
          "Salle d’eau privative (douche, lavabo, WC)",
          "Lit Twin/King avec chevets",
          "Terrasse privée avec chaises",
        ],
      },
    },
    experiences: {
      diving: { title: "Plongée", desc: "Récifs au large riches en vie marine." },
      dolphins: { title: "Nage avec les dauphins", desc: "Rencontres éthiques avec des dauphins résidents." },
      lighthouse: { title: "Montée au phare", desc: "Montez jusqu’au vieux phare pour une vue panoramique." },
      seafari: { title: "Safaris en mer", desc: "Safaris en mer pour les baleines (mai–oct) et plus." },
      safari: { title: "Safaris terrestres", desc: "Aventures dans la brousse à courte distance." },
      fishing: { title: "Pêche du bord & au large", desc: "Du surf-casting aux sorties au large." },
      surfing: { title: "Planches & cours de surf", desc: "Prenez une vague ou apprenez les bases." },
    },
  },

  it: {
    units: {
      safari: {
        title: "Tenda safari",
        short:
          "Tenda in tela da 12 m² su piattaforma 3×6 m. Twin/King, ventilatore, prese, zanzariere, terrazza privata. Servizi in comune.",
        details: [
          "Due letti singoli (o King) con comodini e lampade",
          "Zanzariere • ventilatore potente • prese",
          "Terrazza privata con sedie in foglia di palma",
          "Docce (calda/fredda) e servizi igienici condivisi",
        ],
      },
      comfort: {
        title: "Tenda comfort",
        short:
          "Tenda da 12 m² con maggiore privacy, terrazza privata e bagno privato sotto tetto in paglia.",
        details: [
          "Configurazione Twin/King con illuminazione comoda",
          "Zanzariere • ventilatore potente • prese",
          "Terrazza in legno con sedie",
          "Bagno privato (doccia, WC, lavabo) sotto tetto in paglia",
        ],
      },
      cottage: {
        title: "Cottage giardino",
        short:
          "Cottage arioso con letto queen, A/C (inverter), scrivania e tavolo, terrazza privata e bagno in rondavel.",
        details: [
          "Letto queen • scrivania e tavolo da pranzo",
          "A/C inverter (freddo/caldo) • luce regolabile",
          "Bagno in rondavel (doccia, lavabo, WC)",
          "Terrazza in legno con sedie",
        ],
      },
      chalet: {
        title: "Chalet con tetto in paglia",
        short:
          "Piccolo chalet romantico tra le palme. A/C, bagno privato, terrazza, Twin/King.",
        details: [
          "Contesto tranquillo tra le palme • aria condizionata",
          "Bagno privato (doccia, lavabo, WC)",
          "Letti Twin/King con comodini",
          "Terrazza privata con sedie",
        ],
      },
    },
    experiences: {
      diving: { title: "Immersioni", desc: "Scogliere al largo ricche di vita marina." },
      dolphins: { title: "Nuoto con i delfini", desc: "Incontri etici con delfini residenti." },
      lighthouse: { title: "Passeggiata al faro", desc: "Salita al vecchio faro con viste panoramiche." },
      seafari: { title: "Safari in mare", desc: "Safari oceanici per balene (mag–ott) e altro." },
      safari: { title: "Safari nella savana", desc: "Avventure nel bush a breve distanza." },
      fishing: { title: "Pesca da riva e d’altura", desc: "Dallo shore casting ai charter offshore." },
      surfing: { title: "Tavole e lezioni di surf", desc: "Prendi un’onda o impara le basi." },
    },
  },

  de: {
    units: {
      safari: {
        title: "Safarizelt",
        short:
          "12 m² Zelt auf 3×6 m Plattform. Twin/King, Ventilator, Steckdosen, Moskitonetz, private Terrasse. Gemeinschaftssanitär.",
        details: [
          "Zwei Einzelbetten (oder King) mit Nachttischen und Lampen",
          "Moskitonetz • starker Ventilator • Steckdosen",
          "Private Terrasse mit Stühlen aus Palmblatt",
          "Gemeinsame Duschen (warm/kalt) und Toiletten",
        ],
      },
      comfort: {
        title: "Komfortzelt",
        short:
          "12 m² Zelt mit mehr Privatsphäre, private Terrasse und eigenes Bad unter Reetdach.",
        details: [
          "Twin/King-Konfiguration mit praktischer Beleuchtung",
          "Moskitonetz • starker Ventilator • Steckdosen",
          "Holzterrasse mit Stühlen",
          "Eigenes Bad (Dusche, WC, Waschbecken) unter Reet",
        ],
      },
      cottage: {
        title: "Garten-Cottage",
        short:
          "Luftiges Cottage mit Queensize-Bett, Klimaanlage (Inverter), Schreibtisch & Esstisch, private Terrasse und Bad im Rundbau.",
        details: [
          "Queensize-Bett • Schreibtisch und Esstisch",
          "Inverter-Klimaanlage (kalt/warm) • dimmbares Licht",
          "Bad im Rundbau (Dusche, Waschbecken, WC)",
          "Holzterrasse mit Stühlen",
        ],
      },
      chalet: {
        title: "Reetdach-Chalet",
        short:
          "Abgelegenes, romantisches Tiny-Chalet unter Palmen. Klima, eigenes Bad, Terrasse, Twin/King.",
        details: [
          "Ruhige Lage unter Palmen • Klimaanlage",
          "Eigenes Bad (Dusche, Waschbecken, WC)",
          "Twin/King mit Nachttischen",
          "Private Terrasse mit Stühlen",
        ],
      },
    },
    experiences: {
      diving: { title: "Tauchen", desc: "Offshore-Riffe mit reicher Unterwasserwelt." },
      dolphins: { title: "Schwimmen mit Delfinen", desc: "Ethische Begegnungen mit ansässigen Delfinen." },
      lighthouse: { title: "Leuchtturm-Wanderung", desc: "Aufstieg zum alten Leuchtturm mit Weitblick." },
      seafari: { title: "Meersafaris", desc: "Safaris zu Walen (Mai–Okt) & mehr." },
      safari: { title: "Safaris im Busch", desc: "Buschabenteuer in kurzer Fahrdistanz." },
      fishing: { title: "Brandungs- & Hochseefischen", desc: "Vom Brandungsangeln bis zu Offshore-Chartern." },
      surfing: { title: "Surfboards & Kurse", desc: "Welle reiten oder die Basics lernen." },
    },
  },

  es: {
    units: {
      safari: {
        title: "Tienda safari",
        short:
          "Tienda de 12 m² sobre plataforma 3×6 m. Twin/King, ventilador, enchufes, mosquiteras, terraza privada. Baños compartidos.",
        details: [
          "Dos camas individuales (o King) con mesillas y lámparas",
          "Mosquiteras • ventilador potente • enchufes",
          "Terraza privada con sillas de hoja de palma",
          "Duchas (caliente/fría) y aseos compartidos",
        ],
      },
      comfort: {
        title: "Tienda confort",
        short:
          "Tienda de 12 m² con mayor privacidad, terraza privada y baño propio bajo techo de paja.",
        details: [
          "Configuración Twin/King con iluminación práctica",
          "Mosquiteras • ventilador potente • enchufes",
          "Terraza de madera con sillas",
          "Baño privado (ducha, WC, lavabo) bajo techo de paja",
        ],
      },
      cottage: {
        title: "Cabaña jardín",
        short:
          "Cabaña luminosa con cama queen, A/A (inverter), escritorio y mesa, terraza privada y baño en un rondavel.",
        details: [
          "Cama queen • escritorio y mesa de comedor",
          "A/A inverter (frío/calor) • luz regulable",
          "Baño en rondavel (ducha, lavabo, WC)",
          "Terraza de madera con sillas",
        ],
      },
      chalet: {
        title: "Chalet de paja",
        short:
          "Pequeño chalet romántico entre palmeras. A/A, baño privado, terraza, Twin/King.",
        details: [
          "Entorno tranquilo entre palmeras • aire acondicionado",
          "Baño privado (ducha, lavabo, WC)",
          "Twin/King con mesillas",
          "Terraza privada con sillas",
        ],
      },
    },
    experiences: {
      diving: { title: "Buceo", desc: "Arrecifes oceánicos con abundante vida marina." },
      dolphins: { title: "Nado con delfines", desc: "Encuentros éticos con delfines residentes." },
      lighthouse: { title: "Paseo al faro", desc: "Sube al viejo faro para vistas panorámicas." },
      seafari: { title: "Safaris marinos", desc: "Safaris en mar para ballenas (may–oct) y más." },
      safari: { title: "Safaris terrestres", desc: "Aventuras en la selva a poca distancia." },
      fishing: { title: "Pesca de orilla y de altura", desc: "Desde lanzados en playa hasta charters offshore." },
      surfing: { title: "Tablas y clases de surf", desc: "Toma una ola o aprende lo básico." },
    },
  },
};

/* ===== UI strings ===== */
const UI = {
  en: {
    nav: {
      home: "Home",
      stay: "Stay",
      experiences: "Experiences",
      todo: "What to do",
      gallery: "Gallery",
      location: "Location",
      contact: "Contact",
    },
    hero: {
      title: "DEVOCEAN Lodge",
      subtitle:
        "Eco-friendly stays a few hundred meters from the beach in Ponta do Ouro, Southern Mozambique.",
      ctaPrimary: "Book your stay",
      ctaSecondary: "Explore the lodge",
      badge: "Guest-loved comfort & value",
    },
    stay: {
      headline: "Stay with us",
      blurb:
        "Choose your style: nature-immersed tents or cozy chalets and cottage – all with warm, family-run hospitality.",
      moreDetails: "More details",
    },
    experiences: {
      headline: "Experiences",
      blurb: "Ocean and forest adventures right on your doorstep.",
      operators: "Trusted local operators:",
    },
    todo: {
      headline: "What to do in Ponta do Ouro",
      note:
        "For diving, snorkel trips, dolphin/whale seafaris and fishing charters, see the providers below.",
      items: [
        {
          title: "Lighthouse hike & Lua Do Mar",
          body:
            "Hike to the Old Lighthouse for panoramic views. Continue to Lua Do Mar Restaurant on the dune. Often spot dolphins year-round, whales (May–Oct) and turtles (Dec–Jan). Mind the tide: avoid the beach route from 3 hours before to 3 hours after high tide; rogue waves can push you against rocks.",
        },
        {
          title: "Walk to Ponta Malongane",
          body:
            "Beach-walk along the shore to the next village. Midway, stairs through banana trees lead to Campismo Nino Pub & Restaurant with great views. Near the bay transition, a path to Sky Island offers paragliding. Famous pubs in Malongane: Drunken Clam and Sunset Shack. Return via beach or the sandy 4×4 road.",
        },
        {
          title: "Surf, dive & ocean research",
          body:
            "Surfboard rentals at the Beach Bar; several dive centers in the village and a dolphin/whale research center.",
        },
        {
          title: "Eat & unwind nearby",
          body:
            "There are ~16 pubs and restaurants within 500 m of DEVOCEAN. For a relaxing full-body massage, ask for Lisa (LIZ-Way Massage).",
        },
        {
          title: "Quad bike rentals",
          body:
            "Occasional private rentals from locals. Typical rate: around MZN 2000 per hour (negotiation varies).",
        },
      ],
    },
    gallery: { headline: "Gallery" },
    location: {
      headline: "Location",
      blurb: "Ponta do Ouro – Matutuíne District, Southern Mozambique.",
      items: [
        "Ponta do Ouro town, a short walk from the beach",
        "15 min to Ponta Malongane • 25 min to Kosi Bay border",
        "Secure parking • Local cafés & markets nearby",
      ],
    },
    contact: {
      headline: "Contact & Booking",
      blurb:
        "Questions, dates, special requests or group bookings – we’re happy to help.",
      call: "Call",
      email: "Email",
      directions: "Directions",
      bookNow: "Book now",
    },
    form: {
      name: "Name",
      email: "Email",
      checkin: "Check-in",
      checkout: "Check-out",
      message: "Message",
      send: "Send",
      consent: "By submitting you agree to be contacted about your inquiry.",
      phName: "Your name",
      phEmail: "you@example.com",
      phMsg: "Tell us a bit about your trip…",
    },
    galleryHeading: "Gallery",
    footer: {
      rights: "All rights reserved.",
      desc:
        "Family-run, eco-friendly hospitality and community projects in Southern Mozambique.",
    },
    legal: {
      title: "Legal",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
      terms: "Terms & Conditions",
      gdpr: "GDPR Info",
      cric: "Consumer Rights & Contact",
      manage: "Cookie Settings",
    }
  },

  /* PT / NL / FR / IT / DE / ES variants */
  pt: {
    nav: { home: "Início", stay: "Acomodações", experiences: "Experiências", todo: "O que fazer", gallery: "Galeria", location: "Localização", contact: "Contato" },
    hero: { title: "DEVOCEAN Lodge", subtitle: "Hospedagem ecológica a poucos metros da praia em Ponta do Ouro, Sul de Moçambique.", ctaPrimary: "Reservar agora", ctaSecondary: "Conhecer o lodge", badge: "Conforto e valor apreciados pelos hóspedes" },
    stay: { headline: "Fique conosco", blurb: "Escolha o seu estilo: tendas na natureza ou chalés e cottage aconchegantes – sempre com nossa hospitalidade familiar.", moreDetails: "Mais detalhes" },
    experiences: { headline: "Experiências", blurb: "Aventura no oceano e na floresta ao lado da sua estadia.", operators: "Operadores locais de confiança:" },
    todo: {
      headline: "O que fazer em Ponta do Ouro",
      note: "Para mergulho, snorkel, seafaris e pesca: veja os provedores abaixo.",
      items: [
        { title: "Caminhada ao Farol & Lua Do Mar", body: "Suba ao Farol Antigo para vistas panorâmicas. Siga até o restaurante Lua Do Mar na duna. Avistamentos frequentes de golfinhos (ano todo), baleias (mai–out) e tartarugas (dez–jan). Atenção à maré: evite a rota pela praia de 3h antes até 3h depois da maré alta." },
        { title: "Caminhe até Ponta Malongane", body: "Pela praia até a aldeia vizinha. No meio do caminho, escadas entre bananeiras levam ao Campismo Nino Pub & Restaurant. Próximo à transição da baía, um trilho sobe ao Sky Island (parapente). Bares famosos: Drunken Clam e Sunset Shack. Volte pela praia ou pela estrada arenosa 4×4." },
        { title: "Surf, mergulho & pesquisa oceânica", body: "Aluguer de pranchas no Beach Bar; vários centros de mergulho na vila e um centro de pesquisa de golfinhos/baleias." },
        { title: "Comer & relaxar por perto", body: "Há ~16 bares e restaurantes num raio de 500 m do DEVOCEAN. Para massagem relaxante, pergunte pela Lisa (LIZ-Way Massage)." },
        { title: "Aluguel de quadriciclos", body: "Ocasionalmente com locais. Valor típico: cerca de MZN 2000 por hora (negociação varia)." },
      ],
    },
    gallery: { headline: "Galeria" },
    location: {
      headline: "Localização", blurb: "Ponta do Ouro – Distrito de Matutuíne, Sul de Moçambique.",
      items: [
        "Vila de Ponta do Ouro, a poucos passos da praia",
        "15 min até Ponta Malongane • 25 min até a fronteira de Kosi Bay",
        "Estacionamento seguro • Cafés e mercados locais por perto",
      ],
    },
    contact: { headline: "Contato & Reservas", blurb: "Dúvidas, datas, pedidos especiais ou grupos – teremos prazer em ajudar.", call: "Ligar", email: "Email", directions: "Como chegar", bookNow: "Reservar" },
    form: {
      name: "Nome", email: "Email", checkin: "Check-in", checkout: "Check-out", message: "Mensagem", send: "Enviar",
      consent: "Ao enviar, concorda em ser contactado sobre o seu pedido.",
      phName: "O seu nome", phEmail: "voce@email.com", phMsg: "Conte-nos sobre a sua viagem…",
    },
    galleryHeading: "Galeria",
    footer: {
      rights: "Todos os direitos reservados.",
      desc: "Hospitalidade familiar e ecológica e projetos comunitários no sul de Moçambique.",
    },
    legal: {
      title: "Legal",
      privacy: "Política de Privacidade",
      cookies: "Política de Cookies",
      terms: "Termos & Condições",
      gdpr: "Informações GDPR",
      cric: "Direitos do Consumidor & Contacto",
      manage: "Definições de Cookies",
    }
  },

  nl: {
    nav: { home: "Home", stay: "Verblijf", experiences: "Ervaringen", todo: "Wat te doen", gallery: "Galerij", location: "Locatie", contact: "Contact" },
    hero: { title: "DEVOCEAN Lodge", subtitle: "Eco-vriendelijke verblijven op enkele honderden meters van het strand in Ponta do Ouro, Zuid-Mozambique.", ctaPrimary: "Boek je verblijf", ctaSecondary: "Verken de lodge", badge: "Geliefd om comfort & prijs-kwaliteit" },
    stay: { headline: "Verblijf bij ons", blurb: "Kies je stijl: natuur-tenten of knusse chalets en cottage – met warme, familiale gastvrijheid.", moreDetails: "Meer details" },
    experiences: { headline: "Ervaringen", blurb: "Zee- en bosavontuur naast de deur.", operators: "Betrouwbare lokale aanbieders:" },
    todo: {
      headline: "Wat te doen in Ponta do Ouro",
      note: "Voor duiken/snorkelen/seafari’s/charters: zie de aanbieders hieronder.",
      items: [
        { title: "Vuurtorenwandeling & Lua Do Mar", body: "Loop naar de Oude Vuurtoren voor panoramisch uitzicht. Ga door naar restaurant Lua Do Mar op de duin. Vaak dolfijnen (hele jaar), walvissen (mei–okt) en schildpadden (dec–jan). Let op het tij: vermijd de strandroute vanaf 3 uur vóór tot 3 uur ná hoogwater; onverwachte golven kunnen je tegen de rotsen duwen." },
        { title: "Wandeling naar Ponta Malongane", body: "Wandel langs het strand naar het volgende dorp. Halverwege leiden trappen door bananenbomen naar Campismo Nino Pub & Restaurant met prachtig uitzicht. Bij de overgang van de baai loopt een pad naar Sky Island (paragliden). Bekende pubs in Malongane: Drunken Clam en Sunset Shack. Terug via het strand of de zanderige 4×4-weg." },
        { title: "Surf, duik & oceaanonderzoek", body: "Surfboardverhuur bij de Beach Bar; meerdere duikcentra in het dorp en een dolfijn/walvis-onderzoekscentrum." },
        { title: "Eten & ontspannen in de buurt", body: "Er zijn ~16 pubs en restaurants binnen 500 m van DEVOCEAN. Voor een ontspannende full-body massage: vraag naar Lisa (LIZ-Way Massage)." },
        { title: "Quadverhuur", body: "Af en toe particuliere verhuur door locals. Richtprijs: ongeveer MZN 2000 per uur (onderhandeling verschilt)." },
      ],
    },
    gallery: { headline: "Galerij" },
    location: {
      headline: "Locatie", blurb: "Ponta do Ouro – district Matutuíne, Zuid-Mozambique.",
      items: [
        "Ponta do Ouro-dorp, op loopafstand van het strand",
        "15 min naar Ponta Malongane • 25 min naar grens Kosi Bay",
        "Beveiligde parking • Lokale cafés & marktjes dichtbij",
      ],
    },
    contact: { headline: "Contact & Boeking", blurb: "Vragen, data, speciale verzoeken of groepen – we helpen graag.", call: "Bellen", email: "E-mail", directions: "Route", bookNow: "Nu boeken" },
    form: {
      name: "Naam", email: "E-mail", checkin: "Inchecken", checkout: "Uitchecken", message: "Bericht", send: "Verzenden",
      consent: "Door te verzenden ga je akkoord dat we contact met je opnemen over je aanvraag.",
      phName: "Je naam", phEmail: "jij@email.com", phMsg: "Vertel iets over je reis…",
    },
    galleryHeading: "Galerij",
    footer: {
      rights: "Alle rechten voorbehouden.", desc: "Familie-gerunde, milieuvriendelijke gastvrijheid en gemeenschapsprojecten in Zuid-Mozambique.",
    },
    legal: {
      title: "Juridisch",
      privacy: "Privacybeleid",
      cookies: "Cookiebeleid",
      terms: "Algemene Voorwaarden",
      gdpr: "GDPR-informatie",
      cric: "Consumentenrechten & contact",
      manage: "Cookie-instellingen",
    }
  },

  fr: {
    nav: {
      home: "Accueil",
      stay: "Séjour",
      experiences: "Expériences",
      todo: "À faire",
      gallery: "Galerie",
      location: "Localisation",
      contact: "Contact"
    },
    hero: {
      title: "DEVOCEAN Lodge",
      subtitle:
        "Hébergements écoresponsables à quelques centaines de mètres de la plage à Ponta do Ouro, sud du Mozambique.",
      ctaPrimary: "Réserver",
      ctaSecondary: "Découvrir le lodge",
      badge: "Confort & rapport qualité-prix plébiscités"
    },
    stay: {
      headline: "Séjournez chez nous",
      blurb:
        "Tentes nature ou chalets/cottage confortables – avec une chaleureuse hospitalité familiale.",
      moreDetails: "Plus de détails"
    },
    experiences: {
      headline: "Expériences",
      blurb: "Aventures océanes et forestières à deux pas.",
      operators: "Opérateurs locaux de confiance :"
    },
    todo: {
      headline: "Que faire à Ponta do Ouro",
      note: "Plongée, snorkeling, safaris dauphins/baleines, pêche : prestataires ci-dessous.",
      items: [
        {
          title: "Montée au phare & Lua Do Mar",
          body:
            "Montez au Vieux Phare pour une vue panoramique. Continuez vers le restaurant Lua Do Mar sur la dune. Souvent des dauphins (toute l’année), baleines (mai–oct) et tortues (déc–jan). Attention à la marée : évitez la plage de 3 h avant à 3 h après la marée haute."
        },
        {
          title: "Marche jusqu’à Ponta Malongane",
          body:
            "Marchez le long de la plage vers le village voisin. À mi-chemin, des escaliers à travers les bananiers mènent au Campismo Nino Pub & Restaurant. Vers la transition de la baie, un sentier monte à Sky Island (parapente). Bars connus : Drunken Clam et Sunset Shack. Retour par la plage ou la piste 4×4."
        },
        {
          title: "Surf, plongée & recherche océanique",
          body:
            "Location de planches au Beach Bar ; plusieurs centres de plongée au village et un centre de recherche sur dauphins/baleines."
        },
        {
          title: "Manger & se détendre à proximité",
          body:
            "Environ 16 pubs et restaurants à moins de 500 m du DEVOCEAN. Pour un massage relaxant, demandez Lisa (LIZ-Way Massage)."
        },
        {
          title: "Location de quads",
          body:
            "Locations privées ponctuelles par des locaux. Tarif indicatif : env. MZN 2000 par heure (à négocier)."
        }
      ]
    },
    gallery: { headline: "Galerie" },
    location: {
      headline: "Localisation",
      blurb: "Ponta do Ouro – District de Matutuíne, sud du Mozambique.",
      items: [
        "Ville de Ponta do Ouro, à deux pas de la plage",
        "15 min de Ponta Malongane • 25 min de la frontière de Kosi Bay",
        "Parking sécurisé • Cafés & marchés locaux à proximité"
      ]
    },
    contact: {
      headline: "Contact & Réservation",
      blurb:
        "Questions, dates, demandes spéciales ou groupes – nous sommes là pour vous aider.",
      call: "Appeler",
      email: "E-mail",
      directions: "Itinéraire",
      bookNow: "Réserver"
    },
    form: {
      name: "Nom",
      email: "E-mail",
      checkin: "Arrivée",
      checkout: "Départ",
      message: "Message",
      send: "Envoyer",
      consent:
        "En envoyant, vous acceptez d’être contacté au sujet de votre demande.",
      phName: "Votre nom",
      phEmail: "vous@email.com",
      phMsg: "Parlez-nous de votre voyage…"
    },
    galleryHeading: "Galerie",
    footer: {
      rights: "Tous droits réservés.",
      desc:
        "Hôtellerie familiale et écoresponsable, avec des projets communautaires dans le sud du Mozambique."
    },
    legal: {
      title: "Mentions légales",
      privacy: "Politique de confidentialité",
      cookies: "Politique de cookies",
      terms: "Conditions générales",
      gdpr: "Infos RGPD",
      cric: "Droits du consommateur & contact",
      manage: "Paramètres des cookies"
    }
  },

  it: {
    nav: { home: "Home", stay: "Alloggi", experiences: "Esperienze", todo: "Cosa fare", gallery: "Galleria", location: "Posizione", contact: "Contatti" },
    hero: { title: "DEVOCEAN Lodge", subtitle: "Soggiorni eco-friendly a pochi minuti dalla spiaggia di Ponta do Ouro, Mozambico meridionale.", ctaPrimary: "Prenota ora", ctaSecondary: "Scopri il lodge", badge: "Comfort e valore apprezzati" },
    stay: { headline: "Soggiorna con noi", blurb: "Tende immerse nella natura o chalet/cottage accoglienti – con ospitalità familiare.", moreDetails: "Altri dettagli" },
    experiences: { headline: "Esperienze", blurb: "Avventure tra oceano e foresta a portata di mano.", operators: "Operatori locali fidati:" },
    todo: {
      headline: "Cosa fare a Ponta do Ouro",
      note: "Per immersioni/snorkeling/seafari/pesca: partner qui sotto.",
      items: [
        { title: "Salita al faro & Lua Do Mar", body: "Sali al Vecchio Faro per una vista panoramica. Prosegui fino al ristorante Lua Do Mar sulla duna. Avvistamenti di delfini tutto l’anno, balene (mag–ott) e tartarughe (dic–gen). Attenzione alla marea: evita la spiaggia da 3 h prima a 3 h dopo l’alta marea." },
        { title: "Passeggiata a Ponta Malongane", body: "Cammina lungo la spiaggia fino al villaggio vicino. A metà percorso, scale tra i banani portano al Campismo Nino Pub & Restaurant. Verso la transizione della baia, un sentiero sale a Sky Island (parapendio). Pub famosi: Drunken Clam e Sunset Shack. Rientro via spiaggia o strada sabbiosa 4×4." },
        { title: "Surf, immersioni & ricerca oceanica", body: "Noleggio tavole al Beach Bar; diversi diving center in paese e un centro di ricerca su delfini/balene." },
        { title: "Mangiare & rilassarsi vicino", body: "Circa 16 pub e ristoranti entro 500 m da DEVOCEAN. Per un massaggio rilassante, chiedi di Lisa (LIZ-Way Massage)." },
        { title: "Noleggio quad", body: "Noleggi privati occasionali dai locali. Prezzo indicativo: ~MZN 2000 all'ora (variabile)." },
      ],
    },
    gallery: { headline: "Galleria" },
    location: {
      headline: "Posizione", blurb: "Ponta do Ouro – Distretto di Matutuíne, Mozambico del sud.",
      items: [
        "Paese di Ponta do Ouro, a due passi dalla spiaggia",
        "15 min per Ponta Malongane • 25 min al confine di Kosi Bay",
        "Parcheggio sicuro • Caffè e mercatini locali nelle vicinanze",
      ],
    },
    contact: { headline: "Contatti & Prenotazioni", blurb: "Domande, date, richieste speciali o gruppi – felici di aiutarti.", call: "Chiama", email: "E-mail", directions: "Indicazioni", bookNow: "Prenota" },
    form: {
      name: "Nome", email: "E-mail", checkin: "Check-in", checkout: "Check-out", message: "Messaggio", send: "Invia",
      consent: "Inviando accetti di essere contattato riguardo alla tua richiesta.",
      phName: "Il tuo nome", phEmail: "tu@email.com", phMsg: "Raccontaci del tuo viaggio…",
    },
    galleryHeading: "Galleria",
    footer: {
      rights: "Tutti i diritti riservati.", desc: "Ospitalità eco a conduzione familiare e progetti comunitari nel sud del Mozambico.",
    },
    legal: {
      title: "Legale",
      privacy: "Informativa sulla privacy",
      cookies: "Politica sui cookie",
      terms: "Termini e condizioni",
      gdpr: "Informazioni GDPR",
      cric: "Diritti dei consumatori & contatti",
      manage: "Impostazioni cookie",
    }
  },

  de: {
    nav: { home: "Startseite", stay: "Unterkünfte", experiences: "Erlebnisse", todo: "Was tun", gallery: "Galerie", location: "Lage", contact: "Kontakt" },
    hero: { title: "DEVOCEAN Lodge", subtitle: "Umweltfreundliche Unterkünfte nur wenige hundert Meter vom Strand in Ponta do Ouro, Südmosambik.", ctaPrimary: "Jetzt buchen", ctaSecondary: "Lodge entdecken", badge: "Von Gästen geliebt: Komfort & Preis-Leistung" },
    stay: { headline: "Bei uns übernachten", blurb: "Naturzelte oder gemütliche Chalets & Cottage – mit herzlicher Gastfreundschaft.", moreDetails: "Mehr Details" },
    experiences: { headline: "Erlebnisse", blurb: "Ozean- und Waldabenteuer direkt vor der Tür.", operators: "Vertrauenswürdige lokale Anbieter:" },
    todo: {
      headline: "Was tun in Ponta do Ouro",
      note: "Tauchen/Schnorcheln/Seafaris/Angeln: Anbieter unten.",
      items: [
        { title: "Leuchtturm-Wanderung & Lua Do Mar", body: "Zum Alten Leuchtturm für Panorama. Weiter zum Restaurant Lua Do Mar auf der Düne. Häufig Delfine (ganzjährig), Wale (Mai–Okt) und Schildkröten (Dez–Jan). Achtung Tide: Strandweg 3 h vor bis 3 h nach Hochwasser meiden." },
        { title: "Zu Fuß nach Ponta Malongane", body: "Am Strand ins Nachbardorf. Auf halbem Weg führen Stufen durch Bananenbäume zum Campismo Nino Pub & Restaurant. Nahe der Bucht ein Pfad zum Sky Island (Paragliding). Beliebte Bars: Drunken Clam, Sunset Shack. Rückweg über Strand oder sandige 4×4-Piste." },
        { title: "Surfen, Tauchen & Ozeanforschung", body: "Surfboard-Verleih an der Beach Bar; mehrere Tauchzentren im Ort sowie ein Forschungszentrum für Delfine/Wale." },
        { title: "Essen & Entspannen in der Nähe", body: "Etwa 16 Pubs und Restaurants im Umkreis von 500 m. Für eine entspannende Massage: Lisa (LIZ-Way Massage)." },
        { title: "Quad-Verleih", body: "Gelegentlich private Vermietung durch Einheimische. Richtpreis: ca. MZN 2000 pro Stunde (verhandelbar)." },
      ],
    },
    gallery: { headline: "Galerie" },
    location: {
      headline: "Lage", blurb: "Ponta do Ouro – Distrikt Matutuíne, Südmosambik.",
      items: [
        "Ort Ponta do Ouro, wenige Gehminuten zum Strand",
        "15 Min. nach Ponta Malongane • 25 Min. zur Grenze Kosi Bay",
        "Bewachter Parkplatz • Lokale Cafés & Märkte in der Nähe",
      ],
    },
    contact: { headline: "Kontakt & Buchung", blurb: "Fragen, Daten, Sonderwünsche oder Gruppen – wir helfen gern.", call: "Anrufen", email: "E-Mail", directions: "Anfahrt", bookNow: "Buchen" },
    form: {
      name: "Name", email: "E-Mail", checkin: "Check-in", checkout: "Check-out", message: "Nachricht", send: "Senden",
      consent: "Mit dem Absenden stimmen Sie zu, kontaktiert zu werden.",
      phName: "Ihr Name", phEmail: "sie@email.com", phMsg: "Erzählen Sie uns von Ihrer Reise…",
    },
    galleryHeading: "Galerie",
    footer: {
      rights: "Alle Rechte vorbehalten.", desc: "Familiengeführte, umweltfreundliche Gastfreundschaft und Gemeinschaftsprojekte im Süden Mosambiks.",
    },
    legal: {
      title: "Rechtliches",
      privacy: "Datenschutzerklärung",
      cookies: "Cookie-Richtlinie",
      terms: "Allgemeine Geschäftsbedingungen",
      gdpr: "DSGVO-Informationen",
      cric: "Verbraucherrechte & Kontakt",
      manage: "Cookie-Einstellungen",
    }
  },

  es: {
    nav: { home: "Inicio", stay: "Alojamiento", experiences: "Experiencias", todo: "Qué hacer", gallery: "Galería", location: "Ubicación", contact: "Contacto" },
    hero: { title: "DEVOCEAN Lodge", subtitle: "Alojamientos ecológicos a pocos cientos de metros de la playa en Ponta do Ouro, Sur de Mozambique.", ctaPrimary: "Reservar", ctaSecondary: "Explorar el lodge", badge: "Comodidad y valor muy apreciados" },
    stay: { headline: "Alójate con nosotros", blurb: "Tiendas en la naturaleza o chalets/cottage acogedores – con hospitalidad familiar.", moreDetails: "Más detalles" },
    experiences: { headline: "Experiencias", blurb: "Aventuras de océano y bosque a tu puerta.", operators: "Operadores locales de confianza:" },
    todo: {
      headline: "Qué hacer en Ponta do Ouro",
      note: "Buceo/snorkel/seafaris/pesca: ver abajo.",
      items: [
        { title: "Subida al faro & Lua Do Mar", body: "Sube al Viejo Faro para vistas panorámicas. Continúa al restaurante Lua Do Mar en la duna. A menudo delfines (todo el año), ballenas (may–oct) y tortugas (dic–ene). Atención a la marea: evita la playa desde 3 h antes hasta 3 h después de la pleamar." },
        { title: "Camina a Ponta Malongane", body: "Paseo por la playa al pueblo vecino. A mitad, escaleras entre bananos llevan a Campismo Nino Pub & Restaurant. Cerca del cambio de bahía, un sendero sube a Sky Island (parapente). Pubs famosos: Drunken Clam y Sunset Shack. Regresa por la playa o la pista arenosa 4×4." },
        { title: "Surf, buceo & investigación oceánica", body: "Alquiler de tablas en el Beach Bar; varios centros de buceo en el pueblo y un centro de investigación de delfines/ballenas." },
        { title: "Comer & relajarse cerca", body: "Hay ~16 pubs y restaurantes a menos de 500 m de DEVOCEAN. Para un masaje relajante, pregunta por Lisa (LIZ-Way Massage)." },
        { title: "Alquiler de quads", body: "Alquileres privados ocasionales de locales. Precio orientativo: ~MZN 2000 por hora (variable)." },
      ],
    },
    gallery: { headline: "Galería" },
    location: {
      headline: "Ubicación", blurb: "Ponta do Ouro – Distrito de Matutuíne, sur de Mozambique.",
      items: [
        "Pueblo de Ponta do Ouro, a un corto paseo de la playa",
        "15 min a Ponta Malongane • 25 min a la frontera de Kosi Bay",
        "Aparcamiento seguro • Cafés y mercados locales cercanos",
      ],
    },
    contact: { headline: "Contacto & Reservas", blurb: "Preguntas, fechas, solicitudes especiales o grupos – estaremos encantados de ayudarte.", call: "Llamar", email: "Correo", directions: "Cómo llegar", bookNow: "Reservar" },
    form: {
      name: "Nombre", email: "Correo", checkin: "Check-in", checkout: "Check-out", message: "Mensaje", send: "Enviar",
      consent: "Al enviar, aceptas que te contactemos.",
      phName: "Tu nombre", phEmail: "tu@email.com",
      phMsg: "Cuéntanos sobre tu viaje…",
    },
    galleryHeading: "Galería",
    footer: {
      rights: "Todos los derechos reservados.", desc: "Hospitalidad ecológica familiar y proyectos comunitarios en el sur de Mozambique.",
    },
    legal: {
      title: "Legal",
      privacy: "Política de privacidad",
      cookies: "Política de cookies",
      terms: "Términos y condiciones",
      gdpr: "Información GDPR",
      cric: "Derechos del consumidor & contacto",
      manage: "Configuración de cookies",
    }
  },
};

/* ===== Localizers ===== */
function localizeUnits(lang) {
  const tr = L10N[lang]?.units || {};
  return UNIT_BASE.map((u) => ({
    ...u,
    title: tr[u.key]?.title || u.title,
    short: tr[u.key]?.short || u.short,
    details: tr[u.key]?.details || u.details,
  }));
}
function localizeExperiences(lang) {
  const tr = L10N[lang]?.experiences || {};
  return EXP_BASE.map((e) => ({
    ...e,
    title: tr[e.key]?.title || e.title,
    desc: tr[e.key]?.desc || e.desc,
  }));
}

/* ===== Socials ===== */
const socials = [
  { name: "Facebook", href: "https://www.facebook.com/devoceanmz/", icon: Facebook },
  { name: "Instagram", href: "https://www.instagram.com/devoceanmz/", icon: Instagram },
  { name: "Google Maps", href: "https://maps.app.goo.gl/edhq5PGLLhGMh9rL6", icon: MapPin },
  { name: "X (Twitter)", href: "https://x.com/DEVOCEANMZ", icon: Bird },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/devocean-lodge/?viewAsMember=true", icon: Briefcase },
  { name: "TikTok", href: "https://www.tiktok.com/@devoceanlodge", icon: Music },
  { name: "Pinterest", href: "https://www.pinterest.com/devoceansa/", icon: Pin },
  { name: "YouTube", href: "https://www.youtube.com/@DEVOCEAN_MZ", icon: PlayCircle },
];

const LEGAL_LABELS = {
  en: {
    title: "Legal",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    terms: "Terms & Conditions",
    gdpr: "GDPR Info",
    cric: "Consumer Rights & Contact",
    manage: "Cookie Settings",
  },
  pt: {
    title: "Legal",
    privacy: "Política de Privacidade",
    cookies: "Política de Cookies",
    terms: "Termos & Condições",
    gdpr: "Informações GDPR",
    cric: "Direitos do Consumidor & Contacto",
    manage: "Definições de Cookies",
  },
  nl: {
    title: "Juridisch",
    privacy: "Privacybeleid",
    cookies: "Cookiebeleid",
    terms: "Algemene Voorwaarden",
    gdpr: "GDPR-informatie",
    cric: "Consumentenrechten & contact",
    manage: "Cookie-instellingen",
  },
  fr: {
    title: "Mentions légales",
    privacy: "Politique de confidentialité",
    cookies: "Politique de cookies",
    terms: "Conditions générales",
    gdpr: "Informations RGPD",
    cric: "Droits des consommateurs & contact",
    manage: "Paramètres des cookies",
  },
  it: {
    title: "Legale",
    privacy: "Informativa sulla privacy",
    cookies: "Politica sui cookie",
    terms: "Termini e condizioni",
    gdpr: "Informazioni GDPR",
    cric: "Diritti dei consumatori & contatti",
    manage: "Impostazioni cookie",
  },
  de: {
    title: "Rechtliches",
    privacy: "Datenschutzerklärung",
    cookies: "Cookie-Richtlinie",
    terms: "Allgemeine Geschäftsbedingungen",
    gdpr: "DSGVO-Informationen",
    cric: "Verbraucherrechte & Kontakt",
    manage: "Cookie-Einstellungen",
  },
  es: {
    title: "Legal",
    privacy: "Política de privacidad",
    cookies: "Política de cookies",
    terms: "Términos y condiciones",
    gdpr: "Información GDPR",
    cric: "Derechos del consumidor & contacto",
    manage: "Configuración de cookies",
  },
};

/* ---------- Brand Select (accessible, no deps) ---------- */
function Select({
  value,
  onChange,
  options,
  ariaLabel,
  ariaLabelledBy,
  className = "",
  widthClass = "w-[64px]",
}) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(
    Math.max(0, options.findIndex(o => o.value === value))
  );

  const btnRef = React.useRef(null);
  const listRef = React.useRef(null);

  const selected = options.find(o => o.value === value) || options[0];

  // close on outside click
  React.useEffect(() => {
    function onDoc(e) {
      if (!btnRef.current && !listRef.current) return;
      if (btnRef.current?.contains(e.target)) return;
      if (listRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keyboard on button
  function onButtonKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive(i => {
        if (e.key === "ArrowDown") return Math.min(options.length - 1, (i ?? 0) + 1);
        return Math.max(0, (i ?? 0) - 1);
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(o => !o);
    }
  }

  // keyboard on list
  function onListKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(i => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[active];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
        btnRef.current?.focus();
      }
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const listboxId = React.useId();

  return (
    <div className={`relative ${widthClass} ${className}`} data-select>
      <button
        ref={btnRef}
        type="button"
        className="w-full h-7 px-2 pr-6 rounded-md border border-white/35 bg-white/10 text-white text-[12px] flex items-center justify-between shadow-sm hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onButtonKeyDown}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <svg
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-80"
          viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          ref={listRef}
          onKeyDown={onListKeyDown}
          className="absolute z-[70] mt-1 w-full max-h-64 overflow-auto no-scrollbar rounded-md border border-white/25 bg-[#9e4b13] text-white text-[12px] shadow-lg focus:outline-none py-1"
        >
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const isActive = i === active;
            return (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={selected}
                data-active={isActive ? "true" : undefined}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
                className={`cursor-pointer px-3 py-1.5 transition
                 ${isActive ? "bg-white/15" : "hover:bg-white/10"}
                 ${selected ? "font-semibold text-white" : "font-normal text-white/90"}`}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function () {
  // --- state & refs ---------------------------------------------------------
  const [lang, setLang] = useState(() => pickInitialLang());
  const [currency, setCurrency] = useState(() => pickInitialCurrency());
  const [menuOpen, setMenuOpen] = useState(false);

  const inRef = useRef(null);
  const outRef = useRef(null);

  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [showNativeIn, setShowNativeIn] = useState(false);
  const [showNativeOut, setShowNativeOut] = useState(false);

  const [toast, setToast] = useState(null); // { type: 'ok' | 'err', msg: string } | null

  // Prevent duplicate event pushes for the same toast instance
  const lastToastEventRef = useRef('');

  // --- derived --------------------------------------------------------------
  const dateLang = DATE_LANG_BY_LANG[lang] || "en-GB";
  const todayISO = new Date().toISOString().split("T")[0];

  const ui = UI[lang] || UI.en;
  const locale = LOCALE_BY_LANG[lang] || "en-US";
  const bookUrl =
    `https://book.devoceanlodge.com/bv3/search?locale=${locale}&currency=${currency}`;

  // 1) persist language + update <html lang="">
  useEffect(() => {
    // normalize to your supported set
    let two = String(lang || navigator.language || "en").toLowerCase();
    if (/^[a-z]{2}-[a-z]{2}$/.test(two)) two = two.slice(0, 2); // "en-GB" → "en"
    if (two === "pt-mz") two = "ptmz"; // your Moz flavor
    if (two === "pt-pt" || two === "pt-br") two = "pt";

    try {
      localStorage.setItem("site.lang", two);              // canonical
      localStorage.setItem("site.lang_source", "user");    // mark as user choice
      // Optional cleanup of legacy keys (safe to do once or leave it)
      localStorage.removeItem("pref.lang");
      localStorage.removeItem("site:lang");
    } catch { }

    document.documentElement.setAttribute("lang", two);
  }, [lang]);

  // 2) persist currency (canonical key)
  useEffect(() => {
    const c = clampCur(currency) || "EUR";
    try {
      localStorage.setItem("site.currency", c);
    } catch { }
    // keep cookies in sync
    const L = localStorage.getItem("site.lang") || "en";
    // reuse the same helper if it's in scope; otherwise inline the cookie lines
    (function setPrefCookies(lang, cur) {
      const isLocal =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        /^\d+\.\d+\.\d+\.\d+$/.test(location.hostname);
      const domainPart = isLocal ? "" : `;domain=.devoceanlodge.com`;
      const securePart = location.protocol === "https:" ? ";Secure" : "";
      const base = `;max-age=31536000;path=/;SameSite=Lax${domainPart}${securePart}`;
      document.cookie = `lang=${lang}${base}`;
      document.cookie = `currency=${cur}${base}`;
    })(L, c);
  }, [currency]);

  // 3) set native date input locale
  useEffect(() => {
    if (inRef.current) inRef.current.lang = dateLang;
    if (outRef.current) outRef.current.lang = dateLang;
  }, [dateLang]);

  // 4) keep --stack-h in sync with the fixed header stack height
  useEffect(() => {
    const el = document.getElementById("nav-stack");
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty("--stack-h", `${el.offsetHeight}px`);
    };
    sync();
    window.addEventListener("resize", sync);
    const obs = new ResizeObserver(sync);
    obs.observe(el);
    return () => {
      window.removeEventListener("resize", sync);
      obs.disconnect();
    };
  }, []);

  // Show localized toast when redirected back with ?sent=1|0
  useEffect(() => {
    const getSentFlag = () => {
      // 1) normal query string
      const qs = new URLSearchParams(window.location.search);
      const a = qs.get("sent");
      if (a) return { source: "search", value: a, qs };

      // 2) sometimes ?sent=… lands after the hash:  /#contact?sent=1
      const hash = window.location.hash || "";
      const i = hash.indexOf("?");
      if (i !== -1) {
        const hqs = new URLSearchParams(hash.slice(i + 1));
        const b = hqs.get("sent");
        if (b) return { source: "hash", value: b, qs: hqs };
      }
      return null;
    };

    const hit = getSentFlag();
    if (!hit) return;

    const t = I18N[lang]?.toast || I18N.en.toast;
    const type = hit.value === "1" ? "ok" : "err";
    const msg = type === "ok" ? t.ok : t.err.replace("{email}", EMAIL);
    setToast({ type, msg });

    // Clean URL so it doesn’t re-trigger on refresh
    if (hit.source === "search") {
      const qs = new URLSearchParams(window.location.search);
      qs.delete("sent");
      const cleaned = window.location.pathname + (qs.toString() ? "?" + qs.toString() : "") + window.location.hash;
      window.history.replaceState({}, "", cleaned);
    } else {
      const hash = window.location.hash;
      const i = hash.indexOf("?");
      if (i !== -1) {
        const base = hash.slice(0, i); // e.g. "#contact"
        const hqs = new URLSearchParams(hash.slice(i + 1));
        hqs.delete("sent");
        const cleanedHash = base + (hqs.toString() ? "?" + hqs.toString() : "");
        const newUrl = window.location.pathname + window.location.search + cleanedHash;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [lang]);

  // Auto-hide toasts after 6s (keeps your close “×” working too)
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  // Auto-hide toasts after 6s (keeps your close “×” working too)
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  // Fire GTM events when a toast is shown (success or error)
  useEffect(() => {
    if (!toast) return;

    // Compose a stable key so we don't double-fire on re-renders of the same toast
    const key = `${toast.type}|${toast.msg}`;
    if (lastToastEventRef.current === key) return;
    lastToastEventRef.current = key;

    window.dataLayer = window.dataLayer || [];

    // Optional: enrich with context
    const method = 'toast'; // or 'toast-query', 'toast-hash', etc., if you wire the source
    const page = window.location.pathname;

    if (toast.type === 'ok') {
      window.dataLayer.push({
        event: 'contact_sent',
        form: 'contact',
        method,
        lang,   // from your state
        page
      });
      // console.debug('DL event: contact_sent'); // QA only
    } else if (toast.type === 'err') {
      window.dataLayer.push({
        event: 'contact_error',
        form: 'contact',
        method,
        lang,   // from your state
        page
      });
      // console.debug('DL event: contact_error'); // QA only
    }
  }, [toast, lang]);

  function handleAnchorNav(e, href) {
    const id = href && href.startsWith('#') ? href.slice(1) : '';
    const el = id ? document.getElementById(id) : null;
    if (!el) return;

    e.preventDefault();

    const targetTop = el.getBoundingClientRect().top + window.scrollY;
    const offset =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--stack-h')
      ) || 0;

    window.scrollTo({
      top: Math.max(0, targetTop - offset),
      behavior: 'smooth',
    });

    const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState({}, '', newUrl);
  }

  return (
    <div
      className="min-h-screen bg-white text-slate-800"
      style={{ paddingTop: "var(--stack-h)" }} // push content below the fixed bars
    >
      {/* ===== Fixed Topbar + Header stack ===== */}
      <div id="nav-stack" className="fixed inset-x-0 top-0 z-50">

        {toast && (
          <div aria-live="polite" className="fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4">
            <div className={`max-w-md w-full rounded-xl px-4 py-3 shadow-lg border
            ${toast.type === 'ok'
                ? 'bg-green-600 text-white border-green-500'
                : 'bg-red-600 text-white border-red-500'}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">{toast.type === 'ok' ? '✓' : '✕'}</span>
                <p className="text-sm">{toast.msg}</p>
                <button onClick={() => setToast(null)} className="ml-auto text-white/80 hover:text-white">×</button>
              </div>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="topbar w-full bg-[#9e4b13] text-white text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2">

            {/* LEFT: quick actions on mobile; contact text on desktop */}
            <div className="flex items-center gap-2">
              {/* Mobile icons */}
              <div className="sm:hidden flex items-center gap-2">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/258844182252?text=Hi%20DEVOCEAN%20Lodge"
                  aria-label="WhatsApp"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  target="_blank" rel="noreferrer"
                >
                  <MessageCircle size={16} />
                </a>
                {/* Email */}
                <a
                  href={`mailto:${EMAIL}`}
                  aria-label="Email"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  target="_blank" rel="noreferrer"
                >
                  <Mail size={16} />
                </a>
              </div>

              {/* Desktop contact text */}
              <div className="hidden sm:flex items-center gap-6 text-sm text-white/90">
                <a href="tel:+258844182252" className="hover:text-white">+258 84 418 2252</a>
                <a href={`mailto:${EMAIL}`} className="hover:text-white">{EMAIL}</a>
              </div>
            </div>

            {/* RIGHT: globe + selectors (mobile & desktop) — NO book button */}
            <div className="flex items-center gap-2">
              {/* Mobile selects */}
              <div className="sm:hidden flex items-center gap-2">
                <Select
                  value={lang}
                  onChange={setLang}
                  ariaLabel="Language"
                  widthClass="w-[56px]"
                  options={[
                    { value: "en", label: "EN" },
                    { value: "pt", label: "PT" },
                    { value: "nl", label: "NL" },
                    { value: "fr", label: "FR" },
                    { value: "it", label: "IT" },
                    { value: "de", label: "DE" },
                    { value: "es", label: "ES" },
                  ]}
                />
                <Select
                  value={currency}
                  onChange={setCurrency}
                  ariaLabel="Currency"
                  widthClass="w-[64px]"
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "MZN", label: "MZN" },
                    { value: "ZAR", label: "ZAR" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]}
                />
              </div>

              {/* Desktop selects with globe */}
              <div className="hidden sm:flex items-center gap-2">
                <Globe size={16} className="text-white/95" aria-hidden="true" />
                <Select
                  value={lang}
                  onChange={setLang}
                  ariaLabel="Language"
                  widthClass="w-[64px]"
                  options={[
                    { value: "en", label: "EN" },
                    { value: "pt", label: "PT" },
                    { value: "nl", label: "NL" },
                    { value: "fr", label: "FR" },
                    { value: "it", label: "IT" },
                    { value: "de", label: "DE" },
                    { value: "es", label: "ES" },
                  ]}
                />
                <Select
                  value={currency}
                  onChange={setCurrency}
                  ariaLabel="Currency"
                  widthClass="w-[70px]"
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "MZN", label: "MZN" },
                    { value: "ZAR", label: "ZAR" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Header (also inside the fixed stack) */}
        <header className="bg-white/90 backdrop-blur border-b">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="#home" className="flex items-center gap-3">
                <img src={IMG.logo} alt="DEVOCEAN Lodge" className="h-9 w-9 rounded-full object-cover" />
                <span className="font-semibold">DEVOCEAN Lodge</span>
              </a>
            </div>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-6">
              {[
                ["home", "#home"],
                ["stay", "#stay"],
                ["experiences", "#experiences"],
                ["todo", "#todo"],
                ["gallery", "#gallery"],
                ["location", "#location"],
                ["contact", "#contact"],
              ].map(([k, href]) => (
                <li key={k}>
                  <a
                    href={href}
                    className="hover:text-[#9e4b13]"
                    onClick={(e) => handleAnchorNav(e, href)}
                  >
                    {ui.nav[k]}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={bookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cta px-4 py-2 rounded-xl bg-[#9e4b13] text-white"
                >
                  {ui.contact.bookNow}
                </a>
              </li>
            </ul>

            {/* Burger */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border"
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-controls="mnav"
            >
              <Menu />
            </button>
          </nav>

          {/* Mobile menu */}
          {menuOpen && (
            <div id="mnav" className="md:hidden border-t bg-white">
              {[
                ["home", "#home"],
                ["stay", "#stay"],
                ["experiences", "#experiences"],
                ["todo", "#todo"],
                ["gallery", "#gallery"],
                ["location", "#location"],
                ["contact", "#contact"],
              ].map(([k, href]) => (
                <a
                  key={k}
                  href={href}
                  className="block px-4 py-3 hover:bg-slate-50"
                  onClick={(e) => {
                    setMenuOpen(false);
                    const id = href.startsWith('#') ? href.slice(1) : '';
                    const el = id ? document.getElementById(id) : null;

                    if (el) {
                      e.preventDefault();

                      const rectTop = el.getBoundingClientRect().top + window.scrollY;
                      const offset =
                        parseFloat(getComputedStyle(document.documentElement)
                          .getPropertyValue('--stack-h')) || 0;

                      window.scrollTo({ top: Math.max(0, rectTop - offset), behavior: 'smooth' });

                      // ✅ keep the current path and query; only change the hash
                      const newUrl = `${window.location.pathname}${window.location.search}#${id}`;
                      window.history.replaceState({}, '', newUrl);
                    }
                  }}
                >
                  {ui.nav[k]}
                </a>
              ))}
              <a
                href={bookUrl}
                target="_blank"
                rel="noreferrer"
                className="block m-4 text-center btn-cta px-4 py-2 rounded-2xl bg-[#9e4b13] text-white"
                onClick={() => setMenuOpen(false)}
              >
                {ui.contact.bookNow}
              </a>
            </div>
          )}
        </header>
      </div>

      {/* ===== Page content below (scrolls normally) ===== */}
      <HomeHero images={HERO_IMAGES} ui={ui} bookUrl={bookUrl} />

      {/* Stay */}
      <section id="stay" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{ui.stay.headline}</h2>
            <p className="mt-2 text-slate-600 max-w-2xl">{ui.stay.blurb}</p>
          </div>
          <a
            href={bookUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-cta hidden md:inline-block px-4 py-2 rounded-xl bg-[#9e4b13] text-white shadow hover:shadow-md"
            aria-label={ui.contact.bookNow}
          >
            {ui.contact.bookNow}
          </a>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {localizeUnits(lang).map((u, idx) => (
            <motion.div
              key={u.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md bg-white"
            >
              <div className="h-44 overflow-hidden">
                <img src={u.img} alt={u.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{u.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{u.short}</p>
                <details className="mt-3 group">
                  <summary className="list-none flex items-center gap-1 text-sm text-[#9e4b13] cursor-pointer">
                    <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                    <span>{ui.stay.moreDetails}</span>
                  </summary>
                  <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc list-inside">
                    {u.details.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </details>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold">{ui.experiences.headline}</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">{ui.experiences.blurb}</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizeExperiences(lang).map((c, idx) => (
              <motion.div key={c.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md">
                <div className="h-40 overflow-hidden"><img src={c.img} alt={c.title} className="w-full h-full object-cover" loading="lazy" /></div>
                <div className="p-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-sm text-slate-700">
            <p className="font-medium">{ui.experiences.operators}</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {[
                { name: "Gozo Azul", href: "https://gozo-azul.co.za/" },
                { name: "Back to Basics Adventures", href: "http://www.backtobasicsadventures.com/" },
                { name: "Dolphin Encountours", href: "https://www.dolphinencountours.org/" },
                { name: "The Dolphin Centre", href: "https://thedolphincentre.com/" },
                { name: "SPIGS Surf’s Up", href: "https://www.facebook.com/spigssurfsup" },
                { name: "Mozambique Fishin’ Charters", href: "https://mozambiquefishincharters.co.za/packages/" },
              ].map((p) => (
                <li key={p.href}><a className="text-[#9e4b13] hover:underline" href={p.href} target="_blank" rel="noreferrer">{p.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What to do */}
      <section id="todo" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold">{ui.todo.headline}</h2>
        <p className="mt-2 text-slate-600">{ui.todo.note}</p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {(ui.todo.items.length ? ui.todo.items : UI.en.todo.items).map((item, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="mt-2 text-slate-700 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-bold">{ui.galleryHeading}</h2>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMG.gallery.map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative group rounded-xl overflow-hidden">
              <img src={src} alt={`DEVOCEAN Lodge gallery ${i + 1}`} className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section id="location" className="bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{ui.location.headline}</h2>
            <p className="mt-2 text-slate-600">{ui.location.blurb}</p>
            <ul className="mt-4 space-y-2 text-slate-700">
              {(ui.location.items.length ? ui.location.items : UI.en.location.items).map((li) => (
                <li key={li} className="flex items-start gap-2"><MapPin className="mt-1" /> {li}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden border shadow">
            <iframe
              title="DEVOCEAN Lodge Map"
              src={mapEmbed()}
              className="w-full h-80"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-start justify-items-center md:justify-items-stretch">
          {/* Left: text & CTAs */}
          <div className="w-full">
            <h2 className="text-3xl md:text-4xl font-bold">{ui.contact.headline}</h2>
            <p className="mt-2 text-slate-600 max-w-xl">{ui.contact.blurb}</p>

            {/* Chips wrap on small screens */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="tel:+258844182252" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border">
                <Phone size={18} /> {ui.contact.call}
              </a>
              <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border">
                <Mail size={18} /> {ui.contact.email}
              </a>
              <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border">
                <MapPin size={18} /> {ui.contact.directions}
              </a>
            </div>

            <a
              href={bookUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-cta mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#9e4b13] text-white shadow hover:shadow-md"
              aria-label={ui.contact.bookNow}
            >
              <CalendarCheck2 size={18} />
              {ui.contact.bookNow}
            </a>

            {/* Socials */}
            <div className="mt-6 flex flex-wrap md:flex-wrap gap-2 md:gap-3 max-w-full">
              {socials.map((S) => (
                <a
                  key={S.name}
                  href={S.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 md:w-9 md:h-9 inline-flex items-center justify-center rounded-full border hover:bg-slate-50 shrink-0"
                  aria-label={S.name}
                  title={S.name}
                >
                  <S.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div
            className="
            contact-form
            justify-self-start
            w-[92vw] max-w-[22rem]
            sm:w-full sm:max-w-lg
            md:w-full md:max-w-none
            mx-auto md:ml-auto
            rounded-2xl border shadow p-4 sm:p-6 bg-white overflow-hidden
          "
          >
            <form action="/contact.php" method="post" className="grid gap-4" autoComplete="on">
              <input type="hidden" name="lang" value={lang} />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
              <input type="hidden" name="checkin_iso" value={checkin || ""} />
              <input type="hidden" name="checkout_iso" value={checkout || ""} />
              <input type="hidden" name="currency" value={currency} />

              <div>
                <label htmlFor="name" className="text-sm text-slate-600">{ui.form.name}</label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  placeholder={ui.form.phName}
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm text-slate-600">{ui.form.email}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  placeholder={ui.form.phEmail}
                />
              </div>

              {/* Dates (overlay trick => dd/mm/yyyy) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative min-w-0">
                  <label htmlFor="checkin_visible" className="text-xs sm:text-sm text-slate-600">{ui.form.checkin}</label>
                  <input
                    id="checkin_visible"
                    type="text"
                    readOnly
                    value={checkin ? toDDMMYYYY(checkin) : ""}
                    onClick={() => {
                      if (inRef.current?.showPicker) inRef.current.showPicker();
                      else inRef.current?.focus();
                    }}
                    placeholder="dd/mm/yyyy"
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  />
                  <input
                    ref={inRef}
                    type="date"
                    lang={dateLang}
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    min={todayISO}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>

                <div className="relative min-w-0">
                  <label htmlFor="checkout_visible" className="text-xs sm:text-sm text-slate-600">{ui.form.checkout}</label>
                  <input
                    id="checkout_visible"
                    type="text"
                    readOnly
                    value={checkout ? toDDMMYYYY(checkout) : ""}
                    onClick={() => {
                      if (outRef.current?.showPicker) outRef.current.showPicker();
                      else outRef.current?.focus();
                    }}
                    placeholder="dd/mm/yyyy"
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  />
                  <input
                    ref={outRef}
                    type="date"
                    lang={dateLang}
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    min={checkin || todayISO}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="text-sm text-slate-600">{ui.form.message}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  placeholder={ui.form.phMsg}
                />
              </div>

              <button type="submit" className="btn-cta px-4 py-2 rounded-2xl bg-[#9e4b13] text-white hover:shadow">
                {ui.form.send}
              </button>
              <p className="text-xs text-slate-500">{ui.form.consent}</p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">

          {/* Brand / About */}
          <div>
            <a
              href="#home"
              className="flex items-center gap-3 hover:text-white"
              onClick={(e) => handleAnchorNav(e, '#home')}
            >
              <img src={IMG.logo} alt="DEVOCEAN Lodge" className="h-9 w-9 rounded-full object-cover" />
              <span className="font-semibold">DEVOCEAN Lodge</span>
            </a>
            <p className="mt-3 text-sm text-slate-400">{ui.footer.desc}</p>
          </div>

          {/* Stay */}
          <div>
            <a
              href="#stay"
              className="font-semibold hover:text-white"
              onClick={(e) => handleAnchorNav(e, '#stay')}
            >
              {ui.nav.stay}
            </a>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              {localizeUnits(lang).map((u) => (
                <li key={u.key}>
                  <a
                    className="hover:text-white"
                    href="#stay"
                    onClick={(e) => handleAnchorNav(e, '#stay')}
                  >
                    {u.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <a
              href="#experiences"
              className="font-semibold hover:text-white"
              onClick={(e) => handleAnchorNav(e, '#experiences')}
            >
              {ui.nav.experiences}
            </a>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              {localizeExperiences(lang).slice(0, 4).map((ex) => (
                <li key={ex.key}>
                  <a
                    className="hover:text-white"
                    href="#experiences"
                    onClick={(e) => handleAnchorNav(e, '#experiences')}
                  >
                    {ex.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <a
              href="#contact"
              className="font-semibold hover:text-white"
              onClick={(e) => handleAnchorNav(e, '#contact')}
            >
              {ui.nav.contact}
            </a>
            <ul className="mt-2 space-y-2 text-sm text-slate-400">
              {/* leave tel/mail as-is (no handler) */}
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+258844182252" className="hover:text-white whitespace-nowrap">
                  +258 84 418 2252
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href={`mailto:${EMAIL}`} className="hover:text-white">{EMAIL}</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} /> Ponta do Ouro, Mozambique
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold">{ui?.legal?.title ?? "Legal"}</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              <li><a className="hover:text-white" href="/legal/privacy.html">{ui?.legal?.privacy ?? "Privacy Policy"}</a></li>
              <li><a className="hover:text-white" href="/legal/cookies.html">{ui?.legal?.cookies ?? "Cookie Policy"}</a></li>
              <li><a className="hover:text-white" href="/legal/terms.html">{ui?.legal?.terms ?? "Terms & Conditions"}</a></li>
              <li><a className="hover:text-white" href="/legal/GDPR.html">{ui?.legal?.gdpr ?? "GDPR Info"}</a></li>
              <li><a className="hover:text-white" href="/legal/CRIC.html">{ui?.legal?.cric ?? "Consumer Rights & Contact"}</a></li>
              <li>
                <a
                  href="/cookies.html#manage"
                  className="hover:text-white"
                  data-cky-tag="settings"
                  onClick={(e) => {
                    try {
                      if (window.CookieYes && window.CookieYes.showSettings) {
                        e.preventDefault();
                        window.CookieYes.showSettings();
                      } else {
                        const revisit = document.querySelector('.cky-btn-revisit');
                        if (revisit) { e.preventDefault(); revisit.click(); }
                      }
                    } catch (_) { }
                  }}
                >
                  {ui?.legal?.manage ?? "Cookie Settings"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-slate-800">
          <div
            className="
              max-w-7xl mx-auto px-4 py-4 text-xs text-slate-500
              flex flex-col gap-3
              md:flex-row md:items-center md:justify-between
            "
          >
            <div className="flex items-center gap-3 order-1 md:order-2">
              {socials.map((S) => (
                <a
                  key={S.name}
                  href={S.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                  aria-label={S.name}
                  title={S.name}
                >
                  <S.icon size={16} />
                </a>
              ))}
            </div>

            <span className="order-2 md:order-1">
              © {new Date().getFullYear()} DEVOCEAN Lodge. {ui.footer.rights}
            </span>
          </div>
        </div>
      </footer>
    </div >
  );
}
