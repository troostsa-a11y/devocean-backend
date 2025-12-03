// Surf Boards & Lessons experience content translations
// English only for now - translations to be added later

export const SURFING_CONTENT = {
  en: {
    title: "Surf Boards & Lessons",
    tagline: "Ride the iconic Ponta do Ouro point break",
    overview: "Ponta do Ouro's classic right-hand point break can deliver epic rides of 100-200m, and up to 1km in perfect conditions - rivaling Jeffrey's Bay. The warm, crystal-clear waters and consistent swells make it ideal for surfers of all levels, from beginners learning on gentle beach breaks to experts carving the point.",
    highlights: [
      "Classic right-hand point break",
      "100-200m rides (up to 1km when perfect!)",
      "Warm water (22-28°C) - wetsuit optional",
      "Beginner-friendly beach breaks",
      "Uncrowded lineups",
      "Surf lessons & board rentals available",
      "Dolphins surfing alongside you",
      "Crystal-clear Indian Ocean water"
    ],
    pricingRange: "From US$20 (lesson)",
    pricingDetails: [
      "Surf lesson (2 hours): US$20-40",
      "Board rental (full day): US$15-25",
      "Multi-day packages: Discounted rates",
      "Equipment included in lessons",
      "Softboards for beginners",
      "Shortboards/funboards for experienced"
    ],
    durationTypical: "2 hours (lesson) or flexible (rental)",
    durationDetails: [
      "Beginner lesson: 2 hours (theory + practice)",
      "Private coaching: 1-2 hours",
      "Board rental: Half-day or full-day",
      "Best surf: Early morning (6-9 AM)",
      "Afternoon sessions: 3-6 PM"
    ],
    included: [
      "Surf board (lesson or rental)",
      "Wetsuit/rash guard (if needed)",
      "One-on-one or small group instruction",
      "Safety briefing & ocean awareness",
      "Wax & leash",
      "Beach setup assistance",
      "Photos of your session (some operators)"
    ],
    requirementsLevel: "All levels welcome",
    requirementsDetails: [
      "Beginners: No experience needed",
      "Intermediate/Advanced: Point break experience helpful",
      "Swimming ability required",
      "All ages (children to adults)",
      "Fitness: Moderate (paddling can be tiring)",
      "**Important:** Heavy rips along point - be cautious!"
    ],
    bestTimePeak: "South swell with west wind",
    bestTimeDetails: [
      "**Best Swell:** South swell",
      "**Best Wind:** West wind (offshore)",
      "**Best Tide:** Either side of low tide",
      "**Consistency:** Good but fickle - needs right conditions",
      "**Seasons:** Year-round surfable",
      "**Water Temp:** 22-28°C (shorty or boardshorts)",
      "**Chase swells from South Africa's North Coast for best sessions**"
    ],
    tips: [
      "Check surf forecast before booking (Surfline, Magicseaweed)",
      "Point break can rival J-Bay but needs perfect conditions",
      "Bring backup boards & extra fins/leashes - limited shops",
      "Respect heavy rips - be patient with tides",
      "Soft-top longboards ideal for beginners on beach breaks",
      "Dolphins often surf alongside - magical experience!",
      "Water is warm but bring shorty wetsuit for wind protection",
      "Ask locals about current swell & conditions",
      "Uncrowded lineups = more waves for you!",
      "Combine with diving, fishing when surf is flat"
    ],
    operators: [
      {
        name: "Brasukas Bar & Surf",
        website: "",
        email: "brasukas.geral@gmail.com",
        specialty: "Surf lessons, board rentals & beachfront bar"
      }
    ]
  }
};

export function getSurfingContent(lang) {
  return SURFING_CONTENT[lang] || SURFING_CONTENT['en'];
}
