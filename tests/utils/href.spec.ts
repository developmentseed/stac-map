import { describe, expect, it } from "vitest";
import { toAbsoluteUrl } from "../../src/utils/href";

describe("toAbsoluteUrl", () => {
  it("returns absolute http URLs unchanged", () => {
    const base = new URL("https://example.com/catalog.json");
    expect(toAbsoluteUrl("https://other.com/foo.json", base)).toBe(
      "https://other.com/foo.json"
    );
  });

  it("resolves relative URLs against the base", () => {
    const base = new URL("https://example.com/catalog/catalog.json");
    expect(toAbsoluteUrl("./item.json", base)).toBe(
      "https://example.com/catalog/item.json"
    );
  });

  it("resolves parent-directory paths", () => {
    const base = new URL("https://example.com/a/b/catalog.json");
    expect(toAbsoluteUrl("../sibling.json", base)).toBe(
      "https://example.com/a/sibling.json"
    );
  });

  it("returns absolute s3 URLs unchanged and decoded", () => {
    const base = new URL("https://example.com/catalog.json");
    expect(toAbsoluteUrl("s3://bucket/key with space.json", base)).toBe(
      "s3://bucket/key with space.json"
    );
  });
});
