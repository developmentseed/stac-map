import { LuFolder } from "react-icons/lu";
import { Stack } from "@chakra-ui/react";
import type { StacCatalog } from "stac-ts";
import CatalogCard from "../cards/catalog";
import Section from "../section";

interface CatalogsProps {
  catalogs: StacCatalog[];
  setHref: (href: string | undefined) => void;
}

export default function CatalogsSection({ catalogs, setHref }: CatalogsProps) {
  const title = `Catalogs (${catalogs.length})`;
  return (
    <Section title={title} TitleIcon={LuFolder} value={"catalogs"}>
      <Catalogs catalogs={catalogs} setHref={setHref} />
    </Section>
  );
}

function Catalogs({ catalogs, setHref }: CatalogsProps) {
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
