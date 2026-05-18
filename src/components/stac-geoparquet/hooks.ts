import { useStore } from "@/store";
import {
  fetchStacGeoparquetItem,
  fetchStacGeoparquetTable,
  fetchStacGeoparquetValue,
} from "@/components/stac-geoparquet/stac-geoparquet-utils";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useQuery } from "@tanstack/react-query";

export function useStacGeoparquetValue({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-value", href],
    queryFn: async () =>
      fetchStacGeoparquetValue({ href, connection, hivePartitioning }),
  });
}

export function useStacGeoparquetTable({
  href,
  connection,
  where,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  where?: string;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-table", href, where ?? null],
    queryFn: async () =>
      fetchStacGeoparquetTable({ href, connection, hivePartitioning, where }),
  });
}

export function useStacGeoparquetItem({
  href,
  connection,
  id,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  id: string;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-item", href, id],
    queryFn: async () =>
      fetchStacGeoparquetItem({ href, connection, hivePartitioning, id }),
  });
}
