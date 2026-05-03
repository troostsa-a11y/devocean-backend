export const UI = {
  menu: "Meni",
  regions: { westEu: "Zapadna Europa", eastEu: "Istočna Europa", asia: "Azija", americas: "Amerike", africa: "Afrika", oceania: "Oceanija" },
  nav: { home: "Početna", stay: "Smještaj", experiences: "Doživljaji", todo: "Što raditi", gallery: "Galerija", location: "Lokacija", contact: "Kontakt" },
  hero: { title: "DEVOCEAN Lodge", subtitle: "Ekološki smještaj pored netaknute plaže u svetski poznatoj destinaciji za avanture.", description: "Otkrijte jedinstveni UNESCO ronilački raj okružen prirodnim rezervatima i nezaboravnim doživljajima u prirodi.", ctaPrimary: "Rezervišite boravak", ctaSecondary: "Istražite lodge", badge: "Udobnost i vrednost koje gosti hvale", whyPonta: "Zašto Ponta do Ouro?", villageHighlights: "Atrakcije sela", goDiving: "Idite na ronjenje" },
  stay: { headline: "Ostanite kod nas", blurb: "Izaberite svoj stil: šatori usred prirode ili udobne kućice i vikendica – sve uz toplu, porodičnu gostoljubivost.", moreDetails: "Više detalja", ourStory: "Naša priča" },
  experiences: { headline: "Doživljaji", blurb: "Avanture u oceanu i šumi pred vašim vratima.", operators: "Pouzdani lokalni operateri:", featured: "Izdvojeno", learnMore: "Istražite ronilačke lokacije, operatere i cene →" },
  todo: {
    headline: "Što raditi u Ponta do Ouro",
    note: "Za ronjenje, snorkeling, safari sa dupinima/kitovima i ribolovne čartere pogledajte operatere ispod.",
    items: [
      { title: "Šetnja do Svetionika i Lua Do Mar", body: "Popnite se do Starog svetionika za panoramske poglede. Nastavite do restorana Lua Do Mar na dini. Često ćete vidjeti dupine tokom cele godine, kitove (maj–oktobar) i kornjače (decembar–januar). Pazite na plimu: izbegavajte plažni put 3 sata pre i 3 sata posle plime; nepredviđeni vali mogu vas baciti na stene." },
      { title: "Šetnja do Ponta Malongane", body: "Hodajte plažom duž obale do susjednog sela. Na pola puta, stepenice među bananama vode do paba i restorana Campismo Nino sa lijepim pogledom. Blizu prijelaza ka uvali, staza ka Sky Island nudi paragliding. Poznati pabovi u Malongane: Drunken Clam i Sunset Shack. Vratite se plažom ili 4×4 peščanim putem." },
      { title: "Surfovanje, ronjenje i oceanska istraživanja", body: "Iznajmljivanje surf dasaka u Beach Bar-u; više ronilačkih centara u selu, plus istraživački centar za dupine i kitove." },
      { title: "Hrana i opuštanje u blizini", body: "U krugu od 500 m od DEVOCEAN-a ima oko 16 pabova i restorana. Za opuštajuću masažu celog tela pitajte za Lisu (LIZ-Way Massage)." },
      { title: "Iznajmljivanje četvorotočkaša", body: "Povremeno iznajmljivanje od meštana. Tipična cena: oko 2000 MZN po satu (može se pregovarati)." },
    ],
  },
  gallery: { headline: "Galerija" },
  location: {
    headline: "Lokacija", blurb: "Ponta do Ouro – Distrikt Matutuíne, jug Mozambika.",
    items: [
      "Selo Ponta do Ouro, na kratkoj šetnji od plaže",
      "15 minuta do Ponta Malongane • 25 minuta do granice Kosi Bay",
      "Sigurno parkiranje • Kafići i lokalne pijace u blizini",
    ],
    viewMap: "Pogledajte interaktivnu mapu",
  },
  contact: { headline: "Kontakt i rezervacije", blurb: "Pitanja, datumi, posebni zahtevi ili grupne rezervacije – ovdje smo da pomognemo.", call: "WhatsApp", email: "Imejl", directions: "Uputstva za put", bookNow: "Cene i dostupnost" },
  form: {
    name: "Ime", email: "Imejl", stayLabel: "Zainteresovan za smještaj:", checkin: "Od (prijava)", checkout: "Do (odjava)",
    unitLabel: "Željena jedinica je:",
    units: [
      "Safari šator - zajedničko kupatilo",
      "Comfort šator - privatno kupatilo",
      "Vikendica sa baštom - klima invertor",
      "Kućica sa slamnatim krovom - klima invertor"
    ],
    message: "Poruka", send: "Pošalji", sending: "Šalje se...",
    consent: "Slanjem se slažete da vas kontaktiramo u vezi sa vašim upitom.",
    phName: "Vaše ime", phEmail: "vi@imejl.com", phDate: "dd/mm/gggg", phMsg: "Recite nam više o vašim željama...",
    success: "Hvala! Vaša poruka je poslata. Provjerite imejl za potvrdu.",
    errorHelp: "Ako problem potraje, pošaljite nam imejl ili WhatsApp poruku direktno.",
  },
  galleryHeading: "Galerija",
  footer: {
    rights: "Sva prava zadržana.",
    desc: "Porodična ekološka gostoljubivost i projekti zajednice na jugu Mozambika.",
  },
  currencies: {
    USD: "Dolar",
    JPY: "Jen",
    CNY: "Juan",
    RUB: "Rublja",
    MZN: "Metikal",
    ZAR: "Rand",
    EUR: "Euro",
    GBP: "Funta",
    SEK: "Kruna",
    PLN: "Zlot",
    RON: "Lej",
    HRK: "Kuna"
  },
  legal: {
    title: "Pravne informacije",
    privacy: "Politika privatnosti",
    cookies: "Politika kolačića",
    terms: "Uslovi korišćenja",
    gdpr: "GDPR informacije",
    cric: "Prava potrošača i kontakt",
    manage: "Podešavanja kolačića",
    ccpa: "Ne prodajem moje podatke",
  }
}

export const L10N = {
  experiences: {
    diving: { title: "Ronjenje", desc: "Obalski grebeni sa bogatim morskim životom." },
    dolphins: { title: "Plivanje sa dupinima", desc: "Etički susreti sa rezidentnim dupinima." },
    lighthouse: { title: "Šetnja do svetionika", desc: "Popnite se na brdo do starog svetionika za široke poglede." },
    seafari: { title: "Morski safari", desc: "Morski safari za kitove (maj–oktobar) i više." },
    safari: { title: "Kopneni safari", desc: "Avanture u savani na kratkoj vožnji." },
    fishing: { title: "Ribolov sa obale i u dubokom moru", desc: "Od bacanja sa plaže do čartera u dubokom moru." },
    surfing: { title: "Surf daske i lekcije", desc: "Uhvatite val ili naučite osnove." },
  }
}

export default UI;
