/**
 * Standalone Contact Form Cloudflare Worker
 * Sends emails directly via Resend API (no backend needed)
 * 
 * Required Cloudflare Environment Variables:
 * - RECAPTCHA_SECRET_KEY: Google reCAPTCHA v3 secret
 * - RESEND_API_KEY: Resend API key for sending emails
 */

// Security: Remove CR/LF from header fields to prevent email header injection
const sanitizeHeader = (str) => String(str).replace(/[\r\n<>]/g, '').trim();
// Security: Sanitize message body (allow newlines for readability)
const sanitizeMessage = (str) => String(str).replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
const escapeHtml = (text) => text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m));

// Multi-language auto-reply content (15 languages)
const autoReplyContent = {
  en: {
    subject: '✅ Thank you for contacting DEVOCEAN Lodge',
    heading: 'Thank you for contacting us!',
    greeting: 'Dear',
    body: 'We have received your message and will get back to you as soon as possible.',
    closing: 'Warm regards,'
  },
  pt: {
    subject: '✅ Obrigado por entrar em contato com o DEVOCEAN Lodge',
    heading: 'Obrigado por entrar em contato!',
    greeting: 'Caro(a)',
    body: 'Recebemos a sua mensagem e entraremos em contato em breve.',
    closing: 'Cumprimentos cordiais,'
  },
  es: {
    subject: '✅ Gracias por contactar a DEVOCEAN Lodge',
    heading: '¡Gracias por contactarnos!',
    greeting: 'Estimado/a',
    body: 'Hemos recibido su mensaje y nos pondremos en contacto con usted lo antes posible.',
    closing: 'Saludos cordiales,'
  },
  fr: {
    subject: '✅ Merci d\'avoir contacté DEVOCEAN Lodge',
    heading: 'Merci de nous avoir contactés !',
    greeting: 'Cher/Chère',
    body: 'Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.',
    closing: 'Cordialement,'
  },
  de: {
    subject: '✅ Vielen Dank für Ihre Kontaktaufnahme mit DEVOCEAN Lodge',
    heading: 'Vielen Dank für Ihre Nachricht!',
    greeting: 'Sehr geehrte/r',
    body: 'Wir haben Ihre Nachricht erhalten und werden uns so schnell wie möglich bei Ihnen melden.',
    closing: 'Mit freundlichen Grüßen,'
  },
  it: {
    subject: '✅ Grazie per aver contattato DEVOCEAN Lodge',
    heading: 'Grazie per averci contattato!',
    greeting: 'Gentile',
    body: 'Abbiamo ricevuto il suo messaggio e la contatteremo al più presto.',
    closing: 'Cordiali saluti,'
  },
  nl: {
    subject: '✅ Bedankt voor het contact opnemen met DEVOCEAN Lodge',
    heading: 'Bedankt voor uw bericht!',
    greeting: 'Beste',
    body: 'We hebben uw bericht ontvangen en nemen zo spoedig mogelijk contact met u op.',
    closing: 'Met vriendelijke groet,'
  },
  ru: {
    subject: '✅ Спасибо за обращение в DEVOCEAN Lodge',
    heading: 'Спасибо за ваше обращение!',
    greeting: 'Уважаемый/ая',
    body: 'Мы получили ваше сообщение и свяжемся с вами в ближайшее время.',
    closing: 'С уважением,'
  },
  zh: {
    subject: '✅ 感谢您联系 DEVOCEAN Lodge',
    heading: '感谢您联系我们！',
    greeting: '尊敬的',
    body: '我们已收到您的消息，将尽快与您联系。',
    closing: '此致敬礼，'
  },
  ja: {
    subject: '✅ DEVOCEAN Lodgeへのお問い合わせありがとうございます',
    heading: 'お問い合わせありがとうございます！',
    greeting: '',
    body: 'メッセージを受信いたしました。できるだけ早くご連絡いたします。',
    closing: '敬具、'
  },
  pl: {
    subject: '✅ Dziękujemy za kontakt z DEVOCEAN Lodge',
    heading: 'Dziękujemy za kontakt!',
    greeting: 'Szanowny/a',
    body: 'Otrzymaliśmy Twoją wiadomość i skontaktujemy się z Tobą tak szybko, jak to możliwe.',
    closing: 'Z poważaniem,'
  },
  sv: {
    subject: '✅ Tack för att du kontaktade DEVOCEAN Lodge',
    heading: 'Tack för ditt meddelande!',
    greeting: 'Kära',
    body: 'Vi har tagit emot ditt meddelande och återkommer till dig så snart som möjligt.',
    closing: 'Vänliga hälsningar,'
  },
  af: {
    subject: '✅ Dankie dat jy DEVOCEAN Lodge gekontak het',
    heading: 'Dankie vir jou boodskap!',
    greeting: 'Geagte',
    body: 'Ons het jou boodskap ontvang en sal so gou as moontlik met jou kontak maak.',
    closing: 'Vriendelike groete,'
  },
  zu: {
    subject: '✅ Siyabonga ngokuxhumana ne-DEVOCEAN Lodge',
    heading: 'Siyabonga ngomlayezo wakho!',
    greeting: 'Sawubona',
    body: 'Sithole umlayezo wakho futhi sizokuxhumana maduze.',
    closing: 'Ozithobayo,'
  },
  sw: {
    subject: '✅ Asante kwa kuwasiliana na DEVOCEAN Lodge',
    heading: 'Asante kwa ujumbe wako!',
    greeting: 'Mpendwa',
    body: 'Tumepokea ujumbe wako na tutawasiliana nawe hivi karibuni.',
    closing: 'Kwa heshima,'
  }
};

