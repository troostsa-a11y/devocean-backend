import LazyImage from './LazyImage';
import { Link } from 'wouter';

// Experience preview tags - helps users know what to expect
const EXP_TAGS = {
  diving: ['courses'],
  dolphins: ['earlyMorning', 'allLevels'],
  seafari: ['boat', 'snorkeling'],
  safari: ['game', 'halfOrFull'],
  fishing: ['charter', 'guided'],
  surfing: ['rental', 'lessons'],
  lighthouse: ['free', 'selfGuided']
};

// Tag labels with translations
const getTagLabel = (tag, lang) => {
  const labels = {
    courses: { en: 'Courses Available', pt: 'Cursos Disponíveis', nl: 'Cursussen Beschikbaar', fr: 'Cours disponibles', it: 'Corsi disponibili', de: 'Kurse verfügbar', es: 'Cursos disponibles', af: 'Kursusse Beskikbaar', sv: 'Kurser tillgängliga', pl: 'Kursy dostępne', ja: 'コースあり', zh: '课程可用', ru: 'Курсы доступны', zu: 'Izifundo ziyatholakala', sw: 'Kozi zinapatikana' },
    earlyMorning: { en: 'Early Morning', pt: 'Madrugada', nl: 'Vroege Ochtend', fr: 'Tôt le matin', it: 'Prima mattina', de: 'Früh morgens', es: 'Temprano', af: 'Vroeg Oggend', sv: 'Tidig morgon', pl: 'Wczesny ranek', ja: '早朝', zh: '清晨', ru: 'Раннее утро', zu: 'Ekuseni kakhulu', sw: 'Asubuhi mapema' },
    snorkeling: { en: 'Snorkeling', pt: 'Snorkeling', nl: 'Snorkelen', fr: 'Plongée libre', it: 'Snorkeling', de: 'Schnorcheln', es: 'Snorkel', af: 'Snorkel', sv: 'Snorkling', pl: 'Snorkeling', ja: 'シュノーケリング', zh: '浮潜', ru: 'Снорклинг', zu: 'Ukubhukuda', sw: 'Kuogelea' },
    game: { en: 'Game Drive', pt: 'Safari', nl: 'Gamedrive', fr: 'Safari', it: 'Safari', de: 'Pirschfahrt', es: 'Safari', af: 'Wildrit', sv: 'Safari', pl: 'Safari', ja: 'ゲームドライブ', zh: '野生动物观赏', ru: 'Сафари', zu: 'Ukuzingela', sw: 'Safari' },
    halfOrFull: { en: 'Half/Full Day', pt: 'Meio/Dia Inteiro', nl: 'Halve/Hele Dag', fr: 'Demi/Journée', it: 'Mezza/Intera giornata', de: 'Halb-/Ganztags', es: 'Medio/Día completo', af: 'Half/Voldag', sv: 'Halv/Heldag', pl: 'Pół/Cały dzień', ja: '半日/終日', zh: '半天/全天', ru: 'Полдня/День', zu: 'Usuku olungaphakathi/lonke', sw: 'Nusu/Siku nzima' },
    allLevels: { en: 'All Levels', pt: 'Todos Níveis', nl: 'Alle Niveaus', fr: 'Tous niveaux', it: 'Tutti i livelli', de: 'Alle Stufen', es: 'Todos niveles', af: 'Alle Vlakke', sv: 'Alla nivåer', pl: 'Wszystkie poziomy', ja: '全レベル', zh: '所有级别', ru: 'Все уровни', zu: 'Wonke amazinga', sw: 'Viwango vyote' },
    boat: { en: 'Boat Trip', pt: 'Passeio Barco', nl: 'Boottocht', fr: 'Sortie bateau', it: 'Gita in barca', de: 'Bootstour', es: 'Paseo barco', af: 'Bootrit', sv: 'Båttur', pl: 'Rejs', ja: 'ボート', zh: '游船', ru: 'На лодке', zu: 'Uhambo ngesikebhe', sw: 'Safari ya mashua' },
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
