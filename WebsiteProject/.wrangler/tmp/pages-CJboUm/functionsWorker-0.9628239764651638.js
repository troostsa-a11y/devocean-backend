var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/contact.js
function sanitizeHeader(str) {
  return String(str).replace(/[\r\n]/g, "").trim();
}
__name(sanitizeHeader, "sanitizeHeader");
function sanitizeMessage(str) {
  return String(str).replace(/\r\n/g, "\n").replace(/\r/g, "").trim();
}
__name(sanitizeMessage, "sanitizeMessage");
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml, "escapeHtml");
async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { name, email, message, checkin_iso, checkout_iso, unit, currency, lang, recaptcha_token } = data;
    if (!recaptcha_token) {
      return new Response(JSON.stringify({ error: "reCAPTCHA validation required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const recaptchaSecret = env.RECAPTCHA_SECRET_KEY;
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const recaptchaResponse = await fetch(recaptchaVerifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${recaptchaSecret}&response=${recaptcha_token}`
    });
    const recaptchaResult = await recaptchaResponse.json();
    if (!recaptchaResult.success) {
      console.error("reCAPTCHA verification failed:", recaptchaResult);
      return new Response(JSON.stringify({ error: "reCAPTCHA verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (recaptchaResult.action !== "contact_form") {
      console.warn("reCAPTCHA action mismatch:", recaptchaResult.action, "expected: contact_form");
      return new Response(JSON.stringify({ error: "Invalid security token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (recaptchaResult.score !== void 0) {
      if (recaptchaResult.score < 0.3) {
        console.warn("reCAPTCHA score too low (bot detected):", recaptchaResult.score);
        return new Response(JSON.stringify({ error: "Security verification failed. Please try again." }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      } else if (recaptchaResult.score < 0.5) {
        console.warn("Low reCAPTCHA score (suspicious):", recaptchaResult.score, "from:", email);
      }
    }
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2e3);
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return new Response(JSON.stringify({ error: "Invalid input data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sanitizedCheckin = checkin_iso ? sanitizeHeader(checkin_iso).slice(0, 20) : "";
    const sanitizedCheckout = checkout_iso ? sanitizeHeader(checkout_iso).slice(0, 20) : "";
    const sanitizedUnit = unit ? sanitizeHeader(unit).slice(0, 100) : "";
    const sanitizedCurrency = currency ? sanitizeHeader(currency).slice(0, 10) : "EUR";
    const sanitizedLang = lang ? sanitizeHeader(lang).slice(0, 10) : "en";
    const languageNames = {
      en: "English",
      pt: "Portuguese",
      nl: "Dutch",
      fr: "French",
      it: "Italian",
      de: "German",
      es: "Spanish"
    };
    const fullLanguageName = languageNames[sanitizedLang] || sanitizedLang;
    const emailSubject = `New Contact Form Enquiry - ${sanitizedName}`;
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Website Enquiry</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
          ${sanitizedCheckin ? `<p style="margin: 8px 0;"><strong>Check-in:</strong> ${escapeHtml(sanitizedCheckin)}</p>` : ""}
          ${sanitizedCheckout ? `<p style="margin: 8px 0;"><strong>Check-out:</strong> ${escapeHtml(sanitizedCheckout)}</p>` : ""}
          ${sanitizedUnit ? `<p style="margin: 8px 0;"><strong>Unit:</strong> ${escapeHtml(sanitizedUnit)}</p>` : ""}
          ${sanitizedCurrency ? `<p style="margin: 8px 0;"><strong>Currency:</strong> ${escapeHtml(sanitizedCurrency)}</p>` : ""}
          ${fullLanguageName ? `<p style="margin: 8px 0;"><strong>Language:</strong> ${escapeHtml(fullLanguageName)}</p>` : ""}
        </div>
        <div style="background: white; padding: 20px; border-left: 4px solid #9e4b13; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Sent from devoceanlodge.com contact form<br>
          reCAPTCHA score: ${recaptchaResult.score || "N/A"}
        </p>
      </div>
    `;
    const emailText = `
New Website Enquiry
-------------------

Name: ${sanitizedName}
Email: ${sanitizedEmail}
${sanitizedCheckin ? `Check-in: ${sanitizedCheckin}` : ""}
${sanitizedCheckout ? `Check-out: ${sanitizedCheckout}` : ""}
${sanitizedUnit ? `Unit: ${sanitizedUnit}` : ""}
${sanitizedCurrency ? `Currency: ${sanitizedCurrency}` : ""}
${fullLanguageName ? `Language: ${fullLanguageName}` : ""}

Message:
${sanitizedMessage}

---
Sent from devoceanlodge.com contact form
reCAPTCHA score: ${recaptchaResult.score || "N/A"}
    `.trim();
    const resendApiKey = env.RESEND_API_KEY;
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "DEVOCEAN Lodge Website <reservations@devoceanlodge.com>",
        to: ["info@devoceanlodge.com"],
        reply_to: sanitizedEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      })
    });
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult.id);
    const autoReplyMessages = {
      en: "Thanks for reaching out to DEVOCEAN Lodge. We've received your message and will get back to you shortly.",
      pt: "Obrigado por entrar em contato com o DEVOCEAN Lodge. Recebemos sua mensagem e entraremos em contato em breve.",
      nl: "Bedankt voor je bericht aan DEVOCEAN Lodge. We nemen snel contact op.",
      fr: "Merci d'avoir contact\xE9 DEVOCEAN Lodge. Nous vous r\xE9pondrons prochainement.",
      it: "Grazie per aver contattato DEVOCEAN Lodge. Ti risponderemo a breve.",
      de: "Danke f\xFCr Ihre Nachricht an DEVOCEAN Lodge. Wir melden uns bald.",
      es: "Gracias por contactarnos en DEVOCEAN Lodge. Nos pondremos en contacto pronto."
    };
    const autoReplySubjects = {
      en: "Thanks \u2014 DEVOCEAN Lodge",
      pt: "Obrigado \u2014 DEVOCEAN Lodge",
      nl: "Bedankt \u2014 DEVOCEAN Lodge",
      fr: "Merci \u2014 DEVOCEAN Lodge",
      it: "Grazie \u2014 DEVOCEAN Lodge",
      de: "Danke \u2014 DEVOCEAN Lodge",
      es: "Gracias \u2014 DEVOCEAN Lodge"
    };
    const greetings = {
      en: "Hi",
      pt: "Ol\xE1",
      nl: "Hoi",
      fr: "Bonjour",
      it: "Ciao",
      de: "Hallo",
      es: "Hola"
    };
    const ratesButtonText = {
      en: "Rates & Availability",
      pt: "Tarifas & Disponibilidade",
      nl: "Tarieven & Beschikbaarheid",
      fr: "Tarifs & Disponibilit\xE9",
      it: "Tariffe & Disponibilit\xE0",
      de: "Preise & Verf\xFCgbarkeit",
      es: "Tarifas & Disponibilidad"
    };
    const sincerelyText = {
      en: "Warm regards",
      pt: "Atenciosamente",
      nl: "Met vriendelijke groet",
      fr: "Cordialement",
      it: "Cordialmente",
      de: "Mit freundlichen Gr\xFC\xDFen",
      es: "Cordialmente"
    };
    const bookingUrl = `https://devoceanlodge.com/booking.html`;
    const autoReplyHtml = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#0f172a;max-width:600px">
  <tr>
    <td>
      <p style="margin:0 0 16px 0;font-size:16px">${escapeHtml(greetings[sanitizedLang] || greetings.en)} ${escapeHtml(sanitizedName)},</p>
    </td>
  </tr>
  <tr>
    <td>
      <p style="margin:0 0 24px 0;font-size:16px">${escapeHtml(autoReplyMessages[sanitizedLang] || autoReplyMessages.en)}</p>
    </td>
  </tr>
  <tr>
    <td>
      <p style="margin:32px 0 12px 0;font-size:16px">${escapeHtml(sincerelyText[sanitizedLang] || sincerelyText.en)},</p>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 0">
      <a href="https://devoceanlodge.com" style="text-decoration:none">
        <img src="https://devoceanlodge.com/images/signature.png" alt="Sean's signature" width="350" style="width:350px;max-width:100%;height:auto;display:block;border:0" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 0 0 0">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(bookingUrl)}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="18%" strokecolor="#9e4b13" fillcolor="#9e4b13">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:500;">${escapeHtml(ratesButtonText[sanitizedLang] || ratesButtonText.en)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;background-color:#9e4b13;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:500;font-size:16px;font-family:Arial,sans-serif">${escapeHtml(ratesButtonText[sanitizedLang] || ratesButtonText.en)}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
    `.trim();
    const autoReplyText = `
