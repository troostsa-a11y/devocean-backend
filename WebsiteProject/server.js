import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env file explicitly
dotenv.config({ path: join(__dirname, '.env') });
const app = express();
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

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY not configured');
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  
  const response = await fetch(verifyUrl, { method: 'POST' });
  const data = await response.json();
  
  return data;
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

    // Verify action matches expected value to prevent token reuse
    if (recaptchaResult.action !== 'contact_form') {
      console.warn('reCAPTCHA action mismatch:', recaptchaResult.action, 'expected: contact_form');
      return res.status(400).json({ error: "Invalid security token" });
    }

    // Check score for v3 (0.0 to 1.0, higher is better)
    // Reject scores below 0.3 as likely bots, log scores 0.3-0.5 as suspicious
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
      port,
      secure: isSecure,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Build email content
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

    // Send email with safe address objects
    const mailOptions = {
      from: {
        name: process.env.MAIL_FROM_NAME || "DEVOCEAN Lodge",
        address: process.env.MAIL_FROM_EMAIL || "info@devoceanlodge.com"
      },
      to: {
        name: process.env.MAIL_TO_NAME || "DEVOCEAN Lodge",
        address: process.env.MAIL_TO_EMAIL || "info@devoceanlodge.com"
      },
      replyTo: {
        name: sanitizedName,
        address: sanitizedEmail
      },
      subject: `Contact Form - ${sanitizedName}`,
      text: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Main email sent successfully!");
    console.log("From:", mailOptions.from.address);
    console.log("To:", mailOptions.to.address);
    console.log("Subject:", mailOptions.subject);
    console.log("Message ID:", info.messageId);

    // Send auto-reply to customer (localized confirmation)
    const autoReplyMessages = {
      en: "Thanks for reaching out to DEVOCEAN Lodge. We've received your message and will get back to you shortly.",
      pt: "Obrigado por entrar em contato com o DEVOCEAN Lodge. Recebemos sua mensagem e entraremos em contato em breve.",
      nl: "Bedankt voor je bericht aan DEVOCEAN Lodge. We nemen snel contact op.",
      fr: "Merci d'avoir contacté DEVOCEAN Lodge. Nous vous répondrons prochainement.",
      it: "Grazie per aver contattato DEVOCEAN Lodge. Ti risponderemo a breve.",
      de: "Danke für Ihre Nachricht an DEVOCEAN Lodge. Wir melden uns bald.",
      es: "Gracias por contactarnos en DEVOCEAN Lodge. Nos pondremos en contacto pronto.",
    };

    const autoReplySubjects = {
      en: "Thanks — DEVOCEAN Lodge",
      pt: "Obrigado — DEVOCEAN Lodge",
      nl: "Bedankt — DEVOCEAN Lodge",
      fr: "Merci — DEVOCEAN Lodge",
      it: "Grazie — DEVOCEAN Lodge",
      de: "Danke — DEVOCEAN Lodge",
      es: "Gracias — DEVOCEAN Lodge",
    };

    const greetings = {
      en: "Hi", pt: "Olá", nl: "Hoi", fr: "Bonjour",
      it: "Ciao", de: "Hallo", es: "Hola",
    };

    const ratesButtonText = {
      en: "Rates & Availability", 
      pt: "Tarifas & Disponibilidade", 
      nl: "Tarieven & Beschikbaarheid",
      fr: "Tarifs & Disponibilité", 
      it: "Tariffe & Disponibilità", 
      de: "Preise & Verfügbarkeit", 
      es: "Tarifas & Disponibilidad",
    };

    const sincerelyText = {
      en: "Warm regards", pt: "Atenciosamente", nl: "Met vriendelijke groet",
      fr: "Cordialement", it: "Cordialmente", de: "Mit freundlichen Grüßen", es: "Cordialmente",
    };

    // Build localized booking URL
    const localeMap = {
      en: 'en-GB', 'en-US': 'en-US', 'pt-PT': 'pt-PT', 'pt-BR': 'pt-BR',
      nl: 'nl-NL', fr: 'fr-FR', it: 'it-IT', de: 'de-DE', es: 'es-ES',
      sv: 'sv', pl: 'pl', 'af-ZA': 'af-ZA', zu: 'en-GB', sw: 'sw',
      ja: 'ja-JP', zh: 'zh-CN', ru: 'ru'
    };
    const hrLocale = localeMap[sanitizedLang] || 'en-GB';
    const bookingUrl = `https://book.devoceanlodge.com/bv3/search?locale=${hrLocale}&currency=${sanitizedCurrency}`;

    // Escape HTML function
    const escapeHtml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // HTML version of auto-reply (professional format with email client compatibility)
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

    // Plain text version
    const autoReplyText = `
${greetings[sanitizedLang] || greetings.en} ${sanitizedName},

${autoReplyMessages[sanitizedLang] || autoReplyMessages.en}

${sincerelyText[sanitizedLang] || sincerelyText.en},

DEVOCEAN Lodge
https://devoceanlodge.com

${ratesButtonText[sanitizedLang] || ratesButtonText.en}: ${bookingUrl}
    `.trim();

    // Only send auto-reply if email is valid (not no-reply/bounce addresses)
    if (!/^(no-?reply|postmaster|mailer-daemon|bounce)/i.test(sanitizedEmail)) {
      try {
        const autoReplyOptions = {
          from: {
            name: "DEVOCEAN Lodge",
            address: process.env.MAIL_FROM_EMAIL || "info@devoceanlodge.com"
          },
          to: {
            name: sanitizedName,
            address: sanitizedEmail
          },
          replyTo: {
            name: process.env.MAIL_FROM_NAME || "DEVOCEAN Lodge",
            address: process.env.MAIL_FROM_EMAIL || "info@devoceanlodge.com"
          },
          subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
          html: autoReplyHtml,
          text: autoReplyText,
          headers: {
            'Auto-Submitted': 'auto-replied',
            'X-Auto-Response-Suppress': 'All'
          }
        };

        await transporter.sendMail(autoReplyOptions);
        console.log("✅ Auto-reply sent to:", sanitizedEmail);
      } catch (autoReplyError) {
        console.error("⚠️ Auto-reply failed:", autoReplyError.message);
        // Don't fail the main request if auto-reply fails
      }
    }

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Static map endpoint (keeps API key secure on server)
app.get("/api/static-map", async (req, res) => {
  try {
    const { lat, lng, zoom = 13 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat/lng parameters" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return res.status(500).json({ error: "Map service not configured" });
    }

    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=800x400&scale=2&maptype=roadmap&markers=color:0x0EA5E9%7C${lat},${lng}&key=${apiKey}`;

    const response = await fetch(staticMapUrl);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error("Static map error:", error.message);
    res.status(500).json({ error: "Failed to generate map" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

// In development, use Vite dev server
const vite = await createViteServer({
  server: { 
    middlewareMode: true,
    host: true,
    allowedHosts: true,
    hmr: {
      host: false
    }
  },
  appType: 'spa',
  root: __dirname,
});

app.use(vite.middlewares);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
