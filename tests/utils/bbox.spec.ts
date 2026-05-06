import { describe, expect, it } from "vitest";
import { resolveInitialBbox } from "../../src/utils/bbox";

describe("resolveInitialBbox", () => {
  it("returns the parsed bbox for a valid bbox param", () => {
    expect(resolveInitialBbox("?bbox=-180,-90,180,90")).toEqual([
      -180, -90, 180, 90,
    ]);
  });

  it("supports decimals", () => {
    expect(resolveInitialBbox("?bbox=-1.5,2.25,3,4.75")).toEqual([
      -1.5, 2.25, 3, 4.75,
    ]);
  });

  it("returns null when the bbox param is absent", () => {
    expect(resolveInitialBbox("?href=foo")).toBeNull();
  });

  it("returns null for an empty search string", () => {
    expect(resolveInitialBbox("")).toBeNull();
  });

  it("returns null for fewer than four values", () => {
    expect(resolveInitialBbox("?bbox=1,2,3")).toBeNull();
  });

  it("returns null for more than four values", () => {
    expect(resolveInitialBbox("?bbox=1,2,3,4,5")).toBeNull();
  });

  it("returns null when any value is not a number", () => {
    expect(resolveInitialBbox("?bbox=1,2,3,foo")).toBeNull();
  });

  it("reads alongside other params", () => {
    expect(
      resolveInitialBbox("?href=https://example.com/c.json&bbox=-10,-20,10,20")
    ).toEqual([-10, -20, 10, 20]);
  });
});
