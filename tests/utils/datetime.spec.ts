import type { StacCollection, StacItem } from "stac-ts";
import { describe, expect, it } from "vitest";
import {
  collectionMatchesFilter,
  datetimeInputToMs,
  getCollectionDatetimeMs,
  getCollectionsDatetimeExtent,
  getItemDatetimeMs,
  getItemsDatetimeExtent,
  itemMatchesFilter,
  msToDatetimeInputValue,
  msToIsoLabel,
  toDatetimeInputValue,
  toMs,
} from "../../src/utils/datetime";

function makeItem(properties: Record<string, unknown>): StacItem {
  return {
    type: "Feature",
    stac_version: "1.0.0",
    id: "test",
    geometry: null,
    properties,
    links: [],
    assets: {},
  } as unknown as StacItem;
}

function makeCollection(
  interval: [string | null, string | null] | undefined
): StacCollection {
  return {
    type: "Collection",
    stac_version: "1.0.0",
    id: "test",
    description: "",
    license: "MIT",
    extent: {
      spatial: { bbox: [[-180, -90, 180, 90]] },
      temporal: { interval: interval ? [interval] : [] },
    },
    links: [],
  } as unknown as StacCollection;
}

describe("toMs", () => {
  it("returns ms for a valid ISO datetime", () => {
    expect(toMs("2024-01-01T00:00:00Z")).toBe(Date.UTC(2024, 0, 1));
  });

  it("returns undefined for null and undefined", () => {
    expect(toMs(null)).toBeUndefined();
    expect(toMs(undefined)).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(toMs("")).toBeUndefined();
  });

  it("returns undefined for an unparseable string", () => {
    expect(toMs("not-a-date")).toBeUndefined();
  });
});

describe("datetimeInputToMs", () => {
  it("appends Z and parses as UTC", () => {
    expect(datetimeInputToMs("2024-06-15T12:00:00")).toBe(
      Date.UTC(2024, 5, 15, 12, 0, 0)
    );
  });

  it("returns undefined for empty input", () => {
    expect(datetimeInputToMs("")).toBeUndefined();
  });

  it("returns undefined for invalid input", () => {
    expect(datetimeInputToMs("garbage")).toBeUndefined();
  });
});

describe("msToDatetimeInputValue", () => {
  it("formats ms as YYYY-MM-DDTHH:MM:SS", () => {
    expect(msToDatetimeInputValue(Date.UTC(2024, 0, 1, 3, 4, 5))).toBe(
      "2024-01-01T03:04:05"
    );
  });
});

describe("toDatetimeInputValue", () => {
  it("strips milliseconds and timezone", () => {
    expect(toDatetimeInputValue("2024-01-01T00:00:00.123Z")).toBe(
      "2024-01-01T00:00:00"
    );
  });

  it("returns empty string for null/undefined/empty", () => {
    expect(toDatetimeInputValue(null)).toBe("");
    expect(toDatetimeInputValue(undefined)).toBe("");
    expect(toDatetimeInputValue("")).toBe("");
  });

  it("returns empty string for invalid input", () => {
    expect(toDatetimeInputValue("not-a-date")).toBe("");
  });
});

describe("msToIsoLabel", () => {
  it("formats ms as YYYY-MM-DD", () => {
    expect(msToIsoLabel(Date.UTC(2024, 5, 15, 12, 0, 0))).toBe("2024-06-15");
  });
});

describe("getItemDatetimeMs", () => {
  it("uses datetime when present", () => {
    const item = makeItem({ datetime: "2024-01-01T00:00:00Z" });
    expect(getItemDatetimeMs(item)).toEqual({
      start: Date.UTC(2024, 0, 1),
      end: Date.UTC(2024, 0, 1),
    });
  });

  it("uses start_datetime/end_datetime when datetime is missing", () => {
    const item = makeItem({
      datetime: null,
      start_datetime: "2024-01-01T00:00:00Z",
      end_datetime: "2024-02-01T00:00:00Z",
    });
    expect(getItemDatetimeMs(item)).toEqual({
      start: Date.UTC(2024, 0, 1),
      end: Date.UTC(2024, 1, 1),
    });
  });

  it("returns null when no datetime info is available", () => {
    expect(getItemDatetimeMs(makeItem({}))).toBeNull();
  });

  it("returns null when only start is provided", () => {
    const item = makeItem({
      datetime: null,
      start_datetime: "2024-01-01T00:00:00Z",
    });
    expect(getItemDatetimeMs(item)).toBeNull();
  });
});

