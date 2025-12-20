import LazyImage from './LazyImage';

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
          
          return (
            <div
              key={u.key}
              className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md bg-white"
            >
              {detailPageUrl ? (
                <a href={detailPageUrl} className="block h-44 overflow-hidden">
                  <LazyImage 
                    src={u.img} 
                    alt={u.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    width={400}
                    height={300}
                    aspectRatio="4/3"
                  />
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
