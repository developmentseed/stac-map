import { describe, expect, test } from "vitest";
import { formatBbox, GLOBAL_BBOX, sanitizeBbox } from "../../src/utils/bbox";

describe("sanitizeBbox", () => {
  test("returns null for falsy input", () => {
    expect(sanitizeBbox(null as never)).toBeNull();
  });

  test("handles 4-element bbox within valid range", () => {
    expect(sanitizeBbox([-10, -20, 30, 40])).toEqual([-10, -20, 30, 40]);
  });

  test("clamps 4-element bbox to valid range", () => {
    expect(sanitizeBbox([-200, -100, 200, 100])).toEqual([-180, -90, 180, 90]);
  });

  test("handles 6-element bbox (3D) and extracts 2D", () => {
    expect(sanitizeBbox([-10, -20, 0, 30, 40, 100])).toEqual([
      -10, -20, 30, 40,
    ]);
  });

  test("clamps 6-element bbox to valid range", () => {
    expect(sanitizeBbox([-200, -100, 0, 200, 100, 100])).toEqual([
      -180, -90, 180, 90,
    ]);
  });

  test("handles bbox at exact boundaries", () => {
    expect(sanitizeBbox([-180, -90, 180, 90])).toEqual([-180, -90, 180, 90]);
  });
});

describe("formatBbox", () => {
  test("formats bbox with 2 decimal places", () => {
    expect(formatBbox([-10.123, -20.456, 30.789, 40.012])).toBe(
      "-10.12, -20.46, 30.79, 40.01"
    );
  });

  test("formats whole numbers with trailing zeros", () => {
    expect(formatBbox([0, 0, 10, 20])).toBe("0.00, 0.00, 10.00, 20.00");
  });
});

describe("GLOBAL_BBOX", () => {
  test("is the full extent of the world", () => {
    expect(GLOBAL_BBOX).toEqual([-180, -90, 180, 90]);
  });
});
