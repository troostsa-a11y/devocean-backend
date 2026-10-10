import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Resolve from each consumer, including standalone Render packages. Tests use
// in-memory transports only: no real SMTP credentials or outgoing mail.
const consumers = [
  "../package.json",
  "../render-automailer/package.json",
  "../render-keepalive/package.json",
  "../voice-reception/artifacts/api-server/package.json",
];

for (const consumer of consumers) {
  const url = new URL(consumer, import.meta.url);
  const require = createRequire(url);
  const nodemailer = require("nodemailer");

  test(`${consumer}: patched dependency is declared and resolved`, () => {
    const manifest = JSON.parse(readFileSync(url, "utf8"));
    assert.equal(manifest.dependencies.nodemailer, "~10.0.16");
    assert.equal(require("nodemailer/package.json").version, "10.0.16");
  });

  test(`${consumer}: compose booking and alert mail without sending it`, async () => {
    const transport = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      newline: "unix",
    });
    const result = await transport.sendMail({
      from: { name: "DEVOCEAN Lodge", address: "booking@example.com" },
      to: "Guest <guest@example.com>",
      bcc: "admin@example.com",
      subject: "Booking confirmation",
      text: "Your booking is confirmed.",
      html: "<p>Your booking is confirmed.</p>",
      attachments: [{ filename: "booking.txt", content: "Booking details" }],
    });
    assert.deepEqual(result.envelope.to, ["guest@example.com", "admin@example.com"]);
    assert.equal(result.envelope.from, "booking@example.com");
    const message = result.message.toString();
    assert.match(message, /Subject: Booking confirmation/);
    assert.match(message, /Your booking is confirmed\./);
    assert.match(message, /filename=booking\.txt/);
  });

  test(`${consumer}: raw content cannot bypass disabled file access`, async () => {
    const transport = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await assert.rejects(
      transport.sendMail({
        from: "booking@example.com",
        to: "guest@example.com",
        raw: { path: url.pathname },
      }),
      /File access rejected/,
    );
  });
}
