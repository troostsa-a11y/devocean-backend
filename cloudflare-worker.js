// Cloudflare Worker for DEVOCEAN Lodge Contact Form
// This replaces server.js when deploying to Cloudflare

// Security: Sanitize header strings (remove ALL newlines)
function sanitizeHeader(str) {
  return String(str).replace(/[\r\n]/g, '').trim();
}

// Security: Sanitize message body (remove CRLF but preserve LF)
function sanitizeMessage(str) {
  return String(str).replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
}

// Security: Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Verify reCAPTCHA token
async function verifyRecaptcha(token, secretKey) {
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  const response = await fetch(verifyUrl, { method: 'POST' });
  return await response.json();
}

// Send email using MailChannels (free email API for Cloudflare Workers)
async function sendEmail(env, emailData) {
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: emailData.to.address, name: emailData.to.name }],
          dkim_domain: env.MAIL_DOMAIN || 'devoceanlodge.com',
          dkim_selector: 'mailchannels',
        },
      ],
      from: { email: emailData.from.address, name: emailData.from.name },
      reply_to: { email: emailData.replyTo.address, name: emailData.replyTo.name },
      subject: emailData.subject,
      content: [
        { type: 'text/plain', value: emailData.text },
        ...(emailData.html ? [{ type: 'text/html', value: emailData.html }] : []),
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Email sending failed: ${response.statusText}`);
  }

  return response;
}

// Main contact form handler
async function handleContactForm(request, env) {
  try {
    const body = await request.json();
    const { name, email, message, checkin_iso, checkout_iso, unit, currency, lang, recaptcha_token } = body;

    // Verify reCAPTCHA
    if (!recaptcha_token) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA verification required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recaptchaResult = await verifyRecaptcha(recaptcha_token, env.RECAPTCHA_SECRET_KEY);

    if (!recaptchaResult.success) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (recaptchaResult.action !== 'contact_form') {
      return new Response(JSON.stringify({ error: 'Invalid security token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (recaptchaResult.score !== undefined && recaptchaResult.score < 0.3) {
      return new Response(JSON.stringify({ error: 'Security verification failed. Please try again.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);

    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return new Response(JSON.stringify({ error: 'Invalid input data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize optional fields
    const sanitizedCheckin = checkin_iso ? sanitizeHeader(checkin_iso).slice(0, 20) : '';
    const sanitizedCheckout = checkout_iso ? sanitizeHeader(checkout_iso).slice(0, 20) : '';
    const sanitizedUnit = unit ? sanitizeHeader(unit).slice(0, 100) : '';
    const sanitizedCurrency = currency ? sanitizeHeader(currency).slice(0, 10) : 'EUR';
    const sanitizedLang = lang ? sanitizeHeader(lang).slice(0, 10) : 'en';

    const languageNames = {
      en: 'English',
      pt: 'Portuguese',
      nl: 'Dutch',
      fr: 'French',
      it: 'Italian',
      de: 'German',
      es: 'Spanish',
    };
    const fullLanguageName = languageNames[sanitizedLang] || sanitizedLang;

    // Build enquiry email
    const checkinText = sanitizedCheckin ? `From: ${sanitizedCheckin}` : '';
    const checkoutText = sanitizedCheckout ? `Until: ${sanitizedCheckout}` : '';
    const datesText = checkinText || checkoutText ? `\n${checkinText}\n${checkoutText}` : '';
    const unitText = sanitizedUnit ? `\nPreferred unit: ${sanitizedUnit}` : '';

    const emailBody = `
New contact form submission from DEVOCEAN Lodge website:

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Language: ${fullLanguageName}
Currency: ${sanitizedCurrency}${datesText}${unitText}

Message:
${sanitizedMessage}
    `.trim();

    // Send enquiry email to lodge
    await sendEmail(env, {
      from: { name: env.MAIL_FROM_NAME || 'DEVOCEAN Lodge', address: env.MAIL_FROM_EMAIL },
      to: { name: env.MAIL_TO_NAME || 'DEVOCEAN Lodge', address: env.MAIL_TO_EMAIL },
      replyTo: { name: sanitizedName, address: sanitizedEmail },
      subject: `Contact Form - ${sanitizedName}`,
      text: emailBody,
    });

    // Send auto-reply to customer
    const autoReplyMessages = {
      en: "Thanks for reaching out to DEVOCEAN Lodge. We've received your message and will get back to you shortly.",
      pt: 'Obrigado por entrar em contato com o DEVOCEAN Lodge. Recebemos sua mensagem e entraremos em contato em breve.',
      nl: 'Bedankt voor je bericht aan DEVOCEAN Lodge. We nemen snel contact op.',
      fr: 'Merci d'avoir contacté DEVOCEAN Lodge. Nous vous répondrons prochainement.',
      it: 'Grazie per aver contattato DEVOCEAN Lodge. Ti risponderemo a breve.',
      de: 'Danke für Ihre Nachricht an DEVOCEAN Lodge. Wir melden uns bald.',
      es: 'Gracias por contactarnos en DEVOCEAN Lodge. Nos pondremos en contacto pronto.',
    };

    const autoReplySubjects = {
      en: 'Thanks — DEVOCEAN Lodge',
      pt: 'Obrigado — DEVOCEAN Lodge',
      nl: 'Bedankt — DEVOCEAN Lodge',
      fr: 'Merci — DEVOCEAN Lodge',
      it: 'Grazie — DEVOCEAN Lodge',
      de: 'Danke — DEVOCEAN Lodge',
      es: 'Gracias — DEVOCEAN Lodge',
    };

    const greetings = {
      en: 'Hi',
      pt: 'Olá',
      nl: 'Hoi',
      fr: 'Bonjour',
      it: 'Ciao',
      de: 'Hallo',
      es: 'Hola',
    };

    const ratesButtonText = {
      en: 'Rates & Availability',
      pt: 'Tarifas & Disponibilidade',
      nl: 'Tarieven & Beschikbaarheid',
      fr: 'Tarifs & Disponibilité',
      it: 'Tariffe & Disponibilità',
      de: 'Preise & Verfügbarkeit',
      es: 'Tarifas & Disponibilidad',
    };

    const sincerelyText = {
      en: 'Warm regards',
      pt: 'Atenciosamente',
      nl: 'Met vriendelijke groet',
      fr: 'Cordialement',
      it: 'Cordialmente',
      de: 'Mit freundlichen Grüßen',
      es: 'Cordialmente',
    };

    const localeMap = {
      en: 'en-US',
      pt: 'pt-BR',
      nl: 'nl-NL',
      fr: 'fr-FR',
      it: 'it-IT',
      de: 'de-DE',
      es: 'es-ES',
    };
    const hrLocale = localeMap[sanitizedLang] || 'en-US';
    const bookingUrl = `https://book.devoceanlodge.com/bv3/search?locale=${hrLocale}&currency=${sanitizedCurrency}`;

    const escapeHtml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

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

    // Send auto-reply if not a no-reply address
    if (!/^(no-?reply|postmaster|mailer-daemon|bounce)/i.test(sanitizedEmail)) {
      try {
        await sendEmail(env, {
          from: { name: 'DEVOCEAN Lodge', address: env.MAIL_FROM_EMAIL },
          to: { name: sanitizedName, address: sanitizedEmail },
          replyTo: { name: env.MAIL_FROM_NAME || 'DEVOCEAN Lodge', address: env.MAIL_FROM_EMAIL },
          subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
          text: autoReplyText,
          html: autoReplyHtml,
        });
      } catch (error) {
        console.error('Auto-reply failed:', error.message);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Message sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Cloudflare Worker entry point
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle contact form endpoint
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      const response = await handleContactForm(request, env);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // Default response
    return new Response('DEVOCEAN Lodge API', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  },
};