// Verify reCAPTCHA
async function verifyRecaptcha(token, action, secretKey) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${token}`,
  });

  const data = await response.json();
  
  if (!data.success) {
    return { success: false, error: 'reCAPTCHA verification failed' };
  }
  
  if (data.action !== action) {
    return { success: false, error: 'reCAPTCHA action mismatch' };
  }
  
  if (data.score < 0.5) {
    return { success: false, error: 'reCAPTCHA score too low' };
  }
  
  return { success: true };
}

// Send email via Resend API
async function sendEmail(from, to, subject, html, apiKey, replyTo) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `DEVOCEAN Lodge <${from}>`,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || from,
      subject,
      html
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return await response.json();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://devoceanlodge.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message, lang, recaptcha_token, website, checkin_iso, checkout_iso, unit, currency } = await request.json();

    // Honeypot protection: reject if "website" field is filled (bots fill hidden fields)
    if (website && website.trim() !== '') {
      console.log('⚠️ Honeypot triggered - potential spam submission');
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify reCAPTCHA (action must match frontend: contact_form)
    const verification = await verifyRecaptcha(recaptcha_token, 'contact_form', env.RECAPTCHA_SECRET_KEY);
    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get sender's IP address from Cloudflare headers
    const senderIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For')?.split(',')[0] || 
                     'Unknown';

    // Normalize language code to 2-letter format (pt-PT → pt, en-GB → en)
    const normalizeLang = (langCode) => {
      if (!langCode) return 'en';
      const normalized = String(langCode).toLowerCase().split('-')[0];
      const supported = ['en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'pl', 'cs', 'tr', 'sv', 'da', 'fi', 'af', 'zu', 'sw'];
      return supported.includes(normalized) ? normalized : 'en';
    };

    // Sanitize inputs (header fields must remove CR/LF to prevent header injection)
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitizeHeader(phone).slice(0, 30) : '';
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
    const sanitizedLang = normalizeLang(lang);
    const sanitizedCheckin = checkin_iso ? sanitizeHeader(checkin_iso).slice(0, 10) : '';
    const sanitizedCheckout = checkout_iso ? sanitizeHeader(checkout_iso).slice(0, 10) : '';
    const sanitizedUnit = unit ? sanitizeHeader(unit).slice(0, 100) : '';
    const sanitizedCurrency = currency ? sanitizeHeader(currency).slice(0, 10) : '';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format dates for display (ISO format: YYYY-MM-DD → readable format)
    const formatDate = (isoDate) => {
      if (!isoDate) return '';
      try {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return isoDate;
      }
    };

    // Email to lodge
    const lodgeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Contact Form Submission</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
          ${sanitizedPhone ? `<p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>` : ''}
          <p><strong>IP Address:</strong> ${escapeHtml(senderIP)}</p>
          
          ${sanitizedCheckin || sanitizedCheckout || sanitizedUnit || sanitizedCurrency ? `
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="margin-bottom: 10px;"><strong>Stay Details:</strong></p>
          ${sanitizedCheckin ? `<p style="margin: 5px 0;">• <strong>Check-in:</strong> ${escapeHtml(formatDate(sanitizedCheckin))}</p>` : ''}
          ${sanitizedCheckout ? `<p style="margin: 5px 0;">• <strong>Check-out:</strong> ${escapeHtml(formatDate(sanitizedCheckout))}</p>` : ''}
          ${sanitizedUnit ? `<p style="margin: 5px 0;">• <strong>Unit Preference:</strong> ${escapeHtml(sanitizedUnit)}</p>` : ''}
          ${sanitizedCurrency ? `<p style="margin: 5px 0;">• <strong>Currency:</strong> ${escapeHtml(sanitizedCurrency)}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          ` : ''}
          
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
        </div>
        <p style="color: #666; font-size: 12px;">Sent from devoceanlodge.com contact form</p>
      </div>
    `;

    // Send to lodge with reply-to set to customer email
    await sendEmail('reservations@devoceanlodge.com', 'reservations@devoceanlodge.com', 
      `Contact Form: ${sanitizedName}`, lodgeEmailHtml, env.RESEND_API_KEY, sanitizedEmail);

    // Auto-reply to guest (multi-language)
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

    await sendEmail('reservations@devoceanlodge.com', sanitizedEmail,
      t.subject, autoReplyHtml, env.RESEND_API_KEY, 'reservations@devoceanlodge.com');

    console.log(`✅ Contact form submission from ${sanitizedName} (${sanitizedEmail}) - IP: ${senderIP}${sanitizedCheckin ? ` - Dates: ${sanitizedCheckin} to ${sanitizedCheckout}` : ''}`);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
