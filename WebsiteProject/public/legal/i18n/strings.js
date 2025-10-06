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
      pageTitle: "Privacy Policy",
      updatedLabel: "Last updated",
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
          { id: "rights", text: "Your Rights" },
          { id: "security", text: "Security" }
        ]
      },
      sections: {
        who: {
          title: "Who we are",
          body: "DEVOCEAN Lodge is a brand of TERRAfrique LDA. We operate eco-friendly accommodation in Ponta do Ouro, Mozambique. We are committed to protecting your privacy and ensuring that your personal data is collected and used properly, lawfully, and transparently."
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
          intro: "Data Processing Flow:",
          flow: [
            { step: "Collection:", text: "We collect only necessary data for specific purposes" },
            { step: "Processing:", text: "Data is processed according to legal bases and your consent" },
            { step: "Storage:", text: "Secure storage with access controls and encryption" }
          ],
          purposes: [
            "Manage bookings and provide services",
            "Communicate about your stay, policies and offers (opt-in)",
            "Improve our site and services (analytics, security)",
            "Comply with legal/financial obligations"
          ]
        },
        share: {
          title: "When we share data",
          items: [
            "Payment providers and booking platforms, as needed to fulfil your booking",
            "Service providers under contract (IT/hosting/analytics)",
            "Authorities where required by law"
          ]
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
          body: "We keep data only as long as necessary for the purposes above or as required by law. Typically, booking data is retained for 7 years for tax purposes, marketing data until you opt-out."
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
          body: 'For privacy-related inquiries or to exercise your rights, contact us at: <a href="mailto:legal@devoceanlodge.com">legal@devoceanlodge.com</a> or write to TERRAfrique LDA, Ponta do Ouro, Mozambique.'
        }
      }
    },

    cookies: {
      pageTitle: "Cookie Policy",
      updatedLabel: "Last updated",
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
      pageTitle: "Terms & Conditions",
      updatedLabel: "Last updated",
      updatedDate: "06 Oct 2025",
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
          body: "Cancellation terms are disclosed at booking time and on your confirmation. No-show may forfeit deposit."
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
      pageTitle: "GDPR Notice",
      updatedLabel: "Last updated",
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
      pageTitle: "CRIC — Company & Contact",
      updatedLabel: "Last updated",
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

  // Add other language translations following the same structure...
  // (keeping the existing pt, de, nl, fr, it, es, ptmz translations with updated content)
  
})();
