import { io } from "@geoarrow/geoarrow-js";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import {
  Binary,
  Data,
  makeData,
  makeVector,
  Table,
  vectorFromArray,
} from "apache-arrow";
import * as stacWasm from "stac-wasm";
import type { DatetimeBounds, StacItemCollection } from "../types/stac";

// @ts-expect-error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
export enum ValidGeometryType {
  Point = "point",
  Polygon = "polygon",
}

const isValidGeometryType = (
  geometryType: string
): geometryType is ValidGeometryType => {
  return Object.values(ValidGeometryType).includes(
    geometryType as ValidGeometryType
  );
};

export async function getStacGeoparquet(
  href: string,
  connection: AsyncDuckDBConnection
) {
  const { startDatetimeColumnName, endDatetimeColumnName } =
    await getStacGeoparquetDatetimeColumns(href, connection);

  const query =
    startDatetimeColumnName && endDatetimeColumnName
      ? `SELECT COUNT(*) as count, MIN(bbox.xmin) as xmin, MIN(bbox.ymin) as ymin, MAX(bbox.xmax) as xmax, MAX(bbox.ymax) as ymax, MIN(${startDatetimeColumnName}) as start_datetime, MAX(${endDatetimeColumnName}) as end_datetime FROM read_parquet('${href}')`
      : `SELECT COUNT(*) as count, MIN(bbox.xmin) as xmin, MIN(bbox.ymin) as ymin, MAX(bbox.xmax) as xmax, MAX(bbox.ymax) as ymax FROM read_parquet('${href}')`;

  const summaryResult = await connection.query(query);
  const summaryRow = summaryResult.toArray().map((row) => row.toJSON())[0];

  const kvMetadataResult = await connection.query(
    `SELECT key, value FROM parquet_kv_metadata('${href}')`
  );
  const decoder = new TextDecoder("utf-8");
  const kvMetadata = Object.fromEntries(
    kvMetadataResult.toArray().map((row) => {
      const jsonRow = row.toJSON();
      const key = decoder.decode(jsonRow.key);
      let value;
      try {
        value = JSON.parse(decoder.decode(jsonRow.value));
      } catch {
        // pass
      }
      return [key, value];
    })
  );

  return {
    type: "FeatureCollection",
    bbox: [summaryRow.xmin, summaryRow.ymin, summaryRow.xmax, summaryRow.ymax],
    features: [],
    title: href.split("/").slice(-1)[0],
    description: `A stac-geoparquet file with ${summaryRow.count} items`,
    start_datetime: summaryRow.start_datetime
      ? new Date(summaryRow.start_datetime).toLocaleString()
      : null,
    end_datetime: summaryRow.end_datetime
      ? new Date(summaryRow.end_datetime).toLocaleString()
      : null,
    geoparquet_metadata: kvMetadata,
  } as StacItemCollection;
}

export async function getStacGeoparquetTable(
  href: string,
  connection: AsyncDuckDBConnection,
  datetimeBounds: DatetimeBounds | undefined
) {
  const { startDatetimeColumnName, endDatetimeColumnName } =
    await getStacGeoparquetDatetimeColumns(href, connection);

  let query = `SELECT ST_AsWKB(geometry) AS geometry, ST_GeometryType(geometry) AS geometry_type, id FROM read_parquet('${href}')`;
  if (datetimeBounds) {
    query += ` WHERE ${startDatetimeColumnName} >= DATETIME '${datetimeBounds.start.toISOString()}'  AND ${endDatetimeColumnName} <= DATETIME '${datetimeBounds.end.toISOString()}'`;
  }
  const result = await connection.query(query);
  const geometry: Uint8Array[] = result.getChildAt(0)?.toArray();
  const geometryType: string = result
    .getChildAt(1)
    ?.toArray()[0]
    ?.toLowerCase();
  if (!isValidGeometryType(geometryType)) {
    throw new Error(
      `Invalid geometry type: ${geometryType}. We currently do not support this type.`
    );
  }
  const wkb = new Uint8Array(geometry?.flatMap((array) => [...array]));
  const valueOffsets = new Int32Array(geometry.length + 1);
  for (let i = 0, len = geometry.length; i < len; i++) {
    const current = valueOffsets[i];
    valueOffsets[i + 1] = current + geometry[i].length;
  }
  const data: Data<Binary> = makeData({
    type: new Binary(),
    data: wkb,
    valueOffsets,
  });
  let table: Table | undefined = undefined;
  if (geometryType === ValidGeometryType.Polygon) {
    const polygons = io.parseWkb(data, io.WKBType.Polygon, 2);
    table = new Table({
      // @ts-expect-error: 2769
      geometry: makeVector(polygons),
      id: vectorFromArray(result.getChild("id")?.toArray()),
    });
    table.schema.fields[0].metadata.set(
      "ARROW:extension:name",
      "geoarrow.polygon"
    );
  } else if (geometryType === ValidGeometryType.Point) {
    const points = io.parseWkb(data, io.WKBType.Point, 2);
    table = new Table({
      // @ts-expect-error: 2769
      geometry: points,
      id: vectorFromArray(result.getChild("id")?.toArray()),
    });
    table.schema.fields[0].metadata.set(
      "ARROW:extension:name",
      "geoarrow.point"
    );
  }

  return {
    table: table,
    geometryType: geometryType,
  };
}

export async function getStacGeoparquetItem(
  href: string,
  connection: AsyncDuckDBConnection,
  id: string
) {
  const result = await connection.query(
    `SELECT * REPLACE ST_AsGeoJSON(geometry) as geometry FROM read_parquet('${href}') WHERE id = '${id}'`
  );
  const item = stacWasm.arrowToStacJson(result)[0];
  item.geometry = JSON.parse(item.geometry);
  return item;
}

async function getStacGeoparquetDatetimeColumns(
  href: string,
  connection: AsyncDuckDBConnection
) {
  const describeResult = await connection.query(
    `DESCRIBE SELECT * FROM read_parquet('${href}')`
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
