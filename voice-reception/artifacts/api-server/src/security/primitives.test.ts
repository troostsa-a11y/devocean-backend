import { afterEach, describe, expect, it, vi } from "vitest";
import { secretsEqual } from "./secrets";
import { allowedOrigins, originAllowed, trustedProxies, clientAddress } from "./origins";
import { validateVoiceAudio } from "./audio";
import { RelayBudget, validateRelayMessage } from "./relayMessages";
import { validateToolArguments } from "./tools";
import type { IncomingMessage } from "node:http";

vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
afterEach(() => vi.unstubAllEnvs());

export function wav(seconds = 1, sampleRate = 16_000): Buffer {
  const bytes = seconds * sampleRate * 2;
  const buffer = Buffer.alloc(44 + bytes);
  buffer.write("RIFF", 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36); buffer.writeUInt32LE(bytes, 40);
  return buffer;
}

describe("constant-time secret comparisons and origin boundaries", () => {
  it("accepts the same secret and rejects different lengths, types and prefixes", () => {
    expect(secretsEqual("correct-secret", "correct-secret")).toBe(true);
    for (const candidate of ["", "correct-secre", "correct-secret-longer", "xorrect-secret", null, {}, 42]) {
      expect(secretsEqual(candidate, "correct-secret")).toBe(false);
    }
    expect(secretsEqual("", "")).toBe(false);
  });
  it("allows exact lodge origins only, not wildcard suffixes, null or arbitrary origins", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RECEPTION_ALLOWED_ORIGINS", "");
    expect(originAllowed("https://devoceanlodge.com")).toBe(true);
    for (const origin of [undefined, "null", "https://devoceanlodge.com.evil.test", "http://devoceanlodge.com", "https://evil.test"]) {
      expect(originAllowed(origin)).toBe(false);
    }
    vi.stubEnv("RECEPTION_ALLOWED_ORIGINS", "*");
    expect(() => allowedOrigins()).toThrow();
    vi.stubEnv("RECEPTION_ALLOWED_ORIGINS", "https://widget.example.test/path");
    expect(() => allowedOrigins()).toThrow();
  });
  it("does not trust a forged forwarded IP from a direct public peer", () => {
    vi.stubEnv("RECEPTION_TRUSTED_PROXIES", "loopback");
    const req = { socket: { remoteAddress: "198.51.100.9" }, headers: { "x-forwarded-for": "203.0.113.7" } } as unknown as IncomingMessage;
    expect(clientAddress(req)).toBe("198.51.100.9");
    vi.stubEnv("RECEPTION_TRUSTED_PROXIES", "0.0.0.0/0");
    expect(() => trustedProxies()).toThrow();
  });
});

describe("audio and relay abuse bounds", () => {
  it("accepts measurable PCM WAV and rejects duration, size and format spoofing", () => {
    expect(validateVoiceAudio(wav().toString("base64"))).toEqual(wav());
    expect(validateVoiceAudio(wav(45).toString("base64"))).not.toBeNull();
    expect(validateVoiceAudio(wav(46).toString("base64"))).toBeNull();
    expect(validateVoiceAudio(wav(30, 48_000).toString("base64"))).toBeNull();
    expect(validateVoiceAudio(Buffer.from("not audio").toString("base64"))).toBeNull();
    const forged = wav(); forged.writeUInt32LE(1, 28);
    expect(validateVoiceAudio(forged.toString("base64"))).toBeNull();
    expect(validateVoiceAudio("A".repeat(3_000_000))).toBeNull();
    expect(validateVoiceAudio("AAAA!===")).toBeNull();
  });
  it("only forwards PCM audio and playback acknowledgements", () => {
    expect(validateRelayMessage(JSON.stringify({ type: "input_audio_buffer.append", audio: "AAAAAA==" }))).not.toBeNull();
    expect(validateRelayMessage('{"type":"client.mia_playback_done"}')).not.toBeNull();
    for (const type of ["session.update", "response.create", "conversation.item.create", "input_audio_buffer.commit"]) {
      expect(validateRelayMessage(JSON.stringify({ type }))).toBeNull();
    }
    expect(validateRelayMessage('{"type":"client.mia_playback_done","session":{}}')).toBeNull();
    expect(validateRelayMessage('{"type":"input_audio_buffer.append","audio":"YQ=="}')).toBeNull();
    expect(validateRelayMessage('{"type":"client.mia_playback_done"}', true)).toBeNull();
  });
  it("bounds input volume and frame rate even inside a valid authenticated socket", () => {
    const budget = new RelayBudget();
    const now = Date.now();
    for (let i = 0; i < 30; i++) expect(budget.accept(100, now)).toBe(true);
    expect(budget.accept(100, now)).toBe(false);
    expect(new RelayBudget().accept(128_001, now)).toBe(false);
  });
});

describe("strict tool schemas", () => {
  it("keeps the existing allowed tools and valid guest enquiries working", () => {
    expect(validateToolArguments("get_weather", "{}").ok).toBe(true);
    expect(validateToolArguments("convert_currency", '{"amountUsd":125,"targetCurrency":"rand"}').ok).toBe(true);
    expect(validateToolArguments("save_booking_enquiry", JSON.stringify({
      guestName: "Sample Guest", guestEmail: "guest@example.test", checkIn: "2026-11-01",
      checkOut: "2026-11-04", guests: 2, notes: "A quiet room, please.",
    })).ok).toBe(true);
  });
  it("rejects unknown tools, caller-selected conversation IDs and unsafe arguments", () => {
    const cases: [string, unknown][] = [
      ["__proto__", "{}"], ["constructor", "{}"], ["save_booking_enquiry", '{"guestName":"Guest","conversationId":999}'],
      ["save_booking_enquiry", '{"guestName":"Guest\\r\\nBcc: victim@example.test"}'],
      ["save_booking_enquiry", '{"guestName":"Guest","guestEmail":"not-an-email"}'],
      ["save_booking_enquiry", '{"guestName":"Guest","guests":9999}'],
      ["check_availability", '{"checkIn":"2026-02-30","checkOut":"2026-03-02"}'],
      ["check_availability", '{"checkIn":"2026-11-04","checkOut":"2026-11-01"}'],
      ["check_availability", '{"checkIn":"2026-11-01","checkOut":"2027-11-01"}'],
      ["check_availability", '{"checkIn":"2026-11-01","checkOut":"2026-11-04","numAdults":-3}'],
      ["convert_currency", '{"amountUsd":1000000000,"targetCurrency":"ZAR"}'],
      ["convert_currency", '{"amountUsd":12,"targetCurrency":"constructor"}'],
      ["get_weather", '{"url":"https://evil.test"}'], ["get_weather", "invalid JSON"], ["get_weather", " ".repeat(8193)],
    ];
    for (const [name, args] of cases) expect(validateToolArguments(name, args).ok, String(args)).toBe(false);
  });
});
