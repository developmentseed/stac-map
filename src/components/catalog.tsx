import { SkeletonText, Stack } from "@chakra-ui/react";
import type { StacCatalog } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { ChildCard, Children } from "./children";
import { Collections } from "./collection";
import Value from "./value";

export function Catalog({ catalog }: { catalog: StacCatalog }) {
  const { catalogs, collections, isFetchingCollections } = useStacMap();
  return (
    <Stack>
      <Value value={catalog}></Value>
      {catalogs && catalogs.length > 0 && (
        <Catalogs catalogs={catalogs}></Catalogs>
      )}
      {(collections && collections.length > 0 && (
        <Collections collections={collections}></Collections>
      )) ||
        (isFetchingCollections && <SkeletonText noOfLines={3}></SkeletonText>)}
    </Stack>
  );
}

export function Catalogs({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Children heading="Catalogs">
      {catalogs.map((catalog) => (
        <ChildCard child={catalog} key={"catalog-" + catalog.id}></ChildCard>
      ))}
    </Children>
  );
}
