import { LuFolderPlus } from "react-icons/lu";
import { List, Stack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import CollectionFilter from "./collection-filter";
import { Section } from "./section";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";
import { useStore } from "../store";

export default function Collections({
  collections,
}: {
  collections: StacCollection[];
}) {
  const filteredCollections = useStore((store) => store.filteredCollections);

  return (
    <Section
      icon={<LuFolderPlus />}
      title="Collections"
      count={collections.length}
      filteredCount={filteredCollections?.length}
    >
      {(listOrCard) => {
        return (
          <Stack gap={4}>
            <CollectionFilter collections={collections} />
            {listOrCard === "list" ? (
              <CollectionList
                collections={filteredCollections || collections}
              />
            ) : (
              <CollectionCards
                collections={filteredCollections || collections}
              />
            )}
          </Stack>
        );
      }}
    </Section>
  );
}

function CollectionList({ collections }: { collections: StacCollection[] }) {
  return (
    <List.Root>
      {collections.map((collection) => (
        <ValueListItem key={collection.id} value={collection} />
      ))}
    </List.Root>
  );
}

function CollectionCards({ collections }: { collections: StacCollection[] }) {
  return (
    <Stack>
      {collections.map((collection) => (
        <ValueCard key={collection.id} value={collection} />
      ))}
    </Stack>
  );
}
