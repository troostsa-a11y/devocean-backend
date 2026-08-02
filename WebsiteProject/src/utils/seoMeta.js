/**
 * seoMeta.js — page-level SEO utilities
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  NEW PAGES: use the `useSeoPage` hook (exported below).                 │
 * │  It sets title, description, canonical, OG *and* Twitter tags together, │
 * │  and restores them on unmount so SPA navigation stays correct.          │
 * │                                                                         │
 * │  DO NOT use one-shot imperative helpers for new pages — always use      │
 * │  `useSeoPage` so OG and Twitter tags are set and restored together.    │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * useSeoPage — shared hook for simple page-level SEO.
 *
 * Sets document.title, meta[name="description"] and the canonical link on mount,
 * and restores the previous values on unmount (SPA back-navigation).
 *
 * The `description` value MUST be imported from
 * src/utils/routeDescriptions.js (ROUTE_DESCRIPTIONS) — that file is the
 * single source of truth for every page's English description string.
 * functions/_middleware.js imports from the same file, so the static crawl
 * and the live JS description are guaranteed identical with no manual sync.
 *
 * Rules:
 *  - description ≤ 160 characters
 *  - always use ROUTE_DESCRIPTIONS['/your-route'] — never hardcode the string
 */
import { useEffect } from 'react';

const OG_PROPERTIES = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
const TWITTER_NAMES = ['twitter:title', 'twitter:description', 'twitter:image'];

/**
 * Capture current OG/Twitter meta tag values and return a restore function.
 * Tags that didn't exist before are removed on restore; existing tags are
 * reset to their previous content.
 */
function captureAndSetOgTwitter({ ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterTitle, twitterDescription, twitterImage }) {
  const prevOg = {};
  const prevTwitter = {};
  const createdTags = [];

  // Capture + set OG tags
  const ogUpdates = [
    { property: 'og:title',       content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:image',       content: ogImage },
    { property: 'og:url',         content: ogUrl },
    { property: 'og:type',        content: ogType },
  ];
  ogUpdates.forEach(({ property, content }) => {
    if (!content) return;
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (tag) {
      prevOg[property] = tag.content;
    } else {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
      createdTags.push(tag);
    }
    tag.content = content;
  });

  // Capture + set Twitter tags
  const twitterUpdates = [
    { name: 'twitter:title',       content: twitterTitle },
    { name: 'twitter:description', content: twitterDescription },
    { name: 'twitter:image',       content: twitterImage },
  ];
  twitterUpdates.forEach(({ name, content }) => {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (tag) {
      prevTwitter[name] = tag.content;
    } else {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
      createdTags.push(tag);
    }
    tag.content = content;
  });

  return function restore() {
    OG_PROPERTIES.forEach(property => {
      const tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) return;
      if (prevOg[property] !== undefined) {
        tag.content = prevOg[property];
      } else if (createdTags.includes(tag)) {
        tag.remove();
      }
    });
    TWITTER_NAMES.forEach(name => {
      const tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) return;
      if (prevTwitter[name] !== undefined) {
        tag.content = prevTwitter[name];
      } else if (createdTags.includes(tag)) {
        tag.remove();
      }
    });
  };
}

/**
 * useSeoPage — shared hook for page-level SEO.
 *
 * Sets document.title, meta[name="description"], the canonical link, and
 * optionally OG/Twitter meta tags on mount, and restores previous values on
 * unmount (SPA back-navigation).
 *
 * The `description` value MUST be imported from
 * src/utils/routeDescriptions.js (ROUTE_DESCRIPTIONS) — that file is the
 * single source of truth for every page's English description string.
 * functions/_middleware.js imports from the same file, so the static crawl
 * and the live JS description are guaranteed identical with no manual sync.
 *
 * Rules:
 *  - description ≤ 160 characters
 *  - always use ROUTE_DESCRIPTIONS['/your-route'] — never hardcode the string
 *
 * Optional OG/Twitter params (all strings):
 *   ogTitle, ogDescription, ogImage, ogUrl, ogType
 *   twitterTitle, twitterDescription, twitterImage
 */
export function useSeoPage({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  twitterTitle,
  twitterDescription,
  twitterImage,
}) {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.content || '';
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonicalTag?.href || '';

    if (title) document.title = title;
    if (description && metaDesc) metaDesc.content = description;
    if (canonical) updateCanonical(canonical);

    const hasOgTwitter = ogTitle || ogDescription || ogImage || ogUrl || ogType ||
                         twitterTitle || twitterDescription || twitterImage;
    const restoreOgTwitter = hasOgTwitter
      ? captureAndSetOgTwitter({ ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterTitle, twitterDescription, twitterImage })
      : null;

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.content = prevDesc;
      if (canonical) {
        if (prevCanonical) {
          updateCanonical(prevCanonical);
        } else {
          const tag = document.querySelector('link[rel="canonical"]');
          if (tag) tag.remove();
        }
      }
      if (restoreOgTwitter) restoreOgTwitter();
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterTitle, twitterDescription, twitterImage]);
}

