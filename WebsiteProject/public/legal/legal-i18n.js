/* /legal/legal-i18n.js  (v10)
   - Dynamic AUTO seeding (lang/currency) with hint-first currency inference
   - Hydrates legal pages from LEGAL_UI + LEGAL_DICT
   - setSiteLocale persists to localStorage and cookies (prod-safe)
*/
(function () {
  /* ---------- helpers ---------- */
  function onReady(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true }); else fn(); }
  function readLS(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, v); } catch (_) { } }
  function normLang(raw) {
    if (!raw) return "en";
    let s = String(raw).toLowerCase().replace("_", "-");
    if (s === "pt-mz") s = "ptmz";                   // Moz flavor
    if (s === "pt-pt" || s === "pt-br") s = "pt";      // collapse
    if (/^[a-z]{2}-[a-z]{2}$/.test(s)) s = s.slice(0, 2);
    return s || "en";
  }
  function clampCur(cur) { if (!cur) return null; cur = String(cur).toUpperCase().replace(/[^A-Z]/g, ""); return cur.length === 3 ? cur : null; }

  function inferCurrency(langNow) {
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language].filter(Boolean);

    // Prefer hint for FIRST language, then region, then fallback
    var HINT = {
      "de": "EUR", "nl": "EUR", "fr": "EUR", "it": "EUR", "es": "EUR", "pt": "EUR",
      "en-gb": "GBP", "en-us": "USD", "en-za": "ZAR"
    };
    var first = (list[0] || "").toLowerCase();

    var region = null;
    for (var i = 0; i < list.length; i++) {
      var s = String(list[i] || "").toUpperCase();
      var m = s.match(/-([A-Z]{2})$/);
      if (m) { region = m[1]; break; } // e.g. DE, GB, US, ZA, MZ
    }
    if (!region) {
      try {
        var intl = new Intl.DateTimeFormat().resolvedOptions().locale || "";
        var m2 = String(intl).toUpperCase().match(/-([A-Z]{2})$/);
        if (m2) region = m2[1];
      } catch (_) { }
    }

    var CC2CUR = {
      US: "USD", GB: "GBP",
      NL: "EUR", BE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
      ZA: "ZAR", MZ: "MZN"
    };

    var cur = HINT[first] ||
      (region && CC2CUR[region]) ||
      (langNow === "ptmz" ? "MZN" : "EUR");

    cur = String(cur || "EUR").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    return cur || "EUR";
  }

  // cookie writer (prod-safe)
  function setPrefCookies(lang, currency) {
    var host = location.hostname;
    var isLocal = (host === "localhost") || (host === "127.0.0.1") || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    var domainPart = isLocal ? "" : ";domain=.devoceanlodge.com"; // <-- adjust if apex differs
    var securePart = location.protocol === "https:" ? ";Secure" : "";
    var base = ";max-age=31536000;path=/;SameSite=Lax" + domainPart + securePart; // 1 year

    if (lang) document.cookie = "lang=" + lang + base;
    if (currency) document.cookie = "currency=" + currency + base;
  }

  /* ---------- dynamic AUTO seeding BEFORE hydration ---------- */
  (function seed() {
    var SUPPORTED = ["en", "pt", "nl", "fr", "it", "de", "es", "ptmz"];
    var src = readLS("site.lang_source") || "auto";
    var lang = readLS("site.lang");
    var cur = readLS("site.currency");

    if (!readLS("site.lang_source")) { writeLS("site.lang_source", "auto"); src = "auto"; }

    if (src === "auto") {
      var navLang = normLang(navigator.language);
      if (SUPPORTED.indexOf(navLang) === -1) navLang = "en";
      writeLS("site.lang", navLang);
      writeLS("site.currency", inferCurrency(navLang));
      lang = navLang;
      cur = readLS("site.currency");
    } else {
      if (!lang) {
        lang = normLang(navigator.language);
        if (SUPPORTED.indexOf(lang) === -1) lang = "en";
        writeLS("site.lang", lang);
      }
      if (!cur) {
        cur = inferCurrency(lang);
        writeLS("site.currency", cur);
      }
    }

    try { document.documentElement.setAttribute("lang", lang || "en"); } catch (_) { }
  })();

  /* ---------- hydration ---------- */
  onReady(function () {
    console.log('[legal-i18n] Starting hydration...');
    var lang = readLS("site.lang") || normLang(navigator.language);
    console.log('[legal-i18n] Language:', lang);

    // Dicts with English fallback
    var UI_EN = (window.LEGAL_UI && window.LEGAL_UI.en) || {};
    var DICT_EN = (window.LEGAL_DICT && window.LEGAL_DICT.en) || {};
    var UI = (window.LEGAL_UI && window.LEGAL_UI[lang]) || UI_EN;
    var DICT = (window.LEGAL_DICT && window.LEGAL_DICT[lang]) || DICT_EN;
    console.log('[legal-i18n] LEGAL_UI loaded:', !!window.LEGAL_UI);
    console.log('[legal-i18n] LEGAL_DICT loaded:', !!window.LEGAL_DICT);
    console.log('[legal-i18n] UI:', UI);
    console.log('[legal-i18n] DICT:', DICT);

    // Determine page key
    var body = document.body;
    var pageKey = body && body.getAttribute("data-page");
    if (!pageKey) {
      var m = (location.pathname || "").toLowerCase().match(/\/legal\/([^\/?#]+)\.html/);
      pageKey = (m && m[1]) ? m[1] : "";
    }
    var pageDict = (DICT && DICT[pageKey]) || {};

    // Labels
    var backEl = document.querySelector('[data-role="back-link"]');
    if (backEl && UI.back) backEl.textContent = UI.back;

    var updLbl = document.querySelector('[data-role="updated-label"]');
    if (updLbl && UI.updated) updLbl.textContent = UI.updated;

    // Titles
    var title = pageDict.title || "";
    var h1 = document.querySelector('[data-role="page-title"]');
    var titleTag = document.querySelector("title");
    if (h1 && title) h1.textContent = title;
    if (titleTag && title) titleTag.textContent = "DEVOCEAN Lodge — " + title;

    // Sections
    document.querySelectorAll("[data-section]").forEach(function (sec) {
      var key = sec.getAttribute("data-section");
      var data = pageDict[key] || {};
      var t = sec.querySelector('[data-part="title"]');
      var p = sec.querySelector('[data-part="body"]');
      var ul = sec.querySelector('[data-part="items"]');
      var f = sec.querySelector('[data-part="footer"]');

      if (t && data.title) t.textContent = data.title;

      if (p) {
        if (typeof data.body === "string" && data.body.trim() !== "") {
          var useHtml = p.getAttribute("data-use-html") === "true";
          if (useHtml) p.innerHTML = data.body;
          else p.textContent = data.body;
        } else p.textContent = "";
      }

      if (ul) {
        ul.innerHTML = "";
        if (Array.isArray(data.items)) {
          data.items.forEach(function (item) {
            var li = document.createElement("li");
            li.textContent = String(item);
            ul.appendChild(li);
          });
        }
      }

      if (f) {
        if (typeof data.footer === "string" && data.footer.trim() !== "") {
          f.textContent = data.footer;
        } else if (f.parentNode) {
          f.parentNode.removeChild(f);
        }
      }
    });

    // Stamp date
    var updDate = document.querySelector('[data-role="updated-date"]');
    if (updDate) {
      if (pageDict.updatedDate) {
        updDate.textContent = pageDict.updatedDate;
      } else if (!updDate.textContent.trim()) {
        var d = new Date(), m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        updDate.textContent = String(d.getDate()).padStart(2, "0") + " " + m[d.getMonth()] + " " + d.getFullYear();
      }
    }

    // Public API: user override + persist + cookies
    window.setSiteLocale = window.setSiteLocale || function setSiteLocale(opts) {
      if (!opts || typeof opts !== "object") return;
      var L = opts.lang ? normLang(opts.lang) : (readLS("site.lang") || "en");
      var C = opts.currency ? clampCur(opts.currency) : (readLS("site.currency") || "EUR");
      writeLS("site.lang", L);
      writeLS("site.currency", C || "EUR");
      writeLS("site.lang_source", "user");
      try { document.documentElement.setAttribute("lang", L); } catch (_) { }
      setPrefCookies(L, C || "EUR");
      location.reload(); // rehydrate in chosen language
    };
  });
})();
