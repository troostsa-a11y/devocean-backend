import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { Waves, Fish, TreePine, Globe, Heart, ArrowRight, MapPin, Anchor } from 'lucide-react';
import Footer from './Footer';
import { WHY_PONTA_CONTENT } from '../i18n/content/whyPontaContent';

const sectionIcons = {
  beaches: Waves,
  marine: Fish,
  wildlife: TreePine,
  culture: Globe,
  charm: Heart
};

export default function WhyPontaPage({ units, experiences, ui, lang, currency, bookUrl }) {
  const content = useMemo(() => {
    const langCode = lang?.split('-')[0] || 'en';
    return WHY_PONTA_CONTENT[langCode] || WHY_PONTA_CONTENT.en;
  }, [lang]);

  const buildHomeUrl = (hash = '') => {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    if (currency) params.set('currency', currency);
    const queryString = params.toString();
    return queryString ? `/?${queryString}${hash}` : `/${hash}`;
  };

  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.content || '';
    
    const ogProperties = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
    const originalOgValues = {};
    const createdOgTags = [];
    
    ogProperties.forEach(property => {
      const tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        originalOgValues[property] = tag.content;
      }
    });

    document.title = content.pageTitle;
    if (metaDescription) {
      metaDescription.content = content.metaDescription;
    }
    
    const ogTags = [
      { property: 'og:title', content: content.ogTitle },
      { property: 'og:description', content: content.ogDescription },
      { property: 'og:image', content: 'https://devoceanlodge.com/photos/hero02.jpg' },
      { property: 'og:url', content: 'https://devoceanlodge.com/why-ponta' },
      { property: 'og:type', content: 'website' }
    ];

    ogTags.forEach(({ property, content: tagContent }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
        createdOgTags.push(tag);
      }
      tag.content = tagContent;
    });

    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.content = originalDescription;
      }
      
      ogProperties.forEach(property => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
          if (originalOgValues[property]) {
            tag.content = originalOgValues[property];
          } else if (createdOgTags.includes(tag)) {
            tag.remove();
          }
        }
      });
    };
  }, [content]);

  return (
    <>
      <div className="min-h-screen bg-[#fffaf6]">
        {/* Hero Section */}
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <picture>
            <source media="(max-width: 800px)" srcSet="/photos/hero02-mobile.webp" type="image/webp" />
            <source media="(min-width: 801px)" srcSet="/photos/hero02.webp" type="image/webp" />
            <img
              src="/photos/hero02.jpg"
              alt={content.imageAlt}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
              <Link 
                href={buildHomeUrl()}
                className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
                data-testid="link-back-home"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {content.backToHome}
              </Link>
              
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm">{content.locationLabel}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {content.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
                {content.heroSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9e4b13]/10 rounded-full mb-6">
              <Anchor className="w-5 h-5 text-[#9e4b13]" />
              <span className="text-[#9e4b13] font-medium">{content.badgeLabel}</span>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              {content.introText}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16" data-testid="why-ponta-sections">
            {content.sections.map((section, index) => {
              const Icon = sectionIcons[section.id];
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={section.id}
                  data-testid={`section-${section.id}`}
                  className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
                >
                  {/* Icon Card */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#9e4b13] to-[#7a3a0f] flex items-center justify-center shadow-xl">
                      <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                        {section.title}
                      </h2>
                      {section.highlight && (
                        <span className="hidden sm:inline-flex px-3 py-1 bg-[#9e4b13]/10 text-[#9e4b13] text-sm font-medium rounded-full whitespace-nowrap">
                          {section.highlight}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {section.content}
                    </p>
                    
                    {section.extra && (
                      <p className="text-slate-600 leading-relaxed italic border-l-4 border-[#9e4b13]/30 pl-4">
                        {section.extra}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-br from-[#9e4b13] to-[#7a3a0f] rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {content.ctaTitle}
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              {content.ctaDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={buildHomeUrl('#stay')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#9e4b13] font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                data-testid="link-explore-lodge"
              >
                {content.ctaAccommodations}
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a
                href={bookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/30 transition-colors"
                data-testid="link-book-now"
              >
                {content.ctaBookNow}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer units={units} experiences={experiences} ui={ui} lang={lang} />
    </>
  );
}
