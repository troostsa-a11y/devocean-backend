import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Resolve the actual logging dependency, not a different ancestor installation.
const require = createRequire(import.meta.url);
const loggingRequire = createRequire(require.resolve("pino-pretty"));
const { copy, copyStrict, createCopier, MaxDepthExceededError } =
  loggingRequire("fast-copy");

describe("fast-copy deep-input protection (GHSA-jggr-w7fw-pc2j)", () => {
  for (const [name, copier] of [
    ["copy", copy],
    ["copyStrict", copyStrict],
  ] as const) {
    for (const kind of ["object", "array"] as const) {
      it(`${name} rejects deeply nested ${kind}s with a bounded error`, () => {
        let input: unknown = null;
        for (let i = 0; i < 10_000; i++) {
          input = kind === "object" ? { child: input } : [input];
        }
        expect(() => copier(input)).toThrow(MaxDepthExceededError);
        expect(() => copier(input)).toThrow(/1000/);
      });
    }

    it(`${name} preserves ordinary data and circular references`, () => {
      const input = { nested: { values: [1, 2, 3] }, self: null as unknown };
      input.self = input;
      const result = copier(input);
      expect(result).not.toBe(input);
      expect(result.nested).not.toBe(input.nested);
      expect(result.nested.values).toEqual([1, 2, 3]);
      expect(result.self).toBe(result);
    });
  }

  it("honors a custom maximum depth", () => {
    const boundedCopy = createCopier({ maxDepth: 5 });
    let input: unknown = null;
    for (let i = 0; i < 20; i++) input = { child: input };
    expect(() => boundedCopy(input)).toThrow(MaxDepthExceededError);
  });
});
