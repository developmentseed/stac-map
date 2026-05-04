import type { AzureBlobStorageContainer } from "@/types/planetary-computer";
import { fetchPlanetaryComputerToken } from "@/utils/planetary-computer";
import { useQuery } from "@tanstack/react-query";

export function usePlanetaryComputerToken({
  container,
}: {
  container: AzureBlobStorageContainer;
}) {
  return useQuery({
    queryKey: [
      "planetary-computer-token",
      container.storageAccount,
      container.container,
    ],
    queryFn: async () => {
      return await fetchPlanetaryComputerToken(container);
    },
  });
}
