import { Section } from "@/components/section";
import { useStacSearch } from "@/hooks/stac";
import { useItems } from "@/hooks/store";
import { useStore } from "@/store/index.ts";
import type { StacSearch } from "@/types/stac";
import { paddedBbox } from "@/utils/bbox";
import { getCollectionDatetimes } from "@/utils/stac";
import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  HStack,
  Input,
  Popover,
  Portal,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  LuCalendar,
  LuForward,
  LuFrame,
  LuLoader,
  LuPause,
  LuPlay,
  LuSearch,
  LuX,
} from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import { Json } from "../json";

interface Props {
  href: string;
  collection: StacCollection;
}

interface SetSearchParams {
  bbox?: [number, number, number, number];
  datetime?: string;
}

export default function Search({ href, collection }: Props) {
  const search = useStore((store) => store.search);
  const setSearch = useStore((store) => store.setSearch);
  const setPagedItems = useStore((store) => store.setPagedItems);
  const result = useStacSearch({ href, search });
  const setDatetimeBounds = useStore((store) => store.setDatetimeBounds);

  const numberMatched = useMemo(() => {
    if (result.data) return result.data.pages.at(0)?.numberMatched;
  }, [result.data]);

  useEffect(() => {
    if (search.collections.at(0) !== collection.id)
      setSearch({ collections: [collection.id] });
  }, [collection, setSearch, search]);

  useEffect(() => {
    if (result.data)
      setPagedItems(result.data.pages.map((page) => page?.features || []));
  }, [result.data, setPagedItems]);

  useEffect(() => {
    setDatetimeBounds(getCollectionDatetimes(collection));
  }, [collection, setDatetimeBounds]);

  return (
    <Section icon={<LuSearch />} title="Item search">
      <Stack gap={4}>
        <SearchControls
          collection={collection}
          setSearch={(params: SetSearchParams) =>
            setSearch({ ...search, collections: [collection.id], ...params })
          }
          resetSearch={() => setSearch({ collections: [collection.id] })}
          {...result}
        />
        {numberMatched && (
          <SearchProgress numberMatched={numberMatched} {...result} />
        )}
        <SearchDetails search={search} />
      </Stack>
    </Section>
  );
}

function SearchControls({
  collection,
  setSearch,
  resetSearch,
  isFetching,
  fetchNextPage,
  hasNextPage,
}: {
  collection: StacCollection;
  setSearch: (params: SetSearchParams) => void;
  resetSearch: () => void;
} & UseInfiniteQueryResult) {
  const [fetchAll, setFetchAll] = useState(false);
  const bbox = useStore((store) => store.bbox);
  const { start, end } = getCollectionDatetimes(collection);

  useEffect(() => {
    if (fetchAll && !isFetching && hasNextPage) fetchNextPage();
  }, [fetchAll, isFetching, hasNextPage, fetchNextPage]);

  return (
    <Stack>
      <ButtonGroup size={"xs"} variant={"surface"} attached>
        <Button
          disabled={isFetching || fetchAll || !hasNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetching ? <LuLoader /> : <LuForward />}
          Next page
        </Button>
        <Button
          onClick={() => setFetchAll((previous) => !previous)}
          disabled={!hasNextPage}
        >
          {fetchAll && hasNextPage ? <LuPause /> : <LuPlay />}
          {fetchAll ? "Pause" : "Fetch all"}
        </Button>
      </ButtonGroup>

      <ButtonGroup size={"xs"} variant={"outline"} attached>
        <Button
          onClick={() =>
            setSearch({ bbox: bbox ? paddedBbox(bbox) : undefined })
          }
        >
          <LuFrame />
          Set bbox to viewport
        </Button>
        <DatetimePopover
          start={start}
          end={end}
          setDatetime={(datetime) => setSearch({ datetime })}
        />
        <Button onClick={() => resetSearch()}>
          <LuX />
          Reset
        </Button>
      </ButtonGroup>
    </Stack>
  );
}

function DatetimePopover({
  start,
  end,
  setDatetime,
}: {
  start: Date | null;
  end: Date | null;
  setDatetime: (datetime: string) => void;
}) {
  const [startUnbounded, setStartUnbounded] = useState(!start);
  const [endUnbounded, setEndUnbounded] = useState(!end);
  const [startInput, setStartInput] = useState(start?.getTime());
  const [endInput, setEndInput] = useState(end?.getTime());

  const searchStart = startUnbounded ? undefined : startInput;
  const searchEnd = endUnbounded ? undefined : endInput;

  let error: string | undefined;
  if (startInput && endInput && startInput > endInput)
    error = "Start datetime is after end datetime";

  return (
    <Popover.Root
      onOpenChange={(e) => {
        if (!e.open && !error)
          setDatetime(toSearchDatetime(searchStart, searchEnd));
      }}
    >
      <Popover.Trigger asChild>
        <Button>
          <LuCalendar />
          Set datetime
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap={4}>
                <HStack>
                  <Text fontSize={"sm"} flex="1">
                    Collection extent
                  </Text>
                  <Text>
                    {start?.toLocaleDateString() || "unbounded"} to{" "}
                    {end?.toLocaleDateString() || "now"}
                  </Text>
                </HStack>
                <Stack gap={2}>
                  <HStack>
                    <Text fontSize="sm" flex="1">
                      Start
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      width="auto"
                      value={startInput ? toDateInputValue(startInput) : ""}
                      onChange={(e) => {
                        const time = new Date(e.target.value).getTime();
                        if (time) setStartInput(time);
                      }}
                      disabled={startUnbounded}
                    />
                    <Checkbox.Root
                      size="sm"
                      checked={!startUnbounded}
                      onCheckedChange={(e) => setStartUnbounded(!e.checked)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" flex="1">
                      End
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      width="auto"
                      value={endInput ? toDateInputValue(endInput) : ""}
                      onChange={(e) => {
                        const time = new Date(e.target.value).getTime();
                        if (time) setEndInput(time);
                      }}
                      disabled={endUnbounded}
                    />
                    <Checkbox.Root
                      size="sm"
                      checked={!endUnbounded}
                      onCheckedChange={(e) => setEndUnbounded(!e.checked)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </HStack>
                </Stack>
                <Text fontSize={"2xs"}>
                  {toSearchDatetime(searchStart, searchEnd)}
                </Text>
                {error && (
                  <Alert.Root status={"error"}>
                    <Alert.Content>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

function SearchProgress({
  numberMatched,
  isFetching,
}: { numberMatched: number } & UseInfiniteQueryResult) {
  const items = useItems();

  return (
    <Progress.Root
      value={items?.length}
      max={numberMatched}
      animated={isFetching}
    >
      <HStack>
        <Progress.Track flex={1}>
          <Progress.Range />
        </Progress.Track>
        <Progress.ValueText />
      </HStack>
    </Progress.Root>
  );
}

function SearchDetails({ search }: { search: StacSearch }) {
  return <Json value={search}></Json>;
}

function toDateInputValue(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function toSearchDatetime(
  start: number | undefined,
  end: number | undefined
): string {
  return `${start ? new Date(start).toISOString() : ".."}/${end ? new Date(end).toISOString() : ".."}`;
}
