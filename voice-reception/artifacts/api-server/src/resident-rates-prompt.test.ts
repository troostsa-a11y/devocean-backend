import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("Resident-rate prompt policy", () => {
  const prompt = readFileSync(new URL("./routes/openai.ts", import.meta.url), "utf8");
  it("states the confirmed lodge policy without ruling out unrelated discounts", () => {
    expect(prompt).toContain("currently does not offer SADC resident rates");
    expect(prompt).toContain("or country of residence");
    expect(prompt).toContain("or say there are no discounts of any kind");
  });
  it("treats the guest's original question as pricing, not an ambiguous help request", () => {
    expect(prompt).toContain('"Can you assist me with SADC rates?" is specific enough to answer directly');
    expect(prompt).toContain('accommodation-pricing questions, not visa or border-entry questions');
  });
  it("keeps visa guidance separate and does not invent a resident price", () => {
    expect(prompt).toContain('Do not use visa-free entry information to answer "SADC rates"');
    expect(prompt).toContain("Do not invent a SADC price");
  });
  it("shares the policy with the voice relay", () => {
    const relay = readFileSync(new URL("./routes/openaiRealtimeRelay.ts", import.meta.url), "utf8");
    expect(relay).toContain("instructions: buildSystemPrompt(lang, currency)");
  });
});