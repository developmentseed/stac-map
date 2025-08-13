import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useEffect } from "react";
import type { StacCatalog, StacCollection, StacItem } from "stac-ts";
import { fetchStac, fetchStacLink } from "../http";
import type { StacCollections, StacValue } from "../types/stac";

import { booleanValid } from "@turf/boolean-valid";

export default function useStacChildrenAndItems(
  value: StacValue | undefined,
  href: string | undefined,
) {
  const { collections, isFetching: isFetchingCollections } =
    useStacCollections(value);
  const {
    catalogs,
    collections: childCollections,
    items,
    warnings,
  } = useStacLinks(value, href);

  return {
    catalogs,
    collections: collections || childCollections,
    isFetchingCollections,
    items,
    warnings,
  };
}

function useStacCollections(value: StacValue | undefined) {
  const href = value?.links?.find((link) => link.rel == "data")?.href;
  const { data, isFetching, hasNextPage, fetchNextPage } =
    useInfiniteQuery<StacCollections | null>({
      queryKey: ["collections", href],
      enabled: !!href,
      queryFn: async ({ pageParam }) => {
        if (pageParam) {
          // @ts-expect-error Not worth templating stuff
          return await fetchStac(pageParam);
        } else {
          return null;
        }
      },
      initialPageParam: href,
      getNextPageParam: (lastPage: StacCollections | null) =>
        lastPage?.links?.find((link) => link.rel == "next")?.href,
    });

  useEffect(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  return {
    collections: data?.pages.flatMap((page) => page?.collections || []),
    isFetching,
  };
}

function useStacLinks(value: StacValue | undefined, href: string | undefined) {
  const results = useQueries({
    queries:
      value?.links
        ?.filter((link) => link.rel == "item" || link.rel == "child")
        .map((link) => {
          return {
            queryKey: ["link", link, href],
            queryFn: () => fetchStacLink(link, href),
          };
        }) || [],
  });
  const catalogs: StacCatalog[] = [];
  const collections: StacCollection[] = [];
  const items: StacItem[] = [];
  const warnings: string[] = [];

  results.forEach((result) => {
    if (result.data) {
      switch (result.data.type) {
        case "Catalog":
          catalogs.push(result.data);
          break;
        case "Collection":
          collections.push(result.data);
          break;
        case "Feature":
          if (booleanValid(result.data)) {
            items.push(result.data);
          } else {
            warnings.push(`Invalid item: ${result.data.id}`);
          }
          break;
      }
    }
  });

  return { catalogs, collections, items, warnings };
}
