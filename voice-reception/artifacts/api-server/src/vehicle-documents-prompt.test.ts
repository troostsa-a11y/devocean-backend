import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Vehicle-document guidance", () => {
  const prompt = readFileSync(new URL("./routes/openai.ts", import.meta.url), "utf8");

  it("requires the original and checks registration against the driver's name", () => {
    expect(prompt).toContain("carry the original registration document");
    expect(prompt).toContain("Check whether the registered owner's name matches the driver's name");
    expect(prompt).toContain("Do not present a certified copy alone as a substitute");
  });

  it("requires cross-border owner permission even for fully paid cars", () => {
    expect(prompt).toContain("if the vehicle is NOT registered in the driver's name");
    expect(prompt).toContain("out of South Africa and into Mozambique");
    expect(prompt).toContain("This applies even to a fully paid vehicle");
    expect(prompt).toContain("Bank permission and registered-owner permission are separate checks");
    expect(prompt).toContain("ALWAYS include the registration-name check");
  });

  it("reinforces the rule in registration-paper explanations", () => {
    expect(prompt).toContain("When explaining what a registration paper is");
    expect(prompt).toContain("repeat this driver/owner-name requirement");
  });
});