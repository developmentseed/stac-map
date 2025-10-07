import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacCollections } from "../types/stac";

export default function useStacCollections(
  href: string | undefined,
  query?: string
) {
  const initialPageParam = query ? href + "?q=" + query : href;
  return useInfiniteQuery({
    queryKey: ["stac-collections", href, query],
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
    initialPageParam,
    getNextPageParam: (lastPage: StacCollections | null) =>
      lastPage?.links?.find((link) => link.rel == "next")?.href,
    enabled: !!href,
  });
}
