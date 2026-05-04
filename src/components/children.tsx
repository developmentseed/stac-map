import { fetchStacValue } from "@/utils/stac";
import { CloseButton, Input, InputGroup } from "@chakra-ui/react";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LuFolder, LuSearch } from "react-icons/lu";
import type { StacCatalog, StacLink } from "stac-ts";
import CatalogCard from "./cards/catalog";
import { Collections } from "./collections";
import CatalogListItem from "./list-items/catalog";
import EntityList from "./ui/entity-list";
import Section from "./ui/section";

export default function Children({ links }: { links: StacLink[] }) {
  const results = useQueries({
    queries: links.map((link) => ({
      queryKey: ["stac-value", link.href],
      queryFn: async () => fetchStacValue({ href: link.href }),
    })),
  });

  const { catalogs, collections } = useMemo(() => {
    const catalogs: StacCatalog[] = [];
    const collections = [];
    for (const result of results) {
      if (result.data?.type === "Catalog") catalogs.push(result.data);
      if (result.data?.type === "Collection") collections.push(result.data);
    }
    return { catalogs, collections };
  }, [results]);

  return (
    <>
      {collections.length > 0 && <Collections collections={collections} />}
      {catalogs.length > 0 && <Catalogs catalogs={catalogs} />}
    </>
  );
}

function Catalogs({ catalogs }: { catalogs: StacCatalog[] }) {
  const [filterText, setFilterText] = useState("");

  const filteredCatalogs = useMemo(() => {
    const needle = filterText.trim().toLowerCase();
    if (!needle) return catalogs;
    return catalogs.filter((catalog) => {
      const id = catalog.id?.toLowerCase() ?? "";
      const title = catalog.title?.toLowerCase() ?? "";
      return id.includes(needle) || title.includes(needle);
    });
  }, [catalogs, filterText]);

  const title = `Catalogs (${filteredCatalogs.length}/${catalogs.length})`;

  const filters = (
    <InputGroup
      startElement={<LuSearch />}
      endElement={
        filterText && (
          <CloseButton
            size={"xs"}
            variant={"plain"}
            onClick={() => setFilterText("")}
          />
        )
      }
    >
      <Input
        size={"sm"}
        placeholder={"Filter by id or title"}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
    </InputGroup>
  );

  return (
    <Section icon={<LuFolder />} title={title}>
      <EntityList
        items={filteredCatalogs}
        getKey={(catalog) => catalog.id}
        renderCard={(catalog) => <CatalogCard catalog={catalog} />}
        renderListItem={(catalog) => <CatalogListItem catalog={catalog} />}
        filters={filters}
        defaultView={"card"}
      />
    </Section>
  );
}
