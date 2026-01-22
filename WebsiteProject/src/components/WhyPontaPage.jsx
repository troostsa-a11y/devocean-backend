import { useEffect } from 'react';
import { Link } from 'wouter';
import { Waves, Fish, TreePine, Globe, Heart, ArrowRight, MapPin, Anchor } from 'lucide-react';
import Footer from './Footer';

const sections = [
  {
    id: 'beaches',
    icon: Waves,
    title: 'Stunning Beaches and Coastal Beauty',
    content: `Ponta do Ouro boasts picturesque beaches surrounded by casuarina trees, sand dunes, and crystal-clear waters—perfect for unwinding or beach walks. The main beach is pristine, peaceful, and incredibly beautiful, offering a true escape from the city. Unlike more crowded spots, Ponta's raw, unfiltered beauty invites you to slow down and connect with nature.`,
    highlight: 'A true escape from the city'
  },
  {
    id: 'marine',
    icon: Fish,
    title: 'World-Class Marine Adventures',
    content: `Dive into thriving reefs teeming with 1,200+ fish species, bull sharks, hammerheads, mantas, turtles, and resident dolphins. From June to November, spot migrating humpback whales, and enjoy ethical swims with wild dolphins. Protected by the Ponta do Ouro Partial Marine Reserve, these experiences are sustainable and less crowded than other sites.`,
    extra: `Explore underwater with sites from 10m at Crèche to 47m at Atlantis, or try snorkeling, surfing, and fishing for barracuda and kingfish.`,
    highlight: '1,200+ fish species'
  },
  {
    id: 'wildlife',
    icon: TreePine,
    title: 'Proximity to Iconic Wildlife Reserves',
    content: `Ponta do Ouro is the perfect base for "bush-to-beach" escapes, with easy access to South African reserves like Kruger National Park (4-5 hours), Tembe Elephant Park (2 hours), Hluhluwe-iMfolozi (3-4 hours), and iSimangaliso Wetland Park (UNESCO, 3 hours). Spot the Big Five, large-tusked elephants, and over 526 bird species.`,
    extra: `Locally, Maputo National Park (UNESCO World Heritage since 2025, 30km away) offers savannas, dunes, and mangroves with elephants, giraffes, and sea turtles.`,
    highlight: 'Bush-to-beach escapes'
  },
  {
    id: 'culture',
    icon: Globe,
    title: 'Cultural and Scenic Day Trips',
    content: `Venture to eSwatini (3-4 hours) for Mantenga Nature Reserve's hikes and traditional Swazi cultural performances (Sibhaca dances, UNESCO intangible heritage). Explore the Panorama Route (5-6 hours) for Blyde River Canyon and waterfalls, or visit Jane Goodall's Chimp Eden sanctuary (5 hours) for ethical wildlife encounters.`,
    highlight: 'UNESCO intangible heritage'
  },
  {
    id: 'charm',
    icon: Heart,
    title: 'Authentic Mozambican Charm',
    content: `Experience raw ocean adventures, rich local culture, and quirky bars in a non-commercialized setting. Ponta do Ouro is all about authenticity—from vibrant markets to lively music—making it ideal for meaningful escapes.`,
    highlight: 'Non-commercialized authenticity'
  }
];

export default function WhyPontaPage({ ui, lang, currency, bookUrl }) {
  const buildHomeUrl = (hash = '') => {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    if (currency) params.set('cur', currency);
    const queryString = params.toString();
    return queryString ? `/?${queryString}${hash}` : `/${hash}`;
  };

  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.content || '';

    document.title = 'Why Ponta do Ouro? | DEVOCEAN Lodge - Mozambique';
    if (metaDescription) {
      metaDescription.content = 'Discover why Ponta do Ouro is the ultimate Mozambican paradise. Pristine beaches, world-class diving, wildlife reserves, and authentic local culture await at DEVOCEAN Lodge.';
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.content = originalDescription;
      }
    };
  }, []);

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
              alt="Ponta do Ouro coastline"
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
                Back to Lodge
              </Link>
              
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm">Southern Mozambique</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Why Ponta do Ouro?
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
                A hidden gem where pristine beaches meet vibrant marine life and endless adventures
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9e4b13]/10 rounded-full mb-6">
              <Anchor className="w-5 h-5 text-[#9e4b13]" />
              <span className="text-[#9e4b13] font-medium">Gateway to Maputo National Park</span>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              Welcome to Ponta do Ouro, the gateway to Mozambique's first natural UNESCO World Heritage Site—Maputo National Park. 
              This coastal paradise offers an unbeatable blend of relaxation, eco-tourism, and cultural immersion. 
              Whether you're seeking thrilling dives, serene gardens like those at DEVOCEAN Eco Lodge, or day trips to nearby wonders, 
              here's why this destination should be on your travel list.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={section.id}
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
              Ready to Experience Paradise?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              Stay at DEVOCEAN Eco Lodge and discover why Ponta do Ouro is your ultimate Mozambican destination. 
              Eco-friendly comfort amidst these wonders awaits you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={buildHomeUrl('#stay')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#9e4b13] font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                data-testid="link-explore-lodge"
              >
                Explore the Lodge
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <a
                href={bookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/30 transition-colors"
                data-testid="link-book-now"
              >
                Book Now
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer ui={ui} lang={lang} />
    </>
  );
}
