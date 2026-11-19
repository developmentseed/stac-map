import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "../src/store";

beforeEach(() => {
  useStore.setState({ bookmarks: [] });
});

describe("bookmarks", () => {
  it("starts empty", () => {
    expect(useStore.getState().bookmarks).toEqual([]);
  });

  it("adds a bookmark for an href", () => {
    useStore.getState().addBookmark("https://example.com/catalog.json");
    expect(useStore.getState().bookmarks).toEqual([
      { href: "https://example.com/catalog.json" },
    ]);
  });

  it("does not duplicate a bookmark for the same href", () => {
    useStore.getState().addBookmark("https://example.com/catalog.json");
    useStore.getState().addBookmark("https://example.com/catalog.json");
    expect(useStore.getState().bookmarks).toEqual([
      { href: "https://example.com/catalog.json" },
    ]);
  });

  it("removes a bookmark by href", () => {
    useStore.getState().addBookmark("https://example.com/catalog.json");
    useStore.getState().removeBookmark("https://example.com/catalog.json");
    expect(useStore.getState().bookmarks).toEqual([]);
  });
});

describe("stacGeoparquetLimit", () => {
  it("defaults to 10,000", () => {
    expect(useStore.getState().stacGeoparquetLimit).toBe(10_000);
  });

  it("can be set", () => {
    useStore.getState().setStacGeoparquetLimit(500);
    expect(useStore.getState().stacGeoparquetLimit).toBe(500);
    useStore.getState().setStacGeoparquetLimit(10_000);
  });
});

describe("setHref", () => {
  it("clears the stac-geoparquet id when the href changes", () => {
    useStore.getState().setHref("https://example.com/a.parquet");
    useStore.getState().setStacGeoparquetId("item-1");
    useStore.getState().setHref("https://example.com/b.parquet");
    expect(useStore.getState().stacGeoparquetId).toBeNull();
  });

  it("clears the stac-geoparquet bbox when the href changes", () => {
    useStore.getState().setHref("https://example.com/a.parquet");
    useStore.getState().setStacGeoparquetBbox([-10, -5, 10, 5]);
    useStore.getState().setHref("https://example.com/b.parquet");
    expect(useStore.getState().stacGeoparquetBbox).toBeNull();
  });

  it("keeps the stac-geoparquet id when the href is unchanged", () => {
    useStore.getState().setHref("https://example.com/a.parquet");
    useStore.getState().setStacGeoparquetId("item-1");
    useStore.getState().setHref("https://example.com/a.parquet");
    expect(useStore.getState().stacGeoparquetId).toBe("item-1");
  });
});
