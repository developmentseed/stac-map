import type { StacCollection, StacItem } from "stac-ts";
import { describe, expect, test } from "vitest";
import type { AssetWithAlternates, StacValue } from "../../src/types/stac";
import {
  collectionToFeature,
  conformsToFreeTextCollectionSearch,
  getAssetScore,
  getBandCount,
  getBbox,
  getBestAsset,
  getBestAssetFromSortedList,
  getCollectionDatetimes,
  getCollectionExtents,
  getGeotiffHref,
  getLink,
  getLinkHref,
  getSelfHref,
  getStacValueId,
  getStacValueTitle,
  getStacValueType,
  getThumbnailAsset,
  isCollectionInBbox,
  isCollectionInDatetimes,
  isGeotiff,
  isGlobalBbox,
  isGlobalCollection,
  makeHrefsAbsolute,
  sortAssets,
} from "../../src/utils/stac";

function makeCollection(id: string): StacCollection {
  return {
    type: "Collection",
    stac_version: "1.0.0",
    id,
    description: "Test collection",
    license: "MIT",
    extent: {
      spatial: { bbox: [[-180, -90, 180, 90]] },
      temporal: {
        interval: [["2020-01-01T00:00:00Z", "2021-01-01T00:00:00Z"]],
      },
    },
    links: [],
  };
}

function makeItem(id: string): StacItem {
  return {
    type: "Feature",
    stac_version: "1.0.0",
    id,
    geometry: { type: "Point", coordinates: [0, 0] },
    bbox: [-1, -1, 1, 1],
    properties: { datetime: "2020-01-01T00:00:00Z" },
    links: [],
    assets: {},
  };
}

describe("getStacValueTitle", () => {
  test("returns title if present", () => {
    const collection = { ...makeCollection("test"), title: "My Title" };
    expect(getStacValueTitle(collection)).toBe("My Title");
  });

  test("falls back to id if no title", () => {
    expect(getStacValueTitle(makeCollection("test-id"))).toBe("test-id");
  });
});

describe("getStacValueId", () => {
  test("returns id if present", () => {
    expect(getStacValueId(makeCollection("my-id"))).toBe("my-id");
  });

  test("falls back to type if no id", () => {
    const value = { type: "Collection" } as StacValue;
    expect(getStacValueId(value)).toBe("Collection");
  });
});

describe("getStacValueType", () => {
  test("returns Collection for Collection type", () => {
    expect(getStacValueType(makeCollection("test"))).toBe("Collection");
  });

  test("returns Item for Feature type", () => {
    expect(getStacValueType(makeItem("test"))).toBe("Item");
  });

  test("returns Catalog for Catalog type", () => {
    const catalog = { type: "Catalog" } as StacValue;
    expect(getStacValueType(catalog)).toBe("Catalog");
  });

  test("returns Item collection for FeatureCollection type", () => {
    const featureCollection = { type: "FeatureCollection" } as StacValue;
    expect(getStacValueType(featureCollection)).toBe("Item collection");
  });
});

describe("getLink", () => {
  test("finds link by rel", () => {
    const value = {
      links: [
        { href: "http://example.com/self", rel: "self" },
        { href: "http://example.com/root", rel: "root" },
      ],
    };
    expect(getLink(value, "root")).toEqual({
      href: "http://example.com/root",
      rel: "root",
    });
  });

  test("returns undefined if link not found", () => {
    const value = { links: [{ href: "http://example.com/self", rel: "self" }] };
    expect(getLink(value, "parent")).toBeUndefined();
  });

  test("returns undefined if links is undefined", () => {
    expect(getLink({}, "self")).toBeUndefined();
  });
});

describe("getLinkHref", () => {
  test("returns href of matching link", () => {
    const value = { links: [{ href: "http://example.com/self", rel: "self" }] };
    expect(getLinkHref(value, "self")).toBe("http://example.com/self");
  });

  test("returns undefined if link not found", () => {
    const value = { links: [] };
    expect(getLinkHref(value, "self")).toBeUndefined();
  });
});

describe("getSelfHref", () => {
  test("returns self link href", () => {
    const item = makeItem("test");
    item.links = [{ href: "http://example.com/item.json", rel: "self" }];
    expect(getSelfHref(item)).toBe("http://example.com/item.json");
  });
});

