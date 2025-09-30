import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import nodemailer from "nodemailer";

// Security: Sanitize header strings (remove ALL newlines - for name, email, subject)
function sanitizeHeader(str: string): string {
  return String(str).replace(/[\r\n]/g, '').trim();
}

// Security: Sanitize message body (remove CRLF but preserve LF for formatting)
function sanitizeMessage(str: string): string {
  return String(str).replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
}

// Security: Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function registerRoutes(app: Express): Promise<Server> {
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

      // Sanitize optional fields (single-line values)
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

      // Build email content (safe - already sanitized)
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

      // Send email with safe address objects (prevents header injection)
      await transporter.sendMail({
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
      });

      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
