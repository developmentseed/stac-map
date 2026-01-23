import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useQuery } from "@tanstack/react-query";
import { type DatetimeFilter } from "../store/datetime";
import { fetchStac } from "../utils/stac";
import {
  fetchStacGeoparquet,
  fetchStacGeoparquetDatetimeBounds,
  fetchStacGeoparquetItem,
  fetchStacGeoparquetTable,
} from "../utils/stac-geoparquet";

export function useStacJson({
  href,
  enabled = true,
}: {
  href: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["stac-json", href],
    enabled,
    queryFn: async () => {
      return await fetchStac({ href });
    },
  });
}

export function useStacJsonFromFile({ file }: { file: File }) {
  return useQuery({
    queryKey: ["stac-json-from-file", file.name],
    queryFn: async () => {
      return JSON.parse(await file.text());
    },
  });
}

export function useStacGeoparquet({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  return useQuery({
    queryKey: ["stac-geoparquet", href],
    queryFn: async () => {
      return await fetchStacGeoparquet({ href, connection });
    },
  });
}

export function useStacGeoparquetDatetimeBounds({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  return useQuery({
    queryKey: ["stac-geoparquet-datetime-bounds", href],
    queryFn: async () => {
      return await fetchStacGeoparquetDatetimeBounds({ href, connection });
    },
  });
}

export function useStacGeoparquetTable({
  href,
  connection,
  datetimeFilter,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  datetimeFilter: DatetimeFilter | null;
}) {
  return useQuery({
    queryKey: ["stac-geoparquet-table", href, datetimeFilter],
    queryFn: async () => {
      return await fetchStacGeoparquetTable({
        href,
        connection,
        datetimeFilter,
      });
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useStacGeoparquetItem({
  id,
  href,
  connection,
}: {
  id: string;
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  return useQuery({
    queryKey: ["stac-geoparquet-item", id, href],
    queryFn: async () => {
      return await fetchStacGeoparquetItem({ id, href, connection });
    },
  });
}
