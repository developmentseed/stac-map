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
import * as stacWasm from "stac-wasm";
import type { DatetimeFilter } from "../store/datetime";
import type { StacItemCollection } from "../types/stac";

export const SUPPORTED_GEOMETRY_TYPES = ["point", "polygon"] as const;

export async function executeDuckdbQuery({
  connection,
  select,
  href,
  where,
  hivePartitioning,
}: {
  connection: AsyncDuckDBConnection;
  select: string;
  href: string;
  where?: string;
  hivePartitioning: boolean;
}) {
  let query = `SELECT ${select} FROM read_parquet('${href}', hive_partitioning = ${hivePartitioning})`;
  if (where) {
    query += ` WHERE ${where}`;
  }
  console.log(query);

  return await connection.query(query);
}
export type SupportedGeometryType = (typeof SUPPORTED_GEOMETRY_TYPES)[number];

export async function fetchStacGeoparquet({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<StacItemCollection> {
  const result = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    select:
      "COUNT(*) as count, MIN(bbox.xmin) as xmin, MIN(bbox.ymin) as ymin, MAX(bbox.xmax) as xmax, MAX(bbox.ymax) as ymax",
  });
  const row = result.toArray().map((row) => row.toJSON())[0];
  return {
    type: "FeatureCollection",
    id: href.split("/").pop(),
    description: `A stac-geoparquet file with ${row.count} item${row.count === 1 ? "" : "s"}`,
    bbox: [row.xmin, row.ymin, row.xmax, row.ymax],
    features: [],
    assets: {
      data: {
        href: href,
        type: "application/vnd.apache.parquet",
      },
    },
  };
}

export async function fetchStacGeoparquetDatetimeBounds({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}): Promise<{ start: Date; end: Date } | null> {
  const { startDatetimeColumnName, endDatetimeColumnName } =
    await fetchStacGeoparquetDatetimeColumns(
      href,
      connection,
      hivePartitioning
    );
  if (!startDatetimeColumnName || !endDatetimeColumnName) return null;
  const result = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    select: `MIN(${startDatetimeColumnName}) as start, MAX(${endDatetimeColumnName}) as end`,
  });
  const row = result.toArray().map((row) => row.toJSON())[0];
  return {
    start: new Date(row.start),
    end: new Date(row.end),
  };
}

export async function fetchStacGeoparquetTable({
  href,
  connection,
  datetimeFilter,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  datetimeFilter: DatetimeFilter | null;
  hivePartitioning: boolean;
}) {
  let where: string | undefined;
  if (datetimeFilter) {
    const { startDatetimeColumnName, endDatetimeColumnName } =
      await fetchStacGeoparquetDatetimeColumns(
        href,
        connection,
        hivePartitioning
      );
    if (!startDatetimeColumnName || !endDatetimeColumnName) return null;
    const { start, end } = datetimeFilter;
    where = `${startDatetimeColumnName} >= '${start.toISOString()}' AND ${endDatetimeColumnName} <= '${end.toISOString()}'`;
  }
  const result = await executeDuckdbQuery({
    connection,
    href,
    hivePartitioning,
    select:
      "ST_AsWKB(geometry) AS geometry, ST_GeometryType(geometry) AS geometry_type, id",
    where,
  });
  const geometry: Uint8Array[] = result.getChildAt(0)?.toArray();
  const geometryType = result.getChildAt(1)?.toArray()[0]?.toLowerCase() as
    | string
    | undefined;
  if (
    !geometryType ||
    !SUPPORTED_GEOMETRY_TYPES.includes(geometryType as SupportedGeometryType)
  ) {
    throw new Error(
      `Unsupported geometry type: ${geometryType}. Supported types: ${SUPPORTED_GEOMETRY_TYPES.join(", ")}`
    );
  }
  const wkb = new Uint8Array(geometry?.flatMap((array) => [...array]));
  const valueOffsets = new Int32Array(geometry.length + 1);
  for (let i = 0, len = geometry.length; i < len; i++) {
    const current = valueOffsets[i];
    valueOffsets[i + 1] = current + geometry[i].length;
  }
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
  }
  return {
    table,
    geometryType: geometryType as SupportedGeometryType | undefined,
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
    where: `id = '${id}'`,
  });
  const item = stacWasm.arrowToStacJson(result)[0];
  item.geometry = JSON.parse(item.geometry);
  return item;
}

async function fetchStacGeoparquetDatetimeColumns(
  href: string,
  connection: AsyncDuckDBConnection,
  hivePartitioning: boolean
) {
  const describeResult = await connection.query(
    `DESCRIBE SELECT * FROM read_parquet('${href}', hive_partitioning = ${hivePartitioning})`
  );
  const describe = describeResult.toArray().map((row) => row.toJSON());
  const columnNames = describe.map((row) => row.column_name);
  const containsDates: boolean = columnNames.some((columnName: string) => {
    return columnName.includes("date");
  });

  if (!containsDates)
    return {
      startDatetimeColumnName: null,
      endDatetimeColumnName: null,
    };

  const startDatetimeColumnName = columnNames.includes("start_datetime")
    ? "start_datetime"
    : "datetime";
  const endDatetimeColumnName = columnNames.includes("end_datetime")
    ? "start_datetime"
    : "datetime";
  return { startDatetimeColumnName, endDatetimeColumnName };
}
