import type { StacAsset, StacCatalog, StacCollection, StacItem } from "stac-ts";
import { describe, expect, it } from "vitest";
import type { StacItemCollection } from "../../src/types/stac";
import {
  conformsToFreeTextCollectionSearch,
  getBandCount,
  getCogHref,
  getLink,
  getLinkHref,
  getSelfHref,
  getSpatialExtent,
  getStacId,
  getStacTitle,
  getStacType,
  getThumbnailAsset,
  sanitizeBbox,
} from "../../src/utils/stac";

function makeCatalog(extra: Partial<StacCatalog> = {}): StacCatalog {
  return {
    type: "Catalog",
    stac_version: "1.0.0",
    id: "cat-id",
    description: "",
    links: [],
    ...extra,
  } as StacCatalog;
}

function makeItem(extra: Partial<StacItem> = {}): StacItem {
  return {
    type: "Feature",
    stac_version: "1.0.0",
    id: "item-id",
    geometry: null,
    properties: {},
    links: [],
    assets: {},
    ...extra,
  } as unknown as StacItem;
}

describe("getStacType", () => {
  it("returns Collection for type=Collection", () => {
    expect(getStacType({ type: "Collection" } as StacCollection)).toBe(
      "Collection"
    );
  });

  it("returns Item for type=Feature", () => {
    expect(getStacType(makeItem())).toBe("Item");
  });

  it("returns Catalog for type=Catalog", () => {
    expect(getStacType(makeCatalog())).toBe("Catalog");
  });

  it("returns Item collection for type=FeatureCollection", () => {
    const value: StacItemCollection = {
      type: "FeatureCollection",
      features: [],
    };
    expect(getStacType(value)).toBe("Item collection");
  });
});

describe("getStacId", () => {
  it("returns the id when present", () => {
    expect(getStacId(makeCatalog({ id: "my-id" }))).toBe("my-id");
  });

  it("falls back to the type when id is missing", () => {
    expect(getStacId(makeCatalog({ id: "" }))).toBe("Catalog");
  });
});

describe("getStacTitle", () => {
  it("returns the title when present", () => {
    expect(getStacTitle(makeCatalog({ title: "My catalog" }))).toBe(
      "My catalog"
    );
  });

  it("falls back to the id when title is missing", () => {
    expect(getStacTitle(makeCatalog({ id: "fallback" }))).toBe("fallback");
  });
});

describe("getLink / getLinkHref / getSelfHref", () => {
  const value = {
    links: [
      { rel: "self", href: "https://example.com/self.json" },
      { rel: "root", href: "https://example.com/root.json" },
    ],
  };

  it("finds a link by rel", () => {
    expect(getLink(value, "root")?.href).toBe("https://example.com/root.json");
  });

  it("returns undefined when not found", () => {
    expect(getLink(value, "missing")).toBeUndefined();
  });

  it("returns the href of a link by rel", () => {
    expect(getLinkHref(value, "self")).toBe("https://example.com/self.json");
  });

  it("returns the self href", () => {
    expect(getSelfHref(value as unknown as StacCatalog)).toBe(
      "https://example.com/self.json"
    );
  });

  it("handles missing links arrays gracefully", () => {
    expect(getLink({}, "self")).toBeUndefined();
    expect(getLinkHref({}, "self")).toBeUndefined();
  });
});

describe("getThumbnailAsset", () => {
  it("returns the asset keyed 'thumbnail'", () => {
    const item = makeItem({
      assets: {
        thumbnail: { href: "https://example.com/thumb.png" } as StacAsset,
      },
    });
    const asset = getThumbnailAsset(item);
    expect(asset && asset.href).toBe("https://example.com/thumb.png");
  });

  it("returns the first asset with role thumbnail", () => {
    const item = makeItem({
      assets: {
        data: { href: "https://example.com/data.tif" } as StacAsset,
        preview: {
          href: "https://example.com/preview.png",
          roles: ["thumbnail"],
        } as StacAsset,
      },
    });
    const asset = getThumbnailAsset(item);
    expect(asset && asset.href).toBe("https://example.com/preview.png");
  });

  it("falls back to the 'thumbnails' key", () => {
    const item = makeItem({
      assets: {
        thumbnails: { href: "https://example.com/t.png" } as StacAsset,
      },
    });
    const asset = getThumbnailAsset(item);
    expect(asset && asset.href).toBe("https://example.com/t.png");
  });

  it("returns false when the thumbnail href is not http(s)", () => {
    const item = makeItem({
      assets: {
        thumbnail: { href: "s3://bucket/thumb.png" } as StacAsset,
      },
    });
    expect(getThumbnailAsset(item)).toBe(false);
  });

  it("returns undefined when there are no assets", () => {
    expect(getThumbnailAsset(makeCatalog())).toBeUndefined();
  });
});

