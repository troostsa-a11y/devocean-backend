import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
// Resolve both renderer and React from the frontend (the root uses React 18).
const frontendRequire = createRequire(new URL("../../receptionist/package.json", import.meta.url));
const { createElement } = frontendRequire("react");
const { renderToStaticMarkup } = frontendRequire("react-dom/server");
import { MessageContent } from "../../receptionist/src/components/MessageContent";

const render = (text: string, assistant = true) =>
  renderToStaticMarkup(createElement(MessageContent, { text, assistant }));

describe("Shared chat and transcript formatting", () => {
  it("formats old bold numbered options into separate paragraphs", () => {
    const html = render("Two options: 1. **Private taxi**: USD 120. 2. **Hybrid taxi and Chapa**: ask us.");
    expect(html).toContain("<strong>Private taxi</strong>");
    expect(html).toContain("\n\n2.");
    expect(html).not.toContain("**");
  });
  it("preserves paragraphs, currency and ordinary numbered text", () => {
    const html = render("USD 120.50\n\nOption 2: 6:00 AM. \\$120");
    expect(html).toContain("120.50\n\n");
    expect(html).toContain("$120");
    expect(html).not.toContain("\\$");
  });
  it("preserves booking URL parameters", () => {
    const html = render("[Continue with this option](https://devoceanlodge.com/book-direct?adults=6&unit=safari)");
    expect(html).toContain('href="https://devoceanlodge.com/book-direct?adults=6&amp;unit=safari"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it("never interprets HTML or executable links", () => {
    const html = render('<script>alert(1)</script> [unsafe](javascript:alert) [bad](data:text/html,test)');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("href=");
    expect(html).toContain("unsafe");
  });
  it("keeps guest text literal", () => {
    const html = render("**My text**\n\n[not a link](https://example.com)", false);
    expect(html).toContain("**My text**\n\n");
    expect(html).not.toContain("<strong>");
    expect(html).not.toContain("href=");
  });
  it("handles translation and incomplete streaming tokens without crashing", () => {
    expect(render("**Táxi privado**\n\nPreço")).toContain("<strong>Táxi privado</strong>");
    expect(render("**Unfinished [link](")).toContain("Unfinished");
  });
});