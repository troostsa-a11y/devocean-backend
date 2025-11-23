// Scuba Diving experience content translations
// English only for now - translations to be added later

export const DIVING_CONTENT = {
  en: {
    title: "Scuba Diving",
    tagline: "Explore pristine reefs with bull sharks, mantas & whale sharks",
    overview: "Ponta do Ouro offers world-class scuba diving with 20+ dive sites ranging from shallow reefs to deep pinnacles. The crystal-clear waters of the Mozambique Channel provide exceptional visibility and encounters with an incredible diversity of marine life, including 19 species of sharks.",
    highlights: [
      "20+ dive sites from 8m to 48m depth",
      "Bull sharks, tiger sharks & hammerheads",
      "Whale sharks (October-March)",
      "Humpback whales (July-November)",
      "Manta rays, turtles & dolphins",
      "180+ species of nudibranchs",
      "Pristine coral reefs",
      "Professional PADI centers"
    ],
    pricingRange: "From $40 USD per dive",
    pricingDetails: [
      "Single dive: $40-50 USD",
      "Two-dive package: $75-90 USD",
      "PADI Open Water: $350-400 USD",
      "Equipment rental included",
      "All licenses & permits included"
    ],
    durationTypical: "Half-day or full-day trips",
    durationDetails: [
      "Morning dives: 2 dives (3-4 hours)",
      "Full day: 3 dives (6-8 hours)",
      "Beach launch (surf launch - adventurous!)",
      "Sites 1-12km from shore"
    ],
    included: [
      "All diving equipment (BCD, regulator, wetsuit)",
      "Boat transport to dive sites",
      "Professional PADI dive master/instructor",
      "Marine park fees",
      "Post-dive snacks & refreshments",
      "Dive computer & safety equipment"
    ],
    requirementsLevel: "Beginner to Advanced",
    requirementsDetails: [
      "Beginner sites: Crèche, Doodles, Playground (10-18m)",
      "Advanced sites: Pinnacles, Atlantis, Cloudbreak (28-48m)",
      "PADI certification required (or do Open Water course)",
      "Medical questionnaire required",
      "Good swimming ability",
      "Minimum age: 10 years (Junior Open Water)"
    ],
    bestTimePeak: "October - April (Summer)",
    bestTimeDetails: [
      "**Bull & Tiger Sharks:** November-April (26-29°C water)",
      "**Hammerhead Sharks:** April-October (better visibility)",
      "**Whale Sharks:** October-March",
      "**Humpback Whales:** July-November",
      "**Best Visibility:** May-August (20-30m)",
      "**Warmest Water:** December-February (27-29°C)"
    ],
    tips: [
      "Book early during peak season (December-January)",
      "Bring your certification card",
      "Consider a wetsuit (3mm recommended)",
      "Surf launch can be exciting - be prepared to get wet!",
      "Most operators offer gear rental if needed",
      "Multi-dive packages offer best value"
    ],
    operators: [
      {
        name: "Gozo Azul",
        website: "https://gozo-azul.co.za/",
        email: "info@gozo-azul.co.za",
        specialty: "PADI 5-star center, shark diving specialists"
      },
      {
        name: "Back to Basics Adventures",
        website: "http://www.backtobasicsadventures.com/",
        email: "info@backtobasicsadventures.com",
        specialty: "Shark diving specialists, research-focused"
      }
    ]
  }
};

export function getDivingContent(lang) {
  return DIVING_CONTENT[lang] || DIVING_CONTENT['en'];
}
