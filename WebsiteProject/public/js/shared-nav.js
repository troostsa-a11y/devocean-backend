/**
 * shared-nav.js
 * Injects the full DEVOCEAN Lodge two-tier navigation header into any
 * standalone HTML page (story, meals, accommodation, guide pages).
 * Reads/writes ?lang= query param; reloads on language/region change.
 * Matches the React Header component exactly.
 */
(function () {
  'use strict';

  var BRAND = '#9e4b13';

  var REGIONS = {
    westEu:   { label: 'Western Europe', langs: ['en-GB','pt-PT','nl-NL','fr-FR','it-IT','de-DE','es-ES','sv'] },
    eastEu:   { label: 'Eastern Europe', langs: ['pl','ro','sr','hr','cs'] },
    asia:     { label: 'Asia',           langs: ['en-GB','ja-JP','zh-CN','ru','tr'] },
    americas: { label: 'Americas',       langs: ['en-US','pt-BR','es-ES','fr-FR'] },
    africa:   { label: 'Africa',         langs: ['en-GB','fr-FR','pt-BR','af-ZA','zu','sw'] },
    oceania:  { label: 'Oceania',        langs: ['en-GB'] },
  };

  var LANG_LABELS = [
    ['en-GB','English'],['en-US','English'],['pt-PT','Português'],['pt-BR','Português'],
    ['nl-NL','Nederlands'],['fr-FR','Français'],['it-IT','Italiano'],['de-DE','Deutsch'],
    ['es-ES','Español'],['sv','Svenska'],['pl','Polski'],['ro','Română'],
    ['sr','Srpski'],['hr','Hrvatski'],['cs','Čeština'],['tr','Türkçe'],
    ['af-ZA','Afrikaans'],['zu','isiZulu'],['sw','Kiswahili'],['ru','Русский'],
    ['ja-JP','日本語'],['zh-CN','中文'],
  ];

  // ── current lang / region ─────────────────────────────────────────────
  var params = new URLSearchParams(window.location.search);
  var lang   = params.get('lang') || 'en-GB';
  var region = 'westEu';
  for (var k in REGIONS) {
    if (REGIONS[k].langs.indexOf(lang) !== -1) { region = k; break; }
  }

  // ── helpers ───────────────────────────────────────────────────────────
  function withLang(path) {
    var u = new URL(path, window.location.origin);
    u.searchParams.set('lang', lang);
    return u.toString();
  }

  function setLang(newLang) {
    var u = new URL(window.location.href);
    u.searchParams.set('lang', newLang);
    window.location.href = u.toString();
  }

  // ── build option HTML ─────────────────────────────────────────────────
  function regionOptions() {
    return Object.keys(REGIONS).map(function (k) {
      return '<option value="' + k + '"' + (k === region ? ' selected' : '') + '>'
           + REGIONS[k].label + '</option>';
    }).join('');
  }

  function langOptions() {
    return LANG_LABELS
      .filter(function (pair) { return REGIONS[region].langs.indexOf(pair[0]) !== -1; })
      .map(function (pair) {
        return '<option value="' + pair[0] + '"' + (pair[0] === lang ? ' selected' : '') + '>'
             + pair[1] + '</option>';
      }).join('');
  }

  // ── nav items ─────────────────────────────────────────────────────────
  var NAV = [
    ['Home',          '/'],
    ['Our Story',     '/story'],
    ['Stay',          '/#stay'],
    ['Food',          '/devocean-lodge-meals'],
    ['Explore Ponta', '/#experiences'],
    ['Gallery',       '/#gallery'],
    ['Location',      '/#location'],
    ['Contact',       '/#contact'],
  ];

  var desktopItems = NAV.map(function (item) {
    return '<li><a class="sn-link" href="' + withLang(item[1]) + '">' + item[0] + '</a></li>';
  }).join('');

  var drawerItems = NAV.map(function (item) {
    return '<a class="sn-drawer-link" href="' + withLang(item[1]) + '">' + item[0] + '</a>';
  }).join('');

  var bookUrl = withLang('/book-direct');

  // ── CSS ───────────────────────────────────────────────────────────────
  var CSS = [
    /* Give body room for the fixed nav stack (~97 px); JS corrects this precisely */
    'body{padding-top:97px!important;}',
    '.sn-stack{position:fixed;top:0;left:0;right:0;z-index:200;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
    /* Topbar */
    '.sn-topbar{background:' + BRAND + ';color:#fff;border-bottom:1px solid #8a4211;}',
    '.sn-topbar-inner{max-width:1280px;margin:0 auto;padding:.5rem 1rem;display:flex;align-items:center;justify-content:space-between;font-size:.875rem;gap:.5rem;}',
    '.sn-drops{display:flex;align-items:center;gap:.375rem;}',
    '.sn-sel{background:transparent;border:1px solid rgba(255,255,255,.4);border-radius:4px;padding:.25rem .5rem;color:#fff;font-size:.875rem;cursor:pointer;}',
    '.sn-sel option{background:#fff;color:#1e293b;}',
    '.sn-sel-region{width:140px;}',
    '.sn-sel-lang{width:93px;}',
    '.sn-book-top{display:inline-flex;align-items:center;justify-content:center;padding:.375rem 1rem;border-radius:.5rem;border:1px solid #fff;color:#fff;font-weight:600;font-size:.875rem;text-decoration:none;white-space:nowrap;transition:background .15s;}',
    '.sn-book-top:hover{background:rgba(255,255,255,.1);}',
    /* Main header */
    '.sn-header{background:#fff;border-bottom:1px solid #e2e8f0;}',
    '.sn-nav{max-width:1280px;margin:0 auto;padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;}',
    '.sn-logo{display:flex;align-items:center;gap:.75rem;color:#1e293b;text-decoration:none;flex-shrink:0;}',
    '.sn-logo img{width:36px;height:36px;border-radius:50%;object-fit:cover;}',
    '.sn-logo span{font-weight:600;font-size:1rem;}',
    /* Desktop links */
    '.sn-links{display:none;list-style:none;margin:0;padding:0;gap:1rem;}',
    '@media(min-width:1024px){.sn-links{display:flex;align-items:center;}.sn-burger{display:none!important;}}',
    '.sn-link{color:#334155;text-decoration:none;font-size:.875rem;white-space:nowrap;transition:color .15s;}',
    '.sn-link:hover{color:' + BRAND + ';}',
    /* Burger */
    '.sn-burger{display:inline-flex;align-items:center;gap:.375rem;padding:.5rem .75rem;border-radius:.75rem;background:' + BRAND + ';color:#fff;border:none;cursor:pointer;font-size:.875rem;font-weight:600;transition:background .15s;}',
    '.sn-burger:hover{background:#8a4211;}',
    /* Mobile drawer */
    '.sn-drawer{position:absolute;right:0;top:100%;margin-top:.5rem;width:256px;background:#fff;border:1px solid #e5e7eb;border-radius:.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);overflow:hidden;z-index:50;transform-origin:top right;transition:transform .2s,opacity .2s,visibility .2s;}',
    '.sn-drawer--closed{transform:scale(.95);opacity:0;pointer-events:none;visibility:hidden;}',
    '.sn-drawer--open{transform:scale(1);opacity:1;pointer-events:auto;visibility:visible;}',
    '.sn-drawer-link{display:block;padding:.75rem 1.25rem;color:#334155;text-decoration:none;border-bottom:1px solid #f3f4f6;font-size:.875rem;transition:background .15s;}',
    '.sn-drawer-link:hover{background:#fffaf6;}',
    '.sn-drawer-book-wrap{padding:.75rem;}',
    '.sn-drawer-book{display:block;text-align:center;padding:.625rem 1rem;border-radius:.75rem;background:' + BRAND + ';color:#fff;font-weight:600;text-decoration:none;transition:background .15s;}',
    '.sn-drawer-book:hover{background:#8a4211;}',
    /* Backdrop */
    '.sn-back{position:fixed;inset:0;z-index:190;background:rgba(0,0,0,.2);transition:opacity .2s;}',
    '.sn-back--hidden{opacity:0;pointer-events:none;}',
    '.sn-back--visible{opacity:1;pointer-events:auto;}',
  ].join('');

  // ── HTML ──────────────────────────────────────────────────────────────
  var HTML = '<div class="sn-stack" id="sn-stack">'
    + '<div class="sn-topbar"><div class="sn-topbar-inner">'
    +   '<div class="sn-drops">'
    +     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.8;flex-shrink:0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    +     '<select id="sn-region" class="sn-sel sn-sel-region" aria-label="Select region">' + regionOptions() + '</select>'
    +     '<select id="sn-lang" class="sn-sel sn-sel-lang" aria-label="Select language">' + langOptions() + '</select>'
    +   '</div>'
    +   '<a href="' + bookUrl + '" class="sn-book-top">Online Booking</a>'
    + '</div></div>'
    + '<div class="sn-header"><nav class="sn-nav" aria-label="Main navigation">'
    +   '<a href="' + withLang('/') + '" class="sn-logo">'
    +     '<img src="/images/devocean_logo_header-small.webp" alt="DEVOCEAN Lodge" width="36" height="36" loading="eager"/>'
    +     '<span>DEVOCEAN Lodge</span>'
    +   '</a>'
    +   '<ul class="sn-links">' + desktopItems + '</ul>'
    +   '<div style="position:relative">'
    +     '<button id="sn-burger" class="sn-burger" aria-label="Toggle menu" aria-expanded="false" aria-controls="sn-drawer">'
    +       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
    +       '<span>Menu</span>'
    +     '</button>'
    +     '<div id="sn-drawer" class="sn-drawer sn-drawer--closed">'
    +       drawerItems
    +       '<div class="sn-drawer-book-wrap"><a href="' + bookUrl + '" class="sn-drawer-book">Online Booking</a></div>'
    +     '</div>'
    +   '</div>'
    + '</nav></div>'
    + '</div>'
    + '<div id="sn-back" class="sn-back sn-back--hidden" aria-hidden="true"></div>';

  // ── inject ────────────────────────────────────────────────────────────
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);
  document.body.insertAdjacentHTML('afterbegin', HTML);

  // Measure precise height and update body padding-top
  function applyPadding() {
    var stack = document.getElementById('sn-stack');
    if (stack) document.body.style.setProperty('padding-top', stack.offsetHeight + 'px', 'important');
  }
  setTimeout(applyPadding, 0);
  window.addEventListener('resize', applyPadding);

  // ── events ────────────────────────────────────────────────────────────
  document.getElementById('sn-region').addEventListener('change', function () {
    var r    = this.value;
    var avail = REGIONS[r].langs;
    setLang(avail.indexOf(lang) !== -1 ? lang : avail[0]);
  });

  document.getElementById('sn-lang').addEventListener('change', function () {
    setLang(this.value);
  });

  var burger = document.getElementById('sn-burger');
  var drawer = document.getElementById('sn-drawer');
  var back   = document.getElementById('sn-back');

  function openMenu() {
    drawer.classList.replace('sn-drawer--closed', 'sn-drawer--open');
    back.classList.replace('sn-back--hidden',  'sn-back--visible');
    burger.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    drawer.classList.replace('sn-drawer--open',   'sn-drawer--closed');
    back.classList.replace('sn-back--visible', 'sn-back--hidden');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function () {
    drawer.classList.contains('sn-drawer--open') ? closeMenu() : openMenu();
  });
  back.addEventListener('click', closeMenu);

})();
