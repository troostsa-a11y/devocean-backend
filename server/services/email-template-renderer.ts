import fs from 'fs';
import path from 'path';

/**
 * Email Template Renderer
 * Loads base HTML templates and applies translations + data
 * Now uses separate translation files per email type for better maintainability
 */

interface TemplateTranslations {
  [languageCode: string]: {
    [key: string]: string;
  };
}

interface TranslationCache {
  [emailType: string]: TemplateTranslations;
}

export class EmailTemplateRenderer {
  private translationCache: TranslationCache;
  private templatesPath: string;
  private translationsPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'email_templates', 'base');
    this.translationsPath = path.join(process.cwd(), 'email_templates', 'translations');
    this.translationCache = {};
  }

  /**
   * Load translations for a specific email type from its dedicated file
   */
  private loadTranslationsForType(emailType: string): TemplateTranslations {
    // Check cache first
    if (this.translationCache[emailType]) {
      return this.translationCache[emailType];
    }

    try {
      const translationFile = path.join(this.translationsPath, `${emailType}-translations.json`);
      const content = fs.readFileSync(translationFile, 'utf-8');
      const translations = JSON.parse(content);
      
      // Cache the loaded translations
      this.translationCache[emailType] = translations;
      
      return translations;
    } catch (error) {
      console.error(`Error loading translations for ${emailType}:`, error);
      return {};
    }
  }

  /**
   * Reload translations (useful for hot-reloading during development)
   */
  reloadTranslations(): void {
    this.translationCache = {};
  }

  /**
   * Get language code with fallback
   * Checks if language exists in the loaded translations, otherwise returns mapped fallback
   */
  private getLanguageCode(requestedLang: string, translations: TemplateTranslations): string {
    // Check if exact language exists in loaded translations
    if (translations[requestedLang]) {
      return requestedLang;
    }

    // Map 2-letter ISO codes to full locale codes, and handle other variations
    const mapping: { [key: string]: string } = {
      // 2-letter codes (from email parser)
      'EN': 'en-GB',
      'DE': 'de-DE',
      'PT': 'pt-PT',
      'ES': 'es-ES',
      'FR': 'fr-FR',
      'IT': 'it-IT',
      'NL': 'nl-NL',
      'SV': 'sv',
      'PL': 'pl',
      'AF': 'af-ZA',
      'ZU': 'zu',
      'SW': 'sw',
      'JA': 'ja-JP',
      'ZH': 'zh-CN',
      'RU': 'ru',
      
      // Full locale codes (legacy support)
      'en-GB': 'en-GB',
      'en-US': 'en-US',
      'pt-PT': 'pt-PT',
      'pt-BR': 'pt-BR',
      'nl-NL': 'nl-NL',
      'fr-FR': 'fr-FR',
      'it-IT': 'it-IT',
      'de-DE': 'de-DE',
      'es-ES': 'es-ES',
      'sv': 'sv',
      'pl': 'pl',
      'af-ZA': 'af-ZA',
      'zu': 'zu',
      'sw': 'sw',
      'ja-JP': 'ja-JP',
      'zh-CN': 'zh-CN',
      'ru': 'ru',
    };

    const mappedLang = mapping[requestedLang] || 'en-GB';
    
    // Check if mapped language exists
    if (translations[mappedLang]) {
      return mappedLang;
    }

    // Final fallback to en-GB
    return 'en-GB';
  }

  /**
   * Select gendered greeting based on guest gender
   * Returns gender-specific greeting if available, otherwise returns neutral greeting
   */
  private selectGenderedGreeting(translations: any, gender?: 'male' | 'female' | null): string {
    // If no gender provided or unknown, use neutral greeting
    if (!gender) {
      return translations.greetingNeutral || translations.greeting || '';
    }
    
    // Use gender-specific greeting if available
    if (gender === 'male' && translations.greetingMale) {
      return translations.greetingMale;
    }
    
    if (gender === 'female' && translations.greetingFemale) {
      return translations.greetingFemale;
    }
    
    // Fallback to neutral or generic greeting
    return translations.greetingNeutral || translations.greeting || '';
  }

  /**
   * Render an email template with translations and data
   */
  render(
    emailType: string,
    language: string,
    data: { [key: string]: any }
  ): { subject: string; html: string } {
    // Load translations for this email type
    const translations = this.loadTranslationsForType(emailType);
    
    if (!translations || Object.keys(translations).length === 0) {
      throw new Error(`No translations found for email type: ${emailType}`);
    }

    // Get language code with fallback
    const langCode = this.getLanguageCode(language, translations);
    
    // Load base template
    const templatePath = path.join(this.templatesPath, `${emailType}.html`);
    let template: string;
    
    try {
      template = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Error loading template ${emailType}:`, error);
      throw new Error(`Template ${emailType} not found`);
    }

    // Get translations for the selected language
    const t = translations[langCode];
    
    if (!t) {
      console.warn(`No translations found for ${emailType} in ${langCode}, using en-GB`);
      const fallbackTranslations = translations['en-GB'];
      if (!fallbackTranslations) {
        throw new Error(`No translations found for ${emailType} in any language`);
      }
    }

    const emailTranslations = t || translations['en-GB'];
    
    // Handle gendered greetings
    const gender = data.gender as 'male' | 'female' | null | undefined;
    const selectedGreeting = this.selectGenderedGreeting(emailTranslations, gender);
    
    // Add selected greeting to translations
    emailTranslations.greeting = selectedGreeting;

    // Build complete replacement data (translations + data)
    const allReplacements: { [key: string]: string } = {};
    
    // Add all translation keys with 't.' prefix
    for (const [key, value] of Object.entries(emailTranslations)) {
      allReplacements[`t.${key}`] = value;
    }
    
    // Add all data keys
    for (const [key, value] of Object.entries(data)) {
      allReplacements[key] = String(value);
    }
    
    // Add language code
    allReplacements['lang'] = langCode.split('-')[0] || 'en';
    
    // Replace all placeholders in template
    let html = template;
    
    // Keep replacing until no more placeholders are found
    // This handles nested placeholders like {{t.greeting}} containing {{guestName}}
    let previousHtml = '';
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops
    
    while (html !== previousHtml && iterations < maxIterations) {
      previousHtml = html;
      
      html = html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = allReplacements[key];
        if (value === undefined) {
          // Don't warn on first iteration for nested placeholders
          if (iterations > 0) {
            console.warn(`Missing placeholder: ${key} for ${emailType} in ${langCode}`);
          }
          return match;
        }
        return value;
      });
      
      iterations++;
    }
    
    if (iterations >= maxIterations) {
      console.warn(`Max iterations reached for ${emailType} - possible circular reference`);
    }

    return {
      subject: emailTranslations.subject || 'DEVOCEAN Lodge',
      html,
    };
  }

  /**
   * Get available languages for an email type
   */
  getAvailableLanguages(emailType: string): string[] {
    const translations = this.loadTranslationsForType(emailType);
    return Object.keys(translations);
  }

  /**
   * Check if a translation exists
   */
  hasTranslation(emailType: string, language: string): boolean {
    const translations = this.loadTranslationsForType(emailType);
    const langCode = this.getLanguageCode(language, translations);
    return !!(translations[langCode]);
  }
}

// Export singleton instance
export const emailTemplateRenderer = new EmailTemplateRenderer();
