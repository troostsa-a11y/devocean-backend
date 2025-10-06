(function() {
    'use strict';

    // Enhanced i18n hydrator with error handling and performance optimizations
    class LegalI18nHydrator {
        constructor() {
            this.currentLang = 'en';
            this.dictionary = window.LEGAL_DICT || {};
            this.pageType = null;
            this.isHydrating = false;
            this.retryCount = 0;
            this.maxRetries = 3;
            
            this.init();
        }

        init() {
            try {
                this.detectLanguage();
                this.detectPageType();
                this.setupObservers();
                this.hydratePage();
                this.setupErrorHandling();
            } catch (error) {
                console.error('LegalI18n initialization error:', error);
                this.fallbackToEnglish();
            }
        }

        detectLanguage() {
            try {
                const storedLang = localStorage.getItem('site.lang');
                const browserLang = navigator.language?.split('-')[0];
                
                this.currentLang = storedLang || browserLang || 'en';
                
                // Validate language exists in dictionary
                if (!this.dictionary[this.currentLang]) {
                    console.warn(`Language ${this.currentLang} not found, falling back to English`);
                    this.currentLang = 'en';
                }

                // Update HTML lang attribute
                document.documentElement.setAttribute('lang', this.currentLang);
                
            } catch (error) {
                console.error('Language detection error:', error);
                this.currentLang = 'en';
            }
        }

        detectPageType() {
            try {
                const body = document.body;
                this.pageType = body.getAttribute('data-page');
                
                if (!this.pageType) {
                    console.error('Page type not found in data-page attribute');
                    this.pageType = this.inferPageTypeFromURL();
                }
                
                if (!this.pageType || !this.dictionary[this.currentLang]?.[this.pageType]) {
                    throw new Error(`Page type ${this.pageType} not supported or dictionary missing`);
                }
                
            } catch (error) {
                console.error('Page type detection error:', error);
                this.fallbackToEnglish();
            }
        }

        inferPageTypeFromURL() {
            const path = window.location.pathname;
            const pageMap = {
                'cookies': 'cookies',
                'privacy': 'privacy', 
                'cric': 'cric',
                'gdpr': 'gdpr',
                'terms': 'terms'
            };
            
            for (const [key, value] of Object.entries(pageMap)) {
                if (path.includes(key)) return value;
            }
            
            return 'terms'; // Default fallback
        }

        setupObservers() {
            // Observe DOM changes for dynamic content
            if (typeof MutationObserver !== 'undefined') {
                this.observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            this.hydrateNewNodes(mutation.addedNodes);
                        }
                    });
                });

                this.observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }

            // Listen for language change events
            window.addEventListener('site:languageChange', (event) => {
                if (event.detail && event.detail.lang) {
                    this.changeLanguage(event.detail.lang);
                }
            });
        }

        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                if (event.filename && event.filename.includes('legal-i18n')) {
                    console.error('Legal-i18n runtime error:', event.error);
                    this.fallbackToEnglish();
                }
            });

            // Global error handler for hydration
            window.legalI18nErrorHandler = (error) => {
                console.error('Legal i18n hydration error:', error);
                return true; // Continue with default error handling
            };
        }

        async hydratePage() {
            if (this.isHydrating) {
                console.warn('Hydration already in progress');
                return;
            }

            this.isHydrating = true;
            
            try {
                // Remove loading state after a short delay to ensure DOM is ready
                await this.delay(100);
                
                this.hydrateStaticContent();
                this.hydrateDynamicContent();
                this.hydrateEnhancedSections();
                this.markAsHydrated();
                
                // Remove loading class from body
                document.body.classList.remove('loading');
                
                console.log(`Legal page hydrated in ${this.currentLang}`);
                
            } catch (error) {
                console.error('Page hydration failed:', error);
                this.handleHydrationError(error);
            } finally {
                this.isHydrating = false;
            }
        }

        hydrateStaticContent() {
            // Page title
            this.hydrateElement('[data-role="page-title"]', () => 
                this.getTranslation('pageTitle'));

            // Updated labels
            this.hydrateElement('[data-role="updated-label"]', () => 
                this.getTranslation('updatedLabel'));
            this.hydrateElement('[data-role="updated-date"]', () => 
                this.getTranslation('updatedDate'));

            // Back link accessibility
            const backLink = document.querySelector('[data-role="back-link"]');
            if (backLink && !backLink.getAttribute('aria-label')) {
                backLink.setAttribute('aria-label', this.getTranslation('backToHome', 'Back to home page'));
            }
        }

        hydrateDynamicContent() {
            // Hydrate all sections with data-section attribute
            const sections = document.querySelectorAll('section[data-section]');
            
            sections.forEach(section => {
                const sectionName = section.getAttribute('data-section');
                this.hydrateSection(section, sectionName);
            });
        }

        hydrateEnhancedSections() {
            // Hydrate company information in CRIC page
            this.hydrateCompanyInfo();
            
            // Hydrate additional enhanced content
            this.hydratePolicyCards();
            this.hydrateQuickNav();
        }

        hydrateSection(section, sectionName) {
            try {
                const sectionData = this.getTranslation(`sections.${sectionName}`);
                if (!sectionData) {
                    console.warn(`Section data not found for: ${sectionName}`);
                    return;
                }

                // Hydrate section title
                const titleElement = section.querySelector('[data-part="title"]');
                if (titleElement && sectionData.title) {
                    this.safeSetHTML(titleElement, sectionData.title);
                }

                // Hydrate section body
                const bodyElement = section.querySelector('[data-part="body"]');
                if (bodyElement && sectionData.body) {
                    const useHTML = bodyElement.getAttribute('data-use-html') === 'true';
                    if (useHTML) {
                        this.safeSetHTML(bodyElement, sectionData.body);
                    } else {
                        this.safeSetText(bodyElement, sectionData.body);
                    }
                }

                // Hydrate section items (lists)
                const itemsElement = section.querySelector('[data-part="items"]');
                if (itemsElement && sectionData.items) {
                    this.hydrateList(itemsElement, sectionData.items);
                }

                // Hydrate additional data attributes
                this.hydrateDataAttributes(section, sectionData);

                // Mark as hydrated
                section.classList.add('hydrated');

            } catch (error) {
                console.error(`Error hydrating section ${sectionName}:`, error);
            }
        }

        hydrateCompanyInfo() {
            if (this.pageType !== 'cric') return;

            const companyInfo = document.querySelector('[data-company-details]');
            if (!companyInfo) return;

            const sectionData = this.getTranslation('sections.intro');
            if (!sectionData) return;

            // Hydrate company details
            const selectors = {
                '[data-part="company-name-label"]': 'companyNameLabel',
                '[data-part="company-name"]': 'companyName',
                '[data-part="registration-label"]': 'registrationLabel',
                '[data-part="registration-number"]': 'registrationNumber',
                '[data-part="vat-label"]': 'vatLabel',
                '[data-part="vat-number"]': 'vatNumber',
                '[data-part="legal-form-label"]': 'legalFormLabel',
                '[data-part="legal-form"]': 'legalForm',
                '[data-part="capital-label"]': 'capitalLabel',
                '[data-part="capital-amount"]': 'capitalAmount',
                '[data-part="address-label"]': 'addressLabel',
                '[data-part="company-address"]': 'companyAddress',
                '[data-part="email-label"]': 'emailLabel',
                '[data-part="company-email"]': 'companyEmail',
                '[data-part="phone-label"]': 'phoneLabel',
                '[data-part="company-phone"]': 'companyPhone',
                '[data-part="business-hours-label"]': 'businessHoursLabel',
                '[data-part="business-hours"]': 'businessHours'
            };

            Object.entries(selectors).forEach(([selector, dataKey]) => {
                const element = document.querySelector(selector);
                if (element && sectionData[dataKey]) {
                    this.safeSetText(element, sectionData[dataKey]);
                }
            });
        }

        hydratePolicyCards() {
            // Hydrate any policy cards or enhanced content
            const policyCards = document.querySelectorAll('.policy-card h3, .right-card h3, .data-category h3');
            policyCards.forEach(card => {
                // These are handled by the main section hydration
                // This method is reserved for future enhancements
            });
        }

        hydrateQuickNav() {
            // Quick nav is primarily structural, but we can enhance accessibility
            const quickNav = document.querySelector('.quick-nav');
            if (quickNav) {
                const navLabel = quickNav.getAttribute('aria-label') || this.getTranslation('quickNav', 'Quick navigation');
                quickNav.setAttribute('aria-label', navLabel);
            }
        }

        hydrateList(container, items) {
            if (!container || !items || !Array.isArray(items)) return;

            // Clear existing content but preserve structure
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            // Create new list items
            items.forEach(item => {
                const li = document.createElement('li');
                this.safeSetText(li, item);
                container.appendChild(li);
            });
        }

        hydrateDataAttributes(element, data) {
            // Hydrate any data-* attributes from translation data
            if (!data || typeof data !== 'object') return;

            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith('data-')) {
                    element.setAttribute(key, value);
                }
            });
        }

        hydrateNewNodes(nodes) {
            nodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if it's a section that needs hydration
                    if (node.matches && node.matches('section[data-section]')) {
                        const sectionName = node.getAttribute('data-section');
                        this.hydrateSection(node, sectionName);
                    }
                    
                    // Check children as well
                    const sections = node.querySelectorAll && node.querySelectorAll('section[data-section]');
                    if (sections) {
                        sections.forEach(section => {
                            const sectionName = section.getAttribute('data-section');
                            this.hydrateSection(section, sectionName);
                        });
                    }
                }
            });
        }

        hydrateElement(selector, getTextFn) {
            const element = document.querySelector(selector);
            if (element) {
                try {
                    const text = getTextFn();
                    if (text) {
                        this.safeSetText(element, text);
                    }
                } catch (error) {
                    console.error(`Error hydrating element ${selector}:`, error);
                }
            }
        }

        safeSetText(element, text) {
            if (element && text) {
                element.textContent = text;
            }
        }

        safeSetHTML(element, html) {
            if (element && html) {
                // Basic sanitization - in production, use a proper sanitizer
                const temp = document.createElement('div');
                temp.innerHTML = html;
                element.innerHTML = temp.innerHTML;
            }
        }

        getTranslation(path, fallback = '') {
            try {
                const keys = path.split('.');
                let value = this.dictionary[this.currentLang]?.[this.pageType];
                
                for (const key of keys) {
                    value = value?.[key];
                    if (value === undefined) break;
                }
                
                return value !== undefined ? value : fallback;
            } catch (error) {
                console.error(`Translation error for path ${path}:`, error);
                return fallback;
            }
        }

        markAsHydrated() {
            // Mark all hydrated elements for potential re-hydration detection
            const hydratedElements = document.querySelectorAll('[data-part]');
            hydratedElements.forEach(el => {
                el.classList.add('hydrated');
            });
            
            // Dispatch custom event for any external listeners
            window.dispatchEvent(new CustomEvent('legal:i18nHydrated', {
                detail: { lang: this.currentLang, page: this.pageType }
            }));
        }

        async changeLanguage(newLang) {
            if (this.currentLang === newLang) return;
            
            try {
                // Show loading state
                document.body.classList.add('loading');
                
                // Update language
                this.currentLang = newLang;
                localStorage.setItem('site.lang', newLang);
                document.documentElement.setAttribute('lang', newLang);
                
                // Re-hydrate page
                await this.hydratePage();
                
                console.log(`Language changed to ${newLang}`);
                
            } catch (error) {
                console.error('Language change failed:', error);
                this.fallbackToEnglish();
            }
        }

        handleHydrationError(error) {
            this.retryCount++;
            
            if (this.retryCount <= this.maxRetries) {
                console.warn(`Retrying hydration (attempt ${this.retryCount})`);
                setTimeout(() => this.hydratePage(), 500 * this.retryCount);
            } else {
                console.error('Max retries reached, falling back to English');
                this.fallbackToEnglish();
            }
        }

        fallbackToEnglish() {
            this.currentLang = 'en';
            document.documentElement.setAttribute('lang', 'en');
            this.hydratePage().catch(() => {
                console.error('Even fallback to English failed');
                document.body.classList.remove('loading');
            });
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Public method for external language changes
        setLanguage(lang) {
            this.changeLanguage(lang);
        }

        // Public method to get current language
        getCurrentLanguage() {
            return this.currentLang;
        }

        // Cleanup method
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
            window.removeEventListener('site:languageChange', this.boundLanguageHandler);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.legalI18n = new LegalI18nHydrator();
        });
    } else {
        window.legalI18n = new LegalI18nHydrator();
    }

    // Global setSiteLocale function for backward compatibility
    window.setSiteLocale = function(opts) {
        if (opts && opts.lang && window.legalI18n) {
            window.legalI18n.setLanguage(opts.lang);
        }
    };

})();