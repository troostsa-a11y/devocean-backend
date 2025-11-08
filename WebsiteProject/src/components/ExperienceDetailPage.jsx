import { useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { EXPERIENCE_DETAILS } from '../data/experienceDetails';
import Footer from './Footer';
import ExperienceInquiryForm from './ExperienceInquiryForm';

export default function ExperienceDetailPage({ units, experiences, ui, lang, currency, bookUrl }) {
  const [match, params] = useRoute('/experiences/:key');
  const experienceKey = params?.key;
  const exp = EXPERIENCE_DETAILS[experienceKey];

  // Update SEO meta tags for each experience
  useEffect(() => {
    if (!exp) return;

    // Capture original values for restoration
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.content || '';
    
    // Capture original OG tag values
    const ogProperties = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
    const originalOgValues = {};
    const createdOgTags = [];
    
    ogProperties.forEach(property => {
      const tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        originalOgValues[property] = tag.content;
      }
    });

    // Update page title
    document.title = `${exp.title} - DEVOCEAN Lodge | Ponta do Ouro, Mozambique`;

    // Update meta description
    if (!metaDescription) {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = `${exp.tagline}. ${exp.overview.substring(0, 140)}...`;
      document.head.appendChild(newMeta);
    } else {
      metaDescription.content = `${exp.tagline}. ${exp.overview.substring(0, 140)}...`;
    }

    // Update Open Graph tags
    const ogTags = [
      { property: 'og:title', content: `${exp.title} - DEVOCEAN Lodge` },
      { property: 'og:description', content: exp.tagline },
      { property: 'og:image', content: `https://devoceanlodge.com${exp.hero}` },
      { property: 'og:url', content: `https://devoceanlodge.com/experiences/${experienceKey}` },
      { property: 'og:type', content: 'website' }
    ];

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
        createdOgTags.push(tag); // Track newly created tags
      }
      tag.content = content;
    });

    // Cleanup: restore all original metadata when component unmounts
    return () => {
      // Restore title
      document.title = originalTitle;
      
      // Restore meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        if (originalDescription) {
          metaDesc.content = originalDescription;
        } else {
          metaDesc.remove();
        }
      }
      
      // Restore or remove OG tags
      ogProperties.forEach(property => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
          if (originalOgValues[property]) {
            tag.content = originalOgValues[property];
          } else if (createdOgTags.includes(tag)) {
            tag.remove(); // Remove tags we created
          }
        }
      });
    };
  }, [exp, experienceKey]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [experienceKey]);

  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Experience Not Found</h1>
          <Link href="/#experiences" className="text-[#9e4b13] hover:underline">
            &larr; Back to Experiences
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
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
              <Link 
                href="/#experiences"
                className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Experiences
              </Link>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                {exp.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl">
                {exp.tagline}
              </p>
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
                  Highlights
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
                    What's Included
                  </h2>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
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
                    Top Dive Sites
                  </h2>
                  <div className="grid gap-4">
                    {exp.topSites.map((site, i) => (
                      <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-slate-100">
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
                    Our Ethical Promise
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {exp.ethicalPractices.map((practice, i) => (
                      <div key={i} className="bg-green-50 rounded-lg p-5 border border-green-100">
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
                    Whale Behaviors You Might See
                  </h2>
                  <div className="space-y-4">
                    {exp.whaleBehaviors.map((behavior, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-5 border border-blue-100">
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
                    Wildlife You'll Encounter
                  </h2>
                  <div className="grid gap-4">
                    {exp.wildlife.map((animal, i) => (
                      <div key={i} className="bg-amber-50 rounded-lg p-5 border border-amber-100">
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">{animal.species}</h3>
                        <p className="text-amber-800">{animal.details}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Target Species (for fishing only) */}
              {exp.targetSpecies && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    Target Species
                  </h2>
                  <div className="grid gap-4">
                    {exp.targetSpecies.map((fish, i) => (
                      <div key={i} className="bg-white rounded-lg p-5 shadow-sm border border-slate-100">
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
                    Surf Spots
                  </h2>
                  <div className="space-y-4">
                    {exp.surfSpots.map((spot, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-5 border border-blue-100">
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
                    Safety Tips
                  </h2>
                  <div className="space-y-4">
                    {exp.safety.map((tip, i) => (
                      <div key={i} className="bg-yellow-50 rounded-lg p-5 border border-yellow-100">
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
                    Insider Tips
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
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Pricing Guide</h3>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-[#9e4b13]">{exp.pricing.range}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      <strong>Note:</strong> Prices shown in USD/MZN/ZAR. Contact operators for current rates in your currency.
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
                      <h4 className="font-semibold text-slate-800 mb-3">Duration</h4>
                      <p className="text-sm font-medium text-slate-700 mb-2">{exp.duration.typical}</p>
                      {exp.duration.details && (
                        <ul className="space-y-1 text-xs text-slate-600">
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
                      <h4 className="font-semibold text-slate-800 mb-3">Level</h4>
                      <p className="text-sm font-medium text-[#9e4b13] mb-2">{exp.requirements.level}</p>
                      {exp.requirements.details && (
                        <ul className="space-y-1 text-xs text-slate-600">
                          {exp.requirements.details.map((detail, i) => (
                            <li key={i}>• {detail}</li>
                          ))}
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
                      Contact the Operators
                    </a>
                  </div>
                </div>
              )}

              {/* Best Time */}
              {exp.bestTime && (
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Best Time to Visit</h3>
                  <p className="text-sm font-semibold text-blue-900 mb-3">{exp.bestTime.peak}</p>
                  {exp.bestTime.details && (
                    <ul className="space-y-2 text-xs text-slate-700">
                      {exp.bestTime.details.map((detail, i) => (
                        <li key={i}>• {detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* What to Bring (for lighthouse only) */}
              {exp.whatToBring && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">What to Bring</h3>
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
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Recommended Operators</h3>
                  <div className="space-y-4">
                    {exp.operators.map((op, i) => (
                      <div key={i} className="pb-4 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <h4 className="font-semibold text-slate-800 mb-1">{op.name}</h4>
                        <p className="text-xs text-slate-600">{op.specialty}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Use the inquiry form below to contact operators directly
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Form Section */}
          {exp.operators && exp.operators.length > 0 && (
            <div id="inquiry-form" className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Contact Operators Directly
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Fill out the form below and we'll forward your inquiry to your preferred operator. They'll contact you directly with availability and pricing.
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
              Ready to Book Your {exp.title} Adventure?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Contact us to arrange your experience or get more information. We're here to help make your Ponta do Ouro adventure unforgettable!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/258844182252?text=Hello%20DEVOCEAN%20Lodge,%20I'm%20interested%20in%20booking%20{exp.title}"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-[#9e4b13] font-semibold py-3 px-8 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors"
              >
                Email Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer units={units} experiences={experiences} ui={ui} />
    </>
  );
}
