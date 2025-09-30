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

// Email endpoint for contact form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, checkin_iso, checkout_iso, currency, lang } = req.body;

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
    const sanitizedCurrency = currency ? sanitizeHeader(currency).slice(0, 10) : "EUR";
    const sanitizedLang = lang ? sanitizeHeader(lang).slice(0, 10) : "en";

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
    const checkinText = sanitizedCheckin ? `Check-in: ${sanitizedCheckin}` : "";
    const checkoutText = sanitizedCheckout ? `Check-out: ${sanitizedCheckout}` : "";
    const datesText = checkinText || checkoutText ? `\n\n${checkinText}\n${checkoutText}` : "";
    
    const emailBody = `
New contact form submission from DEVOCEAN Lodge website:

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Language: ${sanitizedLang}
Currency: ${sanitizedCurrency}${datesText}

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

    const bookNowText = {
      en: "Book your stay", pt: "Reserve sua estadia", nl: "Boek uw verblijf",
      fr: "Réservez votre séjour", it: "Prenota il tuo soggiorno",
      de: "Buchen Sie Ihren Aufenthalt", es: "Reserve su estancia",
    };

    // Build localized booking URL
    const localeMap = {
      en: 'en-US', pt: 'pt-BR', nl: 'nl-NL', fr: 'fr-FR',
      it: 'it-IT', de: 'de-DE', es: 'es-ES'
    };
    const hrLocale = localeMap[sanitizedLang] || 'en-US';
    const bookingUrl = `https://book.devoceanlodge.com/bv3/search?locale=${hrLocale}&currency=${sanitizedCurrency}`;

    const autoReplyBody = `
${greetings[sanitizedLang] || greetings.en} ${sanitizedName},

${autoReplyMessages[sanitizedLang] || autoReplyMessages.en}

${bookNowText[sanitizedLang] || bookNowText.en}: ${bookingUrl}

—
DEVOCEAN Lodge
Ponta do Ouro, Mozambique
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
          text: autoReplyBody,
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

// Start server
const PORT = process.env.PORT || 5000;

// In development, use Vite dev server
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
  root: __dirname,
});

app.use(vite.middlewares);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
