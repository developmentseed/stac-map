import { describe, expect, it } from "vitest";
import { loadCql2Wasm } from "../../src/utils/cql2-wasm";

describe("loadCql2Wasm", () => {
  it("returns the same promise on repeated calls", () => {
    const a = loadCql2Wasm();
    const b = loadCql2Wasm();
    expect(a).toBe(b);
  });

  it("resolves to an initialized module that can parse and render CQL2 text", async () => {
    const module = await loadCql2Wasm();
    const expr = module.parseText("eo:cloud_cover <= 10");
    expect(expr.to_text()).toBe('("eo:cloud_cover" <= 10)');
  });
});