describe("conformsToFreeTextCollectionSearch", () => {
  it("returns true when the catalog declares the conformance class", () => {
    const value = makeCatalog({
      conformsTo: [
        "https://api.stacspec.org/v1.0.0/collection-search#free-text",
      ],
    } as Partial<StacCatalog>);
    expect(conformsToFreeTextCollectionSearch(value)).toBe(true);
  });

  it("returns false when the conformance class is missing", () => {
    const value = makeCatalog({
      conformsTo: ["https://api.stacspec.org/v1.0.0/core"],
    } as Partial<StacCatalog>);
    expect(conformsToFreeTextCollectionSearch(value)).toBe(false);
  });

  it("returns false for non-catalog values", () => {
    expect(
      conformsToFreeTextCollectionSearch({
        type: "Collection",
      } as StacCollection)
    ).toBe(false);
  });

  it("returns false when conformsTo is not an array", () => {
    expect(conformsToFreeTextCollectionSearch(makeCatalog())).toBe(false);
  });
});

describe("getSpatialExtent", () => {
  it("returns the first bbox when bbox is a list of lists", () => {
    const collection = {
      extent: { spatial: { bbox: [[-10, -20, 10, 20]] } },
    } as unknown as StacCollection;
    expect(getSpatialExtent(collection)).toEqual([-10, -20, 10, 20]);
  });

  it("returns the bbox when bbox is a flat list", () => {
    const collection = {
      extent: { spatial: { bbox: [-10, -20, 10, 20] } },
    } as unknown as StacCollection;
    expect(getSpatialExtent(collection)).toEqual([-10, -20, 10, 20]);
  });
});

describe("getBandCount", () => {
  it("uses the bands array length", () => {
    expect(getBandCount({ bands: [{}, {}, {}] } as unknown as StacAsset)).toBe(
      3
    );
  });

  it("falls back to eo:bands", () => {
    expect(getBandCount({ "eo:bands": [{}, {}] } as unknown as StacAsset)).toBe(
      2
    );
  });

  it("falls back to raster:bands", () => {
    expect(getBandCount({ "raster:bands": [{}] } as unknown as StacAsset)).toBe(
      1
    );
  });

  it("returns undefined when no band metadata is present", () => {
    expect(getBandCount({ href: "x" } as StacAsset)).toBeUndefined();
  });
});

describe("getCogHref", () => {
  it("returns the asset href for a 3-band geotiff", () => {
    const asset = {
      href: "https://example.com/cog.tif",
      type: "image/tiff; application=geotiff; profile=cloud-optimized",
      bands: [{}, {}, {}],
    } as unknown as StacAsset;
    expect(getCogHref(asset)).toBe("https://example.com/cog.tif");
  });

  it("returns undefined for non-geotiff types", () => {
    const asset = {
      href: "https://example.com/data.png",
      type: "image/png",
    } as StacAsset;
    expect(getCogHref(asset)).toBeUndefined();
  });

  it("returns undefined when band count is unsupported", () => {
    const asset = {
      href: "https://example.com/cog.tif",
      type: "image/tiff; application=geotiff",
      bands: [{}, {}],
    } as unknown as StacAsset;
    expect(getCogHref(asset)).toBeUndefined();
  });

  it("uses an http alternate when the primary href is not http", () => {
    const asset = {
      href: "s3://bucket/cog.tif",
      type: "image/tiff; application=geotiff",
      alternate: {
        https: { href: "https://example.com/cog.tif" },
      },
    } as unknown as StacAsset;
    expect(getCogHref(asset)).toBe("https://example.com/cog.tif");
  });

  it("returns undefined when no http alternate is available", () => {
    const asset = {
      href: "s3://bucket/cog.tif",
      type: "image/tiff; application=geotiff",
    } as unknown as StacAsset;
    expect(getCogHref(asset)).toBeUndefined();
  });
});

describe("sanitizeBbox", () => {
  it("clamps a 2D bbox to valid lon/lat ranges", () => {
    expect(sanitizeBbox([-200, -100, 200, 100])).toEqual([-180, -90, 180, 90]);
  });

  it("preserves a bbox already within bounds", () => {
    expect(sanitizeBbox([-10, -20, 10, 20])).toEqual([-10, -20, 10, 20]);
  });

  it("collapses a 3D bbox to its 2D footprint", () => {
    expect(sanitizeBbox([-10, -20, 0, 10, 20, 100])).toEqual([
      -10, -20, 10, 20,
    ]);
  });

  it("returns null for falsy input", () => {
    expect(sanitizeBbox(null as unknown as never)).toBeNull();
  });
});
