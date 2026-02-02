import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import { beforeEach, describe, expect, test } from "vitest";
import { useStore } from "../src/store";
import type { StacSearch } from "../src/types/stac";

function makeCollection(id: string): StacCollection {
  return {
    type: "Collection",
    stac_version: "1.0.0",
    id,
    description: "Test collection",
    license: "MIT",
    extent: {
      spatial: { bbox: [[-180, -90, 180, 90]] },
      temporal: { interval: [["2020-01-01T00:00:00Z", null]] },
    },
    links: [],
  };
}

function makeCatalog(id: string): StacCatalog {
  return {
    type: "Catalog",
    stac_version: "1.0.0",
    id,
    description: "Test catalog",
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

function resetStore() {
  useStore.setState({
    href: null,
    hrefIsParquet: false,
    input: "",
    value: null,
    collections: null,
    filteredCollections: null,
    hoveredCollection: null,
    visualizeCollections: true,
    catalogs: null,
    staticItems: null,
    searchedItems: null,
    itemSource: "static",
    hoveredItem: null,
    pickedItem: null,
    search: { collections: [] },
    visualizeItemBounds: true,
    asset: null,
    assetKey: null,
    uploadedFile: null,
    stacGeoparquetTable: null,
    stacGeoparquetItemId: null,
  });
}

beforeEach(() => {
  resetStore();
});

describe("href.ts - setHref", () => {
  test("setting a parquet URL sets hrefIsParquet: true", () => {
    useStore.getState().setHref("https://example.com/data.parquet");
    expect(useStore.getState().hrefIsParquet).toBe(true);
  });

  test("setting a non-parquet URL sets hrefIsParquet: false", () => {
    useStore.getState().setHref("https://example.com/catalog.json");
    expect(useStore.getState().hrefIsParquet).toBe(false);
  });

  test("setting null sets hrefIsParquet: false", () => {
    useStore.getState().setHref("https://example.com/data.parquet");
    expect(useStore.getState().hrefIsParquet).toBe(true);
    useStore.getState().setHref(null);
    expect(useStore.getState().hrefIsParquet).toBe(false);
  });

  test("setting href clears dependent state", () => {
    useStore.setState({
      value: makeCollection("test"),
      collections: [makeCollection("col1")],
      filteredCollections: [makeCollection("col1")],
      hoveredCollection: makeCollection("col1"),
      hoveredItem: makeItem("item1"),
      pickedItem: makeItem("item1"),
      staticItems: [makeItem("item1")],
      searchedItems: [[makeItem("item1")]],
      geotiffHref: "https://example.com/test.tiff",
      stacGeoparquetTable: {} as never,
      stacGeoparquetItemId: "item1",
    });

    useStore.getState().setHref("https://example.com/new.json");

    const state = useStore.getState();
    expect(state.value).toBeNull();
    expect(state.collections).toBeNull();
    expect(state.filteredCollections).toBeNull();
    expect(state.hoveredCollection).toBeNull();
    expect(state.hoveredItem).toBeNull();
    expect(state.pickedItem).toBeNull();
    expect(state.staticItems).toBeNull();
    expect(state.searchedItems).toBeNull();
    expect(state.stacGeoparquetTable).toBeNull();
    expect(state.stacGeoparquetItemId).toBeNull();
  });

  test("setting href updates input to match", () => {
    useStore.getState().setHref("https://example.com/catalog.json");
    expect(useStore.getState().input).toBe("https://example.com/catalog.json");
  });

  test("setting href to null sets input to empty string", () => {
    useStore.getState().setHref("https://example.com/catalog.json");
    useStore.getState().setHref(null);
    expect(useStore.getState().input).toBe("");
  });
});

describe("value.ts - setValue", () => {
  test("sets value normally", () => {
    const collection = makeCollection("test");
    useStore.getState().setValue(collection);
    expect(useStore.getState().value).toBe(collection);
  });

  test("does not clear search when value is not a Collection", () => {
    const search: StacSearch = { collections: ["other-collection"] };
    useStore.setState({ search });

    const item = makeItem("test");
    useStore.getState().setValue(item);

    expect(useStore.getState().search).toBe(search);
  });

  test("does not clear search when search has 0 collections", () => {
    const search: StacSearch = { collections: [] };
    useStore.setState({ search });

    const collection = makeCollection("test");
    useStore.getState().setValue(collection);

    expect(useStore.getState().search).toBe(search);
  });

  test("does not clear search when search has 2+ collections", () => {
    const search: StacSearch = { collections: ["col1", "col2"] };
    useStore.setState({ search });

    const collection = makeCollection("test");
    useStore.getState().setValue(collection);

    expect(useStore.getState().search).toBe(search);
  });

  test("does not clear search when collection id matches", () => {
    const search: StacSearch = { collections: ["test"] };
    useStore.setState({ search });

    const collection = makeCollection("test");
    useStore.getState().setValue(collection);

    expect(useStore.getState().search).toBe(search);
  });
});

describe("collections.ts - addCollection", () => {
  test("adds to empty collections", () => {
    useStore.setState({ collections: [] });

    const collection = makeCollection("test");
    useStore.getState().addCollection(collection);

    expect(useStore.getState().collections).toHaveLength(1);
    expect(useStore.getState().collections?.[0]).toBe(collection);
  });

  test("adds to null collections", () => {
    const collection = makeCollection("test");
    useStore.getState().addCollection(collection);

    expect(useStore.getState().collections).toHaveLength(1);
    expect(useStore.getState().collections?.[0]).toBe(collection);
  });

  test("does not add duplicate (same id)", () => {
    const collection1 = makeCollection("test");
    const collection2 = makeCollection("test");
    useStore.setState({ collections: [collection1] });

    useStore.getState().addCollection(collection2);

    expect(useStore.getState().collections).toHaveLength(1);
    expect(useStore.getState().collections?.[0]).toBe(collection1);
  });

  test("adds non-duplicate (different id)", () => {
    const collection1 = makeCollection("col1");
    const collection2 = makeCollection("col2");
    useStore.setState({ collections: [collection1] });

    useStore.getState().addCollection(collection2);

    expect(useStore.getState().collections).toHaveLength(2);
    expect(useStore.getState().collections?.[1]).toBe(collection2);
  });
});

describe("collections.ts - setFilteredCollections", () => {
  test("sets filtered collections", () => {
    const collections = [makeCollection("col1"), makeCollection("col2")];
    useStore.getState().setFilteredCollections(collections);

    expect(useStore.getState().filteredCollections).toBe(collections);
  });

  test("clears hoveredCollection when not in new list", () => {
    const col1 = makeCollection("col1");
    const col2 = makeCollection("col2");
    useStore.setState({ hoveredCollection: col1 });

    useStore.getState().setFilteredCollections([col2]);

    expect(useStore.getState().hoveredCollection).toBeNull();
  });

  test("keeps hoveredCollection when in new list", () => {
    const col1 = makeCollection("col1");
    const col2 = makeCollection("col2");
    useStore.setState({ hoveredCollection: col1 });

    useStore.getState().setFilteredCollections([col1, col2]);

    expect(useStore.getState().hoveredCollection).toBe(col1);
  });
});

describe("catalogs.ts - addCatalog", () => {
  test("adds to empty catalogs", () => {
    useStore.setState({ catalogs: [] });

    const catalog = makeCatalog("test");
    useStore.getState().addCatalog(catalog);

    expect(useStore.getState().catalogs).toHaveLength(1);
    expect(useStore.getState().catalogs?.[0]).toBe(catalog);
  });

  test("adds to null catalogs", () => {
    const catalog = makeCatalog("test");
    useStore.getState().addCatalog(catalog);

    expect(useStore.getState().catalogs).toHaveLength(1);
    expect(useStore.getState().catalogs?.[0]).toBe(catalog);
  });

  test("does not add duplicate", () => {
    const catalog1 = makeCatalog("test");
    const catalog2 = makeCatalog("test");
    useStore.setState({ catalogs: [catalog1] });

    useStore.getState().addCatalog(catalog2);

    expect(useStore.getState().catalogs).toHaveLength(1);
    expect(useStore.getState().catalogs?.[0]).toBe(catalog1);
  });
});

describe("items.ts - addItem", () => {
  test("adds to empty items", () => {
    useStore.setState({ staticItems: [] });

    const item = makeItem("test");
    useStore.getState().addItem(item);

    expect(useStore.getState().staticItems).toHaveLength(1);
    expect(useStore.getState().staticItems?.[0]).toBe(item);
  });

  test("adds to null items", () => {
    const item = makeItem("test");
    useStore.getState().addItem(item);

    expect(useStore.getState().staticItems).toHaveLength(1);
    expect(useStore.getState().staticItems?.[0]).toBe(item);
  });

  test("does not add duplicate", () => {
    const item1 = makeItem("test");
    const item2 = makeItem("test");
    useStore.setState({ staticItems: [item1] });

    useStore.getState().addItem(item2);

    expect(useStore.getState().staticItems).toHaveLength(1);
    expect(useStore.getState().staticItems?.[0]).toBe(item1);
  });
});

describe("items.ts - clearPickedItem", () => {
  test("clears pickedItem and stacGeoparquetItemId", () => {
    useStore.setState({
      pickedItem: makeItem("test"),
      stacGeoparquetItemId: "test",
    });

    useStore.getState().clearPickedItem();

    expect(useStore.getState().pickedItem).toBeNull();
    expect(useStore.getState().stacGeoparquetItemId).toBeNull();
  });
});

describe("assets.ts - setAsset", () => {
  test("setting asset calls getGeotiffHref and updates state", async () => {
    const asset = {
      href: "https://example.com/asset.tiff",
      type: "image/tiff; application=geotiff",
    };

    useStore.getState().setAsset("visual", asset);

    expect(useStore.getState().asset).toBe(asset);
    expect(useStore.getState().assetKey).toBe("visual");
  });
});

describe("uploaded-file.ts - setUploadedFile", () => {
  test("sets uploadedFile and triggers setHref with file.name", () => {
    const file = new File(["test"], "test.parquet", {
      type: "application/octet-stream",
    });

    useStore.getState().setUploadedFile(file);

    expect(useStore.getState().uploadedFile).toBe(file);
    expect(useStore.getState().href).toBe("test.parquet");
    expect(useStore.getState().hrefIsParquet).toBe(true);
  });
});
