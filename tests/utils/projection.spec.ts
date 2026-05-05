import { describe, expect, it } from "vitest";
import { resolveInitialProjection } from "../../src/utils/projection";

describe("resolveInitialProjection", () => {
  it("returns globe for ?projection=globe", () => {
    expect(resolveInitialProjection("?projection=globe")).toBe("globe");
  });

  it("returns mercator for ?projection=mercator", () => {
    expect(resolveInitialProjection("?projection=mercator")).toBe("mercator");
  });

  it("returns null for an unrecognized value", () => {
    expect(resolveInitialProjection("?projection=cylindrical")).toBeNull();
  });

  it("returns null when the projection param is absent", () => {
    expect(resolveInitialProjection("?href=foo")).toBeNull();
  });

  it("returns null for an empty search string", () => {
    expect(resolveInitialProjection("")).toBeNull();
  });

  it("reads alongside other params", () => {
    expect(
      resolveInitialProjection(
        "?href=https://example.com/c.json&projection=globe"
      )
    ).toBe("globe");
  });
});
