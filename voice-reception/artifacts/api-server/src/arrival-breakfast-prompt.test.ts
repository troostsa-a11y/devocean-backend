import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Owner-confirmed arrival and breakfast guidance", () => {
  const prompt = readFileSync(new URL("./routes/openai.ts", import.meta.url), "utf8");

  it("separates reception opening hours from check-in and requires notice for every late arrival", () => {
    expect(prompt).toContain("Reception hours: 8:00 AM–6:00 PM");
    expect(prompt).toContain("check-in remains from 2:00 PM");
    expect(prompt).toContain("ALL late arrivals require prior notice");
    expect(prompt).toContain("For an arrival around 7:00 PM, explicitly say there is no surcharge but prior notice is required");
  });

  it("preserves each late-arrival surcharge on the first night", () => {
    expect(prompt).toContain("Until 8:00 PM: no charge");
    expect(prompt).toContain("Between 8:00–10:00 PM: 25% surcharge on the first night's rate");
    expect(prompt).toContain("Between 10:00 PM–midnight: 50% surcharge on the first night's rate");
    expect(prompt).toContain("After midnight: 100% surcharge on the first night's rate");
  });

  it("does not equate the first shift with breakfast readiness or promise takeaway", () => {
    expect(prompt).toContain("first employee shift arrives at 6:00 AM");
    expect(prompt).toContain("earliest breakfast can be served around 6:30 AM, not at 6:00 AM");
    expect(prompt).toContain("NO takeaway, packed or take-away breakfast service");
  });

  it("offers the included breakfast after an excursion, even at lunchtime", () => {
    expect(prompt).toContain("offer breakfast after they return");
    expect(prompt).toContain("There is no breakfast time limit");
    expect(prompt).toContain("included breakfast can also be served as lunch");
    expect(prompt).not.toContain("served 7:30–11:00 AM");
    expect(prompt).toContain("cover both points: no arrival surcharge with prior notice required, and no takeaway breakfast");
  });
});