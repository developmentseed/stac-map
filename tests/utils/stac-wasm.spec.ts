import { describe, expect, it } from "vitest";
import { loadStacWasm, warmStacWasm } from "../../src/utils/stac-wasm";

describe("loadStacWasm", () => {
  it("returns the same promise on repeated calls", () => {
    const a = loadStacWasm();
    const b = loadStacWasm();
    expect(a).toBe(b);
  });

  it("resolves to a module exposing stacJsonToParquet and arrowToStacJson", async () => {
    const module = await loadStacWasm();
    expect(typeof module.stacJsonToParquet).toBe("function");
    expect(typeof module.arrowToStacJson).toBe("function");
  });
});

describe("warmStacWasm", () => {
  it("does not throw when requestIdleCallback is undefined", () => {
    const original = (globalThis as { requestIdleCallback?: unknown })
      .requestIdleCallback;
    delete (globalThis as { requestIdleCallback?: unknown })
      .requestIdleCallback;
    try {
      expect(() => warmStacWasm()).not.toThrow();
    } finally {
      (globalThis as { requestIdleCallback?: unknown }).requestIdleCallback =
        original;
    }
  });

  it("does not throw when requestIdleCallback is available", () => {
    expect(() => warmStacWasm()).not.toThrow();
  });
});
