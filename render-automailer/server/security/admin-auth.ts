import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requireAdminKey: RequestHandler = (req, res, next) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    res.status(503).json({ error: 'Admin API key not configured on server' });
    return;
  }

  const providedKey = req.headers['x-admin-key'];
  if (typeof providedKey !== 'string' || providedKey.length === 0) {
    res.status(401).json({ error: 'Invalid or missing admin API key' });
    return;
  }

  // Hash first so even different-length credentials use fixed-size buffers.
  const providedDigest = createHash('sha256').update(providedKey, 'utf8').digest();
  const expectedDigest = createHash('sha256').update(adminKey, 'utf8').digest();
  if (!timingSafeEqual(providedDigest, expectedDigest)) {
    res.status(401).json({ error: 'Invalid or missing admin API key' });
    return;
  }

  next();
};
