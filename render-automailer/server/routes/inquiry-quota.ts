import type { Request, Response } from 'express';

export function createInquiryQuotaHandler(database: () => {
  reserveInquirySend: (ip: string, email: string, operatorEmail?: string) => Promise<number>;
} | undefined) {
  // Mount only behind requireAdminKey. The trusted Pages function, not a public
  // browser, supplies the client IP and validated recipient identities.
  return async (req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    const { ip, email, operatorEmail } = req.body || {};
    const validEmail = (value: unknown) => typeof value === 'string' && value.length <= 254 &&
      /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(value);
    if (typeof ip !== 'string' || !ip || ip.length > 64 || !validEmail(email) ||
        (operatorEmail !== undefined && !validEmail(operatorEmail))) {
      return res.status(400).json({ error: 'Invalid inquiry identity.' });
    }
    try {
      const db = database();
      if (!db) throw new Error('Inquiry database unavailable');
      const retryAfter = await db.reserveInquirySend(ip, email, operatorEmail);
      if (retryAfter) {
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: 'Too many inquiries.' });
      }
      return res.json({ allowed: true });
    } catch {
      return res.status(503).json({ error: 'Inquiry quota unavailable.' });
    }
  };
}
