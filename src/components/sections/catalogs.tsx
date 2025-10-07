import { Stack } from "@chakra-ui/react";
import type { StacCatalog } from "stac-ts";
import CatalogCard from "../cards/catalog";

export default function Catalogs({
  catalogs,
  setHref,
}: {
  catalogs: StacCatalog[];
  setHref: (href: string | undefined) => void;
}) {
  return (
    <Stack>
      {catalogs.map((catalog) => (
        <CatalogCard
          key={"catalog-" + catalog.id}
          catalog={catalog}
          setHref={setHref}
        />
      ))}
    </Stack>
  );
}
