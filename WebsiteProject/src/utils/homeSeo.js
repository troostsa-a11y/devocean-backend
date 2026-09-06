import { useEffect } from 'react';

export const HOME_META_DESCRIPTIONS = {
  'en-US': 'Eco-friendly beach accommodation in Ponta do Ouro, Mozambique. Safari tents, cottage & chalet near the beach. Family-run hospitality and great value.',
  'en-GB': 'Eco-friendly beach accommodation in Ponta do Ouro, Mozambique. Safari tents, cottage & chalet near the beach. Family-run hospitality and great value.',
  'af-ZA': 'Eko-vriendelike strandakkommodasie in Ponta do Ouro, Mosambiek. Safari-tente, kothuisie & chalet naby die strand. Familiegedrewe gasvryheid.',
  'de-DE': 'Umweltfreundliche Strandunterkunft in Ponta do Ouro, Mosambik. Safari-Zelte, Cottage & Chalet am Strand. Familiengeführte Gastfreundschaft.',
  'es-ES': 'Alojamiento ecológico en la playa de Ponta do Ouro, Mozambique. Tiendas safari, cottage y chalet cerca de la playa. Hospitalidad familiar.',
  'fr-FR': 'Hébergement écologique à Ponta do Ouro, Mozambique. Tentes safari, cottage et chalet près de la plage. Hospitalité familiale chaleureuse.',
  'it-IT': 'Alloggio ecologico sulla spiaggia di Ponta do Ouro, Mozambico. Tende safari, cottage e chalet vicino alla spiaggia. Ospitalità familiare.',
  'ja-JP': 'モザンビーク、ポンタ・ド・オウロのエコフレンドリーなビーチ宿泊施設。サファリテント、コテージ、シャレー。家族経営のおもてなし。',
  'nl-NL': 'Milieuvriendelijke strandaccommodatie in Ponta do Ouro, Mozambique. Safari tenten, cottage & chalet bij het strand. Familiale gastvrijheid.',
  'pl': 'Ekologiczne zakwaterowanie na plaży w Ponta do Ouro, Mozambik. Namioty safari, domek i chata blisko plaży. Rodzinna gościnność.',
  'ro': 'Cazare ecologică la plajă în Ponta do Ouro, Mozambic. Corturi safari, căsuță și cabană lângă plajă. Ospitalitate familială și valoare excelentă.',
  'sr': 'Ekološki smeštaj na plaži u Ponta do Ouro, Mozambik. Safari šatori, vikendica i kućica blizu plaže. Porodična gostoljubivost i odlična vrednost.',
  'hr': 'Ekološki smještaj na plaži u Ponta do Ouro, Mozambik. Safari šatori, vikendica i kućica blizu plaže. Porodična gostoljubivost i odlična vrednost.',
  'cs': 'Ekologické ubytování na pláži v Ponta do Ouro, Mosambik. Safari stany, chalupa a chata u pláže. Rodinná pohostinnost a skvělá hodnota.',
  'tr': 'Çevre dostu plaj konaklaması Ponta do Ouro, Mozambik. Safari çadırları, kulübe ve şale plaja yakın. Aile misafirperverliği ve harika değer.',
  'pt-BR': 'Hospedagem ecológica na praia de Ponta do Ouro, Moçambique. Tendas safari, cottage e chalé perto da praia. Hospitalidade familiar.',
  'pt-PT': 'Alojamento ecológico na praia de Ponta do Ouro, Moçambique. Tendas safari, cottage e chalé perto da praia. Hospitalidade familiar.',
  'ru': 'Экологичное размещение на пляже в Понта-ду-Ору, Мозамбик. Палатки сафари, коттедж и шале у пляжа. Семейное гостеприимство.',
  'sv': 'Miljövänligt strandboende i Ponta do Ouro, Moçambique. Safaritält, stuga och chalet nära stranden. Familjedriven gästfrihet.',
  'sw': 'Malazi ya kirafiki mazingira huko Ponta do Ouro, Msumbiji. Hema za safari, cottage na chalet karibu na pwani. Ukarimu wa kifamilia.',
  'zh-CN': '莫桑比克蓬塔杜奥罗的环保海滨住宿。靠近海滩的帐篷、别墅和小屋。家庭式热情款待，物超所值。',
  'zu': 'Indawo yokuhlala enobungani bemvelo ogwini lwasePonta do Ouro, eMozambique. Amatende e-safari, cottage ne-chalet eduze nolwandle.',
};

