import LazyImage from './LazyImage';
import { Link } from 'wouter';

// Experience preview tags - helps users know what to expect
const EXP_TAGS = {
  diving: ['halfDay', 'certified'],
  dolphins: ['morning', 'allLevels'],
  seafari: ['boat', 'seasonal'],
  safari: ['fullDay', 'transfer'],
  fishing: ['charter', 'guided'],
  surfing: ['rental', 'lessons'],
  lighthouse: ['free', 'selfGuided']
};

// Tag labels with translations
const getTagLabel = (tag, lang) => {
  const labels = {
    halfDay: { en: 'Half Day', pt: 'Meio Dia', nl: 'Halve Dag', fr: 'Demi-journée', it: 'Mezza giornata', de: 'Halbtags', es: 'Medio día', af: 'Halfdag', sv: 'Halvdag', pl: 'Pół dnia', ja: '半日', zh: '半天', ru: 'Полдня', zu: 'Usuku olungaphakathi', sw: 'Nusu siku' },
    fullDay: { en: 'Full Day', pt: 'Dia Inteiro', nl: 'Hele Dag', fr: 'Journée entière', it: 'Giornata intera', de: 'Ganztags', es: 'Día completo', af: 'Voldag', sv: 'Heldag', pl: 'Cały dzień', ja: '終日', zh: '全天', ru: 'Целый день', zu: 'Usuku lonke', sw: 'Siku nzima' },
    morning: { en: 'Morning', pt: 'Manhã', nl: 'Ochtend', fr: 'Matin', it: 'Mattina', de: 'Morgens', es: 'Mañana', af: 'Oggend', sv: 'Förmiddag', pl: 'Rano', ja: '午前', zh: '上午', ru: 'Утро', zu: 'Ekuseni', sw: 'Asubuhi' },
    certified: { en: 'Cert. Required', pt: 'Certificado', nl: 'Certificaat', fr: 'Certifié', it: 'Certificato', de: 'Zertifiziert', es: 'Certificado', af: 'Gesertifiseer', sv: 'Certifikat', pl: 'Certyfikat', ja: '要資格', zh: '需认证', ru: 'Сертификат', zu: 'Isitifiketi', sw: 'Cheti' },
    allLevels: { en: 'All Levels', pt: 'Todos Níveis', nl: 'Alle Niveaus', fr: 'Tous niveaux', it: 'Tutti i livelli', de: 'Alle Stufen', es: 'Todos niveles', af: 'Alle Vlakke', sv: 'Alla nivåer', pl: 'Wszystkie poziomy', ja: '全レベル', zh: '所有级别', ru: 'Все уровни', zu: 'Wonke amazinga', sw: 'Viwango vyote' },
    boat: { en: 'Boat Trip', pt: 'Passeio Barco', nl: 'Boottocht', fr: 'Sortie bateau', it: 'Gita in barca', de: 'Bootstour', es: 'Paseo barco', af: 'Bootrit', sv: 'Båttur', pl: 'Rejs', ja: 'ボート', zh: '游船', ru: 'На лодке', zu: 'Uhambo ngesikebhe', sw: 'Safari ya mashua' },
    seasonal: { en: 'Seasonal', pt: 'Sazonal', nl: 'Seizoens', fr: 'Saisonnier', it: 'Stagionale', de: 'Saisonal', es: 'Estacional', af: 'Seisoenaal', sv: 'Säsong', pl: 'Sezonowy', ja: '季節限定', zh: '季节性', ru: 'Сезонно', zu: 'Ngezinkathi', sw: 'Msimu' },
    transfer: { en: 'Transfer Inc.', pt: 'Transfer Incl.', nl: 'Transfer Incl.', fr: 'Transfert incl.', it: 'Transfer incl.', de: 'Transfer inkl.', es: 'Transfer incl.', af: 'Oordrag Ingesluit', sv: 'Transfer inkl.', pl: 'Transfer wlicz.', ja: '送迎込', zh: '含接送', ru: 'Трансфер вкл.', zu: 'Ukudlulisa kufakiwe', sw: 'Usafiri' },
    charter: { en: 'Charter', pt: 'Charter', nl: 'Charter', fr: 'Charter', it: 'Charter', de: 'Charter', es: 'Charter', af: 'Charter', sv: 'Charter', pl: 'Czarter', ja: 'チャーター', zh: '包船', ru: 'Чартер', zu: 'Charter', sw: 'Charter' },
    guided: { en: 'Guided', pt: 'Guiado', nl: 'Begeleid', fr: 'Guidé', it: 'Guidato', de: 'Geführt', es: 'Guiado', af: 'Geleide', sv: 'Guidad', pl: 'Z przewodnikiem', ja: 'ガイド付', zh: '向导', ru: 'С гидом', zu: 'Noholo', sw: 'Mwongozo' },
    rental: { en: 'Rental', pt: 'Aluguel', nl: 'Verhuur', fr: 'Location', it: 'Noleggio', de: 'Verleih', es: 'Alquiler', af: 'Huur', sv: 'Uthyrning', pl: 'Wynajem', ja: 'レンタル', zh: '租赁', ru: 'Прокат', zu: 'Ukuqashwa', sw: 'Kukodisha' },
    lessons: { en: 'Lessons', pt: 'Aulas', nl: 'Lessen', fr: 'Cours', it: 'Lezioni', de: 'Unterricht', es: 'Clases', af: 'Lesse', sv: 'Lektioner', pl: 'Lekcje', ja: 'レッスン', zh: '课程', ru: 'Уроки', zu: 'Izifundo', sw: 'Masomo' },
    free: { en: 'Free', pt: 'Grátis', nl: 'Gratis', fr: 'Gratuit', it: 'Gratis', de: 'Kostenlos', es: 'Gratis', af: 'Gratis', sv: 'Gratis', pl: 'Bezpłatne', ja: '無料', zh: '免费', ru: 'Бесплатно', zu: 'Mahhala', sw: 'Bure' },
    selfGuided: { en: 'Self-guided', pt: 'Autoguiado', nl: 'Zelf begeleid', fr: 'Autonome', it: 'Autonomo', de: 'Selbstgeführt', es: 'Autoguiado', af: 'Selfgeleide', sv: 'Självguidad', pl: 'Samodzielne', ja: 'セルフ', zh: '自助', ru: 'Самостоятельно', zu: 'Ziziqondisile', sw: 'Mwongozi binafsi' }
  };
  const baseLang = lang?.split('-')[0] || 'en';
  return labels[tag]?.[lang] || labels[tag]?.[baseLang] || labels[tag]?.en || tag;
};

