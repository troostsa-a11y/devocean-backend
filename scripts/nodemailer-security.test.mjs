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
    assert.equal(manifest.dependencies.nodemailer, "~10.2.1");
    assert.equal(require("nodemailer/package.json").version, "10.2.1");
    if (manifest.dependencies.mailparser) {
      assert.equal(manifest.overrides.nodemailer, "$nodemailer");
    }
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

const rootRequire = createRequire(new URL("../package.json", import.meta.url));
const parserConsumers = [
  ["root", rootRequire],
  ["mailparser", createRequire(rootRequire.resolve("mailparser"))],
  ["receptionist", createRequire(new URL("../voice-reception/artifacts/api-server/package.json", import.meta.url))],
];
const cases = [
  ["quoted angle bracket (GHSA-85x2-q946-cp5h)", '<"a@evil.com>"@good.com>', '"a@evil.com>"@good.com'],
  ["nested comment (GHSA-8c8m-p3m8-cjg8)", "Victim (x(y) <evil@evil.com>) <v@victim.com>", "v@victim.com"],
  ["group comment semicolon (GHSA-m943-m63m-w62w)", "G: (a; <evil@evil.com>) <v@victim.com>;", "v@victim.com"],
  ["group quoted semicolon (GHSA-m943-m63m-w62w)", 'G: "a;" "<evil@evil.com>" <v@victim.com>;', "v@victim.com"],
  ["normal address", "Guest <guest@example.com>", "guest@example.com"],
];

for (const [consumer, require] of parserConsumers) {
  test(`${consumer}: parser resolves the patched dependency`, () => {
    assert.equal(require("nodemailer/package.json").version, "10.2.1");
  });
  for (const [description, input, expected] of cases) {
    test(`${consumer}: ${description}`, async () => {
      const parse = require("nodemailer/lib/addressparser");
      assert.deepEqual(parse(input, { flatten: true }).map(({ address }) => address), [expected]);
      const transport = require("nodemailer").createTransport({ streamTransport: true, buffer: true });
      const message = await transport.sendMail({
        from: "sender@example.com", to: input, subject: "Security regression", text: "Safe body",
      });
      assert.equal(message.envelope.to.length, 1);
      // Envelope normalization can sanitize the local part; the destination domain must not change.
      const domain = address => address.slice(address.lastIndexOf("@") + 1);
      assert.equal(domain(message.envelope.to[0]), domain(expected));
      assert.match(message.message.toString(), /Safe body/);
    });
  }
}

for (const [description, input, expected] of cases) {
  test(`inbound mailparser: ${description}`, async () => {
    const { simpleParser } = rootRequire("mailparser");
    const message = await simpleParser(
      `From: sender@example.com\r\nTo: ${input}\r\nSubject: Regression\r\n\r\nSafe body`,
    );
    const flatten = entries => entries.flatMap(entry => entry.group ? flatten(entry.group) : [entry.address]);
    assert.deepEqual(flatten(message.to.value), [expected]);
  });
}

test("lockfiles contain only patched Nodemailer", () => {
  const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url)));
  for (const [path, pkg] of Object.entries(lock.packages)) {
    if (path.endsWith("node_modules/nodemailer")) assert.equal(pkg.version, "10.2.1", path);
  }
  const workspaceLock = readFileSync(new URL("../voice-reception/pnpm-lock.yaml", import.meta.url), "utf8");
  assert.doesNotMatch(workspaceLock, /nodemailer@10\.(?:0\.16|1\.0)(?:[:(\s]|$)/);
  assert.match(workspaceLock, /nodemailer@10\.2\.1:/);
});
