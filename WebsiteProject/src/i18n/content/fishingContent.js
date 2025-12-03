// Beach & Deep Sea Fishing experience content translations
// English only for now - translations to be added later

export const FISHING_CONTENT = {
  en: {
    title: "Beach & Deep Sea Fishing",
    tagline: "Cast for kingfish or chase marlin in the Mozambique Channel",
    overview: "Ponta do Ouro offers exceptional fishing both from the beach and offshore. The warm Indian Ocean waters and deep Mozambique Channel provide thrilling opportunities for marlin, sailfish, wahoo, yellowfin tuna, and king mackerel. Beach anglers can target kingfish, barracuda, and pompano from pristine shores.",
    highlights: [
      "Black marlin (October-January)",
      "Sailfish (June-September)",
      "Yellowfin tuna & wahoo",
      "King mackerel (Couta)",
      "Shore fishing for kingfish & barracuda",
      "Clear, warm Indian Ocean waters",
      "Beach launch charters (dry launch)",
      "Expert local skippers with 20+ years"
    ],
    pricingRange: "From US$550 (charter)",
    pricingDetails: [
      "5-hour charter: US$550-650",
      "8-hour charter: US$850-950",
      "Full-day deep sea: US$1,000+",
      "Beach fishing: Free (bring own gear)",
      "Guided shore fishing: US$50-100",
      "All licenses, equipment & filleting included in charters"
    ],
    durationTypical: "5-8 hours (charter)",
    durationDetails: [
      "Half-day charter: 5 hours",
      "Full-day charter: 8-10 hours",
      "Beach fishing: Flexible (best at dawn/dusk)",
      "Early morning departures (6-7 AM)",
      "Fast access to deep water (minutes from shore)"
    ],
    included: [
      "All fishing tackle & equipment",
      "Fishing licenses & permits",
      "Experienced skipper (20+ years)",
      "Bait & lures",
      "Fish cleaning & filleting",
      "Vacuum packaging for travel",
      "Drinks & snacks (most operators)",
      "Safety equipment"
    ],
    requirementsLevel: "Beginner to Expert",
    requirementsDetails: [
      "No experience required (guides assist)",
      "Maximum 6 anglers per boat (typically)",
      "Beach launch - expect to get wet!",
      "Sun protection essential",
      "Swimming ability recommended",
      "Seasickness medication if prone"
    ],
    bestTimePeak: "October - January (Marlin Season)",
    bestTimeDetails: [
      "**Black Marlin:** October-January (peak season)",
      "**Blue Marlin:** Year-round",
      "**Sailfish:** June-September (prime time)",
      "**Wahoo & Tuna:** Year-round (peak: Oct-April)",
      "**King Mackerel:** Year-round (best: April-November)",
      "**Water Temp:** 22-28°C (warmer = more pelagics)"
    ],
    tips: [
      "Book marlin season (Oct-Jan) well in advance",
      "Beach fishing best at sunrise & sunset",
      "Rocky point at beach end offers deep water for shore casts",
      "Walk north to Ponta Mamoli for better shore fishing",
      "Use artificial lures: pink dusters, redeye, chokka",
      "Bring waterproof bags for electronics & valuables",
      "Arrange fish storage with your lodge",
      "Catch & release encouraged for billfish conservation"
    ],
    operators: [
      {
        name: "Gozo Azul Fishing",
        website: "",
        email: "info@gozoazulmarine.com",
        specialty: "Game fishing specialists"
      },
      {
        name: "Mozambique Fishing Charters",
        website: "",
        email: "info@mozambiquefishincharters.co.za",
        specialty: "Multi-day packages, fully equipped boats"
      }
    ]
  }
};

export function getFishingContent(lang) {
  return FISHING_CONTENT[lang] || FISHING_CONTENT['en'];
}
