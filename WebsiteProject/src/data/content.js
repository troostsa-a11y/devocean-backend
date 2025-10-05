// Base content data (images, accommodations, experiences)
export const IMG = {
  logo: "/images/Logo2.png",
  units: {
    safari: "/photos/units/safari-tent.jpg",
    comfort: "/photos/units/comfort-tent.jpg",
    cottage: "/photos/units/garden-cottage.jpg",
    chalet: "/photos/units/thatched-chalet.jpg",
  },
  experiences: {
    diving: "/photos/experiences/diving.jpg",
    dolphins: "/photos/experiences/dolphins.jpg",
    lighthouse: "/photos/experiences/lighthouse.jpg",
    seafari: "/photos/experiences/seafari.jpg",
    safari: "/photos/experiences/safari.jpg",
    fishing: "/photos/experiences/fishing.jpg",
    surfing: "/photos/experiences/surfing.jpg",
  },
  gallery: [
    "/photos/gallery/01.jpg", "/photos/gallery/02.jpg", "/photos/gallery/03.jpg", "/photos/gallery/04.jpg",
    "/photos/gallery/05.jpg", "/photos/gallery/06.jpg", "/photos/gallery/07.jpg", "/photos/gallery/08.jpg",
  ],
};

// Hero images with mobile-optimized versions
export const HERO_IMAGES = [
  { desktop: "/photos/hero01.jpg", mobile: "/photos/hero01-mobile.jpg" },
  { desktop: "/photos/hero02.jpg", mobile: "/photos/hero02-mobile.jpg" },
  { desktop: "/photos/hero03.jpg", mobile: "/photos/hero03-mobile.jpg" },
  { desktop: "/photos/hero04.jpg", mobile: "/photos/hero04-mobile.jpg" },
  { desktop: "/photos/hero05.jpg", mobile: "/photos/hero05-mobile.jpg" },
];

export const UNIT_BASE = [
  {
    key: "safari", img: IMG.units.safari, title: "Safari Tent",
    short: "12 m² canvas tent on a 3×6 m platform. Twin/King, fan, power points, mosquito mesh, private terrace. Shared ablutions.",
    details: [
      "Two single beds (or King) with pedestals and shaded lamps",
      "Mosquito mesh on doors/windows • strong fan • power points",
      "Small shelving unit for clothing/essentials",
      "Private terrace with rolled palm-leaf chairs facing the tropical garden",
      "Shared bathrooms (ladies/gents): 2 hot/cold showers & 2 toilets each",
      "Village can be lively during holidays; free earplugs at reception",
    ],
  },
  {
    key: "comfort", img: IMG.units.comfort, title: "Comfort Tent",
    short: "Upgraded 12 m² tent with extra privacy (side/back walls), private terrace and your own en-suite bathroom under a thatched roof.",
    details: [
      "Twin/King bed setup • lamps • convenient light switches",
      "Mosquito mesh • strong fan • power points",
      "Private wood terrace with rolled palm-leaf chairs",
      "At the back: private bathroom (shower, toilet, sink) under a grass-thatched roof",
      "Village liveliness during peak/holidays; earplugs available",
    ],
  },
  {
    key: "cottage", img: IMG.units.cottage, title: "Garden Cottage",
    short: "Airy cottage with queen bed, A/C (inverter), desk & dining table, private terrace and bathroom in a charming roundavel.",
    details: [
      "Roman-tiled roof, high white ceiling with dark wood beams",
      "Terracotta floor, warm wheatfields-painted walls",
      "Queen bed • working desk with shaded lamp • dining table with chairs",
      "Suitcase shelves, clothes rack and extra shelving",
      "Inverter A/C (cool & heat) • dimmable main light",
      "Private bath in grass-thatched roundavel (shower, sink, toilet)",
      "Private wooden terrace with camping chairs and side table",
    ],
  },
  {
    key: "chalet", img: IMG.units.chalet, title: "Thatched Chalet",
    short: "Secluded, romantic tiny chalet under palms and strelitzia. A/C, private bathroom, terrace, Twin/King bed setup.",
    details: [
      "Grass-thatched roof on bluegum poles • autumn-slate floor",
      "Wheatfields-painted walls • tranquil, shaded setting",
      "Dinner table with chairs • air conditioning",
      "Private bathroom (shower, sink, toilet)",
      "Two singles or King with pedestals • private terrace with palm-leaf chairs",
    ],
  },
];

export const EXP_BASE = [
  { key: "diving", img: IMG.experiences.diving, title: "Scuba Diving", desc: "Offshore reefs with rich marine life." },
  { key: "dolphins", img: IMG.experiences.dolphins, title: "Dolphin Swim", desc: "Ethical encounters with resident dolphins." },
  { key: "lighthouse", img: IMG.experiences.lighthouse, title: "Lighthouse Walk", desc: "Hike the hill to the old lighthouse for sweeping views." },
  { key: "seafari", img: IMG.experiences.seafari, title: "Seafaris", desc: "Ocean safaris for whales (May–Oct) & more." },
  { key: "safari", img: IMG.experiences.safari, title: "Game Safaris", desc: "Bush adventures a short drive away." },
  { key: "fishing", img: IMG.experiences.fishing, title: "Beach & Deep Sea Fishing", desc: "From shore casts to charters offshore." },
  { key: "surfing", img: IMG.experiences.surfing, title: "Surf Boards & Lessons", desc: "Catch a wave or learn the basics." },
];

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/devoceanmz/" },
  { name: "Instagram", href: "https://www.instagram.com/devoceanmz/" },
  { name: "Google Maps", href: "https://maps.app.goo.gl/edhq5PGLLhGMh9rL6" },
  { name: "X (Twitter)", href: "https://x.com/DEVOCEANMZ" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/devocean-lodge/" },
  { name: "TikTok", href: "https://www.tiktok.com/@devoceanlodge" },
  { name: "Pinterest", href: "https://www.pinterest.com/devoceansa/" },
  { name: "YouTube", href: "https://www.youtube.com/@DEVOCEAN_MZ" },
];

export const EXPERIENCE_OPERATORS = [
  { name: "Gozo Azul", href: "https://gozo-azul.co.za/" },
  { name: "Back to Basics Adventures", href: "http://www.backtobasicsadventures.com/" },
  { name: "Dolphin Encountours", href: "https://www.dolphinencountours.org/" },
  { name: "The Dolphin Centre", href: "https://thedolphincentre.com/" },
  { name: "SPIGS Surf's Up", href: "https://www.facebook.com/spigssurfsup" },
  { name: "Mozambique Fishin' Charters", href: "https://mozambiquefishincharters.co.za/packages/" },
];

export const MAP = {
  lat: -26.841994852732736,
  lng: 32.88504331196165,
  zoom: 13
};

export const EMAIL = "info@devoceanlodge.com";
export const PHONE = "+258844182252";