describe("getThumbnailAsset", () => {
  test("returns thumbnail asset if it has http href", () => {
    const item = makeItem("test");
    item.assets = {
      thumbnail: { href: "http://example.com/thumb.png" },
    };
    expect(getThumbnailAsset(item)).toEqual({
      href: "http://example.com/thumb.png",
    });
  });

  test("returns undefined if thumbnail has non-http href", () => {
    const item = makeItem("test");
    item.assets = {
      thumbnail: { href: "s3://bucket/thumb.png" },
    };
    expect(getThumbnailAsset(item)).toBeFalsy();
  });

  test("returns undefined if no thumbnail asset", () => {
    const item = makeItem("test");
    item.assets = { data: { href: "http://example.com/data.tiff" } };
    expect(getThumbnailAsset(item)).toBeUndefined();
  });

  test("returns thumbnail asset if it has thumbnail role", () => {
    const item = makeItem("test");
    item.assets = {
      foo: { href: "http://example.com/thumb.png", roles: ["thumbnail"] },
    };
    expect(getThumbnailAsset(item)).toEqual({
      href: "http://example.com/thumb.png",
      roles: ["thumbnail"],
    });
  });

  test("returns thumbnail asset if it has thumbnails key", () => {
    // https://github.com/englacial/xopr/issues/64
    const item = makeItem("test");
    item.assets = {
      thumbnails: {
        href: "http://example.com/thumb.png",
      },
    };
    expect(getThumbnailAsset(item)).toEqual({
      href: "http://example.com/thumb.png",
    });
  });
});

describe("makeHrefsAbsolute", () => {
  test("converts relative links to absolute", () => {
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

  test("converts relative assets to absolute", () => {
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

  test("adds self link if not present", () => {
    const result = makeHrefsAbsolute(
      { links: [] } as unknown as StacItem,
      "https://example.com/item.json"
    );
    expect(result.links).toContainEqual({
      href: "https://example.com/item.json",
      rel: "self",
    });
  });

  test("creates links array if undefined", () => {
    const result = makeHrefsAbsolute(
      {} as unknown as StacItem,
      "https://example.com/item.json"
    );
    expect(result.links).toEqual([
      { href: "https://example.com/item.json", rel: "self" },
    ]);
  });
});

describe("isCollectionInBbox", () => {
  test("returns true when collection bbox partially overlaps with filter bbox", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -10, 5, 5]];
    expect(isCollectionInBbox(collection, [0, 0, 10, 10], false)).toBe(true);
  });

  test("returns false when collection bbox does not overlap", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -10, -5, -5]];
    expect(isCollectionInBbox(collection, [10, 10, 20, 20], false)).toBe(false);
  });

  test("returns false when collection completely contains filter bbox", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-20, -20, 20, 20]];
    expect(isCollectionInBbox(collection, [-5, -5, 5, 5], false)).toBe(false);
  });

  test("returns true for global bbox", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -10, 10, 10]];
    expect(isCollectionInBbox(collection, [-180, -90, 180, 90], false)).toBe(
      true
    );
  });

  test("returns true for global collection when includeGlobalCollections is true", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-180, -90, 180, 90]];
    expect(isCollectionInBbox(collection, [10, 10, 20, 20], true)).toBe(true);
  });

  test("returns false for global collection when includeGlobalCollections is false", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-180, -90, 180, 90]];
    expect(isCollectionInBbox(collection, [10, 10, 20, 20], false)).toBe(false);
  });
});

describe("isGlobalCollection", () => {
  test("returns true for collection with global bbox", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-180, -90, 180, 90]];
    expect(isGlobalCollection(collection)).toBe(true);
  });

  test("returns false for collection with regional bbox", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -10, 10, 10]];
    expect(isGlobalCollection(collection)).toBe(false);
  });
});

describe("isGlobalBbox", () => {
  test("returns true for global bbox", () => {
    expect(isGlobalBbox([-180, -90, 180, 90])).toBe(true);
  });

  test("returns false for regional bbox", () => {
    expect(isGlobalBbox([-10, -10, 10, 10])).toBe(false);
  });

  test("handles bbox that exceeds world bounds", () => {
    expect(isGlobalBbox([-200, -100, 200, 100])).toBe(true);
  });
});

describe("getCollectionExtents", () => {
  test("extracts spatial extent from collection", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -20, 30, 40]];
    expect(getCollectionExtents(collection)).toEqual([-10, -20, 30, 40]);
  });
});

describe("conformsToFreeTextCollectionSearch", () => {
  test("returns false for non-Catalog", () => {
    expect(conformsToFreeTextCollectionSearch(makeCollection("test"))).toBe(
      false
    );
  });

  test("returns false for Catalog without conformsTo", () => {
    const catalog = {
      type: "Catalog",
      stac_version: "1.0.0",
      id: "test",
      description: "Test",
      links: [],
    } as StacValue;
    expect(conformsToFreeTextCollectionSearch(catalog)).toBe(false);
  });

  test("returns true for Catalog that conforms to free-text collection search", () => {
    const catalog = {
      type: "Catalog",
      stac_version: "1.0.0",
      id: "test",
      description: "Test",
      links: [],
      conformsTo: [
        "https://api.stacspec.org/v1.0.0/collection-search#free-text",
      ],
    } as StacValue;
    expect(conformsToFreeTextCollectionSearch(catalog)).toBe(true);
  });
});

