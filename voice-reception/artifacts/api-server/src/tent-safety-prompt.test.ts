import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Owner-confirmed tent safety guidance", () => {
  const prompt = readFileSync(new URL("./routes/openai.ts", import.meta.url), "utf8");

  it("explicitly says both tent types do not lock", () => {
    expect(prompt).toContain("the Safari Tents and Comfort Tents do NOT lock");
    expect(prompt).toContain("Never claim that the tents have secure locks");
    expect(prompt).toContain("No, our tents do not lock.");
  });

  it("reports the lodge's history without guaranteeing safety or inventing facilities", () => {
    expect(prompt).toContain("incident-free for more than 10 years");
    expect(prompt).toContain("not a guarantee of future safety");
    expect(prompt).toContain("Do not invent security guards, CCTV, safes or secure luggage storage");
    expect(prompt).toContain("Do not infer the lock arrangements for the Chalet or Cottage");
  });
});