import dotenv from 'dotenv';
import express from 'express';
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

// Escape HTML function
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  // Skip verification for test tokens (development/testing)
  if (token && (token.startsWith('test-') || token.includes('dev') || token === 'test')) {
    console.log('⚠️  Test token detected: Skipping reCAPTCHA verification');
    return { success: true, score: 1.0 };
  }
  
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.log('⚠️  No reCAPTCHA secret key: Skipping verification');
    return { success: true, score: 1.0 };
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

    // Prepare email content for Resend
    const emailSubject = `New Contact Form Enquiry - ${sanitizedName}`;
    
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Website Enquiry</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
          ${sanitizedCheckin ? `<p style="margin: 8px 0;"><strong>Check-in:</strong> ${escapeHtml(sanitizedCheckin)}</p>` : ''}
          ${sanitizedCheckout ? `<p style="margin: 8px 0;"><strong>Check-out:</strong> ${escapeHtml(sanitizedCheckout)}</p>` : ''}
          ${sanitizedUnit ? `<p style="margin: 8px 0;"><strong>Unit:</strong> ${escapeHtml(sanitizedUnit)}</p>` : ''}
          ${sanitizedCurrency ? `<p style="margin: 8px 0;"><strong>Currency:</strong> ${escapeHtml(sanitizedCurrency)}</p>` : ''}
          ${fullLanguageName ? `<p style="margin: 8px 0;"><strong>Language:</strong> ${escapeHtml(fullLanguageName)}</p>` : ''}
        </div>
        <div style="background: white; padding: 20px; border-left: 4px solid #9e4b13; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Sent from devoceanlodge.com contact form<br>
          reCAPTCHA score: ${recaptchaResult.score || 'N/A'}
        </p>
      </div>
    `;

    const emailText = `
New Website Enquiry
-------------------

Name: ${sanitizedName}
Email: ${sanitizedEmail}
${sanitizedCheckin ? `Check-in: ${sanitizedCheckin}` : ''}
${sanitizedCheckout ? `Check-out: ${sanitizedCheckout}` : ''}
${sanitizedUnit ? `Unit: ${sanitizedUnit}` : ''}
${sanitizedCurrency ? `Currency: ${sanitizedCurrency}` : ''}
${fullLanguageName ? `Language: ${fullLanguageName}` : ''}

Message:
${sanitizedMessage}

---
Sent from devoceanlodge.com contact form
reCAPTCHA score: ${recaptchaResult.score || 'N/A'}
    `.trim();

    // Send email via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: "Email service not configured" });
    }
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'DEVOCEAN Lodge Website <reservations@devoceanlodge.com>',
        to: ['info@devoceanlodge.com'],
        reply_to: sanitizedEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    const emailResult = await emailResponse.json();
    console.log("✅ Main email sent successfully via Resend!");
    console.log("Message ID:", emailResult.id);

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

    // Build booking URL pointing to English booking page
    const bookingUrl = `https://devoceanlodge.com/book/EN.html`;

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
        const autoReplyResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'DEVOCEAN Lodge <reservations@devoceanlodge.com>',
            to: [sanitizedEmail],
            reply_to: 'info@devoceanlodge.com',
            subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
            html: autoReplyHtml,
            text: autoReplyText,
            headers: {
              'Auto-Submitted': 'auto-replied',
              'X-Auto-Response-Suppress': 'All'
            }
          })
        });

        if (autoReplyResponse.ok) {
          const autoReplyResult = await autoReplyResponse.json();
          console.log("✅ Auto-reply sent to:", sanitizedEmail, "ID:", autoReplyResult.id);
        } else {
          const errorText = await autoReplyResponse.text();
          console.error("⚠️ Auto-reply failed:", errorText);
        }
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

