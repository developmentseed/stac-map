import { expect, test } from "vitest";
import { makeStacHrefsAbsolute, toAbsoluteUrl } from "../src/http";
import { StacItem } from "stac-ts";

test("should preserve UTF8 characters while making URLS absolute", async () => {
  expect(toAbsoluteUrl("🦄.tiff", new URL("s3://some-bucket"))).equals(
    "s3://some-bucket/🦄.tiff",
  );
  expect(
    toAbsoluteUrl("https://foo/bar/🦄.tiff", new URL("s3://some-bucket")),
  ).equals("https://foo/bar/🦄.tiff");
  expect(
    toAbsoluteUrl("../../../🦄.tiff", new URL("s3://some-bucket/🌈/path/a/b/")),
  ).equals("s3://some-bucket/🌈/🦄.tiff");

  expect(toAbsoluteUrl("a+🦄.tiff", new URL("s3://some-bucket/🌈/"))).equals(
    "s3://some-bucket/🌈/a+🦄.tiff",
  );

  expect(
    toAbsoluteUrl("../../../🦄.tiff", new URL("https://some-url/🌈/path/a/b/")),
  ).equals("https://some-url/%F0%9F%8C%88/%F0%9F%A6%84.tiff");
  expect(
    toAbsoluteUrl(
      "foo/🦄.tiff?width=1024",
      new URL("https://user@[2601:195:c381:3560::f42a]:1234/test"),
    ),
  ).equals(
    "https://user@[2601:195:c381:3560::f42a]:1234/foo/%F0%9F%A6%84.tiff?width=1024",
  );
});

test("should convert relative links to absolute", () => {
  expect(
    makeStacHrefsAbsolute(
      {
        links: [
          { href: "a/b/c", rel: "child" },
          { href: "/d/e/f", rel: "child" },
        ],
      } as unknown as StacItem,
      "https://example.com/root/item.json",
    ).links,
  ).deep.equals([
    { href: "https://example.com/root/a/b/c", rel: "child" },
    { href: "https://example.com/d/e/f", rel: "child" },
    { href: "https://example.com/root/item.json", rel: "self" },
  ]);
});

test("should convert relative assets to absolute", () => {
  expect(
    makeStacHrefsAbsolute(
      {
        assets: {
          tiff: { href: "./foo.tiff" },
          thumbnail: { href: "../thumbnails/foo.png" },
        },
      } as unknown as StacItem,
      "https://example.com/root/item.json",
    ).assets,
  ).deep.equals({
    tiff: { href: "https://example.com/root/foo.tiff" },
    thumbnail: { href: "https://example.com/thumbnails/foo.png" },
  });
});
