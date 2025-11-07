import { useState } from 'react';

export default function ExperienceInquiryForm({ experience, operators, lang, currency }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    operator: operators && operators.length > 0 ? operators[0].name : '',
    dates: '',
    guests: '2',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const token = await window.grecaptcha.execute(
        '6Lcw-YUqAAAAAP-HCx0R5D64bckRGiX8VL3NnQcb',
        { action: 'experience_inquiry' }
      );

      const response = await fetch('/api/experience-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience: experience.title,
          experienceKey: experience.key,
          lang: lang || 'en',
          currency: currency || 'EUR',
          recaptcha_token: token
        })
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
              {getFieldLabel('dates', lang)}
            </label>
            <input
              type="text"
              id="dates"
              name="dates"
              value={formData.dates}
              onChange={handleChange}
              placeholder={getPlaceholder('dates', lang)}
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
            {getFieldLabel('message', lang)} *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
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
  return titles[lang] || titles.en;
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
  return (labels[field] && labels[field][lang]) || labels[field].en;
}

function getPlaceholder(field, lang) {
  const placeholders = {
    dates: {
      en: "e.g., December 15-20, 2025",
      'pt-PT': "ex., 15-20 de Dezembro de 2025",
      'pt-BR': "ex., 15-20 de Dezembro de 2025",
      pt: "ex., 15-20 de Dezembro de 2025"
    },
    message: {
      en: "Tell us about your experience preferences, skill level, special requests...",
      'pt-PT': "Conte-nos sobre suas preferências de experiência, nível de habilidade, pedidos especiais...",
      'pt-BR': "Conte-nos sobre suas preferências de experiência, nível de habilidade, pedidos especiais...",
      pt: "Conte-nos sobre suas preferências de experiência, nível de habilidade, pedidos especiais..."
    }
  };
  return (placeholders[field] && placeholders[field][lang]) || (placeholders[field] && placeholders[field].en) || '';
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
  return texts[lang] || texts.en;
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
  return texts[lang] || texts.en;
}

function getSuccessMessage(lang) {
  const messages = {
    en: "Thank you! Your inquiry has been sent to the operator. They will contact you shortly.",
    'pt-PT': "Obrigado! Sua consulta foi enviada ao operador. Eles entrarão em contato em breve.",
    'pt-BR': "Obrigado! Sua consulta foi enviada ao operador. Eles entrarão em contato em breve.",
    pt: "Obrigado! Sua consulta foi enviada ao operador. Eles entrarão em contato em breve."
  };
  return messages[lang] || messages.en;
}

function getErrorMessage(lang) {
  const messages = {
    en: "Sorry, something went wrong. Please try again or contact us directly.",
    'pt-PT': "Desculpe, algo deu errado. Por favor, tente novamente ou entre em contato diretamente.",
    'pt-BR': "Desculpe, algo deu errado. Por favor, tente novamente ou entre em contato diretamente.",
    pt: "Desculpe, algo deu errado. Por favor, tente novamente ou entre em contato diretamente."
  };
  return messages[lang] || messages.en;
}

function getRecaptchaNotice(lang) {
  const notices = {
    en: "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
    'pt-PT': "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google.",
    'pt-BR': "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google.",
    pt: "Este site é protegido pelo reCAPTCHA e aplicam-se a Política de Privacidade e os Termos de Serviço do Google."
  };
  return notices[lang] || notices.en;
}
