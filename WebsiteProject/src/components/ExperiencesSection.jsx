import { m } from 'framer-motion';
import { EXPERIENCE_OPERATORS } from '../data/content';
import LazyImage from './LazyImage';

export default function ExperiencesSection({ experiences, ui }) {
  return (
    <section id="experiences" className="bg-slate-50 border-y">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold">{ui.experiences.headline}</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">{ui.experiences.blurb}</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((c, idx) => (
            <m.div
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md"
            >
              <div className="h-40 overflow-hidden">
                <LazyImage src={c.img} alt={c.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
              </div>
            </m.div>
          ))}
        </div>

        <div className="mt-8 text-sm text-slate-700">
          <p className="font-medium">{ui.experiences.operators}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {EXPERIENCE_OPERATORS.map((p) => (
              <li key={p.href}>
                <a className="text-[#9e4b13] hover:underline" href={p.href} target="_blank" rel="noreferrer">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
