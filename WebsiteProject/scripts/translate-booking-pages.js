import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Translation data for all 15 languages
const translations = {
  benefits: {
    'EN-GB': {
      heading: 'Book Direct for Best Value',
      subtitle: 'Experience a Charming Green Oasis a short walk away from the beach.',
      cards: [
        { title: 'Best Rate Guaranteed', desc: 'Lowest prices when you book directly with us' },
        { title: 'Secure Payment', desc: 'Your payment information is always protected' },
        { title: 'Instant Confirmation', desc: 'Receive your booking confirmation immediately' },
        { title: 'Direct Support', desc: 'Personal assistance from our dedicated team' }
      ]
    },
    'DE': {
      heading: 'Buchen Sie direkt zum besten Preis',
      subtitle: 'Erleben Sie eine charmante grüne Oase nur wenige Gehminuten vom Strand entfernt.',
      cards: [
        { title: 'Bestpreisgarantie', desc: 'Niedrigste Preise bei direkter Buchung' },
        { title: 'Sichere Zahlung', desc: 'Ihre Zahlungsinformationen sind immer geschützt' },
        { title: 'Sofortige Bestätigung', desc: 'Erhalten Sie Ihre Buchungsbestätigung sofort' },
        { title: 'Direkter Support', desc: 'Persönliche Unterstützung von unserem Team' }
      ]
    },
    'ES': {
      heading: 'Reserve directamente para obtener el mejor precio',
      subtitle: 'Experimente un encantador oasis verde a pocos pasos de la playa.',
      cards: [
        { title: 'Mejor tarifa garantizada', desc: 'Precios más bajos al reservar directamente' },
        { title: 'Pago seguro', desc: 'Su información de pago siempre está protegida' },
        { title: 'Confirmación instantánea', desc: 'Reciba su confirmación de reserva inmediatamente' },
        { title: 'Soporte directo', desc: 'Asistencia personalizada de nuestro equipo dedicado' }
      ]
    },
    'FR': {
      heading: 'Réservez directement pour le meilleur prix',
      subtitle: 'Découvrez une charmante oasis de verdure à quelques pas de la plage.',
      cards: [
        { title: 'Meilleur tarif garanti', desc: 'Prix les plus bas en réservant directement' },
        { title: 'Paiement sécurisé', desc: 'Vos informations de paiement sont toujours protégées' },
        { title: 'Confirmation instantanée', desc: 'Recevez votre confirmation de réservation immédiatement' },
        { title: 'Assistance directe', desc: 'Assistance personnalisée de notre équipe' }
      ]
    },
    'IT': {
      heading: 'Prenota direttamente per il miglior prezzo',
      subtitle: 'Scopri un\'incantevole oasi verde a pochi passi dalla spiaggia.',
      cards: [
        { title: 'Miglior tariffa garantita', desc: 'Prezzi più bassi prenotando direttamente' },
        { title: 'Pagamento sicuro', desc: 'Le tue informazioni di pagamento sono sempre protette' },
        { title: 'Conferma istantanea', desc: 'Ricevi la conferma della prenotazione immediatamente' },
        { title: 'Supporto diretto', desc: 'Assistenza personale dal nostro team dedicato' }
      ]
    },
    'NL': {
      heading: 'Boek rechtstreeks voor de beste prijs',
      subtitle: 'Ervaar een charmante groene oase op korte loopafstand van het strand.',
      cards: [
        { title: 'Beste tarief gegarandeerd', desc: 'Laagste prijzen bij directe boeking' },
        { title: 'Veilige betaling', desc: 'Uw betaalinformatie is altijd beschermd' },
        { title: 'Directe bevestiging', desc: 'Ontvang uw boekingsbevestiging onmiddellijk' },
        { title: 'Directe ondersteuning', desc: 'Persoonlijke hulp van ons team' }
      ]
    },
    'PT': {
      heading: 'Reserve diretamente para obter o melhor preço',
      subtitle: 'Experimente um oásis verde encantador a poucos passos da praia.',
      cards: [
        { title: 'Melhor tarifa garantida', desc: 'Preços mais baixos ao reservar diretamente' },
        { title: 'Pagamento seguro', desc: 'Suas informações de pagamento estão sempre protegidas' },
        { title: 'Confirmação instantânea', desc: 'Receba sua confirmação de reserva imediatamente' },
        { title: 'Suporte direto', desc: 'Assistência pessoal de nossa equipe dedicada' }
      ]
    },
    'RU': {
      heading: 'Бронируйте напрямую по лучшей цене',
      subtitle: 'Испытайте очарование зеленого оазиса в нескольких шагах от пляжа.',
      cards: [
        { title: 'Гарантия лучшей цены', desc: 'Лучшие цены при прямом бронировании' },
        { title: 'Безопасная оплата', desc: 'Ваши платежные данные всегда защищены' },
        { title: 'Мгновенное подтверждение', desc: 'Получите подтверждение бронирования мгновенно' },
        { title: 'Прямая поддержка', desc: 'Персональная помощь от нашей команды' }
      ]
    },
    'ZH': {
      heading: '直接预订享最优价格',
      subtitle: '体验距离海滩仅几步之遥的迷人绿色绿洲。',
      cards: [
        { title: '保证最优惠价格', desc: '直接预订享最低价格' },
        { title: '安全支付', desc: '您的支付信息始终受到保护' },
        { title: '即时确认', desc: '立即收到预订确认' },
        { title: '直接支持', desc: '我们专业团队的个性化帮助' }
      ]
    },
    'SV': {
      heading: 'Boka direkt för bästa pris',
      subtitle: 'Upplev en charmig grön oas bara en kort promenad från stranden.',
      cards: [
        { title: 'Bästa pris garanterat', desc: 'Lägsta priser vid direktbokning' },
        { title: 'Säker betalning', desc: 'Din betalningsinformation är alltid skyddad' },
        { title: 'Omedelbar bekräftelse', desc: 'Få din bokningsbekräftelse omedelbart' },
        { title: 'Direkt support', desc: 'Personlig hjälp från vårt dedikerade team' }
      ]
    },
    'JA': {
      heading: '直接予約で最安値',
      subtitle: 'ビーチから徒歩圏内の魅力的な緑のオアシスを体験してください。',
      cards: [
        { title: 'ベストレート保証', desc: '直接予約で最安値' },
        { title: '安全な支払い', desc: 'お支払い情報は常に保護されています' },
        { title: '即時確認', desc: '予約確認を即座に受け取る' },
        { title: '直接サポート', desc: '専任チームによる個別サポート' }
      ]
    },
    'PL': {
      heading: 'Rezerwuj bezpośrednio dla najlepszej ceny',
      subtitle: 'Doświadcz uroczej zielonej oazy zaledwie kilka kroków od plaży.',
      cards: [
        { title: 'Gwarancja najlepszej ceny', desc: 'Najniższe ceny przy bezpośredniej rezerwacji' },
        { title: 'Bezpieczna płatność', desc: 'Twoje informacje płatnicze są zawsze chronione' },
        { title: 'Natychmiastowe potwierdzenie', desc: 'Otrzymaj potwierdzenie rezerwacji natychmiast' },
        { title: 'Bezpośrednie wsparcie', desc: 'Osobista pomoc od naszego zespołu' }
      ]
    },
    'AF': {
      heading: 'Bespreek direk vir die beste prys',
      subtitle: 'Ervaar \'n bekoorlike groen oase net \'n kort stap van die strand.',
      cards: [
        { title: 'Beste tarief gewaarborg', desc: 'Laagste pryse wanneer jy direk bespreek' },
        { title: 'Veilige betaling', desc: 'Jou betaalinligting is altyd beskerm' },
        { title: 'Onmiddellike bevestiging', desc: 'Ontvang jou besprekingsbevestiging onmiddellik' },
        { title: 'Direkte ondersteuning', desc: 'Persoonlike hulp van ons toegewyde span' }
      ]
    },
    'ZU': {
      heading: 'Bhuka ngqo ukuthola inani elingcono',
      subtitle: 'Zizwa i-oasis eluhlaza elimnandi eduze nebhishi.',
      cards: [
        { title: 'Inani elingcono kakhulu liqinisekisiwe', desc: 'Amanani aphansi uma ubhuka ngqo' },
        { title: 'Inkokhelo ephephile', desc: 'Imininingwane yakho yokukhokha ihlale ivikelwe' },
        { title: 'Isiqinisekiso esisheshayo', desc: 'Thola isiqinisekiso sakho sokubhuka ngokushesha' },
        { title: 'Usekelo oluqondile', desc: 'Usizo lomuntu siqu lwethimba lethu' }
      ]
    },
    'SW': {
      heading: 'Fanya booking moja kwa moja kwa bei bora',
      subtitle: 'Furahia bustani nzuri ya kijani karibu na pwani.',
      cards: [
        { title: 'Bei bora inayohakikishwa', desc: 'Bei nafuu zaidi wakati wa kufanya booking moja kwa moja' },
        { title: 'Malipo salama', desc: 'Taarifa zako za malipo zinalindwa kila wakati' },
        { title: 'Uthibitisho wa mara moja', desc: 'Pata uthibitisho wa booking yako mara moja' },
        { title: 'Msaada wa moja kwa moja', desc: 'Msaada wa kibinafsi kutoka kwa timu yetu' }
      ]
    }
  }
};

