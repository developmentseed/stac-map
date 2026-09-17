import { describe, expect, it } from "vitest";
import { resolveInitialSearchParams } from "../../src/utils/search-params";

describe("resolveInitialSearchParams", () => {
  it("returns null when no relevant params are present", () => {
    expect(resolveInitialSearchParams("?href=foo")).toBeNull();
  });

  it("returns null for an empty search string", () => {
    expect(resolveInitialSearchParams("")).toBeNull();
  });

  it("parses a datetime range", () => {
    expect(
      resolveInitialSearchParams(
        "?datetime=2024-01-01T00:00:00Z/2024-06-15T12:00:00Z"
      )
    ).toEqual({
      startDatetime: "2024-01-01T00:00:00",
      endDatetime: "2024-06-15T12:00:00",
    });
  });

  it("omits an open start or end from a datetime range", () => {
    expect(
      resolveInitialSearchParams("?datetime=../2024-06-15T12:00:00Z")
    ).toEqual({ endDatetime: "2024-06-15T12:00:00" });
  });

  it("parses a bbox", () => {
    expect(resolveInitialSearchParams("?bbox=-10,-20,10,20")).toEqual({
      bbox: [-10, -20, 10, 20],
    });
  });

  it("parses a limit", () => {
    expect(resolveInitialSearchParams("?limit=50")).toEqual({ limit: "50" });
  });

  it("parses queryables", () => {
    expect(
      resolveInitialSearchParams(
        `?queryables=${encodeURIComponent(
          JSON.stringify({ "eo:cloud_cover": { lte: 10 } })
        )}`
      )
    ).toEqual({ queryables: { "eo:cloud_cover": { lte: 10 } } });
  });

  it("ignores invalid JSON in queryables", () => {
    expect(resolveInitialSearchParams("?queryables=not-json")).toBeNull();
  });

  it("combines multiple params", () => {
    expect(
      resolveInitialSearchParams(
        "?bbox=-10,-20,10,20&datetime=2024-01-01T00:00:00Z/..&limit=25"
      )
    ).toEqual({
      bbox: [-10, -20, 10, 20],
      startDatetime: "2024-01-01T00:00:00",
      limit: "25",
    });
  });
});
