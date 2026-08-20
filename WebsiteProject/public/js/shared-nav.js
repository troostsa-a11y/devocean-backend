/**
 * shared-nav.js
 * Injects the full DEVOCEAN Lodge two-tier navigation header into any
 * standalone HTML page (story, meals, accommodation, guide pages).
 * Stable-locale policy: every public language has a dedicated URL prefix.
 * Language changes navigate to that prefix; display currency stays in its
 * separate stored preference and is never inferred from language choice.
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

  // Localized region names (mirrors src/i18n/langs/*.js `regions`)
  var REGION_LABELS = {
    'af-ZA': { westEu: 'Wes-Europa', eastEu: 'Oos-Europa', asia: 'Asië', americas: 'Amerikas', africa: 'Afrika', oceania: 'Oseanië' },
    'cs':    { westEu: 'Západní Evropa', eastEu: 'Východní Evropa', asia: 'Asie', americas: 'Amerika', africa: 'Afrika', oceania: 'Oceánie' },
    'de-DE': { westEu: 'Westeuropa', eastEu: 'Osteuropa', asia: 'Asien', americas: 'Amerika', africa: 'Afrika', oceania: 'Ozeanien' },
    'en-GB': { westEu: 'Western Europe', eastEu: 'Eastern Europe', asia: 'Asia', americas: 'Americas', africa: 'Africa', oceania: 'Oceania' },
    'en-US': { westEu: 'Western Europe', eastEu: 'Eastern Europe', asia: 'Asia', americas: 'Americas', africa: 'Africa', oceania: 'Oceania' },
    'es-ES': { westEu: 'Europa Occidental', eastEu: 'Europa Oriental', asia: 'Asia', americas: 'Américas', africa: 'África', oceania: 'Oceanía' },
    'fr-FR': { westEu: 'Europe occidentale', eastEu: 'Europe orientale', asia: 'Asie', americas: 'Amériques', africa: 'Afrique', oceania: 'Océanie' },
    'hr':    { westEu: 'Zapadna Europa', eastEu: 'Istočna Europa', asia: 'Azija', americas: 'Amerike', africa: 'Afrika', oceania: 'Oceanija' },
    'it-IT': { westEu: 'Europa occidentale', eastEu: 'Europa orientale', asia: 'Asia', americas: 'Americhe', africa: 'Africa', oceania: 'Oceania' },
    'ja-JP': { westEu: '西ヨーロッパ', eastEu: '東ヨーロッパ', asia: 'アジア', americas: 'アメリカ大陸', africa: 'アフリカ', oceania: 'オセアニア' },
    'nl-NL': { westEu: 'West-Europa', eastEu: 'Oost-Europa', asia: 'Azië', americas: 'Amerika', africa: 'Afrika', oceania: 'Oceanië' },
    'pl':    { westEu: 'Europa Zachodnia', eastEu: 'Europa Wschodnia', asia: 'Azja', americas: 'Ameryki', africa: 'Afryka', oceania: 'Oceania' },
    'pt-BR': { westEu: 'Europa Ocidental', eastEu: 'Europa Oriental', asia: 'Ásia', americas: 'Américas', africa: 'África', oceania: 'Oceania' },
    'pt-PT': { westEu: 'Europa Ocidental', eastEu: 'Europa Oriental', asia: 'Ásia', americas: 'Américas', africa: 'África', oceania: 'Oceânia' },
    'ro':    { westEu: 'Europa de Vest', eastEu: 'Europa de Est', asia: 'Asia', americas: 'Americile', africa: 'Africa', oceania: 'Oceania' },
    'ru':    { westEu: 'Западная Европа', eastEu: 'Восточная Европа', asia: 'Азия', americas: 'Америка', africa: 'Африка', oceania: 'Океания' },
    'sr':    { westEu: 'Zapadna Evropa', eastEu: 'Istočna Evropa', asia: 'Azija', americas: 'Amerike', africa: 'Afrika', oceania: 'Okeanija' },
    'sv':    { westEu: 'Västeuropa', eastEu: 'Östeuropa', asia: 'Asien', americas: 'Amerika', africa: 'Afrika', oceania: 'Oceanien' },
    'sw':    { westEu: 'Ulaya Magharibi', eastEu: 'Ulaya Mashariki', asia: 'Asia', americas: 'Amerika', africa: 'Afrika', oceania: 'Oceania' },
    'tr':    { westEu: 'Batı Avrupa', eastEu: 'Doğu Avrupa', asia: 'Asya', americas: 'Amerika', africa: 'Afrika', oceania: 'Okyanusya' },
    'zh-CN': { westEu: '西欧', eastEu: '东欧', asia: '亚洲', americas: '美洲', africa: '非洲', oceania: '大洋洲' },
    'zu':    { westEu: 'I-Western Europe', eastEu: 'I-Eastern Europe', asia: 'I-Asia', americas: 'I-America', africa: 'I-Afrika', oceania: 'I-Oceania' },
  };

  var LANG_LABELS = [
    ['en-GB','English (UK)'],['en-US','English (US)'],['pt-PT','Português (Portugal)'],['pt-BR','Português (Brasil)'],
    ['nl-NL','Nederlands'],['fr-FR','Français'],['it-IT','Italiano'],['de-DE','Deutsch'],
    ['es-ES','Español'],['sv','Svenska'],['pl','Polski'],['ro','Română'],
    ['sr','Srpski'],['hr','Hrvatski'],['cs','Čeština'],['tr','Türkçe'],
    ['af-ZA','Afrikaans'],['zu','isiZulu'],['sw','Kiswahili'],['ru','Русский'],
    ['ja-JP','日本語'],['zh-CN','中文（简体）'],
  ];
  var PATH_PREFIXES = {
    'en-US':'en-us', 'pt-PT':'pt-pt', 'pt-BR':'pt-br', 'nl-NL':'nl',
    'fr-FR':'fr', 'it-IT':'it', 'de-DE':'de', 'es-ES':'es', 'sv':'sv',
    'pl':'pl', 'ro':'ro', 'sr':'sr', 'hr':'hr', 'cs':'cs', 'tr':'tr',
    'ja-JP':'ja', 'zh-CN':'zh-hans', 'ru':'ru', 'af-ZA':'af', 'zu':'zu', 'sw':'sw'
  };

  // ── current lang / region ─────────────────────────────────────────────
  // Normalize short codes to the full locale codes the SPA stores.
  var SHORT_TO_FULL = {
    en: 'en-GB', pt: 'pt-BR', nl: 'nl-NL', fr: 'fr-FR', it: 'it-IT',
    de: 'de-DE', es: 'es-ES', ja: 'ja-JP', zh: 'zh-CN', af: 'af-ZA',
    'en-us': 'en-US', 'en-gb': 'en-GB', 'pt-pt': 'pt-PT', 'pt-br': 'pt-BR',
  };
  var KNOWN_LANGS = LANG_LABELS.map(function (p) { return p[0]; });
  function normLang(raw) {
    if (!raw) return null;
    if (KNOWN_LANGS.indexOf(raw) !== -1) return raw;
    var lower = String(raw).toLowerCase();
    if (SHORT_TO_FULL[lower]) return SHORT_TO_FULL[lower];
    for (var i = 0; i < KNOWN_LANGS.length; i++) {
      if (KNOWN_LANGS[i].toLowerCase() === lower) return KNOWN_LANGS[i];
    }
    return null;
  }

  function readStoredLang() {
    try { return normLang(window.localStorage.getItem('site.lang')); }
    catch (e) { return null; }
  }

  var params  = new URLSearchParams(window.location.search);
  var urlLang = normLang(params.get('lang'));
  var edgeLang = normLang(window.__DEVOCEAN_LOCALE__);
  var lang    = edgeLang || urlLang || readStoredLang() || 'en-GB';

  // Honor ?lang= on entry: persist it, then show the clean URL.
  if (params.get('lang') !== null) {
    if (urlLang) {
      try {
        window.localStorage.setItem('site.lang', urlLang);
        window.localStorage.setItem('site.lang_source', 'url');
      } catch (e) { /* ignore */ }
    }
    try {
      params.delete('lang');
      var qs = params.toString();
      window.history.replaceState(window.history.state, '',
        window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (e) { /* ignore */ }
  }

  // Prefer the stored region (same key the SPA uses) when it supports the
  // current language — deriving region from lang alone flips e.g. Asia back
  // to Western Europe because both contain en-GB.
  function readStoredRegion() {
    try {
      var r = window.localStorage.getItem('site.region');
      if (r && REGIONS[r] && REGIONS[r].langs.indexOf(lang) !== -1) return r;
    } catch (e) { /* private mode / blocked storage */ }
    return null;
  }
  var region = readStoredRegion();
  if (!region) {
    region = 'westEu';
    for (var k in REGIONS) {
      if (REGIONS[k].langs.indexOf(lang) !== -1) { region = k; break; }
    }
  }

  function storeRegion(r) {
    try {
      window.localStorage.setItem('site.region', r);
      window.localStorage.setItem('site.region.version', '3');
      window.localStorage.setItem('site.region.source', 'user');
    } catch (e) { /* ignore */ }
  }

  // ── helpers ───────────────────────────────────────────────────────────
  function stripLocalePrefix(path) {
    var clean = path.startsWith('/') ? path : '/' + path;
    var first = clean.split('/')[1];
    Object.keys(PATH_PREFIXES).forEach(function (code) {
      if (PATH_PREFIXES[code] === first) clean = clean.slice(first.length + 1) || '/';
    });
    return clean;
  }

  function localePath(path, targetLang) {
    var clean = stripLocalePrefix(path);
    var prefix = PATH_PREFIXES[targetLang];
    if (!prefix) return clean;
    return clean === '/' ? '/' + prefix + '/' : '/' + prefix + clean;
  }

  function withLang(path) {
    return localePath(path, lang);
  }

  function setLang(newLang) {
    try {
      window.localStorage.setItem('site.lang', newLang);
      window.localStorage.setItem('site.lang_source', 'user');
      window.localStorage.setItem('site.lang.version', '2');
    } catch (e) { /* ignore */ }
    // Reload the locale URL so edge metadata and visible content change
    // together. Currency is intentionally untouched.
    var u = new URL(window.location.href);
    u.searchParams.delete('lang');
    u.pathname = localePath(u.pathname, newLang);
    window.location.href = u.toString();
  }

  // ── language picker helpers ───────────────────────────────────────────
  // Locales shown before the user types anything — common visitor profiles
  // for a Mozambique ocean-lodge destination.
  var PINNED_CODES = ['en-GB','pt-PT','de-DE','nl-NL','fr-FR','af-ZA','es-ES'];

  function pickerMatch(pair, q) {
    var low = q.toLowerCase();
    return pair[0].toLowerCase().indexOf(low) !== -1
        || pair[1].toLowerCase().indexOf(low) !== -1;
  }

  function buildPickerItem(code, label) {
    var active = code === lang;
    return '<button type="button" class="sn-lp-item' + (active ? ' sn-lp-item--active' : '') + '" data-code="' + code + '">'
         + label
         + (active ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' : '')
         + '</button>';
  }

  function renderPickerList(query) {
    var list = document.getElementById('sn-lp-list');
    if (!list) return;
    if (query) {
      var filtered = LANG_LABELS.filter(function(p){ return pickerMatch(p, query); });
      if (filtered.length === 0) {
        list.innerHTML = '<p class="sn-lp-empty">No match</p>';
      } else {
        list.innerHTML = filtered.map(function(p){ return buildPickerItem(p[0], p[1]); }).join('');
      }
    } else {
      var pinned = LANG_LABELS.filter(function(p){ return PINNED_CODES.indexOf(p[0]) !== -1; });
      list.innerHTML = '<p class="sn-lp-heading">Common</p>'
        + pinned.map(function(p){ return buildPickerItem(p[0], p[1]); }).join('')
        + '<p class="sn-lp-hint">Type to search all ' + LANG_LABELS.length + ' languages</p>';
    }
    // Wire item clicks
    list.querySelectorAll('.sn-lp-item').forEach(function(btn){
      btn.addEventListener('click', function(){
        setLang(btn.getAttribute('data-code'));
      });
    });
  }

  var pickerOpen = false;

  function openPicker() {
    var panel = document.getElementById('sn-lp-panel');
    var btn   = document.getElementById('sn-lp-btn');
    if (!panel || !btn) return;
    pickerOpen = true;
    panel.classList.remove('sn-lp-panel--closed');
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    var inp = document.getElementById('sn-lp-search');
    if (inp) { inp.value = ''; renderPickerList(''); setTimeout(function(){ inp.focus(); }, 0); }
  }

  function closePicker() {
    var panel = document.getElementById('sn-lp-panel');
    var btn   = document.getElementById('sn-lp-btn');
    if (!panel) return;
    pickerOpen = false;
    panel.classList.add('sn-lp-panel--closed');
    panel.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  // Label for current lang
  var currentLabel = (LANG_LABELS.find(function(p){ return p[0] === lang; }) || ['en-GB','English (UK)'])[1];

  // ── translations ──────────────────────────────────────────────────────
  var T = {
    'af-ZA': {menu:'Kieslys',home:'Tuis',stay:'Verblyf',experiences:'Verken Ponta',gallery:'Galery',location:'Ligging',contact:'Kontak',food:'Kos',ourStory:'Ons Storie',bookNow:'Online bespreking'},
    'cs':    {menu:'Menu',home:'Domů',stay:'Ubytování',experiences:'Prozkoumej Pontu',gallery:'Galerie',location:'Lokalita',contact:'Kontakt',food:'Jídlo',ourStory:'Náš příběh',bookNow:'Online rezervace'},
    'de-DE': {menu:'Menü',home:'Startseite',stay:'Unterkünfte',experiences:'Erkunde Ponta',gallery:'Galerie',location:'Lage',contact:'Kontakt',food:'Essen',ourStory:'Unsere Geschichte',bookNow:'Online buchen'},
    'en-GB': {menu:'Menu',home:'Home',stay:'Stay',experiences:'Explore Ponta',gallery:'Gallery',location:'Location',contact:'Contact',food:'Food',ourStory:'Our Story',bookNow:'Online Booking'},
    'en-US': {menu:'Menu',home:'Home',stay:'Stay',experiences:'Explore Ponta',gallery:'Gallery',location:'Location',contact:'Contact',food:'Food',ourStory:'Our Story',bookNow:'Online Booking'},
    'es-ES': {menu:'Menú',home:'Inicio',stay:'Alojamiento',experiences:'Explorar Ponta',gallery:'Galería',location:'Ubicación',contact:'Contacto',food:'Comida',ourStory:'Nuestra Historia',bookNow:'Reserva en línea'},
    'fr-FR': {menu:'Menu',home:'Accueil',stay:'Séjour',experiences:'Explorer Ponta',gallery:'Galerie',location:'Localisation',contact:'Contact',food:'Cuisine',ourStory:'Notre Histoire',bookNow:'Réservation en ligne'},
    'hr':    {menu:'Meni',home:'Početna',stay:'Smještaj',experiences:'Istraži Pontu',gallery:'Galerija',location:'Lokacija',contact:'Kontakt',food:'Hrana',ourStory:'Naša priča',bookNow:'Online rezervacija'},
    'it-IT': {menu:'Menu',home:'Home',stay:'Alloggi',experiences:'Esplora Ponta',gallery:'Galleria',location:'Posizione',contact:'Contatti',food:'Cucina',ourStory:'La Nostra Storia',bookNow:'Prenota online'},
    'ja-JP': {menu:'メニュー',home:'ホーム',stay:'宿泊',experiences:'Explore Ponta',gallery:'ギャラリー',location:'場所',contact:'連絡先',food:'食事',ourStory:'私たちの物語',bookNow:'オンライン予約'},
    'nl-NL': {menu:'Menu',home:'Home',stay:'Verblijf',experiences:'Ontdek Ponta',gallery:'Galerij',location:'Locatie',contact:'Contact',food:'Eten',ourStory:'Ons Verhaal',bookNow:'Online boeken'},
    'pl':    {menu:'Menu',home:'Strona główna',stay:'Pobyt',experiences:'Odkryj Ponta',gallery:'Galeria',location:'Lokalizacja',contact:'Kontakt',food:'Jedzenie',ourStory:'Nasza Historia',bookNow:'Rezerwacja online'},
    'pt-BR': {menu:'Menu',home:'Início',stay:'Estadia',experiences:'Explorar Ponta',gallery:'Galeria',location:'Localização',contact:'Contacto',food:'Gastronomia',ourStory:'A Nossa História',bookNow:'Reserva online'},
    'pt-PT': {menu:'Menu',home:'Início',stay:'Estadia',experiences:'Explorar Ponta',gallery:'Galeria',location:'Localização',contact:'Contacto',food:'Gastronomia',ourStory:'A Nossa História',bookNow:'Reserva online'},
    'ro':    {menu:'Meniu',home:'Acasă',stay:'Cazare',experiences:'Explorați Ponta',gallery:'Galerie',location:'Locație',contact:'Contact',food:'Mâncare',ourStory:'Povestea noastră',bookNow:'Rezervare online'},
    'ru':    {menu:'Меню',home:'Главная',stay:'Проживание',experiences:'Исследуй Понту',gallery:'Галерея',location:'Местоположение',contact:'Контакты',food:'Питание',ourStory:'Наша История',bookNow:'Онлайн-бронирование'},
    'sr':    {menu:'Meni',home:'Početna',stay:'Smeštaj',experiences:'Istraži Pontu',gallery:'Galerija',location:'Lokacija',contact:'Kontakt',food:'Hrana',ourStory:'Naša priča',bookNow:'Online rezervacija'},
    'sv':    {menu:'Meny',home:'Hem',stay:'Boende',experiences:'Utforska Ponta',gallery:'Galleri',location:'Plats',contact:'Kontakt',food:'Mat',ourStory:'Vår Berättelse',bookNow:'Boka online'},
    'sw':    {menu:'Menyu',home:'Nyumbani',stay:'Kukaa',experiences:'Gundua Ponta',gallery:'Matunzio',location:'Mahali',contact:'Wasiliana nasi',food:'Chakula',ourStory:'Hadithi Yetu',bookNow:'Buki mtandaoni'},
    'tr':    {menu:'Menü',home:'Ana Sayfa',stay:'Konaklama',experiences:"Ponta'yı Keşfet",gallery:'Galeri',location:'Konum',contact:'İletişim',food:'Yemek',ourStory:'Hikayemiz',bookNow:'Online rezervasyon'},
    'zh-CN': {menu:'菜单',home:'首页',stay:'住宿',experiences:'探索Ponta',gallery:'图库',location:'位置',contact:'联系我们',food:'美食',ourStory:'我们的故事',bookNow:'在线预订'},
    'zu':    {menu:'Imenyu',home:'Ikhaya',stay:'Ukuhlala',experiences:'Hlola iPonta',gallery:'Igalari',location:'Indawo',contact:'Xhumana nathi',food:'Ukudla',ourStory:'Indaba Yethu',bookNow:'Bhuka online'},
  };
  var t = T[lang] || T['en-GB'];

  // ── nav items ─────────────────────────────────────────────────────────
  var NAV = [
    [t.home,        '/'],
    [t.ourStory,    '/story'],
    [t.stay,        '/#stay'],
    [t.food,        '/devocean-lodge-meals'],
    [t.experiences, '/#experiences'],
    [t.gallery,     '/#gallery'],
    [t.location,    '/#location'],
    [t.contact,     '/#contact'],
  ];

  var desktopItems = NAV.map(function (item) {
    return '<li><a class="sn-link" href="' + withLang(item[1]) + '">' + item[0] + '</a></li>';
  }).join('');

  var drawerItems = NAV.map(function (item) {
    return '<a class="sn-drawer-link" href="' + withLang(item[1]) + '">' + item[0] + '</a>';
  }).join('');

  // Standalone unit pages may have been opened from the booking results. Use
  // the shared context builder so desktop and mobile navigation return to the
  // same locale-aware search instead of starting a fresh booking.
  var bookUrl = window.devoceanBookingContext
    ? window.devoceanBookingContext.buildBookingUrl({ lang: lang })
    : withLang('/book-direct');

  // ── CSS ───────────────────────────────────────────────────────────────
  var CSS = [
    /* Give body room for the fixed nav stack (~97 px); JS corrects this precisely */
    'body{padding-top:97px!important;}',
    '.sn-stack{position:fixed;top:0;left:0;right:0;z-index:200;font-family:inherit;}',
    /* Topbar */
    '.sn-topbar{background:' + BRAND + ';color:#fff;border-bottom:1px solid #8a4211;}',
    '.sn-topbar-inner{max-width:1280px;margin:0 auto;padding:.5rem .375rem;display:flex;align-items:center;justify-content:space-between;font-size:.875rem;gap:.5rem;}',
    '@media(min-width:640px){.sn-topbar-inner{padding:.5rem 1rem;}}',
    '.sn-drops{display:flex;align-items:center;gap:.375rem;}',
    /* Language picker */
    '.sn-lp{position:relative;width:224px;max-width:calc(100vw - 1rem);}',
    '.sn-lp-btn{display:flex;width:100%;align-items:center;justify-content:space-between;gap:.375rem;background:transparent;border:1px solid rgba(255,255,255,.4);border-radius:4px;padding:.25rem .625rem;color:#fff;font-size:.875rem;cursor:pointer;white-space:nowrap;transition:background .15s;}',
    '.sn-lp-btn:hover,.sn-lp-btn[aria-expanded="true"]{background:rgba(255,255,255,.1);}',
    '.sn-lp-btn-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;}',
    '.sn-lp-chevron{opacity:.6;flex-shrink:0;transition:transform .15s;}',
    '.sn-lp-btn[aria-expanded="true"] .sn-lp-chevron{transform:rotate(180deg);}',
    '.sn-lp-panel{position:absolute;left:0;top:calc(100% + 6px);z-index:300;width:224px;background:#fff;border:1px solid #e2e8f0;border-radius:.75rem;box-shadow:0 20px 40px -8px rgba(0,0,0,.2);padding:.25rem 0;color:#1e293b;font-size:.875rem;}',
    '.sn-lp-panel--closed{display:none;}',
    '.sn-lp-search-wrap{padding:.375rem .5rem .25rem;}',
    '.sn-lp-search-inner{display:flex;align-items:center;gap:.375rem;border:1px solid #e2e8f0;border-radius:.5rem;padding:.25rem .5rem;background:#f8fafc;}',
    '.sn-lp-search-inner:focus-within{border-color:rgba(158,75,19,.5);box-shadow:0 0 0 2px rgba(158,75,19,.1);}',
    '.sn-lp-search{flex:1;border:none;background:transparent;outline:none;font-size:.8125rem;color:#1e293b;min-width:0;}',
    '.sn-lp-search::placeholder{color:#94a3b8;}',
    '.sn-lp-list{max-height:240px;overflow-y:auto;padding:0 .25rem;}',
    '.sn-lp-heading{padding:.375rem .625rem .125rem;font-size:.625rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;}',
    '.sn-lp-hint{padding:.5rem .625rem;font-size:.6875rem;color:#94a3b8;border-top:1px solid #f1f5f9;margin-top:.25rem;}',
    '.sn-lp-empty{padding:.5rem .625rem;font-size:.8125rem;color:#94a3b8;}',
    '.sn-lp-item{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;padding:.375rem .625rem;border:none;background:transparent;border-radius:.375rem;cursor:pointer;font-size:.8125rem;color:#334155;transition:background .1s;}',
    '.sn-lp-item:hover{background:#f8fafc;}',
    '.sn-lp-item--active{color:' + BRAND + ';font-weight:600;}',
    '.sn-lp-item--active:hover{background:#fff8f5;}',
    '.sn-book-top{display:inline-flex;align-items:center;justify-content:center;padding:.25rem .5rem;border-radius:.5rem;border:1px solid #fff;color:#fff;font-weight:600;font-size:.75rem;text-decoration:none;white-space:nowrap;transition:background .15s;}',
    '@media(min-width:640px){.sn-book-top{padding:.375rem 1rem;font-size:.875rem;}}',
    '.sn-book-top:hover{background:rgba(255,255,255,.1);}',
    /* Main header */
    '.sn-header{background:#fff;border-bottom:1px solid #e2e8f0;}',
    '.sn-nav{max-width:1280px;margin:0 auto;padding:.75rem 1rem;display:flex;align-items:center;}',
    '.sn-logo{display:flex;align-items:center;gap:.75rem;color:#1e293b;text-decoration:none;flex-shrink:0;}',
    '.sn-logo img{width:36px;height:36px;border-radius:50%;object-fit:cover;}',
    '.sn-logo span{font-weight:600;font-size:1rem;}',
    /* Desktop links — ml-auto pushes them to the right edge (same as React ml-auto) */
    '.sn-links{display:none;list-style:none;margin:0 0 0 auto;padding:0;gap:1rem;}',
    '@media(min-width:1024px){.sn-links{display:flex;align-items:center;}.sn-burger{display:none!important;}}',
    '.sn-link{color:#334155;text-decoration:none;font-size:1rem;white-space:nowrap;transition:color .15s;}',
    '.sn-link:hover{color:' + BRAND + ';}',
    /* Burger */
    '.sn-burger{display:inline-flex;align-items:center;gap:.375rem;padding:.5rem .75rem;border-radius:.75rem;background:' + BRAND + ';color:#fff;border:none;cursor:pointer;font-size:.875rem;font-weight:600;transition:background .15s;}',
    '.sn-burger:hover{background:#8a4211;}',
    '.sn-burger-label{display:none;}',
    '@media(min-width:640px){.sn-burger-label{display:inline;}.sn-globe{display:block;}}',
    '.sn-globe{display:none;}',
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
    +     '<div class="sn-lp">'
    +       '<button id="sn-lp-btn" type="button" class="sn-lp-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Select language">'
    +         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    +         '<span class="sn-lp-btn-label">' + currentLabel + '</span>'
    +         '<svg class="sn-lp-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</button>'
    +       '<div id="sn-lp-panel" class="sn-lp-panel sn-lp-panel--closed" role="listbox" aria-label="Language" aria-hidden="true">'
    +         '<div class="sn-lp-search-wrap">'
    +           '<div class="sn-lp-search-inner">'
    +             '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    +             '<input id="sn-lp-search" type="text" class="sn-lp-search" placeholder="Search languages…" aria-label="Search languages" autocomplete="off">'
    +           '</div>'
    +         '</div>'
    +         '<div id="sn-lp-list" class="sn-lp-list"></div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<a href="' + bookUrl + '" class="sn-book-top">' + t.bookNow + '</a>'
    + '</div></div>'
    + '<div class="sn-header"><nav class="sn-nav" aria-label="Main navigation">'
    +   '<a href="' + withLang('/') + '" class="sn-logo">'
    +     '<img src="/images/devocean_logo_header-small.webp" alt="DEVOCEAN Lodge" width="36" height="36" loading="eager"/>'
    +     '<span>DEVOCEAN Lodge</span>'
    +   '</a>'
    +   '<ul class="sn-links">' + desktopItems + '</ul>'
    +   '<div style="position:relative;margin-left:auto">'
    +     '<button id="sn-burger" class="sn-burger" aria-label="Toggle menu" aria-expanded="false" aria-controls="sn-drawer">'
    +       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
    +       '<span class="sn-burger-label">' + t.menu + '</span>'
    +     '</button>'
    +     '<div id="sn-drawer" class="sn-drawer sn-drawer--closed">'
    +       drawerItems
    +       '<div class="sn-drawer-book-wrap"><a href="' + bookUrl + '" class="sn-drawer-book">' + t.bookNow + '</a></div>'
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

  // ── language picker events ────────────────────────────────────────────
  renderPickerList('');   // populate default (pinned) list

  var lpBtn = document.getElementById('sn-lp-btn');
  var lpSearch = document.getElementById('sn-lp-search');

  if (lpBtn) {
    lpBtn.addEventListener('click', function () {
      if (pickerOpen) { closePicker(); } else { openPicker(); }
    });
  }
  if (lpSearch) {
    lpSearch.addEventListener('input', function () {
      renderPickerList(this.value);
    });
  }
  // Close on outside click or Escape
  document.addEventListener('mousedown', function (e) {
    if (!pickerOpen) return;
    var panel = document.getElementById('sn-lp-panel');
    if (panel && !panel.contains(e.target) && lpBtn && !lpBtn.contains(e.target)) {
      closePicker();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pickerOpen) closePicker();
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
