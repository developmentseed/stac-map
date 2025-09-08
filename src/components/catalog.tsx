import { HStack, Icon, Stack } from "@chakra-ui/react";
import { LuFolderPlus, LuFolderSearch } from "react-icons/lu";
import type { StacCatalog } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { ChildCard } from "./children";
import { CollectionSearch } from "./search/collection";
import Section from "./section";
import Value from "./value";

export function Catalog({ catalog }: { catalog: StacCatalog }) {
  const { catalogs, collections } = useStacMap();
  const selfHref = catalog.links?.find((link) => link.rel === "self")?.href;
  return (
    <Stack>
      <Value value={catalog}></Value>
      {collections && collections?.length > 0 && (
        <Section
          title={
            <HStack>
              <Icon>
                <LuFolderSearch></LuFolderSearch>
              </Icon>{" "}
              Collection search
            </HStack>
          }
        >
          <CollectionSearch
            href={selfHref}
            collections={collections}
          ></CollectionSearch>
        </Section>
      )}
      {catalogs && catalogs.length > 0 && (
        <Section title="Catalogs">
          <Stack>
            {catalogs.map((catalog) => (
              <ChildCard
                child={catalog}
                key={"catalog-" + catalog.id}
              ></ChildCard>
            ))}
          </Stack>
        </Section>
      )}
      {collections && collections.length > 0 && (
        <Section
          title={
            <HStack>
              <Icon>
                <LuFolderPlus></LuFolderPlus>
              </Icon>{" "}
              Collections ({collections.length})
            </HStack>
          }
        >
          <Stack>
            {collections.map((collection) => (
              <ChildCard
                child={collection}
                key={"collection-" + collection.id}
              ></ChildCard>
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  );
}
