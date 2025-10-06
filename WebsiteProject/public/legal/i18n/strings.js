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
    fr:   { back: "Retour à l'accueil",     updated: "Dernière mise à jour" },
    it:   { back: "Torna alla Home",        updated: "Ultimo aggiornamento" },
    es:   { back: "Volver al inicio",       updated: "Última actualización" }
  };

  // Root dict
  window.LEGAL_DICT = {};

  // -------- ENGLISH (base/fallback) --------
  window.LEGAL_DICT.en = {
    privacy: {
      title: "Privacy Policy",
      updatedDate: "06 Oct 2025",
      privacyBadge: {
        title: "Your Privacy Matters:",
        body: "We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information."
      },
      quickLinks: {
        title: "Quick Links",
        links: [
          { id: "who", text: "Who We Are" },
          { id: "collect", text: "Data Collection" },
          { id: "use", text: "Data Usage" },
          { id: "share", text: "Data Sharing" },
          { id: "security", text: "Security" },
          { id: "retention", text: "Retention" },
          { id: "rights", text: "Your Rights" },
          { id: "transfers", text: "International Transfers" },
          { id: "contact", text: "Contact" },
          { id: "updates", text: "Policy Updates" }
        ]
      },
      sections: {
        who: {
          title: "Who we are",
          body: "DEVOCEAN Lodge is operated by TERRAfrique LDA, a company registered in Mozambique. Our registered address is Rua C, Parcela 12, Maputo 1118, Mozambique. We operate eco-friendly beach accommodation in Ponta do Ouro, Mozambique. We are committed to protecting your privacy and ensuring that your personal data is collected, processed, and used properly, lawfully, and transparently in accordance with applicable data protection laws. By accessing or using our website and services, you consent to the collection and use of your information as described in this Privacy Policy."
        },
        collect: {
          title: "What personal data we collect",
          intro: "We collect different types of information to provide and improve our services:",
          categories: [
            {
              title: "Personal Information",
              items: [
                "Name, contact details",
                "Passport/ID information",
                "Payment information",
                "Booking preferences"
              ]
            },
            {
              title: "Technical Data",
              items: [
                "IP address, device information",
                "Browser type and version",
                "Website usage analytics",
                "Cookie data (with consent)"
              ]
            },
            {
              title: "Communication Data",
              items: [
                "Email correspondence",
                "Customer service requests",
                "Feedback and reviews",
                "Marketing preferences"
              ]
            }
          ]
        },
        use: {
          title: "How we use your data",
          items: [
            "Manage bookings and provide services",
            "Communicate about your stay, policies and offers (opt-in)",
            "Improve our site and services (analytics, security)",
            "Comply with legal/financial obligations"
          ]
        },
        share: {
          title: "When we share data",
          items: [
            "Payment providers and booking platforms to process your reservations and payments",
            "Analytics services to understand website usage and improve our services",
            "Advertising services for targeted marketing (only with your consent)",
            "IT service providers, hosting providers, and technical support vendors under strict confidentiality agreements",
            "Legal authorities when required by law, regulation, court order, or other legal process",
            "To enforce our agreements or protect our rights, property, or safety",
            "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner"
          ],
          footer: "We require all third parties to respect the security of your personal data and use it only for the purposes for which it was transferred. We do not allow third parties to use your personal data for their own purposes and only permit them to process your data for specified purposes in accordance with our instructions."
        },
        security: {
          title: "Security measures",
          intro: "We take data security seriously and implement:",
          measures: [
            "Encryption of data in transit and at rest",
            "Regular security audits and updates",
            "Access controls and authentication",
            "Staff training on data protection"
          ]
        },
        retention: {
          title: "Data retention",
          body: "We will retain your personal information for as long as necessary to fulfill the purposes for which it was collected, as detailed in this Privacy Policy. Generally, we retain personal data for up to 1 year after your last interaction with us, unless a longer retention period is required or permitted by law. We may need to retain certain information for longer periods for specific reasons including: record-keeping and reporting in accordance with applicable law (typically 7 years for financial and tax records), enforcement of legal rights, fraud prevention, and dispute resolution. Once the retention period expires, your personal data will be securely deleted or anonymized. Residual anonymous information and aggregate information, which does not identify you directly or indirectly, may be stored indefinitely for statistical and analytical purposes."
        },
        rights: {
          title: "Your privacy rights",
          items: [
            "Right to access your personal data",
            "Right to correct inaccurate data",
            "Right to delete your personal data",
            "Right to restrict or object to processing",
            "Right to data portability",
            "Right to withdraw consent"
          ]
        },
        contact: {
          title: "Contact our privacy team",
          body: 'If you have any questions, concerns, or requests regarding this Privacy Policy or the processing of your personal information, or if you wish to exercise any of your privacy rights, please contact us at:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Phone:</strong> +258 8441 82252<br><strong>Postal Address:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique<br><br>We will respond to your request in accordance with applicable data protection law. For grievances or concerns about the processing of your information, you may also contact our Data Protection Officer at the email address above.'
        },
        transfers: {
          title: "International Data Transfers",
          body: "As we operate in multiple jurisdictions, your data may be transferred to and processed in countries outside of your residence. We ensure such transfers comply with applicable data protection laws through adequacy decisions by the European Commission, Standard Contractual Clauses (SCCs), appropriate security safeguards, and transparency about transfer locations."
        },
        updates: {
          title: "Policy Updates",
          body: "We may update this privacy policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes through email notifications for registered users, prominent notices on our website, and an updated 'last updated' date. We encourage you to periodically review this policy to stay informed about how we protect your information."
        }
      }
    },

    cookies: {
      title: "Cookie Policy",
      updatedDate: "06 Oct 2025",
      sections: {
        intro: {
          title: "Overview",
          body: "This Cookie Policy explains how DEVOCEAN Lodge uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them."
        },
        types: {
          title: "Types of cookies",
          items: [
            "Essential: required for core site functions",
            "Functional: remember choices (e.g. language)",
            "Analytics: help us understand site usage (aggregated)",
            "Advertising: used for marketing (only if you consent)"
          ]
        },
        manage: {
          title: "Managing cookies",
          body: "You can control cookies in your browser settings or via the banner. Blocking some cookies may affect site functionality."
        },
        third: {
          title: "Third-party cookies",
          body: "Some pages may load content from third parties that set their own cookies. See their policies for details."
        },
        contact: {
          title: "Contact",
          body: 'For questions about cookies, contact <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    terms: {
      title: "Terms & Conditions",
      updatedDate: "06 Oct 2025",
      quickLinks: {
        title: "Quick Links",
        links: [
          { id: "intro", text: "Scope" },
          { id: "booking", text: "Bookings" },
          { id: "payment", text: "Prices & Payment" },
          { id: "cancel", text: "Cancellations" },
          { id: "conduct", text: "Guest Conduct" },
          { id: "force-majeure", text: "Force Majeure" },
          { id: "liability", text: "Liability" },
          { id: "intellectual-property", text: "Intellectual Property" },
          { id: "disputes", text: "Dispute Resolution" },
          { id: "changes", text: "Changes" },
          { id: "law", text: "Governing Law" },
          { id: "contact", text: "Contact" }
        ]
      },
      sections: {
        intro: {
          title: "Scope",
          body: "These Terms govern accommodation and related services provided by DEVOCEAN Lodge (TERRAfrique LDA). By booking, you agree to these Terms."
        },
        booking: {
          title: "Bookings",
          items: [
            "Provide accurate guest information and arrival/departure dates",
            "Special requests are subject to availability and confirmation"
          ]
        },
        payment: {
          title: "Prices & Payment",
          items: [
            "Rates shown are per unit/night unless stated otherwise",
            "Deposits and settlement methods will be confirmed during booking"
          ]
        },
        cancel: {
          title: "Cancellations & No-shows",
          body: "Cancellation terms are disclosed at booking time and on your confirmation."
        },
        conduct: {
          title: "Guest conduct",
          items: [
            "Respect property rules, staff, other guests and the local community",
            "No unlawful activities on the premises"
          ]
        },
        liability: {
          title: "Liability",
          body: "To the extent permitted by law, we are not liable for indirect or unforeseeable losses."
        },
        changes: {
          title: "Changes to these Terms",
          body: "We may update Terms from time to time. The posted version applies to your stay."
        },
        law: {
          title: "Governing law",
          body: "Mozambican law applies, subject to mandatory local consumer rules."
        },
        contact: {
          title: "Contact",
          body: 'Questions? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    gdpr: {
      title: "GDPR Notice",
      updatedDate: "06 Oct 2025",
      sections: {
        controller: {
          title: "Data Controller",
          body: "TERRAfrique LDA is the data controller for bookings made directly with us."
        },
        bases: {
          title: "Legal bases",
          items: [
            "Contract: to fulfil your booking",
            "Legal obligation: invoicing, tax compliance",
            "Legitimate interests: security, service improvement",
            "Consent: marketing communications"
          ]
        },
        rights: {
          title: "EU/EEA rights",
          body: "EU/EEA residents have rights of access, rectification, erasure, restriction, portability and objection."
        },
        dpo: {
          title: "Contact",
          body: 'For GDPR matters email <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        },
        transfers: {
          title: "International transfers",
          body: "Where data is transferred outside the EEA, we use appropriate safeguards where required."
        }
      }
    },

    cric: {
      title: "CRIC — Company & Contact",
      updatedDate: "06 Oct 2025",
      sections: {
        intro: {
          title: "Overview",
          body: "Summary of company and contact information, and where to request statutory details if required."
        },
        contact: {
          title: "Contact",
          body: 'TERRAfrique LDA — <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>'
        }
      }
    }
  };

  // -------- GERMAN --------
  window.LEGAL_DICT.de = {
    privacy: {
      title: "Datenschutzrichtlinie",
      updatedDate: "06 Okt 2025",
      privacyBadge: {
        title: "Ihr Datenschutz ist wichtig:",
        body: "Wir verpflichten uns, Ihre persönlichen Daten zu schützen und transparent darüber zu sein, wie wir sie erheben, verwenden und schützen."
      },
      quickLinks: {
        title: "Schnelllinks",
        links: [
          { id: "who", text: "Wer wir sind" },
          { id: "collect", text: "Datenerhebung" },
          { id: "use", text: "Datennutzung" },
          { id: "share", text: "Datenweitergabe" },
          { id: "security", text: "Sicherheit" },
          { id: "retention", text: "Aufbewahrung" },
          { id: "rights", text: "Ihre Rechte" },
          { id: "transfers", text: "Internationale Übermittlungen" },
          { id: "contact", text: "Kontakt" },
          { id: "updates", text: "Richtlinien-Updates" }
        ]
      },
      sections: {
        who: {
          title: "Wer wir sind",
          body: "DEVOCEAN Lodge wird von TERRAfrique LDA betrieben, einem in Mosambik registrierten Unternehmen. Unsere registrierte Adresse ist Rua C, Parcela 12, Maputo 1118, Mosambik. Wir betreiben umweltfreundliche Strandunterkünfte in Ponta do Ouro, Mosambik. Wir verpflichten uns, Ihre Privatsphäre zu schützen und sicherzustellen, dass Ihre persönlichen Daten in Übereinstimmung mit den geltenden Datenschutzgesetzen ordnungsgemäß, rechtmäßig und transparent erhoben, verarbeitet und verwendet werden."
        },
        collect: {
          title: "Welche personenbezogenen Daten wir erheben"
        },
        use: {
          title: "Wie wir Ihre Daten verwenden",
          items: [
            "Verwaltung von Buchungen und Bereitstellung von Dienstleistungen",
            "Kommunikation über Ihren Aufenthalt, Richtlinien und Angebote (Opt-in)",
            "Verbesserung unserer Website und Dienstleistungen (Analysen, Sicherheit)",
            "Erfüllung rechtlicher/finanzieller Verpflichtungen"
          ]
        },
        share: {
          title: "Wann wir Daten weitergeben",
          items: [
            "Zahlungsanbieter und Buchungsplattformen zur Abwicklung Ihrer Reservierungen und Zahlungen",
            "Analysedienste zum Verständnis der Website-Nutzung und zur Verbesserung unserer Dienste",
            "Werbedienste für gezieltes Marketing (nur mit Ihrer Zustimmung)",
            "IT-Dienstleister, Hosting-Anbieter und technische Support-Anbieter unter strikten Vertraulichkeitsvereinbarungen",
            "Rechtliche Behörden, wenn gesetzlich, durch Vorschriften, Gerichtsbeschluss oder andere rechtliche Verfahren erforderlich",
            "Zur Durchsetzung unserer Vereinbarungen oder zum Schutz unserer Rechte, unseres Eigentums oder unserer Sicherheit",
            "Im Falle einer Fusion, Übernahme oder eines Verkaufs von Vermögenswerten können Ihre Informationen an den neuen Eigentümer übertragen werden"
          ],
          footer: "Wir verlangen von allen Dritten, die Sicherheit Ihrer persönlichen Daten zu respektieren und sie nur für die Zwecke zu verwenden, für die sie übermittelt wurden."
        },
        security: {
          title: "Sicherheitsmaßnahmen",
          intro: "Wir nehmen Datensicherheit ernst und implementieren:",
          measures: [
            "Verschlüsselung von Daten bei der Übertragung und im Ruhezustand",
            "Regelmäßige Sicherheitsaudits und Updates",
            "Zugriffskontrollen und Authentifizierung",
            "Schulungen des Personals zum Datenschutz"
          ]
        },
        retention: {
          title: "Datenaufbewahrung",
          body: "Wir bewahren Ihre persönlichen Daten so lange auf, wie es zur Erfüllung der Zwecke erforderlich ist, für die sie erhoben wurden. Im Allgemeinen bewahren wir personenbezogene Daten bis zu 1 Jahr nach Ihrer letzten Interaktion mit uns auf, es sei denn, eine längere Aufbewahrungsfrist ist gesetzlich vorgeschrieben oder zulässig."
        },
        rights: {
          title: "Ihre Datenschutzrechte",
          items: [
            "Recht auf Zugang zu Ihren personenbezogenen Daten",
            "Recht auf Berichtigung unrichtiger Daten",
            "Recht auf Löschung Ihrer personenbezogenen Daten",
            "Recht auf Einschränkung oder Widerspruch gegen die Verarbeitung",
            "Recht auf Datenübertragbarkeit",
            "Recht auf Widerruf der Einwilligung"
          ]
        },
        contact: {
          title: "Kontaktieren Sie unser Datenschutz-Team",
          body: 'Bei Fragen, Bedenken oder Anfragen zu dieser Datenschutzrichtlinie oder der Verarbeitung Ihrer personenbezogenen Daten kontaktieren Sie uns bitte unter:<br><br><strong>E-Mail:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefon:</strong> +258 8441 82252<br><strong>Postanschrift:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mosambik'
        },
        transfers: {
          title: "Internationale Datenübermittlungen",
          body: "Da wir in mehreren Gerichtsbarkeiten tätig sind, können Ihre Daten in Länder außerhalb Ihres Wohnsitzes übertragen und dort verarbeitet werden. Wir stellen sicher, dass solche Übermittlungen den geltenden Datenschutzgesetzen entsprechen."
        },
        updates: {
          title: "Richtlinien-Updates",
          body: "Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren, um Änderungen in unseren Praktiken, Technologien, rechtlichen Anforderungen oder anderen Faktoren widerzuspiegeln."
        }
      }
    }
  };

  // -------- DUTCH --------
  window.LEGAL_DICT.nl = {
    privacy: {
      title: "Privacybeleid",
      updatedDate: "06 okt 2025",
      privacyBadge: {
        title: "Uw privacy is belangrijk:",
        body: "We zijn toegewijd aan het beschermen van uw persoonlijke gegevens en transparant te zijn over hoe we deze verzamelen, gebruiken en beveiligen."
      },
      quickLinks: {
        title: "Snelkoppelingen",
        links: [
          { id: "who", text: "Wie we zijn" },
          { id: "collect", text: "Gegevensverzameling" },
          { id: "use", text: "Gegevensgebruik" },
          { id: "share", text: "Gegevensdeling" },
          { id: "security", text: "Beveiliging" },
          { id: "retention", text: "Bewaring" },
          { id: "rights", text: "Uw rechten" },
          { id: "transfers", text: "Internationale overdrachten" },
          { id: "contact", text: "Contact" },
          { id: "updates", text: "Beleidsupdates" }
        ]
      },
      sections: {
        who: {
          title: "Wie we zijn",
          body: "DEVOCEAN Lodge wordt geëxploiteerd door TERRAfrique LDA, een bedrijf geregistreerd in Mozambique. Ons geregistreerde adres is Rua C, Parcela 12, Maputo 1118, Mozambique. We exploiteren milieuvriendelijke strandaccommodaties in Ponta do Ouro, Mozambique. We zijn toegewijd aan het beschermen van uw privacy en zorgen ervoor dat uw persoonlijke gegevens op de juiste, wettige en transparante manier worden verzameld, verwerkt en gebruikt in overeenstemming met de geldende wetgeving inzake gegevensbescherming."
        },
        collect: {
          title: "Welke persoonlijke gegevens we verzamelen"
        },
        use: {
          title: "Hoe we uw gegevens gebruiken",
          items: [
            "Boekingen beheren en diensten leveren",
            "Communiceren over uw verblijf, beleid en aanbiedingen (opt-in)",
            "Onze site en diensten verbeteren (analyses, beveiliging)",
            "Voldoen aan wettelijke/financiële verplichtingen"
          ]
        },
        share: {
          title: "Wanneer we gegevens delen",
          items: [
            "Betalingsproviders en boekingsplatforms om uw reserveringen en betalingen te verwerken",
            "Analysediensten om websitegebruik te begrijpen en onze diensten te verbeteren",
            "Advertentiediensten voor gerichte marketing (alleen met uw toestemming)",
            "IT-serviceproviders, hostingproviders en technische ondersteuningsleveranciers onder strikte vertrouwelijkheidsovereenkomsten",
            "Juridische autoriteiten wanneer vereist door wet, regelgeving, gerechtelijk bevel of ander juridisch proces",
            "Om onze overeenkomsten af te dwingen of onze rechten, eigendommen of veiligheid te beschermen",
            "In het geval van een fusie, overname of verkoop van activa kunnen uw gegevens worden overgedragen aan de nieuwe eigenaar"
          ],
          footer: "We vereisen dat alle derden de beveiliging van uw persoonlijke gegevens respecteren en deze alleen gebruiken voor de doeleinden waarvoor ze zijn overgedragen."
        },
        security: {
          title: "Beveiligingsmaatregelen",
          intro: "We nemen gegevensbeveiliging serieus en implementeren:",
          measures: [
            "Versleuteling van gegevens tijdens verzending en in rust",
            "Regelmatige beveiligingsaudits en updates",
            "Toegangscontroles en authenticatie",
            "Training van personeel in gegevensbescherming"
          ]
        },
        retention: {
          title: "Gegevensbewaring",
          body: "We bewaren uw persoonlijke informatie zo lang als nodig is om de doeleinden te vervullen waarvoor deze werd verzameld. Over het algemeen bewaren we persoonlijke gegevens tot 1 jaar na uw laatste interactie met ons, tenzij een langere bewaartermijn wettelijk vereist of toegestaan is."
        },
        rights: {
          title: "Uw privacyrechten",
          items: [
            "Recht op toegang tot uw persoonlijke gegevens",
            "Recht op correctie van onjuiste gegevens",
            "Recht op verwijdering van uw persoonlijke gegevens",
            "Recht op beperking of bezwaar tegen verwerking",
            "Recht op gegevensoverdraagbaarheid",
            "Recht om toestemming in te trekken"
          ]
        },
        contact: {
          title: "Neem contact op met ons privacyteam",
          body: 'Als u vragen, zorgen of verzoeken heeft met betrekking tot dit privacybeleid of de verwerking van uw persoonlijke informatie, neem dan contact met ons op via:<br><br><strong>E-mail:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefoon:</strong> +258 8441 82252<br><strong>Postadres:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique'
        },
        transfers: {
          title: "Internationale gegevensoverdrachten",
          body: "Omdat we in meerdere rechtsgebieden opereren, kunnen uw gegevens worden overgedragen naar en verwerkt in landen buiten uw woonplaats. We zorgen ervoor dat dergelijke overdrachten voldoen aan de toepasselijke wetgeving inzake gegevensbescherming."
        },
        updates: {
          title: "Beleidsupdates",
          body: "We kunnen dit privacybeleid van tijd tot tijd bijwerken om veranderingen in onze praktijken, technologie, wettelijke vereisten of andere factoren weer te geven."
        }
      }
    }
  };

  // -------- PORTUGUESE --------
  window.LEGAL_DICT.pt = {
    privacy: {
      title: "Política de Privacidade",
      updatedDate: "06 out 2025",
      privacyBadge: {
        title: "A sua privacidade é importante:",
        body: "Estamos comprometidos em proteger os seus dados pessoais e ser transparentes sobre como os recolhemos, usamos e protegemos."
      },
      quickLinks: {
        title: "Links rápidos",
        links: [
          { id: "who", text: "Quem somos" },
          { id: "collect", text: "Recolha de dados" },
          { id: "use", text: "Uso de dados" },
          { id: "share", text: "Partilha de dados" },
          { id: "security", text: "Segurança" },
          { id: "retention", text: "Retenção" },
          { id: "rights", text: "Os seus direitos" },
          { id: "transfers", text: "Transferências internacionais" },
          { id: "contact", text: "Contacto" },
          { id: "updates", text: "Atualizações da política" }
        ]
      },
      sections: {
        who: {
          title: "Quem somos",
          body: "O DEVOCEAN Lodge é operado pela TERRAfrique LDA, uma empresa registada em Moçambique. O nosso endereço registado é Rua C, Parcela 12, Maputo 1118, Moçambique. Operamos alojamento ecológico de praia em Ponta do Ouro, Moçambique. Estamos comprometidos em proteger a sua privacidade e garantir que os seus dados pessoais sejam recolhidos, processados e utilizados de forma adequada, legal e transparente, de acordo com as leis aplicáveis de proteção de dados."
        },
        collect: {
          title: "Que dados pessoais recolhemos"
        },
        use: {
          title: "Como usamos os seus dados",
          items: [
            "Gerir reservas e fornecer serviços",
            "Comunicar sobre a sua estadia, políticas e ofertas (opt-in)",
            "Melhorar o nosso site e serviços (análises, segurança)",
            "Cumprir obrigações legais/financeiras"
          ]
        },
        share: {
          title: "Quando partilhamos dados",
          items: [
            "Fornecedores de pagamento e plataformas de reserva para processar as suas reservas e pagamentos",
            "Serviços de análise para entender o uso do site e melhorar os nossos serviços",
            "Serviços de publicidade para marketing direcionado (apenas com o seu consentimento)",
            "Fornecedores de serviços de TI, fornecedores de hospedagem e fornecedores de suporte técnico sob acordos estritos de confidencialidade",
            "Autoridades legais quando exigido por lei, regulamento, ordem judicial ou outro processo legal",
            "Para fazer cumprir os nossos acordos ou proteger os nossos direitos, propriedade ou segurança",
            "No caso de uma fusão, aquisição ou venda de ativos, as suas informações podem ser transferidas para o novo proprietário"
          ],
          footer: "Exigimos que todos os terceiros respeitem a segurança dos seus dados pessoais e os utilizem apenas para os fins para os quais foram transferidos."
        },
        security: {
          title: "Medidas de segurança",
          intro: "Levamos a segurança dos dados a sério e implementamos:",
          measures: [
            "Encriptação de dados em trânsito e em repouso",
            "Auditorias de segurança e atualizações regulares",
            "Controlos de acesso e autenticação",
            "Formação do pessoal sobre proteção de dados"
          ]
        },
        retention: {
          title: "Retenção de dados",
          body: "Reteremos as suas informações pessoais pelo tempo necessário para cumprir os propósitos para os quais foram recolhidas. Geralmente, retemos dados pessoais por até 1 ano após a sua última interação connosco, a menos que um período de retenção mais longo seja exigido ou permitido por lei."
        },
        rights: {
          title: "Os seus direitos de privacidade",
          items: [
            "Direito de acesso aos seus dados pessoais",
            "Direito de corrigir dados incorretos",
            "Direito de eliminar os seus dados pessoais",
            "Direito de restringir ou opor-se ao processamento",
            "Direito à portabilidade de dados",
            "Direito de retirar o consentimento"
          ]
        },
        contact: {
          title: "Contacte a nossa equipa de privacidade",
          body: 'Se tiver alguma pergunta, preocupação ou pedido relacionado com esta Política de Privacidade ou o processamento das suas informações pessoais, por favor contacte-nos em:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefone:</strong> +258 8441 82252<br><strong>Morada postal:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Moçambique'
        },
        transfers: {
          title: "Transferências internacionais de dados",
          body: "Como operamos em várias jurisdições, os seus dados podem ser transferidos e processados em países fora da sua residência. Garantimos que essas transferências cumpram as leis aplicáveis de proteção de dados."
        },
        updates: {
          title: "Atualizações da política",
          body: "Podemos atualizar esta política de privacidade periodicamente para refletir mudanças nas nossas práticas, tecnologia, requisitos legais ou outros fatores."
        }
      }
    }
  };

  // -------- PORTUGUESE MOZAMBIQUE --------
  window.LEGAL_DICT.ptmz = window.LEGAL_DICT.pt; // Same as PT

  // -------- FRENCH --------
  window.LEGAL_DICT.fr = {
    privacy: {
      title: "Politique de confidentialité",
      updatedDate: "06 oct 2025",
      privacyBadge: {
        title: "Votre vie privée compte :",
        body: "Nous nous engageons à protéger vos données personnelles et à être transparents sur la manière dont nous les collectons, les utilisons et les protégeons."
      },
      quickLinks: {
        title: "Liens rapides",
        links: [
          { id: "who", text: "Qui nous sommes" },
          { id: "collect", text: "Collecte de données" },
          { id: "use", text: "Utilisation des données" },
          { id: "share", text: "Partage des données" },
          { id: "security", text: "Sécurité" },
          { id: "retention", text: "Conservation" },
          { id: "rights", text: "Vos droits" },
          { id: "transfers", text: "Transferts internationaux" },
          { id: "contact", text: "Contact" },
          { id: "updates", text: "Mises à jour de la politique" }
        ]
      },
      sections: {
        who: {
          title: "Qui nous sommes",
          body: "DEVOCEAN Lodge est exploité par TERRAfrique LDA, une société enregistrée au Mozambique. Notre adresse enregistrée est Rua C, Parcela 12, Maputo 1118, Mozambique. Nous exploitons des hébergements de plage écologiques à Ponta do Ouro, Mozambique. Nous nous engageons à protéger votre vie privée et à garantir que vos données personnelles sont collectées, traitées et utilisées de manière appropriée, légale et transparente conformément aux lois applicables sur la protection des données."
        },
        collect: {
          title: "Quelles données personnelles nous collectons"
        },
        use: {
          title: "Comment nous utilisons vos données",
          items: [
            "Gérer les réservations et fournir des services",
            "Communiquer sur votre séjour, les politiques et les offres (opt-in)",
            "Améliorer notre site et nos services (analyses, sécurité)",
            "Respecter les obligations légales/financières"
          ]
        },
        share: {
          title: "Quand nous partageons des données",
          items: [
            "Fournisseurs de paiement et plateformes de réservation pour traiter vos réservations et paiements",
            "Services d'analyse pour comprendre l'utilisation du site Web et améliorer nos services",
            "Services publicitaires pour le marketing ciblé (uniquement avec votre consentement)",
            "Fournisseurs de services informatiques, fournisseurs d'hébergement et fournisseurs de support technique sous des accords de confidentialité stricts",
            "Autorités légales lorsque requis par la loi, la réglementation, une ordonnance judiciaire ou une autre procédure légale",
            "Pour faire respecter nos accords ou protéger nos droits, nos biens ou notre sécurité",
            "En cas de fusion, d'acquisition ou de vente d'actifs, vos informations peuvent être transférées au nouveau propriétaire"
          ],
          footer: "Nous exigeons de tous les tiers qu'ils respectent la sécurité de vos données personnelles et ne les utilisent que pour les fins pour lesquelles elles ont été transférées."
        },
        security: {
          title: "Mesures de sécurité",
          intro: "Nous prenons la sécurité des données au sérieux et mettons en œuvre :",
          measures: [
            "Chiffrement des données en transit et au repos",
            "Audits de sécurité et mises à jour réguliers",
            "Contrôles d'accès et authentification",
            "Formation du personnel à la protection des données"
          ]
        },
        retention: {
          title: "Conservation des données",
          body: "Nous conserverons vos informations personnelles aussi longtemps que nécessaire pour remplir les objectifs pour lesquels elles ont été collectées. En général, nous conservons les données personnelles jusqu'à 1 an après votre dernière interaction avec nous, sauf si une période de conservation plus longue est requise ou autorisée par la loi."
        },
        rights: {
          title: "Vos droits en matière de confidentialité",
          items: [
            "Droit d'accès à vos données personnelles",
            "Droit de corriger les données inexactes",
            "Droit de supprimer vos données personnelles",
            "Droit de restreindre ou de s'opposer au traitement",
            "Droit à la portabilité des données",
            "Droit de retirer le consentement"
          ]
        },
        contact: {
          title: "Contactez notre équipe de confidentialité",
          body: 'Si vous avez des questions, des préoccupations ou des demandes concernant cette politique de confidentialité ou le traitement de vos informations personnelles, veuillez nous contacter à :<br><br><strong>Email :</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Téléphone :</strong> +258 8441 82252<br><strong>Adresse postale :</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique'
        },
        transfers: {
          title: "Transferts internationaux de données",
          body: "Comme nous opérons dans plusieurs juridictions, vos données peuvent être transférées et traitées dans des pays en dehors de votre résidence. Nous veillons à ce que ces transferts respectent les lois applicables sur la protection des données."
        },
        updates: {
          title: "Mises à jour de la politique",
          body: "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre pour refléter les changements dans nos pratiques, la technologie, les exigences légales ou d'autres facteurs."
        }
      }
    }
  };

  // -------- ITALIAN --------
  window.LEGAL_DICT.it = {
    privacy: {
      title: "Informativa sulla privacy",
      updatedDate: "06 ott 2025",
      privacyBadge: {
        title: "La tua privacy è importante:",
        body: "Ci impegniamo a proteggere i tuoi dati personali e ad essere trasparenti su come li raccogliamo, usiamo e proteggiamo."
      },
      quickLinks: {
        title: "Link rapidi",
        links: [
          { id: "who", text: "Chi siamo" },
          { id: "collect", text: "Raccolta dati" },
          { id: "use", text: "Utilizzo dei dati" },
          { id: "share", text: "Condivisione dei dati" },
          { id: "security", text: "Sicurezza" },
          { id: "retention", text: "Conservazione" },
          { id: "rights", text: "I tuoi diritti" },
          { id: "transfers", text: "Trasferimenti internazionali" },
          { id: "contact", text: "Contatto" },
          { id: "updates", text: "Aggiornamenti della politica" }
        ]
      },
      sections: {
        who: {
          title: "Chi siamo",
          body: "DEVOCEAN Lodge è gestito da TERRAfrique LDA, una società registrata in Mozambico. Il nostro indirizzo registrato è Rua C, Parcela 12, Maputo 1118, Mozambico. Gestiamo alloggi ecologici sulla spiaggia a Ponta do Ouro, Mozambico. Ci impegniamo a proteggere la tua privacy e a garantire che i tuoi dati personali siano raccolti, trattati e utilizzati in modo appropriato, legale e trasparente in conformità con le leggi applicabili sulla protezione dei dati."
        },
        collect: {
          title: "Quali dati personali raccogliamo"
        },
        use: {
          title: "Come utilizziamo i tuoi dati",
          items: [
            "Gestire prenotazioni e fornire servizi",
            "Comunicare sul tuo soggiorno, politiche e offerte (opt-in)",
            "Migliorare il nostro sito e i servizi (analisi, sicurezza)",
            "Rispettare gli obblighi legali/finanziari"
          ]
        },
        share: {
          title: "Quando condividiamo i dati",
          items: [
            "Fornitori di pagamento e piattaforme di prenotazione per elaborare le tue prenotazioni e pagamenti",
            "Servizi di analisi per comprendere l'utilizzo del sito Web e migliorare i nostri servizi",
            "Servizi pubblicitari per marketing mirato (solo con il tuo consenso)",
            "Fornitori di servizi IT, fornitori di hosting e fornitori di supporto tecnico con accordi di riservatezza rigorosi",
            "Autorità legali quando richiesto dalla legge, regolamento, ordine del tribunale o altro processo legale",
            "Per far rispettare i nostri accordi o proteggere i nostri diritti, proprietà o sicurezza",
            "In caso di fusione, acquisizione o vendita di beni, le tue informazioni potrebbero essere trasferite al nuovo proprietario"
          ],
          footer: "Richiediamo a tutti i terzi di rispettare la sicurezza dei tuoi dati personali e di utilizzarli solo per gli scopi per cui sono stati trasferiti."
        },
        security: {
          title: "Misure di sicurezza",
          intro: "Prendiamo sul serio la sicurezza dei dati e implementiamo:",
          measures: [
            "Crittografia dei dati in transito e a riposo",
            "Audit di sicurezza e aggiornamenti regolari",
            "Controlli di accesso e autenticazione",
            "Formazione del personale sulla protezione dei dati"
          ]
        },
        retention: {
          title: "Conservazione dei dati",
          body: "Conserveremo le tue informazioni personali per il tempo necessario a soddisfare gli scopi per cui sono state raccolte. In generale, conserviamo i dati personali fino a 1 anno dopo la tua ultima interazione con noi, a meno che non sia richiesto o consentito dalla legge un periodo di conservazione più lungo."
        },
        rights: {
          title: "I tuoi diritti sulla privacy",
          items: [
            "Diritto di accesso ai tuoi dati personali",
            "Diritto di correggere dati inesatti",
            "Diritto di cancellare i tuoi dati personali",
            "Diritto di limitare o opporsi al trattamento",
            "Diritto alla portabilità dei dati",
            "Diritto di revocare il consenso"
          ]
        },
        contact: {
          title: "Contatta il nostro team privacy",
          body: 'Se hai domande, preoccupazioni o richieste riguardanti questa Informativa sulla privacy o il trattamento delle tue informazioni personali, contattaci all\'indirizzo:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefono:</strong> +258 8441 82252<br><strong>Indirizzo postale:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambico'
        },
        transfers: {
          title: "Trasferimenti internazionali di dati",
          body: "Poiché operiamo in più giurisdizioni, i tuoi dati potrebbero essere trasferiti ed elaborati in paesi al di fuori della tua residenza. Garantiamo che tali trasferimenti rispettino le leggi applicabili sulla protezione dei dati."
        },
        updates: {
          title: "Aggiornamenti della politica",
          body: "Potremmo aggiornare questa informativa sulla privacy di tanto in tanto per riflettere cambiamenti nelle nostre pratiche, tecnologia, requisiti legali o altri fattori."
        }
      }
    }
  };

  // -------- SPANISH --------
  window.LEGAL_DICT.es = {
    privacy: {
      title: "Política de privacidad",
      updatedDate: "06 oct 2025",
      privacyBadge: {
        title: "Tu privacidad importa:",
        body: "Estamos comprometidos a proteger tus datos personales y ser transparentes sobre cómo los recopilamos, usamos y protegemos."
      },
      quickLinks: {
        title: "Enlaces rápidos",
        links: [
          { id: "who", text: "Quiénes somos" },
          { id: "collect", text: "Recopilación de datos" },
          { id: "use", text: "Uso de datos" },
          { id: "share", text: "Compartir datos" },
          { id: "security", text: "Seguridad" },
          { id: "retention", text: "Retención" },
          { id: "rights", text: "Tus derechos" },
          { id: "transfers", text: "Transferencias internacionales" },
          { id: "contact", text: "Contacto" },
          { id: "updates", text: "Actualizaciones de la política" }
        ]
      },
      sections: {
        who: {
          title: "Quiénes somos",
          body: "DEVOCEAN Lodge es operado por TERRAfrique LDA, una empresa registrada en Mozambique. Nuestra dirección registrada es Rua C, Parcela 12, Maputo 1118, Mozambique. Operamos alojamiento ecológico en la playa en Ponta do Ouro, Mozambique. Estamos comprometidos a proteger su privacidad y garantizar que sus datos personales se recopilen, procesen y utilicen de manera adecuada, legal y transparente de acuerdo con las leyes aplicables de protección de datos."
        },
        collect: {
          title: "Qué datos personales recopilamos"
        },
        use: {
          title: "Cómo usamos tus datos",
          items: [
            "Gestionar reservas y proporcionar servicios",
            "Comunicar sobre tu estancia, políticas y ofertas (opt-in)",
            "Mejorar nuestro sitio y servicios (análisis, seguridad)",
            "Cumplir con obligaciones legales/financieras"
          ]
        },
        share: {
          title: "Cuándo compartimos datos",
          items: [
            "Proveedores de pago y plataformas de reserva para procesar tus reservas y pagos",
            "Servicios de análisis para comprender el uso del sitio web y mejorar nuestros servicios",
            "Servicios de publicidad para marketing dirigido (solo con tu consentimiento)",
            "Proveedores de servicios de TI, proveedores de alojamiento y proveedores de soporte técnico bajo acuerdos estrictos de confidencialidad",
            "Autoridades legales cuando sea requerido por ley, regulación, orden judicial u otro proceso legal",
            "Para hacer cumplir nuestros acuerdos o proteger nuestros derechos, propiedad o seguridad",
            "En caso de una fusión, adquisición o venta de activos, tu información puede ser transferida al nuevo propietario"
          ],
          footer: "Requerimos que todos los terceros respeten la seguridad de tus datos personales y los utilicen solo para los fines para los que fueron transferidos."
        },
        security: {
          title: "Medidas de seguridad",
          intro: "Nos tomamos en serio la seguridad de los datos e implementamos:",
          measures: [
            "Cifrado de datos en tránsito y en reposo",
            "Auditorías de seguridad y actualizaciones regulares",
            "Controles de acceso y autenticación",
            "Capacitación del personal sobre protección de datos"
          ]
        },
        retention: {
          title: "Retención de datos",
          body: "Conservaremos tu información personal durante el tiempo necesario para cumplir los propósitos para los que fue recopilada. Generalmente, conservamos los datos personales hasta 1 año después de tu última interacción con nosotros, a menos que se requiera o permita un período de retención más largo por ley."
        },
        rights: {
          title: "Tus derechos de privacidad",
          items: [
            "Derecho de acceso a tus datos personales",
            "Derecho a corregir datos inexactos",
            "Derecho a eliminar tus datos personales",
            "Derecho a restringir u oponerse al procesamiento",
            "Derecho a la portabilidad de datos",
            "Derecho a retirar el consentimiento"
          ]
        },
        contact: {
          title: "Contacta con nuestro equipo de privacidad",
          body: 'Si tienes alguna pregunta, inquietud o solicitud relacionada con esta Política de privacidad o el procesamiento de tu información personal, contáctanos en:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Teléfono:</strong> +258 8441 82252<br><strong>Dirección postal:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique'
        },
        transfers: {
          title: "Transferencias internacionales de datos",
          body: "Como operamos en múltiples jurisdicciones, tus datos pueden ser transferidos y procesados en países fuera de tu residencia. Nos aseguramos de que dichas transferencias cumplan con las leyes aplicables de protección de datos."
        },
        updates: {
          title: "Actualizaciones de la política",
          body: "Podemos actualizar esta política de privacidad de vez en cuando para reflejar cambios en nuestras prácticas, tecnología, requisitos legales u otros factores."
        }
      }
    }
  };
  
})();
