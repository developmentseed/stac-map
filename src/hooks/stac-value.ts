import { useEffect, useState } from "react";
import type { UseFileUploadReturn } from "@chakra-ui/react";
import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { Table } from "apache-arrow";
import type { StacItem } from "stac-ts";
import { useDuckDb } from "duckdb-wasm-kit";
import type { DatetimeBounds, StacValue } from "../types/stac";
import { getStacJsonValue } from "../utils/stac";
import {
  getStacGeoparquet,
  getStacGeoparquetItem,
  getStacGeoparquetTable,
} from "../utils/stac-geoparquet";
import { ValidGeometryType } from "../utils/stac-geoparquet";

export interface GeoparquetTable {
  // eslint-disable-next-line
  table: Table<any> | undefined;
  geometryType: ValidGeometryType | undefined;
}

export default function useStacValue({
  href,
  fileUpload,
  datetimeBounds,
  stacGeoparquetItemId,
}: {
  href: string | undefined;
  fileUpload: UseFileUploadReturn;
  datetimeBounds: DatetimeBounds | undefined;
  stacGeoparquetItemId: string | undefined;
}) {
  const { db } = useDuckDb();
  const [connection, setConnection] = useState<AsyncDuckDBConnection>();
  const enableStacGeoparquet =
    (connection && href && href.endsWith(".parquet")) || false;

  useEffect(() => {
    if (db && href?.endsWith(".parquet")) {
      (async () => {
        const connection = await db.connect();
        await connection.query("LOAD spatial;");
        await connection.query("LOAD icu;");
        try {
          new URL(href);
        } catch {
          const file = fileUpload.acceptedFiles[0];
          db.registerFileBuffer(href, new Uint8Array(await file.arrayBuffer()));
        }
        setConnection(connection);
      })();
    }
  }, [db, href, fileUpload.acceptedFiles]);

  const jsonResult = useQuery<StacValue | null>({
    queryKey: ["stac-value", href],
    queryFn: () => getStacJsonValue(href || "", fileUpload),
    enabled: (href && !href.endsWith(".parquet")) || false,
  });
  const stacGeoparquetResult = useQuery({
    queryKey: ["stac-geoparquet", href],
    queryFn: () =>
      (href && connection && getStacGeoparquet(href, connection)) || null,
    enabled: enableStacGeoparquet,
  });
  const stacGeoparquetTableResult = useQuery({
    queryKey: ["stac-geoparquet-table", href, datetimeBounds],
    queryFn: () =>
      (href &&
        connection &&
        getStacGeoparquetTable(href, connection, datetimeBounds)) ||
      null,
    placeholderData: (previousData) => previousData,
    enabled: enableStacGeoparquet,
  });
  const stacGeoparquetItem = useQuery({
    queryKey: ["stac-geoparquet-item", href, stacGeoparquetItemId],
    queryFn: () =>
      href &&
      connection &&
      stacGeoparquetItemId &&
      getStacGeoparquetItem(href, connection, stacGeoparquetItemId),
    enabled: enableStacGeoparquet && !!stacGeoparquetItemId,
  });
  const value = jsonResult.data || stacGeoparquetResult.data || undefined;
  const table: GeoparquetTable | undefined = enableStacGeoparquet
    ? {
        table: stacGeoparquetTableResult.data?.table || undefined,
        geometryType: stacGeoparquetTableResult.data?.geometryType || undefined,
      }
    : undefined;

  const error =
    jsonResult.error ||
    stacGeoparquetResult.error ||
    stacGeoparquetTableResult.error ||
    undefined;

  const itemsResult = useQueries({
    queries:
      value?.links
        ?.filter((link) => link.rel === "item")
        .map((link) => {
          return {
            queryKey: ["stac-value", link.href],
            queryFn: () => getStacJsonValue(link.href) as Promise<StacItem>,
            enabled: !!(href && value),
          };
        }) || [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data).filter((value) => !!value),
      };
    },
  });
  return {
    value,
    error,
    geoparqetTable: table,
    stacGeoparquetItem: stacGeoparquetItem.data,
    items: itemsResult.data.length > 0 ? itemsResult.data : undefined,
  };
}