describe("getCollectionDatetimes", () => {
  test("extracts start and end datetimes", () => {
    const collection = makeCollection("test");
    collection.extent.temporal.interval = [
      ["2020-01-01T00:00:00Z", "2021-12-31T00:00:00Z"],
    ];
    const result = getCollectionDatetimes(collection);
    expect(result.start).toEqual(new Date("2020-01-01T00:00:00Z"));
    expect(result.end).toEqual(new Date("2021-12-31T00:00:00Z"));
  });

  test("handles null end datetime", () => {
    const collection = makeCollection("test");
    collection.extent.temporal.interval = [["2020-01-01T00:00:00Z", null]];
    const result = getCollectionDatetimes(collection);
    expect(result.start).toEqual(new Date("2020-01-01T00:00:00Z"));
    expect(result.end).toBeNull();
  });
});

describe("isCollectionInDatetimes", () => {
  test("returns true when collection overlaps date range", () => {
    const collection = makeCollection("test");
    collection.extent.temporal.interval = [
      ["2020-01-01T00:00:00Z", "2021-01-01T00:00:00Z"],
    ];
    expect(
      isCollectionInDatetimes(
        collection,
        new Date("2020-06-01"),
        new Date("2020-12-01")
      )
    ).toBe(true);
  });

  test("returns false when collection ends before date range", () => {
    const collection = makeCollection("test");
    collection.extent.temporal.interval = [
      ["2019-01-01T00:00:00Z", "2019-12-31T00:00:00Z"],
    ];
    expect(
      isCollectionInDatetimes(
        collection,
        new Date("2020-06-01"),
        new Date("2020-12-01")
      )
    ).toBe(false);
  });

  test("returns false when collection starts after date range", () => {
    const collection = makeCollection("test");
    collection.extent.temporal.interval = [
      ["2022-01-01T00:00:00Z", "2022-12-31T00:00:00Z"],
    ];
    expect(
      isCollectionInDatetimes(
        collection,
        new Date("2020-06-01"),
        new Date("2020-12-01")
      )
    ).toBe(false);
  });
});

describe("getBandCount", () => {
  test("returns band count from bands property", () => {
    const asset = {
      href: "test.tiff",
      bands: [{}, {}, {}],
    } as AssetWithAlternates;
    expect(getBandCount(asset)).toBe(3);
  });

  test("returns band count from eo:bands property", () => {
    const asset = {
      href: "test.tiff",
      "eo:bands": [{}, {}, {}, {}],
    } as AssetWithAlternates;
    expect(getBandCount(asset)).toBe(4);
  });

  test("returns null if no bands", () => {
    const asset = { href: "test.tiff" } as AssetWithAlternates;
    expect(getBandCount(asset)).toBeNull();
  });
});

describe("isGeotiff", () => {
  test("returns true for geotiff with http href and 3 bands", () => {
    const asset = {
      href: "https://example.com/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
    } as AssetWithAlternates;
    expect(isGeotiff(asset)).toBe(true);
  });

  test("returns false for non-geotiff type", () => {
    const asset = {
      href: "https://example.com/test.json",
      type: "application/json",
    } as AssetWithAlternates;
    expect(isGeotiff(asset)).toBe(false);
  });

  test("returns false for non-http href without alternates", () => {
    const asset = {
      href: "s3://bucket/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
    } as AssetWithAlternates;
    expect(isGeotiff(asset)).toBe(false);
  });

  test("returns true for non-http href with http alternate", () => {
    const asset = {
      href: "s3://bucket/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
      alternate: {
        http: { href: "https://example.com/test.tiff" },
      },
    } as AssetWithAlternates;
    expect(isGeotiff(asset)).toBe(true);
  });

  test("returns true for visual role", () => {
    const asset = {
      href: "https://example.com/test.tiff",
      roles: ["visual"],
    } as AssetWithAlternates;
    expect(isGeotiff(asset)).toBe(true);
  });
});

describe("getGeotiffHref", () => {
  test("returns http href directly", () => {
    const asset = {
      href: "https://example.com/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
    } as AssetWithAlternates;
    expect(getGeotiffHref(asset)).toBe("https://example.com/test.tiff");
  });

  test("returns http alternate href when main href is not http", () => {
    const asset = {
      href: "s3://bucket/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
      alternate: {
        http: { href: "https://example.com/test.tiff" },
      },
    } as AssetWithAlternates;
    expect(getGeotiffHref(asset)).toBe("https://example.com/test.tiff");
  });

  test("returns null for non-geotiff", () => {
    const asset = {
      href: "https://example.com/test.json",
      type: "application/json",
    } as AssetWithAlternates;
    expect(getGeotiffHref(asset)).toBeNull();
  });
});

