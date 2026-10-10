type RelayMessage = { type: "input_audio_buffer.append"; audio: string } | { type: "client.mia_playback_done" };

// The browser may send mic data and playback acknowledgements only. In
// particular, it cannot change models/tools/prompts, fabricate tool output,
// insert transcript items, or request arbitrary responses.
export function validateRelayMessage(raw: string, binary = false): RelayMessage | null {
  if (binary || Buffer.byteLength(raw) > 32 * 1024) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || Array.isArray(value) || typeof value !== "object") return null;
    if (value.type === "client.mia_playback_done" && Object.keys(value).length === 1) return value;
    if (value.type !== "input_audio_buffer.append" || Object.keys(value).length !== 2 ||
      typeof value.audio !== "string" || value.audio.length === 0 || value.audio.length > 22_000 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.audio)) return null;
    const bytes = Buffer.from(value.audio, "base64").length;
    return bytes > 0 && bytes % 2 === 0 ? value : null;
  } catch { return null; }
}

export class RelayBudget {
  private started = Date.now();
  private windowStarted = this.started;
  private messages = 0;
  private bytes = 0;
  private totalBytes = 0;

  accept(bytes: number, now = Date.now()): boolean {
    if (now - this.windowStarted >= 1000) {
      this.windowStarted = now;
      this.messages = 0;
      this.bytes = 0;
    }
    this.messages++;
    this.bytes += bytes;
    this.totalBytes += bytes;
    // 24 kHz mono PCM16 is ~64 KB/s encoded; allow reasonable jitter, but
    // never let an attacker send minutes of audio faster than real time.
    return this.messages <= 30 && this.bytes <= 128_000 &&
      this.totalBytes <= 128_000 + Math.max(0, now - this.started) * 100;
  }
}
