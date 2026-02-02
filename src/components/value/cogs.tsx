import {
  usePlanetaryComputerToken,
  usePlanetaryComputerTokens,
} from "@/hooks/planetary-computer";
import { useStore } from "@/store";
import type { CogSource } from "@/store/cogs";
import type {
  AzureBlobStorageContainer,
  PlanetaryComputerTokens,
} from "@/types/planetary-computer";
import {
  parsePlanetaryComputerContainer,
  signPlanetaryComputerHref,
  signPlanetaryComputerHrefFromTokens,
} from "@/utils/planetary-computer";
import { getBestAsset, getGeotiffHref } from "@/utils/stac";
import { useEffect, useMemo } from "react";
import type { StacAsset, StacItem } from "stac-ts";

export function CogHref({ asset }: { asset: StacAsset }) {
  const restrictToThreeBandCogs = useStore(
    (store) => store.restrictToThreeBandCogs
  );
  const geotiffHref = getGeotiffHref(asset, restrictToThreeBandCogs);
  const container = geotiffHref
    ? parsePlanetaryComputerContainer(geotiffHref)
    : null;
  if (geotiffHref)
    return container ? (
      <PlanetaryComputerCogHref container={container} href={geotiffHref} />
    ) : (
      <SetCogHref href={geotiffHref} />
    );
}

function PlanetaryComputerCogHref({
  container,
  href,
}: {
  container: AzureBlobStorageContainer;
  href: string;
}) {
  const { data: token } = usePlanetaryComputerToken({ container });
  return token && <SetCogHref href={signPlanetaryComputerHref(href, token)} />;
}

function SetCogHref({ href }: { href: string }) {
  const setCogHref = useStore((store) => store.setCogHref);
  useEffect(() => {
    setCogHref(href);
  }, [href, setCogHref]);
  return <></>;
}

export function CogSources({ items }: { items: StacItem[] }) {
  const restrictToThreeBandCogs = useStore(
    (store) => store.restrictToThreeBandCogs
  );
  const sources = items
    .map((item) => itemToSource(item, restrictToThreeBandCogs))
    .filter((source) => !!source);
  const planetaryComputerContainerNames = [
    ...new Set(
      sources
        .map((source) => {
          const container = parsePlanetaryComputerContainer(
            source.assets.data.href
          );
          return container ? toContainerName(container) : null;
        })
        .filter((name): name is string => !!name)
    ),
  ];
  return planetaryComputerContainerNames.length > 0 ? (
    <PlanetaryComputerCogSources
      containerNames={planetaryComputerContainerNames}
      sources={sources}
    />
  ) : (
    <SetCogSources sources={sources} />
  );
}

function PlanetaryComputerCogSources({
  containerNames,
  sources,
}: {
  containerNames: string[];
  sources: CogSource[];
}) {
  const containers = useMemo(() => {
    return containerNames.map(toContainer);
  }, [containerNames]);
  const { data, isComplete } = usePlanetaryComputerTokens({
    containers,
  });
  if (isComplete) {
    const tokens: PlanetaryComputerTokens = {};
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      tokens[container.storageAccount] ??= {};
      tokens[container.storageAccount][container.container] = data[i];
    }
    return (
      <SetCogSources
        sources={sources.map((source) => ({
          ...source,
          assets: {
            data: {
              href:
                signPlanetaryComputerHrefFromTokens(
                  source.assets.data.href,
                  tokens
                ) || source.assets.data.href,
            },
          },
        }))}
      />
    );
  }
}

function SetCogSources({ sources }: { sources: CogSource[] }) {
  const setCogSources = useStore((store) => store.setCogSources);
  useEffect(() => {
    setCogSources(sources);
  }, [sources, setCogSources]);
  return <></>;
}

export function PagedCogSources({ pages }: { pages: StacItem[][] }) {
  const restrictToThreeBandCogs = useStore(
    (store) => store.restrictToThreeBandCogs
  );
  const pagedSources = pages.map((page) =>
    page
      .map((item) => itemToSource(item, restrictToThreeBandCogs))
      .filter((source) => !!source)
  );
  const planetaryComputerContainerNames = [
    ...new Set(
      pagedSources
        .flatMap((pages) =>
          pages.map((source) => {
            const container = parsePlanetaryComputerContainer(
              source.assets.data.href
            );
            return container ? toContainerName(container) : null;
          })
        )
        .filter((name): name is string => !!name)
    ),
  ];
  return planetaryComputerContainerNames.length > 0 ? (
    <PlanetaryComputerPagedCogSources
      containerNames={planetaryComputerContainerNames}
      pagedSources={pagedSources}
    />
  ) : (
    <SetPagedCogSources pagedSources={pagedSources} />
  );
}

function PlanetaryComputerPagedCogSources({
  containerNames,
  pagedSources,
}: {
  containerNames: string[];
  pagedSources: CogSource[][];
}) {
  const containers = useMemo(() => {
    return containerNames.map(toContainer);
  }, [containerNames]);
  const { data, isComplete } = usePlanetaryComputerTokens({
    containers,
  });
  if (isComplete) {
    const tokens: PlanetaryComputerTokens = {};
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      tokens[container.storageAccount] ??= {};
      tokens[container.storageAccount][container.container] = data[i];
    }
    return (
      <SetPagedCogSources
        pagedSources={pagedSources.map((page) =>
          page.map((source) => ({
            ...source,
            assets: {
              data: {
                href:
                  signPlanetaryComputerHrefFromTokens(
                    source.assets.data.href,
                    tokens
                  ) || source.assets.data.href,
              },
            },
          }))
        )}
      />
    );
  }
}

function SetPagedCogSources({ pagedSources }: { pagedSources: CogSource[][] }) {
  const setPagedCogSources = useStore((store) => store.setPagedCogSources);
  useEffect(() => {
    setPagedCogSources(pagedSources);
  }, [pagedSources, setPagedCogSources]);
  return <></>;
}

function itemToSource(
  item: StacItem,
  restrictToThreeBandCogs: boolean
): CogSource | null {
  const [, bestAsset] = getBestAsset(item, restrictToThreeBandCogs);
  const geotiffHref =
    bestAsset && getGeotiffHref(bestAsset, restrictToThreeBandCogs);
  return geotiffHref && item.bbox
    ? {
        bbox: item.bbox as [number, number, number, number],
        id: item.id,
        assets: { data: { href: geotiffHref } },
      }
    : null;
}

function toContainerName(container: AzureBlobStorageContainer) {
  return `${container.storageAccount}/${container.container}`;
}

function toContainer(name: string) {
  const [storageAccount, container] = name.split("/");
  return { storageAccount, container };
}
