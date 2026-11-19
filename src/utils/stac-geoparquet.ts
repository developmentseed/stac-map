import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { data, io } from "@geoarrow/geoarrow-js";
import {
  Binary,
  Data,
  makeData,
  makeVector,
  Table,
  vectorFromArray,
} from "apache-arrow";
import { toaster } from "../components/ui/toaster";
import type { BBox2D } from "../store";
import type { StacItemCollection } from "../types/stac";
import {
  parseMultiPolygonWkb,
  type MultiPolygonData,
} from "./custom-wkb-parser";
import { loadStacWasm } from "./stac-wasm";

const SUPPORTED_GEOMETRY_TYPES = [
  "point",
  "polygon",
  "linestring",
  "multipolygon",
] as const;

/**
 * Quotes a value as a SQL string literal, escaping embedded single quotes.
 */
export function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

async function executeDuckdbQuery({
  connection,
  select,
  href,
  where,
  limit,
  hivePartitioning,
}: {
  connection: AsyncDuckDBConnection;
  select: string;
  href: string;
  where?: string;
  limit?: number;
  hivePartitioning: boolean;
}): Promise<Table> {
  let query = `SELECT ${select} FROM read_parquet(${sqlString(href)}, hive_partitioning = ${hivePartitioning})`;
  if (where) {
    query += ` WHERE ${where}`;
  }
  if (limit !== undefined) {
    query += ` LIMIT ${limit}`;
  }
  return (await connection.query(query)) as unknown as Table;
}
export type SupportedGeometryType = (typeof SUPPORTED_GEOMETRY_TYPES)[number];

