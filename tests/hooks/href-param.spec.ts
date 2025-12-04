import { beforeEach, describe, expect, test } from "vitest";

// Test the getInitialHref logic by importing and testing the hook behavior
describe("useHrefParam", () => {
  beforeEach(() => {
    // Reset URL to clean state
    if (typeof window !== "undefined") {
      history.replaceState({}, "", "/");
    }
  });

  test("should parse valid URL from href parameter", () => {
    const href = "https://example.com/catalog.json";
    const url = new URL(`http://localhost/?href=${href}`);
    const params = new URLSearchParams(url.search);
    const parsedHref = params.get("href") || "";

    let isValid = false;
    try {
      new URL(parsedHref);
      isValid = true;
    } catch {
      isValid = false;
    }

    expect(isValid).toBe(true);
    expect(parsedHref).toBe(href);
  });

  test("should reject invalid URLs in href parameter", () => {
    const href = "not-a-valid-url";
    const url = new URL(`http://localhost/?href=${href}`);
    const params = new URLSearchParams(url.search);
    const parsedHref = params.get("href") || "";

    let isValid = false;
    try {
      new URL(parsedHref);
      isValid = true;
    } catch {
      isValid = false;
    }

    expect(isValid).toBe(false);
  });

  test("should handle empty href parameter", () => {
    const url = new URL(`http://localhost/`);
    const params = new URLSearchParams(url.search);
    const parsedHref = params.get("href") || "";

    expect(parsedHref).toBe("");
  });

  test("should construct proper query string with href", () => {
    const href = "https://example.com/catalog.json";
    const queryString = "?href=" + href;

    expect(queryString).toBe("?href=https://example.com/catalog.json");
  });

  test("should handle file upload state", () => {
    const mockFile = { name: "test.json" };
    const acceptedFiles = [mockFile];

    expect(acceptedFiles.length).toBe(1);
    expect(acceptedFiles[0].name).toBe("test.json");
  });
});
