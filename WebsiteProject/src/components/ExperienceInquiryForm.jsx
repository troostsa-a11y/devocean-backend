import { useState, useEffect } from 'react';
import { getRecaptchaToken } from '../utils/recaptcha';

export default function ExperienceInquiryForm({ experience, operators, lang, currency }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    operator: operators && operators.length > 0 ? operators[0].name : '',
    operatorEmail: operators && operators.length > 0 ? operators[0].email : '',
    dates: '',
    guests: '2',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Sync operatorEmail when operators prop changes or component mounts
  useEffect(() => {
    if (operators && operators.length > 0 && !formData.operatorEmail) {
      setFormData(prev => ({
        ...prev,
        operator: operators[0].name,
        operatorEmail: operators[0].email
      }));
    }
  }, [operators]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Use shared reCAPTCHA utility (no hardcoded keys!)
      const recaptchaToken = await getRecaptchaToken('experience_inquiry');

      const payload = {
        ...formData,
        experience: experience.title,
        experienceKey: experience.key,
        lang: lang || 'en',
        currency: currency || 'EUR',
        recaptcha_token: recaptchaToken,
        operatorEmail: formData.operatorEmail
      };

      // Debug: log what we're sending
      console.log('Form submission payload:', payload);
      console.log('Required fields check:', {
        name: !!payload.name,
        email: !!payload.email,
        operator: !!payload.operator,
        message: !!payload.message,
        experience: !!payload.experience,
        operatorEmail: !!payload.operatorEmail
      });

      const response = await fetch('/api/experience-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: getSuccessMessage(lang) 
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          operator: operators && operators.length > 0 ? operators[0].name : '',
          operatorEmail: operators && operators.length > 0 ? operators[0].email : '',
          dates: '',
          guests: '2',
          message: ''
        });
      } else {
        const error = await response.json();
        setStatus({ 
          type: 'error', 
          message: error.error || getErrorMessage(lang) 
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus({ 
        type: 'error', 
        message: getErrorMessage(lang)
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // When operator changes, also update operatorEmail
    if (name === 'operator') {
      const selectedOperator = operators.find(op => op.name === value);
      console.log('Operator changed to:', value);
      console.log('Available operators:', operators);
      console.log('Found operator:', selectedOperator);
      console.log('Setting operatorEmail to:', selectedOperator ? selectedOperator.email : 'NOT FOUND');
      
      setFormData(prev => ({ 
        ...prev, 
        operator: value,
        operatorEmail: selectedOperator ? selectedOperator.email : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        {getFormTitle(lang)}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              {getFieldLabel('name', lang)} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              data-testid="input-inquiry-name"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              {getFieldLabel('email', lang)} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              data-testid="input-inquiry-email"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent"
            />
          </div>
        </div>

        {/* Phone & Operator Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              {getFieldLabel('phone', lang)}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              data-testid="input-inquiry-phone"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="operator" className="block text-sm font-medium text-slate-700 mb-2">
              {getFieldLabel('operator', lang)} *
            </label>
            <select
              id="operator"
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              required
              data-testid="select-inquiry-operator"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent"
            >
              {operators && operators.map(op => (
                <option key={op.name} value={op.name}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates & Guests Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dates" className="block text-sm font-medium text-slate-700 mb-2">
              {getFieldLabel('dates', lang)} <span className="text-slate-500 text-sm">(Optional)</span>
            </label>
            <input
              type="date"
              id="dates"
              name="dates"
              value={formData.dates || ''}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              data-testid="input-inquiry-dates"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-slate-700 mb-2">
              {getFieldLabel('guests', lang)}
            </label>
            <input
              type="number"
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min="1"
              data-testid="input-inquiry-guests"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
            {getFieldLabel('message', lang)} * <span className="text-slate-500 text-sm">(min. 20 characters)</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            minLength="20"
            rows="4"
            placeholder={getPlaceholder('message', lang)}
            data-testid="input-inquiry-message"
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#9e4b13] focus:border-transparent resize-none"
          ></textarea>
        </div>

        {/* Status Message */}
        {status.message && (
          <div className={`p-4 rounded-md ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          data-testid="button-submit-inquiry"
          className="w-full bg-[#9e4b13] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#8a4211] disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? getSubmittingText(lang) : getSubmitText(lang)}
        </button>

        <p className="text-xs text-slate-500 text-center">
          {getRecaptchaNotice(lang)}
        </p>
      </form>
    </div>
  );
}

// Translation helpers
function getFormTitle(lang) {
  const titles = {
    en: "Request Information",
    'en-GB': "Request Information",
    'en-US': "Request Information",
    'pt-PT': "Solicitar Informações",
    'pt-BR': "Solicitar Informações",
    pt: "Solicitar Informações",
    nl: "Informatie Aanvragen",
    fr: "Demander des Informations",
    it: "Richiedi Informazioni",
    de: "Informationen Anfordern",
    es: "Solicitar Información",
    af: "Vra Inligting",
    sv: "Begär Information",
    pl: "Poproś o Informacje",
    ja: "情報をリクエスト",
    zh: "请求信息",
    ru: "Запросить Информацию",
    zu: "Cela Ulwazi",
    sw: "Omba Taarifa"
  };
  return titles[lang] || titles[lang.split('-')[0]] || titles.en;
}

function getFieldLabel(field, lang) {
  const labels = {
    name: {
      en: "Your Name",
      'pt-PT': "Seu Nome",
      'pt-BR': "Seu Nome",
      pt: "Seu Nome",
      nl: "Uw Naam",
      fr: "Votre Nom",
      it: "Il Tuo Nome",
      de: "Ihr Name",
      es: "Su Nombre",
      af: "Jou Naam",
      sv: "Ditt Namn",
      pl: "Twoje Imię",
      ja: "お名前",
      zh: "您的姓名",
      ru: "Ваше Имя",
      zu: "Igama Lakho",
      sw: "Jina Lako"
    },
    email: {
      en: "Email Address",
      'pt-PT': "Endereço de Email",
      'pt-BR': "Endereço de Email",
      pt: "Endereço de Email",
      nl: "E-mailadres",
      fr: "Adresse Email",
      it: "Indirizzo Email",
      de: "E-Mail-Adresse",
      es: "Correo Electrónico",
      af: "E-posadres",
      sv: "E-postadress",
      pl: "Adres Email",
      ja: "メールアドレス",
      zh: "电子邮件地址",
      ru: "Адрес Электронной Почты",
      zu: "Ikheli Le-imeyili",
      sw: "Anwani ya Barua Pepe"
    },
    phone: {
      en: "Phone Number",
      'pt-PT': "Número de Telefone",
      'pt-BR': "Número de Telefone",
      pt: "Número de Telefone",
      nl: "Telefoonnummer",
      fr: "Numéro de Téléphone",
      it: "Numero di Telefono",
      de: "Telefonnummer",
      es: "Número de Teléfono",
      af: "Telefoonnommer",
      sv: "Telefonnummer",
      pl: "Numer Telefonu",
      ja: "電話番号",
      zh: "电话号码",
      ru: "Номер Телефона",
      zu: "Inombolo Yocingo",
      sw: "Nambari ya Simu"
    },
    operator: {
      en: "Preferred Operator",
      'pt-PT': "Operador Preferido",
      'pt-BR': "Operador Preferido",
      pt: "Operador Preferido",
      nl: "Voorkeur Operator",
      fr: "Opérateur Préféré",
      it: "Operatore Preferito",
      de: "Bevorzugter Anbieter",
      es: "Operador Preferido",
      af: "Voorkeur Operateur",
      sv: "Föredragen Operatör",
      pl: "Preferowany Operator",
      ja: "希望するオペレーター",
      zh: "首选运营商",
      ru: "Предпочитаемый Оператор",
      zu: "Umshini Okhethiwe",
      sw: "Mfanyabiashara Unaopendelewa"
    },
    dates: {
      en: "Preferred Dates",
      'pt-PT': "Datas Preferidas",
      'pt-BR': "Datas Preferidas",
      pt: "Datas Preferidas",
      nl: "Voorkeur Data",
      fr: "Dates Préférées",
      it: "Date Preferite",
      de: "Wunschtermine",
      es: "Fechas Preferidas",
      af: "Voorkeur Datums",
      sv: "Föredragna Datum",
      pl: "Preferowane Daty",
      ja: "希望日",
      zh: "首选日期",
      ru: "Предпочитаемые Даты",
      zu: "Izinsuku Ezikhethiwe",
      sw: "Tarehe Zinazopendwa"
    },
    guests: {
      en: "Number of Guests",
      'pt-PT': "Número de Pessoas",
      'pt-BR': "Número de Pessoas",
      pt: "Número de Pessoas",
      nl: "Aantal Gasten",
      fr: "Nombre de Personnes",
      it: "Numero di Ospiti",
      de: "Anzahl Gäste",
      es: "Número de Personas",
      af: "Aantal Gaste",
      sv: "Antal Gäster",
      pl: "Liczba Gości",
      ja: "人数",
      zh: "客人数量",
      ru: "Количество Гостей",
      zu: "Inombolo Yezivakashi",
      sw: "Idadi ya Wageni"
    },
    message: {
      en: "Your Message",
      'pt-PT': "Sua Mensagem",
      'pt-BR': "Sua Mensagem",
      pt: "Sua Mensagem",
      nl: "Uw Bericht",
      fr: "Votre Message",
      it: "Il Tuo Messaggio",
      de: "Ihre Nachricht",
      es: "Su Mensaje",
      af: "Jou Boodskap",
      sv: "Ditt Meddelande",
      pl: "Twoja Wiadomość",
      ja: "メッセージ",
      zh: "您的留言",
      ru: "Ваше Сообщение",
      zu: "Umlayezo Wakho",
      sw: "Ujumbe Wako"
    }
  };
  return (labels[field] && labels[field][lang]) || (labels[field] && labels[field][lang.split('-')[0]]) || labels[field].en;
}

function getPlaceholder(field, lang) {
  const placeholders = {
    dates: {
      en: "e.g., December 15-20, 2025",
      'en-GB': "e.g., 15-20 December 2025",
      'en-US': "e.g., December 15-20, 2025",
      'pt-PT': "ex., 15-20 de Dezembro de 2025",
      'pt-BR': "ex., 15-20 de Dezembro de 2025",
      pt: "ex., 15-20 de Dezembro de 2025",
      nl: "bijv., 15-20 december 2025",
      fr: "ex., 15-20 décembre 2025",
      it: "es., 15-20 dicembre 2025",
      de: "z.B., 15.-20. Dezember 2025",
      es: "ej., 15-20 de diciembre de 2025",
      af: "bv., 15-20 Desember 2025",
      sv: "t.ex., 15-20 december 2025",
      pl: "np., 15-20 grudnia 2025",
      ja: "例: 2025年12月15-20日",
      zh: "例如，2025年12月15-20日",
      ru: "напр., 15-20 декабря 2025",
      zu: "isib., Disemba 15-20, 2025",
      sw: "mfano, Desemba 15-20, 2025"
    },
    message: {
      en: "Tell us about your experience preferences, skill level, special requests...",
      'en-GB': "Tell us about your experience preferences, skill level, special requests...",
      'en-US': "Tell us about your experience preferences, skill level, special requests...",
      'pt-PT': "Conte-nos sobre suas preferências de experiência, nível de habilidade, pedidos especiais...",
      'pt-BR': "Conte-nos sobre suas preferências de experiência, nível de habilidade, pedidos especiais...",
      pt: "Conte-nos sobre suas preferências de experiência, nível de habilidade, pedidos especiais...",
      nl: "Vertel ons over uw ervaringsvoorkeuren, vaardigheidsniveau, speciale verzoeken...",
      fr: "Parlez-nous de vos préférences d'expérience, niveau de compétence, demandes spéciales...",
      it: "Raccontaci le tue preferenze di esperienza, livello di abilità, richieste speciali...",
      de: "Erzählen Sie uns von Ihren Erfahrungspräferenzen, Fähigkeitsniveau, besonderen Wünschen...",
      es: "Cuéntanos sobre tus preferencias de experiencia, nivel de habilidad, solicitudes especiales...",
      af: "Vertel ons van jou ervaringsvoorkeure, vaardigheidsvlak, spesiale versoeke...",
      sv: "Berätta om dina upplevelsesönskemål, färdighetsnivå, specialförfrågningar...",
      pl: "Powiedz nam o swoich preferencjach dotyczących doświadczenia, poziomie umiejętności, specjalnych życzeniach...",
      ja: "体験の好み、スキルレベル、特別なリクエストについてお知らせください...",
      zh: "告诉我们您的体验偏好、技能水平、特殊要求...",
      ru: "Расскажите нам о ваших предпочтениях, уровне навыков, особых пожеланиях...",
      zu: "Sitshele ngokuthandayo kwakho kokuzizwa, izinga lamakhono, izicelo ezikhethekile...",
      sw: "Tuambie kuhusu mapendeleo yako ya uzoefu, kiwango cha ujuzi, maombi maalum..."
    }
  };
  return (placeholders[field] && placeholders[field][lang]) || (placeholders[field] && placeholders[field][lang.split('-')[0]]) || (placeholders[field] && placeholders[field].en) || '';
}

function getSubmitText(lang) {
  const texts = {
    en: "Send Inquiry",
    'pt-PT': "Enviar Consulta",
    'pt-BR': "Enviar Consulta",
    pt: "Enviar Consulta",
    nl: "Verstuur Aanvraag",
    fr: "Envoyer la Demande",
    it: "Invia Richiesta",
    de: "Anfrage Senden",
    es: "Enviar Consulta",
    af: "Stuur Navraag",
    sv: "Skicka Förfrågan",
    pl: "Wyślij Zapytanie",
    ja: "お問い合わせを送信",
    zh: "发送询问",
    ru: "Отправить Запрос",
    zu: "Thumela Umbuzo",
    sw: "Tuma Hoja"
  };
  return texts[lang] || texts[lang.split('-')[0]] || texts.en;
}

function getSubmittingText(lang) {
  const texts = {
    en: "Sending...",
    'pt-PT': "Enviando...",
    'pt-BR': "Enviando...",
    pt: "Enviando...",
    nl: "Verzenden...",
    fr: "Envoi...",
    it: "Invio...",
    de: "Senden...",
    es: "Enviando...",
    af: "Stuur...",
    sv: "Skickar...",
    pl: "Wysyłanie...",
    ja: "送信中...",
    zh: "发送中...",
    ru: "Отправка...",
    zu: "Kuyathunyelwa...",
    sw: "Inatumwa..."
  };
  return texts[lang] || texts[lang.split('-')[0]] || texts.en;
}

function getSuccessMessage(lang) {
  const messages = {
    en: "Thank you! Your inquiry has been sent to the operator. They will contact you shortly.",
    'en-GB': "Thank you! Your inquiry has been sent to the operator. They will contact you shortly.",
    'en-US': "Thank you! Your inquiry has been sent to the operator. They will contact you shortly.",
    'pt-PT': "Obrigado! Sua consulta foi enviada ao operador. Eles entrarão em contato em breve.",
    'pt-BR': "Obrigado! Sua consulta foi enviada ao operador. Eles entrarão em contato em breve.",
    pt: "Obrigado! Sua consulta foi enviada ao operador. Eles entrarão em contato em breve.",
    nl: "Bedankt! Uw aanvraag is naar de operator verzonden. Zij nemen binnenkort contact met u op.",
    fr: "Merci! Votre demande a été envoyée à l'opérateur. Ils vous contacteront sous peu.",
    it: "Grazie! La tua richiesta è stata inviata all'operatore. Ti contatteranno a breve.",
    de: "Danke! Ihre Anfrage wurde an den Anbieter gesendet. Sie werden sich in Kürze bei Ihnen melden.",
    es: "¡Gracias! Su consulta ha sido enviada al operador. Se pondrán en contacto con usted pronto.",
    af: "Dankie! Jou navraag is na die operateur gestuur. Hulle sal jou binnekort kontak.",
    sv: "Tack! Din förfrågan har skickats till operatören. De kommer att kontakta dig snart.",
    pl: "Dziękujemy! Twoje zapytanie zostało wysłane do operatora. Wkrótce się z Tobą skontaktują.",
    ja: "ありがとうございます！お問い合わせがオペレーターに送信されました。まもなくご連絡いたします。",
    zh: "谢谢！您的询问已发送给运营商。他们将很快与您联系。",
    ru: "Спасибо! Ваш запрос был отправлен оператору. Они свяжутся с вами в ближайшее время.",
    zu: "Ngiyabonga! Umbuzo wakho usuthunyelwe kumshini. Bazoxhumana nawe maduze.",
    sw: "Asante! Hoja yako imetumwa kwa mfanyabiashara. Watawasiliana nawe hivi karibuni."
  };
  return messages[lang] || messages[lang.split('-')[0]] || messages.en;
}

function getErrorMessage(lang) {
  const messages = {
    en: "Sorry, something went wrong. Please try again or contact us directly.",
    'en-GB': "Sorry, something went wrong. Please try again or contact us directly.",
    'en-US': "Sorry, something went wrong. Please try again or contact us directly.",
    'pt-PT': "Desculpe, algo deu errado. Por favor, tente novamente ou entre em contato diretamente.",
    'pt-BR': "Desculpe, algo deu errado. Por favor, tente novamente ou entre em contato diretamente.",
    pt: "Desculpe, algo deu errado. Por favor, tente novamente ou entre em contato diretamente.",
    nl: "Sorry, er is iets misgegaan. Probeer het opnieuw of neem rechtstreeks contact met ons op.",
    fr: "Désolé, quelque chose s'est mal passé. Veuillez réessayer ou nous contacter directement.",
    it: "Spiacenti, qualcosa è andato storto. Riprova o contattaci direttamente.",
    de: "Entschuldigung, etwas ist schief gelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
    es: "Lo sentimos, algo salió mal. Por favor, inténtelo de nuevo o contáctenos directamente.",
    af: "Jammer, iets het verkeerd geloop. Probeer asseblief weer of kontak ons direk.",
    sv: "Tyvärr, något gick fel. Försök igen eller kontakta oss direkt.",
    pl: "Przepraszamy, coś poszło nie tak. Spróbuj ponownie lub skontaktuj się z nami bezpośrednio.",
    ja: "申し訳ございません。問題が発生しました。もう一度お試しいただくか、直接お問い合わせください。",
    zh: "抱歉，出现了问题。请重试或直接联系我们。",
    ru: "Извините, что-то пошло не так. Пожалуйста, попробуйте снова или свяжитесь с нами напрямую.",
    zu: "Uxolo, kukhona okungahambanga kahle. Sicela uzame futhi noma usithinte ngqo.",
    sw: "Samahani, kuna hitilafu. Tafadhali jaribu tena au wasiliana nasi moja kwa moja."
  };
  return messages[lang] || messages[lang.split('-')[0]] || messages.en;
}

function getRecaptchaNotice(lang) {
  const notices = {
    en: "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
    'en-GB': "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
    'en-US': "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
    'pt-PT': "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google.",
    'pt-BR': "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google.",
    pt: "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google.",
    nl: "Deze site wordt beschermd door reCAPTCHA en het Google Privacybeleid en de Servicevoorwaarden zijn van toepassing.",
    fr: "Ce site est protégé par reCAPTCHA et la Politique de confidentialité et les Conditions d'utilisation de Google s'appliquent.",
    it: "Questo sito è protetto da reCAPTCHA e si applicano l'Informativa sulla privacy e i Termini di servizio di Google.",
    de: "Diese Website ist durch reCAPTCHA geschützt und es gelten die Datenschutzbestimmungen und Nutzungsbedingungen von Google.",
    es: "Este sitio está protegido por reCAPTCHA y se aplican la Política de privacidad y los Términos de servicio de Google.",
    af: "Hierdie webwerf word beskerm deur reCAPTCHA en die Google Privaatheidsbeleid en Diensbepalings is van toepassing.",
    sv: "Denna webbplats skyddas av reCAPTCHA och Googles sekretesspolicy och användarvillkor gäller.",
    pl: "Ta strona jest chroniona przez reCAPTCHA i obowiązują Polityka prywatności i Warunki korzystania z usługi Google.",
    ja: "このサイトはreCAPTCHAによって保護されており、Googleのプライバシーポリシーと利用規約が適用されます。",
    zh: "此网站受reCAPTCHA保护，适用Google隐私政策和服务条款。",
    ru: "Этот сайт защищен reCAPTCHA, применяются Политика конфиденциальности и Условия использования Google.",
    zu: "Leli sayithi livikelwe yi-reCAPTCHA futhi kuyasetshenziswa Inqubomgomo Yobumfihlo ye-Google nemibandela Yesevisi.",
    sw: "Tovuti hii inalindwa na reCAPTCHA na Sera ya Faragha ya Google na Masharti ya Huduma yanatumika."
  };
  return notices[lang] || notices[lang.split('-')[0]] || notices.en;
}
