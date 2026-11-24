import { describe, expect, it } from "vitest";
import {
  bboxIntersectsViewport,
  clampToGlobalExtents,
  normalizeViewport,
  resolveInitialBbox,
} from "../../src/utils/bbox";

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

describe("clampToGlobalExtents", () => {
  it("leaves a bbox within global extents unchanged", () => {
    expect(clampToGlobalExtents([-10, -20, 10, 20])).toEqual([
      -10, -20, 10, 20,
    ]);
  });

  it("clamps a west edge beyond -180", () => {
    expect(clampToGlobalExtents([-300, -20, 10, 20])).toEqual([
      -180, -20, 10, 20,
    ]);
  });

  it("clamps an east edge beyond 180", () => {
    expect(clampToGlobalExtents([-10, -20, 400, 20])).toEqual([
      -10, -20, 180, 20,
    ]);
  });

  it("clamps a south edge beyond -90", () => {
    expect(clampToGlobalExtents([-10, -150, 10, 20])).toEqual([
      -10, -90, 10, 20,
    ]);
  });

  it("clamps a north edge beyond 90", () => {
    expect(clampToGlobalExtents([-10, -20, 10, 150])).toEqual([
      -10, -20, 10, 90,
    ]);
  });

  it("clamps all four edges at once", () => {
    expect(clampToGlobalExtents([-300, -150, 400, 150])).toEqual([
      -180, -90, 180, 90,
    ]);
  });
});

describe("normalizeViewport", () => {
  it("returns a viewport within bounds unchanged", () => {
    expect(normalizeViewport([-10, -5, 10, 5])).toEqual([[-10, -5, 10, 5]]);
  });

  it("returns null when the viewport spans every longitude", () => {
    expect(normalizeViewport([-200, -80, 200, 80])).toBeNull();
  });

  it("clamps latitudes", () => {
    expect(normalizeViewport([-10, -100, 10, 100])).toEqual([
      [-10, -90, 10, 90],
    ]);
  });

  it("shifts a wrapped viewport back into bounds", () => {
    expect(normalizeViewport([190, 0, 200, 10])).toEqual([[-170, 0, -160, 10]]);
  });

  it("splits a viewport crossing the antimeridian", () => {
    expect(normalizeViewport([170, 0, 190, 10])).toEqual([
      [170, 0, 180, 10],
      [-180, 0, -170, 10],
    ]);
    expect(normalizeViewport([-190, 0, -170, 10])).toEqual([
      [170, 0, 180, 10],
      [-180, 0, -170, 10],
    ]);
  });
});

describe("bboxIntersectsViewport", () => {
  const samoa = [-172.8, -14.1, -171.4, -13.4];
  const fiji = [177, -19, -178, -16];

  it("matches a plain overlap and rejects a plain miss", () => {
    expect(bboxIntersectsViewport(samoa, [-180, -20, -160, -10])).toBe(true);
    expect(bboxIntersectsViewport(samoa, [0, 40, 10, 50])).toBe(false);
  });

  it("matches a bbox on the far side of a viewport panned past 180", () => {
    expect(bboxIntersectsViewport(samoa, [150, -30, 200, 0])).toBe(true);
  });

  it("matches a bbox on the far side of a viewport panned past -180", () => {
    expect(
      bboxIntersectsViewport([170, -20, 179, -10], [-200, -30, -150, 0])
    ).toBe(true);
  });

  it("handles a bbox that itself crosses the antimeridian", () => {
    expect(bboxIntersectsViewport(fiji, [-179, -20, -170, -10])).toBe(true);
    expect(bboxIntersectsViewport(fiji, [178, -20, 179, -10])).toBe(true);
    expect(bboxIntersectsViewport(fiji, [0, -20, 10, -10])).toBe(false);
  });

  it("reads the horizontal extent of a 3D bbox", () => {
    expect(
      bboxIntersectsViewport([10, 40, 0, 11, 41, 100], [10.5, 40.5, 12, 42])
    ).toBe(true);
  });

  it("matches everything when the viewport spans every longitude", () => {
    expect(bboxIntersectsViewport(samoa, [-300, -80, 300, 80])).toBe(true);
  });
});
