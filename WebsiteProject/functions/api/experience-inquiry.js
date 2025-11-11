/**
 * Standalone Experience Inquiry Cloudflare Worker
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
async function sendEmail(from, to, subject, html, apiKey, replyTo, bcc = null) {
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

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
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
    const { name, email, phone, operator, dates, guests, message, experience, experienceKey, lang, recaptcha_token, operatorEmail } = await request.json();

    // Verify reCAPTCHA (action must match frontend: experience_inquiry)
    const verification = await verifyRecaptcha(recaptcha_token, 'experience_inquiry', env.RECAPTCHA_SECRET_KEY);
    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    if (!name || !email || !operator || !message || !experience || !operatorEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Send to operator with customer email as reply-to
    await sendEmail('reservations@devoceanlodge.com', sanitizedOperatorEmail,
      `Experience Inquiry: ${sanitizedExperience}`, operatorEmailHtml, env.RESEND_API_KEY, sanitizedEmail, bccEmail);

    // Auto-reply to customer
    const autoReplyMessages = {
      en: `Thank you for your interest in ${sanitizedExperience}! Your inquiry has been forwarded to ${sanitizedOperator}. They will contact you directly via email or phone to confirm availability and provide pricing details.`,
      'pt-PT': `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
      'pt-BR': `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
      pt: `Obrigado pelo seu interesse em ${sanitizedExperience}! Sua consulta foi encaminhada para ${sanitizedOperator}. Eles entrarão em contato diretamente por email ou telefone para confirmar disponibilidade e fornecer detalhes de preço.`,
    };

    const autoReplySubjects = {
      en: 'Experience Inquiry Received - DEVOCEAN Lodge',
      'pt-PT': 'Consulta de Experiência Recebida - DEVOCEAN Lodge',
      'pt-BR': 'Consulta de Experiência Recebida - DEVOCEAN Lodge',
      pt: 'Consulta de Experiência Recebida - DEVOCEAN Lodge',
    };

    const fieldLabels = {
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

    const getLabel = (field) => (fieldLabels[field]?.[sanitizedLang]) || (fieldLabels[field]?.en) || field;

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
        <p>${getLabel('lodge_contact')}</p>
        <p style="margin-top: 20px;">Best regards,<br/>The DEVOCEAN Lodge Team</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">DEVOCEAN Lodge - Ponta do Ouro, Mozambique<br/>🌐 devoceanlodge.com</p>
      </div>
    `;

    // Send auto-reply to customer
    await sendEmail('reservations@devoceanlodge.com', sanitizedEmail,
      autoReplySubjects[sanitizedLang] || autoReplySubjects.en, autoReplyHtml, env.RESEND_API_KEY, 'reservations@devoceanlodge.com');

    console.log(`✅ Experience inquiry from ${sanitizedName} for ${sanitizedExperience}`);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Experience inquiry error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
