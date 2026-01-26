import { List, Stack } from "@chakra-ui/react";
import { LuFolder } from "react-icons/lu";
import type { StacCatalog } from "stac-ts";
import CatalogCard from "../cards/catalog";
import CatalogListItem from "../list-items/catalog";
import { Section } from "../section";

export default function Catalogs({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Section icon={<LuFolder />} title="Catalogs">
      {(listOrCard) => {
        return listOrCard === "list" ? (
          <CatalogList catalogs={catalogs} />
        ) : (
          <CatalogCards catalogs={catalogs} />
        );
      }}
    </Section>
  );
}

function CatalogList({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <List.Root>
      {catalogs.map((catalog) => (
        <CatalogListItem key={catalog.id} catalog={catalog} />
      ))}
    </List.Root>
  );
}

function CatalogCards({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Stack>
      {catalogs.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} />
      ))}
    </Stack>
  );
}