const META_DESCRIPTIONS = {
  home: {
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
    'zu': 'Indawo yokuhlala enobungani bemvelo ogwini lwasePonta do Ouro, eMozambique. Amatende e-safari, cottage ne-chalet eduze nolwandle.'
  },
  experiences: {
    diving: {
      'en-US': 'Scuba diving in Ponta do Ouro, Mozambique. Explore coral reefs, encounter dolphins and marine life. PADI certified dive center. Book your dive adventure.',
      'en-GB': 'Scuba diving in Ponta do Ouro, Mozambique. Explore coral reefs, encounter dolphins and marine life. PADI certified dive centre. Book your dive adventure.',
      'af-ZA': 'Duik in Ponta do Ouro, Mosambiek. Verken koraalriwwe, ontmoet dolfyne en seelewe. PADI-gesertifiseerde duiksentrum. Bespreek jou duikavontuur.',
      'de-DE': 'Tauchen in Ponta do Ouro, Mosambik. Erkunden Sie Korallenriffe, begegnen Sie Delfinen und Meereslebewesen. PADI-zertifiziertes Tauchzentrum.',
      'es-ES': 'Buceo en Ponta do Ouro, Mozambique. Explora arrecifes de coral, encuentra delfines y vida marina. Centro de buceo certificado PADI.',
      'fr-FR': 'Plongée sous-marine à Ponta do Ouro, Mozambique. Explorez les récifs coralliens, rencontrez dauphins et vie marine. Centre PADI certifié.',
      'it-IT': 'Immersioni a Ponta do Ouro, Mozambico. Esplora barriere coralline, incontra delfini e vita marina. Centro immersioni certificato PADI.',
      'ja-JP': 'モザンビーク、ポンタ・ド・オウロでのスキューバダイビング。サンゴ礁を探索し、イルカや海洋生物と出会いましょう。PADI認定。',
      'nl-NL': 'Duiken in Ponta do Ouro, Mozambique. Verken koraalriffen, ontmoet dolfijnen en zeeleven. PADI gecertificeerd duikcentrum.',
      'pl': 'Nurkowanie w Ponta do Ouro, Mozambik. Odkryj rafy koralowe, spotkaj delfiny i życie morskie. Certyfikowane centrum PADI.',
      'ro': 'Scufundări în Ponta do Ouro, Mozambic. Explorează recife de corali, întâlnește delfini și viața marină. Centru de scufundări certificat PADI.',
      'sr': 'Ronjenje u Ponta do Ouro, Mozambik. Istražite koralne grebene, susrećite delfine i morski život. PADI sertifikovani centar za ronjenje.',
      'hr': 'Ronjenje u Ponta do Ouro, Mozambik. Istražite koralne grebene, susrećite dupine i morski život. PADI sertifikovani centar za ronjenje.',
    'cs': 'Potápění s přístrojem v Ponta do Ouro, Mosambik. Prozkoumejte korálové útesy, setkejte se s delfíny a mořským životem. Centrum certifikované PADI.',
    'tr': 'Ponta do Ouro, Mozambik\'te tüplü dalış. Mercan resiflerini keşfedin, yunuslar ve deniz canlılarıyla tanışın. PADI sertifikalı dalış merkezi.',
      'pt-BR': 'Mergulho em Ponta do Ouro, Moçambique. Explore recifes de coral, encontre golfinhos e vida marinha. Centro de mergulho certificado PADI.',
      'pt-PT': 'Mergulho em Ponta do Ouro, Moçambique. Explore recifes de coral, encontre golfinhos e vida marinha. Centro de mergulho certificado PADI.',
      'ru': 'Дайвинг в Понта-ду-Ору, Мозамбик. Исследуйте коралловые рифы, встретьте дельфинов и морских обитателей. Сертифицированный центр PADI.',
      'sv': 'Dykning i Ponta do Ouro, Moçambique. Utforska korallrev, möt delfiner och marint liv. PADI-certifierat dykcenter.',
      'sw': 'Kupiga mbizi huko Ponta do Ouro, Msumbiji. Chunguza miamba ya matumbawe, kutana na pomboo na viumbe vya baharini. Kituo cha PADI.',
      'zh-CN': '莫桑比克蓬塔杜奥罗潜水。探索珊瑚礁，邂逅海豚和海洋生物。PADI认证潜水中心。预订您的潜水冒险之旅。',
      'zu': 'Ukucwila ePonta do Ouro, eMozambique. Hlola izintaba zamatye, hlangana nezingwenya zolwandle. Isikhungo esigunyaziwe se-PADI.'
    },
    dolphins: {
      'en-US': 'Swim with wild dolphins in Ponta do Ouro, Mozambique. Ethical ocean safari encounters with bottlenose dolphins in their natural habitat.',
      'en-GB': 'Swim with wild dolphins in Ponta do Ouro, Mozambique. Ethical ocean safari encounters with bottlenose dolphins in their natural habitat.',
      'af-ZA': 'Swem saam met wilde dolfyne in Ponta do Ouro, Mosambiek. Etiese osean-safari-ontmoetings met tuimelneuse in hul natuurlike habitat.',
      'de-DE': 'Schwimmen mit wilden Delfinen in Ponta do Ouro, Mosambik. Ethische Ozean-Safari-Begegnungen mit Großen Tümmlern in ihrem Lebensraum.',
      'es-ES': 'Nada con delfines salvajes en Ponta do Ouro, Mozambique. Encuentros éticos de safari oceánico con delfines nariz de botella.',
      'fr-FR': 'Nagez avec les dauphins sauvages à Ponta do Ouro, Mozambique. Rencontres éthiques de safari océan avec les grands dauphins.',
      'it-IT': 'Nuota con i delfini selvatici a Ponta do Ouro, Mozambico. Incontri etici di safari oceanico con tursiopi nel loro habitat naturale.',
      'ja-JP': 'モザンビーク、ポンタ・ド・オウロで野生のイルカと泳ぐ。自然の生息地でバンドウイルカとの倫理的な海洋サファリ体験。',
      'nl-NL': 'Zwem met wilde dolfijnen in Ponta do Ouro, Mozambique. Ethische oceaan safari ontmoetingen met tuimelaars in hun natuurlijke habitat.',
      'pl': 'Pływaj z dzikimi delfinami w Ponta do Ouro, Mozambik. Etyczne spotkania safari oceaniczne z delfinami butlonosymi.',
      'ro': 'Înoată cu delfinii sălbatici în Ponta do Ouro, Mozambic. Întâlniri etice de safari oceanic cu delfini cu nas de sticlă în habitatul lor natural.',
      'sr': 'Plivajte sa divljim delfinima u Ponta do Ouro, Mozambik. Etički okeanski safari susreti sa delfinima u njihovom prirodnom staništu.',
      'hr': 'Plivajte sa divljim dupinima u Ponta do Ouro, Mozambik. Etički oceanski safari susreti sa dupinima u njihovom prirodnom staništu.',
    'cs': 'Plavání s divokými delfíny v Ponta do Ouro, Mosambik. Etická setkání oceánského safari s delfíny skákavými v jejich přirozeném prostředí.',
    'tr': 'Ponta do Ouro, Mozambik\'te vahşi yunuslarla yüzme. Doğal ortamlarında şişe burunlu yunuslarla etik okyanus safarisi karşılaşmaları.',
      'pt-BR': 'Nade com golfinhos selvagens em Ponta do Ouro, Moçambique. Encontros éticos de safári oceânico com golfinhos-roazes.',
      'pt-PT': 'Nade com golfinhos selvagens em Ponta do Ouro, Moçambique. Encontros éticos de safári oceânico com golfinhos-roazes.',
      'ru': 'Плавание с дикими дельфинами в Понта-ду-Ору, Мозамбик. Этичные встречи с афалинами в их естественной среде обитания.',
      'sv': 'Simma med vilda delfiner i Ponta do Ouro, Moçambique. Etiska havsafari möten med flasknosdelfiner i deras naturliga livsmiljö.',
      'sw': 'Ogelea na pomboo wa porini huko Ponta do Ouro, Msumbiji. Mikutano ya safari ya bahari yenye maadili na pomboo wa pua.',
      'zh-CN': '在莫桑比克蓬塔杜奥罗与野生海豚一起游泳。与宽吻海豚在自然栖息地进行合乎道德的海洋探险。',
      'zu': 'Bhukuda nezingwenya zasendle ePonta do Ouro, eMozambique. Izikhathi ezinobulungiswa ze-ocean safari nezingwenya ze-bottlenose.'
    },
    seafari: {
      'en-US': 'Ocean seafari in Ponta do Ouro, Mozambique. Whale watching, dolphins, and marine wildlife boat tours. Experience the Indian Ocean wonders.',
      'en-GB': 'Ocean seafari in Ponta do Ouro, Mozambique. Whale watching, dolphins, and marine wildlife boat tours. Experience the Indian Ocean wonders.',
      'af-ZA': 'Oseaan-seafari in Ponta do Ouro, Mosambiek. Walvisbesigtiging, dolfyne en mariene wildlewe-boottoere. Beleef die Indiese Oseaan-wonders.',
      'de-DE': 'Ozean-Seafari in Ponta do Ouro, Mosambik. Walbeobachtung, Delfine und Meeresboottouren. Erleben Sie die Wunder des Indischen Ozeans.',
      'es-ES': 'Seafari oceánico en Ponta do Ouro, Mozambique. Avistamiento de ballenas, delfines y tours de vida marina. Descubre el Océano Índico.',
      'fr-FR': 'Seafari océanique à Ponta do Ouro, Mozambique. Observation des baleines, dauphins et excursions en bateau. Découvrez l\'océan Indien.',
      'it-IT': 'Seafari oceanico a Ponta do Ouro, Mozambico. Avvistamento balene, delfini e tour in barca della vita marina. Scopri l\'Oceano Indiano.',
      'ja-JP': 'モザンビーク、ポンタ・ド・オウロでのオーシャンシーファリ。ホエールウォッチング、イルカ、海洋野生生物ボートツアー。',
      'nl-NL': 'Oceaan seafari in Ponta do Ouro, Mozambique. Walvissen spotten, dolfijnen en zeewilddieren boottochten. Beleef de Indische Oceaan.',
      'pl': 'Ocean seafari w Ponta do Ouro, Mozambik. Obserwacja wielorybów, delfinów i wycieczki łodzią po dzikiej przyrodzie morskiej.',
      'ro': 'Safari oceanic în Ponta do Ouro, Mozambic. Observarea balenelor, delfinilor și tururi cu barca pentru fauna marină. Descoperă Oceanul Indian.',
      'sr': 'Morski safari u Ponta do Ouro, Mozambik. Posmatranje kitova, delfina i ture čamcem za morski život. Otkrijte Indijski okean.',
      'hr': 'Morski safari u Ponta do Ouro, Mozambik. Posmatranje kitova, dupina i ture čamcem za morski život. Otkrijte Indijski ocean.',
    'cs': 'Oceánské safari v Ponta do Ouro, Mosambik. Pozorování velryb, delfínů a lodní výlety za mořskou faunou. Zažijte zázraky Indického oceánu.',
    'tr': 'Ponta do Ouro, Mozambik\'te okyanus safarisi. Balina, yunus gözlemi ve deniz yaşamı için tekne turları. Hint Okyanusu mucizelerini deneyimleyin.',
      'pt-BR': 'Seafari oceânico em Ponta do Ouro, Moçambique. Observação de baleias, golfinhos e passeios de barco. Descubra o Oceano Índico.',
      'pt-PT': 'Seafari oceânico em Ponta do Ouro, Moçambique. Observação de baleias, golfinhos e passeios de barco. Descubra o Oceano Índico.',
      'ru': 'Океанское сафари в Понта-ду-Ору, Мозамбик. Наблюдение за китами, дельфинами и морской фауной. Откройте Индийский океан.',
      'sv': 'Ocean seafari i Ponta do Ouro, Moçambique. Valsafari, delfiner och marina djur båtturer. Upplev Indiska oceanens underverk.',
      'sw': 'Safari ya bahari huko Ponta do Ouro, Msumbiji. Kuangalia nyangumi, pomboo na ziara za mashua za wanyamapori wa baharini.',
      'zh-CN': '莫桑比克蓬塔杜奥罗海洋探险。观鲸、海豚和海洋野生动物船游。体验印度洋的奇观。',
      'zu': 'I-ocean seafari ePonta do Ouro, eMozambique. Ukubuka izimvubu, izingwenya nemihambi yezilwane zasolwandle ngesikebhe.'
    },
    safari: {
      'en-US': 'African wildlife safari near Ponta do Ouro, Mozambique. Day trips to Tembe Elephant Park and Maputo Special Reserve. See elephants, lions, and more.',
      'en-GB': 'African wildlife safari near Ponta do Ouro, Mozambique. Day trips to Tembe Elephant Park and Maputo Special Reserve. See elephants, lions, and more.',
      'af-ZA': 'Afrika-wildlewe-safari naby Ponta do Ouro, Mosambiek. Dagreise na Tembe Olifantpark en Maputo Spesiale Reservaat. Sien olifante, leeus.',
      'de-DE': 'Afrikanische Wildlife-Safari nahe Ponta do Ouro, Mosambik. Tagesausflüge zum Tembe Elephant Park. Sehen Sie Elefanten, Löwen und mehr.',
      'es-ES': 'Safari de vida salvaje africana cerca de Ponta do Ouro, Mozambique. Excursiones al Parque de Elefantes Tembe. Ver elefantes, leones y más.',
      'fr-FR': 'Safari africain près de Ponta do Ouro, Mozambique. Excursions au parc des éléphants de Tembe. Observez éléphants, lions et plus.',
      'it-IT': 'Safari nella fauna africana vicino a Ponta do Ouro, Mozambico. Escursioni al Tembe Elephant Park. Ammira elefanti, leoni e altro.',
      'ja-JP': 'モザンビーク、ポンタ・ド・オウロ近くのアフリカ野生動物サファリ。テンベ・エレファント・パークへの日帰り旅行。ゾウ、ライオンを観察。',
      'nl-NL': 'Afrikaanse wildlife safari nabij Ponta do Ouro, Mozambique. Dagtochten naar Tembe Elephant Park. Zie olifanten, leeuwen en meer.',
      'pl': 'Afrykańskie safari z dziką przyrodą w pobliżu Ponta do Ouro, Mozambik. Wycieczki do Parku Słoni Tembe. Zobacz słonie, lwy i więcej.',
      'ro': 'Safari african cu animale sălbatice lângă Ponta do Ouro, Mozambic. Excursii la Parcul Elefanților Tembe. Vezi elefanți, lei și multe altele.',
      'sr': 'Afrički safari sa divljim životinjama blizu Ponta do Ouro, Mozambik. Izleti u Park slonova Tembe. Vidite slonove, lavove i još.',
      'hr': 'Afrički safari sa divljim životinjama blizu Ponta do Ouro, Mozambik. Izleti u Park slonova Tembe. Vidite slonove, lavove i još.',
    'cs': 'Africké safari za divokou zvěří poblíž Ponta do Ouro, Mosambik. Jednodenní výlety do Tembe Elephant Park. Vidět slony, lvy a další zvířata.',
    'tr': 'Ponta do Ouro, Mozambik yakınlarında Afrika vahşi yaşam safarisi. Tembe Fil Parkı\'na günlük turlar. Filleri, aslanları ve daha fazlasını görün.',
      'pt-BR': 'Safari de vida selvagem africana perto de Ponta do Ouro, Moçambique. Passeios ao Parque dos Elefantes de Tembe. Veja elefantes e leões.',
      'pt-PT': 'Safari de vida selvagem africana perto de Ponta do Ouro, Moçambique. Passeios ao Parque dos Elefantes de Tembe. Veja elefantes e leões.',
      'ru': 'Африканское сафари недалеко от Понта-ду-Ору, Мозамбик. Экскурсии в парк слонов Тембе. Увидьте слонов, львов и других животных.',
      'sv': 'Afrikansk viltlivssafari nära Ponta do Ouro, Moçambique. Dagsturer till Tembe Elephant Park. Se elefanter, lejon och mer.',
      'sw': 'Safari ya wanyamapori wa Afrika karibu na Ponta do Ouro, Msumbiji. Safari za siku hadi Hifadhi ya Tembe Elephant. Ona tembo, simba.',
      'zh-CN': '莫桑比克蓬塔杜奥罗附近的非洲野生动物探险。腾贝大象公园一日游。观看大象、狮子等野生动物。',
      'zu': 'I-safari yezilwane zasendle yase-Afrika eduze nePonta do Ouro, eMozambique. Izindlela zosuku kuTembe Elephant Park. Bona izindlovu, izingonyama.'
    },
    fishing: {
      'en-US': 'Deep sea fishing charters in Ponta do Ouro, Mozambique. Catch marlin, sailfish, and tuna. Professional fishing boats and experienced crew.',
      'en-GB': 'Deep sea fishing charters in Ponta do Ouro, Mozambique. Catch marlin, sailfish, and tuna. Professional fishing boats and experienced crew.',
      'af-ZA': 'Diepsee-hengelcharters in Ponta do Ouro, Mosambiek. Vang marlien, seilvis en tuna. Professionele hengelboottoere en ervare mannskap.',
      'de-DE': 'Hochseeangelcharter in Ponta do Ouro, Mosambik. Fangen Sie Marlin, Segelfisch und Thunfisch. Professionelle Angelboote und erfahrene Crew.',
      'es-ES': 'Chárteres de pesca en alta mar en Ponta do Ouro, Mozambique. Pesca de marlín, pez vela y atún. Barcos profesionales y tripulación experta.',
      'fr-FR': 'Charters de pêche en haute mer à Ponta do Ouro, Mozambique. Pêchez marlin, voilier et thon. Bateaux professionnels et équipage expérimenté.',
      'it-IT': 'Charter di pesca d\'altura a Ponta do Ouro, Mozambico. Pesca di marlin, pesce vela e tonno. Barche professionali e equipaggio esperto.',
      'ja-JP': 'モザンビーク、ポンタ・ド・オウロでの深海釣りチャーター。マーリン、バショウカジキ、マグロを釣る。プロの釣り船と経験豊富なクルー。',
      'nl-NL': 'Diepzeevissen charters in Ponta do Ouro, Mozambique. Vang marlijn, zeilvis en tonijn. Professionele vissersboten en ervaren bemanning.',
      'pl': 'Czartery wędkarstwa głębinowego w Ponta do Ouro, Mozambik. Łów marlina, żaglicę i tuńczyka. Profesjonalne łodzie i doświadczona załoga.',
      'ro': 'Charter de pescuit în larg în Ponta do Ouro, Mozambic. Prinde marlin, peste-spadă și ton. Bărci profesionale și echipaj experimentat.',
      'sr': 'Čarteri za ribolov u dubokom moru u Ponta do Ouro, Mozambik. Lovite marlina, sabljarku i tunu. Profesionalni čamci i iskusna posada.',
      'hr': 'Čarteri za ribolov u dubokom moru u Ponta do Ouro, Mozambik. Lovite marlina, sabljarku i tunu. Profesionalni čamci i iskusna posada.',
    'cs': 'Hlubokomořské rybářské chartery v Ponta do Ouro, Mosambik. Ulovte marlína, plachetníka a tuňáka. Profesionální lodě a zkušená posádka.',
    'tr': 'Ponta do Ouro, Mozambik\'te derin deniz balıkçılığı çarterleri. Marlin, yelken balığı ve ton balığı yakalayın. Profesyonel tekneler ve deneyimli mürettebat.',
      'pt-BR': 'Charters de pesca em alto mar em Ponta do Ouro, Moçambique. Pesque marlim, peixe-vela e atum. Barcos profissionais e tripulação experiente.',
      'pt-PT': 'Charters de pesca em alto mar em Ponta do Ouro, Moçambique. Pesque marlim, peixe-vela e atum. Barcos profissionais e tripulação experiente.',
      'ru': 'Чартеры для глубоководной рыбалки в Понта-ду-Ору, Мозамбик. Ловите марлина, парусника и тунца. Профессиональные лодки.',
      'sv': 'Djuphavsfiske charter i Ponta do Ouro, Moçambique. Fånga marlin, segelfisk och tonfisk. Professionella fiskebåtar och erfaren besättning.',
      'sw': 'Chata za uvuvi wa bahari kuu huko Ponta do Ouro, Msumbiji. Kamata marlin, sailfish na tuna. Mashua za kitaalamu na wafanyakazi wenye uzoefu.',
      'zh-CN': '莫桑比克蓬塔杜奥罗深海钓鱼包船。钓马林鱼、旗鱼和金枪鱼。专业钓鱼船和经验丰富的船员。',
      'zu': 'Ama-charter okudoba olwandle olujulile ePonta do Ouro, eMozambique. Bamba imarlin, isailfish, netuna. Izikebhe zomsebenzi zabasebenzi.'
    },
    surfing: {
      'en-US': 'Surfing lessons and rentals in Ponta do Ouro, Mozambique. Learn to surf on pristine beaches. Beginner-friendly waves and experienced instructors.',
      'en-GB': 'Surfing lessons and rentals in Ponta do Ouro, Mozambique. Learn to surf on pristine beaches. Beginner-friendly waves and experienced instructors.',
      'af-ZA': 'Branderplanklesse en -huur in Ponta do Ouro, Mosambiek. Leer brandplank ry op ongerepte strande. Beginnervriendelike golwe.',
      'de-DE': 'Surfstunden und Verleih in Ponta do Ouro, Mosambik. Surfen lernen an unberührten Stränden. Anfängerfreundliche Wellen und erfahrene Lehrer.',
      'es-ES': 'Clases de surf y alquiler en Ponta do Ouro, Mozambique. Aprende a surfear en playas vírgenes. Olas para principiantes e instructores.',
      'fr-FR': 'Cours de surf et location à Ponta do Ouro, Mozambique. Apprenez à surfer sur des plages vierges. Vagues pour débutants et moniteurs.',
      'it-IT': 'Lezioni di surf e noleggio a Ponta do Ouro, Mozambico. Impara a surfare su spiagge incontaminate. Onde per principianti e istruttori.',
      'ja-JP': 'モザンビーク、ポンタ・ド・オウロでのサーフィンレッスンとレンタル。手つかずのビーチでサーフィンを学ぶ。初心者向けの波と経験豊富なインストラクター。',
      'nl-NL': 'Surflessen en verhuur in Ponta do Ouro, Mozambique. Leer surfen op ongerepte stranden. Beginnersvriendelijke golven en ervaren instructeurs.',
      'pl': 'Lekcje surfingu i wypożyczalnia w Ponta do Ouro, Mozambik. Naucz się surfować na dziewiczych plażach. Fale dla początkujących.',
      'ro': 'Lecții de surf și închirieri în Ponta do Ouro, Mozambic. Învață să faci surf pe plaje neatinse. Valuri pentru începători și instructori experimentați.',
      'sr': 'Surf lekcije i iznajmljivanje u Ponta do Ouro, Mozambik. Naučite surf na netaknutim plažama. Talasi za početnike i iskusni instruktori.',
      'hr': 'Surf lekcije i iznajmljivanje u Ponta do Ouro, Mozambik. Naučite surf na netaknutim plažama. Talasi za početnike i iskusni instruktori.',
    'cs': 'Lekce surfování a půjčovna v Ponta do Ouro, Mosambik. Naučte se surfovat na nedotčených plážích. Vlny pro začátečníky a zkušení instruktoři.',
    'tr': 'Ponta do Ouro, Mozambik\'te sörf dersleri ve kiralama. Bozulmamış plajlarda sörf yapmayı öğrenin. Başlangıç dalgaları ve deneyimli eğitmenler.',
      'pt-BR': 'Aulas de surf e aluguel em Ponta do Ouro, Moçambique. Aprenda a surfar em praias intocadas. Ondas para iniciantes e instrutores.',
      'pt-PT': 'Aulas de surf e aluguer em Ponta do Ouro, Moçambique. Aprenda a surfar em praias intocadas. Ondas para iniciantes e instrutores.',
      'ru': 'Уроки серфинга и прокат в Понта-ду-Ору, Мозамбик. Научитесь серфингу на нетронутых пляжах. Волны для начинающих и инструкторы.',
      'sv': 'Surflektioner och uthyrning i Ponta do Ouro, Moçambique. Lär dig surfa på orörda stränder. Nybörjarvänliga vågor och erfarna instruktörer.',
      'sw': 'Masomo ya surfing na kukodisha huko Ponta do Ouro, Msumbiji. Jifunze kusurfi kwenye fukwe safi. Mawimbi kwa wanaoanza na wakufunzi.',
      'zh-CN': '莫桑比克蓬塔杜奥罗的冲浪课程和租赁。在原始海滩学习冲浪。适合初学者的海浪和经验丰富的教练。',
      'zu': 'Izifundo zokushayela amagagasi nokuhrentisha ePonta do Ouro, eMozambique. Funda ukushayela amagagasi ezindlini ezinhle.'
    },
    lighthouse: {
      'en-US': 'Ponta do Ouro Lighthouse - Historic landmark and scenic viewpoint in Southern Mozambique. Panoramic ocean views and photography spot.',
      'en-GB': 'Ponta do Ouro Lighthouse - Historic landmark and scenic viewpoint in Southern Mozambique. Panoramic ocean views and photography spot.',
      'af-ZA': 'Ponta do Ouro Vuurtoring - Historiese landmerk en skouspelagtige uitkykpunt in Suid-Mosambiek. Panoramiese see-uitsigte.',
      'de-DE': 'Ponta do Ouro Leuchtturm - Historisches Wahrzeichen und Aussichtspunkt in Südmosambik. Panorama-Meerblick und Fotografie-Spot.',
      'es-ES': 'Faro de Ponta do Ouro - Monumento histórico y mirador panorámico en el sur de Mozambique. Vistas al océano y fotografía.',
      'fr-FR': 'Phare de Ponta do Ouro - Monument historique et point de vue panoramique au sud du Mozambique. Vues océaniques panoramiques.',
      'it-IT': 'Faro di Ponta do Ouro - Monumento storico e punto panoramico nel Mozambico meridionale. Viste panoramiche sull\'oceano.',
      'ja-JP': 'ポンタ・ド・オウロ灯台 - モザンビーク南部の歴史的ランドマークと景勝地。パノラマの海の景色と写真スポット。',
      'nl-NL': 'Ponta do Ouro Vuurtoren - Historisch monument en schilderachtig uitzichtpunt in Zuid-Mozambique. Panoramisch zeezicht.',
      'pl': 'Latarnia morska Ponta do Ouro - Historyczny punkt orientacyjny i malowniczy punkt widokowy w południowym Mozambiku. Panoramiczne widoki.',
      'ro': 'Farul Ponta do Ouro - Reper istoric și punct panoramic în sudul Mozambicului. Priveliști panoramice asupra oceanului și loc pentru fotografii.',
      'sr': 'Svetionik Ponta do Ouro - istorijski znamenitost i panoramska tačka na jugu Mozambika. Panoramski pogledi na okean i mesto za fotografije.',
      'hr': 'Svetionik Ponta do Ouro - istorijski znamenitost i panoramska točka na jugu Mozambika. Panoramski pogledi na ocean i mjesto za fotografije.',
    'cs': 'Maják Ponta do Ouro - Historická památka a malebné vyhlídkové místo na jihu Mosambiku. Panoramatický výhled na oceán a místo pro fotografování.',
    'tr': 'Ponta do Ouro Deniz Feneri - Güney Mozambik\'te tarihi dönüm noktası ve manzaralı bakış noktası. Panoramik okyanus manzarası ve fotoğraf noktası.',
      'pt-BR': 'Farol de Ponta do Ouro - Marco histórico e mirante panorâmico no sul de Moçambique. Vistas panorâmicas do oceano.',
      'pt-PT': 'Farol de Ponta do Ouro - Marco histórico e miradouro panorâmico no sul de Moçambique. Vistas panorâmicas do oceano.',
      'ru': 'Маяк Понта-ду-Ору - Историческая достопримечательность и смотровая площадка в Южном Мозамбике. Панорамные виды на океан.',
      'sv': 'Ponta do Ouro fyr - Historiskt landmärke och pittoresk utsiktsplats i södra Moçambique. Panoramautsikt över havet.',
      'sw': 'Taa ya Ponta do Ouro - Alama ya kihistoria na mandhari nzuri kusini mwa Msumbiji. Maoni ya bahari na upigaji picha.',
      'zh-CN': '蓬塔杜奥罗灯塔 - 莫桑比克南部的历史地标和观景点。全景海洋景观和摄影点。',
      'zu': 'Isibonakaliso sase-Ponta do Ouro - Indawo yomlando nombono omuhle eNingizimu yeMozambique. Ukubona ulwandle ngokuphelele.'
    }
  }
};


