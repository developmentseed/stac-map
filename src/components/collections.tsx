import { useEffect } from "react";
import { LuFolderPlus } from "react-icons/lu";
import { List, Stack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import CollectionFilter from "./collection-filter";
import { Section } from "./section";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";
import { useStore } from "../store";
import {
  getCollectionEndDatetime,
  getCollectionStartDatetime,
} from "../utils/stac";

export default function Collections({
  collections,
}: {
  collections: StacCollection[];
}) {
  const filteredCollections = useStore((store) => store.filteredCollections);
  const setCollectionDatetimeBounds = useStore(
    (store) => store.setCollectionDatetimeBounds
  );

  useEffect(() => {
    const bounds = collections.reduce(
      (acc, collection) => {
        const start = getCollectionStartDatetime(collection);
        const end = getCollectionEndDatetime(collection);
        return {
          start: start
            ? acc.start
              ? Math.min(acc.start, start.getTime())
              : start.getTime()
            : acc.start,
          end: end
            ? acc.end
              ? Math.max(acc.end, end.getTime())
              : end.getTime()
            : acc.end,
        };
      },
      { start: null as number | null, end: null as number | null }
    );
    setCollectionDatetimeBounds({
      start: bounds.start ? new Date(bounds.start) : null,
      end: bounds.end ? new Date(bounds.end) : null,
    });
  }, [collections, setCollectionDatetimeBounds]);

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
