var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/booking/result/[ref].js
async function onRequestGet(context) {
  const { params, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json({ error: "Booking is not available right now." }, 503);
  }
  const ref = params.ref;
  if (!ref || typeof ref !== "string") {
    return json({ error: "Missing booking reference" }, 400);
  }
  try {
    const upstream = await fetch(
      `${automailerUrl}/api/booking/result/${encodeURIComponent(ref)}`,
      {
        method: "GET",
        headers: { "x-admin-key": adminKey }
      }
    );
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return json({ error: "Could not load booking status." }, 502);
  }
}
__name(onRequestGet, "onRequestGet");
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");

// api/booking/availability.js
async function onRequestPost(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json2({ error: "Booking is not available right now." }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json2({ error: "Invalid JSON" }, 400);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25e3);
  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
        "cf-ipcountry": request.headers.get("cf-ipcountry") || ""
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    clearTimeout(timeout);
    return json2({ error: "Could not load availability. Please try again." }, 502);
  }
}
__name(onRequestPost, "onRequestPost");
function json2(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json2, "json");

// api/booking/calendar.js
async function onRequestGet2(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json3({ error: "Booking is not available right now." }, 503);
  }
  const search = new URL(request.url).search;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25e3);
  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/calendar${search}`, {
      method: "GET",
      headers: {
        "x-admin-key": adminKey,
        "cf-ipcountry": request.headers.get("cf-ipcountry") || ""
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    clearTimeout(timeout);
    return json3({ error: "Could not load the rate calendar." }, 502);
  }
}
__name(onRequestGet2, "onRequestGet");
function json3(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json3, "json");

// api/booking/checkout.js
async function onRequestPost2(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json4({ error: "Booking is not available right now." }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json4({ error: "Invalid JSON" }, 400);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25e3);
  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
        "cf-ipcountry": request.headers.get("cf-ipcountry") || ""
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    clearTimeout(timeout);
    return json4({ error: "Could not start checkout. Please try again." }, 502);
  }
}
__name(onRequestPost2, "onRequestPost");
function json4(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json4, "json");

// api/booking/nearest-available.js
async function onRequestPost3(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json5({ error: "Booking is not available right now." }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json5({ error: "Invalid JSON" }, 400);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25e3);
  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/nearest-available`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
        "cf-ipcountry": request.headers.get("cf-ipcountry") || ""
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    clearTimeout(timeout);
    return json5({ error: "Could not search for availability. Please try again." }, 502);
  }
}
__name(onRequestPost3, "onRequestPost");
function json5(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json5, "json");

// api/booking/quote.js
async function onRequestPost4(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json6({ error: "Booking is not available right now." }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json6({ error: "Invalid JSON" }, 400);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25e3);
  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
        "cf-ipcountry": request.headers.get("cf-ipcountry") || ""
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    clearTimeout(timeout);
    return json6({ error: "Could not update your quote. Please try again." }, 502);
  }
}
__name(onRequestPost4, "onRequestPost");
function json6(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json6, "json");

