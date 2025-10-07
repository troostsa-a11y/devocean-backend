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
    en:   { back: "Home",                   updated: "Last updated" },
    de:   { back: "Startseite",             updated: "Zuletzt aktualisiert" },
    nl:   { back: "Home",                   updated: "Laatst bijgewerkt" },
    pt:   { back: "Início",                 updated: "Última atualização" },
    ptmz: { back: "Início",                 updated: "Última atualização" },
    fr:   { back: "Accueil",                updated: "Dernière mise à jour" },
    it:   { back: "Home",                   updated: "Ultimo aggiornamento" },
    es:   { back: "Inicio",                 updated: "Última actualización" }
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
          title: "Manage Your Cookie Preferences:",
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
            body: "All prices are in EUR unless otherwise stated. Currency conversion rates are approximate and subject to change. A valid credit card is required to secure your reservation. Additional charges may apply for incidental expenses."
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
                  { period: "In all other circumstances", charge: "No refund but the right to modify the date of arrival once under the condition of paying the difference in case the new date has a higher rate." }
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
            body: "Alle Preise sind in EUR, sofern nicht anders angegeben. Währungsumrechnungskurse sind ungefähr und können sich ändern. Eine gültige Kreditkarte ist erforderlich, um Ihre Reservierung zu sichern. Zusätzliche Gebühren können für Nebenkosten anfallen."
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
                  { period: "In allen anderen Umständen", charge: "Keine Rückerstattung, aber das Recht, das Anreisedatum einmal zu ändern, unter der Bedingung, den Preisunterschied zu zahlen, falls das neue Datum einen höheren Tarif hat." }
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
      managePreferences: "Verwalten Sie Ihre Cookie-Einstellungen:",
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
          title: "Verwalten Sie Ihre Cookie-Einstellungen:",
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
            body: "Alle prijzen zijn in EUR tenzij anders vermeld. Valutawisselkoersen zijn bij benadering en kunnen wijzigen. Een geldige creditcard is vereist om uw reservering te garanderen. Extra kosten kunnen van toepassing zijn voor bijkomende kosten."
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
                  { period: "In alle andere omstandigheden", charge: "Geen terugbetaling maar het recht om de aankomstdatum eenmaal te wijzigen onder de voorwaarde het verschil te betalen als de nieuwe datum een hoger tarief heeft." }
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
      managePreferences: "Beheer uw cookievoorkeuren:",
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
          title: "Beheer uw cookievoorkeuren:",
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
      updatedDate: "06 out 2025",      quickLinks: {
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
        badge: {
          title: "A sua privacidade é importante:",
          body: "Estamos comprometidos em proteger os seus dados pessoais e ser transparentes sobre como os recolhemos, utilizamos e protegemos."
        },
        who: {
          title: "Quem somos",
          body: "O DEVOCEAN Lodge é operado pela TERRAfrique LDA, uma empresa registada em Moçambique. O nosso endereço registado é Rua C, Parcela 12, Maputo 1118, Moçambique. Operamos alojamento ecológico de praia em Ponta do Ouro, Moçambique. Estamos comprometidos em proteger a sua privacidade e garantir que os seus dados pessoais sejam recolhidos, processados e utilizados de forma adequada, legal e transparente, de acordo com as leis aplicáveis de proteção de dados."
        },
        collect: {
          title: "Que dados pessoais recolhemos",
          intro: "Recolhemos diferentes tipos de informação para fornecer e melhorar os nossos serviços:",
          categories: [
            {
              title: "Informação pessoal",
              items: [
                "Nome, detalhes de contacto",
                "Informação de passaporte/ID",
                "Informação de pagamento",
                "Preferências de reserva"
              ]
            },
            {
              title: "Dados técnicos",
              items: [
                "Endereço IP, informação do dispositivo",
                "Tipo e versão do navegador",
                "Análises de uso do site",
                "Dados de cookies (com consentimento)"
              ]
            },
            {
              title: "Dados de comunicação",
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
            "Encriptação de dados sensíveis em trânsito e em repouso",
            "Avaliações de segurança regulares e testes de penetração",
            "Controlos de acesso e mecanismos de autenticação",
            "Formação do pessoal sobre proteção de dados e privacidade",
            "Procedimentos seguros de backup de dados e recuperação de desastres"
          ]
        },
        retention: {
          title: "Retenção de dados",
          body: "Reteremos as suas informações pessoais pelo tempo necessário para cumprir os propósitos para os quais foram recolhidas, conforme detalhado nesta Política de Privacidade. Geralmente, retemos dados pessoais por até 1 ano após a sua última interação connosco, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Podemos precisar de reter certas informações por períodos mais longos por razões específicas, incluindo: manutenção de registos e relatórios de acordo com a lei aplicável (tipicamente 7 anos para registos financeiros e fiscais), aplicação de direitos legais, prevenção de fraude e resolução de litígios. Uma vez expirado o período de retenção, os seus dados pessoais serão eliminados de forma segura ou anonimizados. Informações anónimas residuais e informações agregadas, que não o identificam direta ou indiretamente, podem ser armazenadas indefinidamente para fins estatísticos e analíticos."
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
          body: 'Se tiver alguma pergunta, preocupação ou pedido relacionado com esta Política de Privacidade ou o processamento das suas informações pessoais, ou se desejar exercer algum dos seus direitos de privacidade, por favor contacte-nos em:<br><br><strong>Email:</strong> <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a><br><strong>Telefone:</strong> +258 8441 82252<br><strong>Morada postal:</strong><br>TERRAfrique LDA T/A DEVOCEAN Lodge<br>Rua C, Parcela 12<br>Maputo 1118<br>Moçambique<br><br>Responderemos ao seu pedido de acordo com a lei de proteção de dados aplicável. Para queixas ou preocupações sobre o processamento das suas informações, pode também contactar o nosso Encarregado de Proteção de Dados no endereço de email acima.'
        },
        transfers: {
          title: "Transferências internacionais de dados",
          body: "Como operamos em várias jurisdições, os seus dados podem ser transferidos e processados em países fora da sua residência. Garantimos que essas transferências cumpram as leis aplicáveis de proteção de dados através de decisões de adequação da Comissão Europeia, Cláusulas Contratuais Tipo (CCT), salvaguardas de segurança apropriadas e transparência sobre os locais de transferência."
        },
        updates: {
          title: "Atualizações da política",
          body: "Podemos atualizar esta política de privacidade periodicamente para refletir mudanças nas nossas práticas, tecnologia, requisitos legais ou outros fatores. Notificaremos sobre quaisquer alterações materiais através de notificações por email para utilizadores registados, avisos proeminentes no nosso website e uma data atualizada de 'última atualização'. Encorajamos a revisão periódica desta política para se manter informado sobre como protegemos as suas informações."
        }
      }
    },

    terms: {
      title: "Termos e Condições",
      updatedDate: "06 out 2025",      quickLinks: {
        title: "Links rápidos",
        links: [
          { id: "intro", text: "Âmbito" },
          { id: "booking", text: "Reservas" },
          { id: "payment", text: "Preços e Pagamento" },
          { id: "cancel", text: "Cancelamentos e Não comparências" },
          { id: "conduct", text: "Conduta do hóspede" },
          { id: "force-majeure", text: "Força maior" },
          { id: "liability", text: "Responsabilidade" },
          { id: "intellectual-property", text: "Propriedade intelectual" },
          { id: "disputes", text: "Resolução de litígios" },
          { id: "changes", text: "Alterações" },
          { id: "law", text: "Lei aplicável" },
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
            body: "Todos os preços são em EUR, salvo indicação em contrário. As taxas de conversão de moeda são aproximadas e sujeitas a alterações. É necessário um cartão de crédito válido para garantir a sua reserva. Podem aplicar-se encargos adicionais para despesas acessórias."
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
                  { period: "Em todas as outras circunstâncias", charge: "Sem reembolso, mas o direito de modificar a data de chegada uma vez sob a condição de pagar a diferença caso a nova data tenha uma tarifa mais alta." }
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
            "Respeite as regras da propriedade, o pessoal, outros hóspedes e a comunidade local",
            "Não são permitidas atividades ilegais nas instalações"
          ],
          zeroTolerance: {
            title: "Política de Tolerância Zero",
            body: "Mantemos uma política de tolerância zero para comportamentos perturbadores, atividades ilegais ou danos à propriedade. As violações podem resultar em expulsão imediata sem reembolso e podem levar a ações legais."
          }
        },
        "force-majeure": {
          title: "Força Maior",
          intro: "Não somos responsáveis pela falha em cumprir obrigações devido a circunstâncias além do nosso controlo razoável, incluindo mas não limitado a:",
          items: [
            "Desastres naturais, condições meteorológicas extremas",
            "Restrições governamentais, proibições de viagem",
            "Distúrbios civis, guerra, terrorismo",
            "Pandemias, epidemias, emergências de saúde",
            "Falhas de serviços públicos, avarias de infraestrutura"
          ],
          footer: "Nestes casos, ofereceremos datas alternativas ou vales de crédito sempre que possível. Os reembolsos serão fornecidos de acordo com as leis aplicáveis e as circunstâncias. No entanto, todos os danos e custos que sejam ou pudessem ter sido cobertos por pacotes de seguro de cancelamento e viagem geralmente disponíveis estão excluídos da nossa responsabilidade."
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
          title: "Alterações a estes Termos",
          body: "Podemos atualizar os Termos periodicamente. A versão publicada aplica-se à sua estadia."
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
      managePreferences: "Gerir as suas preferências de cookies:",
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
          title: "Gerir as suas preferências de cookies:",
          body: "Pode controlar quais cookies usamos através do nosso banner de cookies ou das configurações do seu navegador."
        },
        what: {
          title: "O que são cookies?",
          body: "Esta Política de Cookies explica o que são cookies, como os utilizamos, os tipos de cookies que utilizamos (ou seja, a informação que recolhemos através de cookies e como essa informação é utilizada), e como gerir as suas configurações de cookies.<br><br>Cookies são pequenos ficheiros de texto utilizados para armazenar pequenas informações. São armazenados no seu dispositivo quando um website é carregado no seu navegador. Estes cookies ajudam a garantir que o website funciona corretamente, melhoram a segurança, proporcionam uma melhor experiência ao utilizador e analisam o desempenho para identificar o que funciona e onde são necessárias melhorias."
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
      title: "Aviso RGPD",
      updatedDate: "06 out 2025",
      quickLinks: {
        title: "Links rápidos",
        links: [
          { id: "controller", text: "Responsável" },
          { id: "bases", text: "Fundamentos Legais" },
          { id: "rights", text: "Os seus direitos" },
          { id: "retention", text: "Retenção de dados" },
          { id: "transfers", text: "Transferências de dados" },
          { id: "complaints", text: "Reclamações" }
        ]
      },
      sections: {
        badge: {
          title: "Conformidade RGPD:",
          body: "Estamos comprometidos em proteger os seus dados pessoais e respeitar os seus direitos de privacidade ao abrigo do Regulamento Geral sobre a Proteção de Dados."
        },
        controller: {
          title: "Responsável pelo Tratamento de Dados",
          body: "A TERRAfrique LDA (DEVOCEAN Lodge), registada na Rua C, Parcela 12, Maputo 1118, Moçambique, atua como responsável pelo tratamento das suas informações pessoais recolhidas através dos nossos serviços."
        },
        bases: {
          title: "Fundamentos Legais para o Tratamento",
          body: "Tratamos os seus dados pessoais com base nos seguintes fundamentos legais ao abrigo do RGPD:"
        },
        rights: {
          title: "Os seus direitos ao abrigo do RGPD",
          body: "Como titular de dados ao abrigo do RGPD, tem os seguintes direitos relativos aos seus dados pessoais:"
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
          intro: "Se tiver preocupações sobre como tratamos os seus dados pessoais, tem o direito de apresentar uma reclamação à sua autoridade local de proteção de dados.",
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
      updatedDate: "27 set 2025",
      quickLinks: {
        title: "Links rápidos",
        links: [
          { id: "intro", text: "Visão Geral" },
          { id: "contact", text: "Contacto" },
          { id: "emergency", text: "Emergência" }
        ]
      },
      sections: {
        badge: {
          title: "Informações oficiais da empresa:",
          body: "Detalhes completos de registo comercial e informações de contacto para o DEVOCEAN Lodge."
        },
        intro: {
          title: "Visão Geral",
          body: "Dados completos de registo da empresa e informações de contacto para DEVOCEAN Lodge."
        },
        contact: {
          title: "Contacto",
          body: 'Para consultas gerais, reservas e informações sobre os nossos serviços, utilize os dados de contacto fornecidos abaixo.'
        },
        emergency: {
          title: "Contacto de Emergência",
          body: "Para assuntos urgentes fora do horário comercial, utilize os nossos dados de contacto de emergência."
        }
      },
      labels: {
        companyName: "Nome da Empresa",
        registration: "Registo Comercial",
        vat: "Número de IVA (NUIT)",
        license: "Licença Comercial (Alvará)",
        legalForm: "Forma Jurídica",
        capital: "Capital Social",
        address: "Endereço Registado",
        email: "E-mail",
        phone: "Telefone",
        businessHours: "Horário de Funcionamento",
        emergencyPhone: "Telefone de Emergência",
        emergencyEmail: "E-mail de Emergência"
      },
      legalForm: "Sociedade de Responsabilidade Limitada",
      businessHours: "Segunda - Sexta: 8:00 - 18:00<br>Sábado & Domingo: 8:00 - 12:00<br>Receção: 6:00 - 22:00 (para hóspedes)",
      emergencyPhoneNote: "Para assuntos urgentes fora do horário comercial"
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
            body: "Tous les prix sont en EUR sauf indication contraire. Les taux de change sont approximatifs et sujets à changement. Une carte de crédit valide est requise pour garantir votre réservation. Des frais supplémentaires peuvent s'appliquer pour les dépenses accessoires."
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
                  { period: "Dans toutes les autres circonstances", charge: "Aucun remboursement mais le droit de modifier la date d'arrivée une fois à condition de payer la différence si la nouvelle date a un tarif plus élevé." }
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
          title: "Gérer vos préférences de cookies:",
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
            body: "Tutti i prezzi sono in EUR salvo diversa indicazione. I tassi di cambio sono approssimativi e soggetti a variazioni. È richiesta una carta di credito valida per garantire la prenotazione. Potrebbero applicarsi costi aggiuntivi per spese accessorie."
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
                  { period: "In tutte le altre circostanze", charge: "Nessun rimborso ma il diritto di modificare la data di arrivo una volta a condizione di pagare la differenza nel caso in cui la nuova data abbia una tariffa più alta." }
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
          title: "Gestisci le tue preferenze sui cookie:",
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
            body: "Todos los precios están en EUR a menos que se indique lo contrario. Los tipos de cambio son aproximados y están sujetos a cambios. Se requiere una tarjeta de crédito válida para garantizar su reserva. Pueden aplicarse cargos adicionales por gastos imprevistos."
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
                  { period: "En todas las demás circunstancias", charge: "Sin reembolso pero el derecho de modificar la fecha de llegada una vez bajo la condición de pagar la diferencia en caso de que la nueva fecha tenga una tarifa más alta." }
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
          title: "Administrar sus preferencias de cookies:",
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
  
})();
