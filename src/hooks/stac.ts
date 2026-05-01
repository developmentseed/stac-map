import { useQuery } from "@tanstack/react-query";
import { fetchStacValue } from "../utils/stac";

export function useStacValue({ href }: { href: string }) {
  return useQuery({
    queryKey: ["stac-value", href],
    queryFn: async () => fetchStacValue({ href }),
  });
}
