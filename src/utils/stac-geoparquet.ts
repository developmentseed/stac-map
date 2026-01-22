import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import type { StacItemCollection } from "../types/stac";

export async function fetchStacGeoparquet({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}): Promise<StacItemCollection> {
  const query = `SELECT COUNT(*) as count, MIN(bbox.xmin) as xmin, MIN(bbox.ymin) as ymin, MAX(bbox.xmax) as xmax, MAX(bbox.ymax) as ymax FROM read_parquet('${href}')`;
  const result = await connection.query(query);
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
      },
    },
  };
}
