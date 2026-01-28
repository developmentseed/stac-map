import type {
  AzureBlobStorageContainer,
  PlanetaryComputerToken,
} from "@/types/planetary-computer";
import { fetchPlanetaryComputerToken } from "@/utils/planetary-computer";
import { useQueries, useQuery } from "@tanstack/react-query";

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

export function usePlanetaryComputerTokens({
  containers,
}: {
  containers: AzureBlobStorageContainer[];
}) {
  return useQueries({
    queries: containers.map((container) => ({
      queryKey: [
        "planetary-computer-token",
        container.storageAccount,
        container.container,
      ],
      queryFn: async () => {
        return await fetchPlanetaryComputerToken(container);
      },
    })),
    combine: (results) => {
      return {
        data: results
          .map((result) => result.data)
          .filter((data): data is PlanetaryComputerToken => !!data),
        isComplete: results.every((result) => result.isSuccess),
      };
    },
  });
}
