import { useEffect, useRef, useState } from "react";
import { LuFilter } from "react-icons/lu";
import {
  Checkbox,
  CloseButton,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import DatetimeSlider from "./datetime-slider";
import { useStore } from "../store";
import { isCollectionInBbox, isCollectionInDatetimes } from "../utils/stac";

export default function CollectionFilter({
  collections,
}: {
  collections: StacCollection[];
}) {
  const bbox = useStore((store) => store.bbox);
  const datetimeFilter = useStore((store) => store.datetimeFilter);
  const collectionDatetimeBounds = useStore(
    (store) => store.collectionDatetimeBounds
  );
  const setFilteredCollections = useStore(
    (store) => store.setFilteredCollections
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterViewport, setFilterViewport] = useState(true);

  useEffect(() => {
    setFilteredCollections(
      collections?.filter(
        (collection) =>
          matchesFilter(collection, searchValue) &&
          (!filterViewport || !bbox || isCollectionInBbox(collection, bbox)) &&
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
    filterViewport,
    datetimeFilter,
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
      <Checkbox.Root
        onCheckedChange={(e) => setFilterViewport(!!e.checked)}
        checked={filterViewport}
        size={"sm"}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Label>Filter by viewport</Checkbox.Label>
        <Checkbox.Control />
      </Checkbox.Root>
      {collectionDatetimeBounds?.start && collectionDatetimeBounds?.end && (
        <DatetimeSlider
          start={collectionDatetimeBounds.start}
          end={collectionDatetimeBounds.end}
        />
      )}
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
