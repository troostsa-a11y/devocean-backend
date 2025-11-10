/**
 * Standalone Contact Form Cloudflare Worker
 * Sends emails directly via MailChannels (no backend needed)
 * 
 * Required Cloudflare Environment Variables:
 * - RECAPTCHA_SECRET_KEY: Google reCAPTCHA v3 secret
 * - SMTP_DKIM_DOMAIN: devoceanlodge.com (for DKIM signing)
 * - SMTP_DKIM_SELECTOR: mailchannels (for DKIM signing)
 * - SMTP_DKIM_PRIVATE_KEY: DKIM private key (optional but recommended)
 */

// Security: Remove CR/LF from header fields to prevent email header injection
const sanitizeHeader = (str) => String(str).replace(/[\r\n<>]/g, '').trim();
// Security: Sanitize message body (allow newlines for readability)
const sanitizeMessage = (str) => String(str).replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
const escapeHtml = (text) => text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m));

// Multi-language auto-reply subjects
const autoReplySubjects = {
  en: '✅ Thank you for contacting DEVOCEAN Lodge',
  pt: '✅ Obrigado por entrar em contato com o DEVOCEAN Lodge',
  es: '✅ Gracias por contactar a DEVOCEAN Lodge',
  fr: '✅ Merci d\'avoir contacté DEVOCEAN Lodge',
  de: '✅ Vielen Dank für Ihre Kontaktaufnahme mit DEVOCEAN Lodge',
  it: '✅ Grazie per aver contattato DEVOCEAN Lodge',
  nl: '✅ Bedankt voor het contact opnemen met DEVOCEAN Lodge',
  ru: '✅ Спасибо за обращение в DEVOCEAN Lodge',
  zh: '✅ 感谢您联系 DEVOCEAN Lodge',
  ja: '✅ DEVOCEAN Lodgeへのお問い合わせありがとうございます',
  ar: '✅ شكراً لتواصلك مع DEVOCEAN Lodge',
  pl: '✅ Dziękujemy za kontakt z DEVOCEAN Lodge',
  cs: '✅ Děkujeme za kontakt s DEVOCEAN Lodge',
  tr: '✅ DEVOCEAN Lodge ile iletişime geçtiğiniz için teşekkürler',
  sv: '✅ Tack för att du kontaktade DEVOCEAN Lodge',
  da: '✅ Tak fordi du kontaktede DEVOCEAN Lodge',
  fi: '✅ Kiitos yhteydenotostasi DEVOCEAN Lodgeen',
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

// Send email via MailChannels
async function sendEmail(from, to, subject, html) {
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: 'DEVOCEAN Lodge - Ponta do Ouro' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MailChannels error: ${error}`);
  }
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
    const { name, email, phone, message, lang, recaptcha_token } = await request.json();

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

    // Sanitize inputs (header fields must remove CR/LF to prevent header injection)
    const sanitizedName = sanitizeHeader(name).slice(0, 100);
    const sanitizedEmail = sanitizeHeader(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitizeHeader(phone).slice(0, 30) : '';
    const sanitizedMessage = sanitizeMessage(message).slice(0, 2000);
    const sanitizedLang = sanitizeHeader(lang || 'en').slice(0, 10);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Email to lodge
    const lodgeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">New Contact Form Submission</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
          ${sanitizedPhone ? `<p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
        </div>
        <p style="color: #666; font-size: 12px;">Sent from devoceanlodge.com contact form</p>
      </div>
    `;

    await sendEmail('reservations@devoceanlodge.com', 'reservations@devoceanlodge.com', 
      `Contact Form: ${sanitizedName}`, lodgeEmailHtml);

    // Auto-reply to guest
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">Thank you for contacting us!</h2>
        <p>Dear ${escapeHtml(sanitizedName)},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p style="margin-top: 20px;">Best regards,<br/>The DEVOCEAN Lodge Team</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">DEVOCEAN Lodge - Ponta do Ouro, Mozambique<br/>🌐 devoceanlodge.com</p>
      </div>
    `;

    await sendEmail('reservations@devoceanlodge.com', sanitizedEmail,
      autoReplySubjects[sanitizedLang] || autoReplySubjects.en, autoReplyHtml);

    console.log(`✅ Contact form submission from ${sanitizedName} (${sanitizedEmail})`);
    
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