export async function fetchStacGeoparquetValue({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<StacItemCollection> {
  const count = await fetchStacGeoparquetCount({
    href,
    connection,
    hivePartitioning,
  });
  const bbox = await fetchStacGeoparquetBbox({
    href,
    connection,
    hivePartitioning,
  });
  const datetimeExtent = await fetchStacGeoparquetDatetimeExtent({
    href,
    connection,
    hivePartitioning,
  });
  return {
    type: "FeatureCollection",
    id: href.split("/").pop(),
    description: `A stac-geoparquet file with ${count} item${count === 1 ? "" : "s"}`,
    bbox,
    features: [],
    datetimeExtent,
    assets: {
      data: {
        href: href,
        type: "application/vnd.apache.parquet",
      },
    },
  };
}

async function queryFirstRow(
  connection: AsyncDuckDBConnection,
  query: string
): Promise<Record<string, unknown> | undefined> {
  const result = (await connection.query(query)) as unknown as Table;
  return result.toArray().map((row) => row.toJSON())[0];
}

async function fetchStacGeoparquetCount({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<number> {
  const row = await queryFirstRow(
    connection,
    `SELECT SUM(num_rows) AS count FROM parquet_file_metadata(${sqlString(href)})`
  ).catch(() => undefined);
  if (row?.count != null) return Number(row.count);
  const result = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    select: "COUNT(*) AS count",
  });
  return Number(result.toArray()[0].toJSON().count);
}

async function fetchStacGeoparquetBbox({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<BBox2D> {
  const bboxType = await fetchStacGeoparquetBboxType({
    href,
    connection,
    hivePartitioning,
  });

  if (bboxType?.startsWith("STRUCT")) {
    const bbox = await fetchBboxFromStatistics({ href, connection });
    if (bbox) return bbox;
  } else if (bboxType) {
    toaster.create({
      title: "Non-spec stac-geoparquet",
      description: `The 'bbox' column has type '${bboxType}', but the stac-geoparquet spec requires a struct of {xmin, ymin, xmax, ymax}.`,
      type: "warning",
    });
  }

  const bbox = await fetchBboxFromGeoMetadata({ href, connection });
  if (bbox) return bbox;

  if (bboxType?.startsWith("STRUCT") || bboxType === "DOUBLE[]") {
    const [xmin, ymin, xmax, ymax] = bboxType.startsWith("STRUCT")
      ? ["bbox.xmin", "bbox.ymin", "bbox.xmax", "bbox.ymax"]
      : ["bbox[1]", "bbox[2]", "bbox[3]", "bbox[4]"];
    const result = await executeDuckdbQuery({
      connection,
      href,
      hivePartitioning,
      select: `MIN(${xmin}) AS xmin, MIN(${ymin}) AS ymin, MAX(${xmax}) AS xmax, MAX(${ymax}) AS ymax`,
    });
    const row = result.toArray()[0].toJSON();
    return [row.xmin, row.ymin, row.xmax, row.ymax];
  }

  const result = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    select: "ST_Extent_Agg(geometry) AS extent",
  });
  const extent = result.toArray()[0].toJSON().extent;
  return [extent.min_x, extent.min_y, extent.max_x, extent.max_y];
}

/**
 * Reads the extent of a struct `bbox` column from Parquet row group
 * statistics, without scanning the data. Returns `null` if any row group is
 * missing statistics.
 */
async function fetchBboxFromStatistics({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}): Promise<BBox2D | null> {
  try {
    const result = (await connection.query(
      `SELECT path_in_schema AS path,
        MIN(TRY_CAST(stats_min_value AS DOUBLE)) AS min,
        MAX(TRY_CAST(stats_max_value AS DOUBLE)) AS max,
        COUNT(*) = COUNT(TRY_CAST(stats_min_value AS DOUBLE))
          AND COUNT(*) = COUNT(TRY_CAST(stats_max_value AS DOUBLE)) AS complete
      FROM parquet_metadata(${sqlString(href)})
      WHERE path_in_schema IN ('bbox, xmin', 'bbox, ymin', 'bbox, xmax', 'bbox, ymax')
      GROUP BY path_in_schema`
    )) as unknown as Table;
    return bboxFromStatistics(result.toArray().map((row) => row.toJSON()));
  } catch {
    return null;
  }
}

/**
 * Builds a bbox from per-field Parquet statistics of a struct `bbox` column.
 * Returns `null` unless all four fields have complete statistics.
 */
export function bboxFromStatistics(
  rows: { path: string; min: number; max: number; complete: boolean }[]
): BBox2D | null {
  const stats = Object.fromEntries(rows.map((row) => [row.path, row]));
  const fields = ["xmin", "ymin", "xmax", "ymax"].map(
    (field) => stats[`bbox, ${field}`]
  );
  if (fields.some((field) => !field?.complete)) return null;
  const [xmin, ymin, xmax, ymax] = fields;
  return [xmin.min, ymin.min, xmax.max, ymax.max];
}

/**
 * Reads the extent from the GeoParquet `geo` file metadata, without scanning
 * the data. Returns `null` if any file is missing a bbox.
 */
async function fetchBboxFromGeoMetadata({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}): Promise<BBox2D | null> {
  try {
    const result = (await connection.query(
      `SELECT decode(value) AS value FROM parquet_kv_metadata(${sqlString(href)}) WHERE decode(key) = 'geo'`
    )) as unknown as Table;
    return bboxFromGeoMetadata(
      result.toArray().map((row) => row.toJSON().value as string)
    );
  } catch {
    return null;
  }
}

/**
 * Unions the primary geometry column bboxes from GeoParquet `geo` metadata
 * values (one per file). Returns `null` if any value is missing a bbox.
 */
export function bboxFromGeoMetadata(values: string[]): BBox2D | null {
  if (values.length === 0) return null;
  let union: BBox2D | null = null;
  for (const value of values) {
    let bbox: number[] | undefined;
    try {
      const geo = JSON.parse(value);
      bbox = geo?.columns?.[geo?.primary_column]?.bbox;
    } catch {
      return null;
    }
    if (!Array.isArray(bbox) || (bbox.length !== 4 && bbox.length !== 6))
      return null;
    const half = bbox.length / 2;
    const next: BBox2D = [bbox[0], bbox[1], bbox[half], bbox[half + 1]];
    union = union
      ? [
          Math.min(union[0], next[0]),
          Math.min(union[1], next[1]),
          Math.max(union[2], next[2]),
          Math.max(union[3], next[3]),
        ]
      : next;
  }
  return union;
}

/**
 * Returns the DuckDB type of the `bbox` column, or `null` if there isn't one.
 */
export async function fetchStacGeoparquetBboxType({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<string | null> {
  try {
    const query = `SELECT typeof(bbox) as bbox_type FROM read_parquet(${sqlString(href)}, hive_partitioning = ${hivePartitioning}) LIMIT 1`;
    const result = (await connection.query(query)) as unknown as Table;
    const row = result.toArray().map((row) => row.toJSON())[0];
    return (row?.bbox_type as string | undefined) ?? null;
  } catch {
    return null;
  }
}

async function fetchStacGeoparquetDatetimeExtent({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<[number, number] | null> {
  const statistics = await queryFirstRow(
    connection,
    `SELECT epoch_ms(MIN(TRY_CAST(stats_min_value AS TIMESTAMP))) AS min,
        epoch_ms(MAX(TRY_CAST(stats_max_value AS TIMESTAMP))) AS max,
        COUNT(*) > 0
          AND COUNT(*) = COUNT(TRY_CAST(stats_min_value AS TIMESTAMP))
          AND COUNT(*) = COUNT(TRY_CAST(stats_max_value AS TIMESTAMP)) AS complete
      FROM parquet_metadata(${sqlString(href)})
      WHERE path_in_schema = 'datetime'`
  ).catch(() => undefined);
  if (statistics?.complete)
    return [Number(statistics.min), Number(statistics.max)];
  try {
    const result = await executeDuckdbQuery({
      connection,
      href,
      hivePartitioning,
      select: "MIN(datetime) as dt_min, MAX(datetime) as dt_max",
    });
    const row = result.toArray().map((row) => row.toJSON())[0];
    const min = row?.dt_min ? new Date(row.dt_min).getTime() : NaN;
    const max = row?.dt_max ? new Date(row.dt_max).getTime() : NaN;
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return [min, max];
  } catch {
    return null;
  }
}

/**
 * Concatenates WKB geometries into a single buffer with Arrow-style offsets.
 *
 * Preallocates the output instead of building an intermediate JS array, which
 * would exceed V8's maximum array length for large files.
 */
export function concatenateWkb(geometries: Uint8Array[]): {
  data: Uint8Array;
  valueOffsets: Int32Array;
} {
  const valueOffsets = new Int32Array(geometries.length + 1);
  for (let i = 0; i < geometries.length; i++) {
    valueOffsets[i + 1] = valueOffsets[i] + geometries[i].length;
  }
  const data = new Uint8Array(valueOffsets[geometries.length]);
  for (let i = 0; i < geometries.length; i++) {
    data.set(geometries[i], valueOffsets[i]);
  }
  return { data, valueOffsets };
}

/**
 * Resolves a single geometry type for a set of per-row geometry types (as
 * returned by DuckDB's `ST_GeometryType`).
 *
 * Mixed `Polygon` and `MultiPolygon` rows resolve to `multipolygon`, since the
 * MultiPolygon parser treats a Polygon as a one-part MultiPolygon. Any other
 * mix of types, or an unsupported type, throws.
 */
export function resolveGeometryType(
  geometryTypes: (string | null)[]
): SupportedGeometryType {
  const types = new Set(
    geometryTypes.map((geometryType) => geometryType?.toLowerCase())
  );
  if (types.size === 2 && types.has("polygon") && types.has("multipolygon")) {
    return "multipolygon";
  }
  if (types.size > 1) {
    throw new Error(
      `Mixed geometry types are not supported: ${[...types].join(", ")}`
    );
  }
  const [geometryType] = types;
  if (
    !geometryType ||
    !SUPPORTED_GEOMETRY_TYPES.includes(geometryType as SupportedGeometryType)
  ) {
    throw new Error(
      `Unsupported geometry type: ${geometryType}. Supported types: ${SUPPORTED_GEOMETRY_TYPES.join(", ")}`
    );
  }
  return geometryType as SupportedGeometryType;
}

/**
 * Builds a SQL `WHERE` clause that matches items intersecting any of the given
 * bboxes.
 *
 * Uses the `bbox` column when it is a struct or list, so DuckDB can prune row
 * groups with column statistics, and falls back to the geometry otherwise.
 * Item bboxes that cross the antimeridian (`xmin > xmax`) are supported. The
 * given bboxes must not cross the antimeridian (see `normalizeViewport`).
 */
export function bboxWhereClause(
  bboxType: string | null,
  bboxes: BBox2D[]
): string {
  const clauses = bboxes.map(([west, south, east, north]) => {
    if (bboxType?.startsWith("STRUCT") || bboxType === "DOUBLE[]") {
      const [xmin, ymin, xmax, ymax] = bboxType.startsWith("STRUCT")
        ? ["bbox.xmin", "bbox.ymin", "bbox.xmax", "bbox.ymax"]
        : ["bbox[1]", "bbox[2]", "bbox[3]", "bbox[4]"];
      const intersects = `(${xmin} <= ${east} AND ${xmax} >= ${west})`;
      const crossesAntimeridian = `(${xmin} > ${xmax} AND (${xmin} <= ${east} OR ${xmax} >= ${west}))`;
      return `((${intersects} OR ${crossesAntimeridian}) AND ${ymin} <= ${north} AND ${ymax} >= ${south})`;
    }
    return `ST_Intersects(geometry, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}))`;
  });
  return clauses.length === 1 ? clauses[0] : `(${clauses.join(" OR ")})`;
}

export async function fetchStacGeoparquetTable({
  href,
  connection,
  hivePartitioning,
  where,
  limit,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
  where?: string;
  limit: number;
}) {
  const queryResult = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    where,
    limit: limit + 1,
    select:
      "ST_AsWKB(geometry) AS geometry, ST_GeometryType(geometry) AS geometry_type, id",
  });
  const truncated = queryResult.numRows > limit;
  const result = truncated ? queryResult.slice(0, limit) : queryResult;
  if (result.numRows === 0) {
    return { table: undefined, geometryType: undefined, truncated };
  }
  const geometry: Uint8Array[] = result.getChildAt(0)?.toArray() ?? [];
  const geometryType = resolveGeometryType(
    result.getChildAt(1)?.toArray() ?? []
  );

  const { data: wkb, valueOffsets } = concatenateWkb(geometry);
  const wkbData: Data<Binary> = makeData({
    type: new Binary(),
    data: wkb,
    valueOffsets,
  });
  let table: Table | undefined = undefined;
  if (geometryType === "polygon") {
    const polygons = io.parseWkb(
      wkbData,
      io.WKBType.Polygon,
      2
    ) as data.PolygonData;
    table = new Table({
      geometry: makeVector(polygons),
      id: vectorFromArray(result.getChild("id")?.toArray()),
    });
    table.schema.fields[0].metadata.set(
      "ARROW:extension:name",
      "geoarrow.polygon"
    );
  } else if (geometryType === "multipolygon") {
    const multipolygons = parseMultiPolygonWkb(
      wkbData,
      "MultiPolygon",
      2
    ) as MultiPolygonData;
    table = new Table({
      geometry: makeVector(multipolygons),
      id: vectorFromArray(result.getChild("id")?.toArray()),
    });
    table.schema.fields[0].metadata.set(
      "ARROW:extension:name",
      "geoarrow.multipolygon"
    );
  } else if (geometryType === "point") {
    const points = io.parseWkb(wkbData, io.WKBType.Point, 2) as data.PointData;
    table = new Table({
      geometry: makeVector(points),
      id: vectorFromArray(result.getChild("id")?.toArray()),
    });
    table.schema.fields[0].metadata.set(
      "ARROW:extension:name",
      "geoarrow.point"
    );
  } else if (geometryType === "linestring") {
    const linestrings = io.parseWkb(
      wkbData,
      io.WKBType.LineString,
      2
    ) as data.LineStringData;
    table = new Table({
      geometry: makeVector(linestrings),
      id: vectorFromArray(result.getChild("id")?.toArray()),
    });
    table.schema.fields[0].metadata.set(
      "ARROW:extension:name",
      "geoarrow.linestring"
    );
  }
  return {
    table,
    geometryType,
    truncated,
  };
}

export async function fetchStacGeoparquetItem({
  id,
  href,
  connection,
  hivePartitioning,
}: {
  id: string;
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}) {
  const result = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    select: "* REPLACE ST_AsGeoJSON(geometry) as geometry",
    where: `id = ${sqlString(id)}`,
    limit: 1,
  });
  const stacWasm = await loadStacWasm();
  const item = stacWasm.arrowToStacJson(result)[0];
  item.geometry = JSON.parse(item.geometry);
  return item;
}