// api/gift-voucher/checkout.js
async function onRequestPost5(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json7({ error: "Gift vouchers are not available right now." }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json7({ error: "Invalid JSON" }, 400);
  }
  try {
    const upstream = await fetch(`${automailerUrl}/api/gift-voucher/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify(body)
    });
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return json7({ error: "Could not start checkout. Please try again." }, 502);
  }
}
__name(onRequestPost5, "onRequestPost");
function json7(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json7, "json");

// api/gift-voucher/confirm.js
async function onRequestGet3(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json8({ error: "Service unavailable." }, 503);
  }
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return json8({ error: "Missing session_id" }, 400);
  }
  try {
    const upstream = await fetch(
      `${automailerUrl}/api/gift-voucher/confirm/${encodeURIComponent(sessionId)}`,
      {
        headers: { "x-admin-key": adminKey }
      }
    );
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return json8({ error: "Could not fetch confirmation. Please try again." }, 502);
  }
}
__name(onRequestGet3, "onRequestGet");
function json8(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json8, "json");

// api/gift-voucher/validate.js
async function onRequestGet4(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return json9({ error: "Service unavailable." }, 503);
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return json9({ error: "Missing code" }, 400);
  }
  try {
    const upstream = await fetch(
      `${automailerUrl}/api/gift-voucher/validate?code=${encodeURIComponent(code)}`,
      {
        headers: { "x-admin-key": adminKey }
      }
    );
    const data = await upstream.text();
    return new Response(data || "{}", {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return json9({ error: "Could not validate voucher. Please try again." }, 502);
  }
}
__name(onRequestGet4, "onRequestGet");
function json9(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json9, "json");

// _lib/captcha.js
var VALID_HOSTNAMES = /* @__PURE__ */ new Set([
  "devoceanlodge.com",
  "www.devoceanlodge.com",
  "localhost",
  "127.0.0.1"
]);
var VALID_HOSTNAME_SUFFIXES = [".devoceanlodge.pages.dev"];
function isValidHostname(hostname) {
  if (!hostname) return false;
  if (VALID_HOSTNAMES.has(hostname)) return true;
  if (hostname === "devoceanlodge.pages.dev") return true;
  return VALID_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}
__name(isValidHostname, "isValidHostname");
async function verifyRecaptcha(token, expectedAction, secretKey, minScore = 0.3) {
  if (!secretKey) {
    return { success: false, error: "reCAPTCHA not configured", code: "config" };
  }
  if (!token) {
    return { success: false, error: "Missing reCAPTCHA token", code: "missing" };
  }
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`
  });
  const data = await response.json();
  console.log(`[recaptcha] success=${data.success} action=${data.action} score=${data.score} hostname=${data.hostname}`);
  if (!data.success) {
    return { success: false, error: "reCAPTCHA verification failed", code: "failed", codes: data["error-codes"] };
  }
  if (data.action !== expectedAction) {
    return { success: false, error: "reCAPTCHA action mismatch", code: "action" };
  }
  if (!isValidHostname(data.hostname)) {
    return { success: false, error: "reCAPTCHA hostname mismatch", code: "hostname" };
  }
  if (typeof data.score === "number" && data.score < minScore) {
    return { success: false, error: "reCAPTCHA score too low", code: "score", score: data.score };
  }
  return { success: true, provider: "recaptcha", score: data.score };
}
__name(verifyRecaptcha, "verifyRecaptcha");
async function verifyTurnstile(token, expectedAction, secretKey, remoteip) {
  if (!secretKey) {
    return { success: false, error: "Turnstile not configured", code: "config" };
  }
  if (!token) {
    return { success: false, error: "Missing Turnstile token", code: "missing" };
  }
  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteip) body.append("remoteip", remoteip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  const data = await response.json();
  console.log(`[turnstile] success=${data.success} hostname=${data.hostname} action=${data.action}`);
  if (!data.success) {
    return { success: false, error: "Turnstile verification failed", code: "failed", codes: data["error-codes"] };
  }
  if (!isValidHostname(data.hostname)) {
    return { success: false, error: "Turnstile hostname mismatch", code: "hostname" };
  }
  if (expectedAction) {
    if (!data.action || data.action !== expectedAction) {
      return { success: false, error: "Turnstile action mismatch", code: "action" };
    }
  }
  return { success: true, provider: "turnstile" };
}
__name(verifyTurnstile, "verifyTurnstile");
async function verifyCaptcha({ recaptchaToken, turnstileToken, expectedAction, env, remoteip }) {
  if (turnstileToken) {
    const result = await verifyTurnstile(turnstileToken, expectedAction, env.TURNSTILE_SECRET_KEY, remoteip);
    if (result.success) return result;
    if (result.code !== "config") return result;
  }
  if (recaptchaToken) {
    return verifyRecaptcha(recaptchaToken, expectedAction, env.RECAPTCHA_SECRET_KEY);
  }
  return { success: false, error: "No verification token provided", code: "missing" };
}
__name(verifyCaptcha, "verifyCaptcha");

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
async function onRequestPost6(context) {
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
    const {
      name,
      email,
      phone,
      message,
      lang,
      recaptcha_token,
      turnstile_token,
      website,
      checkin_iso,
      checkout_iso,
      unit,
      currency
    } = await request.json();
    if (website && website.trim() !== "") {
      console.log("\u26A0\uFE0F Honeypot triggered - potential spam submission");
      return new Response(JSON.stringify({ error: "Spam detected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const verification = await verifyCaptcha({
      recaptchaToken: recaptcha_token,
      turnstileToken: turnstile_token,
      expectedAction: "contact_form",
      env,
      remoteip: request.headers.get("CF-Connecting-IP")
    });
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
__name(onRequestPost6, "onRequestPost");

// api/experience-inquiry.js
var OPERATOR_ALLOWLIST = /* @__PURE__ */ new Map([
  // Diving
  ["Back to Basics Adventures", "backtobasicsadventures@gmail.com"],
  ["Gozo Azul Diving", "natalie@gozo-azul.co.za"],
  ["Under Water Explorer", "herb@thewhaler.co.za"],
  ["Blowing Bubbles Diving", "info@blowingbubbles.co.za"],
  ["Shark Diving Mozambique", "info@sharkdivingmozambique.com"],
  ["Oceana Dive Center", "oceanamozdiving@gmail.com"],
  // Dolphins / Seafari
  ["Dolphin Encountours Research Center", "connect@dolphinencountours.org"],
  ["Dolphin Encountours", "info@dolphinencountours.org"],
  ["The Dolphin Centre", "info@thedolphincentre.com"],
  ["Gozo Azul", "info@gozo-azul.co.za"],
  // Safari
  ["Maputo National Park", "reservas@parquemaputo.gov.mz"],
  ["Transportes Mulungo", "transportesmulungo@gmail.com"],
  // Fishing
  ["Gozo Azul Fishing", "info@gozoazulmarine.com"],
  ["Mozambique Fishing Charters", "info@mozambiquefishincharters.co.za"],
  // Surfing
  ["Brasukas Bar & Surf", "brasukas.geral@gmail.com"]
]);
var sanitizeHeader2 = /* @__PURE__ */ __name((str) => String(str).replace(/[\r\n<>]/g, "").trim(), "sanitizeHeader");
var sanitizeMessage2 = /* @__PURE__ */ __name((str) => String(str).replace(/\r\n/g, "\n").replace(/\r/g, "").trim(), "sanitizeMessage");
var escapeHtml2 = /* @__PURE__ */ __name((text) => text.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m] || m), "escapeHtml");
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
async function onRequestPost7(context) {
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
    const {
      name,
      email,
      phone,
      operator,
      dates,
      guests,
      message,
      experience,
      experienceKey,
      lang,
      recaptcha_token,
      turnstile_token
    } = requestBody;
    const verification = await verifyCaptcha({
      recaptchaToken: recaptcha_token,
      turnstileToken: turnstile_token,
      expectedAction: "experience_inquiry",
      env,
      remoteip: request.headers.get("CF-Connecting-IP")
    });
    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!name || !email || !operator || !message || !experience) {
      console.error("MISSING FIELDS:", { name: !!name, email: !!email, operator: !!operator, message: !!message, experience: !!experience });
      return new Response(JSON.stringify({
        error: "Missing required fields",
        missing: { name: !name, email: !email, operator: !operator, message: !message, experience: !experience }
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const sanitizedName = sanitizeHeader2(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader2(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitizeHeader2(phone).slice(0, 30) : "";
    const sanitizedOperator = sanitizeHeader2(operator).slice(0, 100);
    const sanitizedDates = dates ? sanitizeHeader2(dates).slice(0, 100) : "";
    const sanitizedGuests = guests ? sanitizeHeader2(guests).slice(0, 10) : "2";
    const sanitizedMessage = sanitizeMessage2(message).slice(0, 2e3);
    const sanitizedExperience = sanitizeHeader2(experience).slice(0, 200);
    const sanitizedLang = lang ? sanitizeHeader2(lang).slice(0, 10) : "en";
    const resolvedOperatorEmail = OPERATOR_ALLOWLIST.get(sanitizedOperator);
    if (!resolvedOperatorEmail) {
      console.error("UNKNOWN OPERATOR:", sanitizedOperator);
      return new Response(JSON.stringify({ error: "Unknown operator" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
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
    const finalOperatorEmail = isTestMode ? "info@devoceanlodge.com" : resolvedOperatorEmail;
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
__name(onRequestPost7, "onRequestPost");

// api/fx.js
async function onRequestGet5({ request }) {
  const url = new URL(request.url);
  let base = (url.searchParams.get("base") || "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) base = "USD";
  try {
    const upstream = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      cf: { cacheTtl: 21600, cacheEverything: true }
    });
    const data = await upstream.json();
    const rates = data && data.result === "success" && data.rates ? data.rates : {};
    const ok = Object.keys(rates).length > 0;
    return jsonResponse({ base, rates }, ok ? 21600 : 300);
  } catch {
    return jsonResponse({ base, rates: {} }, 300);
  }
}
__name(onRequestGet5, "onRequestGet");
function jsonResponse(obj, maxAge) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${maxAge}`
    }
  });
}
__name(jsonResponse, "jsonResponse");

// api/static-map.js
async function onRequestGet6({ request, env }) {
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  const zoom = url.searchParams.get("zoom") || "13";
  let width = parseInt(url.searchParams.get("width"), 10);
  let height = parseInt(url.searchParams.get("height"), 10);
  let scale = parseInt(url.searchParams.get("scale"), 10);
  if (!Number.isFinite(width) || width <= 0) width = 640;
  if (!Number.isFinite(height) || height <= 0) height = 320;
  if (scale !== 1 && scale !== 2) scale = 1;
  width = Math.min(width, 640);
  height = Math.min(height, 640);
  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: "Missing lat/lng parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Map service not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&scale=${scale}&maptype=roadmap&markers=color:0x0EA5E9%7C${lat},${lng}&key=${apiKey}`;
  try {
    const upstream = await fetch(staticMapUrl, {
      cf: { cacheTtl: 86400, cacheEverything: true }
    });
    if (!upstream.ok) {
      throw new Error(`Google Maps API error: ${upstream.status}`);
    }
    const imageBuffer = await upstream.arrayBuffer();
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    console.error("Static map error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to generate map" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet6, "onRequestGet");

// api/track-session.js
async function onRequestPost8(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) {
    return new Response(JSON.stringify({ error: "Automailer not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { cid, lang, currency } = body;
  if (!cid || typeof cid !== "string" || cid.length > 64) {
    return new Response(JSON.stringify({ error: "Missing or invalid cid" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const country = request.headers.get("cf-ipcountry") || null;
  try {
    const upstream = await fetch(`${automailerUrl}/api/track-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify({ cid, lang, currency, country })
    });
    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost8, "onRequestPost");

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
  return context.next();
}
__name(onRequest, "onRequest");

// ../src/utils/routeDescriptions.js
var ROUTE_DESCRIPTIONS = {
  "/ponta-do-ouro": "Complete travel guide to Ponta do Ouro, Mozambique \u2014 pristine beaches, 1,200+ marine species, ethical dolphin swims, and whale watching June\u2013November.",
  "/getting-to-ponta-do-ouro": "Getting to Ponta do Ouro: via Kosi Bay border (13 km) or Maputo (120 km), by transfer or public transport. Border hours, road conditions and rental car rules.",
  "/ponta-do-ouro-without-4x4": "Yes, you can visit Ponta do Ouro without a 4\xD74. DEVOCEAN Lodge sits on a tarred village road. What is sandy, what is tarred, and how to get here.",
  "/ponta-do-ouro-accommodation": "DEVOCEAN Lodge sits in a tropical garden 300 metres from the beach in Ponta do Ouro. Safari tents, comfort tents, garden cottage and thatched chalet.",
  "/safari-tents-ponta-do-ouro": "DEVOCEAN Lodge offers two safari tents in Ponta do Ouro \u2014 a classic canvas tent on a raised platform and a Comfort Tent with en-suite bathroom. Book direct.",
  "/diving-dolphin-accommodation": "DEVOCEAN Lodge is a few minutes from Ponta do Ouro's dive operators and dolphin swim centre. Dive sites 10 m\u201347 m, resident dolphin pods year-round, whale watching June\u2013November.",
  "/book-direct": "Book direct at DEVOCEAN Lodge for the best rate. No booking fees, no OTA markup. Instant confirmation. Safari tents, cottage and chalet, Ponta do Ouro.",
  "/why-ponta": "Why visit Ponta do Ouro? Marine reserve, wild dolphins, humpback whales, world-class diving, big-game fishing and uncrowded beaches in Southern Africa.",
  "/story": "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro with plans for sustainable growth and local impact.",
  "/gift-vouchers": "Give the gift of a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Gift vouchers available for any accommodation type, valid for 12 months from purchase.",
  "/devocean-lodge-meals": "Breakfast is included at DEVOCEAN Lodge in Ponta do Ouro. Resident guests can also pre-order freshly prepared dinners from our in-house restaurant.",
  "/booking-confirmed": "Your booking at DEVOCEAN Lodge, Ponta do Ouro is confirmed.",
  "/gift-confirmed": "Your DEVOCEAN Lodge gift voucher purchase is confirmed.",
  "/admin": "DEVOCEAN Lodge admin area."
};

// ../src/i18n/localeCatalog.js
var DEFAULT_LOCALE = "en-GB";
var LOCALES = [
  { code: "en-GB", path: "", hreflang: "en-GB", label: "English (UK)" },
  { code: "en-US", path: "", hreflang: "en-US", label: "English (US)", indexable: false },
  { code: "pt-PT", path: "pt-pt", hreflang: "pt-PT", label: "Portugu\xEAs (Portugal)" },
  { code: "pt-BR", path: "pt-br", hreflang: "pt-BR", label: "Portugu\xEAs (Brasil)" },
  { code: "nl-NL", path: "nl", hreflang: "nl-NL", label: "Nederlands" },
  { code: "fr-FR", path: "fr", hreflang: "fr-FR", label: "Fran\xE7ais" },
  { code: "it-IT", path: "it", hreflang: "it-IT", label: "Italiano" },
  { code: "de-DE", path: "de", hreflang: "de-DE", label: "Deutsch" },
  { code: "es-ES", path: "es", hreflang: "es-ES", label: "Espa\xF1ol" },
  { code: "sv", path: "sv", hreflang: "sv", label: "Svenska" },
  { code: "pl", path: "pl", hreflang: "pl", label: "Polski" },
  { code: "ro", path: "ro", hreflang: "ro", label: "Rom\xE2n\u0103" },
  { code: "sr", path: "sr", hreflang: "sr", label: "Srpski" },
  { code: "hr", path: "hr", hreflang: "hr", label: "Hrvatski" },
  { code: "cs", path: "cs", hreflang: "cs", label: "\u010Ce\u0161tina" },
  { code: "tr", path: "tr", hreflang: "tr", label: "T\xFCrk\xE7e" },
  { code: "ja-JP", path: "ja", hreflang: "ja-JP", label: "\u65E5\u672C\u8A9E" },
  { code: "zh-CN", path: "zh-hans", hreflang: "zh-Hans", label: "\u4E2D\u6587\uFF08\u7B80\u4F53\uFF09" },
  { code: "ru", path: "ru", hreflang: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  { code: "af-ZA", path: "af", hreflang: "af-ZA", label: "Afrikaans" },
  { code: "zu", path: "zu", hreflang: "zu", label: "isiZulu" },
  { code: "sw", path: "sw", hreflang: "sw", label: "Kiswahili" }
];
var BY_CODE = new Map(LOCALES.map((locale) => [locale.code.toLowerCase(), locale]));
var BY_PATH = new Map(LOCALES.filter((locale) => locale.path).map((locale) => [locale.path, locale]));
var LEGACY_CODES = {
  en: "en-GB",
  "en-gb": "en-GB",
  "en-us": "en-US",
  pt: "pt-PT",
  "pt-pt": "pt-PT",
  "pt-br": "pt-BR",
  nl: "nl-NL",
  fr: "fr-FR",
  it: "it-IT",
  de: "de-DE",
  es: "es-ES",
  "sv-se": "sv",
  "pl-pl": "pl",
  "ja-jp": "ja-JP",
  "zh-cn": "zh-CN",
  zh: "zh-CN",
  "ru-ru": "ru",
  "af-za": "af-ZA",
  "zu-za": "zu",
  "sw-tz": "sw"
};
function normalizeLocale(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  return BY_CODE.get(key)?.code || (LEGACY_CODES[key] || null);
}
__name(normalizeLocale, "normalizeLocale");
function getLocale(value) {
  const normalized = normalizeLocale(value);
  return normalized ? BY_CODE.get(normalized.toLowerCase()) : null;
}
__name(getLocale, "getLocale");
function localeFromPath(pathname = "/") {
  const firstSegment = String(pathname).split("/").filter(Boolean)[0]?.toLowerCase();
  return firstSegment ? BY_PATH.get(firstSegment) || null : null;
}
__name(localeFromPath, "localeFromPath");
function stripLocalePrefix(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const locale = localeFromPath(path);
  if (!locale) return path;
  const remainder = path.slice(locale.path.length + 1);
  return remainder || "/";
}
__name(stripLocalePrefix, "stripLocalePrefix");
function localizedPath(pathname = "/", localeCode = DEFAULT_LOCALE) {
  const locale = getLocale(localeCode) || getLocale(DEFAULT_LOCALE);
  const basePath = stripLocalePrefix(pathname);
  if (!locale.path) return basePath;
  return basePath === "/" ? `/${locale.path}/` : `/${locale.path}${basePath}`;
}
__name(localizedPath, "localizedPath");
function localizedUrl(pathname, localeCode, search = "", hash = "") {
  const normalizedSearch = search && search !== "?" ? search.startsWith("?") ? search : `?${search}` : "";
  const normalizedHash = hash && hash !== "#" ? hash.startsWith("#") ? hash : `#${hash}` : "";
  return `${localizedPath(pathname, localeCode)}${normalizedSearch}${normalizedHash}`;
}
__name(localizedUrl, "localizedUrl");
function allHreflangPaths(pathname = "/") {
  return LOCALES.filter((locale) => locale.indexable !== false).map((locale) => ({
    ...locale,
    pathname: localizedPath(pathname, locale.code)
  }));
}
__name(allHreflangPaths, "allHreflangPaths");

// _middleware.js
var BASE_URL = "https://devoceanlodge.com";
function buildHreflang(pathname) {
  const pad = /* @__PURE__ */ __name((s, n) => s + " ".repeat(Math.max(0, n - s.length)), "pad");
  const lines = [
    `  <!-- hreflang alternate links \u2014 stable locale URLs -->`,
    `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}${localizedPath(pathname, DEFAULT_LOCALE)}" />`
  ];
  for (const { hreflang, pathname: localePath } of allHreflangPaths(pathname)) {
    lines.push(
      `  <link rel="alternate" hreflang="${pad(hreflang + '"', 11)} href="${BASE_URL}${localePath}" />`
    );
  }
  lines.push(`  <!-- /hreflang -->`);
  return lines.join("\n");
}
__name(buildHreflang, "buildHreflang");
var HREFLANG_BLOCK_RE = /<!-- hreflang alternate links[\s\S]*?<!-- \/hreflang -->/;
var EMPTY_HREFLANG = "<!-- /hreflang -->";
var EXPERIENCE_KEYS = /* @__PURE__ */ new Set(["diving", "dolphins", "seafari", "safari", "fishing", "surfing", "lighthouse"]);
var EXPERIENCE_META = {
  diving: {
    title: "Scuba Diving | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: "Scuba diving in Ponta do Ouro, Mozambique. Explore coral reefs, encounter dolphins and marine life. PADI certified dive centre. Book your dive adventure.",
    h1: "Scuba Diving in Ponta do Ouro, Mozambique",
    ogTitle: "Scuba Diving Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Dive 20+ named sites \u2014 coral reefs, dolphins, whale sharks. PADI certified dive centre, Ponta do Ouro Marine Reserve."
  },
  dolphins: {
    title: "Swim with Dolphins | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: "Swim with wild dolphins in Ponta do Ouro, Mozambique. Ethical ocean safari encounters with bottlenose dolphins in their natural habitat.",
    h1: "Ethical Wild Dolphin Swims in Ponta do Ouro",
    ogTitle: "Swim with Wild Dolphins | DEVOCEAN Lodge",
    ogDescription: "Ethical ocean safaris with 200+ resident Indo-Pacific bottlenose dolphins in Ponta do Ouro Marine Reserve."
  },
  seafari: {
    title: "Ocean Seafari | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: "Ocean seafari in Ponta do Ouro, Mozambique. Whale watching, dolphins, and marine wildlife boat tours. Experience the Indian Ocean wonders.",
    h1: "Whale Watching and Ocean Safaris in Ponta do Ouro",
    ogTitle: "Ocean Seafari Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Whale watching, dolphins and marine wildlife boat tours in the Ponta do Ouro Marine Reserve, Mozambique."
  },
  safari: {
    title: "African Wildlife Safari | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: "African wildlife safari near Ponta do Ouro, Mozambique. Day trips to Tembe Elephant Park and Maputo Special Reserve. See elephants, lions, and more.",
    h1: "Maputo National Park Game Safaris from Ponta do Ouro",
    ogTitle: "Wildlife Safari Near Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Day safaris to Maputo National Park \u2014 elephants, hippos, giraffes, zebras \u2014 from DEVOCEAN Lodge, Ponta do Ouro."
  },
  fishing: {
    title: "Deep Sea Fishing | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: "Deep sea fishing charters in Ponta do Ouro, Mozambique. Catch marlin, sailfish, and tuna. Professional fishing boats and experienced crew.",
    h1: "Deep Sea and Beach Fishing in Ponta do Ouro",
    ogTitle: "Deep Sea Fishing Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Black marlin, sailfish and yellowfin tuna fishing charters in the Mozambique Channel from Ponta do Ouro."
  },
  surfing: {
    title: "Surfing Ponta do Ouro | DEVOCEAN Lodge \u2014 Mozambique",
    description: "Surfing lessons and rentals in Ponta do Ouro, Mozambique. Learn to surf on pristine beaches. Beginner-friendly waves and experienced instructors.",
    h1: "Surfing Lessons and Board Rentals in Ponta do Ouro",
    ogTitle: "Surfing Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Surf a classic right-hand point break in Ponta do Ouro. Lessons and board rentals for beginners and experienced surfers."
  },
  lighthouse: {
    title: "Ponta do Ouro Lighthouse | DEVOCEAN Lodge \u2014 Mozambique",
    description: "Ponta do Ouro Lighthouse \u2014 historic landmark and scenic viewpoint in Southern Mozambique. Panoramic ocean views and photography spot.",
    h1: "Ponta do Ouro Lighthouse Walk and Ocean Viewpoint",
    ogTitle: "Ponta do Ouro Lighthouse | DEVOCEAN Lodge",
    ogDescription: "Historic lighthouse and panoramic viewpoint at the southern tip of Mozambique. Walking distance from DEVOCEAN Lodge."
  }
};
function buildExperienceStaticHtml(meta) {
  return `<div id="static-content">
<section>
  <h1>${meta.h1}</h1>
  <p>${meta.description}</p>
</section>
</div><!-- /static-content -->`;
}
__name(buildExperienceStaticHtml, "buildExperienceStaticHtml");
var ROUTE_META = {
  "/ponta-do-ouro": {
    title: "Ponta do Ouro Travel Guide | DEVOCEAN Lodge \u2014 Mozambique",
    description: ROUTE_DESCRIPTIONS["/ponta-do-ouro"],
    ogTitle: "Ponta do Ouro Travel Guide | DEVOCEAN Lodge",
    ogDescription: "Pristine beaches, world-class diving, humpback whale watching, ethical dolphin swims and Maputo National Park \u2014 all within reach of DEVOCEAN Lodge.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "TouristDestination", "@id": "https://devoceanlodge.com/ponta-do-ouro#destination", name: "Ponta do Ouro", description: "Pristine coastal village at the southern tip of Mozambique. Marine reserve, resident dolphin pods, whale watching, scuba diving and proximity to Maputo National Park.", url: "https://devoceanlodge.com/ponta-do-ouro", touristType: ["Scuba Diver", "Wildlife Enthusiast", "Beach Traveller", "Adventure Traveller"], geo: { "@type": "GeoCoordinates", latitude: -26.837, longitude: 32.893 } },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "How do I get to Ponta do Ouro?", acceptedAnswer: { "@type": "Answer", text: "The most common route is via the Kosi Bay border crossing from South Africa \u2014 13 km from the village. From Maputo it is approximately 120 km via the Maputo\u2013Katembe Bridge and the coastal road." } }, { "@type": "Question", name: "When is the best time to visit Ponta do Ouro?", acceptedAnswer: { "@type": "Answer", text: "April to November is the dry season with calmer seas and best diving visibility. August to October adds humpback whale watching. Dolphins are present year-round." } }, { "@type": "Question", name: "Is Ponta do Ouro suitable for families?", acceptedAnswer: { "@type": "Answer", text: "Yes. The village is quiet and safe. DEVOCEAN Lodge accommodates families across all unit types. Dolphin swims, snorkelling and beach walks are family-friendly activities." } }, { "@type": "Question", name: "What currency is used in Ponta do Ouro?", acceptedAnswer: { "@type": "Answer", text: "The local currency is the Mozambican Metical (MZN). South African Rand is widely accepted. USD and EUR can be exchanged locally. Card payments are limited \u2014 bring cash." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Ponta do Ouro Travel Guide", item: "https://devoceanlodge.com/ponta-do-ouro" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Why Ponta do Ouro?</h1>
  <p>A pristine coastal village at the southern tip of Mozambique, 13 km from the Kosi Bay border with South Africa. Gateway to 1,200+ marine species, ethical dolphin swims, humpback whale watching and the UNESCO-listed Maputo National Park.</p>
  <h2>World-Class Marine Adventures</h2>
  <p>The Ponta do Ouro Partial Marine Reserve is one of Southern Africa's most biodiverse marine protected areas. Year-round resident bottlenose dolphin pods, scuba diving from 10 m to 47 m, bull sharks, hammerheads, manta rays and humpback whales June\u2013November.</p>
  <h2>Wildlife Reserves at the Doorstep</h2>
  <p>Maputo National Park (UNESCO) is 30 km north \u2014 elephants, hippos, giraffes, zebras and 526+ bird species. iSimangaliso Wetland Park is 25 minutes away across the border.</p>
  <p><a href="/book-direct">Book direct at DEVOCEAN Lodge</a> \xB7 <a href="/ponta-do-ouro-accommodation">View accommodation</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/getting-to-ponta-do-ouro": {
    title: "Getting to Ponta do Ouro from Kosi Bay and Maputo | Travel Guide",
    description: ROUTE_DESCRIPTIONS["/getting-to-ponta-do-ouro"],
    ogTitle: "Getting to Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Via Kosi Bay border (13 km), from Maputo by road or transfer (120 km), or by public chapa. No 4\xD74 required to reach DEVOCEAN Lodge.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Do I need a visa to enter Mozambique at the Kosi Bay border?", acceptedAnswer: { "@type": "Answer", text: "Entry requirements depend on your nationality. Mozambique offers an online eVisa as well as visa-on-arrival at some crossings. Check the official Mozambique eVisa portal before travel." } }, { "@type": "Question", name: "What are the Kosi Bay border opening hours?", acceptedAnswer: { "@type": "Answer", text: "The Kosi Bay border is listed as open 08:00\u201317:00 daily. Always verify current hours before travel. Allow time to clear before 17:00 on busy days." } }, { "@type": "Question", name: "Can I take a normal car to Ponta do Ouro?", acceptedAnswer: { "@type": "Answer", text: "Yes. The main route from Kosi Bay border to the village is navigable by standard vehicles. DEVOCEAN Lodge is on a tarred road. No 4\xD74 required." } }, { "@type": "Question", name: "Is there public transport from the Kosi Bay border to Ponta do Ouro?", acceptedAnswer: { "@type": "Answer", text: "Yes. Shared chapas run between the border and village throughout the day, departing when full. Journey takes 20\u201330 minutes. DEVOCEAN Lodge is 150 m from the village transport terminal." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Getting to Ponta do Ouro", item: "https://devoceanlodge.com/getting-to-ponta-do-ouro" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Getting to Ponta do Ouro from Kosi Bay and Maputo</h1>
  <p>The most common route is via the Kosi Bay border crossing from South Africa \u2014 13 km from the village on a largely tarred road. From Maputo it is approximately 120 km via the Maputo\u2013Katembe Bridge. No 4\xD74 required to reach DEVOCEAN Lodge.</p>
  <h2>From South Africa via the Kosi Bay Border</h2>
  <p>The Kosi Bay border is open 08:00\u201317:00 daily. Shared chapas run from the border to the village throughout the day (20\u201330 min). DEVOCEAN Lodge is 150 m from the village transport terminal. Private transfers can be arranged.</p>
  <h2>From Maputo by Road or Transfer</h2>
  <p>Cross the Maputo\u2013Katembe Bridge and follow the coastal road south. Allow approximately 2 hours. A standard car is sufficient.</p>
  <p><a href="/book-direct">Book direct</a> \xB7 <a href="/ponta-do-ouro-without-4x4">Can I visit without a 4\xD74?</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/ponta-do-ouro-without-4x4": {
    title: "Visiting Ponta do Ouro Without a 4\xD74 | Complete Guide | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/ponta-do-ouro-without-4x4"],
    ogTitle: "Visiting Ponta do Ouro Without a 4\xD74 | DEVOCEAN Lodge",
    ogDescription: "Yes, you can visit Ponta do Ouro without a 4\xD74. DEVOCEAN Lodge sits on a tarred village road. What is sandy, what is tarred, and how to get here.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Is the road from the Kosi Bay border fully tarred?", acceptedAnswer: { "@type": "Answer", text: "It is largely tarred with some short sandy sections that can worsen after heavy rain. Under normal dry-season conditions (April\u2013November), a standard sedan handles it comfortably." } }, { "@type": "Question", name: "Can I reach the beach without a 4\xD74?", acceptedAnswer: { "@type": "Answer", text: "Yes. The main Ponta do Ouro beach is walkable from the lodge and from the village centre. No vehicle is needed to reach the beach on foot." } }, { "@type": "Question", name: "Can I visit Malongane without a 4\xD74?", acceptedAnswer: { "@type": "Answer", text: "Malongane is reached via deep coastal sand \u2014 a 4\xD74 is required to drive there. However, local bakkie taxis run the route and are an inexpensive way to visit without your own 4\xD74." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Visiting Without a 4\xD74", item: "https://devoceanlodge.com/ponta-do-ouro-without-4x4" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Visiting Ponta do Ouro Without a 4\xD74</h1>
  <p>Yes, you can visit Ponta do Ouro without a 4\xD74. DEVOCEAN Lodge is on a navigable road in the village centre. A standard car or public transport handles the full journey from the Kosi Bay border. The main beach is walkable from the lodge.</p>
  <h2>Road Conditions</h2>
  <p>The 13 km from the Kosi Bay border to the village is largely tarred, with a few short sandy sections that a standard sedan handles comfortably in dry conditions (April\u2013November). Malongane requires a 4\xD74 to drive, but local bakkie taxis run the route daily.</p>
  <p><a href="/book-direct">Book direct</a> \xB7 <a href="/getting-to-ponta-do-ouro">Full getting-here guide</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/ponta-do-ouro-accommodation": {
    title: "Accommodation in Ponta do Ouro Near the Beach | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/ponta-do-ouro-accommodation"],
    ogTitle: "Accommodation in Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Nine units across four types, 300 m from the beach. Safari tents, comfort tents, garden cottage and thatched chalet. Breakfast included. Best rates direct.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "LodgingBusiness", "@id": "https://devoceanlodge.com/#lodge", name: "DEVOCEAN Lodge", url: "https://devoceanlodge.com", description: "Family-run eco-lodge in Ponta do Ouro, Southern Mozambique. Nine units across four accommodation types set in a lush tropical garden approximately 300 metres from the beach.", address: { "@type": "PostalAddress", addressLocality: "Ponta do Ouro", addressCountry: "MZ" }, amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Breakfast included", value: true }, { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true }, { "@type": "LocationFeatureSpecification", name: "On-site parking", value: true }, { "@type": "LocationFeatureSpecification", name: "No 4\xD74 required", value: true }] },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "How far is DEVOCEAN Lodge from the beach?", acceptedAnswer: { "@type": "Answer", text: "The lodge is approximately 300 metres from the main beach \u2014 a few minutes' walk through the village streets." } }, { "@type": "Question", name: "Do I need a 4\xD74 to get to DEVOCEAN Lodge?", acceptedAnswer: { "@type": "Answer", text: "No. DEVOCEAN Lodge is on a navigable road in the village centre. A standard car handles the route from the Kosi Bay border comfortably." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Accommodation in Ponta do Ouro", item: "https://devoceanlodge.com/ponta-do-ouro-accommodation" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Accommodation in Ponta do Ouro Near the Beach</h1>
  <p>DEVOCEAN Lodge is set in a lush tropical garden in the heart of Ponta do Ouro village, approximately 300 metres from the main beach. Nine units across four accommodation types \u2014 four Safari Tents, three Comfort Tents, a Garden Cottage and a Thatched Chalet.</p>
  <ul>
    <li><strong>Safari Tent</strong> (4 units) \u2014 Canvas tent on a raised platform. King or Twin, fan, shared bathroom, private terrace.</li>
    <li><strong>Comfort Safari Tent</strong> (3 units) \u2014 Canvas tent with private en-suite thatched bathroom. King or Twin, private terrace.</li>
    <li><strong>Garden Cottage</strong> (1 unit) \u2014 Roundavel with AC inverter, desk, dining table, private bathroom.</li>
    <li><strong>Thatched Chalet</strong> (1 unit) \u2014 Secluded, AC inverter, private bathroom, private terrace.</li>
  </ul>
  <p>All units include breakfast daily, free WiFi, fresh linen and mosquito screening. <a href="/book-direct">Check live availability and book direct.</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/safari-tents-ponta-do-ouro": {
    title: "Safari Tents in Ponta do Ouro, Mozambique | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/safari-tents-ponta-do-ouro"],
    ogTitle: "Safari Tents in Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Two canvas safari tents on raised wooden platforms in a tropical garden. Shared or en-suite bathroom, fan, private terrace. A few minutes from the Indian Ocean.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Is it real camping or glamping?", acceptedAnswer: { "@type": "Answer", text: "Somewhere in between. Genuine canvas tent on a wooden platform \u2014 so the sounds, feel and connection to the outdoors are real. But with a proper bed, fresh linen, a private terrace and a well-maintained garden. The Comfort Tent adds an en-suite bathroom." } }, { "@type": "Question", name: "What is the bathroom situation for the standard Safari Tent?", acceptedAnswer: { "@type": "Answer", text: "The standard Safari Tent uses a shared bathroom \u2014 clean, maintained, and used only by safari tent guests. The Comfort Safari Tent has its own private en-suite bathroom attached to the rear of the tent." } }, { "@type": "Question", name: "Is Ponta do Ouro a malaria area?", acceptedAnswer: { "@type": "Answer", text: "Yes. Standard precautions apply: consult your doctor about prophylaxis before travel, and bring DEET insect repellent. The tents are fitted with mosquito-mesh windows and doors." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Safari Tents in Ponta do Ouro", item: "https://devoceanlodge.com/safari-tents-ponta-do-ouro" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Safari Tents in Ponta do Ouro</h1>
  <p>DEVOCEAN Lodge offers two safari tent options \u2014 a classic canvas Safari Tent on a raised 3\xD76 m wooden platform, and a Comfort Safari Tent with a private en-suite thatched bathroom. Both are a few minutes' walk from the Indian Ocean and the dive boats.</p>
  <h2>Safari Tent</h2>
  <p>12 m\xB2 canvas tent. King or Twin configuration, strong fan, private wooden terrace, mosquito mesh. Shared clean bathroom used only by safari tent guests.</p>
  <h2>Comfort Safari Tent</h2>
  <p>Same canvas experience with a private en-suite thatched bathroom. King or Twin, private terrace, fan, mosquito mesh.</p>
  <p>Breakfast included in both. Ponta do Ouro is a malaria area \u2014 bring DEET and consult your doctor about prophylaxis. <a href="/book-direct">Check availability for both tents.</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/diving-dolphin-accommodation": {
    title: "Accommodation for Diving and Dolphin Swims in Ponta do Ouro | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/diving-dolphin-accommodation"],
    ogTitle: "Dive Base Accommodation in Ponta do Ouro | DEVOCEAN Lodge",
    ogDescription: "Walk to the dive boats, dolphin swims and whale-watching trips. Gear rinse on-site. Four accommodation types. Breakfast included. Book direct.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Which dive operators are closest to DEVOCEAN Lodge?", acceptedAnswer: { "@type": "Answer", text: "Multiple PADI operators are based in the village, all within a short walk. Ask our team for current operator recommendations when you book." } }, { "@type": "Question", name: "What time do dive trips depart?", acceptedAnswer: { "@type": "Answer", text: "Most operators run two dives per day. The first dive typically departs around 07:30\u201308:00, with the second following mid-morning. Dolphin swims leave at a similar time." } }, { "@type": "Question", name: "Are dolphin swims suitable for non-divers?", acceptedAnswer: { "@type": "Answer", text: "Yes. Dolphin swims are conducted while snorkelling in shallow water at Cr\xE8che reef. You don't need to be a certified diver \u2014 confident swimmers are welcome." } }, { "@type": "Question", name: "What is the best time of year for diving in Ponta do Ouro?", acceptedAnswer: { "@type": "Answer", text: "April\u2013November offers the best visibility (15\u201330 m). August\u2013October adds whale season. December\u2013March brings warmer water but occasionally reduced visibility. Dolphins are present year-round." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Accommodation for Diving and Dolphins", item: "https://devoceanlodge.com/diving-dolphin-accommodation" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Accommodation for Diving and Dolphins in Ponta do Ouro</h1>
  <p>DEVOCEAN Lodge is in the village centre, a short walk from every PADI dive operator and from The Dolphin Centre. Dive boats typically leave at 07:30\u201308:00 \u2014 proximity to the launch point changes your whole dive day.</p>
  <h2>Dive Sites Around Ponta do Ouro</h2>
  <ul>
    <li><strong>Cr\xE8che</strong> \u2014 10 m, dolphin interactions, ideal for beginners</li>
    <li><strong>Pinnacles</strong> \u2014 18\u201322 m, bull sharks, hammerheads, manta rays</li>
    <li><strong>Atlantis</strong> \u2014 47 m, advanced dive, exceptional pelagic species</li>
  </ul>
  <h2>Wild Dolphin Swims</h2>
  <p>200+ resident Indo-Pacific bottlenose dolphins year-round. The Dolphin Centre operates ethical swims from Cr\xE8che reef. Suitable for confident swimmers \u2014 no diving certification required.</p>
  <h2>Whale Watching \u2014 June to November</h2>
  <p>Humpback whales migrate through Ponta do Ouro's waters June\u2013November. August\u2013October is the peak window for diving, dolphins and whales combined.</p>
  <p><a href="/book-direct">Book your dive base</a> \xB7 <a href="/ponta-do-ouro-accommodation">View all accommodation</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/book-direct": {
    title: "Book Direct | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: ROUTE_DESCRIPTIONS["/book-direct"],
    ogTitle: "Book Direct | DEVOCEAN Lodge",
    ogDescription: "Best-rate direct booking \u2014 no fees, instant confirmation. Nine units across four accommodation types in Ponta do Ouro, Mozambique.",
    // No staticCss: the #bd-hero-placeholder (position:fixed; z-index:999)
    // covers the entire viewport on /book-direct during the static phase, so
    // #static-content is never visible to users — it is SEO content only.
    // A body{background} rule would survive post-mount (the MutationObserver
    // hides #static-content but does not remove the injected <style>) and
    // cause overscroll/footer-gap leaks against the page's cream bg.
    staticHtml: `<div id="static-content">
<section>
  <h1>Book Your Stay Direct at DEVOCEAN Lodge</h1>
  <p>Book directly for the best available rate \u2014 no booking fees, no OTA markup. Instant confirmation by email. DEVOCEAN Lodge, Rua C Parcela 12, Ponta do Ouro, Mozambique.</p>
  <h2>Nine units across four accommodation types</h2>
  <ul>
    <li><strong>Safari Tent</strong> (four units) \u2014 Canvas tent on a raised platform. Twin or king bed, fan, shared hot-water ablutions, private terrace.</li>
    <li><strong>Comfort Tent</strong> (three units) \u2014 En-suite bathroom under thatched roof. Twin or king bed, private terrace.</li>
    <li><strong>Garden Cottage</strong> (one unit) \u2014 Queen bed, inverter air-conditioning, desk, private bathroom in thatched roundavel.</li>
    <li><strong>Thatched Chalet</strong> (one unit) \u2014 Twin or king bed, inverter air-conditioning, private bathroom, private terrace.</li>
  </ul>
  <p>All units include: breakfast daily, free WiFi, fresh linen, mosquito screening, private terrace.</p>
  <p>Check-in from 14:00 \xB7 Check-out by 10:00 \xB7 No 4\xD74 required \xB7 On-site parking</p>
  <p><a href="/book-direct">Check live availability and rates</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/why-ponta": {
    title: "Why Ponta do Ouro? | DEVOCEAN Lodge \u2014 Mozambique",
    description: ROUTE_DESCRIPTIONS["/why-ponta"],
    ogTitle: "Why Ponta do Ouro? | DEVOCEAN Lodge",
    ogDescription: "Pristine beaches, world-class diving, humpback whale watching, ethical dolphin swims and Maputo National Park \u2014 all within reach of DEVOCEAN Lodge.",
    // The unhideStyle makes #static-content visible pre-mount on this route
    // (no aria-hidden, no fixed overlay like #bd-hero-placeholder).  Without
    // intervention the observer's display:none swap flips dark text on cream
    // → white h1 on the React image hero.
    //
    // Fix (a): scope the dark styling to #static-content itself, not body.
    //   position:fixed;inset:0 → full-viewport dark overlay (avoids the 820px
    //   column leaving cream sides); padding reset to div, pushed to section.
    //   The MutationObserver fires sc.style.display='none' when React mounts →
    //   the fixed overlay disappears instantly, body background is untouched,
    //   no post-mount leak.
    staticCss: "#static-content{position:fixed;inset:0;max-width:none;margin:0;padding:0;background:#1b2d3d;overflow:hidden;z-index:10}#static-content section{max-width:820px;margin:0 auto;padding:8.25rem 1.5rem 3rem}#static-content h1{color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.4)}#static-content h1+p{color:rgba(255,255,255,0.82)}",
    staticHtml: `<div id="static-content">
<section>
  <h1>Why Ponta do Ouro?</h1>
  <p>Ponta do Ouro is a small coastal village at the southern tip of Mozambique, 13 km from the Kosi Bay border with South Africa. It sits within the Ponta do Ouro Partial Marine Reserve \u2014 one of Southern Africa's most biodiverse marine protected areas.</p>
  <h2>Marine Wildlife</h2>
  <p>Year-round wild dolphin swims with 200+ resident Indo-Pacific bottlenose dolphins. Scuba diving on 20+ named sites from 8 m to 48 m depth. Humpback whale watching July\u2013November. Whale sharks October\u2013March. 19 shark species including bull, tiger and great hammerhead sharks.</p>
  <h2>Activities</h2>
  <p>Surfing a classic right-hand point break. Deep-sea fishing in the Mozambique Channel (black marlin, sailfish, yellowfin tuna). Game safaris to Maputo National Park \u2014 a UNESCO World Heritage Site with elephants, hippos, giraffes and zebras. Ocean seafaris, snorkelling, kayaking and beach walks to Ponta Malongane.</p>
  <h2>Getting There</h2>
  <p>13 km from the Kosi Bay border with South Africa. The approach road is largely tarred \u2014 no 4\xD74 required to reach the lodge or the main beach. 85 km south of Maputo via the Maputo\u2013Katembe Bridge.</p>
  <h2>Stay at DEVOCEAN Lodge</h2>
  <p>DEVOCEAN Lodge sits in a lush tropical garden approximately 300 metres from the beach. Nine units across four accommodation types \u2014 safari tents, comfort tents, a garden cottage and a thatched chalet. Family-run, eco-friendly hospitality with breakfast included. <a href="/book-direct">Book direct for best rates.</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/story": {
    title: "Our Story | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: ROUTE_DESCRIPTIONS["/story"],
    ogTitle: "Our Story | DEVOCEAN Lodge",
    ogDescription: "Family-run eco-lodge in Ponta do Ouro since 2015. Your stay supports sustainable development, local farming, and community projects in southern Mozambique.",
    jsonLd: [
      { "@context": "https://schema.org", "@type": "AboutPage", name: "Our Story | DEVOCEAN Lodge", url: "https://devoceanlodge.com/story", description: "Discover DEVOCEAN Lodge's journey since 2015. Family-run, community-focused eco-lodge in Ponta do Ouro.", about: { "@type": "LodgingBusiness", "@id": "https://devoceanlodge.com/#lodge", name: "DEVOCEAN Lodge", url: "https://devoceanlodge.com/", foundingDate: "2015", address: { "@type": "PostalAddress", addressLocality: "Ponta do Ouro", addressRegion: "Matutu\xEDne, Prov\xEDncia de Maputo", addressCountry: "MZ" } } },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Our Story", item: "https://devoceanlodge.com/story" }] }
    ],
    staticHtml: `<div id="static-content">
<section>
  <h1>Adventure meets sustainability \u2014 your stay makes a difference</h1>
  <p>DEVOCEAN Lodge has been welcoming guests to Ponta do Ouro since 2015. We are a family-run, community-focused eco-lodge with nine accommodation options, blending adventure with comfort while growing alongside our dedicated staff and the local community.</p>
  <h2>Lake Sotiba Guest Farm</h2>
  <p>Trusted by local leaders, we are developing a guest farm at Lake Sotiba \u2014 a hub for hands-on, sustainable practices in self-reliance and knowledge sharing.</p>
  <h2>From our land to your plate</h2>
  <p>Enjoy a breakfast included with every stay, and pre-order a freshly prepared dinner from our in-house kitchen. Our produce connects directly to local agriculture cooperatives.</p>
  <h2>Your stay creates impact</h2>
  <p>Every booking supports sustainable development and empowers the local community \u2014 bringing our vision of a flourishing, eco-conscious southern Mozambique to life.</p>
  <p><a href="/book-direct">Book your stay at DEVOCEAN Lodge</a> \xB7 <a href="/#stay">View accommodations</a></p>
</section>
</div><!-- /static-content -->`,
    // The /story React hero (.dl-title) renders its title spans in brand
    // orange — tint the static title to match so the handoff doesn't flip
    // the headline color.
    staticCss: "#static-content h1{color:#d2691e}"
  },
  "/gift-vouchers": {
    title: "Gift Vouchers | DEVOCEAN Lodge \u2014 Ponta do Ouro, Mozambique",
    description: ROUTE_DESCRIPTIONS["/gift-vouchers"],
    ogTitle: "Gift Vouchers | DEVOCEAN Lodge",
    ogDescription: "Give the perfect gift \u2014 a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Redeemable for any accommodation type.",
    staticHtml: `<div id="static-content">
<section>
  <h1>Gift Vouchers \u2014 DEVOCEAN Lodge</h1>
  <p>Give the gift of a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Gift vouchers are available for any accommodation type and any amount, and are valid for 12 months from the date of purchase. The perfect present for divers, surfers, nature lovers and anyone looking for an unforgettable beach escape in Southern Africa.</p>
  <p>DEVOCEAN Lodge, Rua C Parcela 12, Ponta do Ouro, Mozambique. <a href="/gift-vouchers">Buy a gift voucher.</a></p>
</section>
</div><!-- /static-content -->`
  },
  "/booking-confirmed": {
    title: "Booking Confirmed | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/booking-confirmed"],
    ogTitle: "Booking Confirmed | DEVOCEAN Lodge",
    ogDescription: "Your booking at DEVOCEAN Lodge, Ponta do Ouro is confirmed.",
    noindex: true,
    staticHtml: '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->'
  },
  "/gift-confirmed": {
    title: "Gift Voucher Purchase Confirmed | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/gift-confirmed"],
    ogTitle: "Gift Voucher Purchase Confirmed | DEVOCEAN Lodge",
    ogDescription: "Your DEVOCEAN Lodge gift voucher purchase is confirmed.",
    noindex: true,
    staticHtml: '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->'
  },
  "/admin": {
    title: "Admin | DEVOCEAN Lodge",
    description: ROUTE_DESCRIPTIONS["/admin"],
    ogTitle: "Admin | DEVOCEAN Lodge",
    ogDescription: "DEVOCEAN Lodge admin area.",
    noindex: true,
    staticHtml: '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->'
  },
  "/devocean-lodge-meals": {
    title: "Meals at DEVOCEAN Lodge | Breakfast Included & Guest Dinners",
    description: ROUTE_DESCRIPTIONS["/devocean-lodge-meals"],
    ogTitle: "Meals at DEVOCEAN Lodge | Breakfast Included",
    ogDescription: "Breakfast included with every stay. Resident guests can pre-order freshly prepared dinners from our in-house restaurant in Ponta do Ouro, Mozambique.",
    jsonLd: [
      // Reference the authoritative lodge entity by @id only (declared in the
      // homepage graph, which now also carries the dining amenityFeature /
      // servesCuisine / hasMenu properties) — no redeclaration on this page.
      { "@context": "https://schema.org", "@type": "WebPage", url: "https://devoceanlodge.com/devocean-lodge-meals", name: "Food & Dining at DEVOCEAN Lodge", about: { "@id": "https://devoceanlodge.com/#lodge" } },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Is breakfast included at DEVOCEAN Lodge?", acceptedAnswer: { "@type": "Answer", text: "Yes. Breakfast is included in the accommodation rate." } }, { "@type": "Question", name: "What time is breakfast served?", acceptedAnswer: { "@type": "Answer", text: "Breakfast is normally served from 08:30 until 11:00. Earlier or later service can often be arranged when requested beforehand \u2014 for example, if you have an early dive or dolphin swim." } }, { "@type": "Question", name: "Can I have dinner at DEVOCEAN Lodge?", acceptedAnswer: { "@type": "Answer", text: "Yes. Resident guests can order dinner from our in-house restaurant. Please order in advance and no later than 20:00. The kitchen closes at 21:00." } }, { "@type": "Question", name: "Is the DEVOCEAN Lodge kitchen open to outside visitors?", acceptedAnswer: { "@type": "Answer", text: "No. Our meal service is reserved for guests staying at DEVOCEAN Lodge." } }, { "@type": "Question", name: "Does DEVOCEAN Lodge serve lunch?", acceptedAnswer: { "@type": "Answer", text: "We do not offer regular lunch service. We are happy to suggest nearby caf\xE9s and restaurants based on what is currently open." } }, { "@type": "Question", name: "Can DEVOCEAN Lodge accommodate dietary requirements?", acceptedAnswer: { "@type": "Answer", text: "Often, yes. Please advise us of any dietary requirements before arrival. Our kitchen is small and local supplies vary, but we will always be honest about what we can accommodate." } }] },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "DEVOCEAN Lodge", item: "https://devoceanlodge.com/" }, { "@type": "ListItem", position: 2, name: "Meals & Dining", item: "https://devoceanlodge.com/devocean-lodge-meals" }] }
    ],
    // The /devocean-lodge-meals React hero renders h1 with a <span> making the
    // second sentence orange (#9e4b13) and uses a larger clamp range
    // (2rem→3rem vs the generic 1.75rem→2.75rem).  Match both so the handoff
    // doesn't flash an orange colour-change or a font-size jump.
    staticCss: "#static-content h1{font-size:clamp(2rem,5vw,3rem);line-height:1.15}",
    staticHtml: `<div id="static-content">
<section>
  <h1>Breakfast included.<br/><span style="color:#9e4b13">Dinner prepared for you on demand.</span></h1>
  <p>Every stay at DEVOCEAN Lodge includes breakfast, served in our tropical garden. In the evening, resident guests can pre-order a freshly prepared dinner from our in-house restaurant.</p>
  <h2>Breakfast in the Garden</h2>
  <p>Breakfast is included in your accommodation rate and is normally served between 08:30 and 11:00 in the tropical garden. Guests can choose from our breakfast menu, with both cooked and lighter options. Fresh Portuguese bread is served daily, accompanied by coffee, tea or hot chocolate. If you have an early dive or dolphin swim, an earlier or later breakfast can usually be arranged.</p>
  <h2>Dinner at DEVOCEAN</h2>
  <p>Our in-house restaurant prepares dinner exclusively for guests staying at the lodge. Please order in advance \u2014 latest order time is 20:00, and the kitchen closes at 21:00. Meals are prepared fresh to order using ingredients purchased daily.</p>
  <h2>Dietary Requirements</h2>
  <p>Please advise us of any vegetarian, vegan or other dietary requirements before arrival. Our kitchen is small and local supplies vary, but we will always be honest about what we can accommodate.</p>
  <p><a href="/book-direct">Book a stay at DEVOCEAN Lodge \u2014 breakfast included.</a></p>
</section>
</div><!-- /static-content -->`
  }
};
var STATIC_CONTENT_RE = /<div id="static-content">[\s\S]*?<\/div><!-- \/static-content -->/;
var EMPTY_STATIC = '<div id="static-content" aria-hidden="true"></div><!-- /static-content -->';
var NOINDEX_PATHS = /* @__PURE__ */ new Set([
  "/admin",
  "/booking-confirmed",
  "/gift-confirmed",
  "/gift-canceled",
  "/thankyou",
  "/canceled"
]);
var STATIC_UNIT_ASSETS = /* @__PURE__ */ new Map([
  ["/safari", "/_unit-pages/safari.unit"],
  ["/comfort", "/_unit-pages/comfort.unit"],
  ["/cottage", "/_unit-pages/cottage.unit"],
  ["/chalet", "/_unit-pages/chalet.unit"]
]);
async function onRequest2(context) {
  try {
    const requestUrl = new URL(context.request.url);
    const requestPathname = requestUrl.pathname;
    const enUsMatch = requestPathname.match(/^\/en-us(?:\/(.*))?$/i);
    if (enUsMatch) {
      const rootPath = enUsMatch[1] ? `/${enUsMatch[1]}` : "/";
      const target = `${rootPath}${requestUrl.search}${requestUrl.hash}`;
      return Response.redirect(new URL(target, requestUrl).href, 301);
    }
    const requestLocale = localeFromPath(requestPathname);
    const pathname = stripLocalePrefix(requestPathname);
    const searchParams = requestUrl.searchParams;
    const legacyLocale = normalizeLocale(searchParams.get("lang"));
    if (legacyLocale && !requestLocale) {
      searchParams.delete("lang");
      const target = localizedUrl(pathname, legacyLocale, searchParams.toString(), requestUrl.hash);
      return Response.redirect(new URL(target, requestUrl).href, 301);
    }
    if (!requestLocale && /^\/[a-z]{2}(?:-[A-Za-z]{2})?$/.test(requestPathname)) {
      const oldLocale = normalizeLocale(requestPathname.slice(1));
      if (oldLocale) {
        return Response.redirect(new URL(localizedUrl("/", oldLocale, searchParams.toString(), requestUrl.hash), requestUrl).href, 301);
      }
    }
    const locale = requestLocale || getLocale(DEFAULT_LOCALE);
    const canonicalPath = localizedPath(pathname, locale.code);
    const acceptHeader = context.request.headers.get("accept") || "";
    const isAssetPath = /\.(js|css|json|png|jpg|jpeg|webp|svg|ico|woff2?|ttf|txt|xml|pdf)$/i.test(pathname);
    if (acceptHeader.includes("text/markdown") && !isAssetPath) {
      const llmsUrl = new URL("/llms.txt", context.request.url);
      const llmsResp = await fetch(llmsUrl.href);
      if (llmsResp.ok) {
        const body = await llmsResp.text();
        const tokenEstimate = Math.ceil(body.length / 4);
        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "X-Markdown-Tokens": String(tokenEstimate),
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
    if (pathname.startsWith("/book/")) {
      return Response.redirect(new URL("/book-direct", context.request.url).href, 301);
    }
    if (pathname.split("/")[2] === "pages") {
      return Response.redirect(new URL("/", context.request.url).href, 302);
    }
    const isSpaRoute = ROUTE_META[pathname] != null || /^\/experiences\/[a-z-]+$/.test(pathname);
    const staticUnitAsset = STATIC_UNIT_ASSETS.get(pathname);
    const isStaticUnit = Boolean(staticUnitAsset);
    let response = isStaticUnit ? await context.env.ASSETS.fetch(new Request(new URL(staticUnitAsset, context.request.url), context.request)) : isSpaRoute ? await context.env.ASSETS.fetch(new Request(new URL("/", context.request.url), context.request)) : await context.next();
    if (isStaticUnit && response.status !== 200) return response;
    if (response.status === 404) {
      const accept = (context.request.headers.get("accept") || "").trim();
      const wantsHtml = !isAssetPath && (accept === "" || accept.includes("text/html") || accept.includes("*/*"));
      if (wantsHtml) {
        const rootUrl = new URL("/", context.request.url);
        response = await context.env.ASSETS.fetch(new Request(rootUrl, context.request));
      } else {
        return response;
      }
    }
    const contentType = response.headers.get("content-type") || "";
    if (!isStaticUnit && !contentType.includes("text/html")) {
      return response;
    }
    const countryCode = context.request?.cf?.country || "";
    let html = await response.text();
    if (pathname !== "/") {
      html = html.replace(/<script type="application\/ld\+json" id="ld-home-faq">[\s\S]*?<\/script>/, "");
    }
    const countryInjection = `<script>window.__CF_COUNTRY__="${countryCode}";window.__DEVOCEAN_LOCALE__="${locale.code}";<\/script>`;
    html = html.replace("<head>", `<head>${countryInjection}`);
    html = html.replace(/<html\b[^>]*>/i, `<html lang="${locale.code}">`);
    if (isStaticUnit) {
      const canonical = `${BASE_URL}${canonicalPath}`;
      html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`);
      html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
      html = html.replace(/\s*<link rel="alternate" hreflang="[^"]+"[^>]*>\s*/g, "\n");
      html = html.replace("</head>", `${buildHreflang(pathname)}
</head>`);
    } else if (pathname === "/") {
      const canonical = `${BASE_URL}${canonicalPath}`;
      html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`);
      html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
      html = html.replace(HREFLANG_BLOCK_RE, buildHreflang("/"));
    } else {
      const expMatch = pathname.match(/^\/experiences\/([a-z]+)$/);
      const expKey = expMatch ? expMatch[1] : null;
      const route = ROUTE_META[pathname];
      if (expKey && EXPERIENCE_KEYS.has(expKey)) {
        const pagePath = `/experiences/${expKey}`;
        const pageUrl = `${BASE_URL}${pagePath}`;
        const meta = EXPERIENCE_META[expKey];
        if (meta) {
          html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
          html = html.replace(
            /<meta name="description"\s+content="[^"]*"/,
            `<meta name="description" content="${meta.description}"`
          );
          html = html.replace(
            /(<link rel="canonical" href=")[^"]*(")/,
            `$1${BASE_URL}${canonicalPath}$2`
          );
          html = html.replace(
            /(<meta property="og:title" content=")[^"]*(")/,
            `$1${meta.ogTitle}$2`
          );
          html = html.replace(
            /<meta property="og:description"\s+content="[^"]*"/,
            `<meta property="og:description" content="${meta.ogDescription}"`
          );
          html = html.replace(
            /(<meta property="og:url" content=")[^"]*(")/,
            `$1${BASE_URL}${canonicalPath}$2`
          );
        }
        html = html.replace(STATIC_CONTENT_RE, buildExperienceStaticHtml(meta));
        html = html.replace(HREFLANG_BLOCK_RE, buildHreflang(pagePath));
      } else if (route) {
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`);
        html = html.replace(
          /<meta name="description"\s+content="[^"]*"/,
          `<meta name="description" content="${route.description}"`
        );
        html = html.replace(
          /(<link rel="canonical" href=")[^"]*(")/,
          `$1${BASE_URL}${canonicalPath}$2`
        );
        html = html.replace(
          /(<meta property="og:title" content=")[^"]*(")/,
          `$1${route.ogTitle}$2`
        );
        html = html.replace(
          /<meta property="og:description"\s+content="[^"]*"/,
          `<meta property="og:description" content="${route.ogDescription}"`
        );
        html = html.replace(
          /(<meta property="og:url" content=")[^"]*(")/,
          `$1${BASE_URL}${canonicalPath}$2`
        );
        const unhideStyle = route.staticHtml.includes("aria-hidden") ? "" : "<style>@font-face{font-family:'Inter Fallback';src:local('Arial');size-adjust:107.4%;ascent-override:90.2%;descent-override:22.48%;line-gap-override:0%}#static-content{position:static;width:auto;height:auto;overflow:visible;clip:auto;clip-path:none;white-space:normal;max-width:820px;margin:0 auto;padding:8.25rem 1.5rem 3rem;font-family:'Inter','Inter Fallback',sans-serif;color:#1f2937;line-height:1.6}#static-content h1{font-size:clamp(1.75rem,4.5vw,2.75rem);font-weight:700;color:#1f2937;line-height:1.2;margin:0 0 1rem;text-align:center}#static-content h1+p{font-size:1.0625rem;color:#6b7280;line-height:1.75;max-width:700px;margin:0 auto 2rem;text-align:center}#static-content h2{font-size:1.5rem}body{background:#fffaf6}" + (route.staticCss || "") + "</style>";
        html = html.replace(STATIC_CONTENT_RE, route.staticHtml + unhideStyle);
        if (route.jsonLd?.length) {
          const scripts = route.jsonLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}<\/script>`).join("\n");
          html = html.replace("</head>", `${scripts}
</head>`);
        }
        html = html.replace(
          HREFLANG_BLOCK_RE,
          route.noindex ? EMPTY_HREFLANG : buildHreflang(pathname)
        );
        if (route.noindex) {
          html = html.replace("</head>", '<meta name="robots" content="noindex">\n</head>');
        }
      } else {
        html = html.replace(STATIC_CONTENT_RE, EMPTY_STATIC);
        html = html.replace(HREFLANG_BLOCK_RE, EMPTY_HREFLANG);
        if (NOINDEX_PATHS.has(pathname)) {
          html = html.replace("</head>", '<meta name="robots" content="noindex,nofollow">\n</head>');
        }
      }
    }
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    if (isStaticUnit) {
      headers.set("content-type", "text/html; charset=utf-8");
    }
    headers.set("Content-Signal", "ai-train=no, search=yes, ai-input=yes");
    headers.set("Cache-Control", "no-cache, must-revalidate");
    return new Response(html, { status: response.status, headers });
  } catch (err) {
    console.error("[middleware]", err);
    return new Response("Service Error", { status: 500 });
  }
}
__name(onRequest2, "onRequest");

// ../.wrangler/tmp/pages-dCvMS8/functionsRoutes-0.49579644740623396.mjs
var routes = [
  {
    routePath: "/api/booking/result/:ref",
    mountPath: "/api/booking/result",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/booking/availability",
    mountPath: "/api/booking",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/booking/calendar",
    mountPath: "/api/booking",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/booking/checkout",
    mountPath: "/api/booking",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/booking/nearest-available",
    mountPath: "/api/booking",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/booking/quote",
    mountPath: "/api/booking",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/gift-voucher/checkout",
    mountPath: "/api/gift-voucher",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/gift-voucher/confirm",
    mountPath: "/api/gift-voucher",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/gift-voucher/validate",
    mountPath: "/api/gift-voucher",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/experience-inquiry",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/fx",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/static-map",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/track-session",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
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
