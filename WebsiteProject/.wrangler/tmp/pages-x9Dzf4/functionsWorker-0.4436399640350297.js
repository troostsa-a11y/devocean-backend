var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/contact.js
var sanitizeHeader = /* @__PURE__ */ __name((str) => String(str).replace(/[\r\n<>]/g, "").trim(), "sanitizeHeader");
var sanitizeMessage = /* @__PURE__ */ __name((str) => String(str).replace(/\r\n/g, "\n").replace(/\r/g, "").trim(), "sanitizeMessage");
var escapeHtml = /* @__PURE__ */ __name((text) => text.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m), "escapeHtml");
var autoReplyContent = {
  en: {
    subject: "\u2705 Thank you for contacting DEVOCEAN Lodge",
    heading: "Thank you for contacting us!",
    greeting: "Dear",
    body: "We have received your message and will get back to you as soon as possible.",
    closing: "Warm regards,"
  },
  pt: {
    subject: "\u2705 Obrigado por entrar em contato com o DEVOCEAN Lodge",
    heading: "Obrigado por entrar em contato!",
    greeting: "Caro(a)",
    body: "Recebemos a sua mensagem e entraremos em contato em breve.",
    closing: "Cumprimentos cordiais,"
  },
  es: {
    subject: "\u2705 Gracias por contactar a DEVOCEAN Lodge",
    heading: "\xA1Gracias por contactarnos!",
    greeting: "Estimado/a",
    body: "Hemos recibido su mensaje y nos pondremos en contacto con usted lo antes posible.",
    closing: "Saludos cordiales,"
  },
  fr: {
    subject: "\u2705 Merci d'avoir contact\xE9 DEVOCEAN Lodge",
    heading: "Merci de nous avoir contact\xE9s !",
    greeting: "Cher/Ch\xE8re",
    body: "Nous avons bien re\xE7u votre message et nous vous r\xE9pondrons dans les plus brefs d\xE9lais.",
    closing: "Cordialement,"
  },
  de: {
    subject: "\u2705 Vielen Dank f\xFCr Ihre Kontaktaufnahme mit DEVOCEAN Lodge",
    heading: "Vielen Dank f\xFCr Ihre Nachricht!",
    greeting: "Sehr geehrte/r",
    body: "Wir haben Ihre Nachricht erhalten und werden uns so schnell wie m\xF6glich bei Ihnen melden.",
    closing: "Mit freundlichen Gr\xFC\xDFen,"
  },
  it: {
    subject: "\u2705 Grazie per aver contattato DEVOCEAN Lodge",
    heading: "Grazie per averci contattato!",
    greeting: "Gentile",
    body: "Abbiamo ricevuto il suo messaggio e la contatteremo al pi\xF9 presto.",
    closing: "Cordiali saluti,"
  },
  nl: {
    subject: "\u2705 Bedankt voor het contact opnemen met DEVOCEAN Lodge",
    heading: "Bedankt voor uw bericht!",
    greeting: "Beste",
    body: "We hebben uw bericht ontvangen en nemen zo spoedig mogelijk contact met u op.",
    closing: "Met vriendelijke groet,"
  },
  ru: {
    subject: "\u2705 \u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432 DEVOCEAN Lodge",
    heading: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0432\u0430\u0448\u0435 \u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0435!",
    greeting: "\u0423\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0439/\u0430\u044F",
    body: "\u041C\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u0432\u0430\u0448\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438 \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0432 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F.",
    closing: "\u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435\u043C,"
  },
  zh: {
    subject: "\u2705 \u611F\u8C22\u60A8\u8054\u7CFB DEVOCEAN Lodge",
    heading: "\u611F\u8C22\u60A8\u8054\u7CFB\u6211\u4EEC\uFF01",
    greeting: "\u5C0A\u656C\u7684",
    body: "\u6211\u4EEC\u5DF2\u6536\u5230\u60A8\u7684\u6D88\u606F\uFF0C\u5C06\u5C3D\u5FEB\u4E0E\u60A8\u8054\u7CFB\u3002",
    closing: "\u6B64\u81F4\u656C\u793C\uFF0C"
  },
  ja: {
    subject: "\u2705 DEVOCEAN Lodge\u3078\u306E\u304A\u554F\u3044\u5408\u308F\u305B\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059",
    heading: "\u304A\u554F\u3044\u5408\u308F\u305B\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01",
    greeting: "",
    body: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u53D7\u4FE1\u3044\u305F\u3057\u307E\u3057\u305F\u3002\u3067\u304D\u308B\u3060\u3051\u65E9\u304F\u3054\u9023\u7D61\u3044\u305F\u3057\u307E\u3059\u3002",
    closing: "\u656C\u5177\u3001"
  },
  pl: {
    subject: "\u2705 Dzi\u0119kujemy za kontakt z DEVOCEAN Lodge",
    heading: "Dzi\u0119kujemy za kontakt!",
    greeting: "Szanowny/a",
    body: "Otrzymali\u015Bmy Twoj\u0105 wiadomo\u015B\u0107 i skontaktujemy si\u0119 z Tob\u0105 tak szybko, jak to mo\u017Cliwe.",
    closing: "Z powa\u017Caniem,"
  },
  sv: {
    subject: "\u2705 Tack f\xF6r att du kontaktade DEVOCEAN Lodge",
    heading: "Tack f\xF6r ditt meddelande!",
    greeting: "K\xE4ra",
    body: "Vi har tagit emot ditt meddelande och \xE5terkommer till dig s\xE5 snart som m\xF6jligt.",
    closing: "V\xE4nliga h\xE4lsningar,"
  },
  af: {
    subject: "\u2705 Dankie dat jy DEVOCEAN Lodge gekontak het",
    heading: "Dankie vir jou boodskap!",
    greeting: "Geagte",
    body: "Ons het jou boodskap ontvang en sal so gou as moontlik met jou kontak maak.",
    closing: "Vriendelike groete,"
  },
  zu: {
    subject: "\u2705 Siyabonga ngokuxhumana ne-DEVOCEAN Lodge",
    heading: "Siyabonga ngomlayezo wakho!",
    greeting: "Sawubona",
    body: "Sithole umlayezo wakho futhi sizokuxhumana maduze.",
    closing: "Ozithobayo,"
  },
  sw: {
    subject: "\u2705 Asante kwa kuwasiliana na DEVOCEAN Lodge",
    heading: "Asante kwa ujumbe wako!",
    greeting: "Mpendwa",
    body: "Tumepokea ujumbe wako na tutawasiliana nawe hivi karibuni.",
    closing: "Kwa heshima,"
  }
};
async function verifyRecaptcha(token, action, secretKey) {
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secretKey}&response=${token}`
  });
  const data = await response.json();
  if (!data.success) {
    return { success: false, error: "reCAPTCHA verification failed" };
  }
  if (data.action !== action) {
    return { success: false, error: "reCAPTCHA action mismatch" };
  }
  if (data.score < 0.5) {
    return { success: false, error: "reCAPTCHA score too low" };
  }
  return { success: true };
}
__name(verifyRecaptcha, "verifyRecaptcha");
async function sendEmail(from, to, subject, html, apiKey, replyTo) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `DEVOCEAN Lodge <${from}>`,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || from,
      subject,
      html
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  return await response.json();
}
__name(sendEmail, "sendEmail");
async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://devoceanlodge.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { name, email, phone, message, lang, recaptcha_token, website, checkin_iso, checkout_iso, unit, currency } = await request.json();
    if (website && website.trim() !== "") {
      console.log("\u26A0\uFE0F Honeypot triggered - potential spam submission");
      return new Response(JSON.stringify({ error: "Spam detected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const verification = await verifyRecaptcha(recaptcha_token, "contact_form", env.RECAPTCHA_SECRET_KEY);
    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const senderIP = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0] || "Unknown";
    const normalizeLang = /* @__PURE__ */ __name((langCode) => {
      if (!langCode) return "en";
      const normalized = String(langCode).toLowerCase().split("-")[0];
      const supported = ["en", "pt", "es", "fr", "de", "it", "nl", "ru", "zh", "ja", "ar", "pl", "cs", "tr", "sv", "da", "fi", "af", "zu", "sw"];
      return supported.includes(normalized) ? normalized : "en";
    }, "normalizeLang");
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitizeHeader(phone).slice(0, 30) : "";
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2e3);
    const sanitizedLang = normalizeLang(lang);
    const sanitizedCheckin = checkin_iso ? sanitizeHeader(checkin_iso).slice(0, 10) : "";
    const sanitizedCheckout = checkout_iso ? sanitizeHeader(checkout_iso).slice(0, 10) : "";
    const sanitizedUnit = unit ? sanitizeHeader(unit).slice(0, 100) : "";
    const sanitizedCurrency = currency ? sanitizeHeader(currency).slice(0, 10) : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const formatDate = /* @__PURE__ */ __name((isoDate) => {
      if (!isoDate) return "";
      try {
        const date = new Date(isoDate);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      } catch {
        return isoDate;
      }
    }, "formatDate");
    const lodgeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Contact Form Submission</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
          ${sanitizedPhone ? `<p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>` : ""}
          <p><strong>IP Address:</strong> ${escapeHtml(senderIP)}</p>
          
          ${sanitizedCheckin || sanitizedCheckout || sanitizedUnit || sanitizedCurrency ? `
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="margin-bottom: 10px;"><strong>Stay Details:</strong></p>
          ${sanitizedCheckin ? `<p style="margin: 5px 0;">\u2022 <strong>Check-in:</strong> ${escapeHtml(formatDate(sanitizedCheckin))}</p>` : ""}
          ${sanitizedCheckout ? `<p style="margin: 5px 0;">\u2022 <strong>Check-out:</strong> ${escapeHtml(formatDate(sanitizedCheckout))}</p>` : ""}
          ${sanitizedUnit ? `<p style="margin: 5px 0;">\u2022 <strong>Unit Preference:</strong> ${escapeHtml(sanitizedUnit)}</p>` : ""}
          ${sanitizedCurrency ? `<p style="margin: 5px 0;">\u2022 <strong>Currency:</strong> ${escapeHtml(sanitizedCurrency)}</p>` : ""}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          ` : ""}
          
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
        </div>
        <p style="color: #666; font-size: 12px;">Sent from devoceanlodge.com contact form</p>
      </div>
    `;
    await sendEmail(
      "reservations@devoceanlodge.com",
      "reservations@devoceanlodge.com",
      `Contact Form: ${sanitizedName}`,
      lodgeEmailHtml,
      env.RESEND_API_KEY,
      sanitizedEmail
    );
    const t = autoReplyContent[sanitizedLang] || autoReplyContent.en;
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">${t.heading}</h2>
        <p>${t.greeting} ${escapeHtml(sanitizedName)},</p>
        <p>${t.body}</p>
        <p style="margin-top: 20px;">${t.closing}</p>
        
        <table style="padding-bottom:10px;margin-bottom:8px" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><table style="display: inline-flex; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td style="vertical-align: top;"><table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><img src="https://cdn.trustindex.io/companies/ca/caf207364508g84f/media/devocean-logo-trustindex.png" alt="Sean & the Team" style="vertical-align:initial; max-width:80px;" width="80" height="80"></td></tr></tbody></table></td><td style="padding-left: 14px; "></td><td style="border-left: 2px solid #ccc; padding-right: 14px; "></td><td style="vertical-align: top;"><table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><table style="line-height: 1.5em; font-family: sans-serif; font-size: 14px; color: #000000; font-weight: normal; width: 100%;" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><span style="color: rgb(0, 0, 0); font-family: sans-serif; font-size: 14px; font-weight: bold; line-height: 1.5em;">Sean & the Team</span><br><span style="color: rgb(0, 0, 0); font-family: sans-serif; font-size: 13px; line-height: 1.5em;">DEVOCEAN Lodge</span></td></tr></tbody></table></td></tr><tr><td><table style="line-height: 1.5em;  font-family: sans-serif; font-size: 14px; color: #000000;  font-weight: normal; width: 100%;" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td style=" font-family: sans-serif; font-size:14px; color: #000000 !important;"><div style="font-family: sans-serif; font-size:14px; line-height: 1.5em; "><span style="padding: 0px; margin: 0px; color: rgb(0, 0, 0); font-family: sans-serif; font-weight: bold; font-size: 13px; line-height: 1.5em;">WhatsApp:</span> <span style="font-family: sans-serif; line-height: 1.5em; text-decoration: none !important; font-size: 13px; color: rgb(0, 0, 0) !important;"><span style="font-size: 13px;">+258 8441 82252 (text only)</span></span></div><div style="font-family: sans-serif; font-size:14px; line-height: 1.5em; "><span style="padding: 0px; margin: 0px; color: rgb(0, 0, 0); font-family: sans-serif; font-weight: bold; font-size: 13px; line-height: 1.5em;">Email:</span> <span style="font-size: 13px;"><a style="text-decoration: none !important;  font-family: sans-serif; font-size:14px !important;  color: #000 !important; line-height: 1.5em; " href="mailto:reservations@devoceanlodge.com"><span style="font-size: 13px;">reservations@devoceanlodge.com</span></a></span></div><div style="font-family: sans-serif; font-size:14px; line-height: 1.5em; "><span style="padding: 0px; margin: 0px; color: rgb(0, 0, 0); font-family: sans-serif; font-weight: bold; font-size: 13px; line-height: 1.5em;">Website:</span> <span style="font-size: 13px;"><a style="text-decoration: none !important;  font-family: sans-serif; font-size:14px !important;  color: #000 !important; line-height: 1.5em; " href="https://www.devoceanlodge.com" target="_blank"><span style="font-size: 13px;">www.devoceanlodge.com</span></a></span></div></td></tr><tr><td><span style="padding-top: 15px;"></span></td></tr><tr><td style="padding-top: 12px;"><span style="text-decoration: none !important;"><table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><a href="https://www.trustindex.io/reviews/devoceanlodge.com" target="_blank" style="text-decoration: none !important;"><img alt="Rating stars" src="https://cdn.trustindex.io/widgets/f8/f84f86256ecd97105106ecc69e4/stars.gif" style="display: block;" width="105"></a></td></tr><tr><td><a href="https://www.trustindex.io/reviews/devoceanlodge.com" target="_blank" style="text-decoration: none !important;"><img alt="Rating text" src="https://cdn.trustindex.io/widgets/f8/f84f86256ecd97105106ecc69e4/text.gif" style="display: block;" width="105"></a></td></tr></tbody></table></span></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td></td></tr></tbody></table>
      </div>
    `;
    await sendEmail(
      "reservations@devoceanlodge.com",
      sanitizedEmail,
      t.subject,
      autoReplyHtml,
      env.RESEND_API_KEY,
      "reservations@devoceanlodge.com"
    );
    console.log(`\u2705 Contact form submission from ${sanitizedName} (${sanitizedEmail}) - IP: ${senderIP}${sanitizedCheckin ? ` - Dates: ${sanitizedCheckin} to ${sanitizedCheckout}` : ""}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");

