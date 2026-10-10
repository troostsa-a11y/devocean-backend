// Navigation labels only. Guide body copy and SEO have a separate editorial
// approval process; these labels must work before full translations load.
const ENGLISH = {
  heading: 'Practical Guides',
  gettingHere: 'Getting Here',
  without4x4: 'No 4×4 Needed',
  accommodation: 'Accommodation Guide',
  meals: 'Meals & Dining',
};

export const GUIDE_LABELS = {
  'en-GB': ENGLISH,
  'en-US': ENGLISH,
  'pt-PT': {
    heading: 'Guias práticos', gettingHere: 'Como chegar', without4x4: 'Não precisa de 4×4',
    accommodation: 'Guia de alojamento', meals: 'Refeições e gastronomia',
  },
  'pt-BR': {
    heading: 'Guias práticos', gettingHere: 'Como chegar', without4x4: 'Não precisa de 4×4',
    accommodation: 'Guia de hospedagem', meals: 'Refeições e gastronomia',
  },
  'nl-NL': {
    heading: 'Praktische gidsen', gettingHere: 'Hoe kom je hier', without4x4: 'Geen 4×4 nodig',
    accommodation: 'Accommodatiegids', meals: 'Maaltijden en uit eten',
  },
  'fr-FR': {
    heading: 'Guides pratiques', gettingHere: 'Comment venir', without4x4: 'Pas besoin de 4×4',
    accommodation: 'Guide des hébergements', meals: 'Repas et restauration',
  },
  'it-IT': {
    heading: 'Guide pratiche', gettingHere: 'Come arrivare', without4x4: 'Non serve un 4×4',
    accommodation: 'Guida agli alloggi', meals: 'Pasti e ristorazione',
  },
  'de-DE': {
    heading: 'Praktische Reiseführer', gettingHere: 'Anreise', without4x4: 'Kein Allradfahrzeug nötig',
    accommodation: 'Unterkunftsführer', meals: 'Mahlzeiten und Gastronomie',
  },
  'es-ES': {
    heading: 'Guías prácticas', gettingHere: 'Cómo llegar', without4x4: 'No hace falta un 4×4',
    accommodation: 'Guía de alojamiento', meals: 'Comidas y gastronomía',
  },
  sv: {
    heading: 'Praktiska guider', gettingHere: 'Hitta hit', without4x4: 'Ingen fyrhjulsdrift behövs',
    accommodation: 'Boendeguide', meals: 'Måltider och restauranger',
  },
  pl: {
    heading: 'Praktyczne przewodniki', gettingHere: 'Jak dojechać', without4x4: 'Samochód 4×4 nie jest potrzebny',
    accommodation: 'Przewodnik po noclegach', meals: 'Posiłki i restauracje',
  },
  ro: {
    heading: 'Ghiduri practice', gettingHere: 'Cum ajungeți', without4x4: 'Nu este nevoie de 4×4',
    accommodation: 'Ghid de cazare', meals: 'Mese și restaurante',
  },
  sr: {
    heading: 'Praktični vodiči', gettingHere: 'Kako stići', without4x4: 'Nije potreban 4×4',
    accommodation: 'Vodič za smeštaj', meals: 'Obroci i restorani',
  },
  hr: {
    heading: 'Praktični vodiči', gettingHere: 'Kako doći', without4x4: 'Nije potreban 4×4',
    accommodation: 'Vodič za smještaj', meals: 'Obroci i restorani',
  },
  cs: {
    heading: 'Praktické průvodce', gettingHere: 'Jak se sem dostat', without4x4: 'Pohon 4×4 není potřeba',
    accommodation: 'Průvodce ubytováním', meals: 'Stravování a restaurace',
  },
  tr: {
    heading: 'Pratik rehberler', gettingHere: 'Nasıl gelinir', without4x4: '4×4 araç gerekmez',
    accommodation: 'Konaklama rehberi', meals: 'Yemekler ve restoranlar',
  },
  'ja-JP': {
    heading: '旅行ガイド', gettingHere: 'アクセス', without4x4: '四輪駆動車は不要',
    accommodation: '宿泊ガイド', meals: '食事とレストラン',
  },
  'zh-CN': {
    heading: '实用指南', gettingHere: '交通指南', without4x4: '无需四驱车',
    accommodation: '住宿指南', meals: '餐饮指南',
  },
  ru: {
    heading: 'Практические путеводители', gettingHere: 'Как добраться', without4x4: 'Полный привод не нужен',
    accommodation: 'Путеводитель по размещению', meals: 'Питание и рестораны',
  },
  'af-ZA': {
    heading: 'Praktiese gidse', gettingHere: 'Hoe om hier te kom', without4x4: 'Geen 4×4 nodig nie',
    accommodation: 'Verblyfgids', meals: 'Etes en restaurante',
  },
  zu: {
    heading: 'Iziqondiso eziwusizo', gettingHere: 'Ungafika kanjani', without4x4: 'Awudingi imoto engu-4×4',
    accommodation: 'Isiqondiso sendawo yokuhlala', meals: 'Ukudla nezindawo zokudlela',
  },
  sw: {
    heading: 'Miongozo ya vitendo', gettingHere: 'Jinsi ya kufika', without4x4: 'Huhitaji gari la 4×4',
    accommodation: 'Mwongozo wa malazi', meals: 'Milo na mikahawa',
  },
};

export function getGuideLabels(lang) {
  return GUIDE_LABELS[lang] || ENGLISH;
}