const META_TITLES = {
  home: {
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
  },
  story: {
    'en-US': 'Our Story | DEVOCEAN Lodge',
    'en-GB': 'Our Story | DEVOCEAN Lodge',
    'af-ZA': 'Ons Verhaal | DEVOCEAN Lodge',
    'de-DE': 'Unsere Geschichte | DEVOCEAN Lodge',
    'es-ES': 'Nuestra Historia | DEVOCEAN Lodge',
    'fr-FR': 'Notre Histoire | DEVOCEAN Lodge',
    'it-IT': 'La Nostra Storia | DEVOCEAN Lodge',
    'ja-JP': '私たちのストーリー | DEVOCEAN Lodge',
    'nl-NL': 'Ons Verhaal | DEVOCEAN Lodge',
    'pl': 'Nasza Historia | DEVOCEAN Lodge',
    'ro': 'Povestea Noastră | DEVOCEAN Lodge',
    'sr': 'Naša Priča | DEVOCEAN Lodge',
    'hr': 'Naša Priča | DEVOCEAN Lodge',
    'cs': 'Náš Příběh | DEVOCEAN Lodge',
    'tr': 'Hikayemiz | DEVOCEAN Lodge',
    'pt-BR': 'Nossa História | DEVOCEAN Lodge',
    'pt-PT': 'A Nossa História | DEVOCEAN Lodge',
    'ru': 'Наша История | DEVOCEAN Lodge',
    'sv': 'Vår Historia | DEVOCEAN Lodge',
    'sw': 'Hadithi Yetu | DEVOCEAN Lodge',
    'zh-CN': '我们的故事 | DEVOCEAN Lodge',
    'zu': 'Indaba Yethu | DEVOCEAN Lodge',
  },
  meals: {
    'en-US': 'Meals at DEVOCEAN Lodge | Breakfast & Guest Dinners',
    'en-GB': 'Meals at DEVOCEAN Lodge | Breakfast & Guest Dinners',
    'af-ZA': 'Maaltye by DEVOCEAN Lodge | Ontbyt en Gasdinee',
    'de-DE': 'Mahlzeiten im DEVOCEAN Lodge | Frühstück & Abendessen',
    'es-ES': 'Comidas en DEVOCEAN Lodge | Desayuno y Cenas para Huéspedes',
    'fr-FR': 'Repas au DEVOCEAN Lodge | Petit-déjeuner & Dîners',
    'it-IT': 'Pasti al DEVOCEAN Lodge | Colazione & Cene per Ospiti',
    'ja-JP': 'DEVOCEAN Lodgeの食事 | 朝食＆ゲストディナー',
    'nl-NL': 'Maaltijden bij DEVOCEAN Lodge | Ontbijt & Gastenavondeten',
    'pl': 'Posiłki w DEVOCEAN Lodge | Śniadanie i Kolacje dla Gości',
    'ro': 'Mese la DEVOCEAN Lodge | Mic Dejun & Cine pentru Oaspeți',
    'sr': 'Obroci u DEVOCEAN Lodge | Doručak i Večere za Goste',
    'hr': 'Obroci u DEVOCEAN Lodge | Doručak i Večere za Goste',
    'cs': 'Stravování v DEVOCEAN Lodge | Snídaně a Večeře pro Hosty',
    'tr': "DEVOCEAN Lodge'de Yemekler | Kahvaltı ve Misafir Akşam Yemekleri",
    'pt-BR': 'Refeições no DEVOCEAN Lodge | Café da Manhã & Jantares',
    'pt-PT': 'Refeições no DEVOCEAN Lodge | Pequeno-almoço & Jantares',
    'ru': 'Питание в DEVOCEAN Lodge | Завтрак и Ужины для Гостей',
    'sv': 'Måltider på DEVOCEAN Lodge | Frukost & Middagar',
    'sw': 'Milo katika DEVOCEAN Lodge | Kiamsha Kinywa na Chakula cha Jioni',
    'zh-CN': 'DEVOCEAN Lodge餐饮 | 早餐及晚餐',
    'zu': 'Ukudla eDEVOCEAN Lodge | Isidlo Sakusasa & Izidlo Zakusihlwa',
  },
  pontaDoOuro: {
    'en-US': 'Ponta do Ouro Travel Guide | DEVOCEAN Lodge',
    'en-GB': 'Ponta do Ouro Travel Guide | DEVOCEAN Lodge',
    'af-ZA': 'Ponta do Ouro Reisgids | DEVOCEAN Lodge',
    'de-DE': 'Ponta do Ouro Reiseführer | DEVOCEAN Lodge',
    'es-ES': 'Guía de Viaje de Ponta do Ouro | DEVOCEAN Lodge',
    'fr-FR': 'Guide de Voyage Ponta do Ouro | DEVOCEAN Lodge',
    'it-IT': 'Guida di Viaggio Ponta do Ouro | DEVOCEAN Lodge',
    'ja-JP': 'ポンタ・ド・オウロ旅行ガイド | DEVOCEAN Lodge',
    'nl-NL': 'Ponta do Ouro Reisgids | DEVOCEAN Lodge',
    'pl': 'Przewodnik Turystyczny Ponta do Ouro | DEVOCEAN Lodge',
    'ro': 'Ghid de Călătorie Ponta do Ouro | DEVOCEAN Lodge',
    'sr': 'Turistički Vodič Ponta do Ouro | DEVOCEAN Lodge',
    'hr': 'Turistički Vodič Ponta do Ouro | DEVOCEAN Lodge',
    'cs': 'Průvodce Cestováním Ponta do Ouro | DEVOCEAN Lodge',
    'tr': 'Ponta do Ouro Seyahat Rehberi | DEVOCEAN Lodge',
    'pt-BR': 'Guia de Viagem de Ponta do Ouro | DEVOCEAN Lodge',
    'pt-PT': 'Guia de Viagem de Ponta do Ouro | DEVOCEAN Lodge',
    'ru': 'Путеводитель по Понта-ду-Ору | DEVOCEAN Lodge',
    'sv': 'Reseguide Ponta do Ouro | DEVOCEAN Lodge',
    'sw': 'Mwongozo wa Kusafiri Ponta do Ouro | DEVOCEAN Lodge',
    'zh-CN': '蓬塔杜奥罗旅游指南 | DEVOCEAN Lodge',
    'zu': 'Izikhokelo Zokuhamba ePonta do Ouro | DEVOCEAN Lodge',
  },
  gettingThere: {
    'en-US': 'Getting to Ponta do Ouro | Travel Guide',
    'en-GB': 'Getting to Ponta do Ouro | Travel Guide',
    'af-ZA': 'Hoe om Ponta do Ouro te Bereik | Reisgids',
    'de-DE': 'Anreise nach Ponta do Ouro | Reiseführer',
    'es-ES': 'Cómo Llegar a Ponta do Ouro | Guía de Viaje',
    'fr-FR': 'Comment Rejoindre Ponta do Ouro | Guide de Voyage',
    'it-IT': 'Come Arrivare a Ponta do Ouro | Guida di Viaggio',
    'ja-JP': 'ポンタ・ド・オウロへのアクセス | 旅行ガイド',
    'nl-NL': 'Hoe naar Ponta do Ouro Reizen | Reisgids',
    'pl': 'Jak Dotrzeć do Ponta do Ouro | Przewodnik',
    'ro': 'Cum să Ajungi la Ponta do Ouro | Ghid de Călătorie',
    'sr': 'Kako Doći do Ponta do Ouro | Turistički Vodič',
    'hr': 'Kako Doći do Ponta do Ouro | Turistički Vodič',
    'cs': 'Jak se Dostat do Ponta do Ouro | Průvodce',
    'tr': "Ponta do Ouro'ya Nasıl Gidilir | Seyahat Rehberi",
    'pt-BR': 'Como Chegar a Ponta do Ouro | Guia de Viagem',
    'pt-PT': 'Como Chegar a Ponta do Ouro | Guia de Viagem',
    'ru': 'Как добраться до Понта-ду-Ору | Путеводитель',
    'sv': 'Hur man Tar sig till Ponta do Ouro | Reseguide',
    'sw': 'Jinsi ya Kufika Ponta do Ouro | Mwongozo wa Safari',
    'zh-CN': '如何前往蓬塔杜奥罗 | 旅游指南',
    'zu': 'Ukufika ePonta do Ouro | Izikhokelo Zokuhamba',
  },
  withoutFourByFour: {
    'en-US': 'Visiting Ponta do Ouro Without a 4×4 | DEVOCEAN Lodge',
    'en-GB': 'Visiting Ponta do Ouro Without a 4×4 | DEVOCEAN Lodge',
    'af-ZA': "Besoek Ponta do Ouro Sonder 'n 4×4 | DEVOCEAN Lodge",
    'de-DE': 'Ponta do Ouro Ohne 4×4 Besuchen | DEVOCEAN Lodge',
    'es-ES': 'Visitar Ponta do Ouro Sin 4×4 | DEVOCEAN Lodge',
    'fr-FR': 'Visiter Ponta do Ouro Sans 4×4 | DEVOCEAN Lodge',
    'it-IT': 'Visitare Ponta do Ouro Senza 4×4 | DEVOCEAN Lodge',
    'ja-JP': '4×4なしでポンタ・ド・オウロを訪れる | DEVOCEAN Lodge',
    'nl-NL': 'Ponta do Ouro Bezoeken Zonder 4×4 | DEVOCEAN Lodge',
    'pl': 'Ponta do Ouro Bez 4×4 | DEVOCEAN Lodge',
    'ro': 'Vizitând Ponta do Ouro Fără 4×4 | DEVOCEAN Lodge',
    'sr': 'Poseta Ponta do Ouro Bez 4×4 | DEVOCEAN Lodge',
    'hr': 'Posjet Ponta do Ouro Bez 4×4 | DEVOCEAN Lodge',
    'cs': 'Návštěva Ponta do Ouro Bez 4×4 | DEVOCEAN Lodge',
    'tr': '4×4 Olmadan Ponta do Ouro Ziyareti | DEVOCEAN Lodge',
    'pt-BR': 'Visitar Ponta do Ouro Sem 4×4 | DEVOCEAN Lodge',
    'pt-PT': 'Visitar Ponta do Ouro Sem 4×4 | DEVOCEAN Lodge',
    'ru': 'Посещение Понта-ду-Ору Без 4×4 | DEVOCEAN Lodge',
    'sv': 'Besöka Ponta do Ouro Utan 4×4 | DEVOCEAN Lodge',
    'sw': 'Kutembelea Ponta do Ouro Bila 4×4 | DEVOCEAN Lodge',
    'zh-CN': '无需4×4越野车游览蓬塔杜奥罗 | DEVOCEAN Lodge',
    'zu': 'Ukuvakashela iPonta do Ouro Ngaphandle kwe-4×4 | DEVOCEAN Lodge',
  },
};

