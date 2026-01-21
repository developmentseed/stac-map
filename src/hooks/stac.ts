import { useQuery } from "@tanstack/react-query";
import { useStore } from "../store";
import { fetchStac } from "../utils/stac";
import {
  fetchStacGeoparquet,
  getUploadedStacGeoparquet,
} from "../utils/stac-geoparquet";

export function useStac({
  href,
  enabled = true,
}: {
  href: string;
  enabled?: boolean;
}) {
  const uploadedFile = useStore((store) => store.uploadedFile);
  const connection = useStore((store) => store.connection);
  const isStacGeoparquet = href.endsWith(".parquet");

  const result = useQuery({
    queryKey: ["stac", href, !!connection],
    enabled,
    queryFn: async () => {
      if (href.startsWith("http")) {
        if (isStacGeoparquet) {
          if (connection)
            return await fetchStacGeoparquet({ href, connection });
          else return null;
        } else {
          return await fetchStac({ href });
        }
      } else if (uploadedFile) {
        if (isStacGeoparquet) {
          return getUploadedStacGeoparquet({ href, uploadedFile });
        } else {
          return JSON.parse(await uploadedFile.text());
        }
      } else {
        throw new Error(
          `Cannot get STAC json from href, and no file uploaded: ${href}`
        );
      }
    },
  });

  return result;
}
