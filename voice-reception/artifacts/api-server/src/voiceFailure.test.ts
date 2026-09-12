import { describe, expect, it } from "vitest";
import { voiceFailure } from "../../../lib/integrations-openai-ai-react/src/audio/voiceFailure";
import { readFileSync } from "node:fs";

describe("Safe voice fallback diagnostics", () => {
  it.each([
    ["NotAllowedError", "microphone_permission"],
    ["SecurityError", "microphone_permission"],
    ["NotFoundError", "microphone_missing"],
    ["NotReadableError", "microphone_busy"],
    ["TypeError", "microphone_unavailable"],
  ])("classifies %s without exposing raw messages", (name, code) => {
    const error = new Error("PRIVATE provider detail");
    error.name = name;
    const message = voiceFailure(error, "microphone");
    expect(message).toContain(`[${code}]`);
    expect(message).not.toContain("PRIVATE");
    expect(message).toContain("text");
  });
  it("distinguishes audio initialization from service errors", () => {
    expect(voiceFailure(new Error("private"), "audio")).toContain("[audio_initialization]");
    expect(voiceFailure(new Error("private"), "service")).toContain("[voice_service_error]");
  });
  it("keeps fallback diagnostics in the recorded automatic message", () => {
    const loader = readFileSync("../receptionist/public/widget-loader.js", "utf8");
    expect(loader).toContain("[Automatic voice fallback — not written by the guest]");
    expect(loader).toContain("detail.slice(0, 500)");
    expect(loader).toContain("_startVoiceTimer(45000)");
    expect(loader).toContain("evt.source !== voiceFrame.contentWindow");
  });
});