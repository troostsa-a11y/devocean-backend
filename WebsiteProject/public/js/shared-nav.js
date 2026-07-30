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
      var labels = REGION_LABELS[lang] || REGION_LABELS['en-GB'];
      return '<option value="' + k + '"' + (k === region ? ' selected' : '') + '>'
           + (labels[k] || REGIONS[k].label) + '</option>';
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

  var bookUrl = withLang('/book-direct');

  // ── CSS ───────────────────────────────────────────────────────────────
  var CSS = [
    /* Give body room for the fixed nav stack (~97 px); JS corrects this precisely */
    'body{padding-top:97px!important;}',
    '.sn-stack{position:fixed;top:0;left:0;right:0;z-index:200;font-family:inherit;}',
    /* Topbar */
    '.sn-topbar{background:' + BRAND + ';color:#fff;border-bottom:1px solid #8a4211;}',
    '.sn-topbar-inner{max-width:1280px;margin:0 auto;padding:.5rem 1rem;display:flex;align-items:center;justify-content:space-between;font-size:.875rem;gap:.5rem;}',
    '.sn-drops{display:flex;align-items:center;gap:.375rem;}',
    '.sn-sel{background:transparent;border:1px solid rgba(255,255,255,.4);border-radius:4px;padding:.25rem .5rem;color:#fff;font-size:.875rem;cursor:pointer;}',
    '.sn-sel option{background:#fff;color:#1e293b;}',
    '.sn-sel-region{width:140px;}',
    '.sn-sel-lang{width:112px;}',
    '.sn-book-top{display:inline-flex;align-items:center;justify-content:center;padding:.375rem 1rem;border-radius:.5rem;border:1px solid #fff;color:#fff;font-weight:600;font-size:.875rem;text-decoration:none;white-space:nowrap;transition:background .15s;}',
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
    +     '<svg class="sn-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.8;flex-shrink:0" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    +     '<select id="sn-region" class="sn-sel sn-sel-region" aria-label="Select region">' + regionOptions() + '</select>'
    +     '<select id="sn-lang" class="sn-sel sn-sel-lang" aria-label="Select language">' + langOptions() + '</select>'
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
