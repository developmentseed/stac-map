import type { StacItemCollection, StacSearch } from "@/types/stac";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type DatetimeFilter } from "../store/datetime";
import { fetchStac, getLinkHref } from "../utils/stac";
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
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}) {
  return useQuery({
    queryKey: ["stac-geoparquet", href, hivePartitioning],
    queryFn: async () => {
      return await fetchStacGeoparquet({ href, connection, hivePartitioning });
    },
  });
}

export function useStacGeoparquetDatetimeBounds({
  href,
  connection,
  hivePartitioning,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  hivePartitioning: boolean;
}) {
  return useQuery({
    queryKey: ["stac-geoparquet-datetime-bounds", href, hivePartitioning],
    queryFn: async () => {
      return await fetchStacGeoparquetDatetimeBounds({
        href,
        connection,
        hivePartitioning,
      });
    },
  });
}

export function useStacGeoparquetTable({
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
  return useQuery({
    queryKey: ["stac-geoparquet-table", href, datetimeFilter, hivePartitioning],
    queryFn: async () => {
      return await fetchStacGeoparquetTable({
        href,
        connection,
        datetimeFilter,
        hivePartitioning,
      });
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useStacGeoparquetItem({
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
  return useQuery({
    queryKey: ["stac-geoparquet-item", id, href, hivePartitioning],
    queryFn: async () => {
      return await fetchStacGeoparquetItem({
        id,
        href,
        connection,
        hivePartitioning,
      });
    },
  });
}

export function useStacSearch({
  href,
  search,
}: {
  href: string;
  search: StacSearch;
}) {
  const url = new URL(href);
  url.searchParams.set("collections", search.collections.join(","));
  if (search.bbox) url.searchParams.set("bbox", search.bbox.join(","));
  if (search.datetime) url.searchParams.set("datetime", search.datetime);
  if (search.limit) url.searchParams.set("limit", search.limit.toFixed(0));
  const searchHref = url.toString();

  return useInfiniteQuery({
    queryKey: ["stac-search", searchHref],
    enabled: search.collections.length > 0,
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return (await fetchStac({
          href: pageParam,
          method: "GET",
        })) as StacItemCollection;
      } else {
        return null;
      }
    },
    initialPageParam: searchHref,
    getNextPageParam: (lastPage) =>
      lastPage ? getLinkHref(lastPage, "next") : null,
  });
}
