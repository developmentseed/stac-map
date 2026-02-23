import DatetimeSlider from "@/components/ui/datetime-slider";
import { useStore } from "@/store";
import { isCollectionInBbox, isCollectionInDatetimes } from "@/utils/stac";
import {
  Checkbox,
  CloseButton,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuFilter } from "react-icons/lu";
import type { StacCollection } from "stac-ts";

export default function Filter({
  collections,
}: {
  collections: StacCollection[];
}) {
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
