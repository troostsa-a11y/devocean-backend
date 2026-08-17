/**
 * Receptionist keep-alive ping.
 *
 * Runs every 10 minutes via the "Receptionist Keep-Alive" Render cron job.
 * - Pings RECEPTIONIST_URL/api/health.
 * - Exits 0 on success (HTTP 2xx).
 * - On failure (non-2xx or network error) sends an alert email via SMTP
 *   using the same NOTIFY_SMTP_* credentials already configured on the
 *   Receptionist service, then exits 1.
 *
 * Required env vars:
 *   RECEPTIONIST_URL        e.g. https://receptionist-xxxx.onrender.com (no trailing slash)
 *
 * Optional env vars (all must be set for email alerts to fire):
 *   NOTIFY_SMTP_HOST        SMTP server hostname
 *   NOTIFY_SMTP_PORT        SMTP port (default 465)
 *   NOTIFY_SMTP_USER        SMTP username / login
 *   NOTIFY_SMTP_PASS        SMTP password
 *   NOTIFY_EMAIL_FROM       From address
 *   NOTIFY_EMAIL_TO         Recipient address(es), comma-separated
 */

import nodemailer from "nodemailer";

const RECEPTIONIST_URL = process.env.RECEPTIONIST_URL;
if (!RECEPTIONIST_URL) {
  console.error("RECEPTIONIST_URL is not set — aborting.");
  process.exit(1);
}

const healthUrl = RECEPTIONIST_URL.replace(/\/$/, "") + "/api/health";
const timestamp = new Date().toISOString();

// ── Health check ──────────────────────────────────────────────────────────────

let httpStatus = 0;
let ok = false;
let errorMessage = null;

try {
  const response = await fetch(healthUrl, {
    signal: AbortSignal.timeout(15_000),
  });
  httpStatus = response.status;
  ok = response.ok;
  console.log(`[${timestamp}] keep-alive ping ${httpStatus} ${healthUrl}`);
} catch (err) {
  errorMessage = err.message;
  console.error(`[${timestamp}] keep-alive ping FAILED: ${errorMessage}`);
}

if (ok) {
  process.exit(0);
}

// ── Alert ─────────────────────────────────────────────────────────────────────

const statusLine = httpStatus
  ? `HTTP ${httpStatus}`
  : `No response — ${errorMessage ?? "unknown error"}`;

const alertBody = [
  `🚨 Marin receptionist health check FAILED at ${timestamp}`,
  ``,
  `URL:    ${healthUrl}`,
  `Status: ${statusLine}`,
  ``,
  `The service may be down or starting up slowly. Check the Render dashboard:`,
  `https://dashboard.render.com`,
  ``,
  `This alert was sent by the "Receptionist Keep-Alive" cron job.`,
].join("\n");

console.error(alertBody);

const {
  NOTIFY_SMTP_HOST,
  NOTIFY_SMTP_PORT,
  NOTIFY_SMTP_USER,
  NOTIFY_SMTP_PASS,
  NOTIFY_EMAIL_FROM,
  NOTIFY_EMAIL_TO,
} = process.env;

if (
  NOTIFY_SMTP_HOST &&
  NOTIFY_SMTP_USER &&
  NOTIFY_SMTP_PASS &&
  NOTIFY_EMAIL_FROM &&
  NOTIFY_EMAIL_TO
) {
  try {
    const transport = nodemailer.createTransport({
      host: NOTIFY_SMTP_HOST,
      port: Number(NOTIFY_SMTP_PORT ?? 465),
      secure: Number(NOTIFY_SMTP_PORT ?? 465) === 465,
      auth: {
        user: NOTIFY_SMTP_USER,
        pass: NOTIFY_SMTP_PASS,
      },
    });

    await transport.sendMail({
      from: NOTIFY_EMAIL_FROM,
      to: NOTIFY_EMAIL_TO,
      subject: `🚨 ALERT: Marin receptionist is down (${statusLine})`,
      text: alertBody,
    });

    console.log("Alert email sent to", NOTIFY_EMAIL_TO);
  } catch (mailErr) {
    console.error("Failed to send alert email:", mailErr.message);
    // Don't let a mail failure hide the original health-check failure.
  }
} else {
  console.warn(
    "NOTIFY_SMTP_* env vars not fully configured — skipping email alert.",
  );
}

process.exit(1);
