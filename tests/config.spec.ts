import { describe, expect, it } from "vitest";
import { STAC_GEOPARQUET_ENABLED } from "../src/config";

describe("STAC_GEOPARQUET_ENABLED", () => {
  it("is true when VITE_STAC_GEOPARQUET is unset (test default)", () => {
    expect(STAC_GEOPARQUET_ENABLED).toBe(true);
  });

  it("is a boolean", () => {
    expect(typeof STAC_GEOPARQUET_ENABLED).toBe("boolean");
  });
});
