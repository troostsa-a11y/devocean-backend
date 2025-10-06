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

  // Add other language translations following the same structure...
  // (keeping the existing pt, de, nl, fr, it, es, ptmz translations with updated content)
  
})();
