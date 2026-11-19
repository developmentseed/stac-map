import { describe, expect, it } from "vitest";
import {
  idFromFragment,
  idToFragment,
  toAbsoluteUrl,
} from "../../src/utils/href";

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

describe("idFromFragment", () => {
  it("returns null for an empty fragment", () => {
    expect(idFromFragment("")).toBeNull();
    expect(idFromFragment("#")).toBeNull();
  });

  it("decodes the fragment", () => {
    expect(idFromFragment("#S2A_T01%2Fitem%20one")).toBe("S2A_T01/item one");
  });

  it("returns malformed fragments as-is", () => {
    expect(idFromFragment("#100%")).toBe("100%");
  });
});

describe("idToFragment", () => {
  it("returns an empty string for no id", () => {
    expect(idToFragment(null)).toBe("");
  });

  it("round trips through idFromFragment", () => {
    const id = "S2A_T01/item one#2";
    expect(idFromFragment(idToFragment(id))).toBe(id);
  });
});