// Process all booking page files
const bookDir = path.join(__dirname, '../public/book');
const files = fs.readdirSync(bookDir).filter(f => f.endsWith('.html'));

console.log(`Found ${files.length} booking pages to translate...`);

files.forEach(file => {
  const lang = file.replace('.html', '');
  const filePath = path.join(bookDir, file);
  const trans = translations.benefits[lang];
  
  if (!trans) {
    console.log(`⚠️  No translations for ${lang}, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace benefits section heading
  content = content.replace(
    /<h2>Book Direct for Best Value<\/h2>/,
    `<h2>${trans.heading}</h2>`
  );
  
  // Replace benefits subtitle
  content = content.replace(
    /<p class="subtitle">Experience a Charming Green Oasis a short walk away from the beach\.<\/p>/,
    `<p class="subtitle">${trans.subtitle}</p>`
  );
  
  // Replace benefit cards
  trans.cards.forEach((card, idx) => {
    const patterns = [
      { search: 'Best Rate Guaranteed', replace: card.title, desc: 'Lowest prices when you book directly with us', descReplace: card.desc },
      { search: 'Secure Payment', replace: card.title, desc: 'Your payment information is always protected', descReplace: card.desc },
      { search: 'Instant Confirmation', replace: card.title, desc: 'Receive your booking confirmation immediately', descReplace: card.desc },
      { search: 'Direct Support', replace: card.title, desc: 'Personal assistance from our dedicated team', descReplace: card.desc }
    ];
    
    if (patterns[idx]) {
      content = content.replace(
        new RegExp(`<h3>${patterns[idx].search}</h3>`),
        `<h3>${card.title}</h3>`
      );
      content = content.replace(
        new RegExp(`<p>${patterns[idx].desc}</p>`),
        `<p>${card.desc}</p>`
      );
    }
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Translated benefits section for ${lang}`);
});

console.log('\\n✅ Benefits section translation complete!');
