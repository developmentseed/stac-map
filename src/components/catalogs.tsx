import { List, Stack } from "@chakra-ui/react";
import { LuFolder } from "react-icons/lu";
import type { StacCatalog } from "stac-ts";
import { Section } from "./section";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";

export default function Catalogs({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Section icon={<LuFolder />} title="Catalogs" count={catalogs.length}>
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
        <ValueListItem key={catalog.id} value={catalog} />
      ))}
    </List.Root>
  );
}

function CatalogCards({ catalogs }: { catalogs: StacCatalog[] }) {
  return (
    <Stack>
      {catalogs.map((catalog) => (
        <ValueCard key={catalog.id} value={catalog} />
      ))}
    </Stack>
  );
}
