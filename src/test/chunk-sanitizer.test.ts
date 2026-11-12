/**
 * Regression tests for the production chunk sanitizer.
 *
 * Guards the exact corrupt shapes rolldown emitted into lazy chunks
 * (`void <hash>`, `[]<hash>`, call-glued hash), which shipped as
 * `SyntaxError: Invalid or unexpected token` in the deployed app and broke
 * lazy-route hydration (React #422). Each corrupt fixture must fail to parse
 * before sanitizing and parse after.
 */
import vm from "node:vm";
import { describe, expect, it } from "vitest";

import { sanitizeChunkCode } from "../../scripts/sanitize-chunks";

function expectSyntaxError(code: string): void {
  expect(() => new vm.Script(code)).toThrow(SyntaxError);
}

function expectParses(code: string): void {
  expect(() => new vm.Script(code)).not.toThrow();
}

describe("sanitizeChunkCode", () => {
  it("repairs void-hash preload args", () => {
    const corrupt = "r(()=>Promise.resolve().then(()=>Td),void 04bedec92a4544ca3893d202f19c0ba4b)";
    expectSyntaxError(corrupt);

    const { code, repaired, repairs } = sanitizeChunkCode(corrupt);
    expect(repaired).toBe(true);
    expect(repairs).toContain("void-hash");
    expect(code).toBe("r(()=>Promise.resolve().then(()=>Td),void 0)");
    expectParses(code);
  });

  it("repairs empty-deps glued hashes", () => {
    const corrupt = "n(()=>Promise.resolve().then(()=>X),[]a48a1654276701d575f476280f2bcd58)";
    expectSyntaxError(corrupt);

    const { code, repaired, repairs } = sanitizeChunkCode(corrupt);
    expect(repaired).toBe(true);
    expect(repairs).toContain("empty-deps-hash");
    expect(code).toBe("n(()=>Promise.resolve().then(()=>X),[])");
    expectParses(code);
  });

  it("repairs hashes glued onto mapDeps calls", () => {
    const corrupt = "r(fn,__vite__mapDeps([0,1])abcdef0123456789abcdef)";
    expectSyntaxError(corrupt);

    const { code, repaired, repairs } = sanitizeChunkCode(corrupt);
    expect(repaired).toBe(true);
    expect(repairs).toContain("glued-hash");
    expect(code).toBe("r(fn,__vite__mapDeps([0,1]))");
    expectParses(code);
  });

  it("leaves healthy code untouched", () => {
    const healthy = [
      "r(fn,__vite__mapDeps([0,1,2]))",
      "r(fn,__vite__mapDeps([]))",
      "x(void 0)",
      "y([])",
      "z([1,2,3])",
    ];
    for (const code of healthy) {
      expectParses(code);
      const result = sanitizeChunkCode(code);
      expect(result.repaired).toBe(false);
      expect(result.code).toBe(code);
    }
  });
});
