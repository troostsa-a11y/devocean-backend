// Ocean Seafaris experience content translations
// English only for now - translations to be added later

export const SEAFARI_CONTENT = {
  en: {
    title: "Ocean Seafaris",
    tagline: "Whale watching & marine life encounters",
    overview: "Embark on thrilling ocean safaris to witness humpback whales migrating through Mozambican waters (July-November). These boat-based adventures also offer year-round dolphin encounters, seasonal whale shark sightings, and snorkeling over pristine reefs teeming with marine life.",
    highlights: [
      "30,000 humpback whales (July-November)",
      "Breaching, tail-slapping & spy-hopping",
      "Year-round dolphin encounters",
      "Whale sharks (October-March)",
      "Manta rays & sea turtles",
      "Pristine reef snorkeling",
      "Marine biologist-led tours",
      "Research & conservation focus"
    ],
    pricingRange: "$40-45 USD per person",
    pricingDetails: [
      "Whale watching only: ~$40 USD (2,500 MZN)",
      "Combined dolphin + whale: ~$45 USD (2,750 MZN)",
      "Full-day private tour from Maputo: $179 USD",
      "Children under 12: Discounted rates",
      "Equipment & snacks included"
    ],
    durationTypical: "2-3 hours",
    durationDetails: [
      "Half-day excursions: 2-3 hours",
      "Full-day tours: 6-8 hours (from Maputo)",
      "Morning departures (best conditions)",
      "Includes snorkeling time",
      "Flexible based on whale activity"
    ],
    included: [
      "Boat transport with experienced skipper",
      "Snorkel equipment (mask, fins, snorkel)",
      "Marine biologist guide (most operators)",
      "Snacks & refreshments",
      "Marine park fees",
      "Photos/videos (some operators)",
      "Safety equipment & life jackets"
    ],
    requirementsLevel: "All ages",
    requirementsDetails: [
      "No special skills required for whale watching",
      "Swimming ability needed for snorkeling",
      "Ages: Suitable for families (young children to elderly)",
      "Weather dependent - seas must be calm",
      "Tours may be rescheduled if unsafe conditions",
      "Warm jacket recommended (July-September)"
    ],
    bestTimePeak: "July - October (Whale Season)",
    bestTimeDetails: [
      "**Humpback Whales:** July-November (peak: July-Oct)",
      "**Dolphins:** Year-round (200+ residents)",
      "**Whale Sharks:** October-March",
      "**Manta Rays:** December-May",
      "**Sea Turtles:** October-March (nesting)",
      "**Calmest Seas:** Winter months (June-September)"
    ],
    tips: [
      "Book during whale season (July-Nov) for best chances",
      "Bring warm jacket - ocean breeze can be cold",
      "Waterproof camera bag essential",
      "Seasickness medication if prone to motion sickness",
      "Binoculars enhance whale watching experience",
      "Ethical operators follow no-touch guidelines",
      "Sightings not guaranteed - wild animals",
      "Combine with snorkeling for full marine experience"
    ],
    operators: [
      {
        name: "The Dolphin Centre",
        website: "https://thedolphincentre.com/",
        email: "info@thedolphincentre.com",
        specialty: "Whale watching experts, July-November focus"
      },
      {
        name: "Dolphin Encountours",
        website: "https://www.dolphinencountours.org/",
        email: "info@dolphinencountours.org",
        specialty: "Research-based tours, data collection for conservation"
      },
      {
        name: "Ponta Ventura",
        website: "https://www.pontaventura.com/",
        email: "info@pontaventura.com",
        specialty: "Affordable local pricing, Ponta Malongane based"
      }
    ]
  }
};

export function getSeafariContent(lang) {
  return SEAFARI_CONTENT[lang] || SEAFARI_CONTENT['en'];
}
