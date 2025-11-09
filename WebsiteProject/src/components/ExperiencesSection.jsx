import { EXPERIENCE_OPERATORS } from '../data/content';
import LazyImage from './LazyImage';
import { Link } from 'wouter';

export default function ExperiencesSection({ experiences, ui }) {
  return (
    <section id="experiences" className="bg-slate-50 border-y">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold">{ui.experiences.headline}</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">{ui.experiences.blurb}</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((c, idx) => {
            const isInternalPage = c.key === 'dolphins';
            const CardWrapper = isInternalPage ? Link : 'a';
            const cardProps = isInternalPage 
              ? { href: `/experiences/${c.key}` }
              : { href: c.url, target: "_blank", rel: "noopener noreferrer" };
            
            return (
              <CardWrapper
                key={c.key}
                {...cardProps}
                className="block rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`link-experience-${c.key}`}
              >
                <div className="h-40 overflow-hidden">
                  <LazyImage 
                    src={c.img} 
                    alt={c.title} 
                    className="w-full h-full object-cover"
                    width={400}
                    height={267}
                    aspectRatio="3/2"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
                </div>
              </CardWrapper>
            );
          })}
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
