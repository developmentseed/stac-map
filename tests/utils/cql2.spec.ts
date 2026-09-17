import { describe, expect, it } from "vitest";
import { buildCql2Json } from "../../src/utils/cql2";
import { loadCql2Wasm } from "../../src/utils/cql2-wasm";

describe("buildCql2Json", () => {
  it("returns undefined for an empty queryables map", () => {
    expect(buildCql2Json({})).toBeUndefined();
  });

  it("builds a single equality clause", () => {
    expect(buildCql2Json({ "pl:item_type": { eq: "PSScene" } })).toEqual({
      op: "=",
      args: [{ property: "pl:item_type" }, "PSScene"],
    });
  });

  it("builds a single gte clause", () => {
    expect(buildCql2Json({ "eo:cloud_cover": { gte: 5 } })).toEqual({
      op: ">=",
      args: [{ property: "eo:cloud_cover" }, 5],
    });
  });

  it("builds a single lte clause", () => {
    expect(buildCql2Json({ "eo:cloud_cover": { lte: 10 } })).toEqual({
      op: "<=",
      args: [{ property: "eo:cloud_cover" }, 10],
    });
  });

  it("ands a min/max range for a single property", () => {
    expect(buildCql2Json({ "eo:cloud_cover": { gte: 5, lte: 10 } })).toEqual({
      op: "and",
      args: [
        { op: ">=", args: [{ property: "eo:cloud_cover" }, 5] },
        { op: "<=", args: [{ property: "eo:cloud_cover" }, 10] },
      ],
    });
  });

  it("ands clauses across multiple properties", () => {
    expect(
      buildCql2Json({
        "eo:cloud_cover": { lte: 10 },
        "pl:item_type": { eq: "PSScene" },
      })
    ).toEqual({
      op: "and",
      args: [
        { op: "<=", args: [{ property: "eo:cloud_cover" }, 10] },
        { op: "=", args: [{ property: "pl:item_type" }, "PSScene"] },
      ],
    });
  });

  it("produces JSON that cql2-wasm can parse and render as CQL2 text", async () => {
    const cql2Wasm = await loadCql2Wasm();
    const json = buildCql2Json({
      "eo:cloud_cover": { lte: 10 },
      "pl:item_type": { eq: "PSScene" },
    });
    const text = cql2Wasm.parseJson(JSON.stringify(json)).to_text();
    expect(text).toBe(
      '(("eo:cloud_cover" <= 10) AND ("pl:item_type" = \'PSScene\'))'
    );
  });
});