// api/experience-inquiry.js
var sanitizeHeader2 = /* @__PURE__ */ __name((str) => String(str).replace(/[\r\n<>]/g, "").trim(), "sanitizeHeader");
var sanitizeMessage2 = /* @__PURE__ */ __name((str) => String(str).replace(/\r\n/g, "\n").replace(/\r/g, "").trim(), "sanitizeMessage");
var escapeHtml2 = /* @__PURE__ */ __name((text) => text.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m), "escapeHtml");
async function verifyRecaptcha2(token, action, secretKey) {
  if (!secretKey) {
    console.log("\u26A0\uFE0F  Development mode: Skipping reCAPTCHA verification");
    return { success: true };
  }
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secretKey}&response=${token}`
  });
  const data = await response.json();
  if (!data.success) {
    return { success: false, error: "reCAPTCHA verification failed" };
  }
  if (data.action !== action) {
    return { success: false, error: "reCAPTCHA action mismatch" };
  }
  if (data.score < 0.5) {
    return { success: false, error: "reCAPTCHA score too low" };
  }
  return { success: true };
}
__name(verifyRecaptcha2, "verifyRecaptcha");
async function sendEmail2(from, to, subject, html, apiKey, replyTo, bcc = null) {
  const payload = {
    from: `DEVOCEAN Lodge <${from}>`,
    to: Array.isArray(to) ? to : [to],
    reply_to: replyTo || from,
    subject,
    html
  };
  if (bcc) {
    payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  return await response.json();
}
__name(sendEmail2, "sendEmail");
async function onRequestPost2(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://devoceanlodge.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const requestBody = await request.json();
    const { name, email, phone, operator, dates, guests, message, experience, experienceKey, lang, recaptcha_token, operatorEmail } = requestBody;
    console.log("Received request body:", JSON.stringify(requestBody));
    const verification = await verifyRecaptcha2(recaptcha_token, "experience_inquiry", env.RECAPTCHA_SECRET_KEY);
    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!name || !email || !operator || !message || !experience || !operatorEmail) {
      console.error("MISSING FIELDS:", { name: !!name, email: !!email, operator: !!operator, message: !!message, experience: !!experience, operatorEmail: !!operatorEmail });
      return new Response(JSON.stringify({
        error: "Missing required fields",
        missing: { name: !name, email: !email, operator: !operator, message: !message, experience: !experience, operatorEmail: !operatorEmail }
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const sanitizedName = sanitizeHeader2(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader2(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitizeHeader2(phone).slice(0, 30) : "";
    const sanitizedOperator = sanitizeHeader2(operator).slice(0, 100);
    const sanitizedOperatorEmail = sanitizeHeader2(operatorEmail).slice(0, 100);
    const sanitizedDates = dates ? sanitizeHeader2(dates).slice(0, 100) : "";
    const sanitizedGuests = guests ? sanitizeHeader2(guests).slice(0, 10) : "2";
    const sanitizedMessage = sanitizeMessage2(message).slice(0, 2e3);
    const sanitizedExperience = sanitizeHeader2(experience).slice(0, 200);
    const sanitizedLang = lang ? sanitizeHeader2(lang).slice(0, 10) : "en";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail) || !emailRegex.test(sanitizedOperatorEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
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
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <p style="margin: 0 0 10px 0; color: #1976D2; font-weight: bold;">\u{1F310} Need to translate this inquiry?</p>
          <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">Click the button below to open this message in Google Translate.</p>
          <a href="${translateUrl}" target="_blank" style="display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Translate with Google</a>
        </div>
        <p style="color: #666; font-size: 12px;">This inquiry was forwarded from the DEVOCEAN Lodge website (devoceanlodge.com).</p>
      </div>
    `;
    const bccEmail = "partners@devoceanlodge.com";
    const isTestMode = sanitizedMessage.toLowerCase().includes("[test]");
    const finalOperatorEmail = isTestMode ? "info@devoceanlodge.com" : sanitizedOperatorEmail;
    const finalBccEmail = isTestMode ? null : bccEmail;
    await sendEmail2(
      "reservations@devoceanlodge.com",
      finalOperatorEmail,
      `${isTestMode ? "[TEST] " : ""}Experience Inquiry: ${sanitizedExperience}`,
      operatorEmailHtml,
      env.RESEND_API_KEY,
      sanitizedEmail,
      finalBccEmail
    );
    const autoReplyMessages = {
      en: `Thank you for your interest in ${sanitizedExperience}! Your inquiry has been forwarded to ${sanitizedOperator}. They will contact you directly via email or phone to confirm availability and provide pricing details.`,
      "pt-PT": `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrar\xE3o em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de pre\xE7o.`,
      "pt-BR": `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrar\xE3o em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de pre\xE7o.`,
      pt: `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrar\xE3o em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de pre\xE7o.`
    };
    const autoReplySubjects = {
      en: "Experience Inquiry Received - DEVOCEAN Lodge",
      "pt-PT": "Consulta de Experi\xEAncia Recebida - DEVOCEAN Lodge",
      "pt-BR": "Consulta de Experi\xEAncia Recebida - DEVOCEAN Lodge",
      pt: "Consulta de Experi\xEAncia Recebida - DEVOCEAN Lodge"
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
    const getLabel = /* @__PURE__ */ __name((field) => fieldLabels[field]?.[sanitizedLang] || fieldLabels[field]?.en || field, "getLabel");
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">DEVOCEAN Lodge</h2>
        <p>${autoReplyMessages[sanitizedLang] || autoReplyMessages.en}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${getLabel("experience")}:</strong> ${escapeHtml2(sanitizedExperience)}</p>
          <p><strong>${getLabel("operator")}:</strong> ${escapeHtml2(sanitizedOperator)}</p>
          ${sanitizedDates ? `<p><strong>${getLabel("dates")}:</strong> ${escapeHtml2(sanitizedDates)}</p>` : ""}
          <p><strong>${getLabel("guests")}:</strong> ${escapeHtml2(sanitizedGuests)}</p>
        </div>
        <p>${getLabel("lodge_contact")}</p>
        <p style="margin-top: 20px;">Warm regards,<br/>The DEVOCEAN Lodge Team</p>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
          <p>DEVOCEAN Lodge | Ponta do Ouro, Mozambique</p>
          <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
        </div>
      </div>
    `;
    await sendEmail2(
      "reservations@devoceanlodge.com",
      sanitizedEmail,
      autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
      autoReplyHtml,
      env.RESEND_API_KEY,
      "reservations@devoceanlodge.com"
    );
    console.log(`\u2705 Experience inquiry from ${sanitizedName} for ${sanitizedExperience}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Experience inquiry error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost");

// [key].txt.js
async function onRequest(context) {
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
__name(onRequest, "onRequest");

// _middleware.js
async function onRequest2(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.hostname === "book.devoceanlodge.com") {
    const redirectUrl = "https://devoceanlodge.com/book/EN.html" + url.search;
    return new Response(null, {
      status: 301,
      headers: {
        "Location": redirectUrl
      }
    });
  }
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
  if (response.status === 404) {
    const accept = request.headers.get("Accept") || "";
    const path = url.pathname;
    const isHtmlRequest = accept.includes("text/html");
    const hasFileExtension = /\.[a-z0-9]+$/i.test(path);
    const isApiRequest = path.startsWith("/api/");
    if (isHtmlRequest && !hasFileExtension && !isApiRequest) {
      const indexResponse = await context.env.ASSETS.fetch(new URL("/index.html", request.url));
      let html = await indexResponse.text();
      const injection = `<script>window.__CF_COUNTRY__="${countryCode || ""}";<\/script>`;
      html = html.replace("<head>", `<head>${injection}`);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }
    return response;
  }
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
__name(onRequest2, "onRequest");

// ../.wrangler/tmp/pages-x9Dzf4/functionsRoutes-0.9622320559170503.mjs
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
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/:key.txt",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest2],
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
