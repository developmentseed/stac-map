import { Binary, makeData } from "apache-arrow";
import { describe, expect, it } from "vitest";
import { parseMultiPolygonWkb } from "../../src/utils/custom-wkb-parser";
import { concatenateWkb } from "../../src/utils/stac-geoparquet";

type Ring = [number, number][];

function polygonWkb(rings: Ring[]): Uint8Array {
  const numPoints = rings.reduce((sum, ring) => sum + ring.length, 0);
  const view = new DataView(
    new ArrayBuffer(9 + rings.length * 4 + numPoints * 16)
  );
  view.setUint8(0, 1);
  view.setUint32(1, 3, true);
  view.setUint32(5, rings.length, true);
  let offset = 9;
  for (const ring of rings) {
    view.setUint32(offset, ring.length, true);
    offset += 4;
    for (const [x, y] of ring) {
      view.setFloat64(offset, x, true);
      view.setFloat64(offset + 8, y, true);
      offset += 16;
    }
  }
  return new Uint8Array(view.buffer);
}

function multiPolygonWkb(polygons: Ring[][]): Uint8Array {
  const parts = polygons.map(polygonWkb);
  const { data: body } = concatenateWkb(parts);
  const wkb = new Uint8Array(9 + body.length);
  const view = new DataView(wkb.buffer);
  view.setUint8(0, 1);
  view.setUint32(1, 6, true);
  view.setUint32(5, polygons.length, true);
  wkb.set(body, 9);
  return wkb;
}

function square(x: number): Ring {
  return [
    [x, 0],
    [x + 1, 0],
    [x + 1, 1],
    [x, 1],
    [x, 0],
  ];
}

describe("parseMultiPolygonWkb", () => {
  it("parses mixed Polygon and MultiPolygon rows", () => {
    const { data, valueOffsets } = concatenateWkb([
      polygonWkb([square(0)]),
      multiPolygonWkb([[square(10)], [square(20)]]),
      polygonWkb([square(30)]),
    ]);
    const parsed = parseMultiPolygonWkb(
      makeData({ type: new Binary(), data, valueOffsets }),
      "MultiPolygon",
      2
    );
    expect(parsed.length).toBe(3);
    expect(Array.from(parsed.valueOffsets)).toEqual([0, 1, 3, 4]);
    const coords = parsed.children[0].children[0].children[0].children[0]
      .values as Float64Array;
    expect(coords.length).toBe(4 * 5 * 2);
    expect(coords[2 * 5 * 2]).toBe(20);
  });
});
