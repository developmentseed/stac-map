import { useQuery } from "@tanstack/react-query";
import { useStore } from "../store";
import { fetchStac } from "../utils/stac";

export function useStacJson({
  href,
  enabled = true,
}: {
  href: string;
  enabled?: boolean;
}) {
  const uploadedFile = useStore((store) => store.uploadedFile);
  const result = useQuery({
    queryKey: ["stac-json", href],
    enabled,
    queryFn: async () => {
      if (href.startsWith("http")) {
        return await fetchStac({ href });
      } else if (uploadedFile) {
        return JSON.parse(await uploadedFile.text());
      } else {
        throw new Error(
          `Cannot get STAC json from href, and no file uploaded: ${href}`
        );
      }
    },
  });

  return result;
}
