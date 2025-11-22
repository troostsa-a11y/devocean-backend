/**
 * Shared reCAPTCHA utility - ensures consistent site key resolution
 * Used by both ContactSection and ExperienceInquiryForm
 */

/**
 * Get reCAPTCHA token for form submission
 * @param {string} action - The action name (e.g., 'contact_form', 'experience_inquiry')
 * @returns {Promise<string>} The reCAPTCHA token
 */
export async function getRecaptchaToken(action) {
  // Ensure reCAPTCHA is loaded
  if (!window.grecaptcha && window.loadRecaptcha) {
    await window.loadRecaptcha();
  }

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA not loaded');
  }

  // Get reCAPTCHA token with timeout
  const recaptchaToken = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('reCAPTCHA timeout - please refresh the page and try again'));
    }, 10000); // 10 second timeout

    window.grecaptcha.ready(async () => {
      try {
        // CRITICAL: Always check import.meta.env FIRST, then window
        // Never use hardcoded fallback keys
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || window.RECAPTCHA_SITE_KEY;
        
        if (!siteKey) {
          throw new Error('reCAPTCHA site key not found');
        }

        const token = await window.grecaptcha.execute(siteKey, { action });
        clearTimeout(timeout);
        resolve(token);
      } catch (error) {
        clearTimeout(timeout);
        console.error('reCAPTCHA execution error:', error);
        reject(error);
      }
    });
  });

  return recaptchaToken;
}
