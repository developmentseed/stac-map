import { loadGeoTIFF } from "@/utils/geotiff";
import { useStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { fetchStacValue } from "../utils/stac";

export function useStacValue({ href }: { href: string }) {
  const uploadedFile = useStore((store) => store.uploadedFile);
  return useQuery({
    queryKey: ["stac-value", href],
    queryFn: async () => fetchStacValue({ href, uploadedFile }),
  });
}

export function useGeoTIFF(href: string | undefined) {
  return useQuery({
    queryKey: ["geotiff", href],
    queryFn: async () => loadGeoTIFF(href!),
    enabled: !!href,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