export const HOME_META_TITLES = {
  'en-US': 'DEVOCEAN Lodge | Eco Beach Accommodation, Ponta do Ouro, Mozambique',
  'en-GB': 'DEVOCEAN Lodge | Eco Beach Accommodation, Ponta do Ouro, Mozambique',
  'af-ZA': 'DEVOCEAN Lodge | Eko-strandverblyf, Ponta do Ouro, Mosambiek',
  'de-DE': 'DEVOCEAN Lodge | Öko-Strandunterkunft, Ponta do Ouro, Mosambik',
  'es-ES': 'DEVOCEAN Lodge | Alojamiento Ecológico en la Playa, Ponta do Ouro, Mozambique',
  'fr-FR': 'DEVOCEAN Lodge | Hébergement Écologique en Bord de Mer, Ponta do Ouro, Mozambique',
  'it-IT': 'DEVOCEAN Lodge | Alloggio Ecologico sulla Spiaggia, Ponta do Ouro, Mozambico',
  'ja-JP': 'DEVOCEAN Lodge | エコビーチ宿泊施設、ポンタ・ド・オウロ、モザンビーク',
  'nl-NL': 'DEVOCEAN Lodge | Eco Strandaccommodatie, Ponta do Ouro, Mozambique',
  'pl': 'DEVOCEAN Lodge | Ekologiczne Zakwaterowanie na Plaży, Ponta do Ouro, Mozambik',
  'ro': 'DEVOCEAN Lodge | Cazare Ecologică la Plajă, Ponta do Ouro, Mozambic',
  'sr': 'DEVOCEAN Lodge | Ekološki Smeštaj na Plaži, Ponta do Ouro, Mozambik',
  'hr': 'DEVOCEAN Lodge | Ekološki Smještaj na Plaži, Ponta do Ouro, Mozambik',
  'cs': 'DEVOCEAN Lodge | Ekologické Ubytování na Pláži, Ponta do Ouro, Mosambik',
  'tr': 'DEVOCEAN Lodge | Çevre Dostu Plaj Konaklaması, Ponta do Ouro, Mozambik',
  'pt-BR': 'DEVOCEAN Lodge | Hospedagem Ecológica na Praia, Ponta do Ouro, Moçambique',
  'pt-PT': 'DEVOCEAN Lodge | Alojamento Ecológico na Praia, Ponta do Ouro, Moçambique',
  'ru': 'DEVOCEAN Lodge | Экологичное Размещение на Пляже, Понта-ду-Ору, Мозамбик',
  'sv': 'DEVOCEAN Lodge | Eko Strandboende, Ponta do Ouro, Moçambique',
  'sw': 'DEVOCEAN Lodge | Malazi ya Kirafiki Mazingira Pwanini, Ponta do Ouro, Msumbiji',
  'zh-CN': 'DEVOCEAN Lodge | 环保海滨住宿，蓬塔杜奥罗，莫桑比克',
  'zu': 'DEVOCEAN Lodge | Indawo Yokuhlala Enobungani Bemvelo Ogwini, Ponta do Ouro, Mozambique',
};

export function getHomeDescription(lang = 'en-US') {
  return HOME_META_DESCRIPTIONS[lang] || HOME_META_DESCRIPTIONS['en-US'];
}

export function getHomeTitle(lang = 'en-US') {
  return HOME_META_TITLES[lang] || HOME_META_TITLES['en-US'];
}

function updateMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (!element || !value) return null;
  const previous = element.getAttribute(attribute) || '';
  element.setAttribute(attribute, value);
  return () => element.setAttribute(attribute, previous);
}

/**
 * Homepage-only SEO updates. Keeping this hook separate prevents every route's
 * translated SEO catalogue from entering the critical homepage bundle.
 */
export function useHomeSeo(enabled, lang) {
  const title = enabled ? getHomeTitle(lang) : '';
  const description = enabled ? getHomeDescription(lang) : '';
  const image = 'https://devoceanlodge.com/photos/hero01.jpg';

  useEffect(() => {
    if (!enabled) return undefined;

    const previousTitle = document.title;
    document.title = title;
    const restore = [
      updateMeta('meta[name="description"]', 'content', description),
      updateMeta('meta[property="og:title"]', 'content', title),
      updateMeta('meta[property="og:description"]', 'content', description),
      updateMeta('meta[property="og:image"]', 'content', image),
      updateMeta('meta[name="twitter:title"]', 'content', title),
      updateMeta('meta[name="twitter:description"]', 'content', description),
      updateMeta('meta[name="twitter:image"]', 'content', image),
    ].filter(Boolean);

    return () => {
      document.title = previousTitle;
      restore.forEach((restoreMeta) => restoreMeta());
    };
  }, [enabled, title, description]);
}