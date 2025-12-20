import LazyImage from './LazyImage';

// Key features for each accommodation type - helps users preview before clicking
const UNIT_FEATURES = {
  safari: ['fan', 'terrace', 'shared'],
  comfort: ['ensuite', 'terrace', 'fan'],
  cottage: ['ac', 'ensuite', 'queen'],
  chalet: ['ac', 'ensuite', 'secluded']
};

// Feature labels with translations
const getFeatureLabel = (feature, lang) => {
  const labels = {
    fan: { en: 'Fan', pt: 'Ventilador', nl: 'Ventilator', fr: 'Ventilateur', it: 'Ventilatore', de: 'Ventilator', es: 'Ventilador', af: 'Waaier', sv: 'Fläkt', pl: 'Wentylator', ja: 'ファン', zh: '风扇', ru: 'Вентилятор', zu: 'Ifeni', sw: 'Feni' },
    terrace: { en: 'Terrace', pt: 'Terraço', nl: 'Terras', fr: 'Terrasse', it: 'Terrazza', de: 'Terrasse', es: 'Terraza', af: 'Terras', sv: 'Terrass', pl: 'Taras', ja: 'テラス', zh: '露台', ru: 'Терраса', zu: 'Iterasi', sw: 'Terasi' },
    shared: { en: 'Shared Bath', pt: 'WC Partilhado', nl: 'Gedeelde Badkamer', fr: 'Salle de bain partagée', it: 'Bagno condiviso', de: 'Gemeinschaftsbad', es: 'Baño compartido', af: 'Gedeelde Bad', sv: 'Delat badrum', pl: 'Wspólna łazienka', ja: '共用バス', zh: '共用浴室', ru: 'Общая ванная', zu: 'Ibhafu elabelwana', sw: 'Bafu ya pamoja' },
    ensuite: { en: 'En-suite', pt: 'WC Privativo', nl: 'Eigen Badkamer', fr: 'Salle de bain privée', it: 'Bagno privato', de: 'Eigenes Bad', es: 'Baño privado', af: 'Privaat Bad', sv: 'Eget badrum', pl: 'Łazienka prywatna', ja: '専用バス', zh: '独立浴室', ru: 'Собственная ванная', zu: 'Ibhafu langasese', sw: 'Bafu ya faragha' },
    ac: { en: 'A/C', pt: 'Ar Condicionado', nl: 'Airco', fr: 'Climatisation', it: 'Aria condizionata', de: 'Klimaanlage', es: 'Aire acondicionado', af: 'Lugversorging', sv: 'AC', pl: 'Klimatyzacja', ja: 'エアコン', zh: '空调', ru: 'Кондиционер', zu: 'I-AC', sw: 'Kiyoyozi' },
    queen: { en: 'Queen Bed', pt: 'Cama Queen', nl: 'Queensize Bed', fr: 'Lit Queen', it: 'Letto Queen', de: 'Queen-Bett', es: 'Cama Queen', af: 'Queen Bed', sv: 'Queen-säng', pl: 'Łóżko Queen', ja: 'クイーンベッド', zh: '大床', ru: 'Двуспальная кровать', zu: 'Umbhede weQueen', sw: 'Kitanda cha Queen' },
    secluded: { en: 'Secluded', pt: 'Isolado', nl: 'Afgelegen', fr: 'Isolé', it: 'Appartato', de: 'Abgeschieden', es: 'Aislado', af: 'Afgesonderd', sv: 'Avskilt', pl: 'Ustronny', ja: '隠れ家', zh: '隐蔽', ru: 'Уединённый', zu: 'Okuhlukanisiwe', sw: 'Faragha' }
  };
  const baseLang = lang?.split('-')[0] || 'en';
  return labels[feature]?.[lang] || labels[feature]?.[baseLang] || labels[feature]?.en || feature;
};

export default function AccommodationsSection({ units, ui, bookUrl, lang, currency }) {
  return (
    <section id="stay" className="bg-slate-50 max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold">{ui.stay.headline}</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            {ui.stay.blurb}
          </p>
        </div>
        <a
          href={`/story.html?lang=${lang}`}
          className={`btn-cta hidden md:inline-flex items-center justify-center w-[15rem] ${lang === 'ru' || lang === 'zu' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-xl bg-[#9e4b13] text-white whitespace-nowrap`}
          aria-label={ui.stay.ourStory}
          data-testid="button-our-story"
        >
          {ui.stay.ourStory}
        </a>
      </div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {units.map((u, idx) => {
          const detailPageMap = {
            safari: '/safari.html',
            comfort: '/comfort.html',
            cottage: '/cottage.html',
            chalet: '/chalet.html'
          };
          const basePath = detailPageMap[u.key];
          const detailPageUrl = basePath ? `${basePath}?lang=${lang}` : null;
          const features = UNIT_FEATURES[u.key] || [];
          
          return (
            <div
              key={u.key}
              className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md bg-white"
            >
              {detailPageUrl ? (
                <a href={detailPageUrl} className="block h-44 overflow-hidden relative">
                  <LazyImage 
                    src={u.img} 
                    alt={u.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    width={400}
                    height={300}
                    aspectRatio="4/3"
                  />
                  {/* Feature badges overlay */}
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {features.map((f) => (
                      <span 
                        key={f}
                        className="px-2 py-0.5 text-xs font-medium bg-white/90 text-slate-700 rounded-full shadow-sm backdrop-blur-sm"
                      >
                        {getFeatureLabel(f, lang)}
                      </span>
                    ))}
                  </div>
                </a>
              ) : (
                <div className="h-44 overflow-hidden">
                  <LazyImage 
                    src={u.img} 
                    alt={u.title} 
                    className="w-full h-full object-cover"
                    width={400}
                    height={300}
                    aspectRatio="4/3"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{u.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{u.short}</p>
                {detailPageUrl && (
                  <a 
                    href={detailPageUrl}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-[#9e4b13] hover:text-[#8a4211] font-semibold transition-colors"
                    data-testid={`link-details-${u.key}`}
                  >
                    <span>{u.title} – {ui.stay.moreDetails}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-promotion to Experiences */}
      <div className="mt-10 p-6 bg-gradient-to-r from-[#fffaf6] to-[#fff5eb] rounded-2xl border border-[#9e4b13]/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{ui.experiences.headline}</h3>
            <p className="text-sm text-slate-600 mt-1">{ui.experiences.blurb}</p>
          </div>
          <a
            href="#experiences"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9e4b13] text-white hover:bg-[#8a4211] transition-colors whitespace-nowrap"
            data-testid="link-explore-experiences"
          >
            {ui.nav.experiences}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
