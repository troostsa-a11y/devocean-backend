import { m } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import LazyImage from './LazyImage';

export default function AccommodationsSection({ units, ui, bookUrl, lang, currency }) {
  return (
    <section id="stay" className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">{ui.stay.headline}</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">{ui.stay.blurb}</p>
        </div>
        <a
          href={bookUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-cta hidden md:inline-block px-4 py-2 rounded-xl bg-[#9e4b13] text-white shadow hover:shadow-md"
          aria-label={ui.contact.bookNow}
          onClick={() => {
            if (window.dataLayer) {
              window.dataLayer.push({
                event: 'reservation_complete',
                button_location: 'accommodations_section',
                language: lang,
                currency: currency
              });
            }
          }}
        >
          {ui.contact.bookNow}
        </a>
      </div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {units.map((u, idx) => (
          <m.div
            key={u.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md bg-white"
          >
            <div className="h-44 overflow-hidden">
              <LazyImage src={u.img} alt={u.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{u.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{u.short}</p>
              <details className="mt-3 group">
                <summary className="list-none flex items-center gap-1 text-sm text-[#9e4b13] cursor-pointer">
                  <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                  <span>{ui.stay.moreDetails}</span>
                </summary>
                <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc list-inside">
                  {u.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </details>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
