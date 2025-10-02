import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();

// Enable CORS for Cloudflare Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Verify reCAPTCHA token with timeout
async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY not configured');
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(verifyUrl, { 
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`reCAPTCHA API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('reCAPTCHA verification response:', JSON.stringify(data));
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('reCAPTCHA verification timeout');
      throw new Error('reCAPTCHA verification timeout');
    }
    console.error('reCAPTCHA verification error:', error);
    throw error;
  }
}

// Email endpoint for contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, checkin_iso, checkout_iso, unit, currency, lang, recaptcha_token } = req.body;

    // Verify reCAPTCHA token
    if (!recaptcha_token) {
      return res.status(400).json({ error: "reCAPTCHA verification required" });
    }

    const recaptchaResult = await verifyRecaptcha(recaptcha_token);
    
    if (!recaptchaResult.success) {
      console.error('reCAPTCHA verification failed:', recaptchaResult);
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }

    if (recaptchaResult.action !== 'contact_form') {
      console.warn('reCAPTCHA action mismatch:', recaptchaResult.action, 'expected: contact_form');
      return res.status(400).json({ error: "Invalid security token" });
    }

    if (recaptchaResult.score !== undefined) {
      if (recaptchaResult.score < 0.3) {
        console.warn('reCAPTCHA score too low (bot detected):', recaptchaResult.score);
        return res.status(400).json({ error: "Security verification failed. Please try again." });
      } else if (recaptchaResult.score < 0.5) {
        console.warn('Low reCAPTCHA score (suspicious):', recaptchaResult.score, 'from:', email);
      }
    }

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Sanitize and validate inputs
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
    
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Sanitize optional fields
    const sanitizedCheckin = checkin_iso ? sanitizeHeader(checkin_iso).slice(0, 20) : "";
    const sanitizedCheckout = checkout_iso ? sanitizeHeader(checkout_iso).slice(0, 20) : "";
    const sanitizedUnit = unit ? sanitizeHeader(unit).slice(0, 100) : "";
    const sanitizedCurrency = currency ? sanitizeHeader(currency).slice(0, 10) : "EUR";
    const sanitizedLang = lang ? sanitizeHeader(lang).slice(0, 10) : "en";
    
    // Language code to full name mapping
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

    // Create email transporter using environment secrets
    const port = parseInt(process.env.MAIL_PORT || "465");
    const isSecure = process.env.MAIL_SECURE === "ssl" || 
                    process.env.MAIL_SECURE === "true" || 
                    process.env.MAIL_SECURE === "1" || 
                    port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Build enquiry email
    const checkinText = sanitizedCheckin ? `From: ${sanitizedCheckin}` : "";
    const checkoutText = sanitizedCheckout ? `Until: ${sanitizedCheckout}` : "";
    const datesText = checkinText || checkoutText ? `\n${checkinText}\n${checkoutText}` : "";
    const unitText = sanitizedUnit ? `\nPreferred unit: ${sanitizedUnit}` : "";

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
    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: `"${process.env.MAIL_TO_NAME}" <${process.env.MAIL_TO_EMAIL}>`,
      replyTo: `"${sanitizedName}" <${sanitizedEmail}>`,
      subject: `Contact Form - ${sanitizedName}`,
      text: emailBody,
    });

    // Send auto-reply to customer
    const autoReplyMessages = {
      en: "Thanks for reaching out to DEVOCEAN Lodge. We've received your message and will get back to you shortly.",
      pt: 'Obrigado por entrar em contato com o DEVOCEAN Lodge. Recebemos sua mensagem e entraremos em contato em breve.',
      nl: 'Bedankt voor je bericht aan DEVOCEAN Lodge. We nemen snel contact op.',
      fr: "Merci d'avoir contacté DEVOCEAN Lodge. Nous vous répondrons prochainement.",
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
        await transporter.sendMail({
          from: `"DEVOCEAN Lodge" <${process.env.MAIL_FROM_EMAIL}>`,
          to: `"${sanitizedName}" <${sanitizedEmail}>`,
          replyTo: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
          subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
          text: autoReplyText,
          html: autoReplyHtml,
        });
      } catch (error) {
        console.error('Auto-reply failed:', error.message);
      }
    }

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
