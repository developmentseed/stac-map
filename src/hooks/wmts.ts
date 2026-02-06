import type { WebMapLink } from "@/store/web-map-links";
import { fetchWmtsTileUrl } from "@/utils/wmts";
import { useQuery } from "@tanstack/react-query";

export function useWmtsTileUrl({
  webMapLink,
}: {
  webMapLink: WebMapLink | null;
}) {
  return useQuery({
    queryKey: ["wmts-tile-url", webMapLink?.href, webMapLink?.["wmts:layer"]],
    enabled:
      webMapLink?.rel === "wmts" &&
      (webMapLink?.["wmts:layer"]?.length ?? 0) > 0,
    queryFn: async () => {
      return await fetchWmtsTileUrl(webMapLink!);
    },
  });
}
