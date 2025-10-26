import fs from 'fs';
import path from 'path';

/**
 * Email Template Renderer
 * Loads base HTML templates and applies translations + data
 */

interface EmailTranslations {
  [languageCode: string]: {
    [emailType: string]: {
      [key: string]: string;
    };
  };
}

export class EmailTemplateRenderer {
  private translations: EmailTranslations;
  private templatesPath: string;
  private translationsPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'email_templates', 'base');
    this.translationsPath = path.join(process.cwd(), 'email_templates', 'translations', 'email-translations.json');
    this.translations = this.loadTranslations();
  }

  /**
   * Load translations from JSON file
   */
  private loadTranslations(): EmailTranslations {
    try {
      const content = fs.readFileSync(this.translationsPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading email translations:', error);
      return {};
    }
  }

  /**
   * Reload translations (useful for hot-reloading during development)
   */
  reloadTranslations(): void {
    this.translations = this.loadTranslations();
  }

  /**
   * Get language code with fallback
   */
  private getLanguageCode(requestedLang: string): string {
    // Check if exact language exists
    if (this.translations[requestedLang]) {
      return requestedLang;
    }

    // Map to base language codes
    const mapping: { [key: string]: string } = {
      'en-GB': 'en-GB',
      'en-US': 'en-US',
      'pt-PT': 'pt-PT',
      'pt-BR': 'pt-BR',
      'nl-NL': 'en-GB',
      'fr-FR': 'en-GB',
      'it-IT': 'en-GB',
      'de-DE': 'en-GB',
      'es-ES': 'en-GB',
      'sv': 'en-GB',
      'pl': 'en-GB',
      'af-ZA': 'en-GB',
      'zu': 'en-GB',
      'sw': 'en-GB',
      'ja-JP': 'en-GB',
      'zh-CN': 'en-GB',
      'ru': 'en-GB',
    };

    return mapping[requestedLang] || 'en-GB';
  }

  /**
   * Render an email template with translations and data
   */
  render(
    emailType: string,
    language: string,
    data: { [key: string]: any }
  ): { subject: string; html: string } {
    // Get language code with fallback
    const langCode = this.getLanguageCode(language);
    
    // Load base template
    const templatePath = path.join(this.templatesPath, `${emailType}.html`);
    let template: string;
    
    try {
      template = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Error loading template ${emailType}:`, error);
      throw new Error(`Template ${emailType} not found`);
    }

    // Get translations for this email type and language
    const emailTranslations = this.translations[langCode]?.[emailType];
    
    if (!emailTranslations) {
      console.warn(`No translations found for ${emailType} in ${langCode}, using en-GB`);
      const fallbackTranslations = this.translations['en-GB']?.[emailType];
      if (!fallbackTranslations) {
        throw new Error(`No translations found for ${emailType}`);
      }
    }

    const t = emailTranslations || this.translations['en-GB'][emailType];

    // Replace {{t.xxx}} placeholders with translations
    let html = template;
    
    // First pass: Replace translation placeholders
    html = html.replace(/\{\{t\.(\w+)\}\}/g, (match, key) => {
      const translation = t[key];
      if (translation === undefined) {
        console.warn(`Missing translation key: ${key} for ${emailType} in ${langCode}`);
        return match;
      }
      return translation;
    });

    // Second pass: Replace data placeholders (including nested ones in translations)
    html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      if (value === undefined) {
        // Don't warn for {{lang}} as it's replaced separately
        if (key !== 'lang') {
          console.warn(`Missing data key: ${key} for ${emailType}`);
        }
        return match;
      }
      return String(value);
    });

    // Replace {{lang}} with language code
    html = html.replace(/\{\{lang\}\}/g, langCode.split('-')[0] || 'en');

    return {
      subject: t.subject || 'DEVOCEAN Lodge',
      html,
    };
  }

  /**
   * Get available languages for an email type
   */
  getAvailableLanguages(emailType: string): string[] {
    const languages: string[] = [];
    
    for (const [langCode, emails] of Object.entries(this.translations)) {
      if (emails[emailType]) {
        languages.push(langCode);
      }
    }
    
    return languages;
  }

  /**
   * Check if a translation exists
   */
  hasTranslation(emailType: string, language: string): boolean {
    const langCode = this.getLanguageCode(language);
    return !!(this.translations[langCode]?.[emailType]);
  }
}

// Export singleton instance
export const emailTemplateRenderer = new EmailTemplateRenderer();