describe("getAssetScore", () => {
  test("returns 0 for non-geotiff", () => {
    const asset = {
      href: "https://example.com/test.json",
      type: "application/json",
    } as AssetWithAlternates;
    expect(getAssetScore(asset)).toBe(0);
  });

  test("returns 1 for basic geotiff", () => {
    const asset = {
      href: "https://example.com/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
    } as AssetWithAlternates;
    expect(getAssetScore(asset)).toBe(2);
  });

  test("adds 2 for visual role", () => {
    const asset = {
      href: "https://example.com/test.tiff",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}, {}],
      roles: ["visual"],
    } as AssetWithAlternates;
    expect(getAssetScore(asset)).toBe(4);
  });
});

describe("sortAssets", () => {
  test("sorts assets by score descending", () => {
    const assets = {
      json: {
        href: "https://example.com/test.json",
        type: "application/json",
      },
      visual: {
        href: "https://example.com/visual.tiff",
        type: "image/tiff; application=geotiff",
        bands: [{}, {}, {}],
        roles: ["visual"],
      },
      data: {
        href: "https://example.com/data.tiff",
        type: "image/tiff; application=geotiff",
        bands: [{}, {}, {}],
      },
    };
    const sorted = sortAssets(assets);
    expect(sorted[0][0]).toBe("visual");
    expect(sorted[1][0]).toBe("data");
    expect(sorted[2][0]).toBe("json");
  });
});

describe("getBestAssetFromSortedList", () => {
  test("returns first asset if it has positive score", () => {
    const sortedAssets: [string, AssetWithAlternates][] = [
      [
        "visual",
        {
          href: "https://example.com/visual.tiff",
          type: "image/tiff; application=geotiff",
          bands: [{}, {}, {}],
        },
      ],
    ];
    const [key, asset] = getBestAssetFromSortedList(sortedAssets);
    expect(key).toBe("visual");
    expect(asset?.href).toBe("https://example.com/visual.tiff");
  });

  test("returns null values if first asset has zero score", () => {
    const sortedAssets: [string, AssetWithAlternates][] = [
      [
        "json",
        { href: "https://example.com/test.json", type: "application/json" },
      ],
    ];
    const [key, asset] = getBestAssetFromSortedList(sortedAssets);
    expect(key).toBeNull();
    expect(asset).toBeNull();
  });
});

describe("getBestAsset", () => {
  test("returns best asset from item", () => {
    const item = makeItem("test");
    item.assets = {
      json: { href: "https://example.com/test.json", type: "application/json" },
      visual: {
        href: "https://example.com/visual.tiff",
        type: "image/tiff; application=geotiff",
        bands: [{}, {}, {}],
        roles: ["visual"],
      },
    };
    const [key] = getBestAsset(item);
    expect(key).toBe("visual");
  });
});

describe("collectionToFeature", () => {
  test("converts collection bbox to GeoJSON feature", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -20, 30, 40]];
    const feature = collectionToFeature(collection);
    expect(feature.id).toBe("test");
    expect(feature.type).toBe("Feature");
    expect(feature.geometry.type).toBe("Polygon");
  });
});

describe("getBbox", () => {
  test("returns bbox for Collection", () => {
    const collection = makeCollection("test");
    collection.extent.spatial.bbox = [[-10, -20, 30, 40]];
    expect(getBbox(collection, null)).toEqual([-10, -20, 30, 40]);
  });

  test("returns bbox for Feature/Item", () => {
    const item = makeItem("test");
    item.bbox = [-5, -5, 5, 5];
    expect(getBbox(item, null)).toEqual([-5, -5, 5, 5]);
  });

  test("returns combined bbox for Catalog with collections", () => {
    const catalog = {
      type: "Catalog",
      stac_version: "1.0.0",
      id: "test",
      description: "Test",
      links: [],
    } as StacValue;
    const collections = [makeCollection("col1"), makeCollection("col2")];
    collections[0].extent.spatial.bbox = [[-10, -10, 0, 0]];
    collections[1].extent.spatial.bbox = [[0, 0, 10, 10]];
    expect(getBbox(catalog, collections)).toEqual([-10, -10, 10, 10]);
  });

  test("returns null for Catalog without collections", () => {
    const catalog = {
      type: "Catalog",
      stac_version: "1.0.0",
      id: "test",
      description: "Test",
      links: [],
    } as StacValue;
    expect(getBbox(catalog, null)).toBeNull();
  });
});
