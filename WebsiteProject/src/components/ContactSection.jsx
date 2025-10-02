import { useState, useRef } from 'react';
import { Phone, Mail, MapPin, CalendarCheck2, Facebook, Instagram, Bird, Briefcase, Pin, Music, PlayCircle } from 'lucide-react';
import { toDDMMYYYY } from '../utils/localize';
import { EMAIL, PHONE, MAP } from '../data/content';
import { SOCIAL_LINKS } from '../data/content';

const socialIcons = {
  "Facebook": Facebook,
  "Instagram": Instagram,
  "X (Twitter)": Bird,
  "LinkedIn": Briefcase,
  "Pinterest": Pin,
  "TikTok": Music,
  "YouTube": PlayCircle,
  "Google Maps": MapPin,
};

export default function ContactSection({ ui, lang, currency, bookUrl, dateLocale }) {
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [unit, setUnit] = useState("");
  const [formState, setFormState] = useState({ status: 'idle', message: '' }); // idle, sending, success, error
  const inRef = useRef(null);
  const outRef = useRef(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${MAP.lat},${MAP.lng}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState({ status: 'sending', message: '' });

    const formData = new FormData(e.target);
    
    try {
      // Execute reCAPTCHA v3 with ready() wrapper
      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA not loaded');
      }

      const recaptchaToken = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(
              import.meta.env.VITE_RECAPTCHA_SITE_KEY || window.RECAPTCHA_SITE_KEY, 
              { action: 'contact_form' }
            );
            resolve(token);
          } catch (error) {
            reject(error);
          }
        });
      });

      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        checkin_iso: formData.get('checkin_iso'),
        checkout_iso: formData.get('checkout_iso'),
        currency: formData.get('currency'),
        lang: formData.get('lang'),
        recaptcha_token: recaptchaToken,
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormState({ status: 'success', message: ui.form.success || 'Message sent successfully!' });
        e.target.reset();
        setCheckin("");
        setCheckout("");
        setUnit("");
      } else {
        const error = await response.json();
        setFormState({ status: 'error', message: error.error || 'Failed to send message' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormState({ status: 'error', message: 'Network error. Please try again.' });
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-8 items-start justify-items-center md:justify-items-stretch">
        {/* Left: text & CTAs */}
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold">{ui.contact.headline}</h2>
          <p className="mt-2 text-slate-600 max-w-xl">{ui.contact.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border">
              <Phone size={18} /> {ui.contact.call}
            </a>
            <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border">
              <Mail size={18} /> {ui.contact.email}
            </a>
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border">
              <MapPin size={18} /> {ui.contact.directions}
            </a>
          </div>

          <a
            href={bookUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-cta mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#9e4b13] text-white shadow hover:shadow-md"
            aria-label={ui.contact.bookNow}
          >
            <CalendarCheck2 size={18} />
            {ui.contact.bookNow}
          </a>

          {/* Socials */}
          <div className="mt-6 flex flex-wrap gap-2 md:gap-3 max-w-full">
            {SOCIAL_LINKS.map((S) => {
              const Icon = socialIcons[S.name] || MapPin;
              return (
                <a
                  key={S.name}
                  href={S.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 md:w-9 md:h-9 inline-flex items-center justify-center rounded-full border hover:bg-slate-50 shrink-0"
                  aria-label={S.name}
                  title={S.name}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Right: form */}
        <div className="contact-form justify-self-start w-[92vw] max-w-[22rem] sm:w-full sm:max-w-lg md:w-full md:max-w-none mx-auto md:ml-auto rounded-2xl border shadow p-4 sm:p-6 bg-white overflow-hidden">
          <form onSubmit={handleSubmit} className="grid gap-4" autoComplete="on">
            <input type="hidden" name="lang" value={lang} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
            <input type="hidden" name="checkin_iso" value={checkin || ""} />
            <input type="hidden" name="checkout_iso" value={checkout || ""} />
            <input type="hidden" name="unit" value={unit} />
            <input type="hidden" name="currency" value={currency} />

            <div>
              <label htmlFor="name" className="text-sm text-slate-600">{ui.form.name}</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                placeholder={ui.form.phName}
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm text-slate-600">{ui.form.email}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                placeholder={ui.form.phEmail}
              />
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">{ui.form.stayLabel}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative min-w-0">
                  <label htmlFor="checkin_visible" className="text-xs sm:text-sm text-slate-600">{ui.form.checkin}</label>
                  <input
                    id="checkin_visible"
                    type="text"
                    readOnly
                    value={checkin ? toDDMMYYYY(checkin) : ""}
                    onClick={() => {
                      if (inRef.current?.showPicker) inRef.current.showPicker();
                      else inRef.current?.focus();
                    }}
                    placeholder="dd/mm/yyyy"
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  />
                  <input
                    ref={inRef}
                    type="date"
                    lang={dateLocale}
                    value={checkin}
                    onChange={(e) => setCheckin(e.target.value)}
                    min={todayISO}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>

                <div className="relative min-w-0">
                  <label htmlFor="checkout_visible" className="text-xs sm:text-sm text-slate-600">{ui.form.checkout}</label>
                  <input
                    id="checkout_visible"
                    type="text"
                    readOnly
                    value={checkout ? toDDMMYYYY(checkout) : ""}
                    onClick={() => {
                      if (outRef.current?.showPicker) outRef.current.showPicker();
                      else outRef.current?.focus();
                    }}
                    placeholder="dd/mm/yyyy"
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                  />
                  <input
                    ref={outRef}
                    type="date"
                    lang={dateLocale}
                    value={checkout}
                    onChange={(e) => setCheckout(e.target.value)}
                    min={checkin || todayISO}
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="unit" className="text-sm text-slate-600">{ui.form.unitLabel}</label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
              >
                <option value="">-</option>
                {ui.form.units.map((unitOption, index) => (
                  <option key={index} value={unitOption}>{unitOption}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="text-sm text-slate-600">{ui.form.message}</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9e4b13]"
                placeholder={ui.form.phMsg}
              />
            </div>

            <button 
              type="submit" 
              disabled={formState.status === 'sending'}
              className="btn-cta px-4 py-2 rounded-2xl bg-[#9e4b13] text-white hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState.status === 'sending' ? 'Sending...' : ui.form.send}
            </button>

            {formState.status === 'success' && (
              <p className="text-sm text-green-600 font-medium">{formState.message}</p>
            )}
            {formState.status === 'error' && (
              <p className="text-sm text-red-600 font-medium">{formState.message}</p>
            )}

            <p className="text-xs text-slate-500">{ui.form.consent}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
