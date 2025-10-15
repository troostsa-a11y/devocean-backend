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
    en:   { backButton: "Back",             back: "Home",                   updated: "Last updated" },
    de:   { backButton: "Zurück",           back: "Startseite",             updated: "Zuletzt aktualisiert" },
    nl:   { backButton: "Terug",            back: "Home",                   updated: "Laatst bijgewerkt" },
    pt:   { backButton: "Voltar",           back: "Início",                 updated: "Última atualização" },
    ptmz: { backButton: "Voltar",           back: "Início",                 updated: "Última atualização" },
    fr:   { backButton: "Retour",           back: "Accueil",                updated: "Dernière mise à jour" },
    it:   { backButton: "Indietro",         back: "Home",                   updated: "Ultimo aggiornamento" },
    es:   { backButton: "Volver",           back: "Inicio",                 updated: "Última actualización" },
    sv:   { backButton: "Tillbaka",         back: "Hem",                    updated: "Senast uppdaterad" },
    pl:   { backButton: "Wstecz",           back: "Strona główna",          updated: "Ostatnia aktualizacja" },
    ja:   { backButton: "戻る",             back: "ホーム",                 updated: "最終更新日" },
    zh:   { backButton: "返回",             back: "首页",                   updated: "最后更新" },
    ru:   { backButton: "Назад",            back: "Главная",                updated: "Последнее обновление" },
    af:   { backButton: "Terug",            back: "Tuis",                   updated: "Laaste opdatering" },
    zu:   { backButton: "Buyela emuva",     back: "Ikhaya",                 updated: "Okokugcina okubuyekeziwe" }
  };

  // Root dict
  window.LEGAL_DICT = {};

  // -------- ENGLISH (base/fallback) --------
  window.LEGAL_DICT.en = {
    privacy: {
      title: "Privacy Policy",
      updatedDate: "06 Oct 2025",
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
        badge: {
          title: "Your Privacy Matters:",
          body: "We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information."
        },
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
            "Encryption of sensitive data in transit and at rest",
            "Regular security assessments and penetration testing",
            "Access controls and authentication mechanisms",
            "Staff training on data protection and privacy",
            "Secure data backup and disaster recovery procedures"
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
      effectiveDate: "September 19, 2025",
      lastUpdated: "October 06, 2025",
      managePreferences: "Manage Your Cookie Preferences:",
      manageText: "You can control which cookies we use through our cookie banner or your browser settings.",
      cookieSettingsBtn: "Cookie Settings",
      quickLinks: {
        title: "Quick Links",
        links: [
          { id: "what", text: "What are cookies" },
          { id: "how", text: "How we use cookies" },
          { id: "necessary", text: "Necessary" },
          { id: "functional", text: "Functional" },
          { id: "analytics", text: "Analytics" },
          { id: "advertisement", text: "Advertisement" },
          { id: "manage", text: "Manage preferences" }
        ]
      },
      sections: {
        badge: {
          title: "About cookies",
          body: "You can control which cookies we use through our cookie banner or your browser settings."
        },
        what: {
          title: "What are cookies?",
          body: "This Cookie Policy explains what cookies are, how we use them, the types of cookies we use (i.e., the information we collect using cookies and how that information is used), and how to manage your cookie settings.<br><br>Cookies are small text files used to store small pieces of information. They are stored on your device when a website loads in your browser. These cookies help ensure that the website functions properly, enhance security, provide a better user experience, and analyse performance to identify what works and where improvements are needed."
        },
        how: {
          title: "How do we use cookies?",
          body: "Like most online services, our website uses both first-party and third-party cookies for various purposes. First-party cookies are primarily necessary for the website to function properly and do not collect any personally identifiable data.<br><br>The third-party cookies used on our website primarily help us understand how the website performs, track how you interact with it, keep our services secure, deliver relevant advertisements, and enhance your overall user experience while improving the speed of your future interactions with our website."
        },
        necessary: {
          title: "Necessary Cookies",
          description: "Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.",
          tableHeaders: { cookie: "Cookie", duration: "Duration", description: "Description" },
          cookies: [
            { name: "currency", duration: "session", desc: "This cookie is used to store the currency preference of the user." },
            { name: "_sh_session_", duration: "session", desc: "Description is currently not available." },
            { name: "loccur", duration: "session", desc: "Description is currently not available." },
            { name: "country_code", duration: "session", desc: "No description available." },
            { name: "b_locale", duration: "session", desc: "Description is currently not available." },
            { name: "checkout_currency", duration: "session", desc: "Description is currently not available." }
          ]
        },
        functional: {
          title: "Functional Cookies",
          description: "Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.",
          tableHeaders: { cookie: "Cookie", duration: "Duration", description: "Description" },
          cookies: [
            { name: "locale", duration: "session", desc: "Facebook sets this cookie to enhance the user's browsing experience on the website, and to provide the user with relevant advertising while using Facebook's social media platforms." }
          ]
        },
        analytics: {
          title: "Analytics Cookies",
          description: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.",
          tableHeaders: { cookie: "Cookie", duration: "Duration", description: "Description" },
          cookies: [
            { name: "_ga", duration: "1 year 1 month 4 days", desc: "Google Analytics sets this cookie to calculate visitor, session and campaign data and track site usage for the site's analytics report. The cookie stores information anonymously and assigns a randomly generated number to recognise unique visitors." },
            { name: "_ga_*", duration: "1 year 1 month 4 days", desc: "Google Analytics sets this cookie to store and count page views." },
            { name: "_gid", duration: "1 day", desc: "Google Analytics sets this cookie to store information on how visitors use a website while also creating an analytics report of the website's performance. Some of the collected data includes the number of visitors, their source, and the pages they visit anonymously." },
            { name: "_gat_UA-*", duration: "1 minute", desc: "Google Analytics sets this cookie for user behaviour tracking." },
            { name: "pardot", duration: "past", desc: "The pardot cookie is set while the visitor is logged in as a Pardot user. The cookie indicates an active session and is not used for tracking." }
          ]
        },
        advertisement: {
          title: "Advertisement Cookies",
          description: "Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns.",
          tableHeaders: { cookie: "Cookie", duration: "Duration", description: "Description" },
          cookies: [
            { name: "_gcl_au", duration: "3 months", desc: "Google Tag Manager sets this cookie to experiment advertisement efficiency of websites using their services." },
            { name: "test_cookie", duration: "15 minutes", desc: "doubleclick.net sets this cookie to determine if the user's browser supports cookies." },
            { name: "_fbp", duration: "3 months", desc: "Facebook sets this cookie to store and track interactions." },
            { name: "IDE", duration: "1 year 24 days", desc: "Google DoubleClick IDE cookies store information about how the user uses the website to present them with relevant ads according to the user profile." }
          ]
        },
        manage: {
          title: "Manage cookie preferences",
          consentTitle: "Consent Preferences",
          consentText: "You can modify your cookie settings anytime by clicking the 'Consent Preferences' button above. This will allow you to revisit the cookie consent banner and update your preferences or withdraw your consent immediately.",
          browserText: "Additionally, different browsers offer various methods to block and delete cookies used by websites. You can adjust your browser settings to block or delete cookies. Below are links to support documents on how to manage and delete cookies in major web browsers.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "If you are using a different web browser, please refer to its official support documentation."
          }
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
        badge: {
          title: "Important Legal Notice:",
          body: "These terms govern your use of our services and website. Please read them carefully before making a booking."
        },
        intro: {
          title: "Scope",
          body: "These Terms govern accommodation and related services provided by DEVOCEAN Lodge (TERRAfrique LDA). By booking, you agree to these Terms."
        },
        booking: {
          title: "Bookings",
          items: [
            "Provide accurate guest information and arrival/departure dates",
            "Special requests are subject to availability and confirmation"
          ],
          reservationReq: {
            title: "Reservation Requirements",
            body: "Valid ID and credit card required for all bookings. Minimum age: 18 years."
          },
          checkinCheckout: {
            title: "Check-in/Check-out",
            body: "Check-in: 2:00 PM | Check-out: 11:00 AM. Early/late requests subject to availability."
          },
          groupBookings: {
            title: "Group Bookings",
            body: "Special terms apply for groups of 6+ rooms. Contact us for group rates and policies."
          }
        },
        payment: {
          title: "Prices & Payment",
          items: [
            "Rates shown are per unit/night unless stated otherwise",
            "Deposits and settlement methods will be confirmed during booking"
          ],
          paymentInfo: {
            title: "Payment Information",
            body: "All prices are in USD unless otherwise stated. Currency conversion rates are approximate and subject to change. A valid credit card is required to secure your reservation. Additional charges may apply for incidental expenses."
          }
        },
        cancel: {
          title: "Cancellations & No-shows",
          body: "Cancellation terms are disclosed at booking time and on your confirmation.",
          cancellationCharges: {
            title: "Cancellation Charges",
            plans: [
              {
                planName: "Semi-flexible rate plan:",
                tiers: [
                  { period: "30 days or more before arrival", charge: "Full refund" },
                  { period: "29 days or less before arrival", charge: "50% cancellation fee" }
                ]
              },
              {
                planName: "Non refundable rate plan:",
                tiers: [
                  { period: "Until 24 hours after reservation", charge: "Full refund" },
                  { period: "In all other circumstances", subtext: "The right to modify the date of arrival once under the condition of paying the difference in case the new date has a higher rate.", charge: "No refund", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "No-Show Policy",
            body: "Guests who fail to arrive on the scheduled check-in date without prior notification will be considered no-shows. The full booking amount will be charged, and the reservation will be cancelled."
          }
        },
        conduct: {
          title: "Guest conduct",
          items: [
            "Respect property rules, staff, other guests and the local community",
            "No unlawful activities on the premises"
          ],
          zeroTolerance: {
            title: "Zero Tolerance Policy",
            body: "We maintain a zero tolerance policy for disruptive behavior, illegal activities, or damage to property. Violations may result in immediate eviction without refund and may lead to legal action."
          }
        },
        "force-majeure": {
          title: "Force Majeure",
          intro: "We are not liable for failure to perform obligations due to circumstances beyond our reasonable control, including but not limited to:",
          items: [
            "Natural disasters, extreme weather conditions",
            "Government restrictions, travel bans",
            "Civil unrest, war, terrorism",
            "Pandemics, epidemics, health emergencies",
            "Utility failures, infrastructure breakdowns"
          ],
          footer: "In such cases, we will offer alternative dates or credit vouchers where possible. Refunds will be provided according to applicable laws and circumstances. However all damages and costs that are or could have been covered by generally available cancellation and travel insurance packages are excluded from our liability."
        },
        liability: {
          title: "Liability",
          body: "To the extent permitted by law, we are not liable for indirect or unforeseeable losses."
        },
        "intellectual-property": {
          title: "Intellectual Property",
          copyright: {
            title: "Copyright Notice",
            body: "All content on this website, including text, graphics, logos, and images, is the property of DEVOCEAN Lodge and protected by international copyright laws. Unauthorized use, reproduction, or distribution is prohibited. The DEVOCEAN Lodge name, logo, and all related marks are trademarks and may not be used without written permission."
          }
        },
        disputes: {
          title: "Dispute Resolution",
          process: {
            title: "Resolution Process",
            body: "We aim to resolve any disputes amicably. Please contact us first to attempt resolution. If unresolved, disputes shall be settled through mediation before pursuing legal action.",
            law: "Governing Law: Mozambican law shall govern these terms and any disputes.",
            jurisdiction: "Jurisdiction: Courts of Maputo, Mozambique shall have exclusive jurisdiction.",
            mediation: "Mediation: Parties agree to attempt mediation through an accredited mediator before initiating legal proceedings."
          }
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
      quickLinks: {
        title: "Quick Links",
        links: [
          { id: "controller", text: "Controller" },
          { id: "bases", text: "Legal Bases" },
          { id: "rights", text: "Your Rights" },
          { id: "retention", text: "Data Retention" },
          { id: "transfers", text: "Data Transfers" },
          { id: "complaints", text: "Complaints" }
        ]
      },
      sections: {
        badge: {
          title: "GDPR Compliant:",
          body: "We are committed to protecting your personal data and respecting your privacy rights under the General Data Protection Regulation."
        },
        controller: {
          title: "Data Controller",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), registered at Rua C, Parcela 12, Maputo 1118, Mozambique, acts as the data controller for your personal information collected through our services."
        },
        bases: {
          title: "Legal Bases for Processing",
          body: "We process your personal data based on the following legal grounds under GDPR:"
        },
        rights: {
          title: "Your GDPR Rights",
          body: "As a data subject under GDPR, you have the following rights regarding your personal data:"
        },
        retention: {
          title: "Data Retention",
          periodsTitle: "Retention Periods",
          intro: "We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements.",
          items: [
            "<strong>Booking data:</strong> 7 years for tax and legal compliance",
            "<strong>Customer service communications:</strong> 3 years",
            "<strong>Marketing consents:</strong> Until withdrawal of consent",
            "<strong>Website analytics:</strong> 26 months",
            "<strong>Financial transactions:</strong> 10 years for accounting purposes"
          ]
        },
        transfers: {
          title: "International Data Transfers",
          body: "When we transfer your data outside the European Economic Area (EEA), we ensure appropriate safeguards are in place to protect your information. This may include the use of Standard Contractual Clauses approved by the European Commission or transferring data to countries with adequacy decisions."
        },
        complaints: {
          title: "Complaints",
          intro: "If you have concerns about how we handle your personal data, you have the right to lodge a complaint with your local data protection authority.",
          footer: "We encourage you to contact us first to resolve any concerns before approaching the supervisory authority."
        },
        dpo: {
          title: "Contact Our Data Protection Officer",
          body: 'For any GDPR-related questions or to exercise your rights, please contact our Data Protection Officer at <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. We will respond to your request within 30 days as required by GDPR.'
        }
      },
      legalBases: {
        contract: {
          title: "Contract:",
          body: "Processing necessary for fulfilling our booking agreements and services."
        },
        legal: {
          title: "Legal Obligation:",
          body: "Processing required to comply with legal requirements (e.g., tax laws)."
        },
        legitimate: {
          title: "Legitimate Interests:",
          body: "Processing for our legitimate business interests while respecting your rights."
        },
        consent: {
          title: "Consent:",
          body: "Processing based on your explicit consent for specific purposes."
        }
      },
      rights: {
        access: {
          title: "Right to Access",
          body: "You can request copies of your personal data we hold."
        },
        rectification: {
          title: "Right to Rectification",
          body: "You can request correction of inaccurate or incomplete data."
        },
        erasure: {
          title: "Right to Erasure",
          body: "You can request deletion of your personal data under certain conditions."
        },
        restrict: {
          title: "Right to Restrict Processing",
          body: "You can request limitation of how we use your data."
        },
        portability: {
          title: "Right to Data Portability",
          body: "You can request transfer of your data to another organization."
        },
        object: {
          title: "Right to Object",
          body: "You can object to certain types of processing of your data."
        }
      },
      buttons: {
        access: {
          text: "Request Data Access"
        },
        erasure: {
          text: "Request Data Deletion"
        }
      },
      safeguards: {
        international: {
          title: "International Data Transfers:",
          body: "We ensure appropriate safeguards are in place for any data transfers outside the EEA, including Standard Contractual Clauses and adequacy decisions."
        }
      },
      authority: {
        lead: {
          title: "Lead Supervisory Authority:",
          name: "Portuguese Data Protection Authority (CNPD)",
          websiteLabel: "Website:",
          contactLabel: "Contact:"
        }
      }
    },

    cric: {
      title: "CRIC — Company & Contact",
      updatedDate: "27 Sep 2025",
      quickLinks: {
        title: "Quick Links",
        links: [
          { id: "intro", text: "Overview" },
          { id: "contact", text: "Contact" },
          { id: "emergency", text: "Emergency" }
        ]
      },
      sections: {
        badge: {
          title: "Official Company Information:",
          body: "Complete business registration details and contact information for DEVOCEAN Lodge."
        },
        intro: {
          title: "Overview",
          body: "Complete business registration details and contact information for DEVOCEAN Lodge."
        },
        contact: {
          title: "Contact",
          body: 'For general inquiries, bookings, and information about our services, please use the contact details provided below.'
        },
        emergency: {
          title: "Emergency Contact",
          body: "For urgent matters outside business hours, please use our emergency contact details."
        }
      },
      labels: {
        companyName: "Company Name",
        registration: "Commercial Registration",
        vat: "VAT Number (NUIT)",
        license: "Business License (Alvará)",
        legalForm: "Legal Form",
        capital: "Share Capital",
        address: "Registered Address",
        email: "Email",
        phone: "Phone",
        businessHours: "Business Hours",
        emergencyPhone: "Emergency Phone",
        emergencyEmail: "Emergency Email"
      },
      legalForm: "Limited Liability Company",
      businessHours: "Monday - Friday: 8:00 AM - 6:00 PM<br>Saturday & Sunday: 8:00 AM - 12:00 PM<br>Front Desk: 6:00 AM - 10:00 PM (for guests)",
      emergencyPhoneNote: "For urgent matters outside business hours"
    }
  };

  // -------- GERMAN --------
  window.LEGAL_DICT.de = {
    privacy: {
      title: "Datenschutzrichtlinie",
      updatedDate: "06 Okt 2025",      quickLinks: {
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
        badge: {
          title: "Ihr Datenschutz ist wichtig:",
          body: "Wir verpflichten uns, Ihre persönlichen Daten zu schützen und transparent darüber zu sein, wie wir sie erheben, verwenden und schützen."
        },
        who: {
          title: "Wer wir sind",
          body: "DEVOCEAN Lodge wird von TERRAfrique LDA betrieben, einem in Mosambik registrierten Unternehmen. Unsere registrierte Adresse ist Rua C, Parcela 12, Maputo 1118, Mosambik. Wir betreiben umweltfreundliche Strandunterkünfte in Ponta do Ouro, Mosambik. Wir verpflichten uns, Ihre Privatsphäre zu schützen und sicherzustellen, dass Ihre persönlichen Daten in Übereinstimmung mit den geltenden Datenschutzgesetzen ordnungsgemäß, rechtmäßig und transparent erhoben, verarbeitet und verwendet werden."
        },
        collect: {
          title: "Welche personenbezogenen Daten wir erheben",
          intro: "Wir erheben verschiedene Arten von Informationen, um unsere Dienstleistungen bereitzustellen und zu verbessern:",
          categories: [
            {
              title: "Persönliche Informationen",
              items: [
                "Name, Kontaktdaten",
                "Reisepass-/Ausweisinformationen",
                "Zahlungsinformationen",
                "Buchungspräferenzen"
              ]
            },
            {
              title: "Technische Daten",
              items: [
                "IP-Adresse, Geräteinformationen",
                "Browsertyp und -version",
                "Website-Nutzungsanalysen",
                "Cookie-Daten (mit Zustimmung)"
              ]
            },
            {
              title: "Kommunikationsdaten",
              items: [
                "E-Mail-Korrespondenz",
                "Kundendienstanfragen",
                "Feedback und Bewertungen",
                "Marketingpräferenzen"
              ]
            }
          ]
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
            "Verschlüsselung sensibler Daten bei der Übertragung und im Ruhezustand",
            "Regelmäßige Sicherheitsbewertungen und Penetrationstests",
            "Zugriffskontrollen und Authentifizierungsmechanismen",
            "Schulungen des Personals zum Datenschutz und zur Privatsphäre",
            "Sichere Datensicherung und Notfallwiederherstellungsverfahren"
          ]
        },
        retention: {
          title: "Datenaufbewahrung",
          body: "Wir bewahren Ihre persönlichen Daten so lange auf, wie es zur Erfüllung der Zwecke erforderlich ist, für die sie erhoben wurden, wie in dieser Datenschutzrichtlinie beschrieben. Im Allgemeinen bewahren wir personenbezogene Daten bis zu 1 Jahr nach Ihrer letzten Interaktion mit uns auf, es sei denn, eine längere Aufbewahrungsfrist ist gesetzlich vorgeschrieben oder zulässig. Wir müssen möglicherweise bestimmte Informationen aus bestimmten Gründen für längere Zeiträume aufbewahren, einschließlich: Aufzeichnung und Berichterstattung gemäß geltendem Recht (in der Regel 7 Jahre für Finanz- und Steuerunterlagen), Durchsetzung rechtlicher Rechte, Betrugsprävention und Streitbeilegung. Sobald die Aufbewahrungsfrist abläuft, werden Ihre persönlichen Daten sicher gelöscht oder anonymisiert. Verbleibende anonyme Informationen und aggregierte Informationen, die Sie nicht direkt oder indirekt identifizieren, können unbegrenzt für statistische und analytische Zwecke gespeichert werden."
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
          body: 'Bei Fragen, Bedenken oder Anfragen zu dieser Datenschutzrichtlinie oder der Verarbeitung Ihrer personenbezogenen Daten, oder wenn Sie eines Ihrer Datenschutzrechte ausüben möchten, kontaktieren Sie uns bitte unter:<br><br><strong>E-Mail:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefon:</strong> +258 8441 82252<br><strong>Postanschrift:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mosambik<br><br>Wir werden auf Ihre Anfrage gemäß dem geltenden Datenschutzrecht antworten. Bei Beschwerden oder Bedenken bezüglich der Verarbeitung Ihrer Informationen können Sie auch unseren Datenschutzbeauftragten unter der oben genannten E-Mail-Adresse kontaktieren.'
        },
        transfers: {
          title: "Internationale Datenübermittlungen",
          body: "Da wir in mehreren Gerichtsbarkeiten tätig sind, können Ihre Daten in Länder außerhalb Ihres Wohnsitzes übertragen und dort verarbeitet werden. Wir stellen sicher, dass solche Übermittlungen den geltenden Datenschutzgesetzen entsprechen durch Angemessenheitsbeschlüsse der Europäischen Kommission, Standardvertragsklauseln (SCCs), angemessene Sicherheitsvorkehrungen und Transparenz über Übertragungsorte."
        },
        updates: {
          title: "Richtlinien-Updates",
          body: "Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren, um Änderungen in unseren Praktiken, Technologien, rechtlichen Anforderungen oder anderen Faktoren widerzuspiegeln. Wir werden Sie über wesentliche Änderungen durch E-Mail-Benachrichtigungen für registrierte Benutzer, auffällige Hinweise auf unserer Website und ein aktualisiertes Datum der letzten Aktualisierung informieren. Wir empfehlen Ihnen, diese Richtlinie regelmäßig zu überprüfen, um darüber informiert zu bleiben, wie wir Ihre Informationen schützen."
        }
      }
    },

    terms: {
      title: "Allgemeine Geschäftsbedingungen",
      updatedDate: "06 Okt 2025",      quickLinks: {
        title: "Schnelllinks",
        links: [
          { id: "intro", text: "Geltungsbereich" },
          { id: "booking", text: "Buchungen" },
          { id: "payment", text: "Preise & Zahlung" },
          { id: "cancel", text: "Stornierung & Nichterscheinen" },
          { id: "conduct", text: "Gastverhalten" },
          { id: "force-majeure", text: "Höhere Gewalt" },
          { id: "liability", text: "Haftung" },
          { id: "intellectual-property", text: "Geistiges Eigentum" },
          { id: "disputes", text: "Streitbeilegung" },
          { id: "changes", text: "Änderungen" },
          { id: "law", text: "Anwendbares Recht" },
          { id: "contact", text: "Kontakt" }
        ]
      },
      sections: {
        badge: {
          title: "Wichtiger rechtlicher Hinweis:",
          body: "Diese Bedingungen regeln Ihre Nutzung unserer Dienstleistungen und Website. Bitte lesen Sie sie sorgfältig durch, bevor Sie eine Buchung vornehmen."
        },
        intro: {
          title: "Geltungsbereich",
          body: "Diese Bedingungen regeln die Unterbringung und damit verbundene Dienstleistungen, die von DEVOCEAN Lodge (TERRAfrique LDA) bereitgestellt werden. Mit der Buchung stimmen Sie diesen Bedingungen zu."
        },
        booking: {
          title: "Buchungen",
          items: [
            "Geben Sie genaue Gästeinformationen sowie An- und Abreisedaten an",
            "Sonderwünsche unterliegen der Verfügbarkeit und Bestätigung"
          ],
          reservationReq: {
            title: "Reservierungsanforderungen",
            body: "Gültiger Ausweis und Kreditkarte erforderlich für alle Buchungen. Mindestalter: 18 Jahre."
          },
          checkinCheckout: {
            title: "Check-in/Check-out",
            body: "Check-in: 14:00 Uhr | Check-out: 11:00 Uhr. Frühe/späte Anfragen vorbehaltlich Verfügbarkeit."
          },
          groupBookings: {
            title: "Gruppenbuchungen",
            body: "Spezielle Bedingungen gelten für Gruppen ab 6+ Zimmern. Kontaktieren Sie uns für Gruppentarife und -richtlinien."
          }
        },
        payment: {
          title: "Preise & Zahlung",
          items: [
            "Die angegebenen Preise gelten pro Einheit/Nacht, sofern nicht anders angegeben",
            "Anzahlungen und Zahlungsmethoden werden während der Buchung bestätigt"
          ],
          paymentInfo: {
            title: "Zahlungsinformationen",
            body: "Alle Preise sind in USD, sofern nicht anders angegeben. Währungsumrechnungskurse sind ungefähr und können sich ändern. Eine gültige Kreditkarte ist erforderlich, um Ihre Reservierung zu sichern. Zusätzliche Gebühren können für Nebenkosten anfallen."
          }
        },
        cancel: {
          title: "Stornierung & Nichterscheinen",
          body: "Die Stornierungsbedingungen werden zum Zeitpunkt der Buchung und in Ihrer Bestätigung offengelegt.",
          cancellationCharges: {
            title: "Stornierungsgebühren",
            plans: [
              {
                planName: "Halbflexibler Tarif:",
                tiers: [
                  { period: "30 Tage oder mehr vor Anreise", charge: "Vollständige Rückerstattung" },
                  { period: "29 Tage oder weniger vor Anreise", charge: "50% Stornierungsgebühr" }
                ]
              },
              {
                planName: "Nicht erstattungsfähiger Tarif:",
                tiers: [
                  { period: "Bis 24 Stunden nach der Reservierung", charge: "Vollständige Rückerstattung" },
                  { period: "In allen anderen Umständen", subtext: "Das Recht, das Anreisedatum einmal zu ändern, unter der Bedingung, den Preisunterschied zu zahlen, falls das neue Datum einen höheren Tarif hat.", charge: "Keine Rückerstattung", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "Nichterscheinungsrichtlinie",
            body: "Gäste, die am geplanten Check-in-Datum ohne vorherige Benachrichtigung nicht erscheinen, gelten als Nichterscheinung. Der volle Buchungsbetrag wird berechnet und die Reservierung wird storniert."
          }
        },
        conduct: {
          title: "Gastverhalten",
          items: [
            "Respektieren Sie die Hausordnung, das Personal, andere Gäste und die lokale Gemeinschaft",
            "Keine rechtswidrigen Aktivitäten auf dem Gelände"
          ],
          zeroTolerance: {
            title: "Null-Toleranz-Richtlinie",
            body: "Wir verfolgen eine Null-Toleranz-Richtlinie bei störendem Verhalten, illegalen Aktivitäten oder Sachbeschädigung. Verstöße können zu sofortiger Ausweisung ohne Rückerstattung führen und können rechtliche Schritte nach sich ziehen."
          }
        },

        "force-majeure": {
          title: "Höhere Gewalt",
          intro: "Wir haften nicht für die Nichterfüllung von Verpflichtungen aufgrund von Umständen, die außerhalb unserer angemessenen Kontrolle liegen, einschließlich, aber nicht beschränkt auf:",
          items: [
            "Naturkatastrophen, extreme Wetterbedingungen",
            "Regierungsbeschränkungen, Reiseverbote",
            "Bürgerunruhen, Krieg, Terrorismus",
            "Pandemien, Epidemien, Gesundheitsnotfälle",
            "Versorgungsausfälle, Infrastrukturausfälle"
          ],
          footer: "In solchen Fällen bieten wir nach Möglichkeit alternative Termine oder Gutscheine an. Rückerstattungen erfolgen gemäß den geltenden Gesetzen und Umständen. Allerdings sind alle Schäden und Kosten, die durch allgemein verfügbare Reiserücktritts- und Reiseversicherungen gedeckt sind oder hätten gedeckt werden können, von unserer Haftung ausgeschlossen."
        },
        liability: {
          title: "Haftung",
          body: "Soweit gesetzlich zulässig, haften wir nicht für indirekte oder unvorhersehbare Verluste."
        },

        "intellectual-property": {
          title: "Geistiges Eigentum",
          copyright: {
            title: "Urheberrechtshinweis",
            body: "Alle Inhalte auf dieser Website, einschließlich Text, Grafiken, Logos und Bilder, sind Eigentum von DEVOCEAN Lodge und durch internationale Urheberrechtsgesetze geschützt. Unbefugte Nutzung, Reproduktion oder Verbreitung ist verboten. Der Name DEVOCEAN Lodge, das Logo und alle zugehörigen Marken sind Warenzeichen und dürfen nicht ohne schriftliche Genehmigung verwendet werden."
          }
        },
        disputes: {
          title: "Streitbeilegung",
          process: {
            title: "Lösungsprozess",
            body: "Wir streben an, Streitigkeiten gütlich beizulegen. Bitte kontaktieren Sie uns zunächst, um eine Lösung zu versuchen. Wenn nicht gelöst, werden Streitigkeiten durch Mediation beigelegt, bevor rechtliche Schritte eingeleitet werden.",
            law: "Anwendbares Recht: Mosambikanisches Recht regelt diese Bedingungen und alle Streitigkeiten.",
            jurisdiction: "Gerichtsstand: Die Gerichte von Maputo, Mosambik haben ausschließliche Zuständigkeit.",
            mediation: "Mediation: Die Parteien verpflichten sich, vor Einleitung rechtlicher Schritte eine Mediation durch einen akkreditierten Mediator zu versuchen."
          }
        },
        changes: {
          title: "Änderungen dieser Bedingungen",
          body: "Wir können die Bedingungen von Zeit zu Zeit aktualisieren. Die veröffentlichte Version gilt für Ihren Aufenthalt."
        },
        law: {
          title: "Anwendbares Recht",
          body: "Es gilt mosambikanisches Recht, vorbehaltlich zwingender lokaler Verbraucherschutzbestimmungen."
        },
        contact: {
          title: "Kontakt",
          body: 'Fragen? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    cookies: {
      title: "Cookie-Richtlinie",
      effectiveDate: "19. September 2025",
      lastUpdated: "06. Oktober 2025",
      managePreferences: "Über Cookies:",
      manageText: "Sie können steuern, welche Cookies wir über unser Cookie-Banner oder Ihre Browsereinstellungen verwenden.",
      cookieSettingsBtn: "Cookie-Einstellungen",
      quickLinks: {
        title: "Schnellzugriff",
        links: [
          { id: "what", text: "Was sind Cookies" },
          { id: "how", text: "Wie wir Cookies verwenden" },
          { id: "necessary", text: "Notwendig" },
          { id: "functional", text: "Funktional" },
          { id: "analytics", text: "Analytisch" },
          { id: "advertisement", text: "Werbung" },
          { id: "manage", text: "Einstellungen verwalten" }
        ]
      },
      sections: {
        badge: {
          title: "Über Cookies",
          body: "Sie können steuern, welche Cookies wir verwenden, über unser Cookie-Banner oder Ihre Browser-Einstellungen."
        },
        what: {
          title: "Was sind Cookies?",
          body: "Diese Cookie-Richtlinie erklärt, was Cookies sind, wie wir sie verwenden, welche Arten von Cookies wir verwenden (d.h. welche Informationen wir mithilfe von Cookies sammeln und wie diese Informationen verwendet werden) und wie Sie Ihre Cookie-Einstellungen verwalten können.<br><br>Cookies sind kleine Textdateien, die verwendet werden, um kleine Informationen zu speichern. Sie werden auf Ihrem Gerät gespeichert, wenn eine Website in Ihrem Browser geladen wird. Diese Cookies helfen sicherzustellen, dass die Website ordnungsgemäß funktioniert, die Sicherheit zu erhöhen, eine bessere Benutzererfahrung zu bieten und die Leistung zu analysieren, um zu ermitteln, was funktioniert und wo Verbesserungen erforderlich sind."
        },
        how: {
          title: "Wie verwenden wir Cookies?",
          body: "Wie die meisten Online-Dienste verwendet unsere Website sowohl Erst- als auch Drittanbieter-Cookies für verschiedene Zwecke. Erstanbieter-Cookies sind in erster Linie erforderlich, damit die Website ordnungsgemäß funktioniert, und sammeln keine personenbezogenen Daten.<br><br>Die auf unserer Website verwendeten Drittanbieter-Cookies helfen uns in erster Linie zu verstehen, wie die Website funktioniert, wie Sie mit ihr interagieren, unsere Dienste sicher zu halten, relevante Werbung zu liefern und Ihre allgemeine Benutzererfahrung zu verbessern, während die Geschwindigkeit Ihrer zukünftigen Interaktionen mit unserer Website verbessert wird."
        },
        necessary: {
          title: "Notwendige Cookies",
          description: "Notwendige Cookies sind erforderlich, um die grundlegenden Funktionen dieser Website zu aktivieren, z.B. um eine sichere Anmeldung zu ermöglichen oder Ihre Zustimmungseinstellungen anzupassen. Diese Cookies speichern keine personenbezogenen Daten.",
          tableHeaders: { cookie: "Cookie", duration: "Dauer", description: "Beschreibung" },
          cookies: [
            { name: "currency", duration: "Sitzung", desc: "Dieses Cookie wird verwendet, um die Währungspräferenz des Benutzers zu speichern." },
            { name: "_sh_session_", duration: "Sitzung", desc: "Beschreibung ist derzeit nicht verfügbar." },
            { name: "loccur", duration: "Sitzung", desc: "Beschreibung ist derzeit nicht verfügbar." },
            { name: "country_code", duration: "Sitzung", desc: "Keine Beschreibung verfügbar." },
            { name: "b_locale", duration: "Sitzung", desc: "Beschreibung ist derzeit nicht verfügbar." },
            { name: "checkout_currency", duration: "Sitzung", desc: "Beschreibung ist derzeit nicht verfügbar." }
          ]
        },
        functional: {
          title: "Funktionale Cookies",
          description: "Funktionale Cookies helfen bei der Ausführung bestimmter Funktionen, wie z.B. dem Teilen von Inhalten der Website auf Social-Media-Plattformen, dem Sammeln von Feedback und anderen Drittanbieterfunktionen.",
          tableHeaders: { cookie: "Cookie", duration: "Dauer", description: "Beschreibung" },
          cookies: [
            { name: "locale", duration: "Sitzung", desc: "Facebook setzt dieses Cookie, um das Surferlebnis des Benutzers auf der Website zu verbessern und dem Benutzer relevante Werbung anzuzeigen, während er die Social-Media-Plattformen von Facebook nutzt." }
          ]
        },
        analytics: {
          title: "Analytische Cookies",
          description: "Analytische Cookies werden verwendet, um zu verstehen, wie Besucher mit der Website interagieren. Diese Cookies helfen dabei, Informationen zu Metriken wie Anzahl der Besucher, Absprungrate, Traffic-Quelle usw. bereitzustellen.",
          tableHeaders: { cookie: "Cookie", duration: "Dauer", description: "Beschreibung" },
          cookies: [
            { name: "_ga", duration: "1 Jahr 1 Monat 4 Tage", desc: "Google Analytics setzt dieses Cookie, um Besucher-, Sitzungs- und Kampagnendaten zu berechnen und die Websitenutzung für den Analysebericht der Website zu verfolgen. Das Cookie speichert Informationen anonym und weist eine zufällig generierte Nummer zu, um eindeutige Besucher zu erkennen." },
            { name: "_ga_*", duration: "1 Jahr 1 Monat 4 Tage", desc: "Google Analytics setzt dieses Cookie, um Seitenaufrufe zu speichern und zu zählen." },
            { name: "_gid", duration: "1 Tag", desc: "Google Analytics setzt dieses Cookie, um Informationen darüber zu speichern, wie Besucher eine Website nutzen, und erstellt gleichzeitig einen Analysebericht über die Leistung der Website. Einige der gesammelten Daten umfassen die Anzahl der Besucher, deren Quelle und die Seiten, die sie anonym besuchen." },
            { name: "_gat_UA-*", duration: "1 Minute", desc: "Google Analytics setzt dieses Cookie für die Verfolgung des Benutzerverhaltens." },
            { name: "pardot", duration: "Vergangenheit", desc: "Das Pardot-Cookie wird gesetzt, während der Besucher als Pardot-Benutzer angemeldet ist. Das Cookie zeigt eine aktive Sitzung an und wird nicht für Tracking verwendet." }
          ]
        },
        advertisement: {
          title: "Werbe-Cookies",
          description: "Werbe-Cookies werden verwendet, um Besuchern maßgeschneiderte Werbung basierend auf den zuvor besuchten Seiten bereitzustellen und die Wirksamkeit der Werbekampagnen zu analysieren.",
          tableHeaders: { cookie: "Cookie", duration: "Dauer", description: "Beschreibung" },
          cookies: [
            { name: "_gcl_au", duration: "3 Monate", desc: "Google Tag Manager setzt dieses Cookie, um die Werbeeffizienz von Websites zu testen, die ihre Dienste nutzen." },
            { name: "test_cookie", duration: "15 Minuten", desc: "doubleclick.net setzt dieses Cookie, um festzustellen, ob der Browser des Benutzers Cookies unterstützt." },
            { name: "_fbp", duration: "3 Monate", desc: "Facebook setzt dieses Cookie, um Interaktionen zu speichern und zu verfolgen." },
            { name: "IDE", duration: "1 Jahr 24 Tage", desc: "Google DoubleClick IDE-Cookies speichern Informationen darüber, wie der Benutzer die Website nutzt, um ihm relevante Anzeigen gemäß dem Benutzerprofil zu präsentieren." }
          ]
        },
        manage: {
          title: "Cookie-Einstellungen verwalten",
          consentTitle: "Zustimmungspräferenzen",
          consentText: "Sie können Ihre Cookie-Einstellungen jederzeit ändern, indem Sie auf die Schaltfläche 'Zustimmungspräferenzen' oben klicken. Dadurch können Sie das Cookie-Zustimmungsbanner erneut aufrufen und Ihre Präferenzen aktualisieren oder Ihre Zustimmung sofort widerrufen.",
          browserText: "Darüber hinaus bieten verschiedene Browser verschiedene Methoden zum Blockieren und Löschen von Cookies, die von Websites verwendet werden. Sie können Ihre Browsereinstellungen anpassen, um Cookies zu blockieren oder zu löschen. Nachfolgend finden Sie Links zu Support-Dokumenten zum Verwalten und Löschen von Cookies in gängigen Webbrowsern.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Wenn Sie einen anderen Webbrowser verwenden, lesen Sie bitte die offizielle Support-Dokumentation."
          }
        }
      }
    },

    gdpr: {
      title: "DSGVO-Hinweis",
      updatedDate: "06 Okt 2025",
      quickLinks: {
        title: "Schnelllinks",
        links: [
          { id: "controller", text: "Verantwortlicher" },
          { id: "bases", text: "Rechtsgrundlagen" },
          { id: "rights", text: "Ihre Rechte" },
          { id: "retention", text: "Datenspeicherung" },
          { id: "transfers", text: "Datenübermittlungen" },
          { id: "complaints", text: "Beschwerden" }
        ]
      },
      sections: {
        badge: {
          title: "DSGVO-konform:",
          body: "Wir verpflichten uns, Ihre personenbezogenen Daten zu schützen und Ihre Datenschutzrechte gemäß der Datenschutz-Grundverordnung zu respektieren."
        },
        controller: {
          title: "Datenverantwortlicher",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), eingetragen unter Rua C, Parcela 12, Maputo 1118, Mosambik, fungiert als Datenverantwortlicher für Ihre personenbezogenen Daten, die über unsere Dienste erhoben werden."
        },
        bases: {
          title: "Rechtsgrundlagen für die Verarbeitung",
          body: "Wir verarbeiten Ihre personenbezogenen Daten auf Grundlage folgender Rechtsgrundlagen gemäß DSGVO:"
        },
        rights: {
          title: "Ihre DSGVO-Rechte",
          body: "Als betroffene Person gemäß DSGVO haben Sie folgende Rechte in Bezug auf Ihre personenbezogenen Daten:"
        },
        retention: {
          title: "Datenspeicherung",
          periodsTitle: "Aufbewahrungsfristen",
          intro: "Wir speichern personenbezogene Daten nur so lange, wie es zur Erfüllung der Zwecke erforderlich ist, für die sie erhoben wurden, einschließlich rechtlicher, buchhalterischer oder Berichtspflichten.",
          items: [
            "<strong>Buchungsdaten:</strong> 7 Jahre für steuerliche und rechtliche Compliance",
            "<strong>Kundendienst-Kommunikation:</strong> 3 Jahre",
            "<strong>Marketing-Einwilligungen:</strong> Bis zum Widerruf der Einwilligung",
            "<strong>Website-Analysen:</strong> 26 Monate",
            "<strong>Finanztransaktionen:</strong> 10 Jahre für Buchhaltungszwecke"
          ]
        },
        transfers: {
          title: "Internationale Datenübermittlungen",
          body: "Wenn wir Ihre Daten außerhalb des Europäischen Wirtschaftsraums (EWR) übermitteln, stellen wir sicher, dass angemessene Schutzmaßnahmen zum Schutz Ihrer Informationen vorhanden sind. Dies kann die Verwendung von Standardvertragsklauseln umfassen, die von der Europäischen Kommission genehmigt wurden, oder die Übermittlung von Daten in Länder mit Angemessenheitsbeschlüssen."
        },
        complaints: {
          title: "Beschwerden",
          intro: "Wenn Sie Bedenken hinsichtlich der Handhabung Ihrer personenbezogenen Daten haben, haben Sie das Recht, eine Beschwerde bei Ihrer örtlichen Datenschutzbehörde einzureichen.",
          footer: "Wir ermutigen Sie, uns zuerst zu kontaktieren, um Bedenken zu klären, bevor Sie sich an die Aufsichtsbehörde wenden."
        },
        dpo: {
          title: "Kontaktieren Sie unseren Datenschutzbeauftragten",
          body: 'Für alle DSGVO-bezogenen Fragen oder zur Ausübung Ihrer Rechte wenden Sie sich bitte an unseren Datenschutzbeauftragten unter <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Wir werden auf Ihre Anfrage innerhalb von 30 Tagen antworten, wie von der DSGVO vorgeschrieben.'
        }
      },
      legalBases: {
        contract: {
          title: "Vertrag:",
          body: "Verarbeitung erforderlich zur Erfüllung unserer Buchungsvereinbarungen und Dienstleistungen."
        },
        legal: {
          title: "Rechtliche Verpflichtung:",
          body: "Verarbeitung erforderlich zur Einhaltung gesetzlicher Anforderungen (z.B. Steuergesetze)."
        },
        legitimate: {
          title: "Berechtigte Interessen:",
          body: "Verarbeitung für unsere berechtigten Geschäftsinteressen unter Wahrung Ihrer Rechte."
        },
        consent: {
          title: "Einwilligung:",
          body: "Verarbeitung basierend auf Ihrer ausdrücklichen Einwilligung für bestimmte Zwecke."
        }
      },
      rights: {
        access: {
          title: "Auskunftsrecht",
          body: "Sie können Kopien Ihrer von uns gespeicherten personenbezogenen Daten anfordern."
        },
        rectification: {
          title: "Recht auf Berichtigung",
          body: "Sie können die Korrektur ungenauer oder unvollständiger Daten verlangen."
        },
        erasure: {
          title: "Recht auf Löschung",
          body: "Sie können unter bestimmten Bedingungen die Löschung Ihrer personenbezogenen Daten verlangen."
        },
        restrict: {
          title: "Recht auf Einschränkung der Verarbeitung",
          body: "Sie können die Einschränkung der Verwendung Ihrer Daten verlangen."
        },
        portability: {
          title: "Recht auf Datenübertragbarkeit",
          body: "Sie können die Übertragung Ihrer Daten an eine andere Organisation verlangen."
        },
        object: {
          title: "Widerspruchsrecht",
          body: "Sie können gegen bestimmte Arten der Verarbeitung Ihrer Daten Widerspruch einlegen."
        }
      },
      buttons: {
        access: {
          text: "Datenzugriff anfordern"
        },
        erasure: {
          text: "Datenlöschung anfordern"
        }
      },
      safeguards: {
        international: {
          title: "Internationale Datenübermittlungen:",
          body: "Wir stellen sicher, dass für alle Datenübermittlungen außerhalb des EWR angemessene Schutzmaßnahmen vorhanden sind, einschließlich Standardvertragsklauseln und Angemessenheitsbeschlüsse."
        }
      },
      authority: {
        lead: {
          title: "Federführende Aufsichtsbehörde:",
          name: "Portugiesische Datenschutzbehörde (CNPD)",
          websiteLabel: "Website:",
          contactLabel: "Kontakt:"
        }
      }
    },

    cric: {
      title: "CRIC — Unternehmen & Kontakt",
      updatedDate: "27 Sep 2025",
      quickLinks: {
        title: "Schnelllinks",
        links: [
          { id: "intro", text: "Überblick" },
          { id: "contact", text: "Kontakt" },
          { id: "emergency", text: "Notfall" }
        ]
      },
      sections: {
        badge: {
          title: "Offizielle Firmeninformationen:",
          body: "Vollständige Firmenregistrierungsdaten und Kontaktinformationen für DEVOCEAN Lodge."
        },
        intro: {
          title: "Überblick",
          body: "Vollständige Firmenregistrierungsdaten und Kontaktinformationen für DEVOCEAN Lodge."
        },
        contact: {
          title: "Kontakt",
          body: 'Für allgemeine Anfragen, Buchungen und Informationen zu unseren Dienstleistungen verwenden Sie bitte die unten angegebenen Kontaktdaten.'
        },
        emergency: {
          title: "Notkontakt",
          body: "Für dringende Angelegenheiten außerhalb der Geschäftszeiten verwenden Sie bitte unsere Notkontaktdaten."
        }
      },
      labels: {
        companyName: "Firmenname",
        registration: "Handelsregistereintrag",
        vat: "Umsatzsteuer-ID (NUIT)",
        license: "Gewerbeerlaubnis (Alvará)",
        legalForm: "Rechtsform",
        capital: "Stammkapital",
        address: "Geschäftsadresse",
        email: "E-Mail",
        phone: "Telefon",
        businessHours: "Geschäftszeiten",
        emergencyPhone: "Notrufnummer",
        emergencyEmail: "Not-E-Mail"
      },
      legalForm: "Gesellschaft mit beschränkter Haftung",
      businessHours: "Montag - Freitag: 8:00 - 18:00 Uhr<br>Samstag & Sonntag: 8:00 - 12:00 Uhr<br>Rezeption: 6:00 - 22:00 Uhr (für Gäste)",
      emergencyPhoneNote: "Für dringende Angelegenheiten außerhalb der Geschäftszeiten"
    }
  };

  // -------- DUTCH --------
  window.LEGAL_DICT.nl = {
    privacy: {
      title: "Privacybeleid",
      updatedDate: "06 okt 2025",      quickLinks: {
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
        badge: {
          title: "Uw privacy is belangrijk:",
          body: "Wij zijn toegewijd aan het beschermen van uw persoonlijke gegevens en transparant te zijn over hoe we deze verzamelen, gebruiken en beschermen."
        },
        who: {
          title: "Wie we zijn",
          body: "DEVOCEAN Lodge wordt geëxploiteerd door TERRAfrique LDA, een bedrijf geregistreerd in Mozambique. Ons geregistreerde adres is Rua C, Parcela 12, Maputo 1118, Mozambique. We exploiteren milieuvriendelijke strandaccommodaties in Ponta do Ouro, Mozambique. We zijn toegewijd aan het beschermen van uw privacy en zorgen ervoor dat uw persoonlijke gegevens op de juiste, wettige en transparante manier worden verzameld, verwerkt en gebruikt in overeenstemming met de geldende wetgeving inzake gegevensbescherming."
        },
        collect: {
          title: "Welke persoonlijke gegevens we verzamelen",
          intro: "We verzamelen verschillende soorten informatie om onze diensten te leveren en te verbeteren:",
          categories: [
            {
              title: "Persoonlijke informatie",
              items: [
                "Naam, contactgegevens",
                "Paspoort-/ID-informatie",
                "Betalingsinformatie",
                "Boekingsvoorkeuren"
              ]
            },
            {
              title: "Technische gegevens",
              items: [
                "IP-adres, apparaatinformatie",
                "Browsertype en -versie",
                "Website-gebruiksanalyses",
                "Cookiegegevens (met toestemming)"
              ]
            },
            {
              title: "Communicatiegegevens",
              items: [
                "E-mailcorrespondentie",
                "Klantenserviceverzoeken",
                "Feedback en beoordelingen",
                "Marketingvoorkeuren"
              ]
            }
          ]
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
            "Versleuteling van gevoelige gegevens tijdens verzending en in rust",
            "Regelmatige beveiligingsbeoordelingen en penetratietests",
            "Toegangscontroles en authenticatiemechanismen",
            "Training van personeel in gegevensbescherming en privacy",
            "Veilige gegevensback-up en noodherstelprocedures"
          ]
        },
        retention: {
          title: "Gegevensbewaring",
          body: "We bewaren uw persoonlijke informatie zo lang als nodig is om de doeleinden te vervullen waarvoor deze werd verzameld, zoals beschreven in dit privacybeleid. Over het algemeen bewaren we persoonlijke gegevens tot 1 jaar na uw laatste interactie met ons, tenzij een langere bewaartermijn wettelijk vereist of toegestaan is. We kunnen bepaalde informatie voor langere perioden moeten bewaren om specifieke redenen, waaronder: registratie en rapportage in overeenstemming met de toepasselijke wetgeving (doorgaans 7 jaar voor financiële en fiscale gegevens), handhaving van juridische rechten, fraudepreventie en geschillenbeslechting. Zodra de bewaartermijn is verstreken, worden uw persoonlijke gegevens veilig verwijderd of geanonimiseerd. Resterende anonieme informatie en geaggregeerde informatie, die u niet direct of indirect identificeert, kan onbeperkt worden bewaard voor statistische en analytische doeleinden."
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
          body: 'Als u vragen, zorgen of verzoeken heeft met betrekking tot dit privacybeleid of de verwerking van uw persoonlijke informatie, of als u een van uw privacyrechten wilt uitoefenen, neem dan contact met ons op via:<br><br><strong>E-mail:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefoon:</strong> +258 8441 82252<br><strong>Postadres:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique<br><br>We zullen op uw verzoek reageren in overeenstemming met de toepasselijke wetgeving inzake gegevensbescherming. Voor klachten of zorgen over de verwerking van uw informatie kunt u ook contact opnemen met onze functionaris voor gegevensbescherming op het bovenstaande e-mailadres.'
        },
        transfers: {
          title: "Internationale gegevensoverdrachten",
          body: "Omdat we in meerdere rechtsgebieden opereren, kunnen uw gegevens worden overgedragen naar en verwerkt in landen buiten uw woonplaats. We zorgen ervoor dat dergelijke overdrachten voldoen aan de toepasselijke wetgeving inzake gegevensbescherming door adequaatheidsbeslissingen van de Europese Commissie, standaard contractuele clausules (SCC's), passende beveiligingsmaatregelen en transparantie over overdrachtslocaties."
        },
        updates: {
          title: "Beleidsupdates",
          body: "We kunnen dit privacybeleid van tijd tot tijd bijwerken om veranderingen in onze praktijken, technologie, wettelijke vereisten of andere factoren weer te geven. We zullen u op de hoogte stellen van wezenlijke wijzigingen via e-mailmeldingen voor geregistreerde gebruikers, prominente kennisgevingen op onze website en een bijgewerkte datum van 'laatst bijgewerkt'. We moedigen u aan om dit beleid regelmatig te bekijken om op de hoogte te blijven van hoe we uw informatie beschermen."
        }
      }
    },

    terms: {
      title: "Algemene voorwaarden",
      updatedDate: "06 okt 2025",      quickLinks: {
        title: "Snelkoppelingen",
        links: [
          { id: "intro", text: "Toepassingsgebied" },
          { id: "booking", text: "Boekingen" },
          { id: "payment", text: "Prijzen & Betaling" },
          { id: "cancel", text: "Annuleringen & No-shows" },
          { id: "conduct", text: "Gastgedrag" },
          { id: "force-majeure", text: "Overmacht" },
          { id: "liability", text: "Aansprakelijkheid" },
          { id: "intellectual-property", text: "Intellectueel eigendom" },
          { id: "disputes", text: "Geschillenbeslechting" },
          { id: "changes", text: "Wijzigingen" },
          { id: "law", text: "Toepasselijk recht" },
          { id: "contact", text: "Contact" }
        ]
      },
      sections: {
        badge: {
          title: "Belangrijke juridische mededeling:",
          body: "Deze voorwaarden regelen uw gebruik van onze diensten en website. Lees ze zorgvuldig door voordat u een boeking maakt."
        },
        intro: {
          title: "Toepassingsgebied",
          body: "Deze voorwaarden regelen accommodatie en gerelateerde diensten die worden geleverd door DEVOCEAN Lodge (TERRAfrique LDA). Door te boeken, gaat u akkoord met deze voorwaarden."
        },
        booking: {
          title: "Boekingen",
          items: [
            "Verstrek nauwkeurige gastinformatie en aankomst-/vertrekdata",
            "Speciale verzoeken zijn afhankelijk van beschikbaarheid en bevestiging"
          ],
          reservationReq: {
            title: "Reserveringsvereisten",
            body: "Geldig ID en creditcard vereist voor alle boekingen. Minimumleeftijd: 18 jaar."
          },
          checkinCheckout: {
            title: "Inchecken/Uitchecken",
            body: "Inchecken: 14:00 uur | Uitchecken: 11:00 uur. Vroege/late verzoeken afhankelijk van beschikbaarheid."
          },
          groupBookings: {
            title: "Groepsboekingen",
            body: "Speciale voorwaarden zijn van toepassing op groepen van 6+ kamers. Neem contact met ons op voor groepstarieven en beleid."
          }
        },
        payment: {
          title: "Prijzen & Betaling",
          items: [
            "Getoonde prijzen zijn per eenheid/nacht tenzij anders vermeld",
            "Aanbetaling en betaalmethoden worden tijdens de boeking bevestigd"
          ],
          paymentInfo: {
            title: "Betalingsinformatie",
            body: "Alle prijzen zijn in USD tenzij anders vermeld. Valutawisselkoersen zijn bij benadering en kunnen wijzigen. Een geldige creditcard is vereist om uw reservering te garanderen. Extra kosten kunnen van toepassing zijn voor bijkomende kosten."
          }
        },
        cancel: {
          title: "Annuleringen & No-shows",
          body: "Annuleringsvoorwaarden worden bekendgemaakt tijdens het boeken en in uw bevestiging.",
          cancellationCharges: {
            title: "Annuleringskosten",
            plans: [
              {
                planName: "Semi-flexibel tarief:",
                tiers: [
                  { period: "30 dagen of meer voor aankomst", charge: "Volledige terugbetaling" },
                  { period: "29 dagen of minder voor aankomst", charge: "50% annuleringskosten" }
                ]
              },
              {
                planName: "Niet-restitueerbaar tarief:",
                tiers: [
                  { period: "Tot 24 uur na reservering", charge: "Volledige terugbetaling" },
                  { period: "In alle andere omstandigheden", subtext: "Het recht om de aankomstdatum eenmaal te wijzigen onder de voorwaarde het verschil te betalen als de nieuwe datum een hoger tarief heeft.", charge: "Geen terugbetaling", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "No-show beleid",
            body: "Gasten die niet arriveren op de geplande incheckdatum zonder voorafgaande kennisgeving worden beschouwd als no-shows. Het volledige boekingsbedrag wordt in rekening gebracht en de reservering wordt geannuleerd."
          }
        },
        conduct: {
          title: "Gastgedrag",
          items: [
            "Respecteer de regels van de accommodatie, personeel, andere gasten en de lokale gemeenschap",
            "Geen onwettige activiteiten op het terrein"
          ],
          zeroTolerance: {
            title: "Nultolerantiebeleid",
            body: "We hanteren een nultolerantiebeleid voor storend gedrag, illegale activiteiten of schade aan eigendommen. Overtredingen kunnen leiden tot onmiddellijke uitzetting zonder terugbetaling en kunnen leiden tot juridische stappen."
          }
        },

        "force-majeure": {
          title: "Overmacht",
          intro: "Wij zijn niet aansprakelijk voor het niet nakomen van verplichtingen als gevolg van omstandigheden buiten onze redelijke controle, waaronder maar niet beperkt tot:",
          items: [
            "Natuurrampen, extreme weersomstandigheden",
            "Overheidsbeperkingen, reisverboden",
            "Burgerlijke onrust, oorlog, terrorisme",
            "Pandemieën, epidemieën, gezondheidsnoodgevallen",
            "Storingen in nutsvoorzieningen, infrastructuurdefecten"
          ],
          footer: "In dergelijke gevallen bieden we waar mogelijk alternatieve data of tegoedbonnen aan. Terugbetalingen worden verstrekt volgens toepasselijke wetten en omstandigheden. Echter zijn alle schades en kosten die gedekt zijn of hadden kunnen worden gedekt door algemeen beschikbare annulerings- en reisverzekeringspakketten uitgesloten van onze aansprakelijkheid."
        },
        liability: {
          title: "Aansprakelijkheid",
          body: "Voor zover wettelijk toegestaan, zijn wij niet aansprakelijk voor indirecte of onvoorziene verliezen."
        },

        "intellectual-property": {
          title: "Intellectueel eigendom",
          copyright: {
            title: "Auteursrechtverklaring",
            body: "Alle inhoud op deze website, inclusief tekst, afbeeldingen, logo's en beelden, is eigendom van DEVOCEAN Lodge en beschermd door internationale auteursrechtwetten. Ongeautoriseerd gebruik, reproductie of distributie is verboden. De naam DEVOCEAN Lodge, het logo en alle gerelateerde merken zijn handelsmerken en mogen niet worden gebruikt zonder schriftelijke toestemming."
          }
        },
        disputes: {
          title: "Geschillenbeslechting",
          process: {
            title: "Oplossingsproces",
            body: "We streven ernaar geschillen minnelijk op te lossen. Neem eerst contact met ons op om tot een oplossing te komen. Indien onopgelost, worden geschillen beslecht via bemiddeling voordat juridische stappen worden ondernomen.",
            law: "Toepasselijk recht: Mozambikaans recht is van toepassing op deze voorwaarden en eventuele geschillen.",
            jurisdiction: "Jurisdictie: De rechtbanken van Maputo, Mozambique hebben exclusieve jurisdictie.",
            mediation: "Bemiddeling: Partijen komen overeen om bemiddeling via een geaccrediteerde bemiddelaar te proberen voordat juridische procedures worden gestart."
          }
        },
        changes: {
          title: "Wijzigingen in deze voorwaarden",
          body: "We kunnen de voorwaarden van tijd tot tijd bijwerken. De gepubliceerde versie is van toepassing op uw verblijf."
        },
        law: {
          title: "Toepasselijk recht",
          body: "Mozambikaans recht is van toepassing, met inachtneming van verplichte lokale consumentenregels."
        },
        contact: {
          title: "Contact",
          body: 'Vragen? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    cookies: {
      title: "Cookiebeleid",
      effectiveDate: "19 september 2025",
      lastUpdated: "06 oktober 2025",
      managePreferences: "Over cookies:",
      manageText: "U kunt bepalen welke cookies we gebruiken via onze cookiebanner of uw browserinstellingen.",
      cookieSettingsBtn: "Cookie-instellingen",
      quickLinks: {
        title: "Snelkoppelingen",
        links: [
          { id: "what", text: "Wat zijn cookies" },
          { id: "how", text: "Hoe we cookies gebruiken" },
          { id: "necessary", text: "Noodzakelijk" },
          { id: "functional", text: "Functioneel" },
          { id: "analytics", text: "Analytisch" },
          { id: "advertisement", text: "Advertenties" },
          { id: "manage", text: "Voorkeuren beheren" }
        ]
      },
      sections: {
        badge: {
          title: "Over cookies",
          body: "U kunt bepalen welke cookies we gebruiken via onze cookiebanner of uw browserinstellingen."
        },
        what: {
          title: "Wat zijn cookies?",
          body: "Dit cookiebeleid legt uit wat cookies zijn, hoe we ze gebruiken, welke soorten cookies we gebruiken (d.w.z. welke informatie we verzamelen met behulp van cookies en hoe die informatie wordt gebruikt) en hoe u uw cookie-instellingen kunt beheren.<br><br>Cookies zijn kleine tekstbestanden die worden gebruikt om kleine stukjes informatie op te slaan. Ze worden op uw apparaat opgeslagen wanneer een website in uw browser wordt geladen. Deze cookies helpen ervoor te zorgen dat de website goed werkt, de beveiliging te verbeteren, een betere gebruikerservaring te bieden en de prestaties te analyseren om te bepalen wat werkt en waar verbeteringen nodig zijn."
        },
        how: {
          title: "Hoe gebruiken we cookies?",
          body: "Net als de meeste online diensten gebruikt onze website zowel first-party als third-party cookies voor verschillende doeleinden. First-party cookies zijn voornamelijk nodig om de website goed te laten werken en verzamelen geen persoonlijk identificeerbare gegevens.<br><br>De third-party cookies die op onze website worden gebruikt, helpen ons voornamelijk te begrijpen hoe de website presteert, hoe u ermee omgaat, onze diensten veilig te houden, relevante advertenties te leveren en uw algemene gebruikerservaring te verbeteren terwijl de snelheid van uw toekomstige interacties met onze website wordt verbeterd."
        },
        necessary: {
          title: "Noodzakelijke cookies",
          description: "Noodzakelijke cookies zijn vereist om de basisfuncties van deze site mogelijk te maken, zoals het bieden van veilige inlogmogelijkheden of het aanpassen van uw toestemmingsvoorkeuren. Deze cookies slaan geen persoonlijk identificeerbare gegevens op.",
          tableHeaders: { cookie: "Cookie", duration: "Duur", description: "Beschrijving" },
          cookies: [
            { name: "currency", duration: "sessie", desc: "Deze cookie wordt gebruikt om de valutavoorkeur van de gebruiker op te slaan." },
            { name: "_sh_session_", duration: "sessie", desc: "Beschrijving is momenteel niet beschikbaar." },
            { name: "loccur", duration: "sessie", desc: "Beschrijving is momenteel niet beschikbaar." },
            { name: "country_code", duration: "sessie", desc: "Geen beschrijving beschikbaar." },
            { name: "b_locale", duration: "sessie", desc: "Beschrijving is momenteel niet beschikbaar." },
            { name: "checkout_currency", duration: "sessie", desc: "Beschrijving is momenteel niet beschikbaar." }
          ]
        },
        functional: {
          title: "Functionele cookies",
          description: "Functionele cookies helpen bij het uitvoeren van bepaalde functionaliteiten, zoals het delen van de inhoud van de website op sociale mediaplatforms, het verzamelen van feedback en andere functies van derden.",
          tableHeaders: { cookie: "Cookie", duration: "Duur", description: "Beschrijving" },
          cookies: [
            { name: "locale", duration: "sessie", desc: "Facebook plaatst deze cookie om de browse-ervaring van de gebruiker op de website te verbeteren en om de gebruiker relevante advertenties te bieden tijdens het gebruik van de sociale mediaplatforms van Facebook." }
          ]
        },
        analytics: {
          title: "Analytische cookies",
          description: "Analytische cookies worden gebruikt om te begrijpen hoe bezoekers omgaan met de website. Deze cookies helpen informatie te verstrekken over statistieken zoals het aantal bezoekers, bouncepercentage, verkeersbron, enz.",
          tableHeaders: { cookie: "Cookie", duration: "Duur", description: "Beschrijving" },
          cookies: [
            { name: "_ga", duration: "1 jaar 1 maand 4 dagen", desc: "Google Analytics plaatst deze cookie om bezoeker-, sessie- en campagnegegevens te berekenen en het sitegebruik bij te houden voor het analyserapport van de site. De cookie slaat informatie anoniem op en wijst een willekeurig gegenereerd nummer toe om unieke bezoekers te herkennen." },
            { name: "_ga_*", duration: "1 jaar 1 maand 4 dagen", desc: "Google Analytics plaatst deze cookie om paginaweergaven op te slaan en te tellen." },
            { name: "_gid", duration: "1 dag", desc: "Google Analytics plaatst deze cookie om informatie op te slaan over hoe bezoekers een website gebruiken en creëert tegelijkertijd een analyserapport van de prestaties van de website. Sommige van de verzamelde gegevens omvatten het aantal bezoekers, hun bron en de pagina's die ze anoniem bezoeken." },
            { name: "_gat_UA-*", duration: "1 minuut", desc: "Google Analytics plaatst deze cookie voor het bijhouden van gebruikersgedrag." },
            { name: "pardot", duration: "verleden", desc: "De pardot-cookie wordt ingesteld terwijl de bezoeker is ingelogd als een Pardot-gebruiker. De cookie geeft een actieve sessie aan en wordt niet gebruikt voor tracking." }
          ]
        },
        advertisement: {
          title: "Advertentiecookies",
          description: "Advertentiecookies worden gebruikt om bezoekers aangepaste advertenties te bieden op basis van de pagina's die u eerder heeft bezocht en om de effectiviteit van de advertentiecampagnes te analyseren.",
          tableHeaders: { cookie: "Cookie", duration: "Duur", description: "Beschrijving" },
          cookies: [
            { name: "_gcl_au", duration: "3 maanden", desc: "Google Tag Manager plaatst deze cookie om de advertentie-efficiëntie van websites die hun diensten gebruiken te testen." },
            { name: "test_cookie", duration: "15 minuten", desc: "doubleclick.net plaatst deze cookie om te bepalen of de browser van de gebruiker cookies ondersteunt." },
            { name: "_fbp", duration: "3 maanden", desc: "Facebook plaatst deze cookie om interacties op te slaan en bij te houden." },
            { name: "IDE", duration: "1 jaar 24 dagen", desc: "Google DoubleClick IDE-cookies slaan informatie op over hoe de gebruiker de website gebruikt om hen relevante advertenties te presenteren volgens het gebruikersprofiel." }
          ]
        },
        manage: {
          title: "Cookievoorkeuren beheren",
          consentTitle: "Toestemmingsvoorkeuren",
          consentText: "U kunt uw cookie-instellingen op elk moment wijzigen door op de knop 'Toestemmingsvoorkeuren' hierboven te klikken. Hiermee kunt u de banner voor cookietoestemming opnieuw bezoeken en uw voorkeuren bijwerken of uw toestemming onmiddellijk intrekken.",
          browserText: "Daarnaast bieden verschillende browsers verschillende methoden om cookies die door websites worden gebruikt te blokkeren en te verwijderen. U kunt uw browserinstellingen aanpassen om cookies te blokkeren of te verwijderen. Hieronder vindt u links naar ondersteuningsdocumenten over het beheren en verwijderen van cookies in belangrijke webbrowsers.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Als u een andere webbrowser gebruikt, raadpleeg dan de officiële ondersteuningsdocumentatie."
          }
        }
      }
    },

    gdpr: {
      title: "AVG-kennisgeving",
      updatedDate: "06 okt 2025",
      quickLinks: {
        title: "Snelkoppelingen",
        links: [
          { id: "controller", text: "Verwerkingsverantwoordelijke" },
          { id: "bases", text: "Rechtsgrondslagen" },
          { id: "rights", text: "Uw rechten" },
          { id: "retention", text: "Gegevensbewaring" },
          { id: "transfers", text: "Gegevensoverdrachten" },
          { id: "complaints", text: "Klachten" }
        ]
      },
      sections: {
        badge: {
          title: "AVG-conform:",
          body: "Wij zijn toegewijd aan het beschermen van uw persoonlijke gegevens en het respecteren van uw privacyrechten onder de Algemene Verordening Gegevensbescherming."
        },
        controller: {
          title: "Verwerkingsverantwoordelijke",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), geregistreerd op Rua C, Parcela 12, Maputo 1118, Mozambique, treedt op als verwerkingsverantwoordelijke voor uw persoonlijke informatie die via onze diensten wordt verzameld."
        },
        bases: {
          title: "Rechtsgrondslagen voor verwerking",
          body: "Wij verwerken uw persoonlijke gegevens op basis van de volgende rechtsgrondslagen onder de AVG:"
        },
        rights: {
          title: "Uw AVG-rechten",
          body: "Als betrokkene onder de AVG heeft u de volgende rechten met betrekking tot uw persoonlijke gegevens:"
        },
        retention: {
          title: "Gegevensbewaring",
          periodsTitle: "Bewaringstermijnen",
          intro: "Wij bewaren persoonlijke gegevens alleen zolang als nodig is om de doeleinden te vervullen waarvoor ze zijn verzameld, inclusief wettelijke, boekhoudkundige of rapportagevereisten.",
          items: [
            "<strong>Boekingsgegevens:</strong> 7 jaar voor belasting- en wettelijke naleving",
            "<strong>Klantendienst communicatie:</strong> 3 jaar",
            "<strong>Marketingtoestemmingen:</strong> Tot intrekking van toestemming",
            "<strong>Website-analyses:</strong> 26 maanden",
            "<strong>Financiële transacties:</strong> 10 jaar voor boekhoudkundige doeleinden"
          ]
        },
        transfers: {
          title: "Internationale gegevensoverdrachten",
          body: "Wanneer wij uw gegevens buiten de Europese Economische Ruimte (EER) overdragen, zorgen wij ervoor dat passende waarborgen aanwezig zijn om uw informatie te beschermen. Dit kan het gebruik van Standaardcontractbepalingen omvatten die door de Europese Commissie zijn goedgekeurd, of het overdragen van gegevens naar landen met adequaatheidsbeslissingen."
        },
        complaints: {
          title: "Klachten",
          intro: "Als u zorgen heeft over hoe wij uw persoonlijke gegevens behandelen, heeft u het recht om een klacht in te dienen bij uw lokale gegevensbeschermingsautoriteit.",
          footer: "Wij moedigen u aan om eerst contact met ons op te nemen om eventuele zorgen op te lossen voordat u de toezichthoudende autoriteit benadert."
        },
        dpo: {
          title: "Neem contact op met onze Functionaris Gegevensbescherming",
          body: 'Voor alle AVG-gerelateerde vragen of om uw rechten uit te oefenen, neem contact op met onze Functionaris Gegevensbescherming via <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Wij zullen binnen 30 dagen op uw verzoek reageren, zoals vereist door de AVG.'
        }
      },
      legalBases: {
        contract: {
          title: "Contract:",
          body: "Verwerking noodzakelijk voor het nakomen van onze boekingsovereenkomsten en diensten."
        },
        legal: {
          title: "Wettelijke verplichting:",
          body: "Verwerking vereist om te voldoen aan wettelijke vereisten (bijv. belastingwetten)."
        },
        legitimate: {
          title: "Gerechtvaardigde belangen:",
          body: "Verwerking voor onze gerechtvaardigde bedrijfsbelangen met respect voor uw rechten."
        },
        consent: {
          title: "Toestemming:",
          body: "Verwerking op basis van uw uitdrukkelijke toestemming voor specifieke doeleinden."
        }
      },
      rights: {
        access: {
          title: "Recht op toegang",
          body: "U kunt kopieën van uw persoonlijke gegevens die wij bewaren opvragen."
        },
        rectification: {
          title: "Recht op rectificatie",
          body: "U kunt correctie van onjuiste of onvolledige gegevens aanvragen."
        },
        erasure: {
          title: "Recht op wissen",
          body: "U kunt onder bepaalde voorwaarden verwijdering van uw persoonlijke gegevens aanvragen."
        },
        restrict: {
          title: "Recht op beperking van verwerking",
          body: "U kunt beperking aanvragen van hoe wij uw gegevens gebruiken."
        },
        portability: {
          title: "Recht op gegevensoverdraagbaarheid",
          body: "U kunt overdracht van uw gegevens naar een andere organisatie aanvragen."
        },
        object: {
          title: "Recht op bezwaar",
          body: "U kunt bezwaar maken tegen bepaalde soorten verwerking van uw gegevens."
        }
      },
      buttons: {
        access: {
          text: "Gegevenstoegang aanvragen"
        },
        erasure: {
          text: "Gegevensverwijdering aanvragen"
        }
      },
      safeguards: {
        international: {
          title: "Internationale gegevensoverdrachten:",
          body: "Wij zorgen ervoor dat passende waarborgen aanwezig zijn voor alle gegevensoverdrachten buiten de EER, inclusief Standaardcontractbepalingen en adequaatheidsbeslissingen."
        }
      },
      authority: {
        lead: {
          title: "Leidende toezichthoudende autoriteit:",
          name: "Portugese Autoriteit Gegevensbescherming (CNPD)",
          websiteLabel: "Website:",
          contactLabel: "Contact:"
        }
      }
    },

    cric: {
      title: "CRIC — Bedrijf & Contact",
      updatedDate: "27 sep 2025",
      quickLinks: {
        title: "Snelkoppelingen",
        links: [
          { id: "intro", text: "Overzicht" },
          { id: "contact", text: "Contact" },
          { id: "emergency", text: "Noodgeval" }
        ]
      },
      sections: {
        badge: {
          title: "Officiële bedrijfsinformatie:",
          body: "Volledige bedrijfsregistratiegegevens en contactinformatie voor DEVOCEAN Lodge."
        },
        intro: {
          title: "Overzicht",
          body: "Volledige bedrijfsregistratiegegevens en contactinformatie voor DEVOCEAN Lodge."
        },
        contact: {
          title: "Contact",
          body: 'Voor algemene vragen, boekingen en informatie over onze diensten, gebruik de onderstaande contactgegevens.'
        },
        emergency: {
          title: "Noodcontact",
          body: "Voor urgente zaken buiten kantooruren, gebruik onze noodcontactgegevens."
        }
      },
      labels: {
        companyName: "Bedrijfsnaam",
        registration: "Handelsregister",
        vat: "BTW-nummer (NUIT)",
        license: "Bedrijfsvergunning (Alvará)",
        legalForm: "Rechtsvorm",
        capital: "Aandelenkapitaal",
        address: "Geregistreerd adres",
        email: "E-mail",
        phone: "Telefoon",
        businessHours: "Openingstijden",
        emergencyPhone: "Noodnummer",
        emergencyEmail: "Nood-e-mail"
      },
      legalForm: "Besloten vennootschap",
      businessHours: "Maandag - Vrijdag: 8:00 - 18:00<br>Zaterdag & Zondag: 8:00 - 12:00<br>Receptie: 6:00 - 22:00 (voor gasten)",
      emergencyPhoneNote: "Voor urgente zaken buiten kantooruren"
    }
  };

  // -------- PORTUGUESE --------
  window.LEGAL_DICT.pt = {
    privacy: {
      title: "Política de Privacidade",
      updatedDate: "06 Out 2025",
      quickLinks: {
        title: "Ligações Rápidas",
        links: [
          { id: "who", text: "Quem Somos" },
          { id: "collect", text: "Recolha de Dados" },
          { id: "use", text: "Utilização de Dados" },
          { id: "share", text: "Partilha de Dados" },
          { id: "security", text: "Segurança" },
          { id: "retention", text: "Retenção" },
          { id: "rights", text: "Os Seus Direitos" },
          { id: "transfers", text: "Transferências Internacionais" },
          { id: "contact", text: "Contacto" },
          { id: "updates", text: "Actualizações da Política" }
        ]
      },
      sections: {
        badge: {
          title: "A Sua Privacidade Importa:",
          body: "Estamos comprometidos em proteger os seus dados pessoais e em ser transparentes sobre como recolhemos, utilizamos e salvaguardamos as suas informações."
        },
        who: {
          title: "Quem somos",
          body: "O DEVOCEAN Lodge é operado pela TERRAfrique LDA, uma empresa registada em Moçambique. O nosso endereço registado é Rua C, Parcela 12, Maputo 1118, Moçambique. Operamos alojamento ecológico na praia em Ponta do Ouro, Moçambique. Estamos comprometidos em proteger a sua privacidade e em garantir que os seus dados pessoais sejam recolhidos, processados e utilizados de forma adequada, legal e transparente, de acordo com as leis de protecção de dados aplicáveis. Ao aceder ou utilizar o nosso website e serviços, concorda com as práticas descritas nesta Política de Privacidade."
        },
        collect: {
          title: "Que dados pessoais recolhemos",
          intro: "Recolhemos diferentes tipos de informação para fornecer e melhorar os nossos serviços:",
          categories: [
            {
              title: "Informação Pessoal",
              items: [
                "Nome, detalhes de contacto",
                "Informação de passaporte/ID",
                "Informação de pagamento",
                "Preferências de reserva"
              ]
            },
            {
              title: "Dados Técnicos",
              items: [
                "Endereço IP, informação do dispositivo",
                "Tipo e versão do navegador",
                "Análise de utilização do website",
                "Dados de cookies (com consentimento)"
              ]
            },
            {
              title: "Dados de Comunicação",
              items: [
                "Correspondência por e-mail",
                "Pedidos de serviço ao cliente",
                "Feedback e avaliações",
                "Preferências de marketing"
              ]
            }
          ]
        },
        use: {
          title: "Como utilizamos os seus dados",
          items: [
            "Gerir reservas e fornecer serviços",
            "Comunicar sobre a sua estadia, políticas e ofertas (opt-in)",
            "Melhorar o nosso site e serviços (análise, segurança)",
            "Cumprir obrigações legais/financeiras"
          ]
        },
        share: {
          title: "Quando partilhamos dados",
          items: [
            "Fornecedores de pagamento e plataformas de reserva para processar as suas reservas e pagamentos",
            "Serviços de análise para compreender a utilização do website e melhorar os nossos serviços",
            "Serviços de publicidade para marketing direcionado (apenas com o seu consentimento)",
            "Fornecedores de serviços de TI, fornecedores de alojamento e fornecedores de suporte técnico sob acordos de confidencialidade rigorosos",
            "Autoridades legais quando exigido por lei, regulamento, ordem judicial ou outro processo legal",
            "Para fazer cumprir os nossos acordos ou proteger os nossos direitos, propriedade ou segurança",
            "No caso de fusão, aquisição ou venda de activos, as suas informações podem ser transferidas para o novo proprietário"
          ],
          footer: "Exigimos que todas as terceiras partes respeitem a segurança dos seus dados pessoais e os utilizem apenas para os fins para os quais foram transferidos. Não permitimos que terceiras partes utilizem os seus dados pessoais para os seus próprios fins e apenas permitimos que processem os seus dados para fins especificados de acordo com as nossas instruções."
        },
        security: {
          title: "Medidas de segurança",
          intro: "Levamos a segurança dos dados a sério e implementamos:",
          measures: [
            "Encriptação de dados sensíveis em trânsito e em repouso",
            "Avaliações regulares de segurança e testes de penetração",
            "Controlos de acesso e mecanismos de autenticação",
            "Formação do pessoal em protecção de dados e privacidade",
            "Procedimentos seguros de cópia de segurança de dados e recuperação de desastres"
          ]
        },
        retention: {
          title: "Retenção de dados",
          body: "Retemos as suas informações pessoais pelo tempo necessário para cumprir os fins para os quais foram recolhidas, conforme detalhado nesta Política de Privacidade. Geralmente, retemos dados pessoais até 1 ano após a sua última interacção connosco, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Podemos precisar de reter certas informações por períodos mais longos por razões específicas, incluindo: manutenção de registos e relatórios de acordo com a lei aplicável (tipicamente 7 anos para registos financeiros e fiscais), aplicação de direitos legais, prevenção de fraude e resolução de litígios. Uma vez expirado o período de retenção, os seus dados pessoais serão eliminados de forma segura ou anonimizados. Informações anónimas residuais e informações agregadas, que não o identificam directa ou indirectamente, podem ser armazenadas indefinidamente para fins estatísticos e analíticos."
        },
        rights: {
          title: "Os seus direitos de privacidade",
          items: [
            "Direito de aceder aos seus dados pessoais",
            "Direito de corrigir dados inexactos",
            "Direito de eliminar os seus dados pessoais",
            "Direito de restringir ou opor-se ao processamento",
            "Direito à portabilidade de dados",
            "Direito de retirar o consentimento"
          ]
        },
        contact: {
          title: "Contacte a nossa equipa de privacidade",
          body: 'Se tiver alguma questão, preocupação ou pedido relativo a esta Política de Privacidade ou ao processamento das suas informações pessoais, ou se desejar exercer algum dos seus direitos de privacidade, por favor contacte-nos em:<br><br><strong>E-mail:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefone:</strong> +258 8441 82252<br><strong>Endereço Postal:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Moçambique<br><br>Responderemos ao seu pedido de acordo com a lei de protecção de dados aplicável. Para reclamações ou preocupações sobre o processamento das suas informações, pode também contactar o nosso Responsável pela Protecção de Dados no endereço de e-mail acima.'
        },
        transfers: {
          title: "Transferências Internacionais de Dados",
          body: "Como operamos em múltiplas jurisdições, os seus dados podem ser transferidos e processados em países fora da sua residência. Garantimos que tais transferências cumpram as leis de protecção de dados aplicáveis através de decisões de adequação da Comissão Europeia, Cláusulas Contratuais Padrão (SCCs), salvaguardas de segurança apropriadas e transparência sobre os locais de transferência."
        },
        updates: {
          title: "Actualizações da Política",
          body: "Podemos actualizar esta política de privacidade de tempos a tempos para reflectir mudanças nas nossas práticas, tecnologia, requisitos legais ou outros factores. Notificaremos de quaisquer mudanças materiais através de notificações por e-mail para utilizadores registados, avisos proeminentes no nosso website e uma data de 'última actualização' actualizada. Encorajamo-lo a rever periodicamente esta política para se manter informado sobre como protegemos as suas informações."
        }
      }
    },

    terms: {
      title: "Termos e Condições",
      updatedDate: "06 Out 2025",
      quickLinks: {
        title: "Ligações Rápidas",
        links: [
          { id: "intro", text: "Âmbito" },
          { id: "booking", text: "Reservas" },
          { id: "payment", text: "Preços e Pagamento" },
          { id: "cancel", text: "Cancelamentos" },
          { id: "conduct", text: "Conduta dos Hóspedes" },
          { id: "force-majeure", text: "Força Maior" },
          { id: "liability", text: "Responsabilidade" },
          { id: "intellectual-property", text: "Propriedade Intelectual" },
          { id: "disputes", text: "Resolução de Disputas" },
          { id: "changes", text: "Alterações" },
          { id: "law", text: "Lei Aplicável" },
          { id: "contact", text: "Contacto" }
        ]
      },
      sections: {
        badge: {
          title: "Aviso legal importante:",
          body: "Estes termos regem a sua utilização dos nossos serviços e website. Por favor, leia-os atentamente antes de fazer uma reserva."
        },
        intro: {
          title: "Âmbito",
          body: "Estes Termos regem o alojamento e serviços relacionados fornecidos pelo DEVOCEAN Lodge (TERRAfrique LDA). Ao fazer uma reserva, você concorda com estes Termos."
        },
        booking: {
          title: "Reservas",
          items: [
            "Forneça informações precisas sobre os hóspedes e datas de chegada/partida",
            "Pedidos especiais estão sujeitos à disponibilidade e confirmação"
          ],
          reservationReq: {
            title: "Requisitos de Reserva",
            body: "Documento de identificação válido e cartão de crédito obrigatórios para todas as reservas. Idade mínima: 18 anos."
          },
          checkinCheckout: {
            title: "Check-in/Check-out",
            body: "Check-in: 14:00 | Check-out: 11:00. Pedidos de check-in antecipado/tardio sujeitos a disponibilidade."
          },
          groupBookings: {
            title: "Reservas de Grupo",
            body: "Termos especiais aplicam-se a grupos de 6+ quartos. Contacte-nos para tarifas e políticas de grupo."
          }
        },
        payment: {
          title: "Preços e Pagamento",
          items: [
            "As tarifas apresentadas são por unidade/noite, salvo indicação em contrário",
            "Depósitos e métodos de pagamento serão confirmados durante a reserva"
          ],
          paymentInfo: {
            title: "Informações de Pagamento",
            body: "Todos os preços são em USD, salvo indicação em contrário. As taxas de conversão de moeda são aproximadas e sujeitas a alterações. É necessário um cartão de crédito válido para garantir a sua reserva. Podem aplicar-se encargos adicionais para despesas acessórias."
          }
        },
        cancel: {
          title: "Cancelamentos e Não comparências",
          body: "Os termos de cancelamento são divulgados no momento da reserva e na sua confirmação.",
          cancellationCharges: {
            title: "Encargos de Cancelamento",
            plans: [
              {
                planName: "Tarifa semi-flexível:",
                tiers: [
                  { period: "30 dias ou mais antes da chegada", charge: "Reembolso total" },
                  { period: "29 dias ou menos antes da chegada", charge: "Taxa de cancelamento de 50%" }
                ]
              },
              {
                planName: "Tarifa não reembolsável:",
                tiers: [
                  { period: "Até 24 horas após a reserva", charge: "Reembolso total" },
                  { period: "Em todas as outras situações", subtext: "O direito de modificar a data de chegada uma vez sob a condição de pagar a diferença caso a nova data tenha uma tarifa mais alta.", charge: "Sem reembolso", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "Política de Não Comparência",
            body: "Os hóspedes que não chegarem na data de check-in agendada sem notificação prévia serão considerados não comparências. O valor total da reserva será cobrado e a reserva será cancelada."
          }
        },
        conduct: {
          title: "Conduta do hóspede",
          items: [
            "Respeite as regras da propriedade, o pessoal, outros hóspedes e a comunidade local – como um madala que honra a sua casa",
            "Não são permitidas atividades ilegais nas instalações"
          ],
          zeroTolerance: {
            title: "Política de Tolerância Zero",
            body: "Mantemos uma política de tolerância zero para comportamentos perturbadores, atividades ilegais ou danos à propriedade. As violações podem resultar em expulsão imediata sem reembolso e podem levar a ações legais."
          }
        },
        "force-majeure": {
          title: "Força Maior",
          intro: "Não somos responsáveis pela falha em cumprir obrigações devido a situações além do nosso controlo razoável, incluindo mas não limitado a:",
          items: [
            "Desastres naturais, condições meteorológicas extremas",
            "Restrições governamentais, proibições de viagem",
            "Agitação civil, guerra, terrorismo",
            "Pandemias, epidemias, emergências de saúde",
            "Falhas de utilidades, quebras de infraestrutura"
          ],
          footer: "Nesses casos, ofereceremos datas alternativas ou vouchers de crédito onde possível. Reembolsos serão fornecidos de acordo com as leis aplicáveis e situações. No entanto, todos os danos e custos que são ou poderiam ter sido cobertos por pacotes de seguro de cancelamento e viagem geralmente disponíveis estão excluídos da nossa responsabilidade."
        },
        liability: {
          title: "Responsabilidade",
          body: "Na medida permitida por lei, não somos responsáveis por perdas indiretas ou imprevisíveis."
        },
        "intellectual-property": {
          title: "Propriedade Intelectual",
          copyright: {
            title: "Aviso de Direitos de Autor",
            body: "Todo o conteúdo deste website, incluindo texto, gráficos, logotipos e imagens, é propriedade do DEVOCEAN Lodge e está protegido pelas leis internacionais de direitos de autor. O uso, reprodução ou distribuição não autorizados são proibidos. O nome DEVOCEAN Lodge, logotipo e todas as marcas relacionadas são marcas registadas e não podem ser utilizados sem permissão por escrito."
          }
        },
        disputes: {
          title: "Resolução de Litígios",
          process: {
            title: "Processo de Resolução",
            body: "Procuramos resolver quaisquer litígios de forma amigável. Por favor, contacte-nos primeiro para tentar a resolução. Se não for resolvido, os litígios serão resolvidos através de mediação antes de prosseguir com ação legal.",
            law: "Lei Aplicável: A lei moçambicana regerá estes termos e quaisquer litígios.",
            jurisdiction: "Jurisdição: Os tribunais de Maputo, Moçambique terão jurisdição exclusiva.",
            mediation: "Mediação: As partes concordam em tentar a mediação através de um mediador credenciado antes de iniciar processos legais."
          }
        },
        changes: {
          title: "Alterações a Estes Termos",
          body: "Podemos actualizar os Termos de tempos a tempos. A versão publicada aplica-se à sua estadia."
        },
        law: {
          title: "Lei aplicável",
          body: "Aplica-se a lei moçambicana, sujeita às regras locais obrigatórias de proteção do consumidor."
        },
        contact: {
          title: "Contacto",
          body: 'Questões? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    cookies: {
      title: "Política de Cookies",
      effectiveDate: "19 de setembro de 2025",
      lastUpdated: "06 de outubro de 2025",
      managePreferences: "Sobre cookies:",
      manageText: "Pode controlar quais cookies utilizamos através do nosso banner de cookies ou das configurações do seu navegador.",
      cookieSettingsBtn: "Definições de Cookies",
      quickLinks: {
        title: "Links rápidos",
        links: [
          { id: "what", text: "O que são cookies" },
          { id: "how", text: "Como usamos cookies" },
          { id: "necessary", text: "Necessários" },
          { id: "functional", text: "Funcionais" },
          { id: "analytics", text: "Analíticos" },
          { id: "advertisement", text: "Publicitários" },
          { id: "manage", text: "Gerir preferências" }
        ]
      },
      sections: {
        badge: {
          title: "Sobre cookies",
          body: "Pode controlar quais cookies usamos através do nosso banner de cookies ou das configurações do seu navegador."
        },
        what: {
          title: "O que são cookies?",
          body: "Esta Política de Cookies explica o que são cookies, como os utilizamos, os tipos de cookies que utilizamos (ou seja, a informação que recolhemos através de cookies e como essa informação é utilizada), e como gerir as suas configurações de cookies.<br><br>Cookies são pequenos ficheiros de texto utilizados para armazenar pequenas informações. São armazenados no seu dispositivo quando um website é carregado no seu navegador. Estes cookies ajudam a garantir que o website funciona corretamente, melhoram a segurança, proporcionam uma melhor experiência ao utilizador e analisam o desempenho para identificar o que funciona e onde são necessárias melhorias.<br><br>Em termos simples: cookies são como pequenas notas que o website deixa no seu dispositivo para se lembrar das suas preferências – como numa machamba digital onde cada planta (informação) é cuidada individualmente."
        },
        how: {
          title: "Como usamos cookies?",
          body: "Como a maioria dos serviços online, o nosso website utiliza cookies próprios e de terceiros para vários fins. Os cookies próprios são principalmente necessários para que o website funcione corretamente e não recolhem dados pessoalmente identificáveis.<br><br>Os cookies de terceiros utilizados no nosso website ajudam-nos principalmente a compreender como o website funciona, como interage com ele, mantém os nossos serviços seguros, fornece anúncios relevantes e melhora a sua experiência geral de utilizador, melhorando a velocidade das suas futuras interações com o nosso website."
        },
        necessary: {
          title: "Cookies Necessários",
          description: "Os cookies necessários são necessários para ativar as funcionalidades básicas deste site, como fornecer login seguro ou ajustar as suas preferências de consentimento. Estes cookies não armazenam dados pessoalmente identificáveis.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "currency", duration: "sessão", desc: "Este cookie é usado para armazenar a preferência de moeda do utilizador." },
            { name: "_sh_session_", duration: "sessão", desc: "Descrição não disponível atualmente." },
            { name: "loccur", duration: "sessão", desc: "Descrição não disponível atualmente." },
            { name: "country_code", duration: "sessão", desc: "Sem descrição disponível." },
            { name: "b_locale", duration: "sessão", desc: "Descrição não disponível atualmente." },
            { name: "checkout_currency", duration: "sessão", desc: "Descrição não disponível atualmente." }
          ]
        },
        functional: {
          title: "Cookies Funcionais",
          description: "Os cookies funcionais ajudam a executar certas funcionalidades, como partilhar o conteúdo do website em plataformas de redes sociais, recolher feedback e outras funcionalidades de terceiros.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "locale", duration: "sessão", desc: "O Facebook define este cookie para melhorar a experiência de navegação do utilizador no website e fornecer anúncios relevantes ao usar as plataformas de redes sociais do Facebook." }
          ]
        },
        analytics: {
          title: "Cookies Analíticos",
          description: "Os cookies analíticos são usados para entender como os visitantes interagem com o website. Estes cookies ajudam a fornecer informações sobre métricas como número de visitantes, taxa de rejeição, fonte de tráfego, etc.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "_ga", duration: "1 ano 1 mês 4 dias", desc: "O Google Analytics define este cookie para calcular dados de visitantes, sessões e campanhas e rastrear o uso do site para o relatório de análise do site. O cookie armazena informações anonimamente e atribui um número gerado aleatoriamente para reconhecer visitantes únicos." },
            { name: "_ga_*", duration: "1 ano 1 mês 4 dias", desc: "O Google Analytics define este cookie para armazenar e contar visualizações de página." },
            { name: "_gid", duration: "1 dia", desc: "O Google Analytics define este cookie para armazenar informações sobre como os visitantes usam um website enquanto também cria um relatório de análise do desempenho do website. Alguns dos dados coletados incluem o número de visitantes, sua fonte e as páginas que visitam anonimamente." },
            { name: "_gat_UA-*", duration: "1 minuto", desc: "O Google Analytics define este cookie para rastreamento do comportamento do utilizador." },
            { name: "pardot", duration: "passado", desc: "O cookie pardot é definido enquanto o visitante está logado como utilizador Pardot. O cookie indica uma sessão ativa e não é usado para rastreamento." }
          ]
        },
        advertisement: {
          title: "Cookies Publicitários",
          description: "Os cookies publicitários são usados para fornecer aos visitantes anúncios personalizados com base nas páginas que visitou anteriormente e para analisar a eficácia das campanhas publicitárias.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "_gcl_au", duration: "3 meses", desc: "O Google Tag Manager define este cookie para experimentar a eficiência publicitária de websites que usam seus serviços." },
            { name: "test_cookie", duration: "15 minutos", desc: "O doubleclick.net define este cookie para determinar se o navegador do utilizador suporta cookies." },
            { name: "_fbp", duration: "3 meses", desc: "O Facebook define este cookie para armazenar e rastrear interações." },
            { name: "IDE", duration: "1 ano 24 dias", desc: "Os cookies Google DoubleClick IDE armazenam informações sobre como o utilizador usa o website para apresentar anúncios relevantes de acordo com o perfil do utilizador." }
          ]
        },
        manage: {
          title: "Gerir preferências de cookies",
          consentTitle: "Preferências de Consentimento",
          consentText: "Pode modificar as suas configurações de cookies a qualquer momento clicando no botão 'Preferências de Consentimento' acima. Isso permitirá que revisite o banner de consentimento de cookies e atualize suas preferências ou retire seu consentimento imediatamente.",
          browserText: "Além disso, diferentes navegadores oferecem vários métodos para bloquear e eliminar cookies usados por websites. Pode ajustar as configurações do seu navegador para bloquear ou eliminar cookies. Abaixo estão links para documentos de suporte sobre como gerir e eliminar cookies nos principais navegadores da web.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Se estiver a usar um navegador diferente, consulte a documentação de suporte oficial."
          }
        }
      }
    },

    gdpr: {
      title: "Aviso RODO",
      updatedDate: "06 Out 2025",
      quickLinks: {
        title: "Ligações Rápidas",
        links: [
          { id: "controller", text: "Controlador" },
          { id: "bases", text: "Bases Legais" },
          { id: "rights", text: "Os Seus Direitos" },
          { id: "retention", text: "Retenção de Dados" },
          { id: "transfers", text: "Transferências de Dados" },
          { id: "complaints", text: "Reclamações" }
        ]
      },
      sections: {
        badge: {
          title: "Compatível com RODO:",
          body: "Estamos comprometidos em proteger os seus dados pessoais e respeitar os seus direitos de privacidade sob o Regulamento Geral de Protecção de Dados."
        },
        controller: {
          title: "Controlador de Dados",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), registada em Rua C, Parcela 12, Maputo 1118, Moçambique, actua como controlador de dados para as suas informações pessoais recolhidas através dos nossos serviços."
        },
        bases: {
          title: "Bases Legais para Processamento",
          body: "Processamos os seus dados pessoais com base nos seguintes fundamentos legais sob o RODO:"
        },
        rights: {
          title: "Os Seus Direitos RODO",
          body: "Como sujeito de dados sob o RODO, tem os seguintes direitos relativamente aos seus dados pessoais:"
        },
        retention: {
          title: "Retenção de Dados",
          periodsTitle: "Períodos de Retenção",
          intro: "Retemos dados pessoais apenas pelo tempo necessário para cumprir os fins para os quais foram recolhidos, incluindo requisitos legais, contabilísticos ou de reporte.",
          items: [
            "<strong>Dados de reserva:</strong> 7 anos para conformidade fiscal e legal",
            "<strong>Comunicações de atendimento ao cliente:</strong> 3 anos",
            "<strong>Consentimentos de marketing:</strong> Até à retirada do consentimento",
            "<strong>Análises do website:</strong> 26 meses",
            "<strong>Transações financeiras:</strong> 10 anos para fins contabilísticos"
          ]
        },
        transfers: {
          title: "Transferências Internacionais de Dados",
          body: "Quando transferimos os seus dados para fora do Espaço Económico Europeu (EEE), garantimos que existem salvaguardas adequadas para proteger as suas informações. Isto pode incluir o uso de Cláusulas Contratuais Tipo aprovadas pela Comissão Europeia ou a transferência de dados para países com decisões de adequação."
        },
        complaints: {
          title: "Reclamações",
          intro: "Se tiver preocupações sobre como tratamos os seus dados pessoais, tem o direito de apresentar uma reclamação à sua autoridade local de proteção de dados. Em Moçambique, seguimos as leis locais de protecção de dados juntamente com as normas do RODO.",
          footer: "Encorajamos que nos contacte primeiro para resolver quaisquer preocupações antes de abordar a autoridade de supervisão."
        },
        dpo: {
          title: "Contacte o nosso Encarregado de Proteção de Dados",
          body: 'Para quaisquer questões relacionadas com o RGPD ou para exercer os seus direitos, contacte o nosso Encarregado de Proteção de Dados em <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Responderemos ao seu pedido dentro de 30 dias, conforme exigido pelo RGPD.'
        }
      },
      legalBases: {
        contract: {
          title: "Contrato:",
          body: "Tratamento necessário para cumprir os nossos acordos de reserva e serviços."
        },
        legal: {
          title: "Obrigação Legal:",
          body: "Tratamento exigido para cumprir requisitos legais (por exemplo, leis fiscais)."
        },
        legitimate: {
          title: "Interesses Legítimos:",
          body: "Tratamento para os nossos interesses comerciais legítimos, respeitando os seus direitos."
        },
        consent: {
          title: "Consentimento:",
          body: "Tratamento baseado no seu consentimento explícito para fins específicos."
        }
      },
      rights: {
        access: {
          title: "Direito de Acesso",
          body: "Pode solicitar cópias dos seus dados pessoais que detemos."
        },
        rectification: {
          title: "Direito de Retificação",
          body: "Pode solicitar a correção de dados incorretos ou incompletos."
        },
        erasure: {
          title: "Direito ao Apagamento",
          body: "Pode solicitar a eliminação dos seus dados pessoais sob certas condições."
        },
        restrict: {
          title: "Direito à Limitação do Tratamento",
          body: "Pode solicitar a limitação de como usamos os seus dados."
        },
        portability: {
          title: "Direito à Portabilidade dos Dados",
          body: "Pode solicitar a transferência dos seus dados para outra organização."
        },
        object: {
          title: "Direito de Oposição",
          body: "Pode opor-se a certos tipos de tratamento dos seus dados."
        }
      },
      buttons: {
        access: {
          text: "Solicitar Acesso aos Dados"
        },
        erasure: {
          text: "Solicitar Eliminação de Dados"
        }
      },
      safeguards: {
        international: {
          title: "Transferências Internacionais de Dados:",
          body: "Garantimos que existem salvaguardas adequadas para todas as transferências de dados fora do EEE, incluindo Cláusulas Contratuais Tipo e decisões de adequação."
        }
      },
      authority: {
        lead: {
          title: "Autoridade de Supervisão Principal:",
          name: "Comissão Nacional de Proteção de Dados (CNPD)",
          websiteLabel: "Website:",
          contactLabel: "Contacto:"
        }
      }
    },

    cric: {
      title: "CRIC — Empresa & Contacto",
      updatedDate: "27 Set 2025",
      quickLinks: {
        title: "Ligações Rápidas",
        links: [
          { id: "intro", text: "Visão Geral" },
          { id: "contact", text: "Contacto" },
          { id: "emergency", text: "Emergência" }
        ]
      },
      sections: {
        badge: {
          title: "Informação Oficial da Empresa:",
          body: "Detalhes completos de registo empresarial e informação de contacto para o DEVOCEAN Lodge."
        },
        intro: {
          title: "Visão Geral",
          body: "Detalhes completos de registo empresarial e informação de contacto para o DEVOCEAN Lodge."
        },
        contact: {
          title: "Contacto",
          body: 'Para inquéritos gerais, reservas e informação sobre os nossos serviços, por favor use os detalhes de contacto fornecidos abaixo.'
        },
        emergency: {
          title: "Contacto de Emergência",
          body: "Para assuntos urgentes fora do horário de funcionamento, por favor use os nossos detalhes de contacto de emergência."
        }
      },
      labels: {
        companyName: "Nome da Empresa",
        registration: "Registo Comercial",
        vat: "Número de IVA (NUIT)",
        license: "Licença Empresarial (Alvará)",
        legalForm: "Forma Legal",
        capital: "Capital Social",
        address: "Endereço Registado",
        email: "E-mail",
        phone: "Telefone",
        businessHours: "Horário de Funcionamento",
        emergencyPhone: "Telefone de Emergência",
        emergencyEmail: "E-mail de Emergência"
      },
      legalForm: "Sociedade de Responsabilidade Limitada",
      businessHours: "Segunda - Sexta: 8:00 - 18:00<br>Sábado & Domingo: 8:00 - 12:00<br>Recepção: 6:00 - 22:00 (para hóspedes)",
      emergencyPhoneNote: "Para assuntos urgentes fora do horário de funcionamento"
    },

    cookies: {
      title: "Política de Cookies",
      effectiveDate: "19 de Setembro de 2025",
      lastUpdated: "06 de Outubro de 2025",
      quickLinks: {
        title: "Ligações Rápidas",
        links: [
          { id: "what", text: "O que são cookies" },
          { id: "how", text: "Como utilizamos cookies" },
          { id: "necessary", text: "Necessários" },
          { id: "functional", text: "Funcionais" },
          { id: "analytics", text: "Analíticos" },
          { id: "advertisement", text: "Publicitários" },
          { id: "manage", text: "Gerir preferências" }
        ]
      },
      sections: {
        badge: {
          title: "Sobre cookies",
          body: "Pode controlar quais cookies utilizamos através do nosso banner de cookies ou das configurações do seu navegador."
        },
        what: {
          title: "O que são cookies?",
          body: "Esta Política de Cookies explica o que são cookies, como os utilizamos, os tipos de cookies que utilizamos (i.e., a informação que recolhemos usando cookies e como essa informação é utilizada), e como gerir as suas configurações de cookies.<br><br>Cookies são pequenos ficheiros de texto usados para armazenar pequenos pedaços de informação. São armazenados no seu dispositivo quando um website carrega no seu navegador. Estes cookies ajudam a garantir que o website funciona correctamente, melhoram a segurança, fornecem uma melhor experiência ao utilizador e analisam o desempenho para identificar o que funciona e onde são necessárias melhorias."
        },
        how: {
          title: "Como utilizamos cookies?",
          body: "Como a maioria dos serviços online, o nosso website utiliza tanto cookies de primeira parte como de terceiros para vários fins. Os cookies de primeira parte são principalmente necessários para que o website funcione correctamente e não recolhem quaisquer dados identificáveis pessoalmente.<br><br>Os cookies de terceiros usados no nosso website ajudam-nos principalmente a compreender como o website desempenha, rastrear como interage com ele, manter os nossos serviços seguros, fornecer anúncios relevantes e melhorar a sua experiência geral ao utilizador, melhorando a velocidade das suas futuras interacções com o nosso website."
        },
        necessary: {
          title: "Cookies Necessários",
          description: "Cookies necessários são requeridos para activar as funcionalidades básicas deste site, como fornecer login seguro ou ajustar as suas preferências de consentimento. Estes cookies não armazenam quaisquer dados identificáveis pessoalmente.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "currency", duration: "sessão", desc: "Este cookie é usado para armazenar a preferência de moeda do utilizador." },
            { name: "session", duration: "sessão", desc: "Descrição actualmente não disponível." },
            { name: "outros", duration: "sessão", desc: "Nenhuma descrição disponível." }
          ]
        },
        functional: {
          title: "Cookies Funcionais",
          description: "Cookies funcionais ajudam a realizar certas funcionalidades como partilhar o conteúdo do website em plataformas de redes sociais, recolher feedback, e outras funcionalidades de terceiros.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "locale", duration: "sessão", desc: "O Facebook define este cookie para melhorar a experiência de navegação do utilizador no website, e para fornecer ao utilizador publicidade relevante enquanto usa as plataformas de redes sociais do Facebook." }
          ]
        },
        analytics: {
          title: "Cookies Analíticos",
          description: "Cookies analíticos são usados para compreender como os visitantes interagem com o website. Estes cookies ajudam a fornecer informação sobre métricas como o número de visitantes, taxa de rejeição, fonte de tráfego, etc.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "_ga", duration: "1 ano 1 mês 4 dias", desc: "O Google Analytics define este cookie para calcular dados de visitantes, sessões e campanhas e rastrear o uso do site para o relatório analítico do site. O cookie armazena informação anonimamente e atribui um número gerado aleatoriamente para reconhecer visitantes únicos." },
            { name: "_ga_*", duration: "1 ano 1 mês 4 dias", desc: "O Google Analytics define este cookie para armazenar e contar visualizações de páginas." },
            { name: "_gid", duration: "1 dia", desc: "O Google Analytics define este cookie para armazenar informação sobre como os visitantes usam um website enquanto cria um relatório analítico do desempenho do website. Alguns dos dados recolhidos incluem o número de visitantes, a sua fonte, e as páginas que visitam anonimamente." },
            { name: "_gat_UA-*", duration: "1 minuto", desc: "O Google Analytics define este cookie para rastreamento do comportamento do utilizador." },
            { name: "pardot", duration: "passado", desc: "O cookie pardot é definido enquanto o visitante está logado como utilizador Pardot. O cookie indica uma sessão activa e não é usado para rastreamento." }
          ]
        },
        advertisement: {
          title: "Cookies Publicitários",
          description: "Cookies publicitários são usados para fornecer aos visitantes anúncios personalizados com base nas páginas que visitou anteriormente e para analisar a efectividade das campanhas publicitárias.",
          tableHeaders: { cookie: "Cookie", duration: "Duração", description: "Descrição" },
          cookies: [
            { name: "_gcl_au", duration: "3 meses", desc: "O Google Tag Manager define este cookie para experimentar a eficiência publicitária de websites que usam os seus serviços." },
            { name: "test_cookie", duration: "15 minutos", desc: "doubleclick.net define este cookie para determinar se o navegador do utilizador suporta cookies." },
            { name: "_fbp", duration: "3 meses", desc: "O Facebook define este cookie para armazenar e rastrear interacções." },
            { name: "IDE", duration: "1 ano 24 dias", desc: "Cookies Google DoubleClick IDE armazenam informação sobre como o utilizador usa o website para apresentar-lhes anúncios relevantes de acordo com o perfil do utilizador." }
          ]
        },
        manage: {
          title: "Gerir preferências de cookies",
          consentTitle: "Preferências de Consentimento",
          consentText: "Pode modificar as suas configurações de cookies a qualquer momento clicando no botão 'Preferências de Consentimento' acima. Isto permitir-lhe-á revisitar o banner de consentimento de cookies e actualizar as suas preferências ou retirar o seu consentimento imediatamente.",
          browserText: "Adicionalmente, diferentes navegadores oferecem vários métodos para bloquear e eliminar cookies usados por websites. Pode ajustar as configurações do seu navegador para bloquear ou eliminar cookies. Abaixo estão ligações para documentos de suporte sobre como gerir e eliminar cookies nos principais navegadores web.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Se estiver a usar um navegador web diferente, por favor consulte a sua documentação oficial de suporte."
          }
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
      updatedDate: "06 oct 2025",      quickLinks: {
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
        badge: {
          title: "Votre vie privée est importante:",
          body: "Nous nous engageons à protéger vos données personnelles et à être transparents sur la façon dont nous les collectons, utilisons et protégeons."
        },
        who: {
          title: "Qui nous sommes",
          body: "DEVOCEAN Lodge est exploité par TERRAfrique LDA, une société enregistrée au Mozambique. Notre adresse enregistrée est Rua C, Parcela 12, Maputo 1118, Mozambique. Nous exploitons des hébergements de plage écologiques à Ponta do Ouro, Mozambique. Nous nous engageons à protéger votre vie privée et à garantir que vos données personnelles sont collectées, traitées et utilisées de manière appropriée, légale et transparente conformément aux lois applicables sur la protection des données."
        },
        collect: {
          title: "Quelles données personnelles nous collectons",
          intro: "Nous collectons différents types d'informations pour fournir et améliorer nos services :",
          categories: [
            {
              title: "Informations personnelles",
              items: [
                "Nom, coordonnées",
                "Informations de passeport/pièce d'identité",
                "Informations de paiement",
                "Préférences de réservation"
              ]
            },
            {
              title: "Données techniques",
              items: [
                "Adresse IP, informations sur l'appareil",
                "Type et version du navigateur",
                "Analyses d'utilisation du site Web",
                "Données de cookies (avec consentement)"
              ]
            },
            {
              title: "Données de communication",
              items: [
                "Correspondance par e-mail",
                "Demandes de service client",
                "Commentaires et avis",
                "Préférences marketing"
              ]
            }
          ]
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
            "Chiffrement des données sensibles en transit et au repos",
            "Évaluations de sécurité régulières et tests de pénétration",
            "Contrôles d'accès et mécanismes d'authentification",
            "Formation du personnel à la protection des données et à la confidentialité",
            "Procédures sécurisées de sauvegarde des données et de reprise après sinistre"
          ]
        },
        retention: {
          title: "Conservation des données",
          body: "Nous conserverons vos informations personnelles aussi longtemps que nécessaire pour remplir les objectifs pour lesquels elles ont été collectées, comme détaillé dans cette politique de confidentialité. En général, nous conservons les données personnelles jusqu'à 1 an après votre dernière interaction avec nous, sauf si une période de conservation plus longue est requise ou autorisée par la loi. Nous pouvons avoir besoin de conserver certaines informations pendant des périodes plus longues pour des raisons spécifiques, notamment : la tenue de registres et les rapports conformément à la loi applicable (généralement 7 ans pour les dossiers financiers et fiscaux), l'application des droits légaux, la prévention de la fraude et la résolution des litiges. Une fois la période de conservation expirée, vos données personnelles seront supprimées de manière sécurisée ou anonymisées. Les informations anonymes résiduelles et les informations agrégées, qui ne vous identifient pas directement ou indirectement, peuvent être stockées indéfiniment à des fins statistiques et analytiques."
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
          body: 'Si vous avez des questions, des préoccupations ou des demandes concernant cette politique de confidentialité ou le traitement de vos informations personnelles, ou si vous souhaitez exercer l\'un de vos droits en matière de confidentialité, veuillez nous contacter à :<br><br><strong>Email :</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Téléphone :</strong> +258 8441 82252<br><strong>Adresse postale :</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique<br><br>Nous répondrons à votre demande conformément à la loi applicable sur la protection des données. Pour les plaintes ou préoccupations concernant le traitement de vos informations, vous pouvez également contacter notre Délégué à la Protection des Données à l\'adresse e-mail ci-dessus.'
        },
        transfers: {
          title: "Transferts internationaux de données",
          body: "Comme nous opérons dans plusieurs juridictions, vos données peuvent être transférées et traitées dans des pays en dehors de votre résidence. Nous veillons à ce que ces transferts respectent les lois applicables sur la protection des données par le biais de décisions d'adéquation de la Commission européenne, de clauses contractuelles types (CCT), de garanties de sécurité appropriées et de transparence sur les lieux de transfert."
        },
        updates: {
          title: "Mises à jour de la politique",
          body: "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre pour refléter les changements dans nos pratiques, la technologie, les exigences légales ou d'autres facteurs. Nous vous informerons de tout changement important par le biais de notifications par e-mail pour les utilisateurs enregistrés, d'avis bien visibles sur notre site Web et d'une date de mise à jour actualisée. Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la manière dont nous protégeons vos informations."
        }
      }
    },

    terms: {
      title: "Conditions Générales",
      updatedDate: "06 oct 2025",      quickLinks: {
        title: "Liens rapides",
        links: [
          { id: "intro", text: "Portée" },
          { id: "booking", text: "Réservations" },
          { id: "payment", text: "Prix et Paiement" },
          { id: "cancel", text: "Annulations et Absences" },
          { id: "conduct", text: "Conduite des clients" },
          { id: "force-majeure", text: "Force majeure" },
          { id: "liability", text: "Responsabilité" },
          { id: "intellectual-property", text: "Propriété intellectuelle" },
          { id: "disputes", text: "Résolution des litiges" },
          { id: "changes", text: "Modifications" },
          { id: "law", text: "Loi applicable" },
          { id: "contact", text: "Contact" }
        ]
      },
      sections: {
        badge: {
          title: "Avis juridique important:",
          body: "Ces conditions régissent votre utilisation de nos services et de notre site web. Veuillez les lire attentivement avant de faire une réservation."
        },
        intro: {
          title: "Portée",
          body: "Ces Conditions régissent l'hébergement et les services connexes fournis par DEVOCEAN Lodge (TERRAfrique LDA). En effectuant une réservation, vous acceptez ces Conditions."
        },
        booking: {
          title: "Réservations",
          items: [
            "Fournissez des informations précises sur les clients et les dates d'arrivée/départ",
            "Les demandes spéciales sont soumises à disponibilité et confirmation"
          ],
          reservationReq: {
            title: "Conditions de Réservation",
            body: "Pièce d'identité valide et carte de crédit requises pour toutes les réservations. Âge minimum : 18 ans."
          },
          checkinCheckout: {
            title: "Enregistrement/Départ",
            body: "Enregistrement : 14h00 | Départ : 11h00. Demandes anticipées/tardives sous réserve de disponibilité."
          },
          groupBookings: {
            title: "Réservations de Groupe",
            body: "Des conditions spéciales s'appliquent aux groupes de 6+ chambres. Contactez-nous pour les tarifs et politiques de groupe."
          }
        },
        payment: {
          title: "Prix et Paiement",
          items: [
            "Les tarifs indiqués sont par unité/nuit sauf indication contraire",
            "Les acomptes et méthodes de paiement seront confirmés lors de la réservation"
          ],
          paymentInfo: {
            title: "Informations de Paiement",
            body: "Tous les prix sont en USD sauf indication contraire. Les taux de change sont approximatifs et sujets à changement. Une carte de crédit valide est requise pour garantir votre réservation. Des frais supplémentaires peuvent s'appliquer pour les dépenses accessoires."
          }
        },
        cancel: {
          title: "Annulations et Absences",
          body: "Les conditions d'annulation sont divulguées au moment de la réservation et dans votre confirmation.",
          cancellationCharges: {
            title: "Frais d'Annulation",
            plans: [
              {
                planName: "Tarif semi-flexible:",
                tiers: [
                  { period: "30 jours ou plus avant l'arrivée", charge: "Remboursement complet" },
                  { period: "29 jours ou moins avant l'arrivée", charge: "Frais d'annulation de 50%" }
                ]
              },
              {
                planName: "Tarif non remboursable:",
                tiers: [
                  { period: "Jusqu'à 24 heures après la réservation", charge: "Remboursement complet" },
                  { period: "Dans toutes les autres circonstances", subtext: "Le droit de modifier la date d'arrivée une fois à condition de payer la différence si la nouvelle date a un tarif plus élevé.", charge: "Aucun remboursement", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "Politique de Non-présentation",
            body: "Les clients qui ne se présentent pas à la date d'enregistrement prévue sans notification préalable seront considérés comme des non-présentations. Le montant total de la réservation sera facturé et la réservation sera annulée."
          }
        },
        conduct: {
          title: "Conduite des clients",
          items: [
            "Respectez les règles de la propriété, le personnel, les autres clients et la communauté locale",
            "Aucune activité illégale sur les lieux"
          ],
          zeroTolerance: {
            title: "Politique de Tolérance Zéro",
            body: "Nous maintenons une politique de tolérance zéro pour les comportements perturbateurs, les activités illégales ou les dommages à la propriété. Les violations peuvent entraîner une expulsion immédiate sans remboursement et peuvent donner lieu à des poursuites judiciaires."
          }
        },

        "force-majeure": {
          title: "Force Majeure",
          intro: "Nous ne sommes pas responsables du non-respect de nos obligations en raison de circonstances indépendantes de notre volonté raisonnable, y compris mais sans s'y limiter:",
          items: [
            "Catastrophes naturelles, conditions météorologiques extrêmes",
            "Restrictions gouvernementales, interdictions de voyager",
            "Troubles civils, guerre, terrorisme",
            "Pandémies, épidémies, urgences sanitaires",
            "Pannes de services publics, défaillances d'infrastructure"
          ],
          footer: "Dans de tels cas, nous proposerons des dates alternatives ou des bons de crédit dans la mesure du possible. Les remboursements seront effectués conformément aux lois applicables et aux circonstances. Cependant, tous les dommages et coûts qui sont ou auraient pu être couverts par des forfaits d'assurance annulation et voyage généralement disponibles sont exclus de notre responsabilité."
        },
        liability: {
          title: "Responsabilité",
          body: "Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes indirectes ou imprévisibles."
        },

        "intellectual-property": {
          title: "Propriété intellectuelle",
          copyright: {
            title: "Avis de droit d'auteur",
            body: "Tout le contenu de ce site web, y compris le texte, les graphiques, les logos et les images, est la propriété de DEVOCEAN Lodge et protégé par les lois internationales sur le droit d'auteur. L'utilisation, la reproduction ou la distribution non autorisées sont interdites. Le nom DEVOCEAN Lodge, le logo et toutes les marques associées sont des marques déposées et ne peuvent être utilisés sans autorisation écrite."
          }
        },
        disputes: {
          title: "Résolution des litiges",
          process: {
            title: "Processus de résolution",
            body: "Nous visons à résoudre tout litige à l'amiable. Veuillez nous contacter en premier lieu pour tenter une résolution. Si non résolu, les litiges seront réglés par médiation avant d'engager une action en justice.",
            law: "Droit applicable: Le droit mozambicain régira ces conditions et tout litige.",
            jurisdiction: "Juridiction: Les tribunaux de Maputo, Mozambique auront juridiction exclusive.",
            mediation: "Médiation: Les parties conviennent de tenter une médiation par un médiateur accrédité avant d'engager une procédure judiciaire."
          }
        },
        changes: {
          title: "Modifications de ces Conditions",
          body: "Nous pouvons mettre à jour les Conditions de temps en temps. La version publiée s'applique à votre séjour."
        },
        law: {
          title: "Loi applicable",
          body: "Le droit mozambicain s'applique, sous réserve des règles locales obligatoires de protection des consommateurs."
        },
        contact: {
          title: "Contact",
          body: 'Des questions ? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    cookies: {
      title: "Politique relative aux cookies",
      effectiveDate: "19 septembre 2025",
      lastUpdated: "06 octobre 2025",
      managePreferences: "Gérez vos préférences en matière de cookies :",
      manageText: "Vous pouvez contrôler les cookies que nous utilisons via notre bannière de cookies ou les paramètres de votre navigateur.",
      cookieSettingsBtn: "Paramètres des cookies",
      quickLinks: {
        title: "Liens rapides",
        links: [
          { id: "what", text: "Que sont les cookies" },
          { id: "how", text: "Comment nous utilisons les cookies" },
          { id: "necessary", text: "Nécessaires" },
          { id: "functional", text: "Fonctionnels" },
          { id: "analytics", text: "Analytiques" },
          { id: "advertisement", text: "Publicitaires" },
          { id: "manage", text: "Gérer les préférences" }
        ]
      },
      sections: {
        badge: {
          title: "À propos des cookies",
          body: "Vous pouvez contrôler quels cookies nous utilisons via notre bannière de cookies ou les paramètres de votre navigateur."
        },
        what: {
          title: "Que sont les cookies ?",
          body: "Cette Politique relative aux cookies explique ce que sont les cookies, comment nous les utilisons, les types de cookies que nous utilisons (c'est-à-dire les informations que nous collectons à l'aide de cookies et comment ces informations sont utilisées), et comment gérer vos paramètres de cookies.<br><br>Les cookies sont de petits fichiers texte utilisés pour stocker de petites informations. Ils sont stockés sur votre appareil lorsqu'un site Web est chargé dans votre navigateur. Ces cookies aident à garantir que le site Web fonctionne correctement, améliorent la sécurité, offrent une meilleure expérience utilisateur et analysent les performances pour identifier ce qui fonctionne et où des améliorations sont nécessaires."
        },
        how: {
          title: "Comment utilisons-nous les cookies ?",
          body: "Comme la plupart des services en ligne, notre site Web utilise à la fois des cookies propriétaires et des cookies tiers à diverses fins. Les cookies propriétaires sont principalement nécessaires au bon fonctionnement du site Web et ne collectent aucune donnée personnellement identifiable.<br><br>Les cookies tiers utilisés sur notre site Web nous aident principalement à comprendre les performances du site Web, à suivre la manière dont vous interagissez avec lui, à sécuriser nos services, à diffuser des publicités pertinentes et à améliorer votre expérience utilisateur globale tout en améliorant la vitesse de vos futures interactions avec notre site Web."
        },
        necessary: {
          title: "Cookies nécessaires",
          description: "Les cookies nécessaires sont requis pour activer les fonctionnalités de base de ce site, telles que la connexion sécurisée ou l'ajustement de vos préférences de consentement. Ces cookies ne stockent aucune donnée personnellement identifiable.",
          tableHeaders: { cookie: "Cookie", duration: "Durée", description: "Description" },
          cookies: [
            { name: "currency", duration: "session", desc: "Ce cookie est utilisé pour stocker la préférence de devise de l'utilisateur." },
            { name: "_sh_session_", duration: "session", desc: "Description actuellement non disponible." },
            { name: "loccur", duration: "session", desc: "Description actuellement non disponible." },
            { name: "country_code", duration: "session", desc: "Aucune description disponible." },
            { name: "b_locale", duration: "session", desc: "Description actuellement non disponible." },
            { name: "checkout_currency", duration: "session", desc: "Description actuellement non disponible." }
          ]
        },
        functional: {
          title: "Cookies fonctionnels",
          description: "Les cookies fonctionnels aident à exécuter certaines fonctionnalités telles que le partage du contenu du site Web sur les plateformes de médias sociaux, la collecte de commentaires et d'autres fonctionnalités tierces.",
          tableHeaders: { cookie: "Cookie", duration: "Durée", description: "Description" },
          cookies: [
            { name: "locale", duration: "session", desc: "Facebook définit ce cookie pour améliorer l'expérience de navigation de l'utilisateur sur le site Web et pour fournir à l'utilisateur des publicités pertinentes lors de l'utilisation des plateformes de médias sociaux de Facebook." }
          ]
        },
        analytics: {
          title: "Cookies analytiques",
          description: "Les cookies analytiques sont utilisés pour comprendre comment les visiteurs interagissent avec le site Web. Ces cookies aident à fournir des informations sur des métriques telles que le nombre de visiteurs, le taux de rebond, la source de trafic, etc.",
          tableHeaders: { cookie: "Cookie", duration: "Durée", description: "Description" },
          cookies: [
            { name: "_ga", duration: "1 an 1 mois 4 jours", desc: "Google Analytics définit ce cookie pour calculer les données sur les visiteurs, les sessions et les campagnes et suivre l'utilisation du site pour le rapport d'analyse du site. Le cookie stocke les informations de manière anonyme et attribue un numéro généré aléatoirement pour reconnaître les visiteurs uniques." },
            { name: "_ga_*", duration: "1 an 1 mois 4 jours", desc: "Google Analytics définit ce cookie pour stocker et compter les pages vues." },
            { name: "_gid", duration: "1 jour", desc: "Google Analytics définit ce cookie pour stocker des informations sur la façon dont les visiteurs utilisent un site Web tout en créant également un rapport d'analyse des performances du site Web. Certaines des données collectées incluent le nombre de visiteurs, leur source et les pages qu'ils visitent de manière anonyme." },
            { name: "_gat_UA-*", duration: "1 minute", desc: "Google Analytics définit ce cookie pour le suivi du comportement des utilisateurs." },
            { name: "pardot", duration: "passé", desc: "Le cookie pardot est défini lorsque le visiteur est connecté en tant qu'utilisateur Pardot. Le cookie indique une session active et n'est pas utilisé pour le suivi." }
          ]
        },
        advertisement: {
          title: "Cookies publicitaires",
          description: "Les cookies publicitaires sont utilisés pour fournir aux visiteurs des publicités personnalisées basées sur les pages que vous avez visitées précédemment et pour analyser l'efficacité des campagnes publicitaires.",
          tableHeaders: { cookie: "Cookie", duration: "Durée", description: "Description" },
          cookies: [
            { name: "_gcl_au", duration: "3 mois", desc: "Google Tag Manager définit ce cookie pour expérimenter l'efficacité publicitaire des sites Web utilisant leurs services." },
            { name: "test_cookie", duration: "15 minutes", desc: "doubleclick.net définit ce cookie pour déterminer si le navigateur de l'utilisateur prend en charge les cookies." },
            { name: "_fbp", duration: "3 mois", desc: "Facebook définit ce cookie pour stocker et suivre les interactions." },
            { name: "IDE", duration: "1 an 24 jours", desc: "Les cookies Google DoubleClick IDE stockent des informations sur la façon dont l'utilisateur utilise le site Web pour lui présenter des publicités pertinentes selon le profil utilisateur." }
          ]
        },
        manage: {
          title: "Gérer les préférences en matière de cookies",
          consentTitle: "Préférences de consentement",
          consentText: "Vous pouvez modifier vos paramètres de cookies à tout moment en cliquant sur le bouton 'Préférences de consentement' ci-dessus. Cela vous permettra de revoir la bannière de consentement aux cookies et de mettre à jour vos préférences ou de retirer votre consentement immédiatement.",
          browserText: "De plus, différents navigateurs offrent diverses méthodes pour bloquer et supprimer les cookies utilisés par les sites Web. Vous pouvez ajuster les paramètres de votre navigateur pour bloquer ou supprimer les cookies. Vous trouverez ci-dessous des liens vers des documents d'assistance sur la gestion et la suppression des cookies dans les principaux navigateurs Web.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Si vous utilisez un navigateur Web différent, veuillez consulter sa documentation d'assistance officielle."
          }
        }
      }
    },

    gdpr: {
      title: "Avis RGPD",
      updatedDate: "06 oct 2025",
      backToHome: "Retour à l'accueil",
      quickLinksTitle: "Liens rapides",
      gdprBadge: '<strong>Conforme au RGPD:</strong> Nous nous engageons à protéger vos données personnelles et à respecter vos droits à la vie privée conformément au Règlement Général sur la Protection des Données.',
      quickLinks: {
        title: "Liens rapides",
        links: [
          { id: "controller", text: "Responsable" },
          { id: "bases", text: "Fondements juridiques" },
          { id: "rights", text: "Vos droits" },
          { id: "retention", text: "Conservation des données" },
          { id: "transfers", text: "Transferts de données" },
          { id: "complaints", text: "Réclamations" }
        ]
      },
      sections: {
        badge: {
          title: "Conforme au RGPD:",
          body: "Nous nous engageons à protéger vos données personnelles et à respecter vos droits à la vie privée conformément au Règlement Général sur la Protection des Données."
        },
        controller: {
          title: "Responsable du traitement des données",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), enregistrée à Rua C, Parcela 12, Maputo 1118, Mozambique, agit en tant que responsable du traitement de vos informations personnelles collectées via nos services."
        },
        bases: {
          title: "Fondements juridiques du traitement",
          body: "Nous traitons vos données personnelles sur la base des fondements juridiques suivants en vertu du RGPD :"
        },
        rights: {
          title: "Vos droits en vertu du RGPD",
          body: "En tant que personne concernée en vertu du RGPD, vous disposez des droits suivants concernant vos données personnelles :"
        },
        transfers: {
          title: "Transferts internationaux de données",
          body: "Lorsque nous transférons vos données en dehors de l'Espace Économique Européen (EEE), nous veillons à ce que des garanties appropriées soient en place pour protéger vos informations. Cela peut inclure l'utilisation de Clauses Contractuelles Types approuvées par la Commission européenne ou le transfert de données vers des pays bénéficiant de décisions d'adéquation."
        },
        dpo: {
          title: "Contactez notre Délégué à la Protection des Données",
          body: 'Pour toute question relative au RGPD ou pour exercer vos droits, veuillez contacter notre Délégué à la Protection des Données à l\'adresse <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Nous répondrons à votre demande dans les 30 jours comme l\'exige le RGPD.'
        }
      },
      basisContract: '<strong>Contrat:</strong> Traitement nécessaire pour exécuter nos accords de réservation et services.',
      basisLegal: '<strong>Obligation légale:</strong> Traitement requis pour se conformer aux exigences légales (par exemple, lois fiscales).',
      basisLegitimate: '<strong>Intérêts légitimes:</strong> Traitement pour nos intérêts commerciaux légitimes tout en respectant vos droits.',
      basisConsent: '<strong>Consentement:</strong> Traitement basé sur votre consentement explicite pour des finalités spécifiques.',
      rightAccessTitle: 'Droit d\'accès',
      rightAccessDesc: 'Vous pouvez demander des copies de vos données personnelles que nous détenons.',
      rightRectificationTitle: 'Droit de rectification',
      rightRectificationDesc: 'Vous pouvez demander la correction de données inexactes ou incomplètes.',
      rightErasureTitle: 'Droit à l\'effacement',
      rightErasureDesc: 'Vous pouvez demander la suppression de vos données personnelles sous certaines conditions.',
      rightRestrictTitle: 'Droit à la limitation du traitement',
      rightRestrictDesc: 'Vous pouvez demander la limitation de l\'utilisation de vos données.',
      rightPortabilityTitle: 'Droit à la portabilité des données',
      rightPortabilityDesc: 'Vous pouvez demander le transfert de vos données vers une autre organisation.',
      rightObjectTitle: 'Droit d\'opposition',
      rightObjectDesc: 'Vous pouvez vous opposer à certains types de traitement de vos données.',
      btnRequestAccess: 'Demander l\'accès aux données',
      btnRequestDeletion: 'Demander la suppression des données',
      retentionTitle: 'Conservation des données',
      retentionPeriodsTitle: 'Périodes de conservation',
      retentionIntro: 'Nous conservons les données personnelles uniquement aussi longtemps que nécessaire pour remplir les finalités pour lesquelles elles ont été collectées, y compris les exigences légales, comptables ou de reporting.',
      retentionBooking: '<strong>Données de réservation:</strong> 7 ans pour la conformité fiscale et légale',
      retentionCustomer: '<strong>Communications du service client:</strong> 3 ans',
      retentionMarketing: '<strong>Consentements marketing:</strong> Jusqu\'au retrait du consentement',
      retentionAnalytics: '<strong>Analyses du site Web:</strong> 26 mois',
      retentionFinancial: '<strong>Transactions financières:</strong> 10 ans à des fins comptables',
      transfersSafeguards: '<strong>Transferts internationaux de données:</strong> Nous veillons à ce que des garanties appropriées soient en place pour tous les transferts de données en dehors de l\'EEE, y compris les Clauses Contractuelles Types et les décisions d\'adéquation.',
      complaintsTitle: 'Réclamations',
      complaintsIntro: 'Si vous avez des préoccupations concernant la manière dont nous traitons vos données personnelles, vous avez le droit de déposer une réclamation auprès de votre autorité locale de protection des données.',
      complaintsAuthority: '<strong>Autorité de contrôle chef de file:</strong> Autorité portugaise de protection des données (CNPD)<br><strong>Site Web:</strong> <a href="https://www.cnpd.pt" target="_blank">www.cnpd.pt</a><br><strong>Contact:</strong> +351 213 928 400',
      complaintsContactFirst: 'Nous vous encourageons à nous contacter d\'abord pour résoudre toute préoccupation avant d\'approcher l\'autorité de contrôle.'
    },

    cric: {
      title: "CRIC — Entreprise & Contact",
      updatedDate: "27 sep 2025",
      quickLinks: {
        title: "Liens rapides",
        links: [
          { id: "intro", text: "Aperçu" },
          { id: "contact", text: "Contact" },
          { id: "emergency", text: "Urgence" }
        ]
      },
      sections: {
        badge: {
          title: "Informations officielles de l'entreprise:",
          body: "Détails complets d'enregistrement commercial et informations de contact pour DEVOCEAN Lodge."
        },
        intro: {
          title: "Aperçu",
          body: "Informations complètes sur l'enregistrement de l'entreprise et coordonnées de DEVOCEAN Lodge."
        },
        contact: {
          title: "Contact",
          body: 'Pour les demandes générales, les réservations et les informations sur nos services, veuillez utiliser les coordonnées fournies ci-dessous.'
        },
        emergency: {
          title: "Contact d'urgence",
          body: "Pour les questions urgentes en dehors des heures d'ouverture, veuillez utiliser nos coordonnées d'urgence."
        }
      },
      labels: {
        companyName: "Nom de l'entreprise",
        registration: "Immatriculation commerciale",
        vat: "Numéro de TVA (NUIT)",
        license: "Licence commerciale (Alvará)",
        legalForm: "Forme juridique",
        capital: "Capital social",
        address: "Adresse enregistrée",
        email: "E-mail",
        phone: "Téléphone",
        businessHours: "Heures d'ouverture",
        emergencyPhone: "Téléphone d'urgence",
        emergencyEmail: "E-mail d'urgence"
      },
      legalForm: "Société à responsabilité limitée",
      businessHours: "Lundi - Vendredi : 8h00 - 18h00<br>Samedi & Dimanche : 8h00 - 12h00<br>Réception : 6h00 - 22h00 (pour les clients)",
      emergencyPhoneNote: "Pour les questions urgentes en dehors des heures d'ouverture"
    }
  };

  // -------- ITALIAN --------
  window.LEGAL_DICT.it = {
    privacy: {
      title: "Informativa sulla privacy",
      updatedDate: "06 ott 2025",      quickLinks: {
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
        badge: {
          title: "La tua privacy è importante:",
          body: "Ci impegniamo a proteggere i tuoi dati personali e ad essere trasparenti su come li raccogliamo, utilizziamo e proteggiamo."
        },
        who: {
          title: "Chi siamo",
          body: "DEVOCEAN Lodge è gestito da TERRAfrique LDA, una società registrata in Mozambico. Il nostro indirizzo registrato è Rua C, Parcela 12, Maputo 1118, Mozambico. Gestiamo alloggi ecologici sulla spiaggia a Ponta do Ouro, Mozambico. Ci impegniamo a proteggere la tua privacy e a garantire che i tuoi dati personali siano raccolti, trattati e utilizzati in modo appropriato, legale e trasparente in conformità con le leggi applicabili sulla protezione dei dati."
        },
        collect: {
          title: "Quali dati personali raccogliamo",
          intro: "Raccogliamo diversi tipi di informazioni per fornire e migliorare i nostri servizi:",
          categories: [
            {
              title: "Informazioni personali",
              items: [
                "Nome, dettagli di contatto",
                "Informazioni passaporto/documento d'identità",
                "Informazioni di pagamento",
                "Preferenze di prenotazione"
              ]
            },
            {
              title: "Dati tecnici",
              items: [
                "Indirizzo IP, informazioni sul dispositivo",
                "Tipo e versione del browser",
                "Analisi dell'utilizzo del sito Web",
                "Dati dei cookie (con consenso)"
              ]
            },
            {
              title: "Dati di comunicazione",
              items: [
                "Corrispondenza via e-mail",
                "Richieste di servizio clienti",
                "Feedback e recensioni",
                "Preferenze di marketing"
              ]
            }
          ]
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
            "Crittografia dei dati sensibili in transito e a riposo",
            "Valutazioni di sicurezza regolari e test di penetrazione",
            "Controlli di accesso e meccanismi di autenticazione",
            "Formazione del personale sulla protezione dei dati e sulla privacy",
            "Procedure sicure di backup dei dati e ripristino di emergenza"
          ]
        },
        retention: {
          title: "Conservazione dei dati",
          body: "Conserveremo le tue informazioni personali per il tempo necessario a soddisfare gli scopi per cui sono state raccolte, come dettagliato in questa Informativa sulla privacy. In generale, conserviamo i dati personali fino a 1 anno dopo la tua ultima interazione con noi, a meno che non sia richiesto o consentito dalla legge un periodo di conservazione più lungo. Potremmo dover conservare determinate informazioni per periodi più lunghi per motivi specifici, tra cui: tenuta dei registri e reporting in conformità con la legge applicabile (tipicamente 7 anni per i registri finanziari e fiscali), applicazione dei diritti legali, prevenzione delle frodi e risoluzione delle controversie. Una volta scaduto il periodo di conservazione, i tuoi dati personali saranno eliminati in modo sicuro o resi anonimi. Le informazioni anonime residue e le informazioni aggregate, che non ti identificano direttamente o indirettamente, possono essere conservate indefinitamente per scopi statistici e analitici."
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
          body: 'Se hai domande, preoccupazioni o richieste riguardanti questa Informativa sulla privacy o il trattamento delle tue informazioni personali, o se desideri esercitare uno dei tuoi diritti sulla privacy, contattaci all\'indirizzo:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefono:</strong> +258 8441 82252<br><strong>Indirizzo postale:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambico<br><br>Risponderemo alla tua richiesta in conformità con la legge applicabile sulla protezione dei dati. Per reclami o preoccupazioni sul trattamento delle tue informazioni, puoi anche contattare il nostro Responsabile della Protezione dei Dati all\'indirizzo e-mail sopra indicato.'
        },
        transfers: {
          title: "Trasferimenti internazionali di dati",
          body: "Poiché operiamo in più giurisdizioni, i tuoi dati potrebbero essere trasferiti ed elaborati in paesi al di fuori della tua residenza. Garantiamo che tali trasferimenti rispettino le leggi applicabili sulla protezione dei dati attraverso decisioni di adeguatezza della Commissione europea, clausole contrattuali standard (SCC), garanzie di sicurezza appropriate e trasparenza sulle sedi di trasferimento."
        },
        updates: {
          title: "Aggiornamenti della politica",
          body: "Potremmo aggiornare questa informativa sulla privacy di tanto in tanto per riflettere cambiamenti nelle nostre pratiche, tecnologia, requisiti legali o altri fattori. Ti informeremo di eventuali modifiche sostanziali tramite notifiche via e-mail per gli utenti registrati, avvisi ben visibili sul nostro sito Web e una data di aggiornamento aggiornata. Ti incoraggiamo a consultare regolarmente questa politica per rimanere informato su come proteggiamo le tue informazioni."
        }
      }
    },

    terms: {
      title: "Termini e Condizioni",
      updatedDate: "06 ott 2025",      quickLinks: {
        title: "Link rapidi",
        links: [
          { id: "intro", text: "Ambito" },
          { id: "booking", text: "Prenotazioni" },
          { id: "payment", text: "Prezzi e Pagamento" },
          { id: "cancel", text: "Cancellazioni e Mancate presentazioni" },
          { id: "conduct", text: "Comportamento degli ospiti" },
          { id: "force-majeure", text: "Forza maggiore" },
          { id: "liability", text: "Responsabilità" },
          { id: "intellectual-property", text: "Proprietà intellettuale" },
          { id: "disputes", text: "Risoluzione delle controversie" },
          { id: "changes", text: "Modifiche" },
          { id: "law", text: "Legge applicabile" },
          { id: "contact", text: "Contatto" }
        ]
      },
      sections: {
        badge: {
          title: "Avviso legale importante:",
          body: "Questi termini regolano l'utilizzo dei nostri servizi e del sito web. Si prega di leggerli attentamente prima di effettuare una prenotazione."
        },
        intro: {
          title: "Ambito",
          body: "Questi Termini regolano l'alloggio e i servizi correlati forniti da DEVOCEAN Lodge (TERRAfrique LDA). Effettuando una prenotazione, accetti questi Termini."
        },
        booking: {
          title: "Prenotazioni",
          items: [
            "Fornire informazioni accurate sugli ospiti e date di arrivo/partenza",
            "Le richieste speciali sono soggette a disponibilità e conferma"
          ],
          reservationReq: {
            title: "Requisiti di Prenotazione",
            body: "Documento d'identità valido e carta di credito richiesti per tutte le prenotazioni. Età minima: 18 anni."
          },
          checkinCheckout: {
            title: "Check-in/Check-out",
            body: "Check-in: ore 14:00 | Check-out: ore 11:00. Richieste anticipate/tardive soggette a disponibilità."
          },
          groupBookings: {
            title: "Prenotazioni di Gruppo",
            body: "Si applicano condizioni speciali per gruppi di 6+ camere. Contattateci per tariffe e politiche di gruppo."
          }
        },
        payment: {
          title: "Prezzi e Pagamento",
          items: [
            "Le tariffe mostrate sono per unità/notte salvo diversa indicazione",
            "Depositi e metodi di pagamento saranno confermati durante la prenotazione"
          ],
          paymentInfo: {
            title: "Informazioni di Pagamento",
            body: "Tutti i prezzi sono in USD salvo diversa indicazione. I tassi di cambio sono approssimativi e soggetti a variazioni. È richiesta una carta di credito valida per garantire la prenotazione. Potrebbero applicarsi costi aggiuntivi per spese accessorie."
          }
        },
        cancel: {
          title: "Cancellazioni e Mancate presentazioni",
          body: "I termini di cancellazione sono comunicati al momento della prenotazione e nella conferma.",
          cancellationCharges: {
            title: "Costi di Cancellazione",
            plans: [
              {
                planName: "Tariffa semi-flessibile:",
                tiers: [
                  { period: "30 giorni o più prima dell'arrivo", charge: "Rimborso completo" },
                  { period: "29 giorni o meno prima dell'arrivo", charge: "Commissione di cancellazione del 50%" }
                ]
              },
              {
                planName: "Tariffa non rimborsabile:",
                tiers: [
                  { period: "Fino a 24 ore dopo la prenotazione", charge: "Rimborso completo" },
                  { period: "In tutte le altre circostanze", subtext: "Il diritto di modificare la data di arrivo una volta a condizione di pagare la differenza nel caso in cui la nuova data abbia una tariffa più alta.", charge: "Nessun rimborso", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "Politica di Mancata Presentazione",
            body: "Gli ospiti che non si presentano alla data di check-in prevista senza preavviso saranno considerati mancate presentazioni. L'importo totale della prenotazione verrà addebitato e la prenotazione verrà annullata."
          }
        },
        conduct: {
          title: "Comportamento degli ospiti",
          items: [
            "Rispettare le regole della struttura, il personale, gli altri ospiti e la comunità locale",
            "Nessuna attività illegale nei locali"
          ],
          zeroTolerance: {
            title: "Politica di Tolleranza Zero",
            body: "Manteniamo una politica di tolleranza zero per comportamenti molesti, attività illegali o danni alla proprietà. Le violazioni possono comportare l'espulsione immediata senza rimborso e possono portare ad azioni legali."
          }
        },

        "force-majeure": {
          title: "Forza Maggiore",
          intro: "Non siamo responsabili per il mancato adempimento degli obblighi a causa di circostanze al di fuori del nostro ragionevole controllo, tra cui ma non limitato a:",
          items: [
            "Disastri naturali, condizioni meteorologiche estreme",
            "Restrizioni governative, divieti di viaggio",
            "Disordini civili, guerra, terrorismo",
            "Pandemie, epidemie, emergenze sanitarie",
            "Guasti ai servizi pubblici, malfunzionamenti delle infrastrutture"
          ],
          footer: "In tali casi, offriremo date alternative o voucher di credito quando possibile. I rimborsi saranno forniti in conformità con le leggi applicabili e le circostanze. Tuttavia, tutti i danni e i costi che sono o avrebbero potuto essere coperti da pacchetti assicurativi di cancellazione e viaggio generalmente disponibili sono esclusi dalla nostra responsabilità."
        },
        liability: {
          title: "Responsabilità",
          body: "Nella misura consentita dalla legge, non siamo responsabili per perdite indirette o imprevedibili."
        },

        "intellectual-property": {
          title: "Proprietà intellettuale",
          copyright: {
            title: "Avviso sul diritto d'autore",
            body: "Tutti i contenuti di questo sito web, inclusi testo, grafica, loghi e immagini, sono di proprietà di DEVOCEAN Lodge e protetti dalle leggi internazionali sul diritto d'autore. L'uso, la riproduzione o la distribuzione non autorizzati sono vietati. Il nome DEVOCEAN Lodge, il logo e tutti i marchi correlati sono marchi registrati e non possono essere utilizzati senza autorizzazione scritta."
          }
        },
        disputes: {
          title: "Risoluzione delle controversie",
          process: {
            title: "Processo di risoluzione",
            body: "Miriamo a risolvere eventuali controversie in modo amichevole. Si prega di contattarci prima di tentare la risoluzione. Se non risolta, le controversie saranno risolte tramite mediazione prima di intraprendere azioni legali.",
            law: "Legge applicabile: La legge mozambicana regolerà questi termini e qualsiasi controversia.",
            jurisdiction: "Giurisdizione: I tribunali di Maputo, Mozambico avranno giurisdizione esclusiva.",
            mediation: "Mediazione: Le parti concordano di tentare la mediazione tramite un mediatore accreditato prima di avviare procedimenti legali."
          }
        },
        changes: {
          title: "Modifiche a questi Termini",
          body: "Potremmo aggiornare i Termini di tanto in tanto. La versione pubblicata si applica al tuo soggiorno."
        },
        law: {
          title: "Legge applicabile",
          body: "Si applica la legge mozambicana, soggetta alle norme locali obbligatorie di tutela dei consumatori."
        },
        contact: {
          title: "Contatto",
          body: 'Domande? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    cookies: {
      title: "Politica sui cookie",
      effectiveDate: "19 settembre 2025",
      lastUpdated: "06 ottobre 2025",
      managePreferences: "Gestisci le tue preferenze sui cookie:",
      manageText: "Puoi controllare quali cookie utilizziamo tramite il nostro banner dei cookie o le impostazioni del browser.",
      cookieSettingsBtn: "Impostazioni cookie",
      quickLinks: {
        title: "Link rapidi",
        links: [
          { id: "what", text: "Cosa sono i cookie" },
          { id: "how", text: "Come usiamo i cookie" },
          { id: "necessary", text: "Necessari" },
          { id: "functional", text: "Funzionali" },
          { id: "analytics", text: "Analitici" },
          { id: "advertisement", text: "Pubblicitari" },
          { id: "manage", text: "Gestisci preferenze" }
        ]
      },
      sections: {
        badge: {
          title: "Informazioni sui cookie",
          body: "Puoi controllare quali cookie utilizziamo tramite il nostro banner sui cookie o le impostazioni del tuo browser."
        },
        what: {
          title: "Cosa sono i cookie?",
          body: "Questa Politica sui cookie spiega cosa sono i cookie, come li utilizziamo, i tipi di cookie che utilizziamo (cioè le informazioni che raccogliamo tramite i cookie e come vengono utilizzate tali informazioni) e come gestire le impostazioni dei cookie.<br><br>I cookie sono piccoli file di testo utilizzati per memorizzare piccole informazioni. Vengono memorizzati sul tuo dispositivo quando un sito Web viene caricato nel tuo browser. Questi cookie aiutano a garantire che il sito Web funzioni correttamente, migliorano la sicurezza, forniscono una migliore esperienza utente e analizzano le prestazioni per identificare cosa funziona e dove sono necessari miglioramenti."
        },
        how: {
          title: "Come usiamo i cookie?",
          body: "Come la maggior parte dei servizi online, il nostro sito Web utilizza cookie di prima parte e di terze parti per vari scopi. I cookie di prima parte sono principalmente necessari per il corretto funzionamento del sito Web e non raccolgono dati personalmente identificabili.<br><br>I cookie di terze parti utilizzati sul nostro sito Web ci aiutano principalmente a capire come funziona il sito Web, come interagisci con esso, mantieni i nostri servizi sicuri, fornisci pubblicità pertinenti e migliori la tua esperienza utente complessiva migliorando la velocità delle tue future interazioni con il nostro sito Web."
        },
        necessary: {
          title: "Cookie necessari",
          description: "I cookie necessari sono richiesti per abilitare le funzionalità di base di questo sito, come fornire l'accesso sicuro o regolare le preferenze di consenso. Questi cookie non memorizzano dati personalmente identificabili.",
          tableHeaders: { cookie: "Cookie", duration: "Durata", description: "Descrizione" },
          cookies: [
            { name: "currency", duration: "sessione", desc: "Questo cookie viene utilizzato per memorizzare la preferenza di valuta dell'utente." },
            { name: "_sh_session_", duration: "sessione", desc: "Descrizione attualmente non disponibile." },
            { name: "loccur", duration: "sessione", desc: "Descrizione attualmente non disponibile." },
            { name: "country_code", duration: "sessione", desc: "Nessuna descrizione disponibile." },
            { name: "b_locale", duration: "sessione", desc: "Descrizione attualmente non disponibile." },
            { name: "checkout_currency", duration: "sessione", desc: "Descrizione attualmente non disponibile." }
          ]
        },
        functional: {
          title: "Cookie funzionali",
          description: "I cookie funzionali aiutano a eseguire determinate funzionalità come la condivisione del contenuto del sito Web su piattaforme di social media, la raccolta di feedback e altre funzionalità di terze parti.",
          tableHeaders: { cookie: "Cookie", duration: "Durata", description: "Descrizione" },
          cookies: [
            { name: "locale", duration: "sessione", desc: "Facebook imposta questo cookie per migliorare l'esperienza di navigazione dell'utente sul sito Web e per fornire all'utente pubblicità pertinente durante l'utilizzo delle piattaforme di social media di Facebook." }
          ]
        },
        analytics: {
          title: "Cookie analitici",
          description: "I cookie analitici vengono utilizzati per capire come i visitatori interagiscono con il sito Web. Questi cookie aiutano a fornire informazioni su metriche come il numero di visitatori, la frequenza di rimbalzo, la fonte di traffico, ecc.",
          tableHeaders: { cookie: "Cookie", duration: "Durata", description: "Descrizione" },
          cookies: [
            { name: "_ga", duration: "1 anno 1 mese 4 giorni", desc: "Google Analytics imposta questo cookie per calcolare i dati di visitatori, sessioni e campagne e tracciare l'utilizzo del sito per il rapporto di analisi del sito. Il cookie memorizza le informazioni in modo anonimo e assegna un numero generato casualmente per riconoscere i visitatori unici." },
            { name: "_ga_*", duration: "1 anno 1 mese 4 giorni", desc: "Google Analytics imposta questo cookie per memorizzare e contare le visualizzazioni di pagina." },
            { name: "_gid", duration: "1 giorno", desc: "Google Analytics imposta questo cookie per memorizzare informazioni su come i visitatori utilizzano un sito Web creando anche un rapporto di analisi delle prestazioni del sito Web. Alcuni dei dati raccolti includono il numero di visitatori, la loro fonte e le pagine che visitano in modo anonimo." },
            { name: "_gat_UA-*", duration: "1 minuto", desc: "Google Analytics imposta questo cookie per il tracciamento del comportamento dell'utente." },
            { name: "pardot", duration: "passato", desc: "Il cookie pardot viene impostato mentre il visitatore è connesso come utente Pardot. Il cookie indica una sessione attiva e non viene utilizzato per il tracciamento." }
          ]
        },
        advertisement: {
          title: "Cookie pubblicitari",
          description: "I cookie pubblicitari vengono utilizzati per fornire ai visitatori pubblicità personalizzate in base alle pagine che hai visitato in precedenza e per analizzare l'efficacia delle campagne pubblicitarie.",
          tableHeaders: { cookie: "Cookie", duration: "Durata", description: "Descrizione" },
          cookies: [
            { name: "_gcl_au", duration: "3 mesi", desc: "Google Tag Manager imposta questo cookie per sperimentare l'efficienza pubblicitaria dei siti Web che utilizzano i loro servizi." },
            { name: "test_cookie", duration: "15 minuti", desc: "doubleclick.net imposta questo cookie per determinare se il browser dell'utente supporta i cookie." },
            { name: "_fbp", duration: "3 mesi", desc: "Facebook imposta questo cookie per memorizzare e tracciare le interazioni." },
            { name: "IDE", duration: "1 anno 24 giorni", desc: "I cookie Google DoubleClick IDE memorizzano informazioni su come l'utente utilizza il sito Web per presentargli annunci pertinenti in base al profilo utente." }
          ]
        },
        manage: {
          title: "Gestisci le preferenze sui cookie",
          consentTitle: "Preferenze di consenso",
          consentText: "Puoi modificare le impostazioni dei cookie in qualsiasi momento facendo clic sul pulsante 'Preferenze di consenso' sopra. Ciò ti consentirà di rivisitare il banner di consenso dei cookie e aggiornare le tue preferenze o ritirare il tuo consenso immediatamente.",
          browserText: "Inoltre, diversi browser offrono vari metodi per bloccare ed eliminare i cookie utilizzati dai siti Web. Puoi regolare le impostazioni del browser per bloccare o eliminare i cookie. Di seguito sono riportati i collegamenti ai documenti di supporto su come gestire ed eliminare i cookie nei principali browser Web.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Se stai utilizzando un browser Web diverso, consulta la documentazione di supporto ufficiale."
          }
        }
      }
    },

    gdpr: {
      title: "Avviso GDPR",
      updatedDate: "06 ott 2025",
      backToHome: "Torna alla Home",
      quickLinksTitle: "Link rapidi",
      gdprBadge: '<strong>Conforme al GDPR:</strong> Ci impegniamo a proteggere i tuoi dati personali e a rispettare i tuoi diritti alla privacy ai sensi del Regolamento Generale sulla Protezione dei Dati.',
      quickLinks: {
        title: "Link rapidi",
        links: [
          { id: "controller", text: "Titolare" },
          { id: "bases", text: "Basi giuridiche" },
          { id: "rights", text: "I tuoi diritti" },
          { id: "retention", text: "Conservazione dei dati" },
          { id: "transfers", text: "Trasferimenti di dati" },
          { id: "complaints", text: "Reclami" }
        ]
      },
      sections: {
        badge: {
          title: "Conforme al GDPR:",
          body: "Ci impegniamo a proteggere i tuoi dati personali e a rispettare i tuoi diritti alla privacy ai sensi del Regolamento Generale sulla Protezione dei Dati."
        },
        controller: {
          title: "Titolare del trattamento dei dati",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), registrata a Rua C, Parcela 12, Maputo 1118, Mozambico, agisce come titolare del trattamento delle tue informazioni personali raccolte tramite i nostri servizi."
        },
        bases: {
          title: "Basi giuridiche per il trattamento",
          body: "Trattiamo i tuoi dati personali sulla base delle seguenti basi giuridiche ai sensi del GDPR:"
        },
        rights: {
          title: "I tuoi diritti ai sensi del GDPR",
          body: "In qualità di interessato ai sensi del GDPR, hai i seguenti diritti relativi ai tuoi dati personali:"
        },
        transfers: {
          title: "Trasferimenti internazionali di dati",
          body: "Quando trasferiamo i tuoi dati al di fuori dello Spazio Economico Europeo (SEE), garantiamo che siano in atto misure di salvaguardia adeguate per proteggere le tue informazioni. Ciò può includere l'uso di Clausole Contrattuali Standard approvate dalla Commissione Europea o il trasferimento di dati in paesi con decisioni di adeguatezza."
        },
        dpo: {
          title: "Contatta il nostro Responsabile della Protezione dei Dati",
          body: 'Per qualsiasi domanda relativa al GDPR o per esercitare i tuoi diritti, contatta il nostro Responsabile della Protezione dei Dati all\'indirizzo <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Risponderemo alla tua richiesta entro 30 giorni come richiesto dal GDPR.'
        }
      },
      basisContract: '<strong>Contratto:</strong> Trattamento necessario per adempiere ai nostri accordi di prenotazione e servizi.',
      basisLegal: '<strong>Obbligo legale:</strong> Trattamento richiesto per conformarsi ai requisiti legali (ad esempio, leggi fiscali).',
      basisLegitimate: '<strong>Interessi legittimi:</strong> Trattamento per i nostri legittimi interessi commerciali nel rispetto dei tuoi diritti.',
      basisConsent: '<strong>Consenso:</strong> Trattamento basato sul tuo consenso esplicito per scopi specifici.',
      rightAccessTitle: 'Diritto di accesso',
      rightAccessDesc: 'Puoi richiedere copie dei tuoi dati personali che deteniamo.',
      rightRectificationTitle: 'Diritto di rettifica',
      rightRectificationDesc: 'Puoi richiedere la correzione di dati inesatti o incompleti.',
      rightErasureTitle: 'Diritto alla cancellazione',
      rightErasureDesc: 'Puoi richiedere la cancellazione dei tuoi dati personali a determinate condizioni.',
      rightRestrictTitle: 'Diritto alla limitazione del trattamento',
      rightRestrictDesc: 'Puoi richiedere la limitazione di come utilizziamo i tuoi dati.',
      rightPortabilityTitle: 'Diritto alla portabilità dei dati',
      rightPortabilityDesc: 'Puoi richiedere il trasferimento dei tuoi dati a un\'altra organizzazione.',
      rightObjectTitle: 'Diritto di opposizione',
      rightObjectDesc: 'Puoi opporti a determinati tipi di trattamento dei tuoi dati.',
      btnRequestAccess: 'Richiedi accesso ai dati',
      btnRequestDeletion: 'Richiedi cancellazione dati',
      retentionTitle: 'Conservazione dei dati',
      retentionPeriodsTitle: 'Periodi di conservazione',
      retentionIntro: 'Conserviamo i dati personali solo per il tempo necessario a soddisfare le finalità per cui sono stati raccolti, inclusi i requisiti legali, contabili o di reporting.',
      retentionBooking: '<strong>Dati di prenotazione:</strong> 7 anni per conformità fiscale e legale',
      retentionCustomer: '<strong>Comunicazioni del servizio clienti:</strong> 3 anni',
      retentionMarketing: '<strong>Consensi di marketing:</strong> Fino alla revoca del consenso',
      retentionAnalytics: '<strong>Analisi del sito web:</strong> 26 mesi',
      retentionFinancial: '<strong>Transazioni finanziarie:</strong> 10 anni per scopi contabili',
      transfersSafeguards: '<strong>Trasferimenti internazionali di dati:</strong> Garantiamo che siano in atto misure di salvaguardia adeguate per tutti i trasferimenti di dati al di fuori del SEE, incluse le Clausole Contrattuali Standard e le decisioni di adeguatezza.',
      complaintsTitle: 'Reclami',
      complaintsIntro: 'Se hai dubbi su come trattiamo i tuoi dati personali, hai il diritto di presentare un reclamo alla tua autorità locale per la protezione dei dati.',
      complaintsAuthority: '<strong>Autorità di controllo principale:</strong> Autorità portoghese per la protezione dei dati (CNPD)<br><strong>Sito web:</strong> <a href="https://www.cnpd.pt" target="_blank">www.cnpd.pt</a><br><strong>Contatto:</strong> +351 213 928 400',
      complaintsContactFirst: 'Ti invitiamo a contattarci prima per risolvere eventuali preoccupazioni prima di rivolgerti all\'autorità di controllo.'
    },

    cric: {
      title: "CRIC — Azienda & Contatto",
      updatedDate: "27 set 2025",
      quickLinks: {
        title: "Collegamenti rapidi",
        links: [
          { id: "intro", text: "Panoramica" },
          { id: "contact", text: "Contatto" },
          { id: "emergency", text: "Emergenza" }
        ]
      },
      sections: {
        badge: {
          title: "Informazioni ufficiali dell'azienda:",
          body: "Dettagli completi di registrazione aziendale e informazioni di contatto per DEVOCEAN Lodge."
        },
        intro: {
          title: "Panoramica",
          body: "Dati completi di registrazione aziendale e informazioni di contatto per DEVOCEAN Lodge."
        },
        contact: {
          title: "Contatto",
          body: 'Per richieste generali, prenotazioni e informazioni sui nostri servizi, utilizzare i dati di contatto forniti di seguito.'
        },
        emergency: {
          title: "Contatto di emergenza",
          body: "Per questioni urgenti al di fuori dell'orario lavorativo, utilizzare i nostri dati di contatto di emergenza."
        }
      },
      labels: {
        companyName: "Nome dell'azienda",
        registration: "Registrazione commerciale",
        vat: "Partita IVA (NUIT)",
        license: "Licenza commerciale (Alvará)",
        legalForm: "Forma giuridica",
        capital: "Capitale sociale",
        address: "Indirizzo registrato",
        email: "E-mail",
        phone: "Telefono",
        businessHours: "Orari di apertura",
        emergencyPhone: "Telefono di emergenza",
        emergencyEmail: "E-mail di emergenza"
      },
      legalForm: "Società a responsabilità limitata",
      businessHours: "Lunedì - Venerdì: 8:00 - 18:00<br>Sabato & Domenica: 8:00 - 12:00<br>Reception: 6:00 - 22:00 (per gli ospiti)",
      emergencyPhoneNote: "Per questioni urgenti al di fuori dell'orario lavorativo"
    }
  };

  // -------- SPANISH --------
  window.LEGAL_DICT.es = {
    privacy: {
      title: "Política de privacidad",
      updatedDate: "06 oct 2025",      quickLinks: {
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
        badge: {
          title: "Su privacidad es importante:",
          body: "Estamos comprometidos a proteger sus datos personales y ser transparentes sobre cómo los recopilamos, usamos y protegemos."
        },
        who: {
          title: "Quiénes somos",
          body: "DEVOCEAN Lodge es operado por TERRAfrique LDA, una empresa registrada en Mozambique. Nuestra dirección registrada es Rua C, Parcela 12, Maputo 1118, Mozambique. Operamos alojamiento ecológico en la playa en Ponta do Ouro, Mozambique. Estamos comprometidos a proteger su privacidad y garantizar que sus datos personales se recopilen, procesen y utilicen de manera adecuada, legal y transparente de acuerdo con las leyes aplicables de protección de datos."
        },
        collect: {
          title: "Qué datos personales recopilamos",
          intro: "Recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:",
          categories: [
            {
              title: "Información personal",
              items: [
                "Nombre, datos de contacto",
                "Información de pasaporte/identificación",
                "Información de pago",
                "Preferencias de reserva"
              ]
            },
            {
              title: "Datos técnicos",
              items: [
                "Dirección IP, información del dispositivo",
                "Tipo y versión del navegador",
                "Análisis de uso del sitio web",
                "Datos de cookies (con consentimiento)"
              ]
            },
            {
              title: "Datos de comunicación",
              items: [
                "Correspondencia por correo electrónico",
                "Solicitudes de servicio al cliente",
                "Comentarios y reseñas",
                "Preferencias de marketing"
              ]
            }
          ]
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
            "Cifrado de datos sensibles en tránsito y en reposo",
            "Evaluaciones de seguridad regulares y pruebas de penetración",
            "Controles de acceso y mecanismos de autenticación",
            "Capacitación del personal sobre protección de datos y privacidad",
            "Procedimientos seguros de respaldo de datos y recuperación ante desastres"
          ]
        },
        retention: {
          title: "Retención de datos",
          body: "Conservaremos tu información personal durante el tiempo necesario para cumplir los propósitos para los que fue recopilada, como se detalla en esta Política de privacidad. Generalmente, conservamos los datos personales hasta 1 año después de tu última interacción con nosotros, a menos que se requiera o permita un período de retención más largo por ley. Es posible que necesitemos conservar cierta información durante períodos más largos por razones específicas, que incluyen: mantenimiento de registros e informes de acuerdo con la ley aplicable (generalmente 7 años para registros financieros y fiscales), aplicación de derechos legales, prevención de fraude y resolución de disputas. Una vez que expire el período de retención, tus datos personales se eliminarán de forma segura o se anonimizarán. La información anónima residual y la información agregada, que no te identifica directa o indirectamente, puede almacenarse indefinidamente para fines estadísticos y analíticos."
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
          body: 'Si tienes alguna pregunta, inquietud o solicitud relacionada con esta Política de privacidad o el procesamiento de tu información personal, o si deseas ejercer alguno de tus derechos de privacidad, contáctanos en:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Teléfono:</strong> +258 8441 82252<br><strong>Dirección postal:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique<br><br>Responderemos a tu solicitud de acuerdo con la ley de protección de datos aplicable. Para quejas o inquietudes sobre el procesamiento de tu información, también puedes contactar a nuestro Delegado de Protección de Datos en la dirección de correo electrónico anterior.'
        },
        transfers: {
          title: "Transferencias internacionales de datos",
          body: "Como operamos en múltiples jurisdicciones, tus datos pueden ser transferidos y procesados en países fuera de tu residencia. Nos aseguramos de que dichas transferencias cumplan con las leyes aplicables de protección de datos a través de decisiones de adecuación de la Comisión Europea, Cláusulas Contractuales Estándar (CCE), salvaguardias de seguridad apropiadas y transparencia sobre las ubicaciones de transferencia."
        },
        updates: {
          title: "Actualizaciones de la política",
          body: "Podemos actualizar esta política de privacidad de vez en cuando para reflejar cambios en nuestras prácticas, tecnología, requisitos legales u otros factores. Te notificaremos sobre cualquier cambio importante mediante notificaciones por correo electrónico para usuarios registrados, avisos destacados en nuestro sitio web y una fecha de actualización actualizada. Te recomendamos que revises esta política periódicamente para mantenerte informado sobre cómo protegemos tu información."
        }
      }
    },

    terms: {
      title: "Términos y Condiciones",
      updatedDate: "06 oct 2025",      quickLinks: {
        title: "Enlaces rápidos",
        links: [
          { id: "intro", text: "Alcance" },
          { id: "booking", text: "Reservas" },
          { id: "payment", text: "Precios y Pago" },
          { id: "cancel", text: "Cancelaciones y Ausencias" },
          { id: "conduct", text: "Conducta del huésped" },
          { id: "force-majeure", text: "Fuerza mayor" },
          { id: "liability", text: "Responsabilidad" },
          { id: "intellectual-property", text: "Propiedad intelectual" },
          { id: "disputes", text: "Resolución de disputas" },
          { id: "changes", text: "Cambios" },
          { id: "law", text: "Ley aplicable" },
          { id: "contact", text: "Contacto" }
        ]
      },
      sections: {
        badge: {
          title: "Aviso legal importante:",
          body: "Estos términos rigen su uso de nuestros servicios y sitio web. Por favor, léalos detenidamente antes de hacer una reserva."
        },
        intro: {
          title: "Alcance",
          body: "Estos Términos rigen el alojamiento y los servicios relacionados proporcionados por DEVOCEAN Lodge (TERRAfrique LDA). Al hacer una reserva, acepta estos Términos."
        },
        booking: {
          title: "Reservas",
          items: [
            "Proporcione información precisa sobre los huéspedes y fechas de llegada/salida",
            "Las solicitudes especiales están sujetas a disponibilidad y confirmación"
          ],
          reservationReq: {
            title: "Requisitos de Reserva",
            body: "Se requiere identificación válida y tarjeta de crédito para todas las reservas. Edad mínima: 18 años."
          },
          checkinCheckout: {
            title: "Entrada/Salida",
            body: "Entrada: 14:00 | Salida: 11:00. Solicitudes tempranas/tardías sujetas a disponibilidad."
          },
          groupBookings: {
            title: "Reservas de Grupo",
            body: "Se aplican condiciones especiales para grupos de 6+ habitaciones. Contáctenos para tarifas y políticas de grupo."
          }
        },
        payment: {
          title: "Precios y Pago",
          items: [
            "Las tarifas mostradas son por unidad/noche a menos que se indique lo contrario",
            "Los depósitos y métodos de pago se confirmarán durante la reserva"
          ],
          paymentInfo: {
            title: "Información de Pago",
            body: "Todos los precios están en USD a menos que se indique lo contrario. Los tipos de cambio son aproximados y están sujetos a cambios. Se requiere una tarjeta de crédito válida para garantizar su reserva. Pueden aplicarse cargos adicionales por gastos imprevistos."
          }
        },
        cancel: {
          title: "Cancelaciones y Ausencias",
          body: "Los términos de cancelación se revelan en el momento de la reserva y en su confirmación.",
          cancellationCharges: {
            title: "Cargos por Cancelación",
            plans: [
              {
                planName: "Tarifa semi-flexible:",
                tiers: [
                  { period: "30 días o más antes de la llegada", charge: "Reembolso completo" },
                  { period: "29 días o menos antes de la llegada", charge: "Cargo por cancelación del 50%" }
                ]
              },
              {
                planName: "Tarifa no reembolsable:",
                tiers: [
                  { period: "Hasta 24 horas después de la reserva", charge: "Reembolso completo" },
                  { period: "En todas las demás circunstancias", subtext: "El derecho de modificar la fecha de llegada una vez bajo la condición de pagar la diferencia en caso de que la nueva fecha tenga una tarifa más alta.", charge: "Sin reembolso", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "Política de No Presentación",
            body: "Los huéspedes que no lleguen en la fecha de entrada programada sin notificación previa serán considerados no presentados. Se cobrará el monto total de la reserva y la reserva será cancelada."
          }
        },
        conduct: {
          title: "Conducta del huésped",
          items: [
            "Respetar las reglas de la propiedad, el personal, otros huéspedes y la comunidad local",
            "No se permiten actividades ilegales en las instalaciones"
          ],
          zeroTolerance: {
            title: "Política de Tolerancia Cero",
            body: "Mantenemos una política de tolerancia cero para comportamientos disruptivos, actividades ilegales o daños a la propiedad. Las violaciones pueden resultar en desalojo inmediato sin reembolso y pueden dar lugar a acciones legales."
          }
        },

        "force-majeure": {
          title: "Fuerza Mayor",
          intro: "No somos responsables por el incumplimiento de obligaciones debido a circunstancias fuera de nuestro control razonable, incluyendo pero no limitado a:",
          items: [
            "Desastres naturales, condiciones meteorológicas extremas",
            "Restricciones gubernamentales, prohibiciones de viaje",
            "Disturbios civiles, guerra, terrorismo",
            "Pandemias, epidemias, emergencias sanitarias",
            "Fallos en servicios públicos, averías de infraestructura"
          ],
          footer: "En tales casos, ofreceremos fechas alternativas o vales de crédito cuando sea posible. Los reembolsos se proporcionarán de acuerdo con las leyes aplicables y las circunstancias. Sin embargo, todos los daños y costos que estén o pudieran haber estado cubiertos por paquetes de seguro de cancelación y viaje generalmente disponibles están excluidos de nuestra responsabilidad."
        },
        liability: {
          title: "Responsabilidad",
          body: "En la medida permitida por la ley, no somos responsables de pérdidas indirectas o imprevistas."
        },

        "intellectual-property": {
          title: "Propiedad intelectual",
          copyright: {
            title: "Aviso de derechos de autor",
            body: "Todo el contenido de este sitio web, incluidos texto, gráficos, logotipos e imágenes, es propiedad de DEVOCEAN Lodge y está protegido por las leyes internacionales de derechos de autor. El uso, reproducción o distribución no autorizados están prohibidos. El nombre DEVOCEAN Lodge, el logotipo y todas las marcas relacionadas son marcas registradas y no pueden usarse sin permiso por escrito."
          }
        },
        disputes: {
          title: "Resolución de disputas",
          process: {
            title: "Proceso de resolución",
            body: "Aspiramos a resolver cualquier disputa de manera amigable. Por favor, contáctenos primero para intentar la resolución. Si no se resuelve, las disputas se resolverán mediante mediación antes de emprender acciones legales.",
            law: "Ley aplicable: La ley mozambiqueña regirá estos términos y cualquier disputa.",
            jurisdiction: "Jurisdicción: Los tribunales de Maputo, Mozambique tendrán jurisdicción exclusiva.",
            mediation: "Mediación: Las partes acuerdan intentar la mediación a través de un mediador acreditado antes de iniciar procedimientos legales."
          }
        },
        changes: {
          title: "Cambios en estos Términos",
          body: "Podemos actualizar los Términos de vez en cuando. La versión publicada se aplica a su estadía."
        },
        law: {
          title: "Ley aplicable",
          body: "Se aplica la ley mozambiqueña, sujeta a las normas locales obligatorias de protección del consumidor."
        },
        contact: {
          title: "Contacto",
          body: '¿Preguntas? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    cookies: {
      title: "Política de cookies",
      effectiveDate: "19 de septiembre de 2025",
      lastUpdated: "06 de octubre de 2025",
      managePreferences: "Gestione sus preferencias de cookies:",
      manageText: "Puede controlar qué cookies utilizamos a través de nuestro banner de cookies o la configuración de su navegador.",
      cookieSettingsBtn: "Configuración de cookies",
      quickLinks: {
        title: "Enlaces rápidos",
        links: [
          { id: "what", text: "Qué son las cookies" },
          { id: "how", text: "Cómo usamos las cookies" },
          { id: "necessary", text: "Necesarias" },
          { id: "functional", text: "Funcionales" },
          { id: "analytics", text: "Analíticas" },
          { id: "advertisement", text: "Publicitarias" },
          { id: "manage", text: "Gestionar preferencias" }
        ]
      },
      sections: {
        badge: {
          title: "Acerca de las cookies",
          body: "Puede controlar qué cookies usamos a través de nuestro banner de cookies o la configuración de su navegador."
        },
        what: {
          title: "¿Qué son las cookies?",
          body: "Esta Política de cookies explica qué son las cookies, cómo las usamos, los tipos de cookies que usamos (es decir, la información que recopilamos mediante cookies y cómo se utiliza esa información), y cómo gestionar su configuración de cookies.<br><br>Las cookies son pequeños archivos de texto utilizados para almacenar pequeñas piezas de información. Se almacenan en su dispositivo cuando un sitio web se carga en su navegador. Estas cookies ayudan a garantizar que el sitio web funcione correctamente, mejoran la seguridad, proporcionan una mejor experiencia de usuario y analizan el rendimiento para identificar qué funciona y dónde se necesitan mejoras."
        },
        how: {
          title: "¿Cómo usamos las cookies?",
          body: "Como la mayoría de los servicios en línea, nuestro sitio web utiliza cookies de origen y de terceros para diversos fines. Las cookies de origen son principalmente necesarias para que el sitio web funcione correctamente y no recopilan datos personalmente identificables.<br><br>Las cookies de terceros utilizadas en nuestro sitio web nos ayudan principalmente a comprender cómo funciona el sitio web, cómo interactúa con él, mantener nuestros servicios seguros, ofrecer anuncios relevantes y mejorar su experiencia general de usuario mientras mejoramos la velocidad de sus futuras interacciones con nuestro sitio web."
        },
        necessary: {
          title: "Cookies necesarias",
          description: "Las cookies necesarias son necesarias para habilitar las funciones básicas de este sitio, como proporcionar inicio de sesión seguro o ajustar sus preferencias de consentimiento. Estas cookies no almacenan datos personalmente identificables.",
          tableHeaders: { cookie: "Cookie", duration: "Duración", description: "Descripción" },
          cookies: [
            { name: "currency", duration: "sesión", desc: "Esta cookie se utiliza para almacenar la preferencia de moneda del usuario." },
            { name: "_sh_session_", duration: "sesión", desc: "Descripción actualmente no disponible." },
            { name: "loccur", duration: "sesión", desc: "Descripción actualmente no disponible." },
            { name: "country_code", duration: "sesión", desc: "Sin descripción disponible." },
            { name: "b_locale", duration: "sesión", desc: "Descripción actualmente no disponible." },
            { name: "checkout_currency", duration: "sesión", desc: "Descripción actualmente no disponible." }
          ]
        },
        functional: {
          title: "Cookies funcionales",
          description: "Las cookies funcionales ayudan a realizar ciertas funcionalidades como compartir el contenido del sitio web en plataformas de redes sociales, recopilar comentarios y otras características de terceros.",
          tableHeaders: { cookie: "Cookie", duration: "Duración", description: "Descripción" },
          cookies: [
            { name: "locale", duration: "sesión", desc: "Facebook establece esta cookie para mejorar la experiencia de navegación del usuario en el sitio web y para proporcionar al usuario publicidad relevante mientras usa las plataformas de redes sociales de Facebook." }
          ]
        },
        analytics: {
          title: "Cookies analíticas",
          description: "Las cookies analíticas se utilizan para comprender cómo los visitantes interactúan con el sitio web. Estas cookies ayudan a proporcionar información sobre métricas como el número de visitantes, la tasa de rebote, la fuente de tráfico, etc.",
          tableHeaders: { cookie: "Cookie", duration: "Duración", description: "Descripción" },
          cookies: [
            { name: "_ga", duration: "1 año 1 mes 4 días", desc: "Google Analytics establece esta cookie para calcular datos de visitantes, sesiones y campañas y rastrear el uso del sitio para el informe de análisis del sitio. La cookie almacena información de forma anónima y asigna un número generado aleatoriamente para reconocer visitantes únicos." },
            { name: "_ga_*", duration: "1 año 1 mes 4 días", desc: "Google Analytics establece esta cookie para almacenar y contar vistas de página." },
            { name: "_gid", duration: "1 día", desc: "Google Analytics establece esta cookie para almacenar información sobre cómo los visitantes usan un sitio web mientras también crea un informe de análisis del rendimiento del sitio web. Algunos de los datos recopilados incluyen el número de visitantes, su fuente y las páginas que visitan de forma anónima." },
            { name: "_gat_UA-*", duration: "1 minuto", desc: "Google Analytics establece esta cookie para el seguimiento del comportamiento del usuario." },
            { name: "pardot", duration: "pasado", desc: "La cookie pardot se establece mientras el visitante está conectado como usuario de Pardot. La cookie indica una sesión activa y no se utiliza para rastreo." }
          ]
        },
        advertisement: {
          title: "Cookies publicitarias",
          description: "Las cookies publicitarias se utilizan para proporcionar a los visitantes anuncios personalizados basados en las páginas que visitó anteriormente y para analizar la efectividad de las campañas publicitarias.",
          tableHeaders: { cookie: "Cookie", duration: "Duración", description: "Descripción" },
          cookies: [
            { name: "_gcl_au", duration: "3 meses", desc: "Google Tag Manager establece esta cookie para experimentar con la eficiencia publicitaria de sitios web que utilizan sus servicios." },
            { name: "test_cookie", duration: "15 minutos", desc: "doubleclick.net establece esta cookie para determinar si el navegador del usuario admite cookies." },
            { name: "_fbp", duration: "3 meses", desc: "Facebook establece esta cookie para almacenar y rastrear interacciones." },
            { name: "IDE", duration: "1 año 24 días", desc: "Las cookies Google DoubleClick IDE almacenan información sobre cómo el usuario utiliza el sitio web para presentarle anuncios relevantes según el perfil del usuario." }
          ]
        },
        manage: {
          title: "Gestionar preferencias de cookies",
          consentTitle: "Preferencias de consentimiento",
          consentText: "Puede modificar su configuración de cookies en cualquier momento haciendo clic en el botón 'Preferencias de consentimiento' arriba. Esto le permitirá revisar el banner de consentimiento de cookies y actualizar sus preferencias o retirar su consentimiento inmediatamente.",
          browserText: "Además, diferentes navegadores ofrecen varios métodos para bloquear y eliminar cookies utilizadas por sitios web. Puede ajustar la configuración de su navegador para bloquear o eliminar cookies. A continuación se encuentran enlaces a documentos de soporte sobre cómo gestionar y eliminar cookies en los principales navegadores web.",
          browsers: {
            chrome: "Chrome",
            safari: "Safari",
            firefox: "Firefox",
            ie: "Internet Explorer",
            other: "Si está utilizando un navegador web diferente, consulte su documentación de soporte oficial."
          }
        }
      }
    },

    gdpr: {
      title: "Aviso RGPD",
      updatedDate: "06 oct 2025",
      backToHome: "Volver al inicio",
      quickLinksTitle: "Enlaces rápidos",
      gdprBadge: '<strong>Conforme al RGPD:</strong> Estamos comprometidos a proteger tus datos personales y respetar tus derechos de privacidad bajo el Reglamento General de Protección de Datos.',
      quickLinks: {
        title: "Enlaces rápidos",
        links: [
          { id: "controller", text: "Responsable" },
          { id: "bases", text: "Bases legales" },
          { id: "rights", text: "Tus derechos" },
          { id: "retention", text: "Retención de datos" },
          { id: "transfers", text: "Transferencias de datos" },
          { id: "complaints", text: "Quejas" }
        ]
      },
      sections: {
        badge: {
          title: "Conforme al RGPD:",
          body: "Estamos comprometidos a proteger sus datos personales y respetar sus derechos de privacidad bajo el Reglamento General de Protección de Datos."
        },
        controller: {
          title: "Responsable del tratamiento de datos",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), registrada en Rua C, Parcela 12, Maputo 1118, Mozambique, actúa como responsable del tratamiento de tu información personal recopilada a través de nuestros servicios."
        },
        bases: {
          title: "Bases legales para el tratamiento",
          body: "Tratamos tus datos personales basándonos en las siguientes bases legales bajo el RGPD:"
        },
        rights: {
          title: "Tus derechos bajo el RGPD",
          body: "Como interesado bajo el RGPD, tienes los siguientes derechos con respecto a tus datos personales:"
        },
        transfers: {
          title: "Transferencias internacionales de datos",
          body: "Cuando transferimos tus datos fuera del Espacio Económico Europeo (EEE), garantizamos que existan las salvaguardias adecuadas para proteger tu información. Esto puede incluir el uso de Cláusulas Contractuales Tipo aprobadas por la Comisión Europea o la transferencia de datos a países con decisiones de adecuación."
        },
        dpo: {
          title: "Contacta con nuestro Delegado de Protección de Datos",
          body: 'Para cualquier pregunta relacionada con el RGPD o para ejercer tus derechos, contacta con nuestro Delegado de Protección de Datos en <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Responderemos a tu solicitud dentro de los 30 días requeridos por el RGPD.'
        }
      },
      basisContract: '<strong>Contrato:</strong> Tratamiento necesario para cumplir nuestros acuerdos de reserva y servicios.',
      basisLegal: '<strong>Obligación legal:</strong> Tratamiento requerido para cumplir con requisitos legales (por ejemplo, leyes fiscales).',
      basisLegitimate: '<strong>Intereses legítimos:</strong> Tratamiento para nuestros intereses comerciales legítimos respetando tus derechos.',
      basisConsent: '<strong>Consentimiento:</strong> Tratamiento basado en tu consentimiento explícito para propósitos específicos.',
      rightAccessTitle: 'Derecho de acceso',
      rightAccessDesc: 'Puedes solicitar copias de tus datos personales que conservamos.',
      rightRectificationTitle: 'Derecho de rectificación',
      rightRectificationDesc: 'Puedes solicitar la corrección de datos inexactos o incompletos.',
      rightErasureTitle: 'Derecho de supresión',
      rightErasureDesc: 'Puedes solicitar la eliminación de tus datos personales bajo ciertas condiciones.',
      rightRestrictTitle: 'Derecho a la limitación del tratamiento',
      rightRestrictDesc: 'Puedes solicitar la limitación de cómo usamos tus datos.',
      rightPortabilityTitle: 'Derecho a la portabilidad de datos',
      rightPortabilityDesc: 'Puedes solicitar la transferencia de tus datos a otra organización.',
      rightObjectTitle: 'Derecho de oposición',
      rightObjectDesc: 'Puedes oponerte a ciertos tipos de tratamiento de tus datos.',
      btnRequestAccess: 'Solicitar acceso a datos',
      btnRequestDeletion: 'Solicitar eliminación de datos',
      retentionTitle: 'Retención de datos',
      retentionPeriodsTitle: 'Períodos de retención',
      retentionIntro: 'Conservamos los datos personales solo durante el tiempo necesario para cumplir los propósitos para los que fueron recopilados, incluidos los requisitos legales, contables o de informes.',
      retentionBooking: '<strong>Datos de reserva:</strong> 7 años para cumplimiento fiscal y legal',
      retentionCustomer: '<strong>Comunicaciones de atención al cliente:</strong> 3 años',
      retentionMarketing: '<strong>Consentimientos de marketing:</strong> Hasta la retirada del consentimiento',
      retentionAnalytics: '<strong>Análisis del sitio web:</strong> 26 meses',
      retentionFinancial: '<strong>Transacciones financieras:</strong> 10 años para fines contables',
      transfersSafeguards: '<strong>Transferencias internacionales de datos:</strong> Garantizamos que existan las salvaguardias adecuadas para todas las transferencias de datos fuera del EEE, incluidas las Cláusulas Contractuales Tipo y decisiones de adecuación.',
      complaintsTitle: 'Quejas',
      complaintsIntro: 'Si tienes preocupaciones sobre cómo manejamos tus datos personales, tienes derecho a presentar una queja ante tu autoridad local de protección de datos.',
      complaintsAuthority: '<strong>Autoridad de supervisión principal:</strong> Autoridad Portuguesa de Protección de Datos (CNPD)<br><strong>Sitio web:</strong> <a href="https://www.cnpd.pt" target="_blank">www.cnpd.pt</a><br><strong>Contacto:</strong> +351 213 928 400',
      complaintsContactFirst: 'Te animamos a contactarnos primero para resolver cualquier preocupación antes de acudir a la autoridad de supervisión.'
    },

    cric: {
      title: "CRIC — Empresa & Contacto",
      updatedDate: "27 sep 2025",
      quickLinks: {
        title: "Enlaces rápidos",
        links: [
          { id: "intro", text: "Resumen" },
          { id: "contact", text: "Contacto" },
          { id: "emergency", text: "Emergencia" }
        ]
      },
      sections: {
        badge: {
          title: "Información oficial de la empresa:",
          body: "Detalles completos de registro comercial e información de contacto para DEVOCEAN Lodge."
        },
        intro: {
          title: "Resumen",
          body: "Datos completos de registro empresarial e información de contacto para DEVOCEAN Lodge."
        },
        contact: {
          title: "Contacto",
          body: 'Para consultas generales, reservas e información sobre nuestros servicios, utilice los datos de contacto proporcionados a continuación.'
        },
        emergency: {
          title: "Contacto de emergencia",
          body: "Para asuntos urgentes fuera del horario comercial, utilice nuestros datos de contacto de emergencia."
        }
      },
      labels: {
        companyName: "Nombre de la empresa",
        registration: "Registro comercial",
        vat: "Número de IVA (NUIT)",
        license: "Licencia comercial (Alvará)",
        legalForm: "Forma legal",
        capital: "Capital social",
        address: "Dirección registrada",
        email: "Correo electrónico",
        phone: "Teléfono",
        businessHours: "Horario comercial",
        emergencyPhone: "Teléfono de emergencia",
        emergencyEmail: "Correo electrónico de emergencia"
      },
      legalForm: "Sociedad de responsabilidad limitada",
      businessHours: "Lunes - Viernes: 8:00 - 18:00<br>Sábado & Domingo: 8:00 - 12:00<br>Recepción: 6:00 - 22:00 (para huéspedes)",
      emergencyPhoneNote: "Para asuntos urgentes fuera del horario comercial"
    }
  };

  // -------- SWEDISH --------
  window.LEGAL_DICT.sv = {
    privacy: {
      title: "Integritetspolicy",
      updatedDate: "06 okt 2025",
      quickLinks: {
        title: "Snabblänkar",
        links: [
          { id: "who", text: "Vilka vi är" },
          { id: "collect", text: "Datainsamling" },
          { id: "use", text: "Dataanvändning" },
          { id: "share", text: "Datadelning" },
          { id: "security", text: "Säkerhet" },
          { id: "retention", text: "Lagring" },
          { id: "rights", text: "Dina rättigheter" },
          { id: "transfers", text: "Internationella överföringar" },
          { id: "contact", text: "Kontakt" },
          { id: "updates", text: "Uppdateringar" }
        ]
      },
      sections: {
        badge: {
          title: "Din integritet är viktig:",
          body: "Vi är dedikerade till att skydda dina personuppgifter och vara transparenta om hur vi samlar in, använder och skyddar din information."
        },
        who: {
          title: "Vilka vi är",
          body: "DEVOCEAN Lodge drivs av TERRAfrique LDA, ett företag registrerat i Moçambique. Vår registrerade adress är Rua C, Parcela 12, Maputo 1118, Moçambique. Vi driver miljövänligt strandboende i Ponta do Ouro, Moçambique. Vi är dedikerade till att skydda din integritet och säkerställa att dina personuppgifter samlas in, behandlas och används korrekt, lagligt och transparent i enlighet med tillämpliga dataskyddslagar. Genom att besöka eller använda vår webbplats och tjänster samtycker du till insamling och användning av din information enligt denna integritetspolicy."
        },
        collect: {
          title: "Vilka personuppgifter vi samlar in",
          intro: "Vi samlar in olika typer av information för att tillhandahålla och förbättra våra tjänster:",
          categories: [
            {
              title: "Personlig information",
              items: [
                "Namn, kontaktuppgifter",
                "Pass-/ID-information",
                "Betalningsinformation",
                "Bokningspreferenser"
              ]
            },
            {
              title: "Teknisk data",
              items: [
                "IP-adress, enhetsinformation",
                "Webbläsartyp och version",
                "Webbplatsanvändningsanalys",
                "Cookie-data (med samtycke)"
              ]
            },
            {
              title: "Kommunikationsdata",
              items: [
                "E-postkorrespondens",
                "Kundserviceförfrågningar",
                "Feedback och recensioner",
                "Marknadsföringspreferenser"
              ]
            }
          ]
        },
        use: {
          title: "Hur vi använder dina data",
          items: [
            "Hantera bokningar och tillhandahålla tjänster",
            "Kommunicera om din vistelse, policies och erbjudanden (opt-in)",
            "Förbättra vår webbplats och tjänster (analys, säkerhet)",
            "Uppfylla juridiska/ekonomiska skyldigheter"
          ]
        },
        share: {
          title: "När vi delar data",
          items: [
            "Betalningsleverantörer och bokningsplattformar för att behandla dina reservationer och betalningar",
            "Analystjänster för att förstå webbplatsanvändning och förbättra våra tjänster",
            "Annonstjänster för riktad marknadsföring (endast med ditt samtycke)",
            "IT-tjänsteleverantörer, hostingleverantörer och teknisk support under strikta sekretessavtal",
            "Rättsmyndigheter när det krävs enligt lag, förordning, domstolsbeslut eller annan rättslig process",
            "För att upprätthålla våra avtal eller skydda våra rättigheter, egendom eller säkerhet",
            "Vid en fusion, förvärv eller försäljning av tillgångar kan din information överföras till den nya ägaren"
          ],
          footer: "Vi kräver att alla tredje parter respekterar säkerheten för dina personuppgifter och endast använder dem för de ändamål för vilka de överfördes. Vi tillåter inte tredje parter att använda dina personuppgifter för sina egna syften och tillåter endast att de behandlar dina data för specificerade ändamål i enlighet med våra instruktioner."
        },
        security: {
          title: "Säkerhetsåtgärder",
          intro: "Vi tar datasäkerhet på allvar och implementerar:",
          measures: [
            "Kryptering av känslig data under överföring och lagring",
            "Regelbundna säkerhetsutvärderingar och penetrationstester",
            "Åtkomstkontroller och autentiseringsmekanismer",
            "Personalutbildning om dataskydd och integritet",
            "Säker datasäkerhetskopiering och katastrofåterställningsprocedurer"
          ]
        },
        retention: {
          title: "Datalagring",
          body: "Vi behåller din personliga information så länge som nödvändigt för att uppfylla de ändamål för vilka den samlades in, enligt beskrivning i denna integritetspolicy. Generellt behåller vi personuppgifter i upp till 1 år efter din senaste interaktion med oss, såvida inte en längre lagringsperiod krävs eller tillåts enligt lag. Vi kan behöva behålla viss information under längre perioder av specifika skäl inklusive: registerföring och rapportering i enlighet med tillämplig lag (vanligtvis 7 år för finansiella och skattemässiga register), upprätthållande av juridiska rättigheter, bedrägeriförebyggande och tvistlösning. När lagringsperioden löper ut kommer dina personuppgifter att raderas säkert eller anonymiseras. Återstående anonym information och aggregerad information, som inte identifierar dig direkt eller indirekt, kan lagras på obestämd tid för statistiska och analytiska ändamål."
        },
        rights: {
          title: "Dina integritetsrättigheter",
          items: [
            "Rätt att få tillgång till dina personuppgifter",
            "Rätt att korrigera felaktig data",
            "Rätt att radera dina personuppgifter",
            "Rätt att begränsa eller motsätta sig behandling",
            "Rätt till dataportabilitet",
            "Rätt att återkalla samtycke"
          ]
        },
        contact: {
          title: "Kontakta vårt integritetsteam",
          body: 'Om du har några frågor, funderingar eller förfrågningar angående denna integritetspolicy eller behandlingen av din personliga information, eller om du vill utöva någon av dina integritetsrättigheter, vänligen kontakta oss på:<br><br><strong>E-post:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefon:</strong> +258 8441 82252<br><strong>Postadress:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Moçambique<br><br>Vi kommer att svara på din förfrågan i enlighet med tillämplig dataskyddslag. För klagomål eller farhågor om behandlingen av din information kan du också kontakta vår dataskyddsombud på e-postadressen ovan.'
        },
        transfers: {
          title: "Internationella dataöverföringar",
          body: "Eftersom vi verkar i flera jurisdiktioner kan dina data överföras till och behandlas i länder utanför din hemvist. Vi säkerställer att sådana överföringar följer tillämpliga dataskyddslagar genom lämplighetsbeslut från Europeiska kommissionen, standardavtalsklausuler (SCC), lämpliga säkerhetsåtgärder och transparens om överföringsplatser."
        },
        updates: {
          title: "Uppdateringar av policyn",
          body: "Vi kan uppdatera denna integritetspolicy från tid till annan för att återspegla förändringar i vår praxis, teknik, juridiska krav eller andra faktorer. Vi kommer att meddela dig om väsentliga ändringar genom e-postmeddelanden för registrerade användare, tydliga meddelanden på vår webbplats och ett uppdaterat 'senast uppdaterad'-datum. Vi uppmuntrar dig att regelbundet granska denna policy för att hålla dig informerad om hur vi skyddar din information."
        }
      }
    },

    cookies: {
      title: "Cookiepolicy",
      effectiveDate: "19 september 2025",
      lastUpdated: "06 oktober 2025",
      managePreferences: "Hantera dina cookieinställningar:",
      manageText: "Du kan kontrollera vilka cookies vi använder genom vår cookie-banner eller dina webbläsarinställningar.",
      cookieSettingsBtn: "Cookieinställningar",
      quickLinks: {
        title: "Snabblänkar",
        links: [
          { id: "what", text: "Vad är cookies" },
          { id: "how", text: "Hur vi använder cookies" },
          { id: "necessary", text: "Nödvändiga" },
          { id: "functional", text: "Funktionella" },
          { id: "analytics", text: "Analys" },
          { id: "advertisement", text: "Annonsering" },
          { id: "manage", text: "Hantera preferenser" }
        ]
      },
      sections: {
        badge: {
          title: "Om cookies",
          body: "Du kan kontrollera vilka cookies vi använder genom vår cookie-banner eller dina webbläsarinställningar."
        },
        what: {
          title: "Vad är cookies?",
          body: "Denna cookiepolicy förklarar vad cookies är, hur vi använder dem, vilka typer av cookies vi använder (dvs. vilken information vi samlar in med cookies och hur den informationen används), och hur du hanterar dina cookieinställningar.<br /><br />Cookies är små textfiler som används för att lagra små informationsbitar. De lagras på din enhet när en webbplats laddas i din webbläsare. Dessa cookies hjälper till att säkerställa att webbplatsen fungerar korrekt, förbättra säkerheten, ge en bättre användarupplevelse och analysera prestanda för att identifiera vad som fungerar och var förbättringar behövs."
        },
        how: {
          title: "Hur använder vi cookies?",
          body: "Liksom de flesta onlinetjänster använder vår webbplats både förstaparts- och tredjepartscookies för olika ändamål. Förstapartscookies är främst nödvändiga för att webbplatsen ska fungera korrekt och samlar inte in några personligt identifierbara data.<br /><br />Tredjepartscookiesen som används på vår webbplats hjälper oss främst att förstå hur webbplatsen presterar, spåra hur du interagerar med den, hålla våra tjänster säkra, leverera relevanta annonser och förbättra din övergripande användarupplevelse samtidigt som hastigheten på dina framtida interaktioner med vår webbplats förbättras."
        },
        necessary: {
          title: "Nödvändiga cookies",
          description: "Nödvändiga cookies krävs för att aktivera de grundläggande funktionerna på denna webbplats, såsom att tillhandahålla säker inloggning eller justera dina samtyckespr preferenser. Dessa cookies lagrar ingen personligt identifierbar data."
        },
        functional: {
          title: "Funktionella cookies",
          description: "Funktionella cookies hjälper till att utföra vissa funktioner som att dela webbplatsens innehåll på sociala medieplattformar, samla in feedback och andra tredjepartsfunktioner."
        },
        analytics: {
          title: "Analyscookies",
          description: "Analyscookies används för att förstå hur besökare interagerar med webbplatsen. Dessa cookies hjälper till att ge information om mätvärden som antal besökare, avvisningsfrekvens, trafikkälla, etc."
        },
        advertisement: {
          title: "Annonscookies",
          description: "Annonscookies används för att ge besökare anpassade annonser baserat på de sidor du besökt tidigare och för att analysera annons kampanjernas effektivitet."
        },
        manage: {
          title: "Hantera cookieinställningar",
          consentTitle: "Samtyckespr preferenser",
          consentText: "Du kan när som helst ändra dina cookieinställningar genom att klicka på knappen 'Samtyckespr preferenser' ovan. Detta gör att du kan återbesöka cookie-samtyckesbannern och uppdatera dina preferenser eller återkalla ditt samtycke omedelbart.",
          browserText: "Dessutom erbjuder olika webbläsare olika metoder för att blockera och radera cookies som används av webbplatser. Du kan justera dina webbläsarinställningar för att blockera eller radera cookies. Nedan finns länkar till supportdokument om hur du hanterar och raderar cookies i större webbläsare."
        }
      }
    },

    terms: {
      title: "Villkor",
      updatedDate: "06 okt 2025",
      quickLinks: {
        title: "Snabblänkar",
        links: [
          { id: "intro", text: "Omfattning" },
          { id: "booking", text: "Bokningar" },
          { id: "payment", text: "Priser & Betalning" },
          { id: "cancel", text: "Avbokningar" },
          { id: "conduct", text: "Gästbeteende" },
          { id: "force-majeure", text: "Force Majeure" },
          { id: "liability", text: "Ansvar" },
          { id: "intellectual-property", text: "Immateriella rättigheter" },
          { id: "disputes", text: "Tvistlösning" },
          { id: "changes", text: "Ändringar" },
          { id: "law", text: "Tillämplig lag" },
          { id: "contact", text: "Kontakt" }
        ]
      },
      sections: {
        badge: {
          title: "Viktigt juridiskt meddelande:",
          body: "Dessa villkor styr din användning av våra tjänster och webbplats. Vänligen läs dem noggrant innan du gör en bokning."
        },
        intro: {
          title: "Omfattning",
          body: "Dessa villkor reglerar boende och relaterade tjänster som tillhandahålls av DEVOCEAN Lodge (TERRAfrique LDA). Genom att boka godkänner du dessa villkor."
        },
        booking: {
          title: "Bokningar",
          items: [
            "Tillhandahåll korrekt gästinformation och ankomst-/avresedatum",
            "Särskilda önskemål är föremål för tillgänglighet och bekräftelse"
          ],
          reservationReq: {
            title: "Bokningskrav",
            body: "Giltigt ID och kreditkort krävs för alla bokningar. Minimiålder: 18 år."
          },
          checkinCheckout: {
            title: "Incheckning/Utcheckning",
            body: "Incheckning: 14:00 | Utcheckning: 11:00. Tidiga/sena förfrågningar är föremål för tillgänglighet."
          },
          groupBookings: {
            title: "Gruppbokningar",
            body: "Särskilda villkor gäller för grupper på 6+ rum. Kontakta oss för grupppriser och policyer."
          }
        },
        payment: {
          title: "Priser & Betalning",
          items: [
            "Priser som visas är per enhet/natt om inte annat anges",
            "Depositioner och avräkningsmetoder kommer att bekräftas under bokningen"
          ],
          paymentInfo: {
            title: "Betalningsinformation",
            body: "Alla priser är i USD om inte annat anges. Valutakursomräkningar är ungefärliga och kan ändras. Ett giltigt kreditkort krävs för att säkra din reservation. Ytterligare avgifter kan tillkomma för tillfälliga kostnader."
          }
        },
        cancel: {
          title: "Avbokningar & Uteblivanden",
          body: "Avbokningsvillkor upplyses vid bokningstillfället och på din bekräftelse.",
          cancellationCharges: {
            title: "Avbokningsavgifter",
            plans: [
              {
                planName: "Semi-flexibel prisplan:",
                tiers: [
                  { period: "30 dagar eller mer före ankomst", charge: "Full återbetalning" },
                  { period: "29 dagar eller mindre före ankomst", charge: "50% avbokningsavgift" }
                ]
              },
              {
                planName: "Ej återbetalningsbar prisplan:",
                tiers: [
                  { period: "Upp till 24 timmar efter reservation", charge: "Full återbetalning" },
                  { period: "Under alla andra omständigheter", subtext: "Rätten att ändra ankomstdatum en gång under förutsättning att skillnaden betalas om det nya datumet har en högre taxa.", charge: "Ingen återbetalning", chargeClass: "no-refund-red" }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: "Uteblivandepolicy",
            body: "Gäster som inte anländer på det planerade incheckningsdatumet utan föregående meddelande kommer att betraktas som uteblivna. Det fulla bokningsbeloppet kommer att debiteras och reservationen kommer att annulleras."
          }
        },
        conduct: {
          title: "Gästbeteende",
          items: [
            "Respektera fastighetens regler, personal, andra gäster och det lokala samhället",
            "Inga olagliga aktiviteter på området"
          ],
          zeroTolerance: {
            title: "Nolltoleranspolicy",
            body: "Vi upprätthåller en nolltoleranspolicy för störande beteende, olagliga aktiviteter eller skada på egendom. Överträdelser kan leda till omedelbar avhysning utan återbetalning och kan leda till rättsliga åtgärder."
          }
        },
        "force-majeure": {
          title: "Force Majeure",
          intro: "Vi är inte ansvariga för underlåtenhet att utföra åtaganden på grund av omständigheter utanför vår rimliga kontroll, inklusive men inte begränsat till:",
          items: [
            "Naturkatastrofer, extrema väderförhållanden",
            "Regeringsbegränsningar, reseförbud",
            "Civil oro, krig, terrorism",
            "Pandemier, epidemier, hälsonödsituationer",
            "Infrastrukturfel, störningar i allmänna tjänster"
          ],
          footer: "I sådana fall kommer vi att erbjuda alternativa datum eller kreditvouchers när det är möjligt. Återbetalningar kommer att tillhandahållas enligt tillämpliga lagar och omständigheter. Dock är alla skador och kostnader som är eller kunde ha varit täckta av allmänt tillgängliga avboknings- och reseförsäkringspaket undantagna från vårt ansvar."
        },
        liability: {
          title: "Ansvar",
          body: "I den utsträckning som lagen tillåter är vi inte ansvariga för indirekta eller oförutsebara förluster."
        },
        "intellectual-property": {
          title: "Immateriella rättigheter",
          copyright: {
            title: "Upphovsrättsmeddelande",
            body: "Allt innehåll på denna webbplats, inklusive text, grafik, logotyper och bilder, är egendom tillhörande DEVOCEAN Lodge och skyddas av internationella upphovsrättslagar. Obehörig användning, reproduktion eller distribution är förbjuden. DEVOCEAN Lodge-namnet, logotypen och alla relaterade märken är varumärken och får inte användas utan skriftligt tillstånd."
          }
        },
        disputes: {
          title: "Tvistlösning",
          process: {
            title: "Lösningsprocess",
            body: "Vi strävar efter att lösa eventuella tvister i godo. Vänligen kontakta oss först för att försöka lösa problemet. Om det inte löses ska tvister lösas genom medling innan rättsliga åtgärder vidtas.",
            law: "Tillämplig lag: Moçambikansk lag ska styra dessa villkor och eventuella tvister.",
            jurisdiction: "Jurisdiktion: Domstolarna i Maputo, Moçambique ska ha exklusiv jurisdiktion.",
            mediation: "Medling: Parterna går med på att försöka medling genom en ackrediterad medlare innan rättsliga förfaranden inleds."
          }
        },
        changes: {
          title: "Ändringar av dessa villkor",
          body: "Vi kan uppdatera villkoren från tid till annan. Den publicerade versionen gäller för din vistelse."
        },
        law: {
          title: "Tillämplig lag",
          body: "Moçambikansk lag gäller, med förbehåll för obligatoriska lokala konsumentregler."
        },
        contact: {
          title: "Kontakt",
          body: 'Frågor? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    gdpr: {
      title: "GDPR-information",
      updatedDate: "06 okt 2025",
      quickLinks: {
        title: "Snabblänkar",
        links: [
          { id: "controller", text: "Personuppgiftsansvarig" },
          { id: "bases", text: "Rättslig grund" },
          { id: "rights", text: "Dina rättigheter" },
          { id: "retention", text: "Lagringstider" },
          { id: "transfers", text: "Internationella överföringar" },
          { id: "complaints", text: "Klagomål" },
          { id: "dpo", text: "Kontakt (GDPR)" }
        ]
      },
      sections: {
        badge: {
          title: "GDPR-kompatibel:",
          body: "Vi är dedikerade till att skydda dina personuppgifter och respektera dina integritetsrättigheter enligt den allmänna dataskyddsförordningen."
        },
        controller: {
          title: "Personuppgiftsansvarig",
          body: "TERRAfrique LDA (DEVOCEAN Lodge), registrerat på Rua C, Parcela 12, Maputo 1118, Moçambique, agerar som personuppgiftsansvarig för dina personuppgifter som samlas in genom våra tjänster."
        },
        bases: {
          title: "Rättslig grund för behandling",
          body: "Vi behandlar dina personuppgifter baserat på följande rättsliga grunder enligt GDPR:"
        },
        rights: {
          title: "Dina GDPR-rättigheter",
          body: "Som registrerad under GDPR har du följande rättigheter angående dina personuppgifter:"
        },
        retention: {
          title: "Datalagring",
          periodsTitle: "Lagringstider",
          intro: "Vi behåller personuppgifter endast så länge som nödvändigt för att uppfylla de ändamål för vilka de samlades in, inklusive juridiska, redovisnings- eller rapporteringskrav.",
          items: [
            "<strong>Bokningsdata:</strong> 7 år för skatte- och juridisk efterlevnad",
            "<strong>Kundtjänstkommunikation:</strong> 3 år",
            "<strong>Marknadsföringssamtycke:</strong> Tills samtycke återkallas",
            "<strong>Webbplatsanalys:</strong> 26 månader",
            "<strong>Finansiella transaktioner:</strong> 10 år för redovisningsändamål"
          ]
        },
        transfers: {
          title: "Internationella dataöverföringar",
          body: "När vi överför dina data utanför Europeiska ekonomiska samarbetsområdet (EES) säkerställer vi att lämpliga skyddsåtgärder finns på plats för att skydda din information. Detta kan inkludera användning av standardavtalsklausuler godkända av Europeiska kommissionen eller överföring av data till länder med adekvat skyddsnivå."
        },
        complaints: {
          title: "Klagomål",
          intro: "Om du har farhågor om hur vi hanterar dina personuppgifter har du rätt att lämna in ett klagomål till din lokala dataskyddsmyndighet.",
          footer: "Vi uppmuntrar dig att kontakta oss först för att lösa eventuella problem innan du vänder dig till tillsynsmyndigheten."
        },
        dpo: {
          title: "Kontakta vårt dataskyddsombud",
          body: 'För GDPR-relaterade frågor eller för att utöva dina rättigheter, vänligen kontakta vårt dataskyddsombud på <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Vi kommer att svara på din begäran inom 30 dagar enligt GDPR-kraven.'
        }
      },
      legalBases: {
        contract: {
          title: "Avtal:",
          body: "Behandling nödvändig för att uppfylla våra bokningsavtal och tjänster."
        },
        legal: {
          title: "Rättslig skyldighet:",
          body: "Behandling som krävs för att uppfylla juridiska krav (t.ex. skattelagar)."
        },
        legitimate: {
          title: "Berättigade intressen:",
          body: "Behandling för våra legitima affärsintressen samtidigt som vi respekterar dina rättigheter."
        },
        consent: {
          title: "Samtycke:",
          body: "Behandling baserad på ditt uttryckliga samtycke för specifika ändamål."
        }
      },
      rights: {
        access: {
          title: "Rätt till tillgång",
          body: "Du kan begära kopior av dina personuppgifter vi innehar."
        },
        rectification: {
          title: "Rätt till rättelse",
          body: "Du kan begära korrigering av felaktig eller ofullständig data."
        },
        erasure: {
          title: "Rätt till radering",
          body: "Du kan begära radering av dina personuppgifter under vissa villkor."
        },
        restrict: {
          title: "Rätt att begränsa behandling",
          body: "Du kan begära begränsning av hur vi använder dina data."
        },
        portability: {
          title: "Rätt till dataportabilitet",
          body: "Du kan begära överföring av dina data till en annan organisation."
        },
        object: {
          title: "Rätt att invända",
          body: "Du kan invända mot vissa typer av behandling av dina data."
        }
      },
      buttons: {
        access: {
          text: "Begär datatillgång"
        },
        erasure: {
          text: "Begär dataradering"
        }
      },
      safeguards: {
        international: {
          title: "Internationella dataöverföringar:",
          body: "Vi säkerställer att lämpliga skyddsåtgärder finns på plats för alla dataöverföringar utanför EES, inklusive standardavtalsklausuler och adekvata skyddsbeslut."
        }
      },
      authority: {
        lead: {
          title: "Ledande tillsynsmyndighet:",
          name: "Portugisiska dataskyddsmyndigheten (CNPD)",
          websiteLabel: "Webbplats:",
          contactLabel: "Kontakt:"
        }
      }
    },

    cric: {
      title: "Företag & Kontakt",
      updatedDate: "06 okt 2025",
      quickLinks: {
        title: "Snabblänkar",
        links: [
          { id: "company", text: "Företagsinformation" },
          { id: "contact", text: "Kontaktuppgifter" },
          { id: "consumer", text: "Konsumenträttigheter" }
        ]
      },
      sections: {
        badge: {
          title: "Företagsinformation:",
          body: "Registreringsuppgifter och kontaktinformation för DEVOCEAN Lodge."
        },
        company: {
          title: "Företagsinformation",
          body: "Fullständiga företagsregistreringsuppgifter och kontaktinformation för DEVOCEAN Lodge."
        },
        contact: {
          title: "Kontakt",
          body: 'För allmänna förfrågningar, bokningar och information om våra tjänster, använd kontaktuppgifterna nedan.'
        },
        emergency: {
          title: "Nödkontakt",
          body: "För brådskande ärenden utanför kontorstid, använd våra nödkontaktuppgifter."
        }
      },
      labels: {
        companyName: "Företagsnamn",
        registration: "Företagsregistrering",
        vat: "Momsregistreringsnummer (NUIT)",
        license: "Affärslicens (Alvará)",
        legalForm: "Juridisk form",
        capital: "Aktiekapital",
        address: "Registrerad adress",
        email: "E-post",
        phone: "Telefon",
        businessHours: "Öppettider",
        emergencyPhone: "Nödtelefon",
        emergencyEmail: "Nöd-e-post"
      },
      legalForm: "Aktiebolag med begränsat ansvar",
      businessHours: "Måndag - Fredag: 8:00 - 18:00<br>Lördag & Söndag: 8:00 - 12:00<br>Reception: 6:00 - 22:00 (för gäster)",
      emergencyPhoneNote: "För brådskande ärenden utanför kontorstid"
    }
  };

  // -------- POLISH --------
  window.LEGAL_DICT.pl = {
    privacy: {
      title: "Polityka prywatności",
      updatedDate: "06 października 2025",
      quickLinks: {
        title: "Szybkie linki",
        links: [
          { id: "who", text: "Kim jesteśmy" },
          { id: "collect", text: "Zbieranie danych" },
          { id: "use", text: "Wykorzystanie danych" },
          { id: "share", text: "Udostępnianie danych" },
          { id: "security", text: "Bezpieczeństwo" },
          { id: "retention", text: "Przechowywanie danych" },
          { id: "rights", text: "Twoje prawa" },
          { id: "transfers", text: "Międzynarodowe przekazywanie danych" },
          { id: "contact", text: "Kontakt" },
          { id: "updates", text: "Aktualizacje polityki" }
        ]
      },
      sections: {
        badge: {
          title: "Twoja prywatność jest ważna:",
          body: "Jesteśmy zaangażowani w ochronę Twoich danych osobowych i przejrzystość w kwestii tego, jak zbieramy, wykorzystujemy i zabezpieczamy Twoje informacje."
        },
        who: {
          title: "Kim jesteśmy",
          body: "DEVOCEAN Lodge jest prowadzony przez TERRAfrique LDA, firmę zarejestrowaną w Mozambiku. Nasz adres rejestrowy to Rua C, Parcela 12, Maputo 1118, Mozambik. Prowadzimy ekologiczne zakwaterowanie plażowe w Ponta do Ouro, Mozambik. Jesteśmy zaangażowani w ochronę Twojej prywatności i zapewnienie, że Twoje dane osobowe są zbierane, przetwarzane i wykorzystywane prawidłowo, zgodnie z prawem i przejrzyście, zgodnie z obowiązującymi przepisami o ochronie danych. Korzystając z naszej strony internetowej i usług, wyrażasz zgodę na zbieranie i wykorzystywanie Twoich informacji zgodnie z opisem w niniejszej Polityce prywatności."
        },
        collect: {
          title: "Jakie dane osobowe zbieramy",
          intro: "Zbieramy różne rodzaje informacji, aby świadczyć i ulepszać nasze usługi:",
          categories: [
            {
              title: "Dane osobowe",
              items: [
                "Imię i nazwisko, dane kontaktowe",
                "Informacje o paszporcie/dowodzie osobistym",
                "Informacje o płatnościach",
                "Preferencje rezerwacji"
              ]
            },
            {
              title: "Dane techniczne",
              items: [
                "Adres IP, informacje o urządzeniu",
                "Typ i wersja przeglądarki",
                "Analiza użytkowania strony internetowej",
                "Dane z plików cookie (za zgodą)"
              ]
            },
            {
              title: "Dane komunikacyjne",
              items: [
                "Korespondencja e-mailowa",
                "Wnioski obsługi klienta",
                "Opinie i recenzje",
                "Preferencje marketingowe"
              ]
            }
          ]
        },
        use: {
          title: "Jak wykorzystujemy Twoje dane",
          items: [
            "Zarządzanie rezerwacjami i świadczenie usług",
            "Komunikacja dotycząca Twojego pobytu, zasad i ofert (za zgodą)",
            "Ulepszanie naszej strony i usług (analityka, bezpieczeństwo)",
            "Zachowanie zgodności z obowiązkami prawnymi/finansowymi"
          ]
        },
        share: {
          title: "Kiedy udostępniamy dane",
          items: [
            "Dostawcy płatności i platformy rezerwacyjne w celu przetwarzania Twoich rezerwacji i płatności",
            "Usługi analityczne w celu zrozumienia użytkowania strony internetowej i ulepszania naszych usług",
            "Usługi reklamowe dla marketingu celowanego (tylko za Twoją zgodą)",
            "Dostawcy usług IT, dostawcy hostingu i dostawcy wsparcia technicznego na podstawie ścisłych umów o poufności",
            "Organy prawne, gdy jest to wymagane przez prawo, regulacje, nakaz sądowy lub inny proces prawny",
            "W celu egzekwowania naszych umów lub ochrony naszych praw, własności lub bezpieczeństwa",
            "W przypadku fuzji, przejęcia lub sprzedaży aktywów Twoje informacje mogą zostać przekazane nowemu właścicielowi"
          ],
          footer: "Wymagamy od wszystkich stron trzecich szanowania bezpieczeństwa Twoich danych osobowych i wykorzystywania ich tylko w celach, dla których zostały przekazane. Nie pozwalamy stronom trzecim na wykorzystywanie Twoich danych osobowych do ich własnych celów i zezwalamy im jedynie na przetwarzanie Twoich danych w określonych celach zgodnie z naszymi instrukcjami."
        },
        security: {
          title: "Środki bezpieczeństwa",
          intro: "Poważnie traktujemy bezpieczeństwo danych i stosujemy:",
          measures: [
            "Szyfrowanie wrażliwych danych podczas przesyłania i przechowywania",
            "Regularne oceny bezpieczeństwa i testy penetracyjne",
            "Kontrola dostępu i mechanizmy uwierzytelniania",
            "Szkolenia personelu z zakresu ochrony danych i prywatności",
            "Bezpieczne procedury tworzenia kopii zapasowych danych i odzyskiwania po awarii"
          ]
        },
        retention: {
          title: "Przechowywanie danych",
          body: "Będziemy przechowywać Twoje dane osobowe tak długo, jak jest to konieczne do realizacji celów, dla których zostały zebrane, zgodnie z opisem w niniejszej Polityce prywatności. Zazwyczaj przechowujemy dane osobowe przez okres do 1 roku od ostatniej interakcji z nami, chyba że dłuższy okres przechowywania jest wymagany lub dozwolony przez prawo. Możemy potrzebować przechowywać pewne informacje przez dłuższy czas z określonych powodów, w tym: prowadzenia dokumentacji i raportowania zgodnie z obowiązującym prawem (zazwyczaj 7 lat dla dokumentacji finansowej i podatkowej), egzekwowania praw prawnych, zapobiegania oszustwom i rozwiązywania sporów. Po upływie okresu przechowywania Twoje dane osobowe zostaną bezpiecznie usunięte lub zanonimizowane. Pozostałe informacje anonimowe i zagregowane, które nie identyfikują Cię bezpośrednio lub pośrednio, mogą być przechowywane bezterminowo w celach statystycznych i analitycznych."
        },
        rights: {
          title: "Twoje prawa do prywatności",
          items: [
            "Prawo do dostępu do Twoich danych osobowych",
            "Prawo do poprawienia niedokładnych danych",
            "Prawo do usunięcia Twoich danych osobowych",
            "Prawo do ograniczenia lub sprzeciwu wobec przetwarzania",
            "Prawo do przenoszenia danych",
            "Prawo do wycofania zgody"
          ]
        },
        contact: {
          title: "Skontaktuj się z naszym zespołem ds. prywatności",
          body: 'Jeśli masz jakiekolwiek pytania, wątpliwości lub wnioski dotyczące niniejszej Polityki prywatności lub przetwarzania Twoich danych osobowych, lub jeśli chcesz skorzystać z jakichkolwiek swoich praw do prywatności, prosimy o kontakt pod adresem:<br><br><strong>E-mail:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefon:</strong> +258 8441 82252<br><strong>Adres pocztowy:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambik<br><br>Odpowiemy na Twoje żądanie zgodnie z obowiązującymi przepisami o ochronie danych. W przypadku skarg lub wątpliwości dotyczących przetwarzania Twoich informacji możesz również skontaktować się z naszym Inspektorem Ochrony Danych pod powyższym adresem e-mail.'
        },
        transfers: {
          title: "Międzynarodowe przekazywanie danych",
          body: "Ponieważ działamy w wielu jurysdykcjach, Twoje dane mogą być przekazywane i przetwarzane w krajach poza miejscem Twojego zamieszkania. Zapewniamy, że takie przekazywanie jest zgodne z obowiązującymi przepisami o ochronie danych poprzez decyzje o odpowiednim poziomie ochrony wydane przez Komisję Europejską, Standardowe Klauzule Umowne (SCC), odpowiednie zabezpieczenia bezpieczeństwa oraz przejrzystość dotyczącą lokalizacji przekazywania."
        },
        updates: {
          title: "Aktualizacje polityki",
          body: 'Możemy od czasu do czasu aktualizować niniejszą politykę prywatności, aby odzwierciedlić zmiany w naszych praktykach, technologii, wymogach prawnych lub innych czynnikach. Poinformujemy Cię o wszelkich istotnych zmianach za pośrednictwem powiadomień e-mailowych dla zarejestrowanych użytkowników, wyraźnych powiadomień na naszej stronie internetowej oraz zaktualizowanej daty „ostatniej aktualizacji". Zachęcamy do okresowego przeglądania tej polityki, aby być na bieżąco z tym, jak chronimy Twoje informacje.'
        }
      }
    },

    cookies: {
      title: 'Polityka plików cookie',
      effectiveDate: '19 września 2025 r.',
      lastUpdated: '6 października 2025 r.',
      managePreferences: 'Zarządzaj preferencjami plików cookie:',
      manageText: 'Możesz kontrolować, które pliki cookie używamy za pośrednictwem naszego banera cookie lub ustawień przeglądarki.',
      cookieSettingsBtn: 'Ustawienia plików cookie',
      quickLinks: {
        title: 'Szybkie linki',
        links: [
          { id: 'what', text: 'Czym są pliki cookie' },
          { id: 'how', text: 'Jak używamy plików cookie' },
          { id: 'necessary', text: 'Niezbędne' },
          { id: 'functional', text: 'Funkcjonalne' },
          { id: 'analytics', text: 'Analityczne' },
          { id: 'advertisement', text: 'Reklamowe' },
          { id: 'manage', text: 'Zarządzaj preferencjami' }
        ]
      },
      sections: {
        badge: {
          title: 'O plikach cookie',
          body: 'Możesz kontrolować, które pliki cookie używamy za pośrednictwem naszego banera cookie lub ustawień przeglądarki.'
        },
        what: {
          title: 'Czym są pliki cookie?',
          body: 'Niniejsza Polityka plików cookie wyjaśnia, czym są pliki cookie, jak ich używamy, typy plików cookie, których używamy (tj. informacje, które zbieramy za pomocą plików cookie i jak te informacje są używane), oraz jak zarządzać ustawieniami plików cookie.<br><br>Pliki cookie to małe pliki tekstowe używane do przechowywania małych fragmentów informacji. Są one przechowywane na Twoim urządzeniu, gdy strona internetowa ładuje się w Twojej przeglądarce. Te pliki cookie pomagają zapewnić prawidłowe działanie strony internetowej, zwiększają bezpieczeństwo, zapewniają lepsze doświadczenie użytkownika i analizują wydajność, aby zidentyfikować, co działa i gdzie potrzebne są ulepszenia.'
        },
        how: {
          title: 'Jak używamy plików cookie?',
          body: 'Podobnie jak większość usług online, nasza strona internetowa używa zarówno plików cookie pierwszej strony, jak i plików cookie stron trzecich do różnych celów. Pliki cookie pierwszej strony są przede wszystkim niezbędne do prawidłowego funkcjonowania strony internetowej i nie zbierają żadnych danych identyfikujących osobę.<br><br>Pliki cookie stron trzecich używane na naszej stronie internetowej pomagają nam przede wszystkim zrozumieć, jak strona internetowa działa, jak z nią wchodzisz w interakcję, zapewniają bezpieczeństwo naszych usług, dostarczają odpowiednie reklamy i poprawiają ogólne doświadczenie użytkownika, jednocześnie poprawiając szybkość Twoich przyszłych interakcji z naszą stroną internetową.'
        },
        necessary: {
          title: 'Niezbędne pliki cookie',
          description: 'Niezbędne pliki cookie są wymagane do włączenia podstawowych funkcji tej strony, takich jak zapewnienie bezpiecznego logowania lub dostosowanie preferencji zgody. Te pliki cookie nie przechowują żadnych danych identyfikujących osobę.',
          tableHeaders: { cookie: 'Plik cookie', duration: 'Czas trwania', description: 'Opis' },
          cookies: [
            { name: 'currency', duration: 'session', desc: 'Ten plik cookie służy do przechowywania preferencji walutowych użytkownika.' },
            { name: '_sh_session_', duration: 'session', desc: 'Opis jest obecnie niedostępny.' },
            { name: 'loccur', duration: 'session', desc: 'Opis jest obecnie niedostępny.' },
            { name: 'country_code', duration: 'session', desc: 'Brak dostępnego opisu.' },
            { name: 'b_locale', duration: 'session', desc: 'Opis jest obecnie niedostępny.' },
            { name: 'checkout_currency', duration: 'session', desc: 'Opis jest obecnie niedostępny.' }
          ]
        },
        functional: {
          title: 'Funkcjonalne pliki cookie',
          description: 'Funkcjonalne pliki cookie pomagają wykonywać pewne funkcje, takie jak udostępnianie treści strony internetowej na platformach mediów społecznościowych, zbieranie opinii oraz inne funkcje stron trzecich.',
          tableHeaders: { cookie: 'Plik cookie', duration: 'Czas trwania', description: 'Opis' },
          cookies: [
            { name: 'locale', duration: 'session', desc: 'Facebook ustawia ten plik cookie, aby poprawić doświadczenie przeglądania użytkownika na stronie internetowej oraz dostarczyć użytkownikowi odpowiednie reklamy podczas korzystania z platform mediów społecznościowych Facebooka.' }
          ]
        },
        analytics: {
          title: 'Analityczne pliki cookie',
          description: 'Analityczne pliki cookie służą do zrozumienia, jak odwiedzający interagują ze stroną internetową. Te pliki cookie pomagają dostarczać informacje na temat metryk, takich jak liczba odwiedzających, współczynnik odrzuceń, źródło ruchu itp.',
          tableHeaders: { cookie: 'Plik cookie', duration: 'Czas trwania', description: 'Opis' },
          cookies: [
            { name: '_ga', duration: '1 rok 1 miesiąc 4 dni', desc: 'Google Analytics ustawia ten plik cookie, aby obliczać dane dotyczące odwiedzających, sesji i kampanii oraz śledzić użycie strony dla raportu analitycznego strony. Plik cookie przechowuje informacje anonimowo i przypisuje losowo wygenerowany numer, aby rozpoznać unikalnych odwiedzających.' },
            { name: '_ga_*', duration: '1 rok 1 miesiąc 4 dni', desc: 'Google Analytics ustawia ten plik cookie, aby przechowywać i liczyć wyświetlenia stron.' },
            { name: '_gid', duration: '1 dzień', desc: 'Google Analytics ustawia ten plik cookie, aby przechowywać informacje o tym, jak odwiedzający używają strony internetowej, jednocześnie tworząc raport analityczny wydajności strony. Niektóre z zbieranych danych obejmują liczbę odwiedzających, ich źródło oraz strony, które odwiedzają anonimowo.' },
            { name: '_gat_UA-*', duration: '1 minuta', desc: 'Google Analytics ustawia ten plik cookie do śledzenia zachowania użytkownika.' },
            { name: 'pardot', duration: 'przeszłość', desc: 'Plik cookie pardot jest ustawiany, gdy odwiedzający jest zalogowany jako użytkownik Pardot. Plik cookie wskazuje na aktywną sesję i nie jest używany do śledzenia.' }
          ]
        },
        advertisement: {
          title: 'Reklamowe pliki cookie',
          description: 'Reklamowe pliki cookie służą do dostarczania odwiedzającym spersonalizowanych reklam na podstawie wcześniej odwiedzonych stron oraz do analizowania skuteczności kampanii reklamowych.',
          tableHeaders: { cookie: 'Plik cookie', duration: 'Czas trwania', description: 'Opis' },
          cookies: [
            { name: '_gcl_au', duration: '3 miesiące', desc: 'Google Tag Manager ustawia ten plik cookie, aby eksperymentować ze skutecznością reklam stron internetowych korzystających z ich usług.' },
            { name: 'test_cookie', duration: '15 minut', desc: 'doubleclick.net ustawia ten plik cookie, aby sprawdzić, czy przeglądarka użytkownika obsługuje pliki cookie.' },
            { name: '_fbp', duration: '3 miesiące', desc: 'Facebook ustawia ten plik cookie, aby przechowywać i śledzić interakcje.' },
            { name: 'IDE', duration: '1 rok 24 dni', desc: 'Pliki cookie Google DoubleClick IDE przechowują informacje o tym, jak użytkownik korzysta ze strony internetowej, aby prezentować mu odpowiednie reklamy zgodnie z profilem użytkownika.' }
          ]
        },
        manage: {
          title: 'Zarządzaj preferencjami plików cookie',
          consentTitle: 'Preferencje zgody',
          consentText: 'Możesz w dowolnym momencie zmodyfikować ustawienia plików cookie, klikając przycisk „Preferencje zgody" powyżej. Pozwoli to na ponowne odwiedzenie banera zgody na pliki cookie i zaktualizowanie preferencji lub natychmiastowe wycofanie zgody.',
          browserText: 'Dodatkowo różne przeglądarki oferują różne metody blokowania i usuwania plików cookie używanych przez strony internetowe. Możesz dostosować ustawienia przeglądarki, aby blokować lub usuwać pliki cookie. Poniżej znajdują się linki do dokumentów wsparcia dotyczących zarządzania i usuwania plików cookie w głównych przeglądarkach internetowych.',
          browsers: {
            chrome: 'Chrome',
            safari: 'Safari',
            firefox: 'Firefox',
            ie: 'Internet Explorer',
            other: 'Jeśli używasz innej przeglądarki internetowej, prosimy o odniesienie się do jej oficjalnej dokumentacji wsparcia.'
          }
        }
      }
    },

    terms: {
      title: 'Regulamin',
      updatedDate: '06 października 2025',
      quickLinks: {
        title: 'Szybkie linki',
        links: [
          { id: 'intro', text: 'Zakres' },
          { id: 'booking', text: 'Rezerwacje' },
          { id: 'payment', text: 'Ceny i płatności' },
          { id: 'cancel', text: 'Anulacje' },
          { id: 'conduct', text: 'Zachowanie gości' },
          { id: 'force-majeure', text: 'Siła wyższa' },
          { id: 'liability', text: 'Odpowiedzialność' },
          { id: 'intellectual-property', text: 'Własność intelektualna' },
          { id: 'disputes', text: 'Rozstrzyganie sporów' },
          { id: 'changes', text: 'Zmiany' },
          { id: 'law', text: 'Prawo właściwe' },
          { id: 'contact', text: 'Kontakt' }
        ]
      },
      sections: {
        badge: {
          title: 'Ważna informacja prawna:',
          body: 'Niniejsze warunki regulują korzystanie z naszych usług i strony internetowej. Prosimy o dokładne ich przeczytanie przed dokonaniem rezerwacji.'
        },
        intro: {
          title: 'Zakres',
          body: 'Niniejsze Warunki regulują zakwaterowanie i powiązane usługi świadczone przez DEVOCEAN Lodge (TERRAfrique LDA). Dokonując rezerwacji, zgadzasz się na te Warunki.'
        },
        booking: {
          title: 'Rezerwacje',
          items: [
            'Podaj dokładne informacje o gościach oraz daty przyjazdu/wyjazdu',
            'Specjalne prośby podlegają dostępności i potwierdzeniu'
          ],
          reservationReq: {
            title: 'Wymagania rezerwacji',
            body: 'Wymagany ważny dowód tożsamości i karta kredytowa dla wszystkich rezerwacji. Minimalny wiek: 18 lat.'
          },
          checkinCheckout: {
            title: 'Zameldowanie/wymeldowanie',
            body: 'Zameldowanie: 14:00 | Wymeldowanie: 11:00. Wczesne/późne prośby podlegają dostępności.'
          },
          groupBookings: {
            title: 'Rezerwacje grupowe',
            body: 'Specjalne warunki dotyczą grup 6+ pokoi. Skontaktuj się z nami w sprawie stawek i zasad grupowych.'
          }
        },
        payment: {
          title: 'Ceny i płatności',
          items: [
            'Pokazane stawki są za jednostkę/noc, chyba że określono inaczej',
            'Depozyty i metody rozliczenia zostaną potwierdzone podczas rezerwacji'
          ],
          paymentInfo: {
            title: 'Informacje o płatnościach',
            body: 'Wszystkie ceny są w USD, chyba że określono inaczej. Kursy przeliczeniowe walut są przybliżone i mogą ulec zmianie. Wymagana ważna karta kredytowa do zabezpieczenia rezerwacji. Dodatkowe opłaty mogą dotyczyć kosztów incydentalnych.'
          }
        },
        cancel: {
          title: 'Anulacje i niepojawienie się',
          body: 'Warunki anulacji są ujawniane w momencie rezerwacji i w potwierdzeniu.',
          cancellationCharges: {
            title: 'Opłaty za anulację',
            plans: [
              {
                planName: 'Plan taryfowy półelastyczny:',
                tiers: [
                  { period: '30 dni lub więcej przed przyjazdem', charge: 'Pełny zwrot' },
                  { period: '29 dni lub mniej przed przyjazdem', charge: '50% opłaty za anulację' }
                ]
              },
              {
                planName: 'Plan taryfowy bezzwrotny:',
                tiers: [
                  { period: 'Do 24 godzin po rezerwacji', charge: 'Pełny zwrot' },
                  { period: 'We wszystkich innych okolicznościach', subtext: 'Prawo do jednorazowej modyfikacji daty przyjazdu pod warunkiem zapłaty różnicy, jeśli nowa data ma wyższą stawkę.', charge: 'Brak zwrotu', chargeClass: 'no-refund-red' }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: 'Polityka niepojawienia się',
            body: 'Goście, którzy nie przyjadą w zaplanowanej dacie zameldowania bez uprzedniego powiadomienia, będą uważani za niepojawionych. Pełna kwota rezerwacji zostanie obciążona, a rezerwacja anulowana.'
          }
        },
        conduct: {
          title: 'Zachowanie gości',
          items: [
            'Szanuj zasady obiektu, personel, innych gości i lokalną społeczność',
            'Brak nielegalnych działań na terenie obiektu'
          ],
          zeroTolerance: {
            title: 'Polityka zero tolerancji',
            body: 'Stosujemy politykę zero tolerancji dla zakłócającego zachowania, nielegalnych działań lub uszkodzenia mienia. Naruszenia mogą skutkować natychmiastowym wyrzuceniem bez zwrotu i mogą prowadzić do działań prawnych.'
          }
        },
        'force-majeure': {
          title: 'Siła wyższa',
          intro: 'Nie ponosimy odpowiedzialności za niewykonanie zobowiązań z powodu okoliczności poza naszą rozsądną kontrolą, w tym między innymi:',
          items: [
            'Katastrofy naturalne, ekstremalne warunki pogodowe',
            'Ograniczenia rządowe, zakazy podróży',
            'Zamieszki cywilne, wojna, terroryzm',
            'Pandemie, epidemie, nagłe przypadki zdrowotne',
            'Awarie mediów, awarie infrastruktury'
          ],
          footer: 'W takich przypadkach zaoferujemy alternatywne daty lub vouchery kredytowe, gdzie to możliwe. Zwroty zostaną udzielone zgodnie z obowiązującymi przepisami i okolicznościami. Jednak wszystkie szkody i koszty, które są lub mogły być pokryte przez ogólnie dostępne pakiety ubezpieczeń anulacyjnych i podróżnych, są wyłączone z naszej odpowiedzialności.'
        },
        liability: {
          title: 'Odpowiedzialność',
          body: 'W zakresie dozwolonym przez prawo, nie ponosimy odpowiedzialności za pośrednie lub nieprzewidywalne straty.'
        },
        'intellectual-property': {
          title: 'Własność intelektualna',
          copyright: {
            title: 'Informacja o prawach autorskich',
            body: 'Cała zawartość tej strony internetowej, w tym tekst, grafika, logo i obrazy, jest własnością DEVOCEAN Lodge i chroniona międzynarodowymi prawami autorskimi. Nieautoryzowane użycie, reprodukcja lub dystrybucja jest zabroniona. Nazwa DEVOCEAN Lodge, logo i wszystkie powiązane znaki są znakami towarowymi i nie mogą być używane bez pisemnej zgody.'
          }
        },
        disputes: {
          title: 'Rozstrzyganie sporów',
          process: {
            title: 'Proces rozstrzygania',
            body: 'Staramy się rozstrzygać spory polubownie. Prosimy o kontakt w pierwszej kolejności w celu próby rozwiązania. Jeśli nierozstrzygnięte, spory zostaną rozstrzygnięte poprzez mediację przed podjęciem działań prawnych.',
            law: 'Prawo właściwe: Prawo mozambickie reguluje niniejsze warunki i wszelkie spory.',
            jurisdiction: 'Jurysdykcja: Sądy w Maputo, Mozambik mają wyłączną jurysdykcję.',
            mediation: 'Mediacja: Strony zgadzają się na próbę mediacji poprzez akredytowanego mediatora przed wszczęciem postępowania sądowego.'
          }
        },
        changes: {
          title: 'Zmiany w niniejszych Warunkach',
          body: 'Możemy od czasu do czasu aktualizować Warunki. Opublikowana wersja dotyczy Twojego pobytu.'
        },
        law: {
          title: 'Prawo właściwe',
          body: 'Stosuje się prawo mozambickie, z zastrzeżeniem obowiązkowych lokalnych zasad konsumenckich.'
        },
        contact: {
          title: 'Kontakt',
          body: 'Pytania? <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
        }
      }
    },

    gdpr: {
      title: 'Informacja o RODO',
      updatedDate: '06 października 2025',
      quickLinks: {
        title: 'Szybkie linki',
        links: [
          { id: 'controller', text: 'Administrator' },
          { id: 'bases', text: 'Podstawy prawne' },
          { id: 'rights', text: 'Twoje prawa' },
          { id: 'retention', text: 'Przechowywanie danych' },
          { id: 'transfers', text: 'Przekazywanie danych' },
          { id: 'complaints', text: 'Skargi' }
        ]
      },
      sections: {
        badge: {
          title: 'Zgodny z RODO:',
          body: 'Jesteśmy zaangażowani w ochronę Twoich danych osobowych i szanowanie Twoich praw do prywatności zgodnie z Ogólnym Rozporządzeniem o Ochronie Danych.'
        },
        controller: {
          title: 'Administrator danych',
          body: 'TERRAfrique LDA (DEVOCEAN Lodge), zarejestrowana pod adresem Rua C, Parcela 12, Maputo 1118, Mozambik, działa jako administrator danych dla Twoich informacji osobowych zbieranych poprzez nasze usługi.'
        },
        bases: {
          title: 'Podstawy prawne przetwarzania',
          body: 'Przetwarzamy Twoje dane osobowe na podstawie następujących podstaw prawnych zgodnie z RODO:',
          items: [
            { label: 'Umowa:', text: 'Przetwarzanie niezbędne do realizacji naszych umów rezerwacyjnych i usług.' },
            { label: 'Obowiązek prawny:', text: 'Przetwarzanie wymagane do spełnienia wymogów prawnych (np. prawa podatkowe).' },
            { label: 'Prawnie uzasadnione interesy:', text: 'Przetwarzanie dla naszych prawnie uzasadnionych interesów biznesowych z poszanowaniem Twoich praw.' },
            { label: 'Zgoda:', text: 'Przetwarzanie na podstawie Twojej wyraźnej zgody na określone cele.' }
          ]
        },
        rights: {
          title: 'Twoje prawa wynikające z RODO',
          body: 'Jako osoba, której dane dotyczą zgodnie z RODO, masz następujące prawa dotyczące Twoich danych osobowych:',
          cards: [
            { title: 'Prawo dostępu', body: 'Możesz zażądać kopii Twoich danych osobowych, które przechowujemy.' },
            { title: 'Prawo do sprostowania', body: 'Możesz zażądać korekty niedokładnych lub niekompletnych danych.' },
            { title: 'Prawo do usunięcia', body: 'Możesz zażądać usunięcia Twoich danych osobowych w określonych warunkach.' },
            { title: 'Prawo do ograniczenia przetwarzania', body: 'Możesz zażądać ograniczenia sposobu, w jaki używamy Twoich danych.' },
            { title: 'Prawo do przenoszenia danych', body: 'Możesz zażądać przeniesienia Twoich danych do innej organizacji.' },
            { title: 'Prawo do sprzeciwu', body: 'Możesz sprzeciwić się pewnym typom przetwarzania Twoich danych.' }
          ],
          buttons: {
            access: 'Zażądaj dostępu do danych',
            delete: 'Zażądaj usunięcia danych'
          }
        },
        retention: {
          title: 'Przechowywanie danych',
          subtitle: 'Okresy przechowywania',
          intro: 'Przechowujemy dane osobowe tylko tak długo, jak jest to konieczne do realizacji celów, dla których zostały zebrane, w tym wymogów prawnych, księgowych lub sprawozdawczych.',
          periods: [
            'Dane rezerwacyjne: 7 lat dla zgodności podatkowej i prawnej',
            'Komunikacja obsługi klienta: 3 lata',
            'Zgody marketingowe: Do wycofania zgody',
            'Analityka strony internetowej: 26 miesięcy',
            'Transakcje finansowe: 10 lat dla celów księgowych'
          ]
        },
        transfers: {
          title: 'Międzynarodowe przekazywanie danych',
          body: 'Gdy przekazujemy Twoje dane poza Europejski Obszar Gospodarczy (EOG), zapewniamy odpowiednie zabezpieczenia w celu ochrony Twoich informacji. Może to obejmować użycie Standardowych Klauzul Umownych zatwierdzonych przez Komisję Europejską lub przekazywanie danych do krajów z decyzjami o odpowiednim poziomie ochrony.',
          notice: {
            title: 'Międzynarodowe przekazywanie danych:',
            body: 'Zapewniamy odpowiednie zabezpieczenia dla wszelkich przekazywań danych poza EOG, w tym Standardowe Klauzule Umowne i decyzje o odpowiednim poziomie ochrony.'
          }
        },
        complaints: {
          title: 'Skargi',
          intro: 'Jeśli masz obawy co do sposobu, w jaki obsługujemy Twoje dane osobowe, masz prawo złożyć skargę do lokalnego organu ochrony danych.',
          authority: {
            label: 'Wiodący organ nadzorczy:',
            name: 'Portugalski Organ Ochrony Danych (CNPD)',
            websiteLabel: 'Strona internetowa:',
            contactLabel: 'Kontakt:'
          },
          footer: 'Zachęcamy do kontaktu z nami w pierwszej kolejności w celu rozwiązania wszelkich obaw przed zwróceniem się do organu nadzorczego.'
        },
        dpo: {
          title: 'Skontaktuj się z naszym inspektorem ochrony danych',
          body: 'W przypadku jakichkolwiek pytań związanych z RODO lub w celu skorzystania z Twoich praw, prosimy o kontakt z naszym Inspektorem Ochrony Danych pod adresem <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Odpowiemy na Twoje żądanie w ciągu 30 dni, zgodnie z wymogami RODO.'
        }
      }
    },

    cric: {
      title: 'CRIC — Firma i kontakt',
      updatedDate: '27 września 2025',
      quickLinks: {
        title: 'Szybkie linki',
        links: [
          { id: 'overview', text: 'Przegląd' },
          { id: 'contact', text: 'Kontakt' },
          { id: 'emergency', text: 'Nagłe wypadki' }
        ]
      },
      sections: {
        badge: {
          title: 'Oficjalne informacje o firmie:',
          body: 'Pełne szczegóły rejestracji biznesowej i informacje kontaktowe dla DEVOCEAN Lodge.'
        },
        overview: {
          title: 'Przegląd',
          body: 'Pełne szczegóły rejestracji biznesowej i informacje kontaktowe dla DEVOCEAN Lodge.',
          details: [
            { label: 'Nazwa firmy', value: '' },
            { label: 'Rejestracja handlowa', value: '' },
            { label: 'Numer VAT (NUIT)', value: '' },
            { label: 'Licencja biznesowa (Alvará)', value: '' },
            { label: 'Forma prawna', value: 'Spółka z ograniczoną odpowiedzialnością' },
            { label: 'Kapitał zakładowy', value: '' }
          ]
        },
        contact: {
          title: 'Kontakt',
          body: 'W przypadku ogólnych zapytań, rezerwacji i informacji o naszych usługach, prosimy o użycie poniższych danych kontaktowych.',
          details: [
            { label: 'Adres rejestrowy', value: '' },
            { label: 'E-mail', value: '' },
            { label: 'Telefon', value: '' },
            { label: 'Godziny pracy', value: 'Poniedziałek - piątek: 8:00 - 18:00<br>Sobota i niedziela: 8:00 - 12:00<br>Recepcja: 6:00 - 22:00 (dla gości)' }
          ]
        },
        emergency: {
          title: 'Kontakt w nagłych wypadkach',
          body: 'W przypadku pilnych spraw poza godzinami pracy, prosimy o użycie naszych danych kontaktowych w nagłych wypadkach.',
          details: [
            { label: 'Telefon awaryjny', value: '', subtitle: 'W przypadku pilnych spraw poza godzinami pracy' },
            { label: 'E-mail awaryjny', value: '' }
          ]
        }
      }
    }
  };

  // -------- JAPANESE --------
  window.LEGAL_DICT.ja = {
    privacy: {
      title: 'プライバシーポリシー',
      updatedDate: '2025年10月6日',
      quickLinks: {
        title: 'クイックリンク',
        links: [
          { id: 'who', text: '私たちについて' },
          { id: 'collect', text: 'データ収集' },
          { id: 'use', text: 'データ使用' },
          { id: 'share', text: 'データ共有' },
          { id: 'security', text: 'セキュリティ' },
          { id: 'retention', text: '保持' },
          { id: 'rights', text: 'お客様の権利' },
          { id: 'transfers', text: '国際転送' },
          { id: 'contact', text: '連絡先' },
          { id: 'updates', text: 'ポリシー更新' }
        ]
      },
      sections: {
        badge: {
          title: 'お客様のプライバシーは重要です:',
          body: '個人データの保護に取り組み、情報の収集、使用、保護方法について透明性を保ちます。'
        },
        who: {
          title: '私たちについて',
          body: 'DEVOCEAN Lodgeは、モザンビークに登録されたTERRAfrique LDAによって運営されています。登録住所はRua C, Parcela 12, Maputo 1118, Mozambiqueです。モザンビーク南部のPonta do Ouroでエコフレンドリーなビーチ宿泊施設を運営しています。適用されるデータ保護法に基づき、個人データの収集、処理、使用を適切、合法的、透明に行うことを約束します。当社のウェブサイトおよびサービスにアクセスまたは使用することにより、このプライバシーポリシーに記載されている情報の収集および使用に同意したものとみなされます。'
        },
        collect: {
          title: '収集する個人データ',
          intro: 'サービスを提供および改善するために、さまざまな種類の情報を収集します：',
          categories: [
            {
              title: '個人情報',
              items: [
                '氏名、連絡先詳細',
                'パスポート/ID情報',
                '支払い情報',
                '予約好み'
              ]
            },
            {
              title: '技術データ',
              items: [
                'IPアドレス、デバイス情報',
                'ブラウザの種類とバージョン',
                'ウェブサイト使用分析',
                'Cookieデータ（同意あり）'
              ]
            },
            {
              title: '通信データ',
              items: [
                'メール対応',
                'カスタマーサービス依頼',
                'フィードバックおよびレビュー',
                'マーケティング好み'
              ]
            }
          ]
        },
        use: {
          title: 'データの使用方法',
          items: [
            '予約管理およびサービス提供',
            '滞在、ポリシー、オファーに関する通信（オプトイン）',
            'サイトおよびサービスの改善（分析、セキュリティ）',
            '法的/財務的義務の遵守'
          ]
        },
        share: {
          title: 'データ共有のタイミング',
          items: [
            '予約および支払いの処理のための支払いプロバイダーおよび予約プラットフォーム',
            'ウェブサイト使用の理解およびサービスの改善のための分析サービス',
            'ターゲットマーケティングのための広告サービス（同意あり）',
            '厳格な機密保持契約の下でのITサービスプロバイダー、ホスティングプロバイダー、技術サポートベンダー',
            '法、規制、裁判所命令、その他の法的プロセスで要求された場合の法的当局',
            '契約の執行または権利、財産、安全の保護',
            '合併、買収、資産売却の場合、新しい所有者に情報の転送'
          ],
          footer: 'すべての第三者に個人データのセキュリティを尊重し、転送された目的のみで使用することを要求します。第三者が自身の目的で個人データを使用することを許可せず、当社の指示に従った指定された目的でのみ処理を許可します。'
        },
        security: {
          title: 'セキュリティ対策',
          intro: 'データセキュリティを真剣に受け止め、以下を実施します：',
          measures: [
            '転送中および保存中の機密データの暗号化',
            '定期的なセキュリティ評価および侵入テスト',
            'アクセス制御および認証メカニズム',
            'データ保護およびプライバシーに関するスタッフ研修',
            'セキュアなデータバックアップおよび災害復旧手順'
          ]
        },
        retention: {
          title: 'データ保持',
          body: 'このプライバシーポリシーに記載された収集目的を果たすために必要な限り、個人情報を保持します。一般的に、最終的なやり取り後1年間保持しますが、法的に要求または許可された場合はより長く保持します。特定の理由でより長く保持する必要がある場合があります：適用法に基づく記録保持および報告（通常、金融および税務記録は7年）、法的権利の執行、詐欺防止、紛争解決。保持期間が終了すると、個人データは安全に削除または匿名化されます。直接または間接的にお客様を識別しない残留匿名情報および集計情報は、統計および分析目的で無期限に保存される場合があります。'
        },
        rights: {
          title: 'お客様のプライバシー権利',
          items: [
            '個人データへのアクセス権',
            '不正確なデータの訂正権',
            '個人データの削除権',
            '処理の制限または異議申し立て権',
            'データポータビリティ権',
            '同意の撤回権'
          ]
        },
        transfers: {
          title: '国際データ転送',
          body: '複数管轄区域で運営するため、居住国外の国にデータが転送および処理される場合があります。欧州委員会の十分性決定、標準契約条項（SCC）、適切なセキュリティ保護措置、転送場所の透明性を通じて、適用されるデータ保護法に準拠します。'
        },
        contact: {
          title: 'プライバシーチームへの連絡',
          body: 'このプライバシーポリシーまたは個人情報の処理に関する質問、懸念、依頼、またはプライバシー権利の行使については、以下の連絡先までご連絡ください：<br><br><strong>メール:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>電話:</strong> +258 8441 82252<br><strong>郵送住所:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique<br><br>30日以内にお客様のプライバシー権利に関する依頼に対応するよう努めます。'
        },
        updates: {
          title: 'ポリシー更新',
          body: '慣行、技術、法的要件、その他の要因の変更を反映するため、プライバシーポリシーを随時更新する可能性があります。登録ユーザーのメール通知、ウェブサイトの目立つお知らせ、更新された「最終更新日」を通じて、重要な変更をお知らせします。情報の保護方法について最新情報を得るため、定期的にこのポリシーを確認することをお勧めします。'
        }
      }
    },

    cookies: {
      title: 'Cookieポリシー',
      effectiveDate: '2025年9月19日',
      lastUpdated: '2025年10月6日',
      managePreferences: 'Cookie設定を管理:',
      manageText: 'Cookieバナーまたはブラウザ設定を通じて、使用するCookieを制御できます。',
      cookieSettingsBtn: 'Cookie設定',
      quickLinks: {
        title: 'クイックリンク',
        links: [
          { id: 'what', text: 'Cookieとは' },
          { id: 'how', text: 'Cookieの使用方法' },
          { id: 'necessary', text: '必須' },
          { id: 'functional', text: '機能' },
          { id: 'analytics', text: '分析' },
          { id: 'advertisement', text: '広告' },
          { id: 'manage', text: '設定管理' }
        ]
      },
      sections: {
        badge: {
          title: 'Cookieについて',
          body: 'Cookieバナーまたはブラウザ設定を通じて、使用するCookieを制御できます。'
        },
        what: {
          title: 'Cookieとは何ですか？',
          body: 'このCookieポリシーは、Cookieとは何か、私たちがどのように使用するか、使用するCookieの種類（Cookieを使用して収集する情報およびその使用方法）、Cookie設定の管理方法を説明します。<br><br>Cookieは、小さなテキストファイルで、小さな情報を保存するために使用されます。ウェブサイトがブラウザにロードされるとデバイスに保存されます。これらのCookieは、ウェブサイトの機能を適切に働かせ、より安全にし、ユーザー体験を向上させ、何がうまくいって何がうまくいかないかを理解し、改善すべき点を知るのに役立ちます。'
        },
        how: {
          title: 'Cookieをどのように使用しますか？',
          body: 'ほとんどのオンラインサービスと同様に、当社のウェブサイトはさまざまな目的でファーストパーティおよびサードパーティCookieを使用します。ファーストパーティCookieは主にウェブサイトの適切な機能に必要で、個人を特定できるデータを収集しません。<br><br>当社のウェブサイトで使用されるサードパーティCookieは、主にウェブサイトのパフォーマンスの理解、ウェブサイトとのインタラクション、サービスのセキュリティ維持、お客様に関連する広告の提供、そして全体的により良いユーザー体験の提供に使用され、ウェブサイトとの将来のインタラクションを迅速化するのに役立ちます。'
        },
        necessary: {
          title: '必須Cookie',
          description: '必須Cookieはこのサイトの基本機能（セキュアなログインや同意設定の調整など）を有効にするために必要です。これらのCookieは個人を特定できるデータを保存しません。',
          tableHeaders: { cookie: 'Cookie', duration: '期間', description: '説明' },
          cookies: [
            { name: 'preferredCurrency', duration: '1 year', desc: 'このCookieは、使用者の通貨設定を保存するために使用されます。' },
            { name: 'cookieyes-consent', duration: '1 year', desc: '説明は現在利用できません。' },
            { name: 'cky-action', duration: 'Session', desc: '説明は現在利用できません。' },
            { name: 'cookieyes-necessary', duration: '1 year', desc: '説明が利用できません。' },
            { name: 'cookieyes-functional', duration: '1 year', desc: '説明は現在利用できません。' },
            { name: 'cookieyes-analytics', duration: '1 year', desc: '説明は現在利用できません。' }
          ]
        },
        functional: {
          title: '機能Cookie',
          description: '機能Cookieは、ソーシャルメディアでのコンテンツ共有、フィードバック収集、その他のサードパーティ機能などの特定の機能を実行するのを支援します。',
          tableHeaders: { cookie: 'Cookie', duration: '期間', description: '説明' },
          cookies: [
            { name: '_fbp', duration: '3 months', desc: 'FacebookはこのCookieを設定して、ウェブサイト上のユーザーの閲覧体験を向上させ、Facebookのソーシャルメディアプラットフォームを使用する際に関連広告を提供します。' }
          ]
        },
        analytics: {
          title: '分析Cookie',
          description: '分析Cookieは、訪問者がウェブサイトとどのようにインタラクトするかを理解するために使用されます。これらのCookieは、訪問者数、リバウンド率、トラフィックソースなどのメトリクスに関する情報を提供します。',
          tableHeaders: { cookie: 'Cookie', duration: '期間', description: '説明' },
          cookies: [
            { name: '_ga', duration: '1 year 1 month 4 days', desc: 'Google AnalyticsはこのCookieを設定して、訪問者、セッション、キャンペーンデータを計算し、サイト使用を追跡してサイトの分析レポートを作成します。Cookieは匿名で情報を保存し、ユニークな訪問者を認識するためにランダムに生成された番号を割り当てます。' },
            { name: '_gat', duration: '1 minute', desc: 'Google AnalyticsはこのCookieを設定して、ページビューを保存およびカウントします。' },
            { name: '_gid', duration: '1 day', desc: 'Google AnalyticsはこのCookieを設定して、訪問者がウェブサイトをどのように使用するかの情報を保存し、ウェブサイトのパフォーマンス分析レポートを作成します。収集されたデータの一部には、訪問者数、ソース、匿名で訪問したページが含まれます。' },
            { name: '_ga_*', duration: '1 year 1 month 4 days', desc: 'Google AnalyticsはこのCookieをユーザー行動追跡のために設定します。' },
            { name: 'pardot', duration: 'Session', desc: '訪問者がPardotユーザーとしてログインしている間、pardot Cookieが設定されます。このCookieはアクティブセッションを示し、追跡には使用されません。' }
          ]
        },
        advertisement: {
          title: '広告Cookie',
          description: '広告Cookieは、以前に訪問したページに基づくカスタマイズされた広告を提供し、広告キャンペーンの効果を分析するために使用されます。',
          tableHeaders: { cookie: 'Cookie', duration: '期間', description: '説明' },
          cookies: [
            { name: '_gcl_au', duration: '3 months', desc: 'Google Tag ManagerはこのCookieを設定して、サービスを使用するウェブサイトの広告効率をテストします。' },
            { name: 'test_cookie', duration: '15 minutes', desc: 'doubleclick.netはこのCookieを設定して、使用者のブラウザがCookieをサポートするかを判断します。' },
            { name: 'fr', duration: '3 months', desc: 'FacebookはこのCookieを設定して、インタラクションを保存および追跡します。' },
            { name: 'IDE', duration: '1 year 24 days', desc: 'Google DoubleClick IDE Cookieは、使用者がウェブサイトをどのように使用するかの情報を保存し、ユーザー プロファイルに基づく関連広告を提示します。' }
          ]
        },
        manage: {
          title: 'Cookie設定を管理',
          consentTitle: '同意設定',
          consentText: '上記の「同意設定」ボタンをクリックして、いつでもCookie設定を変更できます。これにより、Cookie同意バナーを再表示し、設定を更新または同意を即時撤回できます。',
          browserText: 'さらに、さまざまなブラウザはウェブサイトで使用されるCookieのブロックおよび削除のためのさまざまな方法を提供します。ブラウザ設定を調整してCookieをブロックまたは削除できます。主なウェブブラウザでのCookieの管理および削除方法のサポートドキュメントへのリンクを以下に示します。',
          browsers: {
            chrome: 'Chrome',
            safari: 'Safari',
            firefox: 'Firefox',
            ie: 'Internet Explorer',
            other: '別のウェブブラウザを使用している場合、公式サポートドキュメントを参照してください。'
          }
        }
      }
    },

    terms: {
      title: '利用規約',
      updatedDate: '2025年10月6日',
      quickLinks: {
        title: 'クイックリンク',
        links: [
          { id: 'intro', text: '適用範囲' },
          { id: 'booking', text: '予約' },
          { id: 'payment', text: '料金と支払い' },
          { id: 'cancel', text: 'キャンセル' },
          { id: 'conduct', text: 'ゲストの行動' },
          { id: 'force-majeure', text: '不可抗力' },
          { id: 'liability', text: '責任' },
          { id: 'intellectual-property', text: '知的財産' },
          { id: 'disputes', text: '紛争解決' },
          { id: 'changes', text: '変更' },
          { id: 'law', text: '準拠法' },
          { id: 'contact', text: '連絡先' }
        ]
      },
      sections: {
        badge: {
          title: '重要な法的通知:',
          body: 'これらの規約は、当社のサービスおよびウェブサイトの使用を規定します。予約前に慎重に読んでください。'
        },
        intro: {
          title: '適用範囲',
          body: 'これらの規約は、DEVOCEAN Lodge（TERRAfrique LDA）が提供する宿泊および関連サービスを規定します。予約により、これらの規約に同意するものとします。'
        },
        booking: {
          title: '予約',
          items: [
            '正確なゲスト情報および到着/出発日を提供',
            '特別リクエストは利用可能性と確認の対象'
          ],
          reservationReq: {
            title: '予約要件',
            body: 'すべての予約に有効なIDおよびクレジットカードが必要です。最低年齢：18歳。'
          },
          checkinCheckout: {
            title: 'チェックイン/チェックアウト',
            body: 'チェックイン：午後2:00 | チェックアウト：午前11:00。早朝/遅朝のリクエストは利用可能性の対象。'
          },
          groupBookings: {
            title: 'グループ予約',
            body: '6室以上のグループには特別規約が適用されます。グループ料金およびポリシーについてはお問い合わせください。'
          }
        },
        payment: {
          title: '料金と支払い',
          items: [
            '表示された料金は、明記されていない限りユニット/泊ごと',
            'デポジットおよび決済方法は予約時に確認'
          ],
          paymentInfo: {
            title: '支払い情報',
            body: 'すべての料金は明記されていない限りUSDです。通貨換算レートは概算値で変更される可能性があります。予約を確保するために有効なクレジットカードが必要です。追加料金は臨時費用に適用される可能性があります。'
          }
        },
        cancel: {
          title: 'キャンセルと不手際',
          body: 'キャンセル条件は予約時および確認書に記載されています。',
          cancellationCharges: {
            title: 'キャンセル料金',
            plans: [
              {
                planName: 'セミフレキシブル料金プラン:',
                tiers: [
                  { period: '到着30日前またはそれ以上', charge: '全額返金' },
                  { period: '到着29日前またはそれ以下', charge: '50%キャンセル料' }
                ]
              },
              {
                planName: '非返金料金プラン:',
                tiers: [
                  { period: '予約後24時間まで', charge: '全額返金' },
                  { period: 'その他のすべての状況', charge: '返金なし', subtext: '新しい日付の料金が高い場合の差額支払いの条件で、一度だけ到着日を変更する権利。' }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: '不手際ポリシー',
            body: '事前通知なしで予定のチェックイン日に到着しないゲストは不手際とみなされます。全額請求され、予約はキャンセルされます。'
          }
        },
        conduct: {
          title: 'ゲストの行動',
          items: [
            '施設ルール、スタッフ、他のゲスト、地元コミュニティを尊重',
            '施設内での違法行為禁止'
          ],
          zeroTolerance: {
            title: 'ゼロトレランスポリシー',
            body: '乱暴な行動、違法行為、財産損害に対してゼロトレランスポリシーを維持します。違反は即時退去（返金なし）および法的措置につながる可能性があります。'
          }
        },
        'force-majeure': {
          title: '不可抗力',
          intro: '当社の合理的な制御を超えた状況により義務を履行できない場合、当社は責任を負いません。以下を含むがこれに限定されません：',
          items: [
            '自然災害、極端な気象条件',
            '政府制限、渡航禁止',
            '内乱、戦争、テロリズム',
            'パンデミック、流行、健康緊急事態',
            '公益事業の故障、インフラ崩壊'
          ],
          footer: 'このような場合、可能な限り代替日またはクレジットバウチャーを提供します。適用法および状況に基づき返金します。ただし、一般的に利用可能なキャンセルおよび渡航保険パッケージでカバーされる可能性のあるすべての損害および費用は、当社の責任から除外されます。'
        },
        liability: {
          title: '責任',
          body: '法的に許可される範囲で、間接的または予測不能な損失に対して責任を負いません。'
        },
        'intellectual-property': {
          title: '知的財産',
          copyright: {
            title: '著作権通知',
            body: 'このウェブサイトのすべてのコンテンツ（テキスト、グラフィックス、ロゴ、画像）はDEVOCEAN Lodgeの財産であり、国際著作権法で保護されています。無許可の使用、複製、配布は禁止されます。DEVOCEAN Lodgeの名称、ロゴ、および関連マークは商標であり、書面による許可なしに使用できません。'
          }
        },
        disputes: {
          title: '紛争解決',
          process: {
            title: '解決プロセス',
            body: 'すべての紛争を友好的に解決することを目指します。まず解決を試みるためご連絡ください。解決されない場合、法的措置前に調停を行います。',
            law: '準拠法：これらの規約および紛争はモザンビーク法が適用されます。',
            jurisdiction: '管轄：モザンビークのMaputo裁判所が専属的管轄権を持ちます。',
            mediation: '調停：当事者は法的訴訟を開始する前に認定調停者を介した調停を試みること同意します。'
          }
        },
        changes: {
          title: 'これらの規約の変更',
          body: '規約を随時更新する可能性があります。投稿されたバージョンが滞在に適用されます。'
        },
        law: {
          title: '準拠法',
          body: 'モザンビーク法が適用され、必須の地元消費者ルールに従います。'
        },
        contact: {
          title: '連絡先',
          body: 'ご質問は？ <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>。'
        }
      }
    },

    gdpr: {
      title: 'GDPR通知',
      updatedDate: '2025年10月6日',
      quickLinks: {
        title: 'クイックリンク',
        links: [
          { id: 'controller', text: '管理者' },
          { id: 'bases', text: '処理の法的根拠' },
          { id: 'rights', text: 'お客様の権利' },
          { id: 'retention', text: 'データ保持' },
          { id: 'transfers', text: 'データ転送' },
          { id: 'complaints', text: '苦情' }
        ]
      },
      sections: {
        badge: {
          title: 'GDPR準拠:',
          body: '一般データ保護規則（GDPR）に基づき、お客様の個人データを保護し、プライバシー権を尊重することに取り組んでいます。'
        },
        controller: {
          title: 'データ管理者',
          body: 'TERRAfrique LDA（DEVOCEAN Lodge）は、モザンビークのRua C, Parcela 12, Maputo 1118に登録されており、当社のサービスを通じて収集されるお客様の個人情報のデータ管理者として機能します。'
        },
        bases: {
          title: '処理の法的根拠',
          body: 'GDPRに基づく以下の法的根拠により、お客様の個人データを処理します：',
          legalBases: {
            contract: {
              title: '契約:',
              body: '予約契約およびサービスの履行に必要な処理。'
            },
            legal: {
              title: '法的義務:',
              body: '法的要件（例：税法）への準拠に必要な処理。'
            },
            legitimate: {
              title: '正当な利益:',
              body: 'お客様の権利を尊重しつつ、当社の正当な事業利益のための処理。'
            },
            consent: {
              title: '同意:',
              body: '特定の目的に対する明示的な同意に基づく処理。'
            }
          }
        },
        rights: {
          title: 'お客様のGDPR権利',
          body: 'GDPRに基づくデータ主体として、お客様の個人データに関する以下の権利をお持ちです：',
          access: {
            title: 'アクセス権',
            body: '当社が保有するお客様の個人データのコピーを要求できます。'
          },
          rectification: {
            title: '訂正権',
            body: '不正確または不完全なデータの修正を要求できます。'
          },
          erasure: {
            title: '消去権',
            body: '特定の条件下で、お客様の個人データの削除を要求できます。'
          },
          restrict: {
            title: '処理の制限権',
            body: 'データの使用方法の制限を要求できます。'
          },
          portability: {
            title: 'データポータビリティ権',
            body: 'データを別の組織に転送することを要求できます。'
          },
          object: {
            title: '異議申し立て権',
            body: 'データの特定の種類の処理に異議を申し立てることができます。'
          },
          buttons: {
            access: { text: 'データアクセスを要求' },
            erasure: { text: 'データ削除を要求' }
          }
        },
        retention: {
          title: 'データ保持',
          periodsTitle: '保持期間',
          intro: '収集目的を果たすために必要な期間、法的・会計・報告要件を含む限り、個人データを保持します。',
          items: [
            '<strong>予約データ:</strong> 税務および法的準拠のため7年間',
            '<strong>カスタマーサービス通信:</strong> 3年間',
            '<strong>マーケティング同意:</strong> 同意の撤回まで',
            '<strong>ウェブサイト分析:</strong> 26ヶ月',
            '<strong>財務取引:</strong> 会計目的のため10年間'
          ]
        },
        transfers: {
          title: '国際データ転送',
          body: '欧州経済領域（EEA）外にデータを転送する場合、欧州委員会が承認した標準契約条項の使用や、十分性決定を受けた国への転送を含む、適切な保護措置を確保します。',
          notice: {
            title: '国際データ転送:',
            body: '国際的なデータ転送時に、標準契約条項の使用や十分性決定の確保を含む適切な保護措置を講じます。'
          }
        },
        complaints: {
          title: '苦情',
          intro: '個人データの取り扱いに関する懸念がある場合、地元のデータ保護当局に苦情を申し立てる権利があります。',
          authority: {
            label: '主要な監督当局:',
            name: 'ポルトガルデータ保護当局（CNPD）',
            websiteLabel: 'ウェブサイト:',
            contactLabel: '連絡先:'
          },
          footer: '監督当局に連絡する前に、懸念事項を解決するため、まず当社にご連絡いただくことをお勧めします。'
        },
        dpo: {
          title: 'データ保護担当者への連絡',
          body: 'GDPR関連の質問や権利行使については、データ保護担当者に<a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>までご連絡ください。GDPRで定められた通り、30日以内にご依頼に対応します。'
        }
      }
    },

    cric: {
      title: 'CRIC — 会社と連絡先',
      updatedDate: '2025年9月27日',
      quickLinks: {
        title: 'クイックリンク',
        links: [
          { id: 'overview', text: '概要' },
          { id: 'contact', text: '連絡先' },
          { id: 'emergency', text: '緊急' }
        ]
      },
      sections: {
        badge: {
          title: '公式会社情報:',
          body: 'DEVOCEAN Lodgeの完全な事業登録詳細および連絡情報。'
        },
        overview: {
          title: '概要',
          body: 'DEVOCEAN Lodgeの完全な事業登録詳細および連絡情報。',
          details: [
            { label: '会社名', value: '' },
            { label: '商業登録', value: '' },
            { label: 'VAT番号（NUIT）', value: '' },
            { label: '事業ライセンス（Alvará）', value: '' },
            { label: '法人形態', value: '有限責任会社' },
            { label: '株式資本', value: '' }
          ]
        },
        contact: {
          title: '連絡先',
          body: '一般的なお問い合わせ、予約、サービス情報については、以下の連絡先詳細を使用してください。',
          details: [
            { label: '登録住所', value: '' },
            { label: 'メール', value: '' },
            { label: '電話', value: '' },
            { label: '営業時間', value: '月曜日 - 金曜日: 午前8:00 - 午後6:00<br>土曜日 & 日曜日: 午前8:00 - 正午12:00<br>フロントデスク: 午前6:00 - 午後10:00（ゲスト向け）' }
          ]
        },
        emergency: {
          title: '緊急連絡先',
          body: '営業時間外の緊急事項については、緊急連絡先詳細を使用してください。',
          details: [
            { label: '緊急電話', value: '', subtitle: '営業時間外の緊急事項向け' },
            { label: '緊急メール', value: '' }
          ]
        }
      }
    }
  };

  // -------- CHINESE (Mandarin, Simplified) --------
  window.LEGAL_DICT.zh = {
    privacy: {
      title: '隐私政策',
      updatedDate: '2025年10月6日',
      quickLinks: {
        title: '快速链接',
        links: [
          { id: 'who', text: '我们是谁' },
          { id: 'collect', text: '数据收集' },
          { id: 'use', text: '数据使用' },
          { id: 'share', text: '数据共享' },
          { id: 'security', text: '安全' },
          { id: 'retention', text: '保留' },
          { id: 'rights', text: '您的权利' },
          { id: 'transfers', text: '国际转移' },
          { id: 'contact', text: '联系方式' },
          { id: 'updates', text: '政策更新' }
        ]
      },
      sections: {
        badge: {
          title: '您的隐私至关重要：',
          body: '我们致力于保护您的个人数据，并对我们如何收集、使用和保护您的信息保持透明。'
        },
        who: {
          title: '我们是谁',
          body: 'DEVOCEAN Lodge 由在莫桑比克注册的 TERRAfrique LDA 运营。注册地址为莫桑比克马普托 Rua C, Parcela 12, Maputo 1118。我们在莫桑比克蓬塔多奥罗运营环保海滩住宿。我们致力于保护您的隐私，确保根据适用数据保护法适当、合法、透明地收集、处理和使用您的个人数据。使用我们的网站和服务即表示您同意本隐私政策中描述的信息收集和使用。'
        },
        collect: {
          title: '我们收集的个人数据',
          intro: '我们收集不同类型的信息以提供和改进我们的服务：',
          categories: [
            {
              title: '个人信息',
              items: ['姓名、联系方式', '护照/身份证信息', '支付信息', '预订偏好']
            },
            {
              title: '技术数据',
              items: ['IP 地址、设备信息', '浏览器类型和版本', '网站使用分析', 'Cookie 数据（需同意）']
            },
            {
              title: '通信数据',
              items: ['电子邮件通信', '客户服务请求', '反馈和评论', '营销偏好']
            }
          ]
        },
        use: {
          title: '我们如何使用您的数据',
          items: [
            '管理预订和提供服务',
            '关于您的住宿、政策和优惠的沟通（需选择加入）',
            '改进我们的网站和服务（分析、安全）',
            '遵守法律/财务义务'
          ]
        },
        share: {
          title: '何时共享数据',
          items: [
            '用于处理您的预订和付款的支付提供商和预订平台',
            '用于了解网站使用情况和改进服务的分析服务',
            '用于定向营销的广告服务（仅在您同意的情况下）',
            '在严格保密协议下的 IT 服务提供商、托管提供商和技术支持供应商',
            '在法律、法规、法院命令或其他法律程序要求的情况下，向法律当局共享',
            '执行合同或保护权利、财产、安全',
            '在合并、收购、资产出售的情况下，将信息转移给新所有者'
          ],
          footer: '我们要求所有第三方尊重个人数据的安全性，并仅用于传输的目的。第三方不得将个人数据用于其自身目的，仅允许按照我们的指示为指定目的进行处理。'
        },
        security: {
          title: '安全措施',
          intro: '我们认真对待数据安全，并实施以下措施：',
          measures: [
            '传输和存储中的敏感数据加密',
            '定期安全评估和渗透测试',
            '访问控制和认证机制',
            '员工数据保护和隐私培训',
            '安全数据备份和灾难恢复程序'
          ]
        },
        retention: {
          title: '数据保留',
          body: '我们将根据本隐私政策中详述的收集目的所需的时间保留您的个人信息。通常，我们会在您最后一次与我们互动后保留个人数据 1 年，除非法律要求或允许更长的保留期限。我们可能因特定原因需要更长时间保留信息，包括：根据适用法律进行记录保存和报告（通常财务和税务记录为 7 年）、执行法律权利、防止欺诈和解决争议。保留期限结束后，您的个人数据将被安全删除或匿名化。不直接或间接识别您身份的剩余匿名信息和汇总信息可能无限期存储用于统计和分析目的。'
        },
        rights: {
          title: '您的隐私权利',
          items: [
            '访问个人数据的权利',
            '纠正不准确数据的权利',
            '删除个人数据的权利',
            '限制或反对处理的权利',
            '数据可携性的权利',
            '撤回同意的权利'
          ]
        },
        transfers: {
          title: '国际数据转移',
          body: '由于我们在多个司法管辖区运营，您的数据可能被转移到您居住国以外的国家并在其中处理。我们通过欧盟委员会的充分性决定、标准合同条款（SCC）、适当的安全保障措施以及转移地点的透明性，确保此类转移符合适用数据保护法。'
        },
        contact: {
          title: '联系我们的隐私团队',
          body: '如对本隐私政策或个人信息的处理有任何疑问、顾虑、请求，或希望行使您的隐私权利，请通过以下方式联系我们：<br><br><strong>电子邮件：</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>电话：</strong> +258 8441 82252<br><strong>邮寄地址：</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mozambique<br><br>我们将根据适用数据保护法在合理的时间内（通常在收到请求后 30 天内）响应您的请求。'
        },
        updates: {
          title: '政策更新',
          body: '我们可能会不时更新本隐私政策，以反映我们的做法、技术、法律要求或其他因素的变化。我们将通过注册用户的电子邮件通知、网站上的显著通知以及更新的"最后更新"日期通知您任何重大变化。我们建议您定期查看本政策，以了解我们如何保护您的信息。'
        }
      }
    },

    cookies: {
      title: 'Cookie 政策',
      effectiveDate: '2025年9月19日',
      lastUpdated: '2025年10月6日',
      managePreferences: '管理您的 Cookie 偏好：',
      manageText: '您可以通过我们的 Cookie 横幅或浏览器设置控制我们使用的 Cookie。',
      cookieSettingsBtn: 'Cookie 设置',
      quickLinks: {
        title: '快速链接',
        links: [
          { id: 'what', text: '什么是 Cookie' },
          { id: 'how', text: '我们如何使用 Cookie' },
          { id: 'necessary', text: '必要' },
          { id: 'functional', text: '功能' },
          { id: 'analytics', text: '分析' },
          { id: 'advertisement', text: '广告' },
          { id: 'manage', text: '管理偏好' }
        ]
      },
      sections: {
        badge: {
          title: '关于 Cookie',
          body: '您可以通过我们的 Cookie 横幅或浏览器设置控制我们使用的 Cookie。'
        },
        what: {
          title: '什么是 Cookie？',
          body: '本 Cookie 政策解释了什么是 Cookie，我们如何使用它们，我们使用的 Cookie 类型（即使用 Cookie 收集的信息及其使用方式），以及如何管理您的 Cookie 设置。<br><br>Cookie 是用于存储少量信息的小型文本文件。它们在网站加载到您的浏览器时存储在您的设备上。这些 Cookie 有助于确保网站正常运行、增强安全性、提供更好的用户体验，并通过分析性能来确定哪些方面运作良好及需要改进的地方。'
        },
        how: {
          title: '我们如何使用 Cookie？',
          body: '与大多数在线服务一样，我们的网站出于各种目的使用第一方和第三方 Cookie。第一方 Cookie 主要用于确保网站正常运行，不收集任何可识别个人身份的数据。<br><br>我们网站上使用的第三方 Cookie 主要用于了解网站的表现、跟踪您与网站的互动、保持服务安全、提供相关广告、提升您的整体用户体验，并加快您未来与我们网站的互动速度。'
        },
        necessary: {
          title: '必要 Cookie',
          description: '必要 Cookie 是启用本网站基本功能（如提供安全登录或调整您的同意偏好）所需的。这些 Cookie 不存储任何可识别个人身份的数据。',
          tableHeaders: { cookie: 'Cookie', duration: '持续时间', description: '描述' },
          cookies: [
            { name: 'DEVOCEAN_CURRENCY', duration: '365 天', desc: '此 Cookie 用于存储用户的货币偏好。' },
            { name: 'cookieyes-consent', duration: '1 年', desc: '目前无描述可用。' },
            { name: 'rc::a', duration: '持久', desc: '目前无描述可用。' },
            { name: 'rc::c', duration: '会话', desc: '无描述可用。' },
            { name: 'li_gc', duration: '180 天', desc: '目前无描述可用。' },
            { name: 'rc::b', duration: '会话', desc: '目前无描述可用。' }
          ]
        },
        functional: {
          title: '功能 Cookie',
          description: '功能 Cookie 有助于执行某些功能，如在社交媒体平台上分享网站内容、收集反馈以及其他第三方功能。',
          tableHeaders: { cookie: 'Cookie', duration: '持续时间', description: '描述' },
          cookies: [
            { name: '_fbp', duration: '3 个月', desc: 'Facebook 设置此 Cookie 以提升用户在网站上的浏览体验，并在使用 Facebook 的社交媒体平台时提供相关广告。' }
          ]
        },
        analytics: {
          title: '分析 Cookie',
          description: '分析 Cookie 用于了解访问者如何与网站互动。这些 Cookie 有助于提供有关访问者数量、跳出率、流量来源等指标的信息。',
          tableHeaders: { cookie: 'Cookie', duration: '持续时间', description: '描述' },
          cookies: [
            { name: '_ga', duration: '1 年 1 个月 4 天', desc: 'Google Analytics 设置此 Cookie 以计算访问者、会话和活动数据，并跟踪网站使用情况以生成网站分析报告。Cookie 匿名存储信息，并分配一个随机生成的编号以识别唯一访问者。' },
            { name: '_gat_gtag_UA_*', duration: '1 分钟', desc: 'Google Analytics 设置此 Cookie 以存储和计数页面浏览量。' },
            { name: '_gid', duration: '1 天', desc: 'Google Analytics 设置此 Cookie 以存储访问者如何使用网站的信息，同时生成网站性能分析报告。收集的部分数据包括访问者数量、来源以及匿名访问的页面。' },
            { name: '_ga_*', duration: '1 年 1 个月 4 天', desc: 'Google Analytics 为用户行为跟踪设置此 Cookie。' },
            { name: 'visitor_id*-hash', duration: '10 年', desc: '当访问者以 Pardot 用户身份登录时，设置 pardot Cookie。此 Cookie 表示活跃会话，不用于跟踪。' }
          ]
        },
        advertisement: {
          title: '广告 Cookie',
          description: '广告 Cookie 用于根据您之前访问的页面为访问者提供定制广告，并分析广告活动的有效性。',
          tableHeaders: { cookie: 'Cookie', duration: '持续时间', description: '描述' },
          cookies: [
            { name: '_gcl_au', duration: '3 个月', desc: 'Google Tag Manager 设置此 Cookie 以测试使用其服务的网站的广告效率。' },
            { name: 'test_cookie', duration: '15 分钟', desc: 'doubleclick.net 设置此 Cookie 以确定用户的浏览器是否支持 Cookie。' },
            { name: 'fr', duration: '3 个月', desc: 'Facebook 设置此 Cookie 以存储和跟踪互动。' },
            { name: 'IDE', duration: '1 年 24 天', desc: 'Google DoubleClick IDE Cookie 存储用户如何使用网站的信息，以根据用户简介呈现相关广告。' }
          ]
        },
        manage: {
          title: '管理 Cookie 偏好',
          consentTitle: '同意偏好',
          consentText: '您可以随时通过点击上方的"同意偏好"按钮修改您的 Cookie 设置。这将允许您重新访问 Cookie 同意横幅并更新您的偏好或立即撤回您的同意。',
          browserText: '此外，不同浏览器提供多种方法来阻止和删除网站使用的 Cookie。您可以调整浏览器设置以阻止或删除 Cookie。以下是主要网络浏览器中管理和删除 Cookie 的支持文档链接。',
          browsers: {
            chrome: 'Chrome',
            safari: 'Safari',
            firefox: 'Firefox',
            ie: 'Internet Explorer',
            other: '如果您使用其他网络浏览器，请参阅其官方支持文档。'
          }
        }
      }
    },

    terms: {
      title: '条款与条件',
      updatedDate: '2025年10月6日',
      quickLinks: {
        title: '快速链接',
        links: [
          { id: 'intro', text: '范围' },
          { id: 'booking', text: '预订' },
          { id: 'payment', text: '价格与支付' },
          { id: 'cancel', text: '取消' },
          { id: 'conduct', text: '宾客行为' },
          { id: 'force-majeure', text: '不可抗力' },
          { id: 'liability', text: '责任' },
          { id: 'intellectual-property', text: '知识产权' },
          { id: 'disputes', text: '争议解决' },
          { id: 'changes', text: '变更' },
          { id: 'law', text: '适用法律' },
          { id: 'contact', text: '联系方式' }
        ]
      },
      sections: {
        badge: {
          title: '重要法律通知：',
          body: '这些条款规范您对我们服务和网站的使用。请在预订前仔细阅读。'
        },
        intro: {
          title: '范围',
          body: '这些条款规范 DEVOCEAN Lodge（TERRAfrique LDA）提供的住宿及相关服务。预订即表示您同意这些条款。'
        },
        booking: {
          title: '预订',
          items: [
            '提供准确的宾客信息和到达/离开日期',
            '特殊请求视可用性和确认情况而定'
          ],
          reservationReq: {
            title: '预订要求',
            body: '所有预订需提供有效身份证和信用卡。最低年龄：18岁。'
          },
          checkinCheckout: {
            title: '入住/退房',
            body: '入住：下午2:00 | 退房：上午11:00。提前/延迟请求视可用性而定。'
          },
          groupBookings: {
            title: '团体预订',
            body: '6 间以上房间的团体适用特殊条款。请联系我们了解团体价格和政策。'
          }
        },
        payment: {
          title: '价格与支付',
          items: [
            '除非另有说明，显示的价格为每单位/每晚',
            '存款和结算方式将在预订时确认'
          ],
          paymentInfo: {
            title: '支付信息',
            body: '除非另有说明，所有价格以美元计价。货币转换率仅为近似值，可能会发生变化。确保预订需提供有效信用卡。额外费用可能适用于临时开支。'
          }
        },
        cancel: {
          title: '取消与未到',
          body: '取消条款将在预订时和确认函中披露。',
          cancellationCharges: {
            title: '取消费用',
            plans: [
              {
                planName: '半灵活价格计划：',
                tiers: [
                  { period: '到达前30天或更早', charge: '全额退款' },
                  { period: '到达前29天或更近', charge: '50% 取消费用' }
                ]
              },
              {
                planName: '不可退款价格计划：',
                tiers: [
                  { period: '预订后24小时内', charge: '全额退款' },
                  { period: '所有其他情况', charge: '不予退款', subtext: '在支付新日期差价的条件下，有一次更改到达日期的权利。' }
                ]
              }
            ]
          },
          noshowPolicy: {
            title: '未到政策',
            body: '未在计划入住日期到达且未提前通知的宾客将被视为未到，将收取全额费用，预订将被取消。'
          }
        },
        conduct: {
          title: '宾客行为',
          items: [
            '尊重设施规则、员工、其他宾客和当地社区',
            '禁止在场所内进行非法活动'
          ],
          zeroTolerance: {
            title: '零容忍政策',
            body: '我们对破坏性行为、非法活动或财产损害采取零容忍政策。违反可能导致立即驱逐（不予退款）并可能采取法律行动。'
          }
        },
        forceMajeure: {
          title: '不可抗力',
          intro: '对于超出我们合理控制范围的情况导致无法履行义务，我们不承担责任，包括但不限于：',
          items: [
            '自然灾害、极端天气条件',
            '政府限制、旅行禁令',
            '内乱、战争、恐怖主义',
            '流行病、大流行、卫生紧急情况',
            '公用事业故障、基础设施崩溃'
          ],
          footer: '在这种情况下，我们将尽可能提供替代日期或信用券。根据适用法律和情况提供退款。然而，所有可能由一般可用的取消和旅行保险套餐覆盖的损害和费用均不在我们的责任范围内。'
        },
        liability: {
          title: '责任',
          body: '在法律允许的范围内，我们对间接或不可预见的损失不承担责任。'
        },
        intellectualProperty: {
          title: '知识产权',
          copyright: {
            title: '版权通知',
            body: '本网站的所有内容，包括文本、图形、标志和图片，均为 DEVOCEAN Lodge 的财产，受国际版权法保护。未经授权的使用、复制或分发均被禁止。DEVOCEAN Lodge 名称、标志及所有相关标记均为商标，未经书面许可不得使用。'
          }
        },
        disputes: {
          title: '争议解决',
          process: {
            title: '解决流程',
            body: '我们旨在友好解决任何争议。请首先联系我们尝试解决。如未解决，争议将在采取法律行动前通过调解解决。',
            law: '适用法律：这些条款及任何争议均受莫桑比克法律管辖。',
            jurisdiction: '管辖权：莫桑比克马普托法院具有专属管辖权。',
            mediation: '调解：双方同意在提起法律诉讼前尝试通过认证调解人进行调解。'
          }
        },
        changes: {
          title: '这些条款的变更',
          body: '我们可能不时更新条款。发布的版本适用于您的住宿。'
        },
        law: {
          title: '适用法律',
          body: '适用莫桑比克法律，受强制性当地消费者规则约束。'
        },
        contact: {
          title: '联系方式',
          body: '有疑问？请联系 <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>。'
        }
      }
    },

    gdpr: {
      title: 'GDPR 通知',
      updatedDate: '2025年10月6日',
      quickLinks: {
        title: '快速链接',
        links: [
          { id: 'controller', text: '数据控制者' },
          { id: 'bases', text: '处理法律依据' },
          { id: 'rights', text: '您的权利' },
          { id: 'retention', text: '数据保留' },
          { id: 'transfers', text: '数据转移' },
          { id: 'complaints', text: '投诉' }
        ]
      },
      sections: {
        badge: {
          title: '符合 GDPR：',
          body: '我们致力于根据《通用数据保护条例》保护您的个人数据并尊重您的隐私权。'
        },
        controller: {
          title: '数据控制者',
          body: 'TERRAfrique LDA（DEVOCEAN Lodge），注册地址为莫桑比克马普托 Rua C, Parcela 12, Maputo 1118，负责通过我们的服务收集的您的个人信息的数据控制者。'
        },
        bases: {
          title: '处理法律依据',
          body: '我们根据 GDPR 的以下法律依据处理您的个人数据：',
          legalBases: [
            { title: '合同：', body: '履行我们的预订协议和服务所需的处理。' },
            { title: '法律义务：', body: '遵守法律要求（例如税务法）所需的处理。' },
            { title: '合法利益：', body: '在尊重您的权利的同时，为我们的合法商业利益进行处理。' },
            { title: '同意：', body: '基于您对特定目的的明确同意进行处理。' }
          ]
        },
        rights: {
          title: '您的 GDPR 权利',
          body: '作为 GDPR 下的数据主体，您对您的个人数据拥有以下权利：',
          items: [
            { title: '访问权', body: '您可以请求我们持有的您的个人数据的副本。' },
            { title: '更正权', body: '您可以请求更正不准确或不完整的数据。' },
            { title: '删除权', body: '在特定条件下，您可以请求删除您的个人数据。' },
            { title: '限制处理权', body: '您可以请求限制我们使用您的数据的方式。' },
            { title: '数据可携性权', body: '您可以请求将您的数据转移到其他组织。' },
            { title: '反对权', body: '您可以反对某些类型的数据处理。' }
          ],
          buttons: {
            access: { text: '请求数据访问' },
            erasure: { text: '请求数据删除' }
          }
        },
        retention: {
          title: '数据保留',
          periodsTitle: '保留期限',
          intro: '我们仅在实现收集目的所需的期限内保留个人数据，包括法律、会计或报告要求。',
          items: [
            '<strong>预订数据：</strong> 为税务和法律合规保留 7 年',
            '<strong>客户服务通信：</strong> 保留 3 年',
            '<strong>营销同意：</strong> 直到撤回同意',
            '<strong>网站分析：</strong> 保留 26 个月',
            '<strong>财务交易：</strong> 为会计目的保留 10 年'
          ]
        },
        transfers: {
          title: '国际数据转移',
          body: '当我们将您的数据转移到欧洲经济区（EEA）以外时，我们确保采取适当的保护措施来保护您的信息。这可能包括使用欧盟委员会批准的标准合同条款或将数据转移到具有充分性决定的国家。',
          notice: {
            title: '国际数据转移：',
            body: '我们在国际转移数据时确保采取适当的保护措施，包括使用标准合同条款或确保充分性决定。'
          }
        },
        complaints: {
          title: '投诉',
          intro: '如果您对我们处理您的个人数据有任何顾虑，您有权向当地数据保护机构提出投诉。',
          footer: '我们鼓励您在联系监管机构之前先与我们联系，以解决任何顾虑。'
        },
        dpo: {
          title: '联系我们的数据保护官',
          body: '对于任何 GDPR 相关问题或行使您的权利，请通过 <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a> 联系我们的数据保护官。我们将根据 GDPR 要求在 30 天内响应您的请求。'
        }
      }
    },

    cric: {
      title: 'CRIC — 公司与联系方式',
      updatedDate: '2025年9月27日',
      quickLinks: {
        title: '快速链接',
        links: [
          { id: 'overview', text: '概览' },
          { id: 'contact', text: '联系方式' },
          { id: 'emergency', text: '紧急情况' }
        ]
      },
      sections: {
        badge: {
          title: '官方公司信息：',
          body: 'DEVOCEAN Lodge 的完整商业注册详情和联系信息。'
        },
        overview: {
          title: '概览',
          body: 'DEVOCEAN Lodge 的完整商业注册详情和联系信息。',
          details: [
            { label: '公司名称', value: '' },
            { label: '商业注册', value: '' },
            { label: '增值税号（NUIT）', value: '' },
            { label: '营业执照（Alvará）', value: '' },
            { label: '法人形式', value: '有限责任公司' },
            { label: '股本', value: '' }
          ]
        },
        contact: {
          title: '联系方式',
          body: '有关一般咨询、预订和服务信息，请使用以下提供的联系方式。',
          details: [
            { label: '注册地址', value: '' },
            { label: '电子邮件', value: '' },
            { label: '电话', value: '' },
            { label: '营业时间', value: '周一至周五：上午8:00 - 下午6:00<br>周六和周日：上午8:00 - 中午12:00<br>前台：上午6:00 - 晚上10:00（仅限宾客）' }
          ]
        },
        emergency: {
          title: '紧急联系',
          body: '对于营业时间外的紧急事务，请使用我们的紧急联系方式。',
          details: [
            { label: '紧急电话', value: '', subtitle: '用于营业时间外的紧急事务' },
            { label: '紧急电子邮件', value: '' }
          ]
        }
      }
    },

    ru: {
      privacy: {
        title: 'Политика конфиденциальности',
        updatedDate: '06 октября 2025',
        quickLinks: {
          title: 'Быстрые ссылки',
          links: [
            { id: 'who', text: 'Кто мы' },
            { id: 'collect', text: 'Сбор данных' },
            { id: 'use', text: 'Использование данных' },
            { id: 'share', text: 'Обмен данными' },
            { id: 'security', text: 'Безопасность' },
            { id: 'retention', text: 'Хранение' },
            { id: 'rights', text: 'Ваши права' },
            { id: 'transfers', text: 'Международные передачи' },
            { id: 'contact', text: 'Контакты' },
            { id: 'updates', text: 'Обновления политики' }
          ]
        },
        sections: {
          badge: {
            title: 'Ваша конфиденциальность важна:',
            body: 'Мы стремимся защищать ваши персональные данные и быть прозрачными в отношении того, как мы собираем, используем и защищаем вашу информацию.'
          },
          who: {
            title: 'Кто мы',
            body: 'DEVOCEAN Lodge управляется TERRAfrique LDA, компанией, зарегистрированной в Мозамбике. Наш зарегистрированный адрес: Rua C, Parcela 12, Maputo 1118, Мозамбик. Мы предоставляем экологичное размещение на пляже в Пonta do Ouro, Мозамбик. Мы обязуемся защищать вашу конфиденциальность и обеспечивать соблюдение применимых законов о защите данных, включая GDPR для гостей из ЕС.'
          },
          collect: {
            title: 'Какие персональные данные мы собираем',
            intro: 'Мы собираем различные типы информации для предоставления и улучшения наших услуг:',
            categories: [
              {
                title: 'Персональная информация',
                items: [
                  'Имя, контактные данные',
                  'Паспорт/информация удостоверения личности',
                  'Платежная информация',
                  'Предпочтения при бронировании'
                ]
              },
              {
                title: 'Технические данные',
                items: [
                  'IP-адрес, информация об устройстве',
                  'Тип и версия браузера',
                  'Аналитика использования веб-сайта',
                  'Данные cookies (с вашего согласия)'
                ]
              },
              {
                title: 'Коммуникационные данные',
                items: [
                  'Переписка по электронной почте',
                  'Запросы в службу поддержки',
                  'Отзывы и комментарии',
                  'Маркетинговые предпочтения'
                ]
              }
            ]
          },
          use: {
            title: 'Как мы используем ваши данные',
            items: [
              'Управление бронированиями и предоставление услуг',
              'Коммуникация о вашем проживании, политиках и предложениях (с вашего согласия)',
              'Улучшение нашего сайта и услуг (аналитика, безопасность)',
              'Соблюдение юридических/финансовых обязательств'
            ]
          },
          share: {
            title: 'Когда мы делимся данными',
            items: [
              'Платежные провайдеры и платформы бронирования для обработки ваших бронирований и платежей',
              'Аналитические сервисы для понимания использования сайта и улучшения наших услуг',
              'Рекламные сервисы для целевой рекламы (только с вашего согласия)',
              'Поставщики ИТ-услуг, хостинга и технической поддержки под строгими соглашениями о конфиденциальности',
              'Юридические органы в случае требований закона, регулирования, судебного приказа или других юридических процедур',
              'Исполнение контрактов или защита прав, собственности, безопасности',
              'Передача информации новым владельцам в случае слияния, поглощения или продажи активов'
            ],
            footer: 'Мы требуем от всех третьих сторон уважать безопасность персональных данных и использовать их только для целей передачи. Третьим сторонам не разрешается использовать персональные данные для их собственных целей, только для обработки в соответствии с нашими инструкциями.'
          },
          security: {
            title: 'Меры безопасности',
            intro: 'Мы серьезно относимся к безопасности данных и применяем следующие меры:',
            measures: [
              'Шифрование конфиденциальных данных при передаче и хранении',
              'Регулярные оценки безопасности и тестирование на проникновение',
              'Контроль доступа и механизмы аутентификации',
              'Обучение персонала защите данных и конфиденциальности',
              'Безопасное резервное копирование данных и процедуры восстановления после сбоев'
            ]
          },
          retention: {
            title: 'Хранение данных',
            body: 'Мы сохраняем вашу персональную информацию только на период, необходимый для выполнения целей, указанных в настоящей Политике конфиденциальности. Как правило, мы храним персональные данные в течение 1 года после вашего последнего взаимодействия с нами, если не требуется более длительное хранение по юридическим, налоговым или регулятор��ым причинам. Например, записи о бронировании могут храниться до 7 лет для соблюдения налоговых требований Мозамбика.'
          },
          rights: {
            title: 'Ваши права на конфиденциальность',
            items: [
              'Право на доступ к вашим персональным данным',
              'Право на исправление неточных данных',
              'Право на удаление ваших персональных данных',
              'Право на ограничение или возражение против обработки',
              'Право на переносимость данных',
              'Право на отзыв согласия'
            ]
          },
          transfers: {
            title: 'Международные передачи данных',
            body: 'Поскольку мы работаем в нескольких юрисдикциях, ваши данные могут быть переданы и обработаны в странах за пределами вашей страны проживания. Мы обеспечиваем соответствие таких передач применимым законам о защите данных через решения о достаточности Европейской комиссии или использование стандартных договорных положений, одобренных ЕС. Мы также гарантируем, что любые третьи стороны, обрабатывающие ваши данные, обязаны обеспечивать адекватную защиту.'
          },
          contact: {
            title: 'Свяжитесь с нашей командой по конфиденциальности',
            body: 'Если у вас есть вопросы, опасения или запросы относительно настоящей Политики конфиденциальности или обработки ваших персональных данных, или если вы хотите воспользоваться своими правами на конфиденциальность, пожалуйста, свяжитесь с нами по адресу:<br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Адрес:</strong> TERRAfrique LDA, Rua C, Parcela 12, Maputo 1118, Мозамбик<br><br>Мы стремимся ответить на все запросы о конфиденциальности в течение 30 дней.'
          },
          updates: {
            title: 'Обновления политики',
            body: 'Мы можем время от времени обновлять эту политику конфиденциальности, чтобы отражать изменения в наших практиках, технологиях, юридических требованиях или других факторах. Мы уведомим вас о существенных изменениях через уведомления по электронной почте или видный баннер на нашем веб-сайте. Мы рекомендуем периодически просматривать эту Политику, чтобы быть в курсе того, как мы защищаем вашу информацию. Ваше дальнейшее использование наших услуг после публикации обновленной Политики означает ваше принятие изменений.'
          }
        }
      },

      cookies: {
        title: 'Политика использования cookies',
        effectiveDate: '19 сентября 2025',
        lastUpdated: '06 октября 2025',
        managePreferences: 'Управление настройками cookies:',
        manageText: 'Вы можете контролировать, какие cookies мы используем, через наш баннер cookies или настройки вашего браузера.',
        cookieSettingsBtn: 'Настройки cookies',
        quickLinks: {
          title: 'Быстрые ссылки',
          links: [
            { id: 'what', text: 'Что такое cookies' },
            { id: 'how', text: 'Как мы используем cookies' },
            { id: 'necessary', text: 'Необходимые' },
            { id: 'functional', text: 'Функциональные' },
            { id: 'analytics', text: 'Аналитические' },
            { id: 'advertisement', text: 'Рекламные' },
            { id: 'manage', text: 'Управление настройками' }
          ]
        },
        sections: {
          badge: {
            title: 'О cookies',
            body: 'Вы можете контролировать, какие cookies мы используем, через наш баннер cookies или настройки вашего браузера.'
          },
          what: {
            title: 'Что такое cookies?',
            body: 'Эта Политика использования cookies объясняет, что такое cookies, как мы их используем, какие типы cookies мы применяем (т.е. какую информацию мы собираем с помощью cookies и как эта информация используется), и как управлять настройками cookies.<br><br>Cookies — это небольшие текстовые файлы, используемые для хранения небольших фрагментов информации. Они сохраняются на вашем устройстве, когда веб-сайт загружается в вашем браузере. Эти cookies помогают нам обеспечить правильную работу веб-сайта, сделать его более безопасным, обеспечить лучший пользовательский опыт, понять, как работает веб-сайт, и проанализировать, что работает, а что нуждается в улучшении.'
          },
          how: {
            title: 'Как мы используем cookies?',
            body: 'Как и большинство онлайн-сервисов, наш веб-сайт использует как собственные, так и сторонние cookies для различных целей. Собственные cookies в основном необходимы для правильной работы веб-сайта и не собирают персонально идентифицируемые данные.<br><br>Сторонние cookies, используемые на нашем веб-сайте, в основном предназначены для понимания производительности веб-сайта, того, как вы взаимодействуете с нашим веб-сайтом, для обеспечения безопасности наших услуг, предоставления релевантной вам рекламы и в целом для обеспечения лучшего и улучшенного пользовательского опыта, а также для ускорения ваших будущих взаимодействий с нашим веб-сайтом.'
          },
          necessary: {
            title: 'Необходимые cookies',
            description: 'Необходимые cookies требуются для активации основных функций этого сайта, таких как обеспечение безопасного входа или настройка ваших предпочтений согласия. Эти cookies не содержат персонально идентифицируемых данных.',
            tableHeaders: {
              cookie: 'Cookie',
              duration: 'Продолжительность',
              description: 'Описание'
            },
            cookies: [
              { name: 'site.currency', duration: '1 год', desc: 'Этот cookie используется для хранения валютных предпочтений пользователя.' },
              { name: 'cookieyes-consent', duration: '1 год', desc: 'Описание в настоящее время недоступно.' },
              { name: 'cky-active-check', duration: '1 день', desc: 'Описание в настоящее время недоступно.' },
              { name: 'cky-action', duration: '1 год', desc: 'Описание отсутствует.' },
              { name: 'site.lang', duration: '1 год', desc: 'Описание в настоящее время недоступно.' },
              { name: 'site.region', duration: '1 год', desc: 'Описание в настоящее время недоступно.' }
            ]
          },
          functional: {
            title: 'Функциональные cookies',
            description: 'Функциональные cookies помогают выполнять определенные функции, такие как совместное использование контента веб-сайта в социальных сетях, сбор отзывов и другие сторонние функции.',
            tableHeaders: {
              cookie: 'Cookie',
              duration: 'Продолжительность',
              description: 'Описание'
            },
            cookies: [
              { name: '_fbp', duration: '3 месяца', desc: 'Facebook устанавливает этот cookie для улучшения пользовательского опыта на веб-сайте и предоставления релевантной рекламы при использовании социальных платформ Facebook.' }
            ]
          },
          analytics: {
            title: 'Аналитические cookies',
            description: 'Аналитические cookies используются для понимания того, как посетители взаимодействуют с веб-сайтом. Эти cookies предоставляют информацию о метриках, таких как количество посетителей, показатель отказов, источники трафика и т.д.',
            tableHeaders: {
              cookie: 'Cookie',
              duration: 'Продолжительность',
              description: 'Описание'
            },
            cookies: [
              { name: '_ga', duration: '1 год 1 месяц 4 дня', desc: 'Google Analytics устанавливает этот cookie для расчета данных о посетителях, сессиях и кампаниях, а также отслеживания использования сайта для аналитического отчета. Cookie хранит информацию анонимно и присваивает случайно сгенерированный номер для распознавания уникальных посетителей.' },
              { name: '_gat_gtag_UA_*', duration: '1 минута', desc: 'Google Analytics устанавливает этот cookie для хранения и подсчета просмотров страниц.' },
              { name: '_ga_*', duration: '1 год 1 месяц 4 дня', desc: 'Google Analytics устанавливает этот cookie для хранения информации о том, как посетители используют веб-сайт, а также для создания аналитического отчета о производительности сайта. Собранные данные включают количество посетителей, их источник и посещенные страницы в анонимной форме.' },
              { name: '_gid', duration: '1 день', desc: 'Google Analytics устанавливает этот cookie для отслеживания поведения пользователей.' },
              { name: 'pardot', duration: 'Сессия', desc: 'Cookie pardot устанавливается, пока посетитель вошел в систему как пользователь Pardot. Cookie указывает на активную сессию и не используется для отслеживания.' }
            ]
          },
          advertisement: {
            title: 'Рекламные cookies',
            description: 'Рекламные cookies используются для предоставления посетителям персонализированной рекламы на основе ранее посещенных страниц и для анализа эффективности рекламных кампаний.',
            tableHeaders: {
              cookie: 'Cookie',
              duration: 'Продолжительность',
              description: 'Описание'
            },
            cookies: [
              { name: '_gcl_au', duration: '3 месяца', desc: 'Google Tag Manager устанавливает этот cookie для экспериментов с эффективностью рекламы веб-сайтов, использующих их услуги.' },
              { name: 'test_cookie', duration: '15 минут', desc: 'doubleclick.net устанавливает этот cookie для определения, поддерживает ли браузер пользователя cookies.' },
              { name: '_fr', duration: '3 месяца', desc: 'Facebook устанавливает этот cookie для хранения и отслеживания взаимодействий.' },
              { name: 'IDE', duration: '1 год 24 дня', desc: 'Google DoubleClick IDE cookies хранят информацию о том, как пользователь использует веб-сайт, чтобы предоставлять релевантную рекламу в соответствии с профилем пользователя.' }
            ]
          },
          manage: {
            title: 'Управление настройками cookies',
            consentTitle: 'Настройки согласия',
            consentText: 'Вы можете изменить настройки cookies в любое время, нажав на кнопку «Настройки согласия» выше. Это позволит вам повторно открыть баннер согласия cookies и обновить ваши предпочтения или немедленно отозвать ваше согласие.',
            browserText: 'Кроме того, различные браузеры предлагают разные способы блокировки и удаления cookies, используемых веб-сайтами. Вы можете настроить параметры вашего браузера для блокировки или удаления cookies. Ниже приведены ссылки на документы поддержки по управлению и удалению cookies в основных веб-браузерах.',
            browsers: {
              chrome: 'Chrome',
              safari: 'Safari',
              firefox: 'Firefox',
              ie: 'Internet Explorer',
              other: 'Если вы используете другой веб-браузер, обратитесь к его официальной документации поддержки.'
            }
          }
        }
      },

      terms: {
        title: 'Условия и положения',
        updatedDate: '06 октября 2025',
        quickLinks: {
          title: 'Быстрые ссылки',
          links: [
            { id: 'scope', text: 'Область применения' },
            { id: 'booking', text: 'Бронирование' },
            { id: 'payment', text: 'Цены и оплата' },
            { id: 'cancel', text: 'Отмена' },
            { id: 'conduct', text: 'Поведение гостей' },
            { id: 'force-majeure', text: 'Форс-мажор' },
            { id: 'liability', text: 'Ответственность' },
            { id: 'intellectual-property', text: 'Интеллектуальная собственность' },
            { id: 'disputes', text: 'Разрешение споров' },
            { id: 'changes', text: 'Изменения' },
            { id: 'law', text: 'Применимое право' },
            { id: 'contact', text: 'Контакты' }
          ]
        },
        sections: {
          badge: {
            title: 'Важное юридическое уведомление:',
            body: 'Эти условия регулируют использование наших услуг и веб-сайта. Пожалуйста, внимательно прочитайте их перед бронированием.'
          },
          scope: {
            title: 'Область применения',
            body: 'Эти Условия регулируют размещение и связанные с ним услуги, предоставляемые DEVOCEAN Lodge (TERRAfrique LDA). Бронируя, вы соглашаетесь с этими Условиями.'
          },
          booking: {
            title: 'Бронирование',
            items: [
              'Предоставьте точную информацию о гостях и датах прибытия/выезда',
              'Особые пожелания зависят от наличия и подтверждения'
            ],
            subsections: {
              reservationReq: {
                title: 'Требования к бронированию',
                body: 'Для всех бронирований требуется действительное удостоверение личности и кредитная карта. Минимальный возраст: 18 лет.'
              },
              checkinCheckout: {
                title: 'Заезд/Выезд',
                body: 'Заезд: 14:00 | Выезд: 11:00. Запросы на ранний заезд или поздний выезд зависят от наличия.'
              },
              groupBookings: {
                title: 'Групповые бронирования',
                body: 'Для групп от 6 номеров действуют особые условия. Свяжитесь с нами для получения информации о групповых тарифах и правилах.'
              }
            }
          },
          payment: {
            title: 'Цены и оплата',
            items: [
              'Указанные тарифы — за номер/ночь, если не указано иное',
              'Депозиты и способы оплаты будут подтверждены при бронировании'
            ],
            subsections: {
              paymentInfo: {
                title: 'Информация об оплате',
                body: 'Все цены указаны в долларах США, если не указано иное. Курсы конвертации валют являются приблизительными и могут изменяться. Для обеспечения бронирования требуется действительная кредитная карта. Дополнительные расходы могут применяться к непредвиденным изменениям или повреждениям.'
              }
            }
          },
          cancel: {
            title: 'Отмена и неявка',
            body: 'Условия отмены указаны при бронировании и в вашем подтверждении.',
            subsections: {
              cancellationCharges: {
                title: 'Плата за отмену',
                plans: [
                  {
                    planName: 'Гибкий тарифный план:',
                    tiers: [
                      { period: 'За 30 дней или более до прибытия', charge: 'Полный возврат', subtext: null },
                      { period: 'За 29 дней или менее до прибытия', charge: 'Плата за отмену 50%', subtext: null }
                    ]
                  },
                  {
                    planName: 'Невозвратный тарифный план:',
                    tiers: [
                      { period: 'В течение 24 часов после бронирования', charge: 'Полный возврат', subtext: null },
                      { period: 'Во всех остальных случаях', charge: 'Без возврата', subtext: 'Право на однократное изменение даты прибытия при условии доплаты разницы в стоимости новых дат.' }
                    ]
                  }
                ]
              },
              noshowPolicy: {
                title: 'Политика неявки',
                body: 'Гости, не прибывшие в запланированную дату заезда без предварительного уведомления, считаются неявившимися. С них взимается полная стоимость, а бронирование аннулируется.'
              }
            }
          },
          conduct: {
            title: 'Поведение гостей',
            items: [
              'Уважайте правила объекта, персонал, других гостей и местное сообщество',
              'Никакой незаконной деятельности на территории'
            ],
            subsections: {
              zeroTolerance: {
                title: 'Политика нулевой терпимости',
                body: 'Мы придерживаемся политики нулевой терпимости к разрушительному поведению, незаконной деятельности или порче имущества. Нарушение может привести к немедленному выселению без возврата средств и к юридическим действиям.'
              }
            }
          },
          forceMajeure: {
            title: 'Форс-мажор',
            intro: 'Мы не несем ответственности за невыполнение обязательств из-за обстоятельств, находящихся вне нашего разумного контроля, включая, но не ограничиваясь:',
            items: [
              'Природные катастрофы, экстремальные погодные условия',
              'Государственные ограничения, запреты на поездки',
              'Гражданские беспорядки, война, терроризм',
              'Пандемии, эпидемии, чрезвычайные ситуации в области здравоохранения',
              'Сбои в коммунальных услугах, инфраструктурные поломки'
            ],
            footer: 'В таких случаях мы предложим альтернативные даты или кредитные ваучеры, где это возможно. Возврат средств будет осуществляться в соответствии с применимыми законами и обстоятельствами. Однако все убытки и расходы, которые покрываются или могли бы быть покрыты страховкой путешествий, не подлежат возмещению. Гости несут ответственность за получение соответствующего страхового покрытия для своих поездок.'
          },
          liability: {
            title: 'Ответственность',
            body: 'В пределах, разрешенных законом, мы не несем ответственности за косвенные или непредвиденные убытки.'
          },
          intellectualProperty: {
            title: 'Интеллектуальная собственность',
            subsections: {
              copyright: {
                title: 'Уведомление об авторских правах',
                body: 'Весь контент на этом веб-сайте, включая текст, графику, логотипы и изображения, является собственностью DEVOCEAN Lodge и защищен международными законами об авторском праве. Несанкционированное использование, воспроизведение или распространение запрещены.'
              }
            }
          },
          disputes: {
            title: 'Разрешение споров',
            subsections: {
              process: {
                title: 'Процесс разрешения',
                body: 'Мы стремимся разрешать любые споры мирным путем. Пожалуйста, сначала свяжитесь с нами для попытки разрешения. Если спор не урегулирован, он должен быть разрешен через медиацию до обращения в суд.',
                law: 'Применимое право: Эти условия и любые споры регулируются законодательством Мозамбика.',
                jurisdiction: 'Юрисдикция: Суды Мапуту, Мозамбик, имеют исключительную юрисдикцию.',
                mediation: 'Медиация: Стороны соглашаются попытаться провести медиацию через аккредитованного посредника до начала судебного разбирательства.'
              }
            }
          },
          changes: {
            title: 'Изменения этих условий',
            body: 'Мы можем время от времени обновлять Условия. Опубликованная версия применяется к вашему проживанию.'
          },
          law: {
            title: 'Применимое право',
            body: 'Применяется законодательство Мозамбика с учетом обязательных местных правил защиты потребителей.'
          },
          contact: {
            title: 'Свяжитесь с нами',
            body: 'По любым вопросам, касающимся настоящих Условий, пожалуйста, свяжитесь с нами по адресу <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>.'
          }
        }
      },

      gdpr: {
        title: 'Уведомление GDPR',
        updatedDate: '06 октября 2025',
        quickLinks: {
          title: 'Быстрые ссылки',
          links: [
            { id: 'controller', text: 'Контролер данных' },
            { id: 'bases', text: 'Юридические основания' },
            { id: 'rights', text: 'Ваши права' },
            { id: 'retention', text: 'Хранение данных' },
            { id: 'transfers', text: 'Передача данных' },
            { id: 'complaints', text: 'Жалобы' }
          ]
        },
        sections: {
          badge: {
            title: 'Соответствие GDPR:',
            body: 'Мы стремимся защищать ваши персональные данные и уважать ваши права на конфиденциальность в соответствии с Общим регламентом защиты данных.'
          },
          controller: {
            title: 'Контролер данных',
            body: 'TERRAfrique LDA (DEVOCEAN Lodge), зарегистрированная по адресу Rua C, Parcela 12, Maputo 1118, Мозамбик, выступает в качестве контролера данных для вашей персональной информации, собранной через наши услуги.'
          },
          bases: {
            title: 'Юридические основания для обработки',
            body: 'Мы обрабатываем ваши персональные данные на следующих юридических основаниях в соответствии с GDPR:',
            legalBases: {
              contract: {
                title: 'Контракт:',
                body: 'Обработка, необходимая для выполнения наших соглашений о бронировании и предоставления услуг.'
              },
              legal: {
                title: 'Юридическое обязательство:',
                body: 'Обработка, необходимая для соблюдения юридических требований (например, налогового законодательства).'
              },
              legitimate: {
                title: 'Законные интересы:',
                body: 'Обработка в наших законных деловых интересах при уважении ваших прав.'
              },
              consent: {
                title: 'Согласие:',
                body: 'Обработка на основе вашего явного согласия для конкретных целей.'
              }
            }
          },
          rights: {
            title: 'Ваши права по GDPR',
            body: 'Как субъект данных по GDPR, вы имеете следующие права в отношении ваших персональных данных:',
            items: [
              {
                title: 'Право на доступ',
                body: 'Вы можете запросить копии ваших персональных данных, которые мы храним.'
              },
              {
                title: 'Право на исправление',
                body: 'Вы можете запросить исправление неточных или неполных данных.'
              },
              {
                title: 'Право на удаление',
                body: 'Вы можете запросить удаление ваших персональных данных при определенных условиях.'
              },
              {
                title: 'Право на ограничение обработки',
                body: 'Вы можете запросить ограничение использования ваших данных.'
              },
              {
                title: 'Право на переносимость данных',
                body: 'Вы можете запросить передачу ваших данных другой организации.'
              },
              {
                title: 'Право на возражение',
                body: 'Вы можете возражать против определенных типов обработки ваших данных.'
              }
            ],
            buttons: {
              access: 'Запросить доступ к данным',
              erasure: 'Запросить удаление данных'
            }
          },
          retention: {
            title: 'Хранение данных',
            periodsTitle: 'Периоды хранения',
            intro: 'Мы сохраняем персональные данные только на период, необходимый для выполнения целей их сбора, включая юридические, бухгалтерские или отчетные требования.',
            items: [
              '<strong>Данные бронирования:</strong> 7 лет для соблюдения налоговых и юридических требований',
              '<strong>Коммуникации службы поддержки:</strong> 3 года',
              '<strong>Согласия на маркетинг:</strong> До отзыва согласия',
              '<strong>Аналитика веб-сайта:</strong> 26 месяцев',
              '<strong>Финансовые транзакции:</strong> 10 лет для бухгалтерских целей'
            ]
          },
          transfers: {
            title: 'Международные передачи данных',
            body: 'Когда мы передаем ваши данные за пределы Европейской экономической зоны (ЕЭЗ), мы обеспечиваем наличие соответствующих мер защиты для вашей информации. Это может включать использование стандартных договорных положений, одобренных Европейской комиссией, или передачу данных в страны с решениями о достаточности.',
            notice: {
              title: 'Международные передачи данных:',
              body: 'Мы обеспечиваем наличие соответствующих мер защиты при международной передаче данных, включая использование стандартных договорных положений или обеспечение решений о достаточности.'
            }
          },
          complaints: {
            title: 'Жалобы',
            intro: 'Если у вас есть опасения по поводу того, как мы обрабатываем ваши персональные данные, вы имеете право подать жалобу в местный орган по защите данных.',
            footer: 'Мы рекомендуем сначала связаться с нами для разрешения любых проблем перед обращением в надзорный орган.'
          },
          dpo: {
            title: 'Связаться с нашим сотрудником по защите данных',
            body: 'По любым вопросам, связанным с GDPR, или для реализации ваших прав, пожалуйста, свяжитесь с нашим сотрудником по защите данных по адресу <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a>. Мы ответим на ваш запрос в течение 30 дней, как того требует GDPR.'
          }
        }
      },

      cric: {
        title: 'CRIC — Компания и контакты',
        updatedDate: '27 сентября 2025',
        quickLinks: {
          title: 'Быстрые ссылки',
          links: [
            { id: 'overview', text: 'Обзор' },
            { id: 'contact', text: 'Контакты' },
            { id: 'emergency', text: 'Экстренная связь' }
          ]
        },
        sections: {
          badge: {
            title: 'Официальная информация о компании:',
            body: 'Полные данные о регистрации бизнеса и контактная информация DEVOCEAN Lodge.'
          },
          overview: {
            title: 'Обзор',
            body: 'Полные данные о регистрации бизнеса и контактная информация DEVOCEAN Lodge.',
            details: [
              { label: 'Название компании', value: '' },
              { label: 'Коммерческая регистрация', value: '' },
              { label: 'Номер НДС (NUIT)', value: '' },
              { label: 'Бизнес-лицензия (Alvará)', value: '' },
              { label: 'Юридическая форма', value: 'Общество с ограниченной ответственностью' },
              { label: 'Уставной капитал', value: '' }
            ]
          },
          contact: {
            title: 'Контакты',
            body: 'Для общих запросов, бронирований и информации о наших услугах, пожалуйста, используйте указанные ниже контактные данные.',
            details: [
              { label: 'Зарегистрированный адрес', value: '' },
              { label: 'Электронная почта', value: '' },
              { label: 'Телефон', value: '' },
              { label: 'Часы работы', value: 'Понедельник - Пятница: 8:00 - 18:00<br>Суббота и Воскресенье: 8:00 - 12:00<br>Стойка регистрации: 6:00 - 22:00 (для гостей)' }
            ]
          },
          emergency: {
            title: 'Экстренная связь',
            body: 'Для срочных вопросов вне рабочих часов используйте наши экстренные контактные данные.',
            details: [
              { label: 'Экстренный телефон', value: '', subtitle: 'Для срочных вопросов вне рабочих часов' },
              { label: 'Экстренная электронная почта', value: '' }
            ]
          }
        }
      }
    },

    // -------- AFRIKAANS --------
    af: {
      privacy: {
        title: "Privaatheidsbeleid",
        updatedDate: "06 Oktober 2025",
        quickLinks: {
          title: "Vinnige Skakels",
          links: [
            { id: "who", text: "Wie ons is" },
            { id: "collect", text: "Data Versameling" },
            { id: "use", text: "Data Gebruik" },
            { id: "share", text: "Data Deling" },
            { id: "security", text: "Sekuriteit" },
            { id: "retention", text: "Berging" },
            { id: "rights", text: "Jou Regte" },
            { id: "transfers", text: "Internasionale Oordragte" },
            { id: "contact", text: "Kontakte" },
            { id: "updates", text: "Beleid Opdaterings" }
          ]
        },
        sections: {
          badge: {
            title: "Jou privaatheid is belangrik:",
            body: "Ons is daartoe verbind om jou persoonlike data te beskerm en deursigtig te wees oor hoe ons jou inligting versamel, gebruik en beskerm."
          },
          who: {
            title: "Wie ons is",
            body: "DEVOCEAN Lodge word bedryf deur TERRAfrique LDA, 'n maatskappy geregistreer in Mosambiek. Ons geregistreerde adres: Rua C, Parcela 12, Maputo 1118, Mosambiek. Ons bied eko-vriendelike verblyf aan die strand in Ponta do Ouro, Mosambiek. Ons is verbind tot die beskerming van jou privaatheid en die versekering dat jou persoonlike data op 'n gepaste, wettige en deursigtige wyse versamel, verwerk en gebruik word in ooreenstemming met toepaslike databeskermingswette. Deur ons webwerf en dienste te gebruik, stem jy in tot die versameling en gebruik van jou inligting soos beskryf in hierdie Privaatheidsbeleid."
          },
          collect: {
            title: "Watter persoonlike data ons versamel",
            intro: "Ons versamel verskeie tipes inligting om ons dienste te lewer en te verbeter:",
            categories: [
              {
                title: "Persoonlike Inligting",
                items: [
                  "Naam, kontakbesonderhede",
                  "Paspoort/identiteitsinligting",
                  "Betalinginligting",
                  "Besprekingsvoorkeure"
                ]
              },
              {
                title: "Tegniese Data",
                items: [
                  "IP-adres, toestelinligting",
                  "Blaaier tipe en weergawe",
                  "Webwerf gebruiksanalise",
                  "Koekie data (met jou toestemming)"
                ]
              },
              {
                title: "Kommunikasie Data",
                items: [
                  "E-pos korrespondensie",
                  "Kliëntediens versoeke",
                  "Terugvoer en kommentaar",
                  "Bemarkingsvoorkeure"
                ]
              }
            ]
          },
          use: {
            title: "Hoe ons jou data gebruik",
            items: [
              "Bestuur van besprekings en lewering van dienste",
              "Kommunikasie oor jou verblyf, beleide en aanbiedinge (met jou toestemming)",
              "Verbetering van ons webwerf en dienste (analise, sekuriteit)",
              "Nakoming van wettige/finansiële verpligtinge"
            ]
          },
          share: {
            title: "Wanneer ons data deel",
            items: [
              "Betalingverskaffers en besprekingplatforms om jou besprekings en betalings te verwerk",
              "Analisedienste om webwerfgebruik te verstaan en ons dienste te verbeter",
              "Advertensiedienste vir geteikende reklame (slegs met jou toestemming)",
              "IT-dienste, gasheer- en tegniese ondersteuningsverskaffers onder streng privaatheidsooreenkomste",
              "Wettige owerhede in geval van wetlike, regulatoriese, hofbevel of ander wettige prosesse",
              "Uitvoering van kontrakte of beskerming van regte, eiendom, sekuriteit",
              "Oordrag van inligting aan nuwe eienaars in geval van samesmelting, verkryging of verkoop van bates"
            ],
            footer: "Ons vereis dat alle derde partye die sekuriteit van persoonlike data respekteer en dit slegs vir oordragdoeleindes gebruik. Derde partye word nie toegelaat om persoonlike data vir hul eie doeleindes te gebruik nie, slegs om dit te verwerk in ooreenstemming met ons instruksies."
          },
          security: {
            title: "Sekuriteitsmaatreëls",
            intro: "Ons neem databeskerming ernstig op en pas die volgende maatreëls toe:",
            measures: [
              "Enkripsie van sensitiewe data tydens oordrag en berging",
              "Gereelde sekuriteitsbeoordelings en penetrasietoetse",
              "Toegangsbeheer en verifikasiemeganismes",
              "Personeelopleiding oor databeskerming en privaatheid",
              "Veilige data-rugsteun en herstelprosedures"
            ]
          },
          retention: {
            title: "Data Berging",
            body: "Ons bewaar jou persoonlike inligting slegs vir die tydperk wat nodig is om die doeleindes te vervul soos uiteengesit in hierdie Privaatheidsbeleid. Oor die algemeen behou ons persoonlike data vir 1 jaar na jou laaste interaksie met ons, tensy 'n langer bergingstydperk wettiglik vereis of toegelaat word. Ons kan sekere inligting langer hou vir spesifieke redes, insluitend: rekordhouding en rapportering in ooreenstemming met toepaslike wetgewing (gewoonlik 7 jaar vir finansiële rekords); regskwessies of dispute; nakoming van wetlike verpligtinge; en ter beskerming van belangrike besigheidsbelange."
          },
          rights: {
            title: "Jou Privaatheidsregte",
            items: [
              "Reg op toegang tot jou persoonlike data",
              "Reg om onakkurate data reg te stel",
              "Reg om jou persoonlike data uit te vee",
              "Reg om verwerking te beperk of daarteen beswaar te maak",
              "Reg op data-oordraagbaarheid",
              "Reg om toestemming terug te trek"
            ]
          },
          transfers: {
            title: "Internasionale Data-oordragte",
            body: "Aangesien ons in verskeie jurisdiksies opereer, kan jou data oorgedra en verwerk word in lande buite jou land van verblyf. Ons verseker dat sulke oordragte voldoen aan toepaslike databeskermingswette deur Europese Kommissie se voldoende besluite, standaard kontraktuele klousules (SCC), gepaste sekuriteitsmaatreëls en deursigtigheid oor oordragplekke."
          },
          contact: {
            title: "Kontak ons Privaatheidspan",
            body: "Indien jy vrae, bekommernisse of versoeke het rakende hierdie Privaatheidsbeleid of die verwerking van jou persoonlike data, of indien jy jou privaatheidsregte wil uitoefen, kontak ons asseblief by:<br><br><strong>E-pos:</strong> <a href=\"mailto:legal@devoceanlodge.com\">legal@devoceanlodge.com</a><br><strong>Telefoon:</strong> +258 8441 82252<br><strong>Posadres:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Mosambiek<br><br>Ons poog om op alle versoeke binne 30 dae te reageer. Indien jou versoek kompleks is of jy verskeie versoeke ingeskiet het, kan dit langer neem, maar ons sal jou in kennis stel van enige verlengings."
          },
          updates: {
            title: "Beleid Opdaterings",
            body: "Ons kan hierdie Privaatheidsbeleid van tyd tot tyd opdateer om veranderinge in ons praktyke, tegnologieë, wettige vereistes of ander faktore te weerspieël. Ons sal jou in kennis stel van wesenlike veranderinge deur e-poskennisgewings aan geregistreerde gebruikers, opvallende aankondigings op ons webwerf en 'n opgedateerde laaste opdateringsdatum. Ons beveel aan dat jy hierdie beleid periodiek hersien om op hoogte te bly van hoe ons jou inligting beskerm."
          }
        }
      },

      cookies: {
        title: "Koekiebeleid",
        effectiveDate: "19 September 2025",
        lastUpdated: "06 Oktober 2025",
        managePreferences: "Bestuur jou koekie-voorkeure:",
        manageText: "Jy kan beheer watter koekies ons gebruik deur ons koekie-banier of jou blaaier-instellings.",
        cookieSettingsBtn: "Koekie-instellings",
        quickLinks: {
          title: "Vinnige Skakels",
          links: [
            { id: "what", text: "Wat is koekies" },
            { id: "how", text: "Hoe ons koekies gebruik" },
            { id: "necessary", text: "Noodsaaklik" },
            { id: "functional", text: "Funksioneel" },
            { id: "analytics", text: "Analities" },
            { id: "advertisement", text: "Advertensies" },
            { id: "manage", text: "Bestuur Voorkeure" }
          ]
        },
        sections: {
          badge: {
            title: "Oor koekies",
            body: "Jy kan beheer watter koekies ons gebruik deur ons koekie-banier of jou blaaier-instellings."
          },
          what: {
            title: "Wat is koekies?",
            body: "Hierdie Koekiebeleid verduidelik wat koekies is, hoe ons dit gebruik, watter tipes koekies ons gebruik (d.w.s. watter inligting ons deur koekies versamel en hoe daardie inligting gebruik word), en hoe om koekie-instellings te bestuur.<br><br>Koekies is klein tekslêers wat gebruik word om klein hoeveelhede inligting te stoor. Hulle word op jou toestel gestoor wanneer die webwerf in jou blaaier gelaai word. Hierdie koekies help om die webwerf korrek te laat funksioneer, dit veiliger te maak, 'n beter gebruikerservaring te verskaf, te verstaan hoe die webwerf presteer en om te ontleed wat werk en waar dit verbeter moet word."
          },
          how: {
            title: "Hoe ons koekies gebruik?",
            body: "Soos die meeste aanlyndienste, gebruik ons webwerf beide eerste- en derdeparty-koekies vir verskeie doeleindes. Eerste-party koekies is meestal nodig vir die webwerf om korrek te funksioneer en versamel nie persoonlik identifiseerbare data nie.<br><br>Derdeparty-koekies wat op ons webwerf gebruik word, help hoofsaaklik om te verstaan hoe die webwerf presteer, hoe jy met dit interaksie het, om ons dienste veilig te hou, om relevante advertensies te lewer en om jou gebruikerservaring te verbeter en jou toekomstige interaksies met ons webwerf te help versnel."
          },
          necessary: {
            title: "Noodsaaklike Koekies",
            description: "Noodsaaklike koekies word vereis om basiese funksies van hierdie webwerf te aktiveer, soos veilige aanmelding of die aanpassing van jou toestemmingvoorkeure. Hierdie koekies bevat geen persoonlik identifiseerbare data nie.",
            tableHeaders: {
              cookie: "Koekie",
              duration: "Duur",
              description: "Beskrywing"
            },
            cookies: [
              { name: "currency", duration: "1 year", desc: "Hierdie koekie word gebruik om die gebruiker se geldeenheidvoorkeure te stoor." },
              { name: "CookieConsent", duration: "1 year", desc: "Beskrywing tans nie beskikbaar nie." },
              { name: "test_cookie", duration: "15 minutes", desc: "Beskrywing tans nie beskikbaar nie." },
              { name: "rc::a", duration: "never", desc: "Geen beskrywing beskikbaar nie." },
              { name: "rc::c", duration: "session", desc: "Beskrywing tans nie beskikbaar nie." },
              { name: "li_gc", duration: "6 months", desc: "Beskrywing tans nie beskikbaar nie." }
            ]
          },
          functional: {
            title: "Funksionele Koekies",
            description: "Funksionele koekies help om sekere funksies uit te voer, soos die deel van webwerf-inhoud op sosiale media platforms, die versameling van terugvoer en ander derdeparty-funksies.",
            tableHeaders: {
              cookie: "Koekie",
              duration: "Duur",
              description: "Beskrywing"
            },
            cookies: [
              { name: "_fbp", duration: "3 months", desc: "Facebook stel hierdie koekie om die gebruikerservaring op die webwerf te verbeter en om relevante advertensies te lewer tydens die gebruik van Facebook se sosiale platforms." }
            ]
          },
          analytics: {
            title: "Analitiese Koekies",
            description: "Analitiese koekies word gebruik om te verstaan hoe besoekers met die webwerf interaksie het. Hierdie koekies verskaf inligting oor maatstawwe soos die aantal besoekers, weieringskoers, verkeersbron, ens.",
            tableHeaders: {
              cookie: "Koekie",
              duration: "Duur",
              description: "Beskrywing"
            },
            cookies: [
              { name: "_ga", duration: "1 year 1 month 4 days", desc: "Google Analytics stel hierdie koekie om besoeker-, sessie- en veldtogdata te bereken en webwerfgebruik vir die webwerf se analiseverslag te volg. Die koekie stoor inligting anoniem en ken 'n ewekansig gegenereerde nommer toe om unieke besoekers te herken." },
              { name: "_gat_gtag_UA_*", duration: "1 minute", desc: "Google Analytics stel hierdie koekie om bladsykyke te stoor en te tel." },
              { name: "_gid", duration: "1 day", desc: "Google Analytics stel hierdie koekie om inligting te stoor oor hoe besoekers die webwerf gebruik, asook om 'n analiseverslag van die webwerf se prestasie te skep. Versamelde data sluit die aantal besoekers, hul bron en die bladsye wat anoniem besoek is, in." },
              { name: "_ga_*", duration: "1 year 1 month 4 days", desc: "Google Analytics stel hierdie koekie om gebruikersgedrag te volg." },
              { name: "visitor_id*-hash", duration: "10 years", desc: "Pardot koekie word gestel terwyl die besoeker aangemeld is as 'n Pardot-gebruiker. Die koekie dui op 'n aktiewe sessie en word nie vir opsporing gebruik nie." }
            ]
          },
          advertisement: {
            title: "Advertensie Koekies",
            description: "Advertensie koekies word gebruik om besoekers te voorsien van gepersonaliseerde advertensies gebaseer op voorheen besoekte bladsye en om die doeltreffendheid van advertensieveldtogte te ontleed.",
            tableHeaders: {
              cookie: "Koekie",
              duration: "Duur",
              description: "Beskrywing"
            },
            cookies: [
              { name: "_gcl_au", duration: "3 months", desc: "Google Tag Manager stel hierdie koekie om te eksperimenteer met advertensiedoeltreffendheid van webwerwe wat hul dienste gebruik." },
              { name: "test_cookie", duration: "15 minutes", desc: "doubleclick.net stel hierdie koekie om te bepaal of die gebruiker se blaaier koekies ondersteun." },
              { name: "_fbp", duration: "3 months", desc: "Facebook stel hierdie koekie om interaksies te stoor en te volg." },
              { name: "IDE", duration: "1 year 24 days", desc: "Google DoubleClick IDE koekies stoor inligting oor hoe die gebruiker die webwerf gebruik om relevante advertensies volgens die gebruiker se profiel te lewer." }
            ]
          },
          manage: {
            title: "Bestuur Koekie-voorkeure",
            consentTitle: "Toestemming Instellings",
            consentText: "Jy kan jou koekie-instellings enige tyd verander deur op die 'Toestemming Instellings' knoppie hierbo te klik. Dit sal jou toelaat om die koekie-toestemming banier te heropen en jou voorkeure op te dateer of jou toestemming onmiddellik terug te trek.",
            browserText: "Daarbenewens bied verskillende blaaiers verskillende metodes om koekies wat deur webwerwe gebruik word te blokkeer en uit te vee. Jy kan die instellings van jou blaaier verander om koekies te blokkeer of uit te vee. Hieronder is skakels na ondersteuningsdokumente oor die bestuur en verwydering van koekies in die belangrikste webblaaiers.",
            browsers: {
              chrome: "Chrome",
              safari: "Safari",
              firefox: "Firefox",
              ie: "Internet Explorer",
              other: "As jy 'n ander webblaaier gebruik, raadpleeg asseblief sy amptelike ondersteuningsdokumente."
            }
          }
        }
      },

      terms: {
        title: "Voorwaardes en Bepalings",
        updatedDate: "06 Oktober 2025",
        quickLinks: {
          title: "Vinnige Skakels",
          links: [
            { id: "intro", text: "Toepassingsomvang" },
            { id: "booking", text: "Besprekings" },
            { id: "payment", text: "Pryse en Betaling" },
            { id: "cancel", text: "Kansellasie" },
            { id: "conduct", text: "Gastegedrag" },
            { id: "force-majeure", text: "Oormag" },
            { id: "liability", text: "Aanspreeklikheid" },
            { id: "intellectual-property", text: "Intellektuele Eiendom" },
            { id: "disputes", text: "Geskilbeslegting" },
            { id: "changes", text: "Veranderinge" },
            { id: "law", text: "Toepaslike Reg" },
            { id: "contact", text: "Kontakte" }
          ]
        },
        sections: {
          badge: {
            title: "Belangrike Regskennisgewing:",
            body: "Hierdie voorwaardes reguleer die gebruik van ons dienste en webwerf. Lees dit asseblief sorgvuldig deur voor bespreek."
          },
          intro: {
            title: "Toepassingsomvang",
            body: "Hierdie Voorwaardes reguleer verblyf en verwante dienste wat deur DEVOCEAN Lodge (TERRAfrique LDA) verskaf word. Deur te bespreek, stem jy in tot hierdie Voorwaardes."
          },
          booking: {
            title: "Besprekings",
            items: [
              "Verskaf akkurate gaste-inligting en aankoms/vertrek datums",
              "Spesiale versoeke is onderhewig aan beskikbaarheid en bevestiging"
            ],
            reservationReq: {
              title: "Bespreekvereistes",
              body: "Geldige identifikasie en 'n kredietkaart word vereis vir alle besprekings. Minimum ouderdom: 18."
            },
            checkinCheckout: {
              title: "In- en Uitklok",
              body: "Inklok: 14:00 | Uitklok: 11:00. Versoeke vir vroeë inklok of laat uitklok is onderhewig aan beskikbaarheid."
            },
            groupBookings: {
              title: "Groepbesprekings",
              body: "Spesiale voorwaardes geld vir groepe van 6 kamers of meer. Kontak ons vir groepstariewe en -beleide."
            }
          },
          payment: {
            title: "Pryse en Betaling",
            items: [
              "Aangehaalde tariewe is per kamer/nag, tensy anders aangedui",
              "Deposito's en betaalmetodes sal tydens bespreking bevestig word"
            ],
            paymentInfo: {
              title: "Betalingsinligting",
              body: "Alle pryse is in VSA-dollars, tensy anders aangedui. Wisselkoerse is benaderd en kan verander. 'n Geldige kredietkaart word vereis om jou bespreking te beveilig. Addisionele kostes kan van toepassing wees op onvoorsiene uitgawes."
            }
          },
          cancel: {
            title: "Kansellasie en Nie-opdaag",
            body: "Kansellasievoorwaardes word tydens bespreking en in jou bevestiging uiteengesit.",
            cancellationCharges: {
              title: "Kansellasiefooie",
              plans: [
                {
                  planName: "Buigsame Tariefplan:",
                  tiers: [
                    { period: "30 dae of meer voor aankoms", charge: "Volle terugbetaling" },
                    { period: "29 dae of minder voor aankoms", charge: "50% kansellasiefooi" }
                  ]
                },
                {
                  planName: "Nie-terugbetaalbare Tariefplan:",
                  tiers: [
                    { period: "Binne 24 uur na bespreking", charge: "Volle terugbetaling" },
                    { period: "In alle ander gevalle", subtext: "Reg op eenmalige verandering van aankomsdatum onderhewig aan betaling van die prysverskil vir nuwe datums.", charge: "Geen terugbetaling" }
                  ]
                }
              ]
            },
            noshowPolicy: {
              title: "Nie-opdaag Beleid",
              body: "Gaste wat nie op die geskeduleerde aankomsdatum opdaag sonder vooraf kennisgewing nie, word as nie-opdaag beskou. Die volle bedrag word gehef, en die bespreking word gekanselleer."
            }
          },
          conduct: {
            title: "Gastegedrag",
            items: [
              "Respekteer eiendomsreëls, personeel, ander gaste en die plaaslike gemeenskap",
              "Geen onwettige aktiwiteite op die perseel nie"
            ],
            zeroTolerance: {
              title: "Nul Verdraagsaamheidsbeleid",
              body: "Ons handhaaf 'n nul verdraagsaamheidsbeleid vir ontwrigtende gedrag, onwettige aktiwiteite of skade aan eiendom. Oortreding kan lei tot onmiddellike uitsetting sonder terugbetaling en wettige aksies."
            }
          },
          "force-majeure": {
            title: "Oormag",
            intro: "Ons is nie aanspreeklik vir die onvermoë om verpligtinge na te kom weens omstandighede buite ons redelike beheer nie, insluitend maar nie beperk tot:",
            items: [
              "Natuurrampe, uiterste weersomstandighede",
              "Regeringsbeperkings, reisverbod",
              "Burgerlike onrus, oorlog, terrorisme",
              "Pandemieë, epidemies, gesondheidsnoodgevalle",
              "Diensonderbrekings, infrastruktuur mislukkings"
            ],
            footer: "In sulke gevalle sal ons alternatiewe datums of kredietbewyse aanbied waar moontlik. Terugbetalings sal verskaf word in ooreenstemming met toepaslike wette en omstandighede. Alle verliese en uitgawes wat gedek word of gedek kon word deur standaard kansellasie- en reisversekering is egter uitgesluit van ons aanspreeklikheid."
          },
          liability: {
            title: "Aanspreeklikheid",
            body: "Binne die perke wat deur die wet toegelaat word, is ons nie aanspreeklik vir indirekte of gevolgskade nie."
          },
          "intellectual-property": {
            title: "Intellektuele Eiendom",
            copyright: {
              title: "Kopiereg Kennisgewing",
              body: "Alle inhoud op hierdie webwerf, insluitend teks, grafika, logo's en beelde, is die eiendom van DEVOCEAN Lodge en word beskerm deur internasionale kopieregwette. Ongeoutoriseerde gebruik, reproduksie of verspreiding is verbode. Die naam DEVOCEAN Lodge, logo en alle verwante merke is handelsmerke en mag nie sonder skriftelike toestemming gebruik word nie."
            }
          },
          disputes: {
            title: "Geskilbeslegting",
            process: {
              title: "Beslegtingsproses",
              body: "Ons streef daarna om enige dispute vreedsaam op te los. Kontak ons asseblief eers vir pogings tot oplossing. Indien nie opgelos nie, moet dispute deur bemiddeling opgelos word voordat hofstappe geneem word.",
              law: "Toepaslike Reg: Hierdie voorwaardes en enige dispute word gereguleer deur die wetgewing van Mosambiek.",
              jurisdiction: "Jurisdiksie: Howe in Maputo, Mosambiek, het eksklusiewe jurisdiksie.",
              mediation: "Bemiddeling: Partye stem in om bemiddeling te probeer deur 'n geakkrediteerde bemiddelaar voordat regsprosedures begin word."
            }
          },
          changes: {
            title: "Veranderinge aan hierdie Voorwaardes",
            body: "Ons kan die Voorwaardes van tyd tot tyd opdateer. Die gepubliseerde weergawe is van toepassing op jou verblyf."
          },
          law: {
            title: "Toepaslike Reg",
            body: "Mosambiek se wetgewing is van toepassing, met inagneming van verpligte plaaslike verbruikersbeskermingsreëls."
          },
          contact: {
            title: "Kontakte",
            body: "Vrae? <a href=\"mailto:legal@devoceanlodge.com\">legal@devoceanlodge.com</a>."
          }
        }
      },

      gdpr: {
        title: "GDPR Kennisgewing",
        updatedDate: "06 Oktober 2025",
        quickLinks: {
          title: "Vinnige Skakels",
          links: [
            { id: "controller", text: "Data Beheerder" },
            { id: "bases", text: "Regsbasisse" },
            { id: "rights", text: "Jou Regte" },
            { id: "retention", text: "Data Berging" },
            { id: "transfers", text: "Data Oordrag" },
            { id: "complaints", text: "Klachte" }
          ]
        },
        sections: {
          badge: {
            title: "GDPR Nakoming:",
            body: "Ons is daartoe verbind om jou persoonlike data te beskerm en jou privaatheidsregte te respekteer in ooreenstemming met die Algemene Databeskermingsregulasie."
          },
          controller: {
            title: "Data Beheerder",
            body: "TERRAfrique LDA (DEVOCEAN Lodge), geregistreer by Rua C, Parcela 12, Maputo 1118, Mosambiek, tree op as die databestuurder vir jou persoonlike inligting wat deur ons dienste versamel word."
          },
          bases: {
            title: "Regsbasisse vir Verwerking",
            body: "Ons verwerk jou persoonlike data op die volgende regsgronde in ooreenstemming met GDPR:",
            legalBases: [
              {
                title: "Kontrak:",
                body: "Verwerking wat nodig is om ons ooreenkomste vir besprekings en die lewering van dienste na te kom."
              },
              {
                title: "Wettige Verpligting:",
                body: "Verwerking wat nodig is om aan wettige vereistes te voldoen (byvoorbeeld belastingwetgewing)."
              },
              {
                title: "Legitieme Belange:",
                body: "Verwerking in ons wettige besigheidsbelange terwyl ons jou regte respekteer."
              },
              {
                title: "Toestemming:",
                body: "Verwerking gebaseer op jou uitdruklike toestemming vir spesifieke doeleindes."
              }
            ]
          },
          rights: {
            title: "Jou GDPR Regte",
            body: "As 'n datavak onder GDPR, het jy die volgende regte met betrekking tot jou persoonlike data:",
            items: [
              {
                title: "Reg op Toegang",
                body: "Jy kan kopieë versoek van jou persoonlike data wat ons hou."
              },
              {
                title: "Reg op Regstelling",
                body: "Jy kan versoek om onakkurate of onvolledige data reg te stel."
              },
              {
                title: "Reg op Verwydering",
                body: "Jy kan versoek om jou persoonlike data uit te vee onder sekere voorwaardes."
              },
              {
                title: "Reg om Verwerking te Beperk",
                body: "Jy kan versoek om die gebruik van jou data te beperk."
              },
              {
                title: "Reg op Data Oordraagbaarheid",
                body: "Jy kan versoek dat jou data na 'n ander organisasie oorgedra word."
              },
              {
                title: "Reg om Beswaar te Maak",
                body: "Jy kan beswaar maak teen sekere tipes verwerking van jou data."
              }
            ],
            buttons: {
              access: "Versoek Toegang tot Data",
              erasure: "Versoek Verwydering van Data"
            }
          },
          retention: {
            title: "Data Berging",
            periodsTitle: "Bergingsperiodes",
            intro: "Ons bewaar jou persoonlike data slegs vir die tydperk wat nodig is om die doeleindes waarvoor dit versamel is te vervul, insluitend wettige, boekhoudkundige of rapporteringsvereistes.",
            items: [
              "<strong>Besprekingsdata:</strong> 7 jaar om aan belasting- en wettige vereistes te voldoen",
              "<strong>Kliëntediens Kommunikasie:</strong> 3 jaar",
              "<strong>Bemarking Toestemming:</strong> Totdat toestemming teruggetrek word",
              "<strong>Webwerf Analise:</strong> 26 maande",
              "<strong>Finansiële Transaksies:</strong> 10 jaar vir boekhoudkundige doeleindes"
            ]
          },
          transfers: {
            title: "Internasionale Data-oordragte",
            body: "Wanneer ons jou data buite die Europese Ekonomiese Area (EEA) oordra, verseker ons dat gepaste beskermingsmaatreëls vir jou inligting in plek is. Dit kan die gebruik van standaard kontraktuele klousules insluit wat deur die Europese Kommissie goedgekeur is, of die oordrag van data na lande met voldoende besluite.",
            notice: {
              title: "Internasionale Data-oordragte:",
              body: "Ons verseker dat gepaste beskermingsmaatreëls in plek is tydens internasionale data-oordragte, insluitend die gebruik van standaard kontraktuele klousules of die versekering van voldoende besluite."
            }
          },
          complaints: {
            title: "Klachte",
            intro: "Indien jy bekommernisse het oor hoe ons jou persoonlike data hanteer, het jy die reg om 'n klag by die plaaslike databeskermingsowerheid in te dien.",
            footer: "Ons beveel aan dat jy eers met ons kontak maak om enige kwessies te probeer oplos voordat jy die toesighoudende owerheid kontak."
          },
          dpo: {
            title: "Kontak Ons Databeskermingsbeampte",
            body: "Vir enige navrae rakende GDPR, of om jou regte uit te oefen, kontak asseblief ons databeskermingsbeampte by <a href=\"mailto:legal@devoceanlodge.com\">legal@devoceanlodge.com</a>. Ons sal op jou versoek reageer binne 30 dae, soos deur GDPR vereis."
          }
        }
      },

      cric: {
        title: "CRIC — Maatskappy en Kontak",
        updatedDate: "27 September 2025",
        quickLinks: {
          title: "Vinnige Skakels",
          links: [
            { id: "overview", text: "Oorsig" },
            { id: "contact", text: "Kontakbesonderhede" },
            { id: "emergency", text: "Noodkontak" }
          ]
        },
        sections: {
          badge: {
            title: "Amptelike Maatskappyinligting:",
            body: "Volledige besigheidsregistrasiebesonderhede en kontakinligting vir DEVOCEAN Lodge."
          },
          overview: {
            title: "Oorsig",
            body: "Volledige besigheidsregistrasiebesonderhede en kontakinligting vir DEVOCEAN Lodge.",
            details: [
              { label: "Maatskappy Naam", value: "" },
              { label: "Besigheidsregistrasie", value: "" },
              { label: "BTW Nommer (NUIT)", value: "" },
              { label: "Besigheidslisensie (Alvará)", value: "" },
              { label: "Regsvorm", value: "Beperkte Aanspreeklikheidsmaatskappy" },
              { label: "Kapitaal", value: "" }
            ]
          },
          contact: {
            title: "Kontakbesonderhede",
            body: "Vir algemene navrae, besprekings en inligting oor ons dienste, gebruik asseblief die kontakbesonderhede hieronder.",
            details: [
              { label: "Geregistreerde Adres", value: "" },
              { label: "E-pos", value: "" },
              { label: "Telefoon", value: "" },
              { label: "Besigheidsure", value: "Maandag - Vrydag: 8:00 - 18:00<br>Saterdag en Sondag: 8:00 - 12:00<br>Ontvangs: 6:00 - 22:00 (vir gaste)" }
            ]
          },
          emergency: {
            title: "Noodkontak",
            body: "Vir dringende sake buite werksure, gebruik asseblief ons noodkontakbesonderhede.",
            details: [
              { label: "Noodtelefoon", value: "", subtitle: "Vir dringende sake buite werksure" },
              { label: "Nood E-pos", value: "" }
            ]
          }
        }
      }
    },

    // -------- ZULU --------
    zu: {
      privacy: {
        title: "Inqubomgomo yobumfihlo",
        updatedDate: "06 Okthoba 2025",
        quickLinks: {
          title: "Izixhumanisi ezisheshayo",
          links: [
            { id: "who", text: "Thina singobani" },
            { id: "collect", text: "Ukuqoqwa kwedatha" },
            { id: "use", text: "Ukusetshenziswa kwedatha" },
            { id: "share", text: "Ukwabelana ngedatha" },
            { id: "security", text: "Ukuphepha" },
            { id: "retention", text: "Ukugcinwa" },
            { id: "rights", text: "Amalungelo akho" },
            { id: "transfers", text: "Ukudluliswa kwamanye amazwe" },
            { id: "contact", text: "Imininingwane yoxhumano" },
            { id: "updates", text: "Ukubuyekezwa kwenqubomgomo" }
          ]
        },
        sections: {
          badge: {
            title: "Ubumfihlo bakho bubalulekile:",
            body: "Sizibophezele ekuvikeleni idatha yakho yomuntu siqu futhi sibe sobala mayelana nendlela esiyiqoqa, siyisebenzise, futhi siyivikele ngayo imininingwane yakho."
          },
          who: {
            title: "Thina singobani",
            body: "I-DEVOCEAN Lodge iqhutshwa yi-TERRAfrique LDA, inkampani ebhaliswe eMozambique. Ikheli lethu elibhalisiwe: Rua C, Parcela 12, Maputo 1118, eMozambique. Sisebenzisa indawo yokuhlala enobungani bemvelo ogwini lwasePonta do Ouro, eMozambique. Sizibophezele ekuvikeleni ubumfihlo bakho futhi siqinisekise ukuqoqwa, ukucutshungulwa, kanye nokusetshenziswa kwedatha yakho yomuntu siqu ngendlela efanele, esemthethweni, futhi esobala ngokuhambisana nemithetho evikela idatha esetshenziswayo. Ngokufinyelela noma ukusebenzisa iwebhusayithi yethu nezinsizakalo, uyavuma ukuqoqwa nokusetshenziswa kolwazi lwakho njengoba kuchazwe kule Nqubomgomo yobumfihlo."
          },
          collect: {
            title: "Idatha yomuntu siqu esiyiqoqayo",
            intro: "Siqoqa izinhlobo ezahlukene zolwazi ukuze sinikeze futhi sithuthukise izinsizakalo zethu:",
            categories: [
              {
                title: "Ulwazi lomuntu siqu",
                items: [
                  "Igama, imininingwane yokuxhumana",
                  "Ulwazi lwephasipoti/ikadi likazisi",
                  "Ulwazi lokukhokha",
                  "Okuthandwayo kokubhuka"
                ]
              },
              {
                title: "Idatha yezobuchwepheshe",
                items: [
                  "Ikheli le-IP, ulwazi lwedivayisi",
                  "Uhlobo nesiphequluli sesiphequluli",
                  "Ukuhlaziywa kokusetshenziswa kwewebhusayithi",
                  "Idatha yama-Cookie (ngemvume yakho)"
                ]
              },
              {
                title: "Idatha yokuxhumana",
                items: [
                  "Ukxhumana nge-imeyili",
                  "Izicelo zensizakalo yamakhasimende",
                  "Imibono kanye nokuphawula",
                  "Okuthandwayo kokumaketha"
                ]
              }
            ]
          },
          use: {
            title: "Sisebenzisa kanjani idatha yakho",
            items: [
              "Ukuphatha ukubhuka kanye nokunikeza izinsizakalo",
              "Ukuxhumana mayelana nokuhlala kwakho, izinqubomgomo kanye neminikelo (ngokuzikhethela)",
              "Ukuthuthukisa iwebhusayithi yethu nezinsizakalo (ukuhlaziya, ukuphepha)",
              "Ukuhambisana nezibopho zomthetho/zezezimali"
            ]
          },
          share: {
            title: "Sabelana nini ngedatha",
            items: [
              "Abahlinzeki bokukhokha kanye nezinkundla zokubhuka ukuze kucutshungulwe ukubhuka kwakho nezinkokhelo",
              "Izinsizakalo zokuhlaziya ukuze kuqondwe ukusetshenziswa kwewebhusayithi nokuthuthukisa izinsizakalo zethu",
              "Izinsizakalo zokukhangisa zokukhangisa okukhombe kuwe (kuphela ngemvume yakho)",
              "Abahlinzeki bezinsizakalo ze-IT, abahlinzeki bokusingatha kanye nabaxhasi bezobuchwepheshe ngaphansi kwezivumelwano zokugcina ubumfihlo",
              "Ukwabelana neziphathimandla zomthetho uma kudingeka ngumthetho, umthethonqubo, umyalelo wenkantolo noma ezinye izinqubo zomthetho",
              "Ukufeza izinkontileka noma ukuvikela amalungelo, impahla, ukuphepha",
              "Ukudlulisa ulwazi kumnikazi omusha uma kuba nokuhlanganiswa, ukuthengwa, noma ukuthengiswa kwezimpahla"
            ],
            footer: "Sifuna ukuthi zonke izinkampani zangaphandle zihloniphe ukuphepha kwedatha yomuntu siqu futhi ziyisebenzisele izinhloso zokudlulisa kuphela. Izinkampani zangaphandle azivunyelwe ukusebenzisa idatha yomuntu siqu ngezinhloso zazo, kuphela ukuze zicubungule ngokwemiyalelo yethu ngezinhloso ezichaziwe."
          },
          security: {
            title: "Izinyathelo zokuphepha",
            intro: "Sithatha ukuphepha kwedatha ngokungathí sina futhi sisebenzisa lezi zinyathelo ezilandelayo:",
            measures: [
              "Ukubethela idatha ebucayi ngesikhathi sokudluliswa nokugcinwa",
              "Ukuhlola ukuphepha njalo kanye nokuhlolwa kokungena",
              "Ukuphatha ukufinyelela kanye nezindlela zokuqinisekisa",
              "Ukuqeqesha abasebenzi ngokuvikela idatha kanye nobumfihlo",
              "Ukulondolozwa kwedatha okuphephile kanye nezinqubo zokubuyisela emuva uma kuba nezinkinga"
            ]
          },
          retention: {
            title: "Ukugcinwa kwedatha",
            body: "Sigcina idatha yakho yomuntu siqu kuphela isikhathi esidingekayo ukufeza izinhloso eyaqoqwa ngazo. Ngokuvamile, sigcina idatha yomuntu siqu unyaka ongu-1 ngemuva kokuxhumana kwakho kokugcina nathi, ngaphandle uma umthetho udinga noma uvumela isikhathi eside sokugcina. Singagcina ulwazi oluthile isikhathi eside ngezizathu ezithile, okuhlanganisa: ukugcina amarekhodi kanye nokubika ngokuhambisana nomthetho ofanele (imvamisa amarekhodi ezezimali kanye nentela ango-7 unyaka); ukuqinisekisa amalungelo omthetho, ukuvikela ubugebengu kanye nokuxazulula izingxabano. Uma isikhathi sokugcina siphela, idatha yakho yomuntu siqu izosuswa noma inikwe igama elingaziwa ngendlela ephephile. Ulwazi olungaziwa kanye nolwazi oluhlanganisiwe olungakuchazi ngqo noma ngokungaqondile lungagcinwa unomphelo ngezinhloso zezibalo kanye nokuhlaziya."
          },
          rights: {
            title: "Amalungelo akho obumfihlo",
            items: [
              "Ilungelo lokufinyelela idatha yakho yomuntu siqu",
              "Ilungelo lokulungisa idatha engalungile",
              "Ilungelo lokususa idatha yakho yomuntu siqu",
              "Ilungelo lokunciphisa noma lokuphikisa ukucutshungulwa",
              "Ilungelo lokuphatheka kwedatha",
              "Ilungelo lokuhoxisa imvume"
            ]
          },
          transfers: {
            title: "Ukudluliswa kwedatha kwamanye amazwe",
            body: "Njengoba sisebenza ezindaweni eziningi zomthetho, idatha yakho ingase idluliselwe futhi icutshungulwe emazweni angaphandle kwezwe lakho lokuhlala. Siqinisekisa ukuthi ukudlulisa okunjalo kuhambisana nemithetho evikela idatha esetshenziswayo ngokusebenzisa izinqumo zokwanele zeKhomishini yaseYurophu, izinkontileka ezijwayelekile (SCC), izinyathelo zokuphepha ezifanele kanye nokuba sobala ngezindawo zokudlulisa."
          },
          contact: {
            title: "Xhumana neqembu lethu lobumfihlo",
            body: "Uma unemibuzo, ukukhathazeka, izicelo, noma ufisa ukusebenzisa amalungelo akho obumfihlo mayelana nale Nqubomgomo yobumfihlo noma ukucutshungulwa kwedatha yakho yomuntu siqu, sicela uxhumane nathi ngalezi zindlela ezilandelayo:<br><br><strong>I-imeyili:</strong> <a href=\"mailto:legal@devoceanlodge.com\">legal@devoceanlodge.com</a><br><br><strong>Ucingo:</strong> +258 8441 82252<br><strong>Ikheli leposi:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>eMozambique<br><br>Sizophendula isicelo sakho ngokuhambisana nomthetho ovikela idatha osetshenziswayo. Uma unezikhalazo noma ukukhathazeka mayelana nokucutshungulwa kolwazi lwakho, ungaxhumana ne-Data Protection Officer yethu kule kheli le-imeyili elingenhla."
          },
          updates: {
            title: "Ukubuyekezwa kwenqubomgomo",
            body: "Singabuyekeza le Nqubomgomo yobumfihlo ngezikhathi ezithile ukuze ibonise izinguquko emikhubeni yethu, ubuchwepheshe, izidingo zomthetho noma ezinye izici. Sizokwazisa ngezinguquko ezibalulekile ngezaziso ze-imeyili kubasebenzisi ababhalisiwe, izaziso ezigqamile kwiwebhusayithi yethu kanye nosuku lokubuyekezwa kokugcina. Sincoma ukuthi ubuyekeze le nqubomgomo njalo ukuze wazi ukuthi sivikela kanjani ulwazi lwakho."
          }
        }
      },

      cookies: {
        title: "Inqubomgomo yama-Cookie",
        effectiveDate: "19 Septhemba 2025",
        lastUpdated: "06 Okthoba 2025",
        managePreferences: "Phatha izintandokazi zakho zama-Cookie:",
        manageText: "Ungalawula ukuthi yimaphi ama-Cookie esiwasebenzisayo ngesibhengezo sethu sama-Cookie noma izilungiselelo zesiphequluli sakho.",
        cookieSettingsBtn: "Izilungiselelo zama-Cookie",
        quickLinks: {
          title: "Izixhumanisi ezisheshayo",
          links: [
            { id: "what", text: "Ayini ama-Cookie" },
            { id: "how", text: "Sisebenzisa kanjani ama-Cookie" },
            { id: "necessary", text: "Adingekayo" },
            { id: "functional", text: "Okusebenzayo" },
            { id: "analytics", text: "Ukuhlaziya" },
            { id: "advertisement", text: "Ukukhangisa" },
            { id: "manage", text: "Phatha izintandokazi" }
          ]
        },
        sections: {
          badge: {
            title: "Mayelana nama-Cookie",
            body: "Ungalawula ukuthi yimaphi ama-Cookie esiwasebenzisayo ngesibhengezo sethu sama-Cookie noma izilungiselelo zesiphequluli sakho."
          },
          what: {
            title: "Ayini ama-Cookie?",
            body: "Le Nqubomgomo yama-Cookie ichaza ukuthi ayini ama-Cookie, ukuthi siwasebenzisa kanjani, izinhlobo zama-Cookie esiwasebenzisayo (okungukuthi ulwazi esiluqoqayo ngokusebenzisa ama-Cookie kanye nokuthi lolo lwazi lusetshenziswa kanjani), kanye nendlela yokuphatha izilungiselelo zakho zama-Cookie.<br><br>Ama-Cookie amafayela ombhalo amancane asetshenziselwa ukugcina ulwazi oluncane. Agcinwa kudivayisi yakho lapho iwebhusayithi ilayishwa esipheqululini sakho. Lawa ma-Cookie asisisiza ekwenza iwebhusayithi isebenze kahle, isebenze kangcono, inikeze ulwazi lokuhlaziya kanye nokuthuthukisa ukuhlangenwe nakho komsebenzisi."
          },
          how: {
            title: "Sisebenzisa kanjani ama-Cookie?",
            body: "Njengezinsizakalo eziningi ze-inthanethi, iwebhusayithi yethu isebenzisa ama-Cookie okuqala kanye nama-Cookie esithathu ngezinhloso ezahlukene. Ama-Cookie okuqala adingeka kakhulu ukuze iwebhusayithi isebenze kahle futhi awaqoqi idatha engakhomba umuntu siqu.<br><br>Ama-Cookie esithathu asetshenziswa kwiwebhusayithi yethu asisiza ikakhulukazi ekuqondeni ukuthi iwebhusayithi isebenza kanjani, ukulandelela ukuthi uxhumana kanjani nayo, ukugcina izinsizakalo zethu ziphephile kanye nokunikeza okukhangisayo okufanele kakhulu kuwe, okwenza isipiliyoni sakho nalewebhusayithi sibe ngcono futhi sishesha ukututhukisa ukuhlangenwe nakho komsebenzisi."
          },
          necessary: {
            title: "Ama-Cookie adingekayo",
            description: "Ama-Cookie adingekayo ayadingeka ukuze anikeze izici eziyisisekelo zalesi sayithi, njengokuhlinzeka ngokungena okuphephile noma ukulungisa izintandokazi zakho zemvume. Lawa ma-Cookie awagcini idatha engakhomba umuntu siqu.",
            tableHeaders: {
              cookie: "Cookie",
              duration: "Isikhathi",
              description: "Incazelo"
            },
            cookies: [
              { name: "CookieConsent", duration: "1 year", desc: "Leli Cookie lisetshenziselwa ukugcina izintandokazi zemali yomsebenzisi." },
              { name: "rc::a", duration: "Persistent", desc: "Incazelo ayikatholakali okwamanje." },
              { name: "rc::c", duration: "Session", desc: "Incazelo ayikatholakali okwamanje." },
              { name: "li_gc", duration: "6 months", desc: "Ayikho incazelo etholakalayo." },
              { name: "test_cookie", duration: "15 minutes", desc: "Incazelo ayikatholakali okwamanje." },
              { name: "CONSENT", duration: "2 years", desc: "Incazelo ayikatholakali okwamanje." }
            ]
          },
          functional: {
            title: "Ama-Cookie okusebenzayo",
            description: "Ama-Cookie okusebenzayo asisiza ekwenzeni izinto ezithile njengokwabelana ngokuqukethwe kwewebhusayithi ezinkundleni zokuxhumana, ukuqoqa impendulo, kanye nezinye izici zesithathu.",
            tableHeaders: {
              cookie: "Cookie",
              duration: "Isikhathi",
              description: "Incazelo"
            },
            cookies: [
              { name: "_fbp", duration: "3 months", desc: "I-Facebook isetha leli Cookie ukuze ithuthukise ulwazi lomsebenzisi lokudlulisa kwiwebhusayithi, futhi inikeze umsebenzisi ngokukhangisa okufanelekile ngenkathi esebenzisa izinkundla zokuxhumana ze-Facebook." }
            ]
          },
          analytics: {
            title: "Ama-Cookie okuhlaziya",
            description: "Ama-Cookie okuhlaziya asetshenziselwa ukuqonda ukuthi izivakashi zixhumana kanjani newebhusayithi. Lawa ma-Cookie asisiza ekuhlinzekeni ulwazi ngezilinganiso ezifana nenani lezivakashi, izinga lokugxuma, umthombo wethrafikhi, njll.",
            tableHeaders: {
              cookie: "Cookie",
              duration: "Isikhathi",
              description: "Incazelo"
            },
            cookies: [
              { name: "_ga", duration: "2 years", desc: "I-Google Analytics isetha leli Cookie ukuze libale idatha yesivakashi, iseshini kanye nedatha yomkhankaso futhi lilandelele ukusetshenziswa kwesayithi ukuze kwenziwe umbiko wokuhlaziya wesayithi. I-Cookie igcina ulwazi ngokungaziwa futhi inikeza inombolo eyakhiwe ngokungahleliwe ukuze ibone izivakashi ezihlukile." },
              { name: "_gat_gtag_UA_*", duration: "1 minute", desc: "I-Google Analytics isetha leli Cookie ukuze ligcine futhi libale ukubukwa kwekhasi." },
              { name: "_gid", duration: "1 day", desc: "I-Google Analytics isetha leli Cookie ukuze ligcine ulwazi lokuthi izivakashi zisebenzisa kanjani iwebhusayithi kuyilapho futhi lidala umbiko wokuhlaziya wokusebenza kwewebhusayithi. Ezinye zedatha eqoqiwe zifaka inani lezivakashi, umthombo wazo, kanye namakhasi abavakashele ngokungaziwa." },
              { name: "_ga_*", duration: "2 years", desc: "I-Google Analytics isetha leli Cookie ukuze lilandelele ukuziphatha komsebenzisi." },
              { name: "visitor_id*", duration: "10 years", desc: "I-Cookie ye-pardot isethwa ngenkathi isivakashi singene njengomsebenzisi we-Pardot. I-Cookie ikhombisa iseshini esebenzayo futhi ayisetshenziselwa ukulandela." }
            ]
          },
          advertisement: {
            title: "Ama-Cookie okukhangisa",
            description: "Ama-Cookie okukhangisa asetshenziselwa ukuhlinzeka izivakashi ngokukhangisa okwenziwe ngokwezifiso ngokuya ngamakhasi owavakashele ngaphambilini kanye nokuhlaziya ukusebenza kahle kwemikhankaso yokukhangisa.",
            tableHeaders: {
              cookie: "Cookie",
              duration: "Isikhathi",
              description: "Incazelo"
            },
            cookies: [
              { name: "_gcl_au", duration: "3 months", desc: "I-Google Tag Manager isetha leli Cookie ukuze ihlele ukusebenza kahle kokukhangisa kwewebhusayithi ezisebenzisa izinsizakalo zayo." },
              { name: "test_cookie", duration: "15 minutes", desc: "I-doubleclick.net isetha leli Cookie ukuze inqume ukuthi isiphequluli somsebenzisi siyawasekela yini ama-Cookie." },
              { name: "fr", duration: "3 months", desc: "I-Facebook isetha leli Cookie ukuze ligcine futhi lilandelele ukuxhumana." },
              { name: "IDE", duration: "1 year 24 days", desc: "Ama-Cookie e-Google DoubleClick IDE agcina ulwazi lokuthi umsebenzisi usebenzisa kanjani iwebhusayithi ukuze anikeze ngokukhangisa okufanelekile ngokuya ngephrofayili yomsebenzisi." }
            ]
          },
          manage: {
            title: "Phatha izintandokazi zama-Cookie",
            consentTitle: "Izintandokazi zemvume",
            consentText: "Ungashintsha izilungiselelo zakho zama-Cookie noma nini ngokuchofoza inkinobho ethi 'Izintandokazi zemvume' ngenhla. Lokhu kuzokuvumela ukuthi uphinde uvakashele isibhengezo semvume yama-Cookie futhi ubuyekeze izintandokazi zakho noma uhoxise imvume yakho ngokushesha.",
            browserText: "Ngaphezu kwalokho, iziphequluli ezahlukene zinikeza izindlela ezahlukene zokuvimba nokususa ama-Cookie asetshenziswa amawebhusayithi. Ungashintsha izilungiselelo zesiphequluli sakho ukuze uvimbe noma ususe ama-Cookie. Ngezansi kunezixhumanisi zemibhalo exhasayo yokuphatha nokususa ama-Cookie ezinhlotsheni ezinkulu zesiphequluli.",
            browsers: {
              chrome: "Chrome",
              safari: "Safari",
              firefox: "Firefox",
              ie: "Internet Explorer",
              other: "Uma usebenzisa esinye isiphequluli sewebhu, sicela ubheke imibhalo yayo esemthethweni exhasayo."
            }
          }
        }
      },

      terms: {
        title: "Imigomo kanye nezimo",
        updatedDate: "06 Okthoba 2025",
        quickLinks: {
          title: "Izixhumanisi ezisheshayo",
          links: [
            { id: "intro", text: "Ububanzi" },
            { id: "booking", text: "Ukubhuka" },
            { id: "payment", text: "Amanani kanye nenkokhelo" },
            { id: "cancel", text: "Ukuhoxiswa" },
            { id: "conduct", text: "Ukuziphatha kwezivakashi" },
            { id: "force-majeure", text: "Amandla angaphezu kwamandla" },
            { id: "liability", text: "Isibopho" },
            { id: "intellectual-property", text: "Impahla yobuhlakani" },
            { id: "disputes", text: "Ukuxazululwa kwezingxabano" },
            { id: "changes", text: "Izinguquko" },
            { id: "law", text: "Umthetho olawulayo" },
            { id: "contact", text: "Xhumana" }
          ]
        },
        sections: {
          badge: {
            title: "Isaziso esibalulekile sezomthetho:",
            body: "Le migomo ilawula ukusetshenziswa kwezinsizakalo zethu kanye newebhusayithi. Sicela uyifunde ngokucophelela ngaphambi kokubhuka."
          },
          intro: {
            title: "Ububanzi",
            body: "Le migomo ilawula indawo yokuhlala kanye nezinsizakalo ezihambisanayo ezinikezwa yi-DEVOCEAN Lodge (TERRAfrique LDA). Ngokubhuka, uyavuma le migomo."
          },
          booking: {
            title: "Ukubhuka",
            items: [
              "Nikeza ulwazi lwezivakashi olulungile kanye nezinsuku zokufika/zokuphuma",
              "Izicelo ezikhethekile zixhomeke ekutholakaleni nasekuqinisekisweni"
            ],
            reservationReq: {
              title: "Izidingo zokubhuka",
              body: "Ikhadi likazisi elivumelekile kanye nekhadi lesikweletu kuyadingeka kuzo zonke izibhukhi. Iminyaka encane: 18."
            },
            checkinCheckout: {
              title: "Ukungena/Ukuphuma",
              body: "Ukungena: 2:00 PM | Ukuphuma: 11:00 AM. Izicelo zangaphambi kwesikhathi/ezasekuqaleni zixhomeke ekutholakaleni."
            },
            groupBookings: {
              title: "Ukubhuka kweqembu",
              body: "Imigomo ekhethekile isebenza kumaqembu anamagumbi ayisithupha noma ngaphezulu. Xhumana nathi ukuze uthole amanani amaqembu kanye nezinqubomgomo."
            }
          },
          payment: {
            title: "Amanani kanye nenkokhelo",
            items: [
              "Amanani aboniswayo aweyunithi/ngobusuku ngaphandle uma kushiwo ngenye indlela",
              "Ama-deposit kanye nezindlela zokukhokha zizoqinisekiswa ngesikhathi sokubhuka"
            ],
            paymentInfo: {
              title: "Ulwazi lwenkokhelo",
              body: "Zonke izintengo zise-USD ngaphandle uma kushiwo ngenye indlela. Amanani okuguqulwa kwemali ayalinganiselwa futhi angashintsha. Ikhadi lesikweletu elivumelekile liyadingeka ukuze kuvikeleke ukubhuka kwakho. Izindleko ezengeziwe zingase zisetshenziswe ezindlekweni ezingalindelekile."
            }
          },
          cancel: {
            title: "Ukuhoxiswa kanye nokungafiki",
            body: "Imigomo yokuhoxiswa izodalulwa ngesikhathi sokubhuka kanye nasesiqinisekisweni sakho.",
            cancellationCharges: {
              title: "Izindleko zokuhoxiswa",
              plans: [
                {
                  planName: "Uhlelo lwentengo oluguquguqukayo:",
                  tiers: [
                    { period: "Izinsuku ezingama-30 noma ngaphezulu ngaphambi kokufika", charge: "Imbuyiselo ephelele" },
                    { period: "Izinsuku ezingama-29 noma ngaphansi ngaphambi kokufika", charge: "Inkokhelo yokuhoxiswa engu-50%" }
                  ]
                },
                {
                  planName: "Uhlelo lwentengo olungabuyiselwa:",
                  tiers: [
                    { period: "Kuze kube ngamahora angama-24 ngemuva kokubhuka", charge: "Imbuyiselo ephelele" },
                    { period: "Kuzo zonke ezinye izimo", charge: "Akukho mbuyiselo", subtext: "Ilungelo lokushintsha usuku lokufika kanye nje ngaphansi kwemibandela yokukhokha umehluko wentengo yezinsuku ezintsha." }
                  ]
                }
              ]
            },
            noshowPolicy: {
              title: "Inqubomgomo yokungafiki",
              body: "Izivakashi ezingafikanga ngosuku lokungena oluhleliwe ngaphandle kwesaziso sangaphambili zizothathwa njengezingafikanga. Kuzokhokhiswa inani eliphelele, futhi ukubhuka kuzokhanselwa."
            }
          },
          conduct: {
            title: "Ukuziphatha kwezivakashi",
            items: [
              "Hlonipha imithetho yendawo, abasebenzi, ezinye izivakashi kanye nomphakathi wendawo",
              "Akukho misebenzi engekho emthethweni endaweni"
            ],
            zeroTolerance: {
              title: "Inqubomgomo yokungabekezeleli",
              body: "Sigcina inqubomgomo yokungabekezeleli ukuziphatha okuphazamisayo, imisebenzi engekho emthethweni, noma ukulimaza impahla. Ukwephula kungase kuholele ekuxoshweni ngokushesha ngaphandle kwembuyiselo futhi kungase kuholele ezenzweni zomthetho."
            }
          },
          "force-majeure": {
            title: "Amandla angaphezu kwamandla",
            intro: "Asinaso isibopho sokwehluleka ukufeza izibopho ngenxa yezimo ezingaphezu kwamandla ethu, okuhlanganisa kodwa okungagcini lapho:",
            items: [
              "Izinhlekelele zemvelo, izimo zezulu ezeqile",
              "Imingcele kahulumeni, ukuvinjelwa kokuhamba",
              "Iziyaluyalu zomphakathi, impi, ubuphekula",
              "Ubhubhane, izifo ezithathelwanayo, izimo eziphuthumayo zezempilo",
              "Ukwehluleka kwezinsiza, ukuhlukana kwengqalasizinda"
            ],
            footer: "Kulezi zimo, sizonikeza izinsuku ezihlukile noma amavawusha esikweletu lapho kukhona. Imbuyiselo izohlinzekwa ngokuhambisana nemithetho esetshenziswayo kanye nezimo. Kodwa-ke, zonke izindleko kanye nezindleko ezingase zihlanganiswe noma ebezingahlanganiswa yimishwalense ejwayelekile yokuhoxiswa kanye nohambo zikhishiwe esibophweni lethu."
          },
          liability: {
            title: "Isibopho",
            body: "Ngokwezinga elivunyelwe ngumthetho, asinaso isibopho sokulahlekelwa okungaqondile noma okungabonakali."
          },
          "intellectual-property": {
            title: "Impahla yobuhlakani",
            copyright: {
              title: "Isaziso selungelo lobunikazi",
              body: "Konke okuqukethwe kule webhusayithi, okuhlanganisa umbhalo, izithombe, ama-logo, kanye nezithombe, kuyimpahla ye-DEVOCEAN Lodge futhi kuvikelwe yimithetho yamalungelo obunikazi yamazwe ngamazwe. Ukusetshenziswa, ukukhiqiza kabusha, noma ukusatshalaliswa ngaphandle kwemvume akwavunyelwe. Igama le-DEVOCEAN Lodge, i-logo, kanye nazo zonke izimpawu ezihlobene ziwuphawu lokuhweba futhi azikwazi ukusetshenziswa ngaphandle kwemvume ebhaliwe."
            }
          },
          disputes: {
            title: "Ukuxazululwa kwezingxabano",
            process: {
              title: "Inqubo yokuxazulula",
              body: "Sihlose ukuxazulula noma yiziphi izingxabano ngokuthula. Sicela uxhumane nathi kuqala ukuze uzame ukuxazulula. Uma kungaxazululwanga, izingxabano zizoxazululwa ngokulamula ngaphambi kokuthatha izinyathelo zomthetho.",
              law: "Umthetho olawulayo: Le migomo kanye nanoma yiziphi izingxabano zizolawulwa umthetho waseMozambique.",
              jurisdiction: "Indawo yezomthetho: Izinkantolo zaseMaputo, eMozambique zizoba negunya elikhethekile.",
              mediation: "Ukulamula: Izinhlangothi ziyavuma ukuzama ukulamula ngomlamuli ovumelekile ngaphambi kokuqala izinqubo zomthetho."
            }
          },
          changes: {
            title: "Izinguquko kule migomo",
            body: "Singashintsha imigomo ngezikhathi ezithile. Inguqulo eshicilelwe isebenza ekuhlaleni kwakho."
          },
          law: {
            title: "Umthetho olawulayo",
            body: "Umthetho waseMozambique uyasebenza, kuye ngemithetho yendawo yezomthetho."
          },
          contact: {
            title: "Imininingwane yoxhumano",
            body: "Uma unemibuzo mayelana nale migomo, sicela uxhumane nathi ku-<a href=\"mailto:legal@devoceanlodge.com\">legal@devoceanlodge.com</a>."
          }
        }
      },

      gdpr: {
        title: "Isaziso se-GDPR",
        updatedDate: "06 Okthoba 2025",
        quickLinks: {
          title: "Izixhumanisi ezisheshayo",
          links: [
            { id: "controller", text: "Umlawuli wedatha" },
            { id: "bases", text: "Izisekelo zomthetho" },
            { id: "rights", text: "Amalungelo akho" },
            { id: "retention", text: "Ukugcinwa kwedatha" },
            { id: "transfers", text: "Ukudluliswa kwedatha" },
            { id: "complaints", text: "Izikhala" }
          ]
        },
        sections: {
          badge: {
            title: "Ukuhambisana ne-GDPR:",
            body: "Sizibophezele ekuvikeleni idatha yakho yomuntu siqu futhi sihloniphe amalungelo akho obumfihlo ngokuhambisana ne-General Data Protection Regulation."
          },
          controller: {
            title: "Umlawuli wedatha",
            body: "I-TERRAfrique LDA (DEVOCEAN Lodge), ebhaliswe ekhelini elithi Rua C, Parcela 12, Maputo 1118, eMozambique, isebenza njengomlawuli wedatha yolwazi lwakho lomuntu siqu oluqoqwe ngezinsizakalo zethu."
          },
          bases: {
            title: "Izisekelo zomthetho zokucubungula",
            body: "Sicubungula idatha yakho yomuntu siqu ngezisekelo zomthetho ezilandelayo ngokuhambisana ne-GDPR:",
            legalBases: {
              contract: {
                title: "Inkontileka:",
                body: "Ukucubungula okudingekayo ukuze kufezwe izivumelwano zethu zokubhuka kanye nokuhlinzeka ngezinsizakalo."
              },
              legal: {
                title: "Isibopho somthetho:",
                body: "Ukucubungula okudingekayo ukuze kuhambisane nezidingo zomthetho (isibonelo, umthetho wentela)."
              },
              legitimate: {
                title: "Izintshisekelo ezisemthethweni:",
                body: "Ukucubungula okusezintshisakelweni zethu zebhizinisi ezisemthethweni kuyilapho sihlonipha amalungelo akho."
              },
              consent: {
                title: "Imvume:",
                body: "Ukucubungula okusekelwe emvumeni yakho ecacile ngezinhloso ezithile."
              }
            }
          },
          rights: {
            title: "Amalungelo akho nge-GDPR",
            body: "Njengomuntu wedatha ngaphansi kwe-GDPR, unawo amalungelo alandelayo mayelana nedatha yakho yomuntu siqu:",
            list: {
              access: {
                title: "Ilungelo lokufinyelela",
                body: "Ungacela amakhophi edatha yakho yomuntu siqu esiyigcinayo."
              },
              rectification: {
                title: "Ilungelo lokulungisa",
                body: "Ungacela ukulungiswa kwedatha engalungile noma engaphelele."
              },
              erasure: {
                title: "Ilungelo lokususa",
                body: "Ungacela ukususwa kwedatha yakho yomuntu siqu ngaphansi kwezimo ezithile."
              },
              restrict: {
                title: "Ilungelo lokunciphisa ukucubungula",
                body: "Ungacela ukunciphisa ukusetshenziswa kwedatha yakho."
              },
              portability: {
                title: "Ilungelo lokuphatheka kwedatha",
                body: "Ungacela ukudluliswa kwedatha yakho kwenye inhlangano."
              },
              object: {
                title: "Ilungelo lokuphikisa",
                body: "Ungaphikisa izinhlobo ezithile zokucubungula idatha yakho."
              }
            },
            buttons: {
              access: { text: "Cela ukufinyelela idatha" },
              erasure: { text: "Cela ukususwa kwedatha" }
            }
          },
          retention: {
            title: "Ukugcinwa kwedatha",
            periodsTitle: "Izikhathi zokugcina",
            intro: "Sigcina idatha yakho yomuntu siqu kuphela isikhathi esidingekayo ukufeza izinhloso eyaqoqwa ngazo, kuhlanganise nezidingo zomthetho, zokubalwa kwezimali, noma zokubika.",
            items: [
              "<strong>Idatha yokubhuka:</strong> Iminyaka engu-7 ukuze kuhambisane nezidingo zentela nezomthetho",
              "<strong>Ukuxhumana kwensizakalo yamakhasimende:</strong> Iminyaka emi-3",
              "<strong>Imvume yokumaketha:</strong> Kuze kube yilapho uhoxisa imvume",
              "<strong>Ukuhlaziywa kwewebhusayithi:</strong> Izinyanga ezingama-26",
              "<strong>Ukuthengiselana kwezezimali:</strong> Iminyaka eyi-10 ngezinhloso zokubalwa kwezimali"
            ]
          },
          transfers: {
            title: "Ukudluliswa kwedatha kwamanye amazwe",
            body: "Uma sidlulisa idatha yakho ngaphandle kwe-European Economic Area (EEA), siqinisekisa ukuthi kunezinyathelo zokuvikela ezifanele zolwazi lwakho. Lokhu kungahlanganisa ukusetshenziswa kwezinkontileka ezijwayelekile ezivunywe yi-European Commission noma ukudlulisela idatha emazweni anezinqumo zokwanele.",
            safeguards: {
              international: {
                title: "Ukudluliswa kwedatha kwamanye amazwe:",
                body: "Siqinisekisa ukuthi kunezinyathelo zokuvikela ezifanele lapho sidlulisa idatha kwamanye amazwe, kuhlanganise ukusetshenziswa kwezinkontileka ezijwayelekile noma ukuqinisekisa izinqumo zokwanele."
              }
            }
          },
          complaints: {
            title: "Izikhala",
            intro: "Uma unokukhathazeka mayelana nendlela esiphetha ngayo idatha yakho yomuntu siqu, unelungelo lokufaka isikhalazo esigungwini sokuvikela idatha sendawo.",
            footer: "Sincoma ukuthi uxhumane nathi kuqala ukuze uzame ukuxazulula noma yiziphi izinkinga ngaphambi kokuthinta isigungu esiphethe."
          },
          dpo: {
            title: "Xhumana nesikhulu sethu sokuvikela idatha",
            body: "Nganoma yimiphi imibuzo ehlobene ne-GDPR, noma ukuze usebenzise amalungelo akho, sicela uxhumane nesikhulu sethu sokuvikela idatha ngekheli le-imeyili elithi <a href=\"mailto:legal@devoceanlodge.com\">legal@devoceanlodge.com</a>. Sizophendula esicelweni sakho phakathi kwezinsuku ezingama-30, njengoba kudingwa yi-GDPR."
          }
        }
      },

      cric: {
        title: "I-CRIC — Inkampani kanye noxhumano",
        updatedDate: "27 Septhemba 2025",
        quickLinks: {
          title: "Izixhumanisi ezisheshayo",
          links: [
            { id: "intro", text: "Uhlolojikelele" },
            { id: "contact", text: "Imininingwane yoxhumano" },
            { id: "emergency", text: "Ukuxhumana okuphuthumayo" }
          ]
        },
        sections: {
          badge: {
            title: "Ulwazi olusemthethweni lwenkampani:",
            body: "Imininingwane ephelele yokubhaliswa kwebhizinisi kanye nolwazi lokuxhumana lwe-DEVOCEAN Lodge."
          },
          intro: {
            title: "Uhlolojikelele",
            body: "Imininingwane ephelele yokubhaliswa kwebhizinisi kanye nolwazi lokuxhumana lwe-DEVOCEAN Lodge."
          },
          contact: {
            title: "Imininingwane yoxhumano",
            body: "Ngemibuzo ejwayelekile, ukubhuka kanye nolwazi mayelana nezinsizakalo zethu, sicela usebenzise imininingwane yokuxhumana elandelayo."
          },
          emergency: {
            title: "Ukuxhumana okuphuthumayo",
            body: "Ngemibuzo ephuthumayo ngaphandle kwamahora okusebenza, sicela usebenzise imininingwane yethu yoxhumano ephuthumayo."
          }
        },
        labels: {
          companyName: "Igama lenkampani",
          registration: "Ukubhaliswa kwebhizinisi",
          vat: "Inombolo ye-NUIT (VAT)",
          license: "Ilayisensi yebhizinisi (Alvará)",
          legalForm: "Ifomu elisemthethweni",
          capital: "Imali eyisisekelo",
          address: "Ikheli elibhalisiwe",
          email: "I-imeyili",
          phone: "Ucingo",
          businessHours: "Amahora okusebenza",
          emergencyPhone: "Ucingo oluphuthumayo",
          emergencyEmail: "I-imeyili ephuthumayo"
        },
        values: {
          legalForm: "Inkampani enomkhawulo",
          businessHours: "UMsombuluko - uLwesihlanu: 8:00 - 18:00<br>iSonto kanye neSonto: 8:00 - 12:00<br>Ideski lokwamukela: 6:00 - 22:00 (kwezivakashi)",
          emergencyPhoneNote: "Ngemibuzo ephuthumayo ngaphandle kwamahora okusebenza"
        }
      }
    }
  };
  
})();
