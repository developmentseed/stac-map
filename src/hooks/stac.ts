import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toaster } from "../components/ui/toaster";
import { fetchStac } from "../utils/stac";

export function useStacJson({
  href,
  enabled = true,
}: {
  href: string | null;
  enabled?: boolean;
}) {
  const result = useQuery({
    queryKey: ["stac-json", href],
    enabled,
    queryFn: async () => (href && (await fetchStac({ href }))) || null,
  });

  useEffect(() => {
    if (href && result.error) {
      toaster.create({
        type: "error",
        title: href,
        description: result.error.message,
      });
    }
  }, [result.error, href]);

  return result;
}