export default function ExperiencesSection({ experiences, ui, lang }) {
  return (
    <section id="experiences" className="bg-slate-50 border-y">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold">{ui.experiences.headline}</h2>
        <p className="mt-2 text-slate-600 max-w-2xl">{ui.experiences.blurb}</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((c, idx) => {
            // Experiences with detail pages (all except lighthouse)
            const hasDetailPage = ['dolphins', 'diving', 'seafari', 'safari', 'fishing', 'surfing'].includes(c.key);
            const CardWrapper = hasDetailPage ? Link : 'a';
            const cardProps = hasDetailPage 
              ? { href: `/experiences/${c.key}` }
              : { href: c.url, target: "_blank", rel: "noopener noreferrer" };
            const tags = EXP_TAGS[c.key] || [];
            
            return (
              <CardWrapper
                key={c.key}
                {...cardProps}
                className="block rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`link-experience-${c.key}`}
              >
                <div className="h-40 overflow-hidden relative">
                  <LazyImage 
                    src={c.img} 
                    alt={c.title} 
                    className="w-full h-full object-cover"
                    width={400}
                    height={267}
                    aspectRatio="3/2"
                  />
                  {/* Preview tags overlay */}
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {tags.map((t) => (
                      <span 
                        key={t}
                        className="px-2 py-0.5 text-xs font-medium bg-white/90 text-slate-700 rounded-full shadow-sm backdrop-blur-sm"
                      >
                        {getTagLabel(t, lang)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
