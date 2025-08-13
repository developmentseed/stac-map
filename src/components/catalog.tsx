import { SkeletonText, Stack } from "@chakra-ui/react";
import { LuFolder } from "react-icons/lu";
import type { StacCatalog } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import Collections from "./collections";
import { ValueInfo } from "./value";

export default function Catalog({ catalog }: { catalog: StacCatalog }) {
  const { collections, isFetchingCollections } = useStacMap();

  return (
    <Stack gap={6}>
      <ValueInfo value={catalog} icon={<LuFolder></LuFolder>}></ValueInfo>
      {(collections && <Collections collections={collections}></Collections>) ||
        (isFetchingCollections && <SkeletonText noOfLines={3}></SkeletonText>)}
    </Stack>
  );
}