${greetings[sanitizedLang] || greetings.en} ${sanitizedName},

${autoReplyMessages[sanitizedLang] || autoReplyMessages.en}

${sincerelyText[sanitizedLang] || sincerelyText.en},

DEVOCEAN Lodge
https://devoceanlodge.com

${ratesButtonText[sanitizedLang] || ratesButtonText.en}: ${bookingUrl}
    `.trim();
    if (!/^(no-?reply|postmaster|mailer-daemon|bounce)/i.test(sanitizedEmail)) {
      try {
        const autoReplyResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "DEVOCEAN Lodge <reservations@devoceanlodge.com>",
            to: [sanitizedEmail],
            reply_to: "info@devoceanlodge.com",
            subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
            html: autoReplyHtml,
            text: autoReplyText,
            headers: {
              "Auto-Submitted": "auto-replied",
              "X-Auto-Response-Suppress": "All"
            }
          })
        });
        if (autoReplyResponse.ok) {
          const autoReplyResult = await autoReplyResponse.json();
          console.log("Auto-reply sent to:", sanitizedEmail, "ID:", autoReplyResult.id);
        } else {
          const errorText = await autoReplyResponse.text();
          console.error("Auto-reply failed:", errorText);
        }
      } catch (autoReplyError) {
        console.error("Auto-reply failed:", autoReplyError.message);
      }
    }
    return new Response(JSON.stringify({ success: true, messageId: emailResult.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");

// ../src/data/experienceDetails.js
var EXPERIENCE_DETAILS = {
  diving: {
    key: "diving",
    title: "Scuba Diving",
    tagline: "Explore pristine reefs with bull sharks, mantas & whale sharks",
    hero: "/photos/experiences/diving.jpg",
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
    pricing: {
      range: "From $40 USD per dive",
      details: [
        "Single dive: $40-50 USD",
        "Two-dive package: $75-90 USD",
        "PADI Open Water: $350-400 USD",
        "Equipment rental included",
        "All licenses & permits included"
      ]
    },
    duration: {
      typical: "Half-day or full-day trips",
      details: [
        "Morning dives: 2 dives (3-4 hours)",
        "Full day: 3 dives (6-8 hours)",
        "Beach launch (surf launch - adventurous!)",
        "Sites 1-12km from shore"
      ]
    },
    included: [
      "All diving equipment (BCD, regulator, wetsuit)",
      "Boat transport to dive sites",
      "Professional PADI dive master/instructor",
      "Marine park fees",
      "Post-dive snacks & refreshments",
      "Dive computer & safety equipment"
    ],
    requirements: {
      level: "Beginner to Advanced",
      details: [
        "Beginner sites: Cr\xE8che, Doodles, Playground (10-18m)",
        "Advanced sites: Pinnacles, Atlantis, Cloudbreak (28-48m)",
        "PADI certification required (or do Open Water course)",
        "Medical questionnaire required",
        "Good swimming ability",
        "Minimum age: 10 years (Junior Open Water)"
      ]
    },
    bestTime: {
      peak: "October - April (Summer)",
      details: [
        "**Bull & Tiger Sharks:** November-April (26-29\xB0C water)",
        "**Hammerhead Sharks:** April-October (better visibility)",
        "**Whale Sharks:** October-March",
        "**Humpback Whales:** July-November",
        "**Best Visibility:** May-August (20-30m)",
        "**Warmest Water:** December-February (27-29\xB0C)"
      ]
    },
    topSites: [
      {
        name: "Pinnacles",
        depth: "28-40m",
        highlights: "Premier shark dive - bull sharks, tiger sharks, hammerheads, mantas"
      },
      {
        name: "Bass City",
        depth: "20-25m",
        highlights: "Potato bass, lionfish, zebra sharks, cleaning stations"
      },
      {
        name: "Wayne's World",
        depth: "~20m",
        highlights: "Macro paradise - seahorses, frogfish, ghost pipefish"
      },
      {
        name: "Atlantis",
        depth: "35-47m",
        highlights: "Deep dive - eagle rays, reef sharks, Spanish dancers"
      },
      {
        name: "Doodles",
        depth: "14-18m",
        highlights: "Perfect for all levels - rays, turtles, moray eels, octopus"
      }
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
    ],
    tips: [
      "Book early during peak season (December-January)",
      "Bring your certification card",
      "Consider a wetsuit (3mm recommended)",
      "Surf launch can be exciting - be prepared to get wet!",
      "Most operators offer gear rental if needed",
      "Multi-dive packages offer best value"
    ]
  },
  dolphins: {
    key: "dolphins",
    title: "Dolphin Swimming",
    tagline: "Ethical wild dolphin encounters in crystal-clear waters",
    hero: "/photos/experiences/dolphins.jpg",
    overview: "Experience magical encounters with wild Indo-Pacific bottlenose dolphins in the Ponta do Ouro Partial Marine Reserve. Both authorized operators follow strict ethical guidelines, ensuring passive, non-invasive interactions where dolphins choose to engage on their own terms.",
    highlights: [
      "200+ resident bottlenose dolphins",
      "Ethical, research-based encounters",
      "NO touching or chasing - wild & free",
      "Snorkeling over pristine reefs",
      "Seasonal whale shark sightings",
      "Humpback whales (July-November)",
      "Small group sizes (max 12 people)",
      "Educational conservation focus"
    ],
    pricing: {
      range: "US$45-50 per person",
      details: [
        "Dolphin watching (boat only): US$45",
        "Dolphin swim excursion: US$50",
        "Multi-day packages: Discounted rates",
        "Snorkel equipment included",
        "Conservation fee included"
      ]
    },
    duration: {
      typical: "2-3 hours",
      details: [
        "Early morning launch (best conditions)",
        "Snorkeling over shallow reefs",
        "In-water dolphin facilitation",
        "Whale shark encounters (seasonal)",
        "Educational pre-launch briefing"
      ]
    },
    included: [
      "Mask, fins & snorkel",
      "Wetsuit (if needed)",
      "Experienced facilitator/guide",
      "Pre-launch educational presentation",
      "Photos/videos of your encounter",
      "Light refreshments",
      "Marine park fees"
    ],
    requirements: {
      level: "All ages & abilities",
      details: [
        "Swimming ability required",
        "Comfortable with snorkeling",
        "Ages: 5 to 80+ (weather permitting)",
        "Pregnancy: Safe up to 6 months",
        "No diving certification needed",
        "Minimum 6 people per trip (4 for retreats)"
      ]
    },
    bestTime: {
      peak: "January - May",
      details: [
        "**Peak Season:** January-May (best encounters)",
        "**Dolphins:** Year-round residents",
        "**Humpback Whales:** July-November",
        "**Whale Sharks:** October-March",
        "**Calmest Seas:** Early morning",
        "**Water Temperature:** 22-28\xB0C year-round"
      ]
    },
    ethicalPractices: [
      {
        title: "NO Touching",
        description: "Strict no-contact policy - dolphins remain wild & free"
      },
      {
        title: "NO Chasing",
        description: "We never pursue dolphins - encounters on their terms only"
      },
      {
        title: "NO Feeding",
        description: "Wild dolphins hunt naturally - no artificial feeding"
      },
      {
        title: "Passive Encounters",
        description: "Facilitators assess dolphin behavior before allowing interaction"
      },
      {
        title: "Education First",
        description: "Learn about conservation & dolphin behavior before launch"
      },
      {
        title: "Scientific Monitoring",
        description: "Data collected supports marine conservation research"
      }
    ],
    operators: [
      {
        name: "Dolphin Encountours Research Center",
        website: "https://www.dolphinencountours.org/",
        email: "connect@dolphinencountours.org",
        specialty: "Research-focused, founded 1995, 250+ dolphins catalogued"
      },
      {
        name: "The Dolphin Centre",
        website: "https://thedolphincentre.com/",
        email: "info@thedolphincentre.com",
        specialty: "Tourism-focused, packages available, whale watching combos"
      }
    ],
    tips: [
      "Book early - limited permits (only 2 operators)",
      "Early morning trips have calmest conditions",
      "Bring sunblock, water & towel",
      "Warm top recommended for winter (July-September)",
      "Sightings not guaranteed - wild animals",
      "Respect dolphins' space - they'll approach if interested",
      "Photography allowed but don't chase for photos"
    ]
  },
  lighthouse: {
    key: "lighthouse",
    title: "Lighthouse Walk",
    tagline: "Hike to the historic lighthouse for sweeping ocean views",
    hero: "/photos/experiences/lighthouse.jpg",
    overview: "Trek through coastal forest and along dramatic cliffs to reach the iconic Ponta do Ouro lighthouse. This moderate hike rewards you with breathtaking panoramas of the Indian Ocean, and you might spot dolphins surfing the waves or turtles nesting on the beaches below (October-December).",
    highlights: [
      "Historic lighthouse with 360\xB0 ocean views",
      "Coastal forest & cliff-top trails",
      "Dolphin watching from elevated vantage",
      "Turtle spotting (October-December)",
      "Ancient baobab trees",
      "Rich birdlife & monkeys",
      "Pristine beaches at trail's end",
      "Perfect for sunrise or sunset"
    ],
    pricing: {
      range: "Free (self-guided)",
      details: [
        "Self-guided hike: Free",
        "Guided nature walk: ~$15-20 USD",
        "Bring own water & snacks",
        "No entrance fees"
      ]
    },
    duration: {
      typical: "2-3 hours round trip",
      details: [
        "Distance: ~5-6 km round trip",
        "Elevation gain: Moderate",
        "Allow 1 hour each way at steady pace",
        "Add time for photos & wildlife watching",
        "Best at sunrise (6:00 AM) or late afternoon (4:00 PM)"
      ]
    },
    included: [
      "Stunning ocean vistas",
      "Coastal forest experience",
      "Wildlife encounters",
      "Historic lighthouse access",
      "Post-hike beach swimming"
    ],
    requirements: {
      level: "Moderate",
      details: [
        "Moderate fitness required",
        "Some uneven terrain & steep sections",
        "Sandy paths in places",
        "Good walking shoes essential",
        "Sun protection a must",
        "Bring 1-2 liters of water per person"
      ]
    },
    bestTime: {
      peak: "May - October (Dry Season)",
      details: [
        "**Best Hiking:** May-October (cooler, drier)",
        "**Turtle Nesting:** October-December",
        "**Wildflowers:** Spring (September-November)",
        "**Avoid:** November-April (hot & humid, heavy rain)",
        "**Temperature:** 20-30\xB0C (68-86\xB0F) in dry season",
        "**Sunrise:** ~5:30-6:00 AM",
        "**Sunset:** ~5:00-6:00 PM"
      ]
    },
    whatToBring: [
      "Sturdy walking shoes (closed-toe)",
      "1-2 liters water per person",
      "Sun hat & sunglasses",
      "Sunscreen (reef-safe)",
      "Light snacks/energy bars",
      "Camera or binoculars",
      "Swimsuit for post-hike beach",
      "Small backpack"
    ],
    safety: [
      {
        title: "Start Early",
        description: "Beat the heat - start at sunrise or late afternoon"
      },
      {
        title: "Stay Hydrated",
        description: "Bring plenty of water - no facilities on trail"
      },
      {
        title: "Check Weather",
        description: "Avoid during rain - trails become slippery"
      },
      {
        title: "Tell Someone",
        description: "Inform lodge staff of your hiking plans"
      },
      {
        title: "Watch for Wildlife",
        description: "Respect distance from monkeys & other animals"
      }
    ],
    tips: [
      "Sunrise hikes offer cooler temperatures & golden light",
      "Bring binoculars for dolphin & whale watching from cliffs",
      "Pack out all trash - help keep trails pristine",
      "Combine with beach walk to Ponta Malongane (8km north)",
      "Ask lodge staff about current trail conditions",
      "Turtle nesting season (Oct-Dec) offers special sightings",
      "Photography is spectacular at golden hour"
    ]
  },
  seafari: {
    key: "seafari",
    title: "Ocean Seafaris",
    tagline: "Whale watching & marine life encounters",
    hero: "/photos/experiences/seafari.jpg",
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
    pricing: {
      range: "$40-45 USD per person",
      details: [
        "Whale watching only: ~$40 USD (2,500 MZN)",
        "Combined dolphin + whale: ~$45 USD (2,750 MZN)",
        "Full-day private tour from Maputo: $179 USD",
        "Children under 12: Discounted rates",
        "Equipment & snacks included"
      ]
    },
    duration: {
      typical: "2-3 hours",
      details: [
        "Half-day excursions: 2-3 hours",
        "Full-day tours: 6-8 hours (from Maputo)",
        "Morning departures (best conditions)",
        "Includes snorkeling time",
        "Flexible based on whale activity"
      ]
    },
    included: [
      "Boat transport with experienced skipper",
      "Snorkel equipment (mask, fins, snorkel)",
      "Marine biologist guide (most operators)",
      "Snacks & refreshments",
      "Marine park fees",
      "Photos/videos (some operators)",
      "Safety equipment & life jackets"
    ],
    requirements: {
      level: "All ages",
      details: [
        "No special skills required for whale watching",
        "Swimming ability needed for snorkeling",
        "Ages: Suitable for families (young children to elderly)",
        "Weather dependent - seas must be calm",
        "Tours may be rescheduled if unsafe conditions",
        "Warm jacket recommended (July-September)"
      ]
    },
    bestTime: {
      peak: "July - October (Whale Season)",
      details: [
        "**Humpback Whales:** July-November (peak: July-Oct)",
        "**Dolphins:** Year-round (200+ residents)",
        "**Whale Sharks:** October-March",
        "**Manta Rays:** December-May",
        "**Sea Turtles:** October-March (nesting)",
        "**Calmest Seas:** Winter months (June-September)"
      ]
    },
    whaleBehaviors: [
      {
        name: "Breaching",
        description: "Full body launches out of water - spectacular displays of power"
      },
      {
        name: "Tail-Slapping (Lob-Tailing)",
        description: "Repeated tail strikes on water surface - communication & play"
      },
      {
        name: "Spy-Hopping",
        description: "Vertical rise to look above water - curious whales checking boats"
      },
      {
        name: "Flipper Slapping",
        description: "Pectoral fin strikes - social behavior & excitement"
      },
      {
        name: "Approach Behavior",
        description: "Whales often approach boats - curious & friendly"
      }
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
    ]
  },
  safari: {
    key: "safari",
    title: "Game Safaris",
    tagline: "Bush adventures in Maputo Special Reserve",
    hero: "/photos/experiences/safari.jpg",
    overview: "Discover African wildlife just a short drive from Ponta do Ouro. Maputo National Park (formerly Maputo Special Reserve) offers classic game viewing with 450-500 coastal elephants, giraffes, zebras, hippos, crocodiles, and diverse antelope species across 1,718 km\xB2 of protected wilderness - a UNESCO World Heritage Site since 2025.",
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
    pricing: {
      range: "From $95 USD per person",
      details: [
        "Day safari: $95-120 USD per person",
        "Full-day with Ponta do Ouro beach: $100-130 USD",
        "2-3 day camping safari: From $200 USD",
        "Private tours: Custom pricing",
        "4x4 vehicle, guide & park fees included"
      ]
    },
    duration: {
      typical: "5-8 hours (day trip)",
      details: [
        "Half-day game drive: 3-4 hours",
        "Full-day safari: 5-6 hours in park + transport",
        "Multi-day camping: 2-3 days",
        "Depart Ponta do Ouro: Early morning (6-7 AM)",
        "Return: Late afternoon (4-5 PM)"
      ]
    },
    included: [
      "4x4 game drive vehicle",
      "Professional guide/driver",
      "Marine park entrance fees",
      "Binoculars for wildlife viewing",
      "Bottled water & snacks",
      "Hotel pickup from Ponta do Ouro",
      "USB charging in vehicle (most operators)"
    ],
    requirements: {
      level: "All ages & fitness levels",
      details: [
        "No special fitness required",
        "Suitable for families with children",
        "Elderly-friendly (vehicle-based viewing)",
        "4x4 vehicle mandatory (thick sand tracks)",
        "Comfortable safari clothing recommended",
        "Sun protection essential"
      ]
    },
    bestTime: {
      peak: "July - October (Dry Season)",
      details: [
        "**Wildlife Viewing:** July-October (animals at water sources)",
        "**Bird Watching:** October-March (migrants present)",
        "**Elephant Sightings:** Year-round (450-500 population)",
        "**Avoid:** December-February (hot, humid, thick vegetation)",
        "**Temperature:** Cooler in winter (July-Sept: 18-25\xB0C)",
        "**Road Conditions:** Best in dry season"
      ]
    },
    wildlife: [
      {
        species: "Elephants",
        details: "450-500 coastal elephants - main attraction, year-round sightings"
      },
      {
        species: "Giraffes",
        details: "Frequently spotted throughout the reserve"
      },
      {
        species: "Zebras",
        details: "Common sightings, often in herds"
      },
      {
        species: "Hippos & Crocodiles",
        details: "Around lakes, wetlands & Maputo Bay"
      },
      {
        species: "Antelopes",
        details: "Reedbuck, impala, nyala, eland, kudu, waterbuck, red duiker"
      },
      {
        species: "Predators",
        details: "Leopard, cheetah, spotted hyena (reintroduced 2023-24)"
      },
      {
        species: "Birds",
        details: "300+ species - flamingos, wading birds, raptors"
      }
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
    ]
  },
  fishing: {
    key: "fishing",
    title: "Beach & Deep Sea Fishing",
    tagline: "Cast for kingfish or chase marlin in the Mozambique Channel",
    hero: "/photos/experiences/fishing.jpg",
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
    pricing: {
      range: "From $550 USD (charter)",
      details: [
        "5-hour charter: ~$550-650 USD (R8,000)",
        "8-hour charter: ~$850-950 USD (R12,000)",
        "Full-day deep sea: $1,000+ USD",
        "Beach fishing: Free (bring own gear)",
        "Guided shore fishing: $50-100 USD",
        "All licenses, equipment & filleting included in charters"
      ]
    },
    duration: {
      typical: "5-8 hours (charter)",
      details: [
        "Half-day charter: 5 hours",
        "Full-day charter: 8-10 hours",
        "Beach fishing: Flexible (best at dawn/dusk)",
        "Early morning departures (6-7 AM)",
        "Fast access to deep water (minutes from shore)"
      ]
    },
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
    requirements: {
      level: "Beginner to Expert",
      details: [
        "No experience required (guides assist)",
        "Maximum 6 anglers per boat (typically)",
        "Beach launch - expect to get wet!",
        "Sun protection essential",
        "Swimming ability recommended",
        "Seasickness medication if prone"
      ]
    },
    bestTime: {
      peak: "October - January (Marlin Season)",
      details: [
        "**Black Marlin:** October-January (peak season)",
        "**Blue Marlin:** Year-round",
        "**Sailfish:** June-September (prime time)",
        "**Wahoo & Tuna:** Year-round (peak: Oct-April)",
        "**King Mackerel:** Year-round (best: April-November)",
        "**Water Temp:** 22-28\xB0C (warmer = more pelagics)"
      ]
    },
    targetSpecies: [
      {
        name: "Black Marlin",
        season: "October-January",
        technique: "Trolling lures, live bait"
      },
      {
        name: "Sailfish",
        season: "June-September",
        technique: "Trolling, fly fishing"
      },
      {
        name: "Yellowfin Tuna",
        season: "Year-round",
        technique: "Trolling, popping, jigging"
      },
      {
        name: "Wahoo",
        season: "Year-round (peak: Oct-April)",
        technique: "High-speed trolling"
      },
      {
        name: "King Mackerel (Couta)",
        season: "Year-round",
        technique: "Trolling, shore casting"
      },
      {
        name: "Dorado (Mahi-Mahi)",
        season: "November-March",
        technique: "Trolling around floating debris"
      },
      {
        name: "Giant Trevally",
        season: "Year-round",
        technique: "Popping, jigging near reefs"
      }
    ],
    operators: [
      {
        name: "GAF Adventures",
        website: "https://fishingbooker.com/charters/view/11578",
        email: "info@gafadventures.com",
        specialty: "Skipper Laurens Koen, 20+ years, original Gozo Azul founder"
      },
      {
        name: "Gozo Azul Fishing",
        website: "https://www.facebook.com/gozofishing/",
        email: "fishing@gozo-azul.co.za",
        specialty: "Skipper Marcus Joubert, game fishing specialists"
      },
      {
        name: "Mozambique Fishing Charters",
        website: "https://mozambiquefishincharters.co.za/",
        email: "info@mozambiquefishincharters.co.za",
        specialty: "Multi-day packages, fully equipped boats"
      }
    ],
    tips: [
      "Book marlin season (Oct-Jan) well in advance",
      "Beach fishing best at sunrise & sunset",
      "Rocky point at beach end offers deep water for shore casts",
      "Walk north to Ponta Mamoli for better shore fishing",
      "Use artificial lures: pink dusters, redeye, chokka",
      "Bring waterproof bags for electronics & valuables",
      "Arrange fish storage/cooking with your lodge",
      "Catch & release encouraged for billfish conservation"
    ]
  },
  surfing: {
    key: "surfing",
    title: "Surf Boards & Lessons",
    tagline: "Ride the iconic Ponta do Ouro point break",
    hero: "/photos/experiences/surfing.jpg",
    overview: "Ponta do Ouro's classic right-hand point break can deliver epic rides of 100-200m, and up to 1km in perfect conditions - rivaling Jeffrey's Bay. The warm, crystal-clear waters and consistent swells make it ideal for surfers of all levels, from beginners learning on gentle beach breaks to experts carving the point.",
    highlights: [
      "Classic right-hand point break",
      "100-200m rides (up to 1km when perfect!)",
      "Warm water (22-28\xB0C) - wetsuit optional",
      "Beginner-friendly beach breaks",
      "Uncrowded lineups",
      "Surf lessons & board rentals available",
      "Dolphins surfing alongside you",
      "Crystal-clear Indian Ocean water"
    ],
    pricing: {
      range: "From $20 USD (lesson)",
      details: [
        "Surf lesson (2 hours): $20-40 USD",
        "Board rental (full day): $15-25 USD",
        "Multi-day packages: Discounted rates",
        "Equipment included in lessons",
        "Softboards for beginners",
        "Shortboards/funboards for experienced"
      ]
    },
    duration: {
      typical: "2 hours (lesson) or flexible (rental)",
      details: [
        "Beginner lesson: 2 hours (theory + practice)",
        "Private coaching: 1-2 hours",
        "Board rental: Half-day or full-day",
        "Best surf: Early morning (6-9 AM)",
        "Afternoon sessions: 3-6 PM"
      ]
    },
    included: [
      "Surf board (lesson or rental)",
      "Wetsuit/rash guard (if needed)",
      "One-on-one or small group instruction",
      "Safety briefing & ocean awareness",
      "Wax & leash",
      "Beach setup assistance",
      "Photos of your session (some operators)"
    ],
    requirements: {
      level: "All levels welcome",
      details: [
        "Beginners: No experience needed",
        "Intermediate/Advanced: Point break experience helpful",
        "Swimming ability required",
        "All ages (children to adults)",
        "Fitness: Moderate (paddling can be tiring)",
        "**Important:** Heavy rips along point - be cautious!"
      ]
    },
    bestTime: {
      peak: "South swell with west wind",
      details: [
        "**Best Swell:** South swell",
        "**Best Wind:** West wind (offshore)",
        "**Best Tide:** Either side of low tide",
        "**Consistency:** Good but fickle - needs right conditions",
        "**Seasons:** Year-round surfable",
        "**Water Temp:** 22-28\xB0C (shorty or boardshorts)",
        "**Chase swells from South Africa's North Coast for best sessions**"
      ]
    },
    surfSpots: [
      {
        name: "Ponta do Ouro Point",
        level: "Intermediate to Advanced",
        description: "Main right-hand point break - rocks & sand bottom, 100-200m rides (up to 1km when firing!)"
      },
      {
        name: "Beach Breaks",
        level: "Beginner to Intermediate",
        description: "Mellow beach breaks perfect for learning - softer waves, sandy bottom"
      },
      {
        name: "Ponta Malongane (8km north)",
        level: "All levels",
        description: "Alternative spot with different swell window - less crowded"
      }
    ],
    operators: [
      {
        name: "Spigs Surfs Up Mozambique",
        website: "https://www.instagram.com/spigssurfsup/",
        email: "info@spigssurfsup.com",
        specialty: "Surf school, lessons, rentals, SUP, kayaks - all ages welcome"
      }
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
    forecastResources: [
      {
        name: "Surfline",
        url: "https://www.surfline.com/surf-report/ponta-de-ouro/584204214e65fad6a7709c99"
      },
      {
        name: "Surf-Forecast",
        url: "https://www.surf-forecast.com/breaks/Ponta-do-Ouro"
      },
      {
        name: "Magicseaweed",
        url: "https://magicseaweed.com/Ponta-do-Ouro-Surf-Guide/824/"
      }
    ]
  }
};

// api/experience-inquiry.js
async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const body = await context.request.json();
    const { name, email, phone, operator, dates, guests, message, experience, experienceKey, lang, currency, recaptcha_token } = body;
    if (!recaptcha_token) {
      return new Response(JSON.stringify({ error: "reCAPTCHA verification required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${context.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`
    });
    const recaptchaResult = await recaptchaResponse.json();
    if (!recaptchaResult.success) {
      console.error("reCAPTCHA verification failed:", recaptchaResult);
      return new Response(JSON.stringify({ error: "reCAPTCHA verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (recaptchaResult.action && recaptchaResult.action !== "experience_inquiry") {
      console.warn("reCAPTCHA action mismatch:", recaptchaResult.action, "expected: experience_inquiry");
      return new Response(JSON.stringify({ error: "Invalid security token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (recaptchaResult.score !== void 0 && recaptchaResult.score < 0.3) {
      console.warn("reCAPTCHA score too low (bot detected):", recaptchaResult.score);
      return new Response(JSON.stringify({ error: "Security verification failed. Please try again." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!name || !email || !operator || !message || !experience) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const sanitize = /* @__PURE__ */ __name((str) => String(str).replace(/[<>]/g, "").trim(), "sanitize");
    const sanitizedName = sanitize(name).slice(0, 100);
    const sanitizedEmail = sanitize(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitize(phone).slice(0, 30) : "";
    const sanitizedOperator = sanitize(operator).slice(0, 100);
    const sanitizedDates = dates ? sanitize(dates).slice(0, 100) : "";
    const sanitizedGuests = guests ? sanitize(guests).slice(0, 10) : "2";
    const sanitizedMessage = sanitize(message).slice(0, 2e3);
    const sanitizedExperience = sanitize(experience).slice(0, 200);
    const sanitizedLang = lang ? sanitize(lang).slice(0, 10) : "en";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const expData = EXPERIENCE_DETAILS[experienceKey];
    const operatorData = expData?.operators?.find((op) => op.name === sanitizedOperator);
    if (!operatorData) {
      console.error("Operator not found:", sanitizedOperator, "for experience:", experienceKey);
      return new Response(JSON.stringify({ error: "Invalid operator selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const operatorEmail = operatorData.email;
    const escapeHtml2 = /* @__PURE__ */ __name((text) => text.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]), "escapeHtml");
    const messageForTranslation = `From: ${sanitizedName}
Email: ${sanitizedEmail}
Dates: ${sanitizedDates || "Not specified"}
Guests: ${sanitizedGuests}

Message:
${sanitizedMessage}`;
    const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(messageForTranslation)}&op=translate`;
    const operatorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Experience Inquiry from DEVOCEAN Lodge</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Experience:</strong> ${escapeHtml2(sanitizedExperience)}</p>
          <p><strong>Name:</strong> ${escapeHtml2(sanitizedName)}</p>
          <p><strong>Email:</strong> ${escapeHtml2(sanitizedEmail)}</p>
          ${sanitizedPhone ? `<p><strong>Phone:</strong> ${escapeHtml2(sanitizedPhone)}</p>` : ""}
          ${sanitizedDates ? `<p><strong>Preferred Dates:</strong> ${escapeHtml2(sanitizedDates)}</p>` : ""}
          <p><strong>Number of Guests:</strong> ${escapeHtml2(sanitizedGuests)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml2(sanitizedMessage)}</p>
        </div>
        
        <!-- Google Translate Option -->
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <p style="margin: 0 0 10px 0; color: #1976D2; font-weight: bold;">\u{1F310} Need to translate this inquiry?</p>
          <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
            Click the button below to open this message in Google Translate. You can translate it to any language.
          </p>
          <a href="${translateUrl}" 
             target="_blank" 
             style="display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 5px;">
            Translate with Google
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This inquiry was forwarded from the DEVOCEAN Lodge website (devoceanlodge.com).
        </p>
      </div>
    `;
    const operatorEmailText = `
New Experience Inquiry from DEVOCEAN Lodge

Experience: ${sanitizedExperience}
Name: ${sanitizedName}
Email: ${sanitizedEmail}
${sanitizedPhone ? `Phone: ${sanitizedPhone}
` : ""}${sanitizedDates ? `Preferred Dates: ${sanitizedDates}
` : ""}Number of Guests: ${sanitizedGuests}

Message:
${sanitizedMessage}

---
This inquiry was forwarded from the DEVOCEAN Lodge website (devoceanlodge.com).
    `.trim();
    const bccEmail = experienceKey === "dolphins" ? "partners@devoceanlodge.com" : "info@devoceanlodge.com";
    const operatorResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "DEVOCEAN Lodge - Ponta do Ouro <reservations@devoceanlodge.com>",
        to: [operatorEmail],
        bcc: [bccEmail],
        subject: `Experience Inquiry: ${sanitizedExperience}`,
        html: operatorEmailHtml,
        text: operatorEmailText
      })
    });
    if (!operatorResponse.ok) {
      const errorText = await operatorResponse.text();
      console.error("Failed to send operator email:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send inquiry" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const autoReplyMessages = {
      en: `Thank you for your interest in ${sanitizedExperience}! Your inquiry has been forwarded to ${sanitizedOperator}. They will contact you directly via email or phone to confirm availability and provide pricing details.`,
      "pt-PT": `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrar\xE3o em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de pre\xE7o.`,
      "pt-BR": `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrar\xE3o em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de pre\xE7o.`,
      pt: `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrar\xE3o em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de pre\xE7o.`
    };
    const autoReplySubjects = {
      en: `Experience Inquiry Received - DEVOCEAN Lodge`,
      "pt-PT": `Consulta de Experi\xEAncia Recebida - DEVOCEAN Lodge`,
      "pt-BR": `Consulta de Experi\xEAncia Recebida - DEVOCEAN Lodge`,
      pt: `Consulta de Experi\xEAncia Recebida - DEVOCEAN Lodge`
    };
    const fieldLabels = {
      experience: { en: "Experience", "pt-PT": "Experi\xEAncia", "pt-BR": "Experi\xEAncia", pt: "Experi\xEAncia" },
      operator: { en: "Operator", "pt-PT": "Operador", "pt-BR": "Operador", pt: "Operador" },
      dates: { en: "Preferred Dates", "pt-PT": "Datas Preferidas", "pt-BR": "Datas Preferidas", pt: "Datas Preferidas" },
      guests: { en: "Number of Guests", "pt-PT": "N\xFAmero de Pessoas", "pt-BR": "N\xFAmero de Pessoas", pt: "N\xFAmero de Pessoas" },
      lodge_contact: {
        en: "Meanwhile, feel free to explore our accommodation options and book your stay at DEVOCEAN Lodge.",
        "pt-PT": "Enquanto isso, sinta-se \xE0 vontade para explorar nossas op\xE7\xF5es de acomoda\xE7\xE3o e reservar sua estadia no DEVOCEAN Lodge.",
        "pt-BR": "Enquanto isso, sinta-se \xE0 vontade para explorar nossas op\xE7\xF5es de acomoda\xE7\xE3o e reservar sua estadia no DEVOCEAN Lodge.",
        pt: "Enquanto isso, sinta-se \xE0 vontade para explorar nossas op\xE7\xF5es de acomoda\xE7\xE3o e reservar sua estadia no DEVOCEAN Lodge."
      }
    };
    const getLabel = /* @__PURE__ */ __name((field) => fieldLabels[field] && fieldLabels[field][sanitizedLang] || fieldLabels[field] && fieldLabels[field].en || field, "getLabel");
    const autoReplyMessage = autoReplyMessages[sanitizedLang] || autoReplyMessages.en;
    const autoReplySubject = autoReplySubjects[sanitizedLang] || autoReplySubjects.en;
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">DEVOCEAN Lodge</h2>
        <p>${autoReplyMessage}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${getLabel("experience")}:</strong> ${escapeHtml2(sanitizedExperience)}</p>
          <p><strong>${getLabel("operator")}:</strong> ${escapeHtml2(sanitizedOperator)}</p>
          ${sanitizedDates ? `<p><strong>${getLabel("dates")}:</strong> ${escapeHtml2(sanitizedDates)}</p>` : ""}
          <p><strong>${getLabel("guests")}:</strong> ${escapeHtml2(sanitizedGuests)}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          ${getLabel("lodge_contact")}
        </p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            DEVOCEAN Lodge<br>
            Ponta do Ouro, Mozambique<br>
            <a href="https://devoceanlodge.com">devoceanlodge.com</a>
          </p>
        </div>
      </div>
    `;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "DEVOCEAN Lodge - Ponta do Ouro <reservations@devoceanlodge.com>",
        to: [sanitizedEmail],
        subject: autoReplySubject,
        html: autoReplyHtml
      })
    });
    console.log(`Experience inquiry sent: ${sanitizedExperience} to ${sanitizedOperator} (${operatorEmail})`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Experience inquiry error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest, "onRequest");

// [key].txt.js
async function onRequest2(context) {
  const { params } = context;
  const key = params.key;
  if (key === "4339cd9fe9f2766ae7f04b21f3848dec") {
    return new Response(key, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }
  return new Response("Not Found", { status: 404 });
}
__name(onRequest2, "onRequest");

// _middleware.js
async function onRequest3(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.hostname.endsWith(".pages.dev")) {
    const mainDomain = "https://devoceanlodge.com";
    const redirectUrl = mainDomain + url.pathname + url.search;
    return new Response(null, {
      status: 301,
      headers: {
        "Location": redirectUrl
      }
    });
  }
  const countryCode = request.cf?.country || null;
  const response = await context.next();
  if (response.headers.get("content-type")?.includes("text/html")) {
    let html = await response.text();
    const injection = `<script>window.__CF_COUNTRY__="${countryCode || ""}";<\/script>`;
    html = html.replace("<head>", `<head>${injection}`);
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(html, {
      status: response.status,
      headers
    });
  }
  return response;
}
__name(onRequest3, "onRequest");

// ../.wrangler/tmp/pages-CJboUm/functionsRoutes-0.5386691032630111.mjs
var routes = [
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/experience-inquiry",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/:key.txt",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest3],
    modules: []
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
