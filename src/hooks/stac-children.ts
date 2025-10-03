import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { StacValue } from "../types/stac";
import { getStacJsonValue } from "../utils/stac";

export default function useStacChildren({
  value,
  enabled,
}: {
  value: StacValue | undefined;
  enabled: boolean;
}) {
  const results = useQueries({
    queries:
      value?.links
        ?.filter((link) => link.rel === "child")
        .map((link) => {
          return {
            queryKey: ["stac-value", link.href],
            queryFn: () => getStacJsonValue(link.href),
            enabled: enabled,
          };
        }) || [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
      };
    },
  });

  return useMemo(() => {
    const collections = [];
    const catalogs = [];
    for (const value of results.data) {
      switch (value?.type) {
        case "Catalog":
          catalogs.push(value);
          break;
        case "Collection":
          collections.push(value);
          break;
      }
    }
    return {
      collections: collections.length > 0 ? collections : undefined,
      catalogs: catalogs.length > 0 ? catalogs : undefined,
    };
  }, [results.data]);
}
