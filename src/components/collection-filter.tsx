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
import { useBoundStore } from "../store";
import { isCollectionInBbox } from "../utils/stac";

export default function CollectionFilter() {
  const collections = useBoundStore((store) => store.collections);
  const setFilteredCollections = useBoundStore(
    (store) => store.setFilteredCollections
  );
  const bbox = useBoundStore((store) => store.bbox);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterViewport, setFilterViewport] = useState(true);

  useEffect(() => {
    setFilteredCollections(
      collections?.filter(
        (collection) =>
          matchesFilter(collection, searchValue) &&
          (!filterViewport || !bbox || isCollectionInBbox(collection, bbox))
      ) || null
    );
  }, [collections, setFilteredCollections, searchValue, bbox, filterViewport]);

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
        <Checkbox.Control />
        <Checkbox.Label>Filter by viewport</Checkbox.Label>
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