/**
 * Return the localised meta description string for the home page
 * without touching the DOM. Falls back to en-US if the requested lang
 * has no entry.
 */
export function getHomeDescription(lang = 'en-US') {
  return META_DESCRIPTIONS.home[lang] || META_DESCRIPTIONS.home['en-US'] || '';
}

/**
 * Return the localised OG/Twitter title string for the home page
 * without touching the DOM. Falls back to en-US if the requested lang
 * has no entry.
 */
export function getHomeTitle(lang = 'en-US') {
  return META_TITLES.home[lang] || META_TITLES.home['en-US'] || '';
}

/** Localised title for the Story page. Falls back to en-GB. */
export function getStoryTitle(lang = 'en-GB') {
  return META_TITLES.story[lang] || META_TITLES.story['en-GB'] || '';
}

/** Localised title for the Meals page. Falls back to en-GB. */
export function getMealsTitle(lang = 'en-GB') {
  return META_TITLES.meals[lang] || META_TITLES.meals['en-GB'] || '';
}

/** Localised title for the Ponta do Ouro guide page. Falls back to en-GB. */
export function getPontaDoOuroTitle(lang = 'en-GB') {
  return META_TITLES.pontaDoOuro[lang] || META_TITLES.pontaDoOuro['en-GB'] || '';
}

/** Localised title for the Getting There guide page. Falls back to en-GB. */
export function getGettingThereTitle(lang = 'en-GB') {
  return META_TITLES.gettingThere[lang] || META_TITLES.gettingThere['en-GB'] || '';
}

/** Localised title for the Without 4×4 guide page. Falls back to en-GB. */
export function getWithoutFourByFourTitle(lang = 'en-GB') {
  return META_TITLES.withoutFourByFour[lang] || META_TITLES.withoutFourByFour['en-GB'] || '';
}

/**
 * Return the localised meta description string for an experience page
 * without touching the DOM. Falls back to en-US if the requested lang
 * has no entry.
 */
export function getExperienceDescription(experienceKey, lang = 'en-US') {
  const expDescriptions = META_DESCRIPTIONS.experiences?.[experienceKey];
  if (!expDescriptions) return '';
  return expDescriptions[lang] || expDescriptions['en-US'] || '';
}

export function updateCanonical(url) {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  tag.href = url;
}
