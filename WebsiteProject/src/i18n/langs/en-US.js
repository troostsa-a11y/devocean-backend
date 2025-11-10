// Translations for en-US
export const UI = {
menu: "Menu",
    regions: { europe: "Europe", asia: "Asia", americas: "Americas", africa: "Africa", oceania: "Oceania" },
    nav: { home: "Home", stay: "Stay", experiences: "Experiences", todo: "What to do", gallery: "Gallery", location: "Location", contact: "Contact" },
    hero: { title: "DEVOCEAN Lodge", subtitle: "Eco-friendly stays a few hundred meters from the beach in Ponta do Ouro, Southern Mozambique.", ctaPrimary: "Book your stay", ctaSecondary: "Explore the lodge", badge: "Guests loved comfort & value" },
    stay: { headline: "Stay with us", blurb: "Choose your style: nature-immersed tents or cozy chalets and cottage – all with warm, family-run hospitality.", moreDetails: "More details", ourStory: "Our Story" },
    experiences: { headline: "Experiences", blurb: "Ocean and forest adventures right on your doorstep.", operators: "Trusted local operators:" },
    todo: {
      headline: "What to do in Ponta do Ouro",
      note: "For diving, snorkel trips, dolphin/whale seafaris and fishing charters, see the providers below.",
      items: [
        { title: "Lighthouse hike & Lua Do Mar", body: "Hike to the Old Lighthouse for panoramic views. Continue to Lua Do Mar Restaurant on the dune. Often spot dolphins year-round, whales (May–Oct) and turtles (Dec–Jan). Mind the tide: avoid the beach route from 3 hours before to 3 hours after high tide; rogue waves can push you against rocks." },
        { title: "Walk to Ponta Malongane", body: "Beach-walk along the shore to the next village. Midway, stairs through banana trees lead to Campismo Nino Pub & Restaurant with great views. Near the bay transition, a path to Sky Island offers paragliding. Famous pubs in Malongane: Drunken Clam and Sunset Shack. Return via beach or the sandy 4×4 road." },
        { title: "Surf, dive & ocean research", body: "Surfboard rentals at the Beach Bar; several dive centers in the village and a dolphin/whale research center." },
        { title: "Eat & unwind nearby", body: "There are ~16 pubs and restaurants within 500 m of DEVOCEAN. For a relaxing full-body massage, ask for Lisa (LIZ-Way Massage)." },
        { title: "Quad bike rentals", body: "Occasional private rentals from locals. Typical rate: around MZN 2000 per hour (negotiation varies)." },
      ],
    },
    gallery: { headline: "Gallery" },
    location: {
      headline: "Location", blurb: "Ponta do Ouro – Matutuíne District, Southern Mozambique.",
      items: [
        "Ponta do Ouro town, a short walk from the beach",
        "15 min to Ponta Malongane • 25 min to Kosi Bay border",
        "Secure parking • Local cafés & markets nearby",
      ],
      viewMap: "View Interactive Map",
    },
    contact: { headline: "Contact & Booking", blurb: "Questions, dates, special requests or group bookings – we're happy to help.", call: "WhatsApp", email: "Email", directions: "Directions", bookNow: "Rates & Availability" },
    form: {
      name: "Name", email: "Email", stayLabel: "Interested in staying:", checkin: "From", checkout: "Until", 
      unitLabel: "My preferred unit is:", 
      units: [
        "Safari Tent - shared bathroom",
        "Comfort Tent - private bathroom",
        "Garden Cottage - inverter AC",
        "Thatched Chalet - inverter AC"
      ],
      message: "Message", send: "Send",
      consent: "By submitting you agree to be contacted about your inquiry.",
      phName: "Your name", phEmail: "your@email.com", phDate: "dd/mm/yyyy", phMsg: "Tell us more about your wishes...",
      success: "Thank you! Your message has been sent. Check your email for a confirmation.",
    },
    galleryHeading: "Gallery",
    footer: {
      rights: "All rights reserved.",
      desc: "Family-run eco-hospitality and community projects in Southern Mozambique.",
    },
    currencies: {
      USD: "US-Dollar",
      JPY: "Yen",
      CNY: "Yuan",
      RUB: "Ruble",
      MZN: "Meticais",
      ZAR: "Rand",
      EUR: "Euro",
      GBP: "GB-Pound",
      SEK: "Krona",
      PLN: "Zloty"
    },
    legal: {
      title: "Legal",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
      terms: "Terms & Conditions",
      gdpr: "GDPR Info",
      cric: "Consumer Rights & Contact",
      manage: "Cookie Settings",
      ccpa: "Do Not Sell My Info",
    }
};

export const L10N = {
  units: {
    safari: {
      title: "Safari Tent",
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
    comfort: {
      title: "Comfort Tent",
      short: "Upgraded 12 m² tent with extra privacy (side/back walls), private terrace and your own en-suite bathroom under a thatched roof.",
      details: [
        "Twin/King bed setup • lamps • convenient light switches",
        "Mosquito mesh • strong fan • power points",
        "Private wood terrace with rolled palm-leaf chairs",
        "At the back: private bathroom (shower, toilet, sink) under a grass-thatched roof",
        "Village liveliness during peak/holidays; earplugs available",
      ],
    },
    cottage: {
      title: "Garden Cottage",
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
    chalet: {
      title: "Thatched Chalet",
      short: "Secluded, romantic tiny chalet under palms and strelitzia. A/C, private bathroom, terrace, Twin/King bed setup.",
      details: [
        "Grass-thatched roof on bluegum poles • autumn-slate floor",
        "Wheatfields-painted walls • tranquil, shaded setting",
        "Dinner table with chairs • air conditioning",
        "Private bathroom (shower, sink, toilet)",
        "Two singles or King with pedestals • private terrace with palm-leaf chairs",
      ],
    },
  },
  experiences: {
    diving: { title: "Scuba Diving", desc: "Offshore reefs with rich marine life." },
    dolphins: { title: "Dolphin Swim", desc: "Ethical encounters with resident dolphins." },
    lighthouse: { title: "Lighthouse Walk", desc: "Hike the hill to the old lighthouse for sweeping views." },
    seafari: { title: "Seafaris", desc: "Ocean safaris for whales (May–Oct) & more." },
    safari: { title: "Game Safaris", desc: "Bush adventures a short drive away." },
    fishing: { title: "Beach & Deep Sea Fishing", desc: "From shore casts to charters offshore." },
    surfing: { title: "Surf Boards & Lessons", desc: "Catch a wave or learn the basics." },
  },
};

export default UI;
