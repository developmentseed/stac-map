import { useStore } from "@/store";
import type { Container } from "@/types/planetary-computer";
import type { StacValue } from "@/types/stac";
import {
  fetchPlanetaryComputerToken,
  parsePlanetaryComputerContainer,
} from "@/utils/planetary-computer";
import { getGeotiffHref } from "@/utils/stac";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";
import type { StacAsset, StacItem } from "stac-ts";

export default function PlanetaryComputer({ value }: { value: StacValue }) {
  if (value.type === "Feature") return <PlanetaryComputerItem item={value} />;
  if (value.type === "FeatureCollection")
    return <PlanetaryComputerItems items={value.features} />;
}

function PlanetaryComputerItem({ item }: { item: StacItem }) {
  return (
    <PlanetaryComputerAssets
      assets={Object.values(item.assets)}
    ></PlanetaryComputerAssets>
  );
}

function PlanetaryComputerItems({ items }: { items: StacItem[] }) {
  return (
    <PlanetaryComputerAssets
      assets={items.flatMap((item) => Object.values(item.assets))}
    ></PlanetaryComputerAssets>
  );
}

function PlanetaryComputerAssets({ assets }: { assets: StacAsset[] }) {
  const setPlanetaryComputerToken = useStore(
    (store) => store.setPlanetaryComputerToken
  );
  const containerNames = [
    ...new Set(
      (
        assets
          .map((asset) => getGeotiffHref(asset))
          .map((href) => (href ? parsePlanetaryComputerContainer(href) : null))
          .filter((container) => container) as Container[]
      ).map((container) => container.storageAccount + "/" + container.container)
    ),
  ];
  const result = useQueries({
    queries: containerNames.map((containerName) => ({
      queryKey: ["planetary-computer-token", containerName],
      queryFn: async () => {
        const parts = containerName.split("/");
        const container = { storageAccount: parts[0], container: parts[1] };
        const token = await fetchPlanetaryComputerToken(container);
        return { ...container, token };
      },
    })),
  });

  useEffect(() => {
    result.forEach((r) => {
      if (r.data) setPlanetaryComputerToken(r.data);
    });
  }, [result, setPlanetaryComputerToken]);
  return <></>;
}
