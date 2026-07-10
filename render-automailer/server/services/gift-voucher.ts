/**
 * Gift voucher helpers: code generation + purchaser email.
 *
 * Codes are generated server-side after Stripe payment confirmation.
 * Format: GV-XXXX-XXXX-XXXX (no ambiguous chars 0/O/1/I).
 */

import nodemailer from 'nodemailer';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateVoucherCode(): string {
  const group = () =>
    Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
  return `GV-${group()}-${group()}-${group()}`;
}

export interface VoucherEmailOpts {
  to: string;
  purchaserName: string;
  recipientName?: string;
  message?: string;
  code: string;
  amountUsd: number;
  expiresAt: Date;
  siteUrl: string;
}

export async function sendVoucherEmail(opts: VoucherEmailOpts): Promise<void> {
  const host = process.env.MAIL_HOST;
  const portRaw = parseInt(process.env.MAIL_PORT || '465', 10);
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn('[GIFT_VOUCHER] SMTP not configured — skipping voucher email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: portRaw,
    secure: portRaw === 465,
    auth: { user, pass },
  });

  const expiryStr = opts.expiresAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const recipientLine = opts.recipientName
    ? `<p style="margin:0 0 12px;color:#444;font-family:sans-serif;font-size:15px">
         This voucher is for <strong>${opts.recipientName}</strong>.
       </p>`
    : '';

  const messageLine = opts.message
    ? `<blockquote style="border-left:3px solid #9e4b13;margin:12px 0 20px;padding:8px 16px;color:#555;font-style:italic;font-family:Georgia,serif">
         ${opts.message}
       </blockquote>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:Georgia,serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <div style="background:#9e4b13;padding:32px 40px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:.5px">DEVOCEAN Lodge</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;font-family:sans-serif;text-transform:uppercase;letter-spacing:1px">Gift Voucher</p>
    </div>
    <div style="padding:36px 40px">
      <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a">Dear ${opts.purchaserName},</p>
      <p style="margin:0 0 20px;color:#444;line-height:1.6;font-family:sans-serif;font-size:15px">
        Thank you for your purchase. Your DEVOCEAN Lodge gift voucher for
        <strong>$${opts.amountUsd} USD</strong> is ready to use.
      </p>
      ${recipientLine}
      ${messageLine}
      <div style="margin:28px 0;padding:24px;background:#f5f0ea;border-radius:8px;text-align:center">
        <p style="margin:0 0 8px;font-size:11px;color:#9e4b13;text-transform:uppercase;letter-spacing:2px;font-family:sans-serif;font-weight:600">Your Voucher Code</p>
        <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:5px;color:#1a1a1a;font-family:'Courier New',monospace">${opts.code}</p>
        <p style="margin:14px 0 0;font-size:12px;color:#666;font-family:sans-serif">Valid until ${expiryStr}</p>
      </div>
      <p style="margin:0 0 24px;color:#555;line-height:1.6;font-family:sans-serif;font-size:14px">
        To redeem, enter the code in the <strong>Gift Voucher Code</strong> field when booking
        your stay at DEVOCEAN Lodge.
      </p>
      <div style="text-align:center">
        <a href="${opts.siteUrl}/book-direct"
           style="display:inline-block;background:#9e4b13;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-family:sans-serif;font-weight:600;font-size:15px">
          Book Your Stay
        </a>
      </div>
      <p style="margin:36px 0 0;font-size:11px;color:#aaa;text-align:center;font-family:sans-serif;line-height:1.8">
        DEVOCEAN Lodge &middot; Ponta do Ouro, Mozambique<br>
        <a href="${opts.siteUrl}" style="color:#9e4b13;text-decoration:none">${opts.siteUrl.replace(/^https?:\/\//, '')}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"DEVOCEAN Lodge" <${user}>`,
    to: opts.to,
    subject: `Your DEVOCEAN Lodge Gift Voucher — $${opts.amountUsd}`,
    html,
  });
}
