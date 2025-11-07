import { EXPERIENCE_DETAILS } from '../../src/data/experienceDetails.js';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json();
    const { name, email, phone, operator, dates, guests, message, experience, experienceKey, lang, currency, recaptcha_token } = body;

    // Verify reCAPTCHA token
    if (!recaptcha_token) {
      return new Response(JSON.stringify({ error: "reCAPTCHA verification required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${context.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`
    });

    const recaptchaResult = await recaptchaResponse.json();
    
    if (!recaptchaResult.success) {
      console.error('reCAPTCHA verification failed:', recaptchaResult);
      return new Response(JSON.stringify({ error: "reCAPTCHA verification failed" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Note: Standard reCAPTCHA v3 doesn't return action field (only Enterprise does)
    // Only check action if it exists
    if (recaptchaResult.action && recaptchaResult.action !== 'experience_inquiry') {
      console.warn('reCAPTCHA action mismatch:', recaptchaResult.action, 'expected: experience_inquiry');
      return new Response(JSON.stringify({ error: "Invalid security token" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (recaptchaResult.score !== undefined && recaptchaResult.score < 0.3) {
      console.warn('reCAPTCHA score too low (bot detected):', recaptchaResult.score);
      return new Response(JSON.stringify({ error: "Security verification failed. Please try again." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!name || !email || !operator || !message || !experience) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize inputs
    const sanitize = (str) => String(str).replace(/[<>]/g, '').trim();
    const sanitizedName = sanitize(name).slice(0, 100);
    const sanitizedEmail = sanitize(email).slice(0, 100);
    const sanitizedPhone = phone ? sanitize(phone).slice(0, 30) : "";
    const sanitizedOperator = sanitize(operator).slice(0, 100);
    const sanitizedDates = dates ? sanitize(dates).slice(0, 100) : "";
    const sanitizedGuests = guests ? sanitize(guests).slice(0, 10) : "2";
    const sanitizedMessage = sanitize(message).slice(0, 2000);
    const sanitizedExperience = sanitize(experience).slice(0, 200);
    const sanitizedLang = lang ? sanitize(lang).slice(0, 10) : "en";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load experience operator data
    const expData = EXPERIENCE_DETAILS[experienceKey];
    const operatorData = expData?.operators?.find(op => op.name === sanitizedOperator);
    
    if (!operatorData) {
      console.error('Operator not found:', sanitizedOperator, 'for experience:', experienceKey);
      return new Response(JSON.stringify({ error: "Invalid operator selected" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const operatorEmail = operatorData.email;
    const escapeHtml = (text) => text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

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

    // Send email to operator
    const operatorResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
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
      return new Response(JSON.stringify({ error: "Failed to send inquiry" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
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

    const fieldLabels = {
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

    const getLabel = (field) => (fieldLabels[field] && fieldLabels[field][sanitizedLang]) || (fieldLabels[field] && fieldLabels[field].en) || field;

    const autoReplyMessage = autoReplyMessages[sanitizedLang] || autoReplyMessages.en;
    const autoReplySubject = autoReplySubjects[sanitizedLang] || autoReplySubjects.en;

    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9e4b13;">DEVOCEAN Lodge</h2>
        <p>${autoReplyMessage}</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>${getLabel('experience')}:</strong> ${escapeHtml(sanitizedExperience)}</p>
          <p><strong>${getLabel('operator')}:</strong> ${escapeHtml(sanitizedOperator)}</p>
          ${sanitizedDates ? `<p><strong>${getLabel('dates')}:</strong> ${escapeHtml(sanitizedDates)}</p>` : ''}
          <p><strong>${getLabel('guests')}:</strong> ${escapeHtml(sanitizedGuests)}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          ${getLabel('lodge_contact')}
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
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
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
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Experience inquiry error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
