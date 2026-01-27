import CollectionCard from "@/components/cards/collection";
import CollectionListItem from "@/components/list-items/collection";
import { Section } from "@/components/section";
import DatetimeSlider from "@/components/ui/datetime-slider";
import { useStore } from "@/store";
import {
  getCollectionDatetimes,
  isCollectionInBbox,
  isCollectionInDatetimes,
} from "@/utils/stac";
import {
  Button,
  Checkbox,
  CloseButton,
  Input,
  InputGroup,
  List,
  Popover,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuFilter, LuFolderPlus } from "react-icons/lu";
import type { StacCollection } from "stac-ts";

export default function Collections({
  collections,
}: {
  collections: StacCollection[];
}) {
  const filteredCollections = useStore((store) => store.filteredCollections);
  const setDatetimeBounds = useStore((store) => store.setDatetimeBounds);

  const { collectionsToShow, title } = useMemo(() => {
    return {
      collectionsToShow: filteredCollections || collections,
      title: filteredCollections
        ? `Collections (${filteredCollections.length}/${collections.length})`
        : `Collections (${collections.length})`,
    };
  }, [filteredCollections, collections]);

  useEffect(() => {
    const bounds = collections.reduce(
      (acc, collection) => {
        const { start, end } = getCollectionDatetimes(collection);
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
    setDatetimeBounds({
      start: bounds.start ? new Date(bounds.start) : null,
      end: bounds.end ? new Date(bounds.end) : null,
    });
  }, [collections, setDatetimeBounds]);

  return (
    <Section icon={<LuFolderPlus />} title={title}>
      {(listOrCard) => {
        return (
          <Stack gap={4}>
            {collections.length > 1 && (
              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button variant={"outline"} size={"sm"}>
                    <LuFilter /> Filter
                  </Button>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Arrow />
                      <Popover.Body>
                        <Filter collections={collections} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>
            )}
            {listOrCard === "list" ? (
              <List.Root variant={"plain"}>
                {collectionsToShow.map((collection) => (
                  <CollectionListItem
                    key={collection.id}
                    collection={collection}
                  />
                ))}
              </List.Root>
            ) : (
              <Stack>
                {collectionsToShow.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </Stack>
            )}
          </Stack>
        );
      }}
    </Section>
  );
}

function Filter({ collections }: { collections: StacCollection[] }) {
  const bbox = useStore((store) => store.bbox);
  const datetimeFilter = useStore((store) => store.datetimeFilter);
  const datetimeBounds = useStore((store) => store.datetimeBounds);
  const setFilteredCollections = useStore(
    (store) => store.setFilteredCollections
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [includeGlobalCollections, setIncludeGlobalCollections] =
    useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setFilteredCollections(
      collections?.filter(
        (collection) =>
          matchesFilter(collection, searchValue) &&
          (!bbox ||
            isCollectionInBbox(collection, bbox, includeGlobalCollections)) &&
          (!datetimeFilter ||
            isCollectionInDatetimes(
              collection,
              datetimeFilter.start,
              datetimeFilter.end
            ))
      ) || null
    );
  }, [
    collections,
    setFilteredCollections,
    searchValue,
    bbox,
    datetimeFilter,
    includeGlobalCollections,
  ]);

  return (
    <Stack gap={4}>
      <InputGroup
        startElement={<LuFilter />}
        endElement={
          searchValue && (
            <CloseButton
              size={"xs"}
              me="-2"
              onClick={() => {
                setSearchValue("");
                inputRef.current?.focus();
              }}
            />
          )
        }
      >
        <Input
          placeholder="Filter collections by id or title"
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
        />
      </InputGroup>
      {datetimeBounds?.start && datetimeBounds?.end && (
        <DatetimeSlider start={datetimeBounds.start} end={datetimeBounds.end} />
      )}
      <Checkbox.Root
        onCheckedChange={(e) => setIncludeGlobalCollections(!!e.checked)}
        checked={includeGlobalCollections}
        size={"sm"}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Label>Include global collections</Checkbox.Label>
        <Checkbox.Control />
      </Checkbox.Root>
    </Stack>
  );
}

function matchesFilter(collection: StacCollection, filter: string) {
  const lowerCaseFilter = filter.toLowerCase();
  return (
    collection.id.toLowerCase().includes(lowerCaseFilter) ||
    collection.title?.toLowerCase().includes(lowerCaseFilter)
  );
}
