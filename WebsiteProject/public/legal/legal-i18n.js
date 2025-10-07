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
    var lang = readLS("site.lang") || normLang(navigator.language);

    // Dicts with English fallback
    var UI_EN = (window.LEGAL_UI && window.LEGAL_UI.en) || {};
    var DICT_EN = (window.LEGAL_DICT && window.LEGAL_DICT.en) || {};
    var UI = (window.LEGAL_UI && window.LEGAL_UI[lang]) || UI_EN;
    var DICT = (window.LEGAL_DICT && window.LEGAL_DICT[lang]) || DICT_EN;

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
      var data = (key === "quickLinks" ? pageDict[key] : (pageDict.sections && pageDict.sections[key])) || {};
      var t = sec.querySelector('[data-part="title"]');
      var p = sec.querySelector('[data-part="body"]');
      var ul = sec.querySelector('[data-part="items"]');
      var f = sec.querySelector('[data-part="footer"]');
      var linksContainer = sec.querySelector('[data-part="links"]');

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
        var itemsArray = data.items || data.measures;
        if (Array.isArray(itemsArray)) {
          itemsArray.forEach(function (item) {
            var li = document.createElement("li");
            li.innerHTML = String(item);
            ul.appendChild(li);
          });
        }
      }

      // Handle intro (for security section and GDPR sections)
      var intro = sec.querySelector('[data-part="intro"]');
      if (intro && data.intro) {
        intro.textContent = data.intro;
      }

      // Handle periodsTitle (for retention section)
      var periodsTitle = sec.querySelector('[data-part="periodsTitle"]');
      if (periodsTitle && data.periodsTitle) {
        periodsTitle.textContent = data.periodsTitle;
      }

      // Handle description (for cookie sections)
      var desc = sec.querySelector('[data-part="description"]');
      if (desc && data.description) {
        desc.textContent = data.description;
      }

      // Handle consentTitle (for manage section)
      var consentTitle = sec.querySelector('[data-part="consentTitle"]');
      if (consentTitle && data.consentTitle) {
        consentTitle.textContent = data.consentTitle;
      }

      // Handle consentText (for manage section)
      var consentText = sec.querySelector('[data-part="consentText"]');
      if (consentText && data.consentText) {
        consentText.textContent = data.consentText;
      }

      // Handle browserText (for manage section)
      var browserText = sec.querySelector('[data-part="browserText"]');
      if (browserText && data.browserText) {
        browserText.textContent = data.browserText;
      }

      // Handle cookie tables (for cookie sections)
      var cookieTable = sec.querySelector('.cookie-table');
      if (cookieTable && data.tableHeaders && Array.isArray(data.cookies)) {
        // Update table headers
        var thead = cookieTable.querySelector('thead tr');
        if (thead && data.tableHeaders) {
          thead.innerHTML = '';
          var th1 = document.createElement('th');
          th1.textContent = data.tableHeaders.cookie || 'Cookie';
          var th2 = document.createElement('th');
          th2.textContent = data.tableHeaders.duration || 'Duration';
          var th3 = document.createElement('th');
          th3.textContent = data.tableHeaders.description || 'Description';
          thead.appendChild(th1);
          thead.appendChild(th2);
          thead.appendChild(th3);
        }
        
        // Update table body with cookie data
        var tbody = cookieTable.querySelector('tbody');
        if (tbody) {
          tbody.innerHTML = '';
          data.cookies.forEach(function(cookie) {
            var tr = document.createElement('tr');
            var td1 = document.createElement('td');
            td1.textContent = cookie.name || '';
            var td2 = document.createElement('td');
            td2.textContent = cookie.duration || '';
            var td3 = document.createElement('td');
            td3.textContent = cookie.desc || '';
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tbody.appendChild(tr);
          });
        }
      }

      if (linksContainer && Array.isArray(data.links)) {
        linksContainer.innerHTML = "";
        data.links.forEach(function (link) {
          var a = document.createElement("a");
          a.href = "#" + link.id;
          a.className = "quick-nav-link";
          a.textContent = link.text;
          linksContainer.appendChild(a);
        });
      }

      if (f) {
        if (typeof data.footer === "string" && data.footer.trim() !== "") {
          f.textContent = data.footer;
        } else if (f.parentNode) {
          f.parentNode.removeChild(f);
        }
      }

      // Handle nested copyright structure (for intellectual-property)
      var copyright = sec.querySelector('[data-part="copyright"]');
      if (copyright && data.copyright) {
        var copyrightTitle = copyright.querySelector('[data-part="title"]');
        var copyrightBody = copyright.querySelector('[data-part="body"]');
        if (copyrightTitle && data.copyright.title) copyrightTitle.textContent = data.copyright.title;
        if (copyrightBody && data.copyright.body) copyrightBody.textContent = data.copyright.body;
      }

      // Handle nested process structure (for disputes)
      var process = sec.querySelector('[data-part="process"]');
      if (process && data.process) {
        var processTitle = process.querySelector('[data-part="title"]');
        var processBody = process.querySelector('[data-part="body"]');
        var processLaw = process.querySelector('[data-part="law"]');
        var processJurisdiction = process.querySelector('[data-part="jurisdiction"]');
        var processMediation = process.querySelector('[data-part="mediation"]');
        
        if (processTitle && data.process.title) processTitle.textContent = data.process.title;
        if (processBody && data.process.body) processBody.textContent = data.process.body;
        if (processLaw && data.process.law) processLaw.textContent = data.process.law;
        if (processJurisdiction && data.process.jurisdiction) processJurisdiction.textContent = data.process.jurisdiction;
        if (processMediation && data.process.mediation) processMediation.textContent = data.process.mediation;
      }

      // Handle embedded notices (reservationReq, checkinCheckout, groupBookings, paymentInfo, noshowPolicy, zeroTolerance)
      ['reservationReq', 'checkinCheckout', 'groupBookings', 'paymentInfo', 'noshowPolicy', 'zeroTolerance'].forEach(function(noticeKey) {
        var notice = sec.querySelector('[data-part="' + noticeKey + '"]');
        if (notice && data[noticeKey]) {
          var noticeTitle = notice.querySelector('[data-part="title"]');
          var noticeBody = notice.querySelector('[data-part="body"]');
          if (noticeTitle && data[noticeKey].title) noticeTitle.textContent = data[noticeKey].title;
          if (noticeBody && data[noticeKey].body) noticeBody.textContent = data[noticeKey].body;
        }
      });

      // Handle cancellation charges with tiers
      var cancellationCharges = sec.querySelector('[data-part="cancellationCharges"]');
      if (cancellationCharges && data.cancellationCharges) {
        var ccTitle = cancellationCharges.querySelector('[data-part="title"]');
        var tierList = cancellationCharges.querySelector('[data-part="tiers"]');
        if (ccTitle && data.cancellationCharges.title) ccTitle.textContent = data.cancellationCharges.title;
        if (tierList && Array.isArray(data.cancellationCharges.tiers)) {
          tierList.innerHTML = '';
          data.cancellationCharges.tiers.forEach(function(tier) {
            var tierDiv = document.createElement('div');
            tierDiv.className = 'tier';
            var periodSpan = document.createElement('span');
            periodSpan.className = 'tier-period';
            periodSpan.textContent = tier.period || '';
            var chargeSpan = document.createElement('span');
            chargeSpan.className = 'tier-charge';
            chargeSpan.textContent = tier.charge || '';
            tierDiv.appendChild(periodSpan);
            tierDiv.appendChild(chargeSpan);
            tierList.appendChild(tierDiv);
          });
        }
      }
    });

    // Handle legal basis items (GDPR page)
    document.querySelectorAll("[data-basis]").forEach(function(basis) {
      var key = basis.getAttribute("data-basis");
      var basisData = pageDict.legalBases && pageDict.legalBases[key];
      if (basisData) {
        var t = basis.querySelector('[data-part="title"]');
        var b = basis.querySelector('[data-part="body"]');
        if (t && basisData.title) t.textContent = basisData.title;
        if (b && basisData.body) b.textContent = basisData.body;
      }
    });

    // Handle rights cards (GDPR page)
    document.querySelectorAll("[data-right]").forEach(function(right) {
      var key = right.getAttribute("data-right");
      var rightData = pageDict.rights && pageDict.rights[key];
      if (rightData) {
        var t = right.querySelector('[data-part="title"]');
        var b = right.querySelector('[data-part="body"]');
        if (t && rightData.title) t.textContent = rightData.title;
        if (b && rightData.body) b.textContent = rightData.body;
      }
    });

    // Handle buttons (GDPR page)
    document.querySelectorAll("[data-button]").forEach(function(btn) {
      var key = btn.getAttribute("data-button");
      var btnData = pageDict.buttons && pageDict.buttons[key];
      if (btnData) {
        var txt = btn.querySelector('[data-part="text"]');
        if (txt && btnData.text) txt.textContent = btnData.text;
      }
    });

    // Handle safeguards (GDPR page)
    document.querySelectorAll("[data-safeguards]").forEach(function(safeguard) {
      var key = safeguard.getAttribute("data-safeguards");
      var safeguardData = pageDict.safeguards && pageDict.safeguards[key];
      if (safeguardData) {
        var t = safeguard.querySelector('[data-part="title"]');
        var b = safeguard.querySelector('[data-part="body"]');
        if (t && safeguardData.title) t.textContent = safeguardData.title;
        if (b && safeguardData.body) b.textContent = safeguardData.body;
      }
    });

    // Handle authority info (GDPR page)
    document.querySelectorAll("[data-authority]").forEach(function(auth) {
      var key = auth.getAttribute("data-authority");
      var authData = pageDict.authority && pageDict.authority[key];
      if (authData) {
        var t = auth.querySelector('[data-part="title"]');
        var n = auth.querySelector('[data-part="name"]');
        var wl = auth.querySelector('[data-part="websiteLabel"]');
        var cl = auth.querySelector('[data-part="contactLabel"]');
        if (t && authData.title) t.textContent = authData.title;
        if (n && authData.name) n.textContent = authData.name;
        if (wl && authData.websiteLabel) wl.textContent = authData.websiteLabel;
        if (cl && authData.contactLabel) cl.textContent = authData.contactLabel;
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
