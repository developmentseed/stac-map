import { SkeletonText, Stack } from "@chakra-ui/react";
import { LuFolder } from "react-icons/lu";
import type { StacCatalog } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { ChildCard, Children } from "./children";
import Collections from "./collections";
import { ValueInfo } from "./value";

export default function Catalog({ catalog }: { catalog: StacCatalog }) {
  const { catalogs, collections, isFetchingCollections } = useStacMap();

  return (
    <Stack gap={6}>
      <ValueInfo value={catalog} icon={<LuFolder></LuFolder>}></ValueInfo>
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

function Catalogs({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Children heading="Catalogs">
      {catalogs.map((catalog) => (
        <ChildCard child={catalog} key={"catalog-" + catalog.id}></ChildCard>
      ))}
    </Children>
  );
}
