const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
const MAX_AUDIO_SECONDS = 45;

// Legacy recorded voice is PCM WAV (the browser already converts to WAV).
// Restricting to this measurable format avoids compressed files containing
// hours of billable audio and avoids spawning ffmpeg for attacker input.
export function validateVoiceAudio(base64: unknown): Buffer | null {
  if (typeof base64 !== "string" || base64.length === 0 || base64.length % 4 !== 0 ||
    base64.length > Math.ceil(MAX_AUDIO_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) return null;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length < 44 || buffer.length > MAX_AUDIO_BYTES ||
    buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE" ||
    buffer.readUInt32LE(4) !== buffer.length - 8) return null;
  let byteRate = 0;
  let dataBytes = 0;
  let foundData = false;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > buffer.length) return null;
    if (type === "fmt ") {
      if (size < 16 || byteRate !== 0 || buffer.readUInt16LE(start) !== 1) return null;
      const channels = buffer.readUInt16LE(start + 2);
      const sampleRate = buffer.readUInt32LE(start + 4);
      const bits = buffer.readUInt16LE(start + 14);
      byteRate = buffer.readUInt32LE(start + 8);
      if (channels < 1 || channels > 2 || sampleRate < 8000 || sampleRate > 48000 || bits !== 16 ||
        byteRate !== sampleRate * channels * 2 || buffer.readUInt16LE(start + 12) !== channels * 2) return null;
    } else if (type === "data") {
      if (foundData) return null;
      foundData = true;
      dataBytes = size;
    }
    offset = start + size + (size % 2);
  }
  return byteRate > 0 && dataBytes > 0 && dataBytes / byteRate <= MAX_AUDIO_SECONDS ? buffer : null;
}
