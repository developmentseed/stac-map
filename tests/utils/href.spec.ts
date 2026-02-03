import { describe, expect, test } from "vitest";
import { isUrl, toAbsoluteUrl } from "../../src/utils/href";

describe("isUrl", () => {
  test("returns true for valid http URL", () => {
    expect(isUrl("http://example.com")).toBe(true);
  });

  test("returns true for valid https URL", () => {
    expect(isUrl("https://example.com/path")).toBe(true);
  });

  test("returns true for s3 URL", () => {
    expect(isUrl("s3://bucket/key")).toBe(true);
  });

  test("returns false for relative path", () => {
    expect(isUrl("./relative/path")).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isUrl("")).toBe(false);
  });

  test("returns false for plain text", () => {
    expect(isUrl("not a url")).toBe(false);
  });
});

describe("toAbsoluteUrl", () => {
  test("returns absolute URL unchanged", () => {
    expect(
      toAbsoluteUrl(
        "https://example.com/file.json",
        new URL("https://other.com")
      )
    ).toBe("https://example.com/file.json");
  });

  test("resolves relative path against base URL", () => {
    expect(
      toAbsoluteUrl("./child.json", new URL("https://example.com/root/"))
    ).toBe("https://example.com/root/child.json");
  });

  test("resolves parent path against base URL", () => {
    expect(
      toAbsoluteUrl(
        "../sibling.json",
        new URL("https://example.com/root/child/")
      )
    ).toBe("https://example.com/root/sibling.json");
  });

  test("handles s3 URLs", () => {
    expect(toAbsoluteUrl("file.parquet", new URL("s3://bucket/prefix/"))).toBe(
      "s3://bucket/prefix/file.parquet"
    );
  });

  test("preserves UTF8 characters while making URLs absolute", () => {
    expect(toAbsoluteUrl("🦄.tiff", new URL("s3://some-bucket"))).equals(
      "s3://some-bucket/🦄.tiff"
    );
    expect(
      toAbsoluteUrl("https://foo/bar/🦄.tiff", new URL("s3://some-bucket"))
    ).equals("https://foo/bar/🦄.tiff");
    expect(
      toAbsoluteUrl(
        "../../../🦄.tiff",
        new URL("s3://some-bucket/🌈/path/a/b/")
      )
    ).equals("s3://some-bucket/🌈/🦄.tiff");

    expect(toAbsoluteUrl("a+🦄.tiff", new URL("s3://some-bucket/🌈/"))).equals(
      "s3://some-bucket/🌈/a+🦄.tiff"
    );

    expect(
      toAbsoluteUrl(
        "../../../🦄.tiff",
        new URL("https://some-url/🌈/path/a/b/")
      )
    ).equals("https://some-url/%F0%9F%8C%88/%F0%9F%A6%84.tiff");
    expect(
      toAbsoluteUrl(
        "foo/🦄.tiff?width=1024",
        new URL("https://user@[2601:195:c381:3560::f42a]:1234/test")
      )
    ).equals(
      "https://user@[2601:195:c381:3560::f42a]:1234/foo/%F0%9F%A6%84.tiff?width=1024"
    );
  });
});
