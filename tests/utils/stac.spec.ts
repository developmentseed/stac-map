import { StacItem } from "stac-ts";
import { expect, test } from "vitest";
import { makeHrefsAbsolute } from "../../src/utils/stac";

test("should convert relative links to absolute", () => {
  expect(
    makeHrefsAbsolute(
      {
        links: [
          { href: "a/b/c", rel: "child" },
          { href: "/d/e/f", rel: "child" },
        ],
      } as unknown as StacItem,
      "https://example.com/root/item.json"
    ).links
  ).deep.equals([
    { href: "https://example.com/root/a/b/c", rel: "child" },
    { href: "https://example.com/d/e/f", rel: "child" },
    { href: "https://example.com/root/item.json", rel: "self" },
  ]);
});

test("should convert relative assets to absolute", () => {
  expect(
    makeHrefsAbsolute(
      {
        assets: {
          tiff: { href: "./foo.tiff" },
          thumbnail: { href: "../thumbnails/foo.png" },
        },
      } as unknown as StacItem,
      "https://example.com/root/item.json"
    ).assets
  ).deep.equals({
    tiff: { href: "https://example.com/root/foo.tiff" },
    thumbnail: { href: "https://example.com/thumbnails/foo.png" },
  });
});
