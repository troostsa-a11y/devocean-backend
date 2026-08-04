import { useEffect, useLayoutEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { EXPERIENCE_DETAILS } from '../data/experienceDetails';
import Footer from './Footer';
import ExperienceInquiryForm from './ExperienceInquiryForm';
import { getExpText } from '../i18n/experiencePageTranslations';
import { useSeoPage, getExperienceDescription } from '../utils/seoMeta';
import MarinPanel from './MarinPanel';

// Dynamic content loaders - each experience content is loaded on demand
const contentLoaders = {
  dolphins: () => import('../i18n/content/dolphinsContent.js'),
  diving: () => import('../i18n/content/divingContent.js'),
  seafari: () => import('../i18n/content/seafariContent.js'),
  safari: () => import('../i18n/content/safariContent.js'),
  fishing: () => import('../i18n/content/fishingContent.js'),
  surfing: () => import('../i18n/content/surfingContent.js')
};

// Map experience keys to their content getter function names
const contentGetterNames = {
  dolphins: 'getDolphinsContent',
  diving: 'getDivingContent',
  seafari: 'getSeafariContent',
  safari: 'getSafariContent',
  fishing: 'getFishingContent',
  surfing: 'getSurfingContent'
};

export default function ExperienceDetailPage({ units, experiences, ui, lang, currency }) {
  const [match, params] = useRoute('/experiences/:key');
  const experienceKey = params?.key;
  const [contentModule, setContentModule] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  
  // Get base experience data (hero image, etc.)
  const baseExp = EXPERIENCE_DETAILS[experienceKey];
  
  // Load content module dynamically when experienceKey changes
  useEffect(() => {
    let cancelled = false;
    setIsLoadingContent(true);
    
    const loader = contentLoaders[experienceKey];
    if (loader) {
      loader().then((mod) => {
        if (!cancelled) {
          setContentModule(mod);
          setIsLoadingContent(false);
        }
      }).catch(() => {
        if (!cancelled) {
          setContentModule(null);
          setIsLoadingContent(false);
        }
      });
    } else {
      // No content loader for this experience (e.g., lighthouse)
      setContentModule(null);
      setIsLoadingContent(false);
    }
    
    return () => { cancelled = true; };
  }, [experienceKey]);
  
  // Get the content getter function from the loaded module
  const getContent = contentModule ? contentModule[contentGetterNames[experienceKey]] : null;
  
  // Merge with translated content if available; otherwise use base data.
  // operators is always taken from baseExp — content modules translate descriptive
  // text but operator names are proper nouns that must stay in English so they
  // match the server-side allowlist exactly (translated names would be rejected).
  const exp = getContent
    ? {
        ...baseExp,
        ...getContent(lang),
        operators: baseExp?.operators,
        // Restructure nested data to match existing component expectations
        pricing: baseExp?.pricing ? {
          range: getContent(lang).pricingRange,
          details: getContent(lang).pricingDetails
        } : undefined,
        duration: baseExp?.duration ? {
          typical: getContent(lang).durationTypical,
          details: getContent(lang).durationDetails
        } : undefined,
        requirements: baseExp?.requirements ? {
          level: getContent(lang).requirementsLevel,
          details: getContent(lang).requirementsDetails
        } : undefined,
        bestTime: baseExp?.bestTime ? {
          peak: getContent(lang).bestTimePeak,
          details: getContent(lang).bestTimeDetails
        } : undefined
      }
    : baseExp;
  
  // Build a home URL carrying the visitor's language and currency
  // Clean-URL policy: internal links are bare — language/currency come from
  // the stored preferences (site.lang / site.currency), never from the URL.
  const buildHomeUrl = (hash = '') => `/${hash}`;

  // SEO meta tags for this experience page — delegated to the shared hook
  const expPageUrl = exp ? `https://devoceanlodge.com/experiences/${experienceKey}` : undefined;
  const expHeroImage = exp ? `https://devoceanlodge.com${exp.hero}` : undefined;
  const expOgTitle = exp ? `${exp.title} - DEVOCEAN Lodge` : undefined;
  useSeoPage({
    title: exp ? `${exp.title} - DEVOCEAN Lodge | Ponta do Ouro, Mozambique` : undefined,
    description: exp ? getExperienceDescription(experienceKey, lang) : undefined,
    canonical: expPageUrl,
    ogTitle: expOgTitle,
    ogDescription: exp?.tagline,
    ogImage: expHeroImage,
    ogUrl: expPageUrl,
    ogType: exp ? 'website' : undefined,
    twitterTitle: expOgTitle,
    twitterDescription: exp?.tagline,
    twitterImage: expHeroImage,
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [experienceKey]);

  // Remove the static hero placeholder (index.html #exp-hero-placeholder) once
  // the real hero has rendered. useLayoutEffect (not useEffect) so the removal
  // happens before paint — no one-frame flash of placeholder + real hero.
  useLayoutEffect(() => {
    document.getElementById('exp-hero-placeholder')?.remove();
  }, []);


  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">{getExpText('notFound', lang)}</h1>
          <Link href={buildHomeUrl('#experiences')} className="text-[#9e4b13] hover:underline">
            &larr; {getExpText('backToExperiences', lang)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#fffaf6]">
        {/* Hero Section */}
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <img
            src={exp.hero}
            alt={exp.title}
            className={`w-full h-full object-cover ${exp.heroObjectClass || ''}`}
            fetchpriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
              <Link 
                href={buildHomeUrl('#experiences')}
                className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {getExpText('backToExperiences', lang)}
              </Link>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                {exp.title}
              </h1>
              <p className="text-lg md:text-xl text-white/95 max-w-3xl mb-6">
                {exp.tagline}
              </p>

              {/* Hero CTAs — visible immediately on landing, no scroll required */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="#inquiry-form"
                  data-testid="button-hero-enquire"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/60 text-white font-semibold py-2.5 px-5 rounded-lg text-sm shadow-md"
                >
                  {getExpText('contactOperators', lang)}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Overview */}
          <section className="mb-12">
            <p className="text-lg text-slate-700 leading-relaxed">
              {exp.overview}
            </p>
          </section>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Highlights */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                  {getExpText('highlights', lang)}
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {exp.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-[#9e4b13] mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* What's Included */}
              {exp.included && exp.included.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('whatsIncluded', lang)}
                  </h2>
                  <div className="bg-white rounded-xl p-6 border border-slate-100 cursor-default select-text" data-testid="info-whats-included">
                    <ul className="space-y-3">
                      {exp.included.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Top Dive Sites (for diving only) */}
              {exp.topSites && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('topDiveSites', lang)}
                  </h2>
                  <div className="grid gap-4">
                    {exp.topSites.map((site, i) => (
                      <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-slate-100 cursor-default select-text" data-testid={`info-dive-site-${i}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">{site.name}</h3>
                          <span className="text-sm font-medium text-[#9e4b13] bg-[#9e4b13]/10 px-3 py-1 rounded-full">
                            {site.depth}
                          </span>
                        </div>
                        <p className="text-slate-600">{site.highlights}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Ethical Practices (for dolphins only) */}
              {exp.ethicalPractices && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('ourEthicalPromise', lang)}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {exp.ethicalPractices.map((practice, i) => (
                      <div key={i} className="bg-green-50 rounded-lg p-5 border border-green-100 cursor-default select-text" data-testid={`info-ethical-${i}`}>
                        <h3 className="text-lg font-semibold text-green-900 mb-2">{practice.title}</h3>
                        <p className="text-green-800 text-sm">{practice.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Whale Behaviors (for seafari only) */}
              {exp.whaleBehaviors && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('whaleBehaviors', lang)}
                  </h2>
                  <div className="space-y-4">
                    {exp.whaleBehaviors.map((behavior, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-5 border border-blue-100 cursor-default select-text" data-testid={`info-whale-behavior-${i}`}>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">{behavior.name}</h3>
                        <p className="text-blue-800">{behavior.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Wildlife (for safari only) */}
              {exp.wildlife && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('wildlife', lang)}
                  </h2>
                  <div className="grid gap-4">
                    {exp.wildlife.map((animal, i) => (
                      <div key={i} className="bg-amber-50 rounded-lg p-5 border border-amber-100 cursor-default select-text" data-testid={`info-wildlife-${i}`}>
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">{animal.species}</h3>
                        <p className="text-amber-800">{animal.details}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Park Brochure Download (for safari only) */}
              {exp.brochure && (
                <section data-testid="brochure-section">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {exp.brochure.title}
                  </h2>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                    <p className="text-slate-700 mb-4">{exp.brochure.description}</p>
                    <a
                      href={['pt', 'pt-PT', 'pt-BR'].includes(lang) ? '/downloads/maputo-national-park-brochure-pt.pdf' : '/downloads/maputo-national-park-brochure-en.pdf'}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                      data-testid="brochure-download-link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exp.brochure.downloadText}
                      <span className="text-green-200 text-sm ml-1">({exp.brochure.fileSize})</span>
                    </a>
                  </div>
                </section>
              )}

              {/* Target Species (for fishing only) */}
              {exp.targetSpecies && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('targetSpecies', lang)}
                  </h2>
                  <div className="grid gap-4">
                    {exp.targetSpecies.map((fish, i) => (
                      <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-slate-100 cursor-default select-text" data-testid={`info-fish-${i}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">{fish.name}</h3>
                          <span className="text-sm text-[#9e4b13] font-medium">{fish.season}</span>
                        </div>
                        <p className="text-slate-600 text-sm">{fish.technique}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Surf Spots (for surfing only) */}
              {exp.surfSpots && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('surfSpots', lang)}
                  </h2>
                  <div className="space-y-4">
                    {exp.surfSpots.map((spot, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-5 border border-blue-100 cursor-default select-text" data-testid={`info-surf-spot-${i}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-blue-900">{spot.name}</h3>
                          <span className="text-sm text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full">
                            {spot.level}
                          </span>
                        </div>
                        <p className="text-blue-800">{spot.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Safety (for lighthouse only) */}
              {exp.safety && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('safetyTips', lang)}
                  </h2>
                  <div className="space-y-4">
                    {exp.safety.map((tip, i) => (
                      <div key={i} className="bg-yellow-50 rounded-lg p-5 border border-yellow-100 cursor-default select-text" data-testid={`info-safety-${i}`}>
                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">{tip.title}</h3>
                        <p className="text-yellow-800">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tips */}
              {exp.tips && exp.tips.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    {getExpText('insiderTips', lang)}
                  </h2>
                  <div className="bg-[#9e4b13]/5 rounded-xl p-6 border border-[#9e4b13]/10">
                    <ul className="space-y-3">
                      {exp.tips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-[#9e4b13] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                          </svg>
                          <span className="text-slate-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Pricing */}
              {exp.pricing && (
                <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 sticky top-24">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{getExpText('pricingGuide', lang)}</h3>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-[#9e4b13]">{exp.pricing.range}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      <strong>{getExpText('note', lang)}</strong> {getExpText('priceNote', lang)}{' '}
                      <a 
                        href={`https://fx-rate.net/calculator/?c_input=USD&cp_input=${currency || 'USD'}&amount_from=32`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#9e4b13] hover:text-[#8a4211] font-semibold underline"
                      >
                        {getExpText('currencyConverter', lang)}
                      </a>
                    </p>
                  </div>
                  {exp.pricing.details && (
                    <ul className="space-y-2 text-sm text-slate-600">
                      {exp.pricing.details.map((detail, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#9e4b13] mr-2">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Duration */}
                  {exp.duration && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-3">{getExpText('duration', lang)}</h4>
                      <p className="text-sm font-medium text-slate-700 mb-2">{exp.duration.typical}</p>
                      {exp.duration.details && (
                        <ul className="space-y-1 text-sm text-slate-600">
                          {exp.duration.details.map((detail, i) => (
                            <li key={i}>• {detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Requirements */}
                  {exp.requirements && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-3">{getExpText('level', lang)}</h4>
                      <p className="text-sm font-medium text-[#9e4b13] mb-2">{exp.requirements.level}</p>
                      {exp.requirements.details && (
                        <ul className="space-y-1 text-sm text-slate-600">
                          {exp.requirements.details.map((detail, i) => {
                            const parts = detail.split('**');
                            return (
                              <li key={i}>
                                {parts.length === 3 ? (
                                  <>• <strong>{parts[1]}</strong>{parts[2]}</>
                                ) : (
                                  `• ${detail}`
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Contact Button */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <a
                      href="#inquiry-form"
                      className="block w-full bg-[#9e4b13] hover:bg-[#8a4211] text-white text-center font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {getExpText('contactOperators', lang)}
                    </a>
                  </div>
                </div>
              )}

              {/* Best Time */}
              {exp.bestTime && (
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{getExpText('bestTimeToVisit', lang)}</h3>
                  {exp.bestTime.details && (
                    <ul className="space-y-2 text-sm text-slate-700">
                      {exp.bestTime.details.map((detail, i) => {
                        const parts = detail.split('**');
                        return (
                          <li key={i}>
                            {parts.length === 3 ? (
                              <>• <strong>{parts[1]}</strong>{parts[2]}</>
                            ) : (
                              `• ${detail}`
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* What to Bring (for lighthouse only) */}
              {exp.whatToBring && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{getExpText('whatToBring', lang)}</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {exp.whatToBring.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-4 h-4 text-[#9e4b13] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Operators */}
              {exp.operators && exp.operators.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{getExpText('recommendedOperators', lang)}</h3>
                  <div className="space-y-4">
                    {exp.operators.map((op, i) => (
                      <div key={i} className="pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <h4 className="font-semibold text-slate-800 mb-1">{op.name}</h4>
                        <p className="text-sm text-slate-600">{op.specialty}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Form Section */}
          {exp.operators && exp.operators.length > 0 && (
            <div id="inquiry-form" className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  {getExpText('contactOperatorsDirectly', lang)}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  {getExpText('formDescription', lang)}
                </p>
              </div>
              <ExperienceInquiryForm 
                experience={exp}
                operators={exp.operators}
                lang={lang}
                currency={currency}
              />
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 bg-gradient-to-r from-[#9e4b13] to-[#b65a1a] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getExpText('readyToBook', lang, { title: exp.title })}
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              {(() => {
                const ctaMap = {
                  dolphins: 'dolphinsCta',
                  diving: 'divingCta',
                  seafari: 'seafariCta',
                  safari: 'safariCta',
                  fishing: 'fishingCta',
                  surfing: 'surfingCta'
                };
                return getExpText(ctaMap[experienceKey] || 'generalCta', lang);
              })()}
            </p>
            <div className="flex justify-center">
              <MarinPanel context={`Experience page: ${exp.title}`} labelClassName="text-white/80" />
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <Footer units={units} experiences={experiences} ui={ui} lang={lang} />
    </>
  );
}
