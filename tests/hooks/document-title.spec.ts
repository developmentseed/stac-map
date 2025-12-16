import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import type { StacItemCollection, StacValue } from "../../src/types/stac";
import getDocumentTitle from "../../src/utils/title";

describe("useDocumentTitle logic", () => {
  let originalTitle: string;

  beforeEach(() => {
    if (typeof document !== "undefined") {
      originalTitle = document.title;
    }
  });

  afterEach(() => {
    if (typeof document !== "undefined") {
      document.title = originalTitle;
    }
  });

  function setDocumentTitle(value: StacValue | undefined) {
    document.title = getDocumentTitle(value);
  }

  test("should set default title when value is undefined", () => {
    setDocumentTitle(undefined);

    expect(document.title).toBe("stac-map");
  });

  test("should set title with catalog title", () => {
    const catalog: StacCatalog = {
      id: "test-catalog",
      type: "Catalog",
      title: "Test Catalog",
      description: "A test catalog",
      stac_version: "1.0.0",
      links: [],
    };

    setDocumentTitle(catalog);

    expect(document.title).toBe("stac-map | Test Catalog");
  });

  test("should set title with catalog id when title is missing", () => {
    const catalog: StacCatalog = {
      id: "test-catalog",
      type: "Catalog",
      description: "A test catalog",
      stac_version: "1.0.0",
      links: [],
    };

    setDocumentTitle(catalog);

    expect(document.title).toBe("stac-map | test-catalog");
  });

  test("should set title with collection title", () => {
    const collection: StacCollection = {
      id: "test-collection",
      type: "Collection",
      title: "Test Collection",
      description: "A test collection",
      stac_version: "1.0.0",
      license: "MIT",
      extent: {
        spatial: {
          bbox: [[-180, -90, 180, 90]],
        },
        temporal: {
          interval: [[null, null]],
        },
      },
      links: [],
    };

    setDocumentTitle(collection);

    expect(document.title).toBe("stac-map | Test Collection");
  });

  test("should set title with item title", () => {
    const item: StacItem = {
      id: "test-item",
      type: "Feature",
      title: "Test Item",
      stac_version: "1.0.0",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        datetime: "2020-01-01T00:00:00Z",
      },
      links: [],
      assets: {},
    };

    setDocumentTitle(item);

    expect(document.title).toBe("stac-map | Test Item");
  });

  test("should set title with item collection title", () => {
    const itemCollection: StacItemCollection = {
      type: "FeatureCollection",
      title: "Test Item Collection",
      features: [],
    };

    setDocumentTitle(itemCollection);

    expect(document.title).toBe("stac-map | Test Item Collection");
  });

  test("should set title with item collection id when title is missing", () => {
    const itemCollection: StacItemCollection = {
      type: "FeatureCollection",
      id: "test-item-collection",
      features: [],
    };

    setDocumentTitle(itemCollection);

    expect(document.title).toBe("stac-map | test-item-collection");
  });

  test("should prefer title over id when both are present", () => {
    const catalog: StacCatalog = {
      id: "catalog-id",
      type: "Catalog",
      title: "Catalog Title",
      description: "A test catalog",
      stac_version: "1.0.0",
      links: [],
    };

    setDocumentTitle(catalog);

    expect(document.title).toBe("stac-map | Catalog Title");
  });

  test("should handle value without title or id", () => {
    const itemCollection: StacItemCollection = {
      type: "FeatureCollection",
      features: [],
    };

    setDocumentTitle(itemCollection);

    expect(document.title).toBe("stac-map");
  });

  test("should update title when value changes", () => {
    const catalog1: StacCatalog = {
      id: "catalog1",
      type: "Catalog",
      title: "First Catalog",
      description: "First catalog",
      stac_version: "1.0.0",
      links: [],
    };

    const catalog2: StacCatalog = {
      id: "catalog2",
      type: "Catalog",
      title: "Second Catalog",
      description: "Second catalog",
      stac_version: "1.0.0",
      links: [],
    };

    setDocumentTitle(catalog1);
    expect(document.title).toBe("stac-map | First Catalog");

    setDocumentTitle(catalog2);
    expect(document.title).toBe("stac-map | Second Catalog");
  });

  test("should reset to default title when value becomes undefined", () => {
    const catalog: StacCatalog = {
      id: "test-catalog",
      type: "Catalog",
      title: "Test Catalog",
      description: "A test catalog",
      stac_version: "1.0.0",
      links: [],
    };

    setDocumentTitle(catalog);
    expect(document.title).toBe("stac-map | Test Catalog");

    setDocumentTitle(undefined);
    expect(document.title).toBe("stac-map");
  });
});
