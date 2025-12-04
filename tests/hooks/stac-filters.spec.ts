import type { StacCollection, StacItem } from "stac-ts";
import { describe, expect, test } from "vitest";
import type { BBox2D } from "../../src/types/map";
import type { DatetimeBounds } from "../../src/types/stac";
import {
  isCollectionInBbox,
  isCollectionInDatetimeBounds,
  isItemInBbox,
  isItemInDatetimeBounds,
} from "../../src/utils/stac";

describe("useStacFilters logic", () => {
  const mockCollection1: StacCollection = {
    id: "collection1",
    type: "Collection",
    stac_version: "1.0.0",
    description: "Test collection 1",
    license: "MIT",
    extent: {
      spatial: {
        bbox: [[-180, -90, 180, 90]],
      },
      temporal: {
        interval: [["2020-01-01T00:00:00Z", "2020-12-31T23:59:59Z"]],
      },
    },
    links: [],
  };

  const mockCollection2: StacCollection = {
    id: "collection2",
    type: "Collection",
    stac_version: "1.0.0",
    description: "Test collection 2",
    license: "MIT",
    extent: {
      spatial: {
        bbox: [[0, 0, 10, 10]],
      },
      temporal: {
        interval: [["2021-01-01T00:00:00Z", "2021-12-31T23:59:59Z"]],
      },
    },
    links: [],
  };

  const mockItem1: StacItem = {
    id: "item1",
    type: "Feature",
    stac_version: "1.0.0",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    bbox: [-1, -1, 1, 1],
    properties: {
      datetime: "2020-06-15T00:00:00Z",
    },
    links: [],
    assets: {},
  };

  const mockItem2: StacItem = {
    id: "item2",
    type: "Feature",
    stac_version: "1.0.0",
    geometry: {
      type: "Point",
      coordinates: [50, 50],
    },
    bbox: [49, 49, 51, 51],
    properties: {
      datetime: "2021-06-15T00:00:00Z",
    },
    links: [],
    assets: {},
  };

  test("should filter collections by bbox", () => {
    const bbox: BBox2D = [0, 0, 10, 10];

    const filtered = [mockCollection1, mockCollection2].filter((collection) =>
      isCollectionInBbox(collection, bbox)
    );

    // collection1 has global bbox, collection2 overlaps with the filter bbox
    expect(filtered.length).toBe(1);
    expect(filtered.map((c) => c.id)).toContain("collection2");
  });

  test("should filter collections by datetime bounds", () => {
    const datetimeBounds: DatetimeBounds = {
      start: new Date("2020-01-01"),
      end: new Date("2020-12-31"),
    };

    const filtered = [mockCollection1, mockCollection2].filter((collection) =>
      isCollectionInDatetimeBounds(collection, datetimeBounds)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("collection1");
  });

  test("should filter collections by both bbox and datetime bounds", () => {
    const bbox: BBox2D = [0, 0, 10, 10];
    const datetimeBounds: DatetimeBounds = {
      start: new Date("2021-01-01"),
      end: new Date("2021-12-31"),
    };

    const filtered = [mockCollection1, mockCollection2].filter(
      (collection) =>
        isCollectionInBbox(collection, bbox) &&
        isCollectionInDatetimeBounds(collection, datetimeBounds)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("collection2");
  });

  test("should filter items by bbox", () => {
    const bbox: BBox2D = [-5, -5, 5, 5];

    const filtered = [mockItem1, mockItem2].filter((item) =>
      isItemInBbox(item, bbox)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("item1");
  });

  test("should filter items by datetime bounds", () => {
    const datetimeBounds: DatetimeBounds = {
      start: new Date("2020-01-01"),
      end: new Date("2020-12-31"),
    };

    const filtered = [mockItem1, mockItem2].filter((item) =>
      isItemInDatetimeBounds(item, datetimeBounds)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("item1");
  });

  test("should filter items by both bbox and datetime bounds", () => {
    const bbox: BBox2D = [-5, -5, 5, 5];
    const datetimeBounds: DatetimeBounds = {
      start: new Date("2020-01-01"),
      end: new Date("2020-12-31"),
    };

    const filtered = [mockItem1, mockItem2].filter(
      (item) =>
        isItemInBbox(item, bbox) && isItemInDatetimeBounds(item, datetimeBounds)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("item1");
  });

  test("should return empty array when no items match filters", () => {
    const bbox: BBox2D = [100, 100, 110, 110];

    const filtered = [mockItem1, mockItem2].filter((item) =>
      isItemInBbox(item, bbox)
    );

    expect(filtered.length).toBe(0);
  });

  test("should handle global bbox (360 degrees wide)", () => {
    const globalBbox: BBox2D = [-180, -90, 180, 90];

    const filteredCollections = [mockCollection1, mockCollection2].filter(
      (collection) => isCollectionInBbox(collection, globalBbox)
    );

    const filteredItems = [mockItem1, mockItem2].filter((item) =>
      isItemInBbox(item, globalBbox)
    );

    // Global bbox should include all collections and items
    expect(filteredCollections.length).toBe(2);
    expect(filteredItems.length).toBe(2);
  });

  test("should not filter when filter is false (logic test)", () => {
    const filter = false;
    const collections = [mockCollection1, mockCollection2];

    const result = filter ? collections.filter(() => true) : undefined;

    expect(result).toBeUndefined();
  });

  test("should filter when filter is true (logic test)", () => {
    const filter = true;
    const collections = [mockCollection1, mockCollection2];
    const bbox: BBox2D = [0, 0, 10, 10];

    const result = filter
      ? collections.filter((c) => isCollectionInBbox(c, bbox))
      : undefined;

    expect(result).toBeDefined();
    expect(result?.length).toBe(1);
    expect(result?.[0].id).toBe("collection2");
  });
});
