import { convertWKBToBinaryGeometry } from "@loaders.gl/gis";
import type { BinaryGeometry, BinaryPolygonGeometry } from "@loaders.gl/schema";
import {
  Binary,
  Data,
  Field,
  FixedSizeList,
  Float,
  Float64,
  List,
  makeData,
} from "apache-arrow";

/**
@NOTE: Currently we have use a custom fork of @geoarrow/geoarrow-js because geoarrow doesn't have its own WKB parsing.
And that work currently does not support MultiPolygons.

This copy and pastes https://github.com/geoarrow/geoarrow-js/compare/geoarrow:b20df58...smohiudd:58cd5ad#diff-97545628d6c7ed29c6b573f335c96040198008d7ae160f7a8e1af71fdfd0423d
and extends to support Multipolygons
*/

type InterleavedCoord = FixedSizeList<Float>; // [x, y] or [x, y, z]
type Coord = InterleavedCoord;
type MultiPolygon = List<List<List<Coord>>>;
export type MultiPolygonData = Data<MultiPolygon>;
type WKBData = Data<Binary>;

export function parseMultiPolygonWkb(
  data: WKBData,
  type: "MultiPolygon",
  dim: number
): MultiPolygonData {
  const parsedGeometries: BinaryGeometry[] = [];

  for (const item of iterBinary(data)) {
    if (item === null) {
      throw new Error("Null entries are not currently supported");
    }
    const arrayBuffer = copyViewToArrayBuffer(item);
    // const parsed = WKBLoader.parseSync(arrayBuffer, {
    //   wkb: { shape: "binary-geometry" },
    // })as unknown as BinaryGeometry;
    const parsed = convertWKBToBinaryGeometry(arrayBuffer);
    parsedGeometries.push(parsed);
  }

  if (type == "MultiPolygon") {
    return repackMultiPolygons(
      parsedGeometries as BinaryPolygonGeometry[],
      dim
    );
  }
  throw new Error("Geometry type is not MultiPolygon and cannot be parsed");
}

function* iterBinary(data: WKBData): IterableIterator<Uint8Array | null> {
  const values = data.values;
  const valueOffsets = data.valueOffsets;
  for (let i = 0; i < data.length; i++) {
    if (!data.getValid(i)) {
      yield null;
    } else {
      const startOffset = valueOffsets[i];
      const endOffset = valueOffsets[i + 1];
      yield values.subarray(startOffset, endOffset);
    }
  }
}

// TODO: update loaders.gl parseWKB to accept Uint8Array, not just ArrayBuffer.
function copyViewToArrayBuffer(view: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(view.byteLength);
  new Uint8Array(buffer).set(view);
  return buffer;
}

type MultiPolygonCapacity = {
  coordCapacty: number;
  /** This is what loaders.gl calls `primitivePolygonIndices` */
  ringCapacity: number;
  /** This is what loaders.gl calls `polygonIndices` */
  polygonCapacity: number;
  geomCapacity: number;
};

/**
 * loaders.gl parses both Polygon and MultiPolygon WKB into a
 * BinaryPolygonGeometry. For a MultiPolygon:
 *
 * - `primitivePolygonIndices` holds the starting vertex index of each ring
 * - `polygonIndices` holds the starting vertex index of each polygon
 *
 * (both include a final entry equal to the total number of vertices).
 *
 * A Polygon is handled as a MultiPolygon with one part.
 */
function repackMultiPolygons(
  geoms: BinaryPolygonGeometry[],
  dim: number
): MultiPolygonData {
  const capacity = inferMultiPolygonCapacity(geoms);
  const coords = new Float64Array(capacity.coordCapacty * dim);
  const ringOffsets = new Int32Array(capacity.ringCapacity + 1);
  const polygonOffsets = new Int32Array(capacity.polygonCapacity + 1);
  const geomOffsets = new Int32Array(capacity.geomCapacity + 1);

  let geomIndex = 0;
  let coordOffset = 0;
  let ringOffset = 0;
  let polygonOffset = 0;

  for (const geom of geoms) {
    if (!(geom.positions.value instanceof Float64Array))
      throw new Error("geometry is not type Float64Array");
    const numCoords = geom.positions.value.length / geom.positions.size;

    coords.set(geom.positions.value, coordOffset * dim);
    coordOffset += numCoords;

    const ringIndices = geom.primitivePolygonIndices.value;
    const polygonIndices = geom.polygonIndices.value;

    // Walk the rings. Each time a ring starts at the beginning of the next
    // polygon, close off the current polygon.
    let polygonIdx = 1;
    for (let ringIdx = 0; ringIdx < ringIndices.length - 1; ringIdx++) {
      if (ringIndices[ringIdx] === polygonIndices[polygonIdx]) {
        polygonOffsets[polygonOffset + 1] = ringOffset;
        polygonOffset += 1;
        polygonIdx += 1;
      }

      ringOffsets[ringOffset + 1] =
        ringOffsets[ringOffset] +
        (ringIndices[ringIdx + 1] - ringIndices[ringIdx]);
      ringOffset += 1;
    }

    // Close off the last polygon of this geometry
    polygonOffsets[polygonOffset + 1] = ringOffset;
    polygonOffset += 1;

    geomOffsets[geomIndex + 1] = polygonOffset;
    geomIndex += 1;
  }

  const coordsData = makeData({
    type: new Float64(),
    data: coords,
  });
  const verticesData = makeData({
    type: new FixedSizeList(
      dim,
      new Field(coordFieldName(dim), coordsData.type, false)
    ),
    child: coordsData,
  });

  const ringsData = makeData({
    type: new List(new Field("vertices", verticesData.type, false)),
    valueOffsets: ringOffsets,
    child: verticesData,
  });

  const polygonsData = makeData({
    type: new List(new Field("rings", ringsData.type, false)),
    valueOffsets: polygonOffsets,
    child: ringsData,
  });

  return makeData({
    type: new List(new Field("polygons", polygonsData.type, false)),
    valueOffsets: geomOffsets,
    child: polygonsData,
  });
}

function inferMultiPolygonCapacity(
  geoms: BinaryPolygonGeometry[]
): MultiPolygonCapacity {
  const capacity: MultiPolygonCapacity = {
    coordCapacty: 0,
    ringCapacity: 0,
    polygonCapacity: 0,
    geomCapacity: 0,
  };

  for (const geom of geoms) {
    capacity.geomCapacity += 1;
    if (!(geom.primitivePolygonIndices.value.length >= 1))
      throw new Error(
        "Expected primitivePolygonIndices to always have length at least 1"
      );
    if (!(geom.polygonIndices.value.length >= 2))
      throw new Error(
        "Expected polygonIndices to always have length at least 2"
      );
    capacity.ringCapacity += geom.primitivePolygonIndices.value.length - 1;
    capacity.polygonCapacity += geom.polygonIndices.value.length - 1;
    capacity.coordCapacty += geom.positions.value.length / geom.positions.size;
  }

  return capacity;
}

function coordFieldName(dim: number): "xy" | "xyz" {
  if (dim === 2) {
    return "xy";
  } else if (dim === 3) {
    return "xyz";
  } else {
    throw new Error("expected dimension of 2 or 3");
  }
}