describe("getCollectionDatetimeMs", () => {
  it("returns extent endpoints", () => {
    const collection = makeCollection([
      "2024-01-01T00:00:00Z",
      "2024-12-31T00:00:00Z",
    ]);
    expect(getCollectionDatetimeMs(collection)).toEqual({
      start: Date.UTC(2024, 0, 1),
      end: Date.UTC(2024, 11, 31),
    });
  });

  it("preserves null endpoints (open interval)", () => {
    const collection = makeCollection(["2024-01-01T00:00:00Z", null]);
    expect(getCollectionDatetimeMs(collection)).toEqual({
      start: Date.UTC(2024, 0, 1),
      end: null,
    });
  });

  it("returns null when interval is missing", () => {
    expect(getCollectionDatetimeMs(makeCollection(undefined))).toBeNull();
  });
});

describe("getItemsDatetimeExtent", () => {
  it("returns the min/max range across items", () => {
    const items = [
      makeItem({ datetime: "2024-01-01T00:00:00Z" }),
      makeItem({ datetime: "2024-06-01T00:00:00Z" }),
      makeItem({ datetime: "2024-03-01T00:00:00Z" }),
    ];
    expect(getItemsDatetimeExtent(items)).toEqual([
      Date.UTC(2024, 0, 1),
      Date.UTC(2024, 5, 1),
    ]);
  });

  it("ignores items without datetime info", () => {
    const items = [
      makeItem({}),
      makeItem({ datetime: "2024-01-01T00:00:00Z" }),
    ];
    expect(getItemsDatetimeExtent(items)).toEqual([
      Date.UTC(2024, 0, 1),
      Date.UTC(2024, 0, 1),
    ]);
  });

  it("returns null for an empty list", () => {
    expect(getItemsDatetimeExtent([])).toBeNull();
  });
});

describe("getCollectionsDatetimeExtent", () => {
  it("returns the union of collection intervals", () => {
    const collections = [
      makeCollection(["2024-01-01T00:00:00Z", "2024-06-01T00:00:00Z"]),
      makeCollection(["2024-03-01T00:00:00Z", "2024-12-01T00:00:00Z"]),
    ];
    expect(getCollectionsDatetimeExtent(collections)).toEqual([
      Date.UTC(2024, 0, 1),
      Date.UTC(2024, 11, 1),
    ]);
  });

  it("returns null when no collections have intervals", () => {
    expect(
      getCollectionsDatetimeExtent([makeCollection(undefined)])
    ).toBeNull();
  });
});

describe("itemMatchesFilter", () => {
  it("matches items inside the filter range", () => {
    const item = makeItem({ datetime: "2024-06-01T00:00:00Z" });
    expect(
      itemMatchesFilter(item, [Date.UTC(2024, 0, 1), Date.UTC(2024, 11, 1)])
    ).toBe(true);
  });

  it("excludes items entirely outside the filter range", () => {
    const item = makeItem({ datetime: "2023-01-01T00:00:00Z" });
    expect(
      itemMatchesFilter(item, [Date.UTC(2024, 0, 1), Date.UTC(2024, 11, 1)])
    ).toBe(false);
  });

  it("includes items without datetime info", () => {
    expect(
      itemMatchesFilter(makeItem({}), [
        Date.UTC(2024, 0, 1),
        Date.UTC(2024, 11, 1),
      ])
    ).toBe(true);
  });
});

describe("collectionMatchesFilter", () => {
  it("matches collections that overlap the filter range", () => {
    const collection = makeCollection([
      "2024-01-01T00:00:00Z",
      "2024-12-01T00:00:00Z",
    ]);
    expect(
      collectionMatchesFilter(collection, [
        Date.UTC(2024, 5, 1),
        Date.UTC(2024, 6, 1),
      ])
    ).toBe(true);
  });

  it("treats null endpoints as open", () => {
    const collection = makeCollection(["2024-01-01T00:00:00Z", null]);
    expect(
      collectionMatchesFilter(collection, [
        Date.UTC(2030, 0, 1),
        Date.UTC(2030, 11, 1),
      ])
    ).toBe(true);
  });

  it("excludes collections entirely outside the filter range", () => {
    const collection = makeCollection([
      "2020-01-01T00:00:00Z",
      "2020-12-01T00:00:00Z",
    ]);
    expect(
      collectionMatchesFilter(collection, [
        Date.UTC(2024, 0, 1),
        Date.UTC(2024, 11, 1),
      ])
    ).toBe(false);
  });

  it("includes collections without temporal extent", () => {
    expect(
      collectionMatchesFilter(makeCollection(undefined), [
        Date.UTC(2024, 0, 1),
        Date.UTC(2024, 11, 1),
      ])
    ).toBe(true);
  });
});
