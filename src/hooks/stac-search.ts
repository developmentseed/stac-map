import { useInfiniteQuery } from "@tanstack/react-query";
import type { StacLink } from "stac-ts";
import type { StacItemCollection, StacSearch } from "../types/stac";
import { fetchStac } from "../utils/stac";

export default function useStacSearch(search: StacSearch, link: StacLink) {
  return useInfiniteQuery({
    queryKey: ["search", search, link],
    initialPageParam: updateLink(link, search),
    getNextPageParam: (lastPage: StacItemCollection) =>
      lastPage.links?.find((link) => link.rel == "next"),
    queryFn: fetchSearch,
  });
}

async function fetchSearch({ pageParam }: { pageParam: StacLink }) {
  return (await fetchStac(
    pageParam.href,
    pageParam.method as "GET" | "POST" | undefined,
    (pageParam.body as StacSearch) && JSON.stringify(pageParam.body)
  )) as StacItemCollection;
}

function updateLink(link: StacLink, search: StacSearch) {
  if (!link.method) {
    link.method = "GET";
  }
  const url = new URL(link.href);
  if (link.method == "GET") {
    if (search.collections) {
      url.searchParams.set("collections", search.collections.join(","));
    }
    if (search.bbox) {
      url.searchParams.set("bbox", search.bbox.join(","));
    }
    if (search.datetime) {
      url.searchParams.set("datetime", search.datetime);
    }
  } else {
    link.body = search;
  }
  link.href = url.toString();
  return link;
}
