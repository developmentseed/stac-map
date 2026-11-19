import { describe, expect, it } from "vitest";
import {
  bboxFromGeoMetadata,
  bboxFromStatistics,
  bboxWhereClause,
  concatenateWkb,
  resolveGeometryType,
  sqlString,
} from "../../src/utils/stac-geoparquet";

describe("concatenateWkb", () => {
  it("concatenates geometries with offsets", () => {
    const { data, valueOffsets } = concatenateWkb([
      new Uint8Array([1, 2, 3]),
      new Uint8Array([]),
      new Uint8Array([4, 5]),
    ]);
    expect(Array.from(data)).toEqual([1, 2, 3, 4, 5]);
    expect(Array.from(valueOffsets)).toEqual([0, 3, 3, 5]);
  });

  it("handles no geometries", () => {
    const { data, valueOffsets } = concatenateWkb([]);
    expect(data.length).toBe(0);
    expect(Array.from(valueOffsets)).toEqual([0]);
  });

  it("handles more bytes than fit in a plain array", () => {
    const geometry = new Uint8Array(95).fill(7);
    const geometries = Array.from({ length: 2_000_000 }, () => geometry);
    const { data, valueOffsets } = concatenateWkb(geometries);
    expect(data.length).toBe(190_000_000);
    expect(valueOffsets[geometries.length]).toBe(190_000_000);
  });
});

describe("resolveGeometryType", () => {
  it("resolves a single type", () => {
    expect(resolveGeometryType(["POLYGON", "POLYGON"])).toBe("polygon");
  });

  it("resolves mixed polygons to multipolygon", () => {
    expect(resolveGeometryType(["POLYGON", "MULTIPOLYGON", "POLYGON"])).toBe(
      "multipolygon"
    );
    expect(resolveGeometryType(["MULTIPOLYGON", "POLYGON"])).toBe(
      "multipolygon"
    );
  });

  it("throws on other mixed types", () => {
    expect(() => resolveGeometryType(["POINT", "POLYGON"])).toThrow();
  });

  it("throws on unsupported types", () => {
    expect(() => resolveGeometryType(["MULTIPOINT"])).toThrow();
  });

  it("throws on no types", () => {
    expect(() => resolveGeometryType([])).toThrow();
  });
});

describe("bboxWhereClause", () => {
  it("uses struct bbox fields", () => {
    const clause = bboxWhereClause("STRUCT(xmin DOUBLE, ymin DOUBLE)", [
      [-10, -5, 10, 5],
    ]);
    expect(clause).toContain("bbox.xmin <= 10");
    expect(clause).toContain("bbox.ymax >= -5");
  });

  it("uses list bbox elements", () => {
    const clause = bboxWhereClause("DOUBLE[]", [[-10, -5, 10, 5]]);
    expect(clause).toContain("bbox[1] <= 10");
    expect(clause).toContain("bbox[4] >= -5");
  });

  it("falls back to geometry", () => {
    expect(bboxWhereClause(null, [[-10, -5, 10, 5]])).toContain(
      "ST_Intersects(geometry"
    );
  });

  it("combines multiple bboxes with OR", () => {
    const clause = bboxWhereClause(null, [
      [170, 0, 180, 10],
      [-180, 0, -170, 10],
    ]);
    expect(clause.split("ST_Intersects").length).toBe(3);
    expect(clause).toContain(" OR ");
  });
});

describe("bboxFromStatistics", () => {
  const stats = (complete = true) => [
    { path: "bbox, xmin", min: -10, max: 5, complete },
    { path: "bbox, ymin", min: -5, max: 2, complete: true },
    { path: "bbox, xmax", min: -8, max: 10, complete: true },
    { path: "bbox, ymax", min: -3, max: 5, complete: true },
  ];

  it("builds a bbox from complete statistics", () => {
    expect(bboxFromStatistics(stats())).toEqual([-10, -5, 10, 5]);
  });

  it("returns null when statistics are incomplete", () => {
    expect(bboxFromStatistics(stats(false))).toBeNull();
  });

  it("returns null when a field is missing", () => {
    expect(bboxFromStatistics(stats().slice(1))).toBeNull();
  });
});

describe("bboxFromGeoMetadata", () => {
  const geo = (bbox?: number[]) =>
    JSON.stringify({
      primary_column: "geometry",
      columns: { geometry: { encoding: "WKB", ...(bbox && { bbox }) } },
    });

  it("reads the primary column bbox", () => {
    expect(bboxFromGeoMetadata([geo([-180, -82, 180, 82])])).toEqual([
      -180, -82, 180, 82,
    ]);
  });

  it("reads a 3D bbox", () => {
    expect(bboxFromGeoMetadata([geo([-10, -5, 0, 10, 5, 100])])).toEqual([
      -10, -5, 10, 5,
    ]);
  });

  it("unions bboxes from multiple files", () => {
    expect(
      bboxFromGeoMetadata([geo([-10, -5, 0, 0]), geo([0, 0, 10, 5])])
    ).toEqual([-10, -5, 10, 5]);
  });

  it("returns null when any file is missing a bbox", () => {
    expect(bboxFromGeoMetadata([geo([-10, -5, 0, 0]), geo()])).toBeNull();
  });

  it("returns null for no metadata", () => {
    expect(bboxFromGeoMetadata([])).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(bboxFromGeoMetadata(["not json"])).toBeNull();
  });
});

describe("sqlString", () => {
  it("quotes a value", () => {
    expect(sqlString("https://example.com/items.parquet")).toBe(
      "'https://example.com/items.parquet'"
    );
  });

  it("escapes single quotes", () => {
    expect(sqlString("x') UNION SELECT 1 --")).toBe("'x'') UNION SELECT 1 --'");
  });
});