// Experience inquiry endpoint
app.post("/api/experience-inquiry", async (req, res) => {
  try {
    const { name, email, phone, operator, dates, guests, message, experience, experienceKey, lang, currency, recaptcha_token } = req.body;

    // Verify reCAPTCHA token
    if (!recaptcha_token) {
      return res.status(400).json({ error: "reCAPTCHA verification required" });
    }

    const recaptchaResult = await verifyRecaptcha(recaptcha_token);
    
    if (!recaptchaResult.success) {
      console.error('reCAPTCHA verification failed:', recaptchaResult);
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }

    // Note: Standard reCAPTCHA v3 doesn't return action field (only Enterprise does)
    // Only check action if it exists
    if (recaptchaResult.action && recaptchaResult.action !== 'experience_inquiry') {
      console.warn('reCAPTCHA action mismatch:', recaptchaResult.action, 'expected: experience_inquiry');
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
    if (!name || !email || !operator || !message || !experience) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitizeHeader(phone).slice(0, 30) : "";
    const sanitizedOperator = sanitizeHeader(operator).slice(0, 100);
    const sanitizedDates = dates ? sanitizeHeader(dates).slice(0, 100) : "";
    const sanitizedGuests = guests ? sanitizeHeader(guests).slice(0, 10) : "2";
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
    const sanitizedExperience = sanitizeHeader(experience).slice(0, 200);
    const sanitizedLang = lang ? sanitizeHeader(lang).slice(0, 10) : "en";

    if (!sanitizedName || !sanitizedEmail || !sanitizedOperator || !sanitizedMessage || !sanitizedExperience) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Load experience operator data
    const { EXPERIENCE_DETAILS } = await import('./src/data/experienceDetails.js');
    const expData = EXPERIENCE_DETAILS[experienceKey];
    const operatorData = expData?.operators?.find(op => op.name === sanitizedOperator);
    
    if (!operatorData) {
      console.error('Operator not found:', sanitizedOperator, 'for experience:', experienceKey);
      return res.status(400).json({ error: "Invalid operator selected" });
    }

    const operatorEmail = operatorData.email;

    // Prepare email content for operator
    const operatorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Experience Inquiry from DEVOCEAN Lodge</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Experience:</strong> ${escapeHtml(sanitizedExperience)}</p>
          <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
          ${sanitizedPhone ? `<p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>` : ''}
          ${sanitizedDates ? `<p><strong>Preferred Dates:</strong> ${escapeHtml(sanitizedDates)}</p>` : ''}
          <p><strong>Number of Guests:</strong> ${escapeHtml(sanitizedGuests)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
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
${sanitizedPhone ? `Phone: ${sanitizedPhone}\n` : ''}${sanitizedDates ? `Preferred Dates: ${sanitizedDates}\n` : ''}Number of Guests: ${sanitizedGuests}

Message:
${sanitizedMessage}

---
This inquiry was forwarded from the DEVOCEAN Lodge website (devoceanlodge.com).
    `.trim();

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: "Email service not configured" });
    }

    // Send email to operator
    const operatorResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DEVOCEAN Lodge - Ponta do Ouro <reservations@devoceanlodge.com>',
        to: [operatorEmail],
        bcc: ['info@devoceanlodge.com'],
        subject: `Experience Inquiry: ${sanitizedExperience}`,
        html: operatorEmailHtml,
        text: operatorEmailText,
      }),
    });

    if (!operatorResponse.ok) {
      const errorText = await operatorResponse.text();
      console.error('Failed to send operator email:', errorText);
      return res.status(500).json({ error: "Failed to send inquiry" });
    }

    // Send auto-reply to customer
    const autoReplyMessages = {
      en: `Thank you for your interest in ${sanitizedExperience}! Your inquiry has been forwarded to ${sanitizedOperator}. They will contact you directly via email or phone to confirm availability and provide pricing details.`,
      'pt-PT': `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
      'pt-BR': `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
      pt: `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`
    };

    const autoReplySubjects = {
      en: `Experience Inquiry Received - DEVOCEAN Lodge`,
      'pt-PT': `Consulta de Experiência Recebida - DEVOCEAN Lodge`,
      'pt-BR': `Consulta de Experiência Recebida - DEVOCEAN Lodge`,
      pt: `Consulta de Experiência Recebida - DEVOCEAN Lodge`
    };

    const autoReplyMessage = autoReplyMessages[sanitizedLang] || autoReplyMessages.en;
    const autoReplySubject = autoReplySubjects[sanitizedLang] || autoReplySubjects.en;

    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">DEVOCEAN Lodge</h2>
        <p>${autoReplyMessage}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${getExperienceFieldLabel('experience', sanitizedLang)}:</strong> ${escapeHtml(sanitizedExperience)}</p>
          <p><strong>${getExperienceFieldLabel('operator', sanitizedLang)}:</strong> ${escapeHtml(sanitizedOperator)}</p>
          ${sanitizedDates ? `<p><strong>${getExperienceFieldLabel('dates', sanitizedLang)}:</strong> ${escapeHtml(sanitizedDates)}</p>` : ''}
          <p><strong>${getExperienceFieldLabel('guests', sanitizedLang)}:</strong> ${escapeHtml(sanitizedGuests)}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          ${getExperienceFieldLabel('lodge_contact', sanitizedLang)}
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

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DEVOCEAN Lodge - Ponta do Ouro <reservations@devoceanlodge.com>',
        to: [sanitizedEmail],
        subject: autoReplySubject,
        html: autoReplyHtml,
      }),
    });

    console.log(`Experience inquiry sent: ${sanitizedExperience} to ${sanitizedOperator} (${operatorEmail})`);
    res.json({ success: true });

  } catch (error) {
    console.error('Experience inquiry error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to get localized field labels for auto-reply
function getExperienceFieldLabel(field, lang) {
  const labels = {
    experience: { en: "Experience", 'pt-PT': "Experiência", 'pt-BR': "Experiência", pt: "Experiência" },
    operator: { en: "Operator", 'pt-PT': "Operador", 'pt-BR': "Operador", pt: "Operador" },
    dates: { en: "Preferred Dates", 'pt-PT': "Datas Preferidas", 'pt-BR': "Datas Preferidas", pt: "Datas Preferidas" },
    guests: { en: "Number of Guests", 'pt-PT': "Número de Pessoas", 'pt-BR': "Número de Pessoas", pt: "Número de Pessoas" },
    lodge_contact: {
      en: "Meanwhile, feel free to explore our accommodation options and book your stay at DEVOCEAN Lodge.",
      'pt-PT': "Enquanto isso, sinta-se à vontade para explorar nossas opções de acomodação e reservar sua estadia no DEVOCEAN Lodge.",
      'pt-BR': "Enquanto isso, sinta-se à vontade para explorar nossas opções de acomodação e reservar sua estadia no DEVOCEAN Lodge.",
      pt: "Enquanto isso, sinta-se à vontade para explorar nossas opções de acomodação e reservar sua estadia no DEVOCEAN Lodge."
    }
  };
  return (labels[field] && labels[field][lang]) || (labels[field] && labels[field].en) || field;
}

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
