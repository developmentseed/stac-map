import { useStore } from "@/store";
import {
  fetchStacGeoparquetItem,
  fetchStacGeoparquetTable,
  fetchStacGeoparquetValue,
} from "@/utils/stac-geoparquet";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useQuery } from "@tanstack/react-query";
import { fetchStacValue } from "../utils/stac";

export function useStacValue({ href }: { href: string }) {
  return useQuery({
    queryKey: ["stac-value", href],
    queryFn: async () => fetchStacValue({ href }),
  });
}

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
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  return useQuery({
    queryKey: ["stac-geoparquet-table", href],
    queryFn: async () =>
      fetchStacGeoparquetTable({ href, connection, hivePartitioning }),
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
