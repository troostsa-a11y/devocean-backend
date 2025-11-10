import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { RecaptchaVerifier } from '../utils/recaptcha';

/**
 * Contact Form Routes
 * Handles contact form submissions and experience inquiries using SMTP
 */

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export function createContactRoutes(smtpConfig: SMTPConfig, recaptchaSecret: string) {
  const router = Router();
  const transporter = nodemailer.createTransport(smtpConfig);
  const recaptchaVerifier = new RecaptchaVerifier(recaptchaSecret);

  // Helper functions
  // Security: Remove CR/LF and dangerous characters from header fields (name, email) to prevent header injection
  const sanitizeHeader = (str: string) => String(str).replace(/[\r\n<>]/g, '').trim();
  // Security: Sanitize message body (allow newlines for readability)
  const sanitizeMessage = (str: string) => String(str).replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
  const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m));

  /**
   * POST /api/contact
   * General contact form submission
   */
  router.post('/contact', async (req: Request, res: Response) => {
    try {
      const { name, email, phone, message, lang, recaptcha_token } = req.body;

      // Verify reCAPTCHA (action must match frontend: contact_form)
      const verification = await recaptchaVerifier.verify(recaptcha_token, 'contact_form');
      if (!verification.success) {
        return res.status(400).json({ error: verification.error });
      }

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Sanitize inputs (header fields must remove CR/LF to prevent header injection)
      const sanitizedName = sanitizeHeader(name).slice(0, 100);
      const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
      const sanitizedPhone = phone ? sanitizeHeader(phone).slice(0, 30) : '';
      const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
      const sanitizedLang = sanitizeHeader(lang || 'en').slice(0, 10);

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Email to lodge
      const emailSubject = `Website Contact: ${sanitizedName}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #9e4b13;">New Contact Form Submission</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
            ${sanitizedPhone ? `<p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: '"DEVOCEAN Lodge Website" <reservations@devoceanlodge.com>',
        to: 'info@devoceanlodge.com',
        replyTo: sanitizedEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      // Auto-reply translations
      const autoReplyMessages: Record<string, string> = {
        en: "Thanks for reaching out to DEVOCEAN Lodge. We've received your message and will get back to you shortly.",
        pt: "Obrigado por entrar em contato com o DEVOCEAN Lodge. Recebemos sua mensagem e entraremos em contato em breve.",
        nl: "Bedankt voor je bericht aan DEVOCEAN Lodge. We nemen snel contact op.",
        fr: "Merci d'avoir contacté DEVOCEAN Lodge. Nous vous répondrons prochainement.",
        it: "Grazie per aver contattato DEVOCEAN Lodge. Ti risponderemo a breve.",
        de: "Danke für Ihre Nachricht an DEVOCEAN Lodge. Wir melden uns bald.",
        es: "Gracias por contactarnos en DEVOCEAN Lodge. Nos pondremos en contacto pronto.",
      };

      const autoReplySubjects: Record<string, string> = {
        en: "Thanks — DEVOCEAN Lodge",
        pt: "Obrigado — DEVOCEAN Lodge",
        nl: "Bedankt — DEVOCEAN Lodge",
        fr: "Merci — DEVOCEAN Lodge",
        it: "Grazie — DEVOCEAN Lodge",
        de: "Danke — DEVOCEAN Lodge",
        es: "Gracias — DEVOCEAN Lodge",
      };

      const greetings: Record<string, string> = {
        en: "Hi", pt: "Olá", nl: "Hoi", fr: "Bonjour",
        it: "Ciao", de: "Hallo", es: "Hola",
      };

      const sincerelyText: Record<string, string> = {
        en: "Warm regards", pt: "Atenciosamente", nl: "Met vriendelijke groet",
        fr: "Cordialement", it: "Cordialmente", de: "Mit freundlichen Grüßen", es: "Cordialmente",
      };

      const bookingUrl = 'https://devoceanlodge.com/booking.html';

      const autoReplyHtml = `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#0f172a;max-width:600px">
          <tr><td><p style="margin:0 0 16px 0;font-size:16px">${escapeHtml(greetings[sanitizedLang] || greetings.en)} ${escapeHtml(sanitizedName)},</p></td></tr>
          <tr><td><p style="margin:0 0 24px 0;font-size:16px">${escapeHtml(autoReplyMessages[sanitizedLang] || autoReplyMessages.en)}</p></td></tr>
          <tr><td><p style="margin:32px 0 12px 0;font-size:16px">${escapeHtml(sincerelyText[sanitizedLang] || sincerelyText.en)},</p></td></tr>
          <tr><td style="padding:16px 0"><p style="margin:0;font-weight:600;font-size:16px">Sean & the Team</p><p style="margin:4px 0 0 0;color:#64748b;font-size:14px">DEVOCEAN Lodge · Ponta do Ouro, Mozambique</p></td></tr>
          <tr><td style="padding:24px 0 0 0;border-top:1px solid #e2e8f0"><table cellpadding="0" cellspacing="0" border="0" style="margin:16px 0"><tr><td style="padding:12px 24px;background:#9e4b13;border-radius:6px"><a href="${bookingUrl}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px">Book Your Stay</a></td></tr></table></td></tr>
        </table>
      `;

      await transporter.sendMail({
        from: '"DEVOCEAN Lodge - Ponta do Ouro" <reservations@devoceanlodge.com>',
        to: sanitizedEmail,
        subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
        html: autoReplyHtml,
      });

      console.log(`✅ Contact form submission from ${sanitizedName} (${sanitizedEmail})`);
      res.json({ success: true });

    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/experience-inquiry
   * Experience/dolphins inquiry form submission
   */
  router.post('/experience-inquiry', async (req: Request, res: Response) => {
    try {
      const { name, email, phone, operator, dates, guests, message, experience, experienceKey, lang, recaptcha_token, operatorEmail } = req.body;

      // Verify reCAPTCHA
      const verification = await recaptchaVerifier.verify(recaptcha_token, 'experience_inquiry');
      if (!verification.success) {
        return res.status(400).json({ error: verification.error });
      }

      // Validate required fields
      if (!name || !email || !operator || !message || !experience || !operatorEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Sanitize inputs (header fields must remove CR/LF to prevent header injection)
      const sanitizedName = sanitizeHeader(name).slice(0, 100);
      const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
      const sanitizedPhone = phone ? sanitizeHeader(phone).slice(0, 30) : '';
      const sanitizedOperator = sanitizeHeader(operator).slice(0, 100);
      const sanitizedOperatorEmail = sanitizeHeader(operatorEmail).slice(0, 100);
      const sanitizedDates = dates ? sanitizeHeader(dates).slice(0, 100) : '';
      const sanitizedGuests = guests ? sanitizeHeader(guests).slice(0, 10) : '2';
      const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
      const sanitizedExperience = sanitizeHeader(experience).slice(0, 200);
      const sanitizedLang = lang ? sanitizeHeader(lang).slice(0, 10) : 'en';

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail) || !emailRegex.test(sanitizedOperatorEmail)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Google Translate link
      const messageForTranslation = `From: ${sanitizedName}\nEmail: ${sanitizedEmail}\nDates: ${sanitizedDates || 'Not specified'}\nGuests: ${sanitizedGuests}\n\nMessage:\n${sanitizedMessage}`;
      const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(messageForTranslation)}&op=translate`;

      // Email to operator
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
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
            <p style="margin: 0 0 10px 0; color: #1976D2; font-weight: bold;">🌐 Need to translate this inquiry?</p>
            <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">Click the button below to open this message in Google Translate.</p>
            <a href="${translateUrl}" target="_blank" style="display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Translate with Google</a>
          </div>
          <p style="color: #666; font-size: 12px;">This inquiry was forwarded from the DEVOCEAN Lodge website (devoceanlodge.com).</p>
        </div>
      `;

      const bccEmail = experienceKey === 'dolphins' ? 'partners@devoceanlodge.com' : 'info@devoceanlodge.com';

      await transporter.sendMail({
        from: '"DEVOCEAN Lodge - Ponta do Ouro" <reservations@devoceanlodge.com>',
        to: sanitizedOperatorEmail,
        bcc: bccEmail,
        subject: `Experience Inquiry: ${sanitizedExperience}`,
        html: operatorEmailHtml,
      });

      // Auto-reply to customer
      const autoReplyMessages: Record<string, string> = {
        en: `Thank you for your interest in ${sanitizedExperience}! Your inquiry has been forwarded to ${sanitizedOperator}. They will contact you directly via email or phone to confirm availability and provide pricing details.`,
        'pt-PT': `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
        'pt-BR': `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
        pt: `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
      };

      const autoReplySubjects: Record<string, string> = {
        en: 'Experience Inquiry Received - DEVOCEAN Lodge',
        'pt-PT': 'Consulta de Experiência Recebida - DEVOCEAN Lodge',
        'pt-BR': 'Consulta de Experiência Recebida - DEVOCEAN Lodge',
        pt: 'Consulta de Experiência Recebida - DEVOCEAN Lodge',
      };

      const fieldLabels: Record<string, Record<string, string>> = {
        experience: { en: 'Experience', 'pt-PT': 'Experiência', 'pt-BR': 'Experiência', pt: 'Experiência' },
        operator: { en: 'Operator', 'pt-PT': 'Operador', 'pt-BR': 'Operador', pt: 'Operador' },
        dates: { en: 'Preferred Dates', 'pt-PT': 'Datas Preferidas', 'pt-BR': 'Datas Preferidas', pt: 'Datas Preferidas' },
        guests: { en: 'Number of Guests', 'pt-PT': 'Número de Pessoas', 'pt-BR': 'Número de Pessoas', pt: 'Número de Pessoas' },
        lodge_contact: {
          en: 'Meanwhile, feel free to explore our accommodation options and book your stay at DEVOCEAN Lodge.',
          'pt-PT': 'Enquanto isso, sinta-se à vontade para explorar nossas opções de acomodação e reservar sua estadia no DEVOCEAN Lodge.',
          'pt-BR': 'Enquanto isso, sinta-se à vontade para explorar nossas opções de acomodação e reservar sua estadia no DEVOCEAN Lodge.',
          pt: 'Enquanto isso, sinta-se à vontade para explorar nossas opções de acomodação e reservar sua estadia no DEVOCEAN Lodge.',
        },
      };

      const getLabel = (field: string) => (fieldLabels[field]?.[sanitizedLang]) || (fieldLabels[field]?.en) || field;

      const autoReplyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9e4b13;">DEVOCEAN Lodge</h2>
          <p>${autoReplyMessages[sanitizedLang] || autoReplyMessages.en}</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${getLabel('experience')}:</strong> ${escapeHtml(sanitizedExperience)}</p>
            <p><strong>${getLabel('operator')}:</strong> ${escapeHtml(sanitizedOperator)}</p>
            ${sanitizedDates ? `<p><strong>${getLabel('dates')}:</strong> ${escapeHtml(sanitizedDates)}</p>` : ''}
            <p><strong>${getLabel('guests')}:</strong> ${escapeHtml(sanitizedGuests)}</p>
          </div>
          <p style="color: #666; font-size: 14px;">${getLabel('lodge_contact')}</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">DEVOCEAN Lodge<br>Ponta do Ouro, Mozambique<br><a href="https://devoceanlodge.com">devoceanlodge.com</a></p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: '"DEVOCEAN Lodge - Ponta do Ouro" <reservations@devoceanlodge.com>',
        to: sanitizedEmail,
        subject: autoReplySubjects[sanitizedLang] || autoReplySubjects.en,
        html: autoReplyHtml,
      });

      console.log(`✅ Experience inquiry: ${sanitizedExperience} to ${sanitizedOperator} (${sanitizedOperatorEmail})`);
      res.json({ success: true });

    } catch (error) {
      console.error('Experience inquiry error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
