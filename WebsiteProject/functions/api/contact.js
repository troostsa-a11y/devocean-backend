// Security: Sanitize header strings (remove ALL newlines)
function sanitizeHeader(str) {
  return String(str).replace(/[\r\n]/g, '').trim();
}

// Security: Sanitize message body (remove CRLF but preserve LF)
function sanitizeMessage(str) {
  return String(str).replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
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

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { name, email, message, checkin_iso, checkout_iso, unit, currency, lang, recaptcha_token } = data;

    // Validate reCAPTCHA token
    if (!recaptcha_token) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA validation required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify reCAPTCHA with Google
    const recaptchaSecret = env.RECAPTCHA_SECRET_KEY;
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    
    const recaptchaResponse = await fetch(recaptchaVerifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${recaptcha_token}`
    });

    const recaptchaResult = await recaptchaResponse.json();
    
    if (!recaptchaResult.success) {
      console.error('reCAPTCHA verification failed:', recaptchaResult);
      return new Response(JSON.stringify({ error: 'reCAPTCHA verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify action matches expected value to prevent token reuse
    if (recaptchaResult.action !== 'contact_form') {
      console.warn('reCAPTCHA action mismatch:', recaptchaResult.action, 'expected: contact_form');
      return new Response(JSON.stringify({ error: 'Invalid security token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check score for v3 (0.0 to 1.0, higher is better)
    if (recaptchaResult.score !== undefined) {
      if (recaptchaResult.score < 0.3) {
        console.warn('reCAPTCHA score too low (bot detected):', recaptchaResult.score);
        return new Response(JSON.stringify({ error: 'Security verification failed. Please try again.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (recaptchaResult.score < 0.5) {
        console.warn('Low reCAPTCHA score (suspicious):', recaptchaResult.score, 'from:', email);
      }
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize and validate inputs
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
    
    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      return new Response(JSON.stringify({ error: 'Invalid input data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

    // Prepare main email content
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
    const resendApiKey = env.RESEND_API_KEY;
    
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
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult.id);

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

    // Build booking URL pointing to booking.html
    const bookingUrl = `https://devoceanlodge.com/booking.html`;

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
          console.log('Auto-reply sent to:', sanitizedEmail, 'ID:', autoReplyResult.id);
        } else {
          const errorText = await autoReplyResponse.text();
          console.error('Auto-reply failed:', errorText);
        }
      } catch (autoReplyError) {
        console.error('Auto-reply failed:', autoReplyError.message);
        // Don't fail the main request if auto-reply fails
      }
    }

    return new Response(JSON.stringify({ success: true, messageId: emailResult.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
