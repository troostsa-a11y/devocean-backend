// Game Safaris experience content translations
// English only for now - translations to be added later

export const SAFARI_CONTENT = {
  en: {
    title: "Game Safaris",
    tagline: "Bush adventures in Maputo Special Reserve",
    overview: "Discover African wildlife just a short drive from Ponta do Ouro. Maputo National Park (formerly Maputo Special Reserve) offers classic game viewing with 450-500 coastal elephants, giraffes, zebras, hippos, crocodiles, and diverse antelope species across 1,718 km² of protected wilderness - a UNESCO World Heritage Site since 2025.",
    highlights: [
      "450-500 coastal elephants",
      "Giraffes, zebras & antelopes",
      "Hippos & crocodiles in wetlands",
      "Leopard, cheetah & spotted hyena",
      "300+ bird species including flamingos",
      "4x4 game drives with expert guides",
      "UNESCO World Heritage Site (2025)",
      "Beach & bush combo possible"
    ],
    pricingRange: "From US$95 per person",
    pricingDetails: [
      "Day safari: US$95-120 per person",
      "Full-day with Ponta do Ouro beach: US$100-130",
      "2-3 day camping safari: From US$200",
      "Private tours: Custom pricing",
      "4x4 vehicle, guide & park fees included"
    ],
    durationTypical: "5-8 hours (day trip)",
    durationDetails: [
      "Half-day game drive: 3-4 hours",
      "Full-day safari: 5-6 hours in park + transport",
      "Multi-day camping: 2-3 days",
      "Depart Ponta do Ouro: Early morning (6-7 AM)",
      "Return: Late afternoon (4-5 PM)"
    ],
    included: [
      "4x4 game drive vehicle",
      "Professional guide/driver",
      "Marine park entrance fees",
      "Binoculars for wildlife viewing",
      "Bottled water & snacks",
      "Hotel pickup from Ponta do Ouro",
      "USB charging in vehicle (most operators)"
    ],
    requirementsLevel: "All ages & fitness levels",
    requirementsDetails: [
      "No special fitness required",
      "Suitable for families with children",
      "Elderly-friendly (vehicle-based viewing)",
      "4x4 vehicle mandatory (thick sand tracks)",
      "Comfortable safari clothing recommended",
      "Sun protection essential"
    ],
    bestTimePeak: "July - October (Dry Season)",
    bestTimeDetails: [
      "**Wildlife Viewing:** July-October (animals at water sources)",
      "**Bird Watching:** October-March (migrants present)",
      "**Elephant Sightings:** Year-round (450-500 population)",
      "**Avoid:** December-February (hot, humid, thick vegetation)",
      "**Temperature:** Cooler in winter (July-Sept: 18-25°C)",
      "**Road Conditions:** Best in dry season"
    ],
    tips: [
      "Book early during peak season (July-October)",
      "Morning game drives offer best wildlife activity",
      "Bring camera with zoom lens for wildlife photos",
      "Wear neutral colors (khaki, beige, olive) - not bright colors",
      "Binoculars provided but bring your own if you have them",
      "Sun hat, sunscreen & insect repellent essential",
      "Combine with beach time at Ponta do Ouro",
      "Ask about multi-day camping for immersive experience"
    ],
    operators: [
      {
        name: "My Guide Mozambique",
        website: "https://www.myguidemozambique.com/",
        email: "info@myguidemozambique.com",
        specialty: "Full-day safari + Ponta do Ouro beach combos"
      },
      {
        name: "Mussiro Trips",
        website: "https://mussiro.com/",
        email: "info@mussiro.com",
        specialty: "Day tours from Maputo crossing the reserve"
      },
      {
        name: "Maputo Tour Guides",
        website: "https://maputotours.net/",
        email: "info@maputotours.net",
        specialty: "Dedicated 5-6 hour game drives"
      }
    ]
  }
};

export function getSafariContent(lang) {
  return SAFARI_CONTENT[lang] || SAFARI_CONTENT['en'];
}
