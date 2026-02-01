/**
 * Email Templates
 * Multi-language templates for automated booking emails
 */

interface EmailTemplate {
  subject: string;
  html: string;
}

type EmailType = 'post_booking' | 'pre_arrival' | 'arrival' | 'post_departure';

const formatDate = (date: Date | string, language: string = 'EN'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const locales: Record<string, string> = {
    EN: 'en-GB',
    PT: 'pt-PT',
    FR: 'fr-FR',
    DE: 'de-DE',
    ES: 'es-ES',
    IT: 'it-IT',
    NL: 'nl-NL',
    CS: 'cs-CZ',
  };

  return d.toLocaleDateString(locales[language] || 'en-GB', options);
};

/**
 * Post-booking confirmation email
 */
const getPostBookingTemplate = (language: string, data: any): EmailTemplate => {
  const templates: Record<string, EmailTemplate> = {
    EN: {
      subject: `Booking Confirmation - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0077BE; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #0077BE; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌊 DEVOCEAN Lodge</h1>
            <p>Your Eco-Friendly Beach Escape in Ponta do Ouro</p>
          </div>
          
          <div class="content">
            <h2>Dear ${data.firstName},</h2>
            
            <p>Thank you for choosing DEVOCEAN Lodge! We're thrilled to confirm your booking.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking Reference:</strong> ${data.groupRef}</p>
              <p><strong>Check-in:</strong> ${formatDate(data.checkInDate, language)}</p>
              <p><strong>Check-out:</strong> ${formatDate(data.checkOutDate, language)}</p>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>You'll receive a pre-arrival email 7 days before your check-in with important information</li>
              <li>Our team is here to help with any questions</li>
              <li>Start planning your beach adventures!</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="https://www.devoceanlodge.com" class="button">Visit Our Website</a>
            </p>
            
            <p>We look forward to welcoming you to paradise!</p>
            
            <p>Warm regards,<br>
            The DEVOCEAN Lodge Team</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mozambique</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
    PT: {
      subject: `Confirmação de Reserva - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0077BE; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #0077BE; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌊 DEVOCEAN Lodge</h1>
            <p>O Seu Refúgio Ecológico na Praia de Ponta do Ouro</p>
          </div>
          
          <div class="content">
            <h2>Caro(a) ${data.firstName},</h2>
            
            <p>Obrigado por escolher o DEVOCEAN Lodge! Estamos entusiasmados em confirmar a sua reserva.</p>
            
            <div class="booking-details">
              <h3>Detalhes da Reserva</h3>
              <p><strong>Referência da Reserva:</strong> ${data.groupRef}</p>
              <p><strong>Check-in:</strong> ${formatDate(data.checkInDate, language)}</p>
              <p><strong>Check-out:</strong> ${formatDate(data.checkOutDate, language)}</p>
            </div>
            
            <p><strong>Próximos Passos:</strong></p>
            <ul>
              <li>Receberá um email 7 dias antes da chegada com informações importantes</li>
              <li>A nossa equipa está disponível para ajudar com qualquer questão</li>
              <li>Comece a planear as suas aventuras na praia!</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="https://www.devoceanlodge.com" class="button">Visite o Nosso Website</a>
            </p>
            
            <p>Aguardamos por si no paraíso!</p>
            
            <p>Com os melhores cumprimentos,<br>
            A Equipa DEVOCEAN Lodge</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Moçambique</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
    CS: {
      subject: `Potvrzení rezervace - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0077BE; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #0077BE; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌊 DEVOCEAN Lodge</h1>
            <p>Váš ekologický plážový únik v Ponta do Ouro</p>
          </div>
          
          <div class="content">
            <h2>Vážený/á ${data.firstName},</h2>
            
            <p>Děkujeme, že jste si vybrali DEVOCEAN Lodge! S radostí potvrzujeme vaši rezervaci.</p>
            
            <div class="booking-details">
              <h3>Detaily rezervace</h3>
              <p><strong>Číslo rezervace:</strong> ${data.groupRef}</p>
              <p><strong>Check-in:</strong> ${formatDate(data.checkInDate, language)}</p>
              <p><strong>Check-out:</strong> ${formatDate(data.checkOutDate, language)}</p>
            </div>
            
            <p><strong>Co bude následovat:</strong></p>
            <ul>
              <li>7 dní před příjezdem obdržíte e-mail s důležitými informacemi</li>
              <li>Náš tým je připraven odpovědět na jakékoliv dotazy</li>
              <li>Začněte plánovat své plážové dobrodružství!</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="https://www.devoceanlodge.com" class="button">Navštivte naše webové stránky</a>
            </p>
            
            <p>Těšíme se, že vás přivítáme v ráji!</p>
            
            <p>S pozdravem,<br>
            Tým DEVOCEAN Lodge</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mosambik</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[language] || templates.EN;
};

/**
 * Pre-arrival email (7 days before check-in)
 */
const getPreArrivalTemplate = (language: string, data: any): EmailTemplate => {
  const templates: Record<string, EmailTemplate> = {
    EN: {
      subject: `One Week Until Paradise - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #F4A460; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌊 Your DEVOCEAN Adventure Awaits!</h1>
          </div>
          
          <div class="content">
            <h2>Dear ${data.firstName},</h2>
            
            <p>Just one more week until your beach escape! We're excited to welcome you to DEVOCEAN Lodge.</p>
            
            <div class="info-box">
              <h3>📍 Getting Here</h3>
              <p><strong>Address:</strong> Ponta do Ouro, Mozambique</p>
              <p><strong>Check-in:</strong> ${formatDate(data.checkInDate, language)} from 2:00 PM</p>
              <p><strong>Check-out:</strong> ${formatDate(data.checkOutDate, language)} by 10:00 AM</p>
            </div>
            
            <div class="info-box">
              <h3>🎒 What to Pack</h3>
              <ul>
                <li>Swimwear and beach essentials</li>
                <li>Sun protection (hat, sunscreen)</li>
                <li>Light, comfortable clothing</li>
                <li>Reef-safe sunscreen for snorkeling</li>
                <li>Camera for incredible sunsets!</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>🌊 Activities & Experiences</h3>
              <ul>
                <li>Dolphin watching tours</li>
                <li>Snorkeling and diving</li>
                <li>Beach walks and relaxation</li>
                <li>Local cuisine experiences</li>
              </ul>
            </div>
            
            <p>If you have any questions before arrival, please don't hesitate to reach out!</p>
            
            <p>See you soon!<br>
            The DEVOCEAN Lodge Team</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mozambique</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
    CS: {
      subject: `Ještě týden do ráje - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #F4A460; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌊 Vaše DEVOCEAN dobrodružství čeká!</h1>
          </div>
          
          <div class="content">
            <h2>Vážený/á ${data.firstName},</h2>
            
            <p>Už jen týden do vašeho plážového úniku! Těšíme se, že vás přivítáme v DEVOCEAN Lodge.</p>
            
            <div class="info-box">
              <h3>📍 Jak se k nám dostat</h3>
              <p><strong>Adresa:</strong> Ponta do Ouro, Mosambik</p>
              <p><strong>Check-in:</strong> ${formatDate(data.checkInDate, language)} od 14:00</p>
              <p><strong>Check-out:</strong> ${formatDate(data.checkOutDate, language)} do 10:00</p>
            </div>
            
            <div class="info-box">
              <h3>🎒 Co si zabalit</h3>
              <ul>
                <li>Plavky a plážové potřeby</li>
                <li>Ochrana proti slunci (klobouk, opalovací krém)</li>
                <li>Lehké, pohodlné oblečení</li>
                <li>Opalovací krém bezpečný pro korály na šnorchlování</li>
                <li>Fotoaparát na neuvěřitelné západy slunce!</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>🌊 Aktivity a zážitky</h3>
              <ul>
                <li>Pozorování delfínů</li>
                <li>Šnorchlování a potápění</li>
                <li>Procházky po pláži a relaxace</li>
                <li>Místní gastronomické zážitky</li>
              </ul>
            </div>
            
            <p>Pokud máte před příjezdem jakékoliv dotazy, neváhejte se ozvat!</p>
            
            <p>Brzy na viděnou!<br>
            Tým DEVOCEAN Lodge</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mosambik</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[language] || templates.EN;
};

/**
 * Arrival reminder email (2 days before check-in)
 */
const getArrivalTemplate = (language: string, data: any): EmailTemplate => {
  const templates: Record<string, EmailTemplate> = {
    EN: {
      subject: `Almost Here! Final Details - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .important { background: #FFF3CD; padding: 15px; margin: 15px 0; border-left: 4px solid #FFC107; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Almost Time for Paradise!</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            
            <p>Your DEVOCEAN adventure begins in just 2 days! Here are your final details:</p>
            
            <div class="important">
              <h3>⏰ Check-in Details</h3>
              <p><strong>Date:</strong> ${formatDate(data.checkInDate, language)}</p>
              <p><strong>Time:</strong> From 2:00 PM</p>
              <p><strong>Booking Reference:</strong> ${data.groupRef}</p>
            </div>
            
            <div class="important">
              <h3>📱 Contact Information</h3>
              <p><strong>Email:</strong> info@devoceanlodge.com</p>
              <p><strong>Emergency Contact:</strong> Available on arrival</p>
            </div>
            
            <p><strong>Travel Tip:</strong> Please allow extra time for border crossing if traveling from South Africa.</p>
            
            <p>Safe travels, and we'll see you very soon!</p>
            
            <p>Best wishes,<br>
            The DEVOCEAN Lodge Team</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mozambique</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
    CS: {
      subject: `Už jste skoro tady! Poslední detaily - DEVOCEAN Lodge (Ref: ${data.groupRef})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .important { background: #FFF3CD; padding: 15px; margin: 15px 0; border-left: 4px solid #FFC107; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Ráj je na dosah!</h1>
          </div>
          
          <div class="content">
            <h2>Ahoj ${data.firstName},</h2>
            
            <p>Vaše DEVOCEAN dobrodružství začíná už za 2 dny! Zde jsou poslední detaily:</p>
            
            <div class="important">
              <h3>⏰ Detaily check-in</h3>
              <p><strong>Datum:</strong> ${formatDate(data.checkInDate, language)}</p>
              <p><strong>Čas:</strong> Od 14:00</p>
              <p><strong>Číslo rezervace:</strong> ${data.groupRef}</p>
            </div>
            
            <div class="important">
              <h3>📱 Kontaktní informace</h3>
              <p><strong>Email:</strong> info@devoceanlodge.com</p>
              <p><strong>Nouzový kontakt:</strong> K dispozici při příjezdu</p>
            </div>
            
            <p><strong>Tip na cestu:</strong> Počítejte prosím s delším časem na hraničním přechodu, pokud cestujete z Jihoafrické republiky.</p>
            
            <p>Šťastnou cestu a brzy na viděnou!</p>
            
            <p>S přáním všeho dobrého,<br>
            Tým DEVOCEAN Lodge</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mosambik</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[language] || templates.EN;
};

/**
 * Post-departure thank you email
 */
const getPostDepartureTemplate = (language: string, data: any): EmailTemplate => {
  const templates: Record<string, EmailTemplate> = {
    EN: {
      subject: `Thank You for Staying with Us - DEVOCEAN Lodge`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .highlight { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0077BE; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #0077BE; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💙 Thank You!</h1>
          </div>
          
          <div class="content">
            <h2>Dear ${data.firstName},</h2>
            
            <p>Thank you for choosing DEVOCEAN Lodge for your beach getaway! We hope you had an unforgettable experience.</p>
            
            <div class="highlight">
              <h3>📸 Share Your Experience</h3>
              <p>We'd love to see your photos and hear about your favorite moments! Tag us on social media:</p>
              <ul>
                <li>Instagram: @devoceanlodge</li>
                <li>Facebook: /devoceanlodge</li>
              </ul>
            </div>
            
            <div class="highlight">
              <h3>⭐ Leave a Review</h3>
              <p>Your feedback helps us improve and helps other travelers discover paradise. Please consider leaving a review on:</p>
              <ul>
                <li>Google Reviews</li>
                <li>TripAdvisor</li>
                <li>Booking.com</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="https://www.devoceanlodge.com" class="button">Book Your Next Stay</a>
            </p>
            
            <p>We hope to welcome you back soon!</p>
            
            <p>With gratitude,<br>
            The DEVOCEAN Lodge Team</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mozambique</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
    CS: {
      subject: `Děkujeme za váš pobyt - DEVOCEAN Lodge`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .highlight { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0077BE; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #0077BE; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💙 Děkujeme!</h1>
          </div>
          
          <div class="content">
            <h2>Vážený/á ${data.firstName},</h2>
            
            <p>Děkujeme, že jste si vybrali DEVOCEAN Lodge pro svůj plážový únik! Doufáme, že jste prožili nezapomenutelný zážitek.</p>
            
            <div class="highlight">
              <h3>📸 Sdílejte své zážitky</h3>
              <p>Rádi bychom viděli vaše fotky a slyšeli o vašich nejlepších momentech! Označte nás na sociálních sítích:</p>
              <ul>
                <li>Instagram: @devoceanlodge</li>
                <li>Facebook: /devoceanlodge</li>
              </ul>
            </div>
            
            <div class="highlight">
              <h3>⭐ Zanechte recenzi</h3>
              <p>Vaše zpětná vazba nám pomáhá zlepšovat se a pomáhá dalším cestovatelům objevit ráj. Prosíme, zvažte zanechání recenze na:</p>
              <ul>
                <li>Google Reviews</li>
                <li>TripAdvisor</li>
                <li>Booking.com</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="https://www.devoceanlodge.com" class="button">Rezervujte další pobyt</a>
            </p>
            
            <p>Doufáme, že vás brzy opět přivítáme!</p>
            
            <p>S vděčností,<br>
            Tým DEVOCEAN Lodge</p>
          </div>
          
          <div class="footer">
            <p>DEVOCEAN Lodge | Ponta do Ouro, Mosambik</p>
            <p>Email: info@devoceanlodge.com | Website: www.devoceanlodge.com</p>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[language] || templates.EN;
};

/**
 * Get email template based on type and language
 */
export const getEmailTemplate = (
  emailType: EmailType,
  language: string = 'EN',
  data: any
): EmailTemplate => {
  const lang = language.toUpperCase();

  switch (emailType) {
    case 'post_booking':
      return getPostBookingTemplate(lang, data);
    case 'pre_arrival':
      return getPreArrivalTemplate(lang, data);
    case 'arrival':
      return getArrivalTemplate(lang, data);
    case 'post_departure':
      return getPostDepartureTemplate(lang, data);
    default:
      return getPostBookingTemplate(lang, data);
  }
};
