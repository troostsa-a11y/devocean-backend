/**
 * /legal/i18n/strings.js
 * UI labels: LEGAL_UI
 * Dictionaries: LEGAL_DICT[lang][pageKey]
 * Pages: privacy, cookies, terms, gdpr, cric
 * NOTE: Pure JS (no <script> wrapper). Keep this loaded BEFORE /legal/legal-i18n.js
 */

(function () {
  // -------- UI labels (top bar / timestamp) --------
  window.LEGAL_UI = {
    en:   { back: "Back to Home",           updated: "Last updated" },
    de:   { back: "Zur Startseite",         updated: "Zuletzt aktualisiert" },
    nl:   { back: "Terug naar Home",        updated: "Laatst bijgewerkt" },
    pt:   { back: "Voltar à Página Inicial",updated: "Última atualização" },
    ptmz: { back: "Voltar à Página Inicial",updated: "Última atualização" },
    fr:   { back: "Retour à l’accueil",     updated: "Dernière mise à jour" },
    it:   { back: "Torna alla Home",        updated: "Ultimo aggiornamento" },
    es:   { back: "Volver al inicio",       updated: "Última actualización" }
  };

  // Root dict
  window.LEGAL_DICT = {};

  // Helper: tiny factory to cut repetition
  function commonPrivacy(localeEmailNote){
    return {
      title: localeEmailNote.title,
      who:       { title: localeEmailNote.whoT,   body: localeEmailNote.whoB },
      collect:   { title: localeEmailNote.colT,   items: localeEmailNote.colI },
      use:       { title: localeEmailNote.useT,   items: localeEmailNote.useI },
      share:     { title: localeEmailNote.shaT,   items: localeEmailNote.shaI },
      retention: { title: localeEmailNote.retT,   body: localeEmailNote.retB },
      rights:    { title: localeEmailNote.rigT,   items: localeEmailNote.rigI },
      contact:   { title: localeEmailNote.conT,   body: localeEmailNote.conB } // may contain HTML
    };
  }
  function commonCookies(locale){
    return {
      title: locale.title,
      intro:  { title: locale.introT,  body: locale.introB },
      types:  { title: locale.typesT,  items: locale.typesI },
      manage: { title: locale.manaT,   body: locale.manaB },
      third:  { title: locale.thrdT,   body: locale.thrdB },
      contact:{ title: locale.contT,   body: locale.contB } // may contain HTML
    };
  }
  function commonTerms(locale){
    return {
      title: locale.title,
      intro:   { title: locale.introT,   body: locale.introB },
      booking: { title: locale.bookT,    items: locale.bookI },
      payment: { title: locale.payT,     items: locale.payI },
      cancel:  { title: locale.cancT,    body:  locale.cancB },
      conduct: { title: locale.condT,    items: locale.condI },
      liability:{title: locale.liabT,    body:  locale.liabB },
      changes: { title: locale.chngT,    body:  locale.chngB },
      law:     { title: locale.lawT,     body:  locale.lawB },
      contact: { title: locale.contT,    body:  locale.contB } // may contain HTML
    };
  }
  function commonGDPR(locale){
    return {
      title: locale.title,
      controller: { title: locale.ctrlT, body: locale.ctrlB },
      bases:      { title: locale.baseT, items: locale.baseI },
      rights:     { title: locale.rigT,  body:  locale.rigB },
      dpo:        { title: locale.dpoT,  body:  locale.dpoB }, // may contain HTML
      transfers:  { title: locale.tranT, body:  locale.tranB }
    };
  }
  function commonCRIC(locale){
    return {
      title: locale.title,
      intro:   { title: locale.introT, body: locale.introB },
      contact: { title: locale.contT,  body: locale.contB } // may contain HTML
    };
  }

  // -------- ENGLISH (base/fallback) --------
  window.LEGAL_DICT.en = {
    privacy: commonPrivacy({
      title:"Privacy Policy",
      whoT:"Who we are",
      whoB:"DEVOCEAN Lodge is a brand of TERRAfrique LDA. We operate eco-friendly accommodation in Ponta do Ouro, Mozambique.",
      colT:"What we collect",
      colI:[
        "Contact data: name, email, phone, country/region.",
        "Booking data: dates, party size, preferences, payment status.",
        "Communications you send us.",
        "Usage/device data (see Cookie Policy)."
      ],
      useT:"How we use your data",
      useI:[
        "Manage bookings and provide services.",
        "Communicate about your stay, policies and offers (opt-in).",
        "Improve our site and services (analytics, security).",
        "Comply with legal/financial obligations."
      ],
      shaT:"When we share data",
      shaI:[
        "Payment providers and booking platforms, as needed to fulfil your booking.",
        "Service providers under contract (IT/hosting/analytics).",
        "Authorities where required by law."
      ],
      retT:"Retention",
      retB:"We keep data only as long as necessary for the purposes above or as required by law.",
      rigT:"Your rights",
      rigI:[
        "Access, correction, deletion.",
        "Objection/restriction to processing.",
        "Data portability where applicable.",
        "Withdraw consent at any time."
      ],
      conT:"Contact",
      conB:'Questions? Email <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a> or write to TERRAfrique LDA, Ponta do Ouro, Mozambique.'
    }),

    cookies: commonCookies({
      title:"Cookie Policy",
      introT:"Overview",
      introB:"We use essential, functional, analytics and — with your consent — advertising cookies to operate our site and improve your experience.",
      typesT:"Types of cookies",
      typesI:[
        "Essential: required for core site functions.",
        "Functional: remember choices (e.g. language).",
        "Analytics: help us understand site usage (aggregated).",
        "Advertising: used for marketing (only if you consent)."
      ],
      manaT:"Managing cookies",
      manaB:"You can control cookies in your browser settings or via the banner. Blocking some cookies may affect site functionality.",
      thrdT:"Third-party cookies",
      thrdB:"Some pages may load content from third parties that set their own cookies. See their policies for details.",
      contT:"Contact",
      contB:'For questions about cookies, contact <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),

    terms: commonTerms({
      title:"Terms & Conditions",
      introT:"Scope",
      introB:"These Terms govern accommodation and related services provided by DEVOCEAN Lodge (TERRAfrique LDA). By booking, you agree to these Terms.",
      bookT:"Bookings",
      bookI:[
        "Provide accurate guest information and arrival/departure dates.",
        "Special requests are subject to availability and confirmation."
      ],
      payT:"Prices & Payment",
      payI:[
        "Rates shown are per unit/night unless stated otherwise.",
        "Deposits and settlement methods will be confirmed during booking."
      ],
      cancT:"Cancellations & No-shows",
      cancB:"Cancellation terms are disclosed at booking time and on your confirmation. No-show may forfeit deposit.",
      condT:"Guest conduct",
      condI:[
        "Respect property rules, staff, other guests and the local community.",
        "No unlawful activities on the premises."
      ],
      liabT:"Liability",
      liabB:"To the extent permitted by law, we are not liable for indirect or unforeseeable losses.",
      chngT:"Changes to these Terms",
      chngB:"We may update Terms from time to time. The posted version applies to your stay.",
      lawT:"Governing law",
      lawB:"Mozambican law applies, subject to mandatory local consumer rules.",
      contT:"Contact",
      contB:'Questions? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),

    gdpr: commonGDPR({
      title:"GDPR Notice",
      ctrlT:"Controller",
      ctrlB:"TERRAfrique LDA is the data controller for bookings made directly with us.",
      baseT:"Legal bases",
      baseI:[
        "Contract: to fulfil your booking.",
        "Legal obligation: invoicing, tax compliance.",
        "Legitimate interests: security, service improvement.",
        "Consent: marketing communications."
      ],
      rigT:"EU/EEA rights",
      rigB:"EU/EEA residents have rights of access, rectification, erasure, restriction, portability and objection.",
      dpoT:"Contact",
      dpoB:'For GDPR matters email <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"International transfers",
      tranB:"Where data is transferred outside the EEA, we use appropriate safeguards where required."
    }),

    cric: commonCRIC({
      title:"CRIC — Company & Contact",
      introT:"Overview",
      introB:"Summary of company and contact information, and where to request statutory details if required.",
      contT:"Contact",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };

  // -------- GERMAN --------
  window.LEGAL_DICT.de = {
    privacy: commonPrivacy({
      title:"Datenschutzerklärung",
      whoT:"Wer wir sind",
      whoB:"DEVOCEAN Lodge ist eine Marke von TERRAfrique LDA. Wir betreiben umweltfreundliche Unterkünfte in Ponta do Ouro, Mosambik.",
      colT:"Welche Daten wir erheben",
      colI:[
        "Kontaktdaten: Name, E-Mail, Telefon, Land/Region.",
        "Buchungsdaten: Daten, Gruppengröße, Präferenzen, Zahlungsstatus.",
        "Kommunikation, die Sie uns schicken.",
        "Nutzungs-/Gerätedaten (siehe Cookie-Richtlinie)."
      ],
      useT:"Wie wir Ihre Daten verwenden",
      useI:[
        "Verwaltung von Buchungen und Erbringung unserer Leistungen.",
        "Kommunikation zu Aufenthalt, Richtlinien und Angeboten (Opt-in).",
        "Verbesserung unserer Website und Dienste (Analyse, Sicherheit).",
        "Erfüllung gesetzlicher/finanzieller Pflichten."
      ],
      shaT:"Wann wir Daten teilen",
      shaI:[
        "Zahlungsdienstleister und Buchungsplattformen, soweit zur Erfüllung Ihrer Buchung notwendig.",
        "Auftragsverarbeiter (IT/Hosting/Analyse).",
        "Behörden, sofern gesetzlich vorgeschrieben."
      ],
      retT:"Aufbewahrung",
      retB:"Wir bewahren Daten nur so lange auf, wie es für die genannten Zwecke erforderlich ist oder gesetzlich vorgeschrieben.",
      rigT:"Ihre Rechte",
      rigI:[
        "Auskunft, Berichtigung, Löschung.",
        "Widerspruch/Einschränkung der Verarbeitung.",
        "Datenübertragbarkeit, soweit anwendbar.",
        "Widerruf einer Einwilligung jederzeit."
      ],
      conT:"Kontakt",
      conB:'Fragen? E-Mail an <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a> oder TERRAfrique LDA, Ponta do Ouro, Mosambik.'
    }),
    cookies: commonCookies({
      title:"Cookie-Richtlinie",
      introT:"Überblick",
      introB:"Wir verwenden essentielle, funktionale, Analyse- und — mit Ihrer Einwilligung — Werbe-Cookies, um unsere Website zu betreiben und zu verbessern.",
      typesT:"Arten von Cookies",
      typesI:[
        "Essentiell: erforderlich für grundlegende Funktionen.",
        "Funktional: merkt sich Ihre Auswahl (z. B. Sprache).",
        "Analyse: hilft uns, die Nutzung der Website zu verstehen (aggregiert).",
        "Werbung: für Marketing (nur mit Einwilligung)."
      ],
      manaT:"Cookies verwalten",
      manaB:"Sie können Cookies im Browser oder über die Banner-Einstellungen steuern. Das Blockieren bestimmter Cookies kann die Funktionalität beeinträchtigen.",
      thrdT:"Cookies von Drittanbietern",
      thrdB:"Einige Seiten laden Inhalte Dritter, die eigene Cookies setzen. Beachten Sie deren Richtlinien.",
      contT:"Kontakt",
      contB:'Fragen zu Cookies? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    terms: commonTerms({
      title:"Allgemeine Geschäftsbedingungen",
      introT:"Geltungsbereich",
      introB:"Diese Bedingungen regeln Unterkunft und damit verbundene Leistungen von DEVOCEAN Lodge (TERRAfrique LDA). Mit der Buchung stimmen Sie zu.",
      bookT:"Buchungen",
      bookI:[
        "Korrekte Gästedaten sowie An-/Abreisedaten angeben.",
        "Sonderwünsche vorbehaltlich Verfügbarkeit und Bestätigung."
      ],
      payT:"Preise & Zahlung",
      payI:[
        "Preise gelten pro Einheit/Nacht, sofern nicht anders angegeben.",
        "Anzahlungen und Zahlungsarten werden bei der Buchung bestätigt."
      ],
      cancT:"Stornierungen & Nichterscheinen",
      cancB:"Stornobedingungen werden bei der Buchung und in Ihrer Bestätigung mitgeteilt. Bei Nichterscheinen kann die Anzahlung verfallen.",
      condT:"Gästeverhalten",
      condI:[
        "Respektieren Sie Hausordnung, Personal, andere Gäste und die lokale Gemeinschaft.",
        "Keine unerlaubten Aktivitäten auf dem Gelände."
      ],
      liabT:"Haftung",
      liabB:"Soweit gesetzlich zulässig, haften wir nicht für indirekte oder unvorhersehbare Verluste.",
      chngT:"Änderungen",
      chngB:"Wir können diese Bedingungen aktualisieren. Es gilt die veröffentlichte Fassung.",
      lawT:"Anwendbares Recht",
      lawB:"Mosambikanisches Recht, unbeschadet zwingender lokaler Verbraucherschutzvorschriften.",
      contT:"Kontakt",
      contB:'Fragen? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    gdpr: commonGDPR({
      title:"DSGVO-Hinweis",
      ctrlT:"Verantwortlicher",
      ctrlB:"TERRAfrique LDA ist Verantwortlicher für direkt bei uns getätigte Buchungen.",
      baseT:"Rechtsgrundlagen",
      baseI:[
        "Vertrag: Erfüllung Ihrer Buchung.",
        "Rechtliche Pflicht: Rechnungsstellung, Steuerkonformität.",
        "Berechtigtes Interesse: Sicherheit, Serviceverbesserung.",
        "Einwilligung: Marketing-Kommunikation."
      ],
      rigT:"Rechte in der EU/EWR",
      rigB:"Einwohner der EU/EWR haben Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch.",
      dpoT:"Kontakt",
      dpoB:'Für DSGVO-Anliegen: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"Internationale Übermittlungen",
      tranB:"Bei Übermittlungen außerhalb des EWR setzen wir erforderlichenfalls geeignete Garantien ein."
    }),
    cric: commonCRIC({
      title:"CRIC — Unternehmen & Kontakt",
      introT:"Überblick",
      introB:"Zusammenfassung von Unternehmens- und Kontaktinformationen sowie Hinweise, wo gesetzliche Angaben angefordert werden können.",
      contT:"Kontakt",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };

  // -------- DUTCH --------
  window.LEGAL_DICT.nl = {
    privacy: commonPrivacy({
      title:"Privacybeleid",
      whoT:"Wie wij zijn",
      whoB:"DEVOCEAN Lodge is een merk van TERRAfrique LDA. We exploiteren eco-vriendelijke accommodatie in Ponta do Ouro, Mozambique.",
      colT:"Welke gegevens we verzamelen",
      colI:[
        "Contactgegevens: naam, e-mail, telefoon, land/regio.",
        "Boekingsgegevens: data, groepsgrootte, voorkeuren, betalingsstatus.",
        "Communicatie die je ons toestuurt.",
        "Gebruik-/apparaatgegevens (zie Cookiebeleid)."
      ],
      useT:"Hoe we je gegevens gebruiken",
      useI:[
        "Boekingen beheren en diensten leveren.",
        "Communicatie over verblijf, beleid en aanbiedingen (opt-in).",
        "Verbetering van site en diensten (analytics, beveiliging).",
        "Naleving van wettelijke/financiële verplichtingen."
      ],
      shaT:"Wanneer we gegevens delen",
      shaI:[
        "Betaalproviders en boekingsplatforms, voor het afhandelen van je boeking.",
        "Dienstverleners onder contract (IT/hosting/analytics).",
        "Autoriteiten waar wettelijk vereist."
      ],
      retT:"Bewaartermijn",
      retB:"We bewaren gegevens alleen zo lang als nodig of wettelijk vereist.",
      rigT:"Jouw rechten",
      rigI:[
        "Inzage, correctie, verwijdering.",
        "Bezwaar/beperking van verwerking.",
        "Overdraagbaarheid waar van toepassing.",
        "Intrekken van toestemming op elk moment."
      ],
      conT:"Contact",
      conB:'Vragen? Mail <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a> of schrijf naar TERRAfrique LDA, Ponta do Ouro, Mozambique.'
    }),
    cookies: commonCookies({
      title:"Cookiebeleid",
      introT:"Overzicht",
      introB:"We gebruiken essentiële, functionele, analytische en — met jouw toestemming — advertentiecookies.",
      typesT:"Soorten cookies",
      typesI:[
        "Essentieel: noodzakelijk voor kernfuncties.",
        "Functioneel: onthouden keuzes (bijv. taal).",
        "Analytisch: inzicht in gebruik (geaggregeerd).",
        "Advertenties: voor marketing (alleen met toestemming)."
      ],
      manaT:"Cookies beheren",
      manaB:"Beheer cookies via je browser of de banner. Blokkeren kan functionaliteit beïnvloeden.",
      thrdT:"Cookies van derden",
      thrdB:"Sommige pagina’s laden externe inhoud met eigen cookies. Zie hun beleid.",
      contT:"Contact",
      contB:'Vragen over cookies? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    terms: commonTerms({
      title:"Algemene Voorwaarden",
      introT:"Reikwijdte",
      introB:"Deze Voorwaarden gelden voor accommodatie en aanverwante diensten van DEVOCEAN Lodge (TERRAfrique LDA).",
      bookT:"Boekingen",
      bookI:[
        "Geef juiste gastinformatie en aankomst-/vertrekdata.",
        "Bijzondere wensen onder voorbehoud van beschikbaarheid en bevestiging."
      ],
      payT:"Prijzen & Betaling",
      payI:[
        "Tarieven per unit/nacht tenzij anders vermeld.",
        "Aanbetalingen en betaalmethoden worden bij boeking bevestigd."
      ],
      cancT:"Annuleringen & No-shows",
      cancB:"Voorwaarden staan bij de boeking en op je bevestiging. No-show kan aanbetaling kosten.",
      condT:"Gastgedrag",
      condI:[
        "Respecteer huisregels, personeel, andere gasten en de gemeenschap.",
        "Geen onrechtmatige activiteiten op het terrein."
      ],
      liabT:"Aansprakelijkheid",
      liabB:"Voor zover wettelijk toegestaan geen aansprakelijkheid voor indirecte of onvoorzienbare schade.",
      chngT:"Wijzigingen",
      chngB:"We kunnen deze Voorwaarden aanpassen. De gepubliceerde versie is van toepassing.",
      lawT:"Toepasselijk recht",
      lawB:"Mozambikaans recht, onverminderd dwingend consumentenrecht.",
      contT:"Contact",
      contB:'Vragen? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    gdpr: commonGDPR({
      title:"AVG-kennisgeving",
      ctrlT:"Verwerkingsverantwoordelijke",
      ctrlB:"TERRAfrique LDA is verwerkingsverantwoordelijke voor directe boekingen.",
      baseT:"Rechtsgronden",
      baseI:[
        "Overeenkomst: uitvoeren van je boeking.",
        "Wettelijke plicht: facturatie, belasting.",
        "Gerechtvaardigd belang: veiligheid, verbetering.",
        "Toestemming: marketingcommunicatie."
      ],
      rigT:"Rechten EU/EER",
      rigB:"Recht op inzage, rectificatie, wissing, beperking, overdraagbaarheid en bezwaar.",
      dpoT:"Contact",
      dpoB:'AVG-vragen: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"Doorgiften",
      tranB:"Bij doorgifte buiten de EER passen we waar vereist passende waarborgen toe."
    }),
    cric: commonCRIC({
      title:"CRIC — Bedrijf & Contact",
      introT:"Overzicht",
      introB:"Samenvatting van bedrijfs- en contactinformatie en waar je wettelijke gegevens kunt opvragen.",
      contT:"Contact",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };

  // -------- PORTUGUESE (generic) --------
  window.LEGAL_DICT.pt = {
    privacy: commonPrivacy({
      title:"Política de Privacidade",
      whoT:"Quem somos",
      whoB:"DEVOCEAN Lodge é uma marca da TERRAfrique LDA. Operamos hospedagem ecológica em Ponta do Ouro, Moçambique.",
      colT:"Quais dados coletamos",
      colI:[
        "Dados de contato: nome, e-mail, telefone, país/região.",
        "Dados de reserva: datas, tamanho do grupo, preferências, status de pagamento.",
        "Comunicações que você nos envia.",
        "Dados de uso/dispositivo (veja a Política de Cookies)."
      ],
      useT:"Como usamos seus dados",
      useI:[
        "Gerenciar reservas e prestar serviços.",
        "Comunicar sobre sua estadia, políticas e ofertas (opt-in).",
        "Aprimorar site e serviços (analytics, segurança).",
        "Cumprir obrigações legais/financeiras."
      ],
      shaT:"Quando compartilhamos dados",
      shaI:[
        "Provedores de pagamento e plataformas de reserva, conforme necessário.",
        "Fornecedores contratados (TI/hospedagem/analytics).",
        "Autoridades quando exigido por lei."
      ],
      retT:"Retenção",
      retB:"Mantemos os dados apenas pelo tempo necessário ou conforme exigido por lei.",
      rigT:"Seus direitos",
      rigI:[
        "Acesso, correção, exclusão.",
        "Oposição/restrição ao tratamento.",
        "Portabilidade de dados quando aplicável.",
        "Revogar o consentimento a qualquer momento."
      ],
      conT:"Contato",
      conB:'Dúvidas? E-mail para <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    cookies: commonCookies({
      title:"Política de Cookies",
      introT:"Visão geral",
      introB:"Usamos cookies essenciais, funcionais, de análise e — com seu consentimento — de publicidade.",
      typesT:"Tipos de cookies",
      typesI:[
        "Essenciais: necessários para funções básicas.",
        "Funcionais: lembram escolhas (ex.: idioma).",
        "Análise: ajudam a entender o uso do site (agregado).",
        "Publicidade: usadas para marketing (com consentimento)."
      ],
      manaT:"Gerenciar cookies",
      manaB:"Controle via navegador ou banner. Bloqueios podem afetar funcionalidades.",
      thrdT:"Cookies de terceiros",
      thrdB:"Algumas páginas carregam conteúdo de terceiros com seus próprios cookies.",
      contT:"Contato",
      contB:'Dúvidas sobre cookies? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    terms: commonTerms({
      title:"Termos e Condições",
      introT:"Âmbito",
      introB:"Estes Termos regem hospedagem e serviços correlatos oferecidos pela DEVOCEAN Lodge (TERRAfrique LDA).",
      bookT:"Reservas",
      bookI:[
        "Forneça informações corretas do hóspede e datas de chegada/saída.",
        "Pedidos especiais dependem de disponibilidade e confirmação."
      ],
      payT:"Preços e Pagamento",
      payI:[
        "Diárias por unidade/noite, salvo indicação em contrário.",
        "Depósitos e meios de pagamento são confirmados na reserva."
      ],
      cancT:"Cancelamentos & No-show",
      cancB:"Condições indicadas na reserva e na confirmação. No-show pode implicar perda do depósito.",
      condT:"Conduta do hóspede",
      condI:[
        "Respeite regras da casa, equipe, outros hóspedes e comunidade.",
        "Proibidas atividades ilícitas nas dependências."
      ],
      liabT:"Responsabilidade",
      liabB:"Na medida permitida por lei, não nos responsabilizamos por perdas indiretas ou imprevisíveis.",
      chngT:"Alterações",
      chngB:"Podemos atualizar estes Termos. A versão publicada aplica-se.",
      lawT:"Lei aplicável",
      lawB:"Direito moçambicano, observadas normas imperativas locais de consumo.",
      contT:"Contato",
      contB:'Dúvidas? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    gdpr: commonGDPR({
      title:"Aviso GDPR",
      ctrlT:"Controlador",
      ctrlB:"TERRAfrique LDA é a controladora para reservas diretas.",
      baseT:"Bases legais",
      baseI:[
        "Contrato: executar sua reserva.",
        "Obrigação legal: faturamento, tributos.",
        "Interesse legítimo: segurança, melhoria do serviço.",
        "Consentimento: comunicações de marketing."
      ],
      rigT:"Direitos na UE/EEE",
      rigB:"Titulares têm direitos de acesso, retificação, exclusão, limitação, portabilidade e objeção.",
      dpoT:"Contato",
      dpoB:'Assuntos GDPR: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"Transferências internacionais",
      tranB:"Quando houver transferência para fora do EEE, aplicamos salvaguardas adequadas quando exigido."
    }),
    cric: commonCRIC({
      title:"CRIC — Empresa & Contacto",
      introT:"Visão geral",
      introB:"Resumo de informações da empresa e contacto; solicite dados estatutários quando necessário.",
      contT:"Contacto",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };

  // -------- PORTUGUESE (Mozambique flavor) --------
  window.LEGAL_DICT.ptmz = JSON.parse(JSON.stringify(window.LEGAL_DICT.pt));
  // Light-touch overrides (wording closer to PT-MZ usage)
  window.LEGAL_DICT.ptmz.privacy.title = "Política de Privacidade";
  window.LEGAL_DICT.ptmz.cookies.title = "Política de Cookies";
  window.LEGAL_DICT.ptmz.gdpr.title    = "Aviso RGPD";
  window.LEGAL_DICT.ptmz.gdpr.dpo.body = 'Assuntos RGPD: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.';
  window.LEGAL_DICT.ptmz.cric = commonCRIC({
    title:"CRIC — Empresa & Contacto",
    introT:"Visão geral",
    introB:"Resumo de informação da empresa e contacto; solicite dados estatutários quando necessário.",
    contT:"Contacto",
    contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
  });

  // -------- FRENCH --------
  window.LEGAL_DICT.fr = {
    privacy: commonPrivacy({
      title:"Politique de confidentialité",
      whoT:"Qui nous sommes",
      whoB:"DEVOCEAN Lodge est une marque de TERRAfrique LDA. Nous exploitons un hébergement écoresponsable à Ponta do Ouro, Mozambique.",
      colT:"Données que nous collectons",
      colI:[
        "Données de contact : nom, e-mail, téléphone, pays/région.",
        "Données de réservation : dates, taille du groupe, préférences, statut de paiement.",
        "Communications que vous nous envoyez.",
        "Données d’utilisation/appareil (voir la Politique relative aux cookies)."
      ],
      useT:"Comment nous utilisons vos données",
      useI:[
        "Gérer les réservations et fournir les services.",
        "Communiquer au sujet de votre séjour, des politiques et des offres (opt-in).",
        "Améliorer notre site et nos services (analytique, sécurité).",
        "Respecter les obligations légales/financières."
      ],
      shaT:"Quand nous partageons des données",
      shaI:[
        "Prestataires de paiement et plateformes de réservation.",
        "Fournisseurs sous contrat (IT/hébergement/analyse).",
        "Autorités lorsque la loi l’exige."
      ],
      retT:"Durée de conservation",
      retB:"Nous conservons les données uniquement pendant la durée nécessaire aux finalités ci-dessus ou requise par la loi.",
      rigT:"Vos droits",
      rigI:[
        "Accès, rectification, suppression.",
        "Opposition/limitation du traitement.",
        "Portabilité des données lorsque applicable.",
        "Retirer votre consentement à tout moment."
      ],
      conT:"Contact",
      conB:'Questions ? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    cookies: commonCookies({
      title:"Politique relative aux cookies",
      introT:"Aperçu",
      introB:"Nous utilisons des cookies essentiels, fonctionnels, d’analyse et — avec votre consentement — publicitaires.",
      typesT:"Types de cookies",
      typesI:[
        "Essentiels : nécessaires aux fonctions de base.",
        "Fonctionnels : mémorisent vos choix (p. ex. langue).",
        "Analyse : compréhension de l’utilisation (agrégée).",
        "Publicitaires : marketing (avec consentement)."
      ],
      manaT:"Gestion des cookies",
      manaB:"Contrôlez les cookies via votre navigateur ou la bannière. Le blocage de certains cookies peut affecter les fonctionnalités.",
      thrdT:"Cookies tiers",
      thrdB:"Certaines pages chargent du contenu de tiers avec leurs propres cookies.",
      contT:"Contact",
      contB:'Questions sur les cookies ? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    terms: commonTerms({
      title:"Conditions générales",
      introT:"Champ d’application",
      introB:"Ces Conditions régissent l’hébergement et les services associés fournis par DEVOCEAN Lodge (TERRAfrique LDA).",
      bookT:"Réservations",
      bookI:[
        "Fournissez des informations exactes et vos dates d’arrivée/départ.",
        "Demandes particulières sous réserve de disponibilité et confirmation."
      ],
      payT:"Prix & Paiement",
      payI:[
        "Tarifs par unité/nuit sauf indication contraire.",
        "Arrhes et modalités de paiement confirmées lors de la réservation."
      ],
      cancT:"Annulations & Non-présentation",
      cancB:"Conditions précisées lors de la réservation et sur votre confirmation. No-show : acompte perdu.",
      condT:"Conduite des clients",
      condI:[
        "Respect du règlement, du personnel, des autres clients et de la communauté locale.",
        "Aucune activité illicite dans l’établissement."
      ],
      liabT:"Responsabilité",
      liabB:"Dans la mesure permise par la loi, nous déclinons toute responsabilité pour les pertes indirectes ou imprévisibles.",
      chngT:"Modifications",
      chngB:"Nous pouvons mettre à jour ces Conditions. La version publiée s’applique.",
      lawT:"Droit applicable",
      lawB:"Droit mozambicain, sous réserve des règles impératives locales de protection des consommateurs.",
      contT:"Contact",
      contB:'Questions ? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    gdpr: commonGDPR({
      title:"Notice RGPD",
      ctrlT:"Responsable du traitement",
      ctrlB:"TERRAfrique LDA est responsable du traitement pour les réservations directes.",
      baseT:"Bases juridiques",
      baseI:[
        "Contrat : exécuter votre réservation.",
        "Obligation légale : facturation, conformité fiscale.",
        "Intérêts légitimes : sécurité, amélioration du service.",
        "Consentement : communications marketing."
      ],
      rigT:"Droits dans l’UE/EEE",
      rigB:"Droits d’accès, rectification, effacement, limitation, portabilité et opposition.",
      dpoT:"Contact",
      dpoB:'Questions RGPD : <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"Transferts internationaux",
      tranB:"Pour les transferts hors EEE, des garanties appropriées sont appliquées lorsque requis."
    }),
    cric: commonCRIC({
      title:"CRIC — Entreprise & Contact",
      introT:"Aperçu",
      introB:"Résumé des informations d’entreprise et de contact ; où demander les informations statutaires si nécessaire.",
      contT:"Contact",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };

  // -------- ITALIAN --------
  window.LEGAL_DICT.it = {
    privacy: commonPrivacy({
      title:"Informativa sulla privacy",
      whoT:"Chi siamo",
      whoB:"DEVOCEAN Lodge è un marchio di TERRAfrique LDA. Offriamo alloggi eco-friendly a Ponta do Ouro, Mozambico.",
      colT:"Quali dati raccogliamo",
      colI:[
        "Dati di contatto: nome, e-mail, telefono, paese/regione.",
        "Dati di prenotazione: date, dimensione del gruppo, preferenze, stato del pagamento.",
        "Comunicazioni che ci invii.",
        "Dati di utilizzo/dispositivo (vedi Informativa sui cookie)."
      ],
      useT:"Come utilizziamo i tuoi dati",
      useI:[
        "Gestire le prenotazioni e fornire i servizi.",
        "Comunicare su soggiorno, politiche e offerte (opt-in).",
        "Migliorare sito e servizi (analisi, sicurezza).",
        "Assolvere obblighi legali/contabili."
      ],
      shaT:"Quando condividiamo i dati",
      shaI:[
        "Provider di pagamento e piattaforme di prenotazione.",
        "Fornitori sotto contratto (IT/hosting/analytics).",
        "Autorità quando richiesto dalla legge."
      ],
      retT:"Conservazione",
      retB:"Conserviamo i dati solo per il tempo necessario o richiesto dalla legge.",
      rigT:"I tuoi diritti",
      rigI:[
        "Accesso, rettifica, cancellazione.",
        "Opposizione/limitazione del trattamento.",
        "Portabilità dei dati dove applicabile.",
        "Revocare il consenso in qualsiasi momento."
      ],
      conT:"Contatti",
      conB:'Domande? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    cookies: commonCookies({
      title:"Informativa sui cookie",
      introT:"Panoramica",
      introB:"Cookie essenziali, funzionali, analitici e — con il tuo consenso — pubblicitari.",
      typesT:"Tipi di cookie",
      typesI:[
        "Essenziali: funzioni di base.",
        "Funzionali: ricordano le scelte (es. lingua).",
        "Analitici: comprendere l’uso (aggregato).",
        "Pubblicitari: marketing (con consenso)."
      ],
      manaT:"Gestione dei cookie",
      manaB:"Controllo via browser o banner. Il blocco può influire sulle funzionalità.",
      thrdT:"Cookie di terze parti",
      thrdB:"Alcune pagine caricano contenuti di terzi con propri cookie.",
      contT:"Contatti",
      contB:'Domande sui cookie? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    terms: commonTerms({
      title:"Termini e Condizioni",
      introT:"Ambito di applicazione",
      introB:"Termini che disciplinano alloggio e servizi forniti da DEVOCEAN Lodge (TERRAfrique LDA).",
      bookT:"Prenotazioni",
      bookI:[
        "Fornisci informazioni corrette e date di arrivo/partenza.",
        "Richieste speciali soggette a disponibilità e conferma."
      ],
      payT:"Prezzi e Pagamenti",
      payI:[
        "Tariffe per unità/notte salvo diversa indicazione.",
        "Acconti e modalità di pagamento confermati alla prenotazione."
      ],
      cancT:"Cancellazioni e No-show",
      cancB:"Condizioni indicate al momento della prenotazione e sulla conferma. Il no-show può comportare la perdita dell’acconto.",
      condT:"Comportamento degli ospiti",
      condI:[
        "Rispetto delle regole, del personale, degli altri ospiti e della comunità locale.",
        "Nessuna attività illecita nei locali."
      ],
      liabT:"Responsabilità",
      liabB:"Nei limiti di legge, esclusa la responsabilità per perdite indirette o imprevedibili.",
      chngT:"Modifiche",
      chngB:"Possiamo aggiornare i Termini. Si applica la versione pubblicata.",
      lawT:"Legge applicabile",
      lawB:"Si applica la legge mozambicana, fatte salve le norme imperative locali.",
      contT:"Contatti",
      contB:'Domande? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    gdpr: commonGDPR({
      title:"Informativa GDPR",
      ctrlT:"Titolare del trattamento",
      ctrlB:"TERRAfrique LDA è il titolare per le prenotazioni dirette.",
      baseT:"Basi giuridiche",
      baseI:[
        "Contratto: eseguire la prenotazione.",
        "Obbligo legale: fatturazione, conformità fiscale.",
        "Interesse legittimo: sicurezza, miglioramento del servizio.",
        "Consenso: comunicazioni di marketing."
      ],
      rigT:"Diritti UE/SEE",
      rigB:"Diritti di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione.",
      dpoT:"Contatti",
      dpoB:'Questioni GDPR: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"Trasferimenti internazionali",
      tranB:"Per trasferimenti fuori dallo SEE, applichiamo garanzie adeguate quando richiesto."
    }),
    cric: commonCRIC({
      title:"CRIC — Azienda & Contatti",
      introT:"Panoramica",
      introB:"Riepilogo di informazioni aziendali e contatti; richiedi i dati statutari se necessario.",
      contT:"Contatti",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };

  // -------- SPANISH --------
  window.LEGAL_DICT.es = {
    privacy: commonPrivacy({
      title:"Política de Privacidad",
      whoT:"Quiénes somos",
      whoB:"DEVOCEAN Lodge es una marca de TERRAfrique LDA. Ofrecemos alojamiento ecológico en Ponta do Ouro, Mozambique.",
      colT:"Qué datos recopilamos",
      colI:[
        "Datos de contacto: nombre, correo, teléfono, país/región.",
        "Datos de reserva: fechas, tamaño del grupo, preferencias, estado de pago.",
        "Comunicaciones que nos envías.",
        "Datos de uso/dispositivo (consulta la Política de Cookies)."
      ],
      useT:"Cómo usamos tus datos",
      useI:[
        "Gestionar reservas y prestar servicios.",
        "Comunicarnos sobre tu estancia, políticas y ofertas (con consentimiento).",
        "Mejorar el sitio y los servicios (analítica, seguridad).",
        "Cumplir obligaciones legales/financieras."
      ],
      shaT:"Cuándo compartimos datos",
      shaI:[
        "Proveedores de pago y plataformas de reservas, cuando sea necesario.",
        "Proveedores bajo contrato (TI/alojamiento/analítica).",
        "Autoridades cuando lo exige la ley."
      ],
      retT:"Conservación",
      retB:"Conservamos los datos solo el tiempo necesario o requerido por ley.",
      rigT:"Tus derechos",
      rigI:[
        "Acceso, rectificación, supresión.",
        "Oposición/restricción del tratamiento.",
        "Portabilidad de los datos cuando corresponda.",
        "Retirar el consentimiento en cualquier momento."
      ],
      conT:"Contacto",
      conB:'¿Preguntas? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    cookies: commonCookies({
      title:"Política de Cookies",
      introT:"Resumen",
      introB:"Usamos cookies esenciales, funcionales, analíticas y — con tu consentimiento — publicitarias.",
      typesT:"Tipos de cookies",
      typesI:[
        "Esenciales: necesarias para funciones básicas.",
        "Funcionales: recuerdan tus preferencias (p. ej., idioma).",
        "Analítica: comprender el uso del sitio (agregado).",
        "Publicidad: marketing (con consentimiento)."
      ],
      manaT:"Gestión de cookies",
      manaB:"Controla cookies en el navegador o mediante la banner. El bloqueo puede afectar funciones.",
      thrdT:"Cookies de terceros",
      thrdB:"Algunas páginas cargan contenido de terceros con sus propios cookies.",
      contT:"Contacto",
      contB:'Dudas sobre cookies: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    terms: commonTerms({
      title:"Términos y Condiciones",
      introT:"Alcance",
      introB:"Estos Términos rigen el alojamiento y servicios relacionados de DEVOCEAN Lodge (TERRAfrique LDA).",
      bookT:"Reservas",
      bookI:[
        "Proporciona información precisa y fechas de llegada/salida.",
        "Solicitudes especiales sujetas a disponibilidad y confirmación."
      ],
      payT:"Precios y Pago",
      payI:[
        "Tarifas por unidad/noche salvo indicación en contrario.",
        "Depósitos y métodos de pago confirmados durante la reserva."
      ],
      cancT:"Cancelaciones y No-show",
      cancB:"Condiciones comunicadas al reservar y en la confirmación. El no-show puede implicar pérdida del depósito.",
      condT:"Conducta del huésped",
      condI:[
        "Respeta normas de la propiedad, personal, otros huéspedes y comunidad local.",
        "Prohibidas actividades ilícitas en las instalaciones."
      ],
      liabT:"Responsabilidad",
      liabB:"En la medida permitida por la ley, no nos hacemos responsables de pérdidas indirectas o imprevisibles.",
      chngT:"Cambios",
      chngB:"Podemos actualizar estos Términos. Se aplica la versión publicada.",
      lawT:"Ley aplicable",
      lawB:"Se aplica la ley mozambiqueña, sin perjuicio de normas imperativas locales.",
      contT:"Contacto",
      contB:'¿Preguntas? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
    }),
    gdpr: commonGDPR({
      title:"Aviso RGPD",
      ctrlT:"Responsable del tratamiento",
      ctrlB:"TERRAfrique LDA es responsable del tratamiento para reservas directas.",
      baseT:"Bases legales",
      baseI:[
        "Contrato: cumplir tu reserva.",
        "Obligación legal: facturación, cumplimiento fiscal.",
        "Intereses legítimos: seguridad, mejora del servicio.",
        "Consentimiento: comunicaciones de marketing."
      ],
      rigT:"Derechos en la UE/EEE",
      rigB:"Derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición.",
      dpoT:"Contacto",
      dpoB:'Temas de RGPD: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.',
      tranT:"Transferencias internacionales",
      tranB:"Cuando haya transferencias fuera del EEE, aplicamos garantías adecuadas cuando sea necesario."
    }),
    cric: commonCRIC({
      title:"CRIC — Empresa y Contacto",
      introT:"Resumen",
      introB:"Resumen de la información de la empresa y contacto; dónde solicitar los datos estatutarios si es necesario.",
      contT:"Contacto",
      contB:'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
    })
  };
})();
