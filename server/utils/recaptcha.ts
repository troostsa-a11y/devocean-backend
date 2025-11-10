/**
 * reCAPTCHA Verification Utility
 * Handles Google reCAPTCHA v3 verification securely
 */

interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export class RecaptchaVerifier {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  /**
   * Verify a reCAPTCHA token
   * @param token The reCAPTCHA response token
   * @param expectedAction Optional expected action (v3 Enterprise only)
   * @param minScore Minimum acceptable score (default: 0.3)
   * @returns Promise<{ success: boolean; score?: number; error?: string }>
   */
  async verify(
    token: string,
    expectedAction?: string,
    minScore: number = 0.3
  ): Promise<{ success: boolean; score?: number; error?: string }> {
    if (!token) {
      return { success: false, error: 'reCAPTCHA token required' };
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${this.secretKey}&response=${token}`,
      });

      const result: RecaptchaResult = await response.json();

      if (!result.success) {
        console.error('reCAPTCHA verification failed:', result['error-codes']);
        return { success: false, error: 'reCAPTCHA verification failed' };
      }

      // Check action if provided (Enterprise only)
      if (expectedAction && result.action && result.action !== expectedAction) {
        console.warn('reCAPTCHA action mismatch:', result.action, 'expected:', expectedAction);
        return { success: false, error: 'Invalid security token' };
      }

      // Check score if available (v3)
      if (result.score !== undefined && result.score < minScore) {
        console.warn('reCAPTCHA score too low (bot detected):', result.score);
        return { success: false, error: 'Security verification failed. Please try again.' };
      }

      return { success: true, score: result.score };
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return { success: false, error: 'Failed to verify security token' };
    }
  }
}
