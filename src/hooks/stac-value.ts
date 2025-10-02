import { useEffect, useMemo, useState } from "react";
import type { UseFileUploadReturn } from "@chakra-ui/react";
import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { useDuckDb } from "duckdb-wasm-kit";
import type { DatetimeBounds, StacCollections, StacValue } from "../types/stac";
import { getStacJsonValue } from "../utils/stac";
import {
  getStacGeoparquet,
  getStacGeoparquetItem,
  getStacGeoparquetTable,
} from "../utils/stac-geoparquet";

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

  useEffect(() => {
    if (db && href?.endsWith(".parquet")) {
      (async () => {
        const connection = await db.connect();
        await connection.query("LOAD spatial;");
        try {
          new URL(href);
        } catch {
          const file = fileUpload.acceptedFiles[0];
          db.registerFileBuffer(href, new Uint8Array(await file.arrayBuffer()));
        }
        setConnection(connection);
      })();
    }
  }, [db, href, fileUpload]);

  const enableStacGeoparquet =
    (connection && href && href.endsWith(".parquet")) || false;

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
    queryKey: ["stac-geoparquet", href, datetimeBounds],
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
  const table = stacGeoparquetTableResult.data || undefined;
  const error =
    jsonResult.error ||
    stacGeoparquetResult.error ||
    stacGeoparquetTableResult.error ||
    undefined;

  const collectionsLink = value?.links?.find((link) => link.rel == "data");
  const collectionsResult = useInfiniteQuery({
    queryKey: ["stac-collections", collectionsLink?.href],
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return await fetch(pageParam).then((response) => {
          if (response.ok) return response.json();
          else
            throw new Error(
              `Error while fetching collections from ${pageParam}`
            );
        });
      } else {
        return null;
      }
    },
    initialPageParam: collectionsLink?.href,
    getNextPageParam: (lastPage: StacCollections | null) =>
      lastPage?.links?.find((link) => link.rel == "next")?.href,
    enabled: !!collectionsLink,
  });
  // TODO add a ceiling on the number of collections to fetch
  // https://github.com/developmentseed/stac-map/issues/101
  useEffect(() => {
    if (!collectionsResult.isFetching && collectionsResult.hasNextPage) {
      collectionsResult.fetchNextPage();
    }
  }, [collectionsResult]);

  const linkResults = useQueries({
    queries:
      value?.links
        ?.filter((link) => link.rel === "child" || link.rel === "item")
        .map((link) => {
          return {
            queryKey: ["stac-value", link.href],
            queryFn: () => getStacJsonValue(link.href),
            enabled: !collectionsLink,
          };
        }) || [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
      };
    },
  });

  const { collections, catalogs, items } = useMemo(() => {
    if (collectionsLink) {
      return {
        collections: collectionsResult.data?.pages.flatMap(
          (page) => page?.collections || []
        ),
        catalogs: undefined,
        items: undefined,
      };
    } else {
      const collections = [];
      const catalogs = [];
      const items = [];
      for (const value of linkResults.data) {
        switch (value?.type) {
          case "Catalog":
            catalogs.push(value);
            break;
          case "Collection":
            collections.push(value);
            break;
          case "Feature":
            items.push(value);
            break;
        }
      }
      return {
        collections: collections.length > 0 ? collections : undefined,
        catalogs: catalogs.length > 0 ? catalogs : undefined,
        items: items.length > 0 ? items : undefined,
      };
    }
  }, [collectionsLink, collectionsResult.data, linkResults.data]);

  return {
    value,
    error,
    collections,
    catalogs,
    items,
    table,
    stacGeoparquetItem: stacGeoparquetItem.data,
  };
}
