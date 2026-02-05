import { Section } from "@/components/section";
import { useStacSearch } from "@/hooks/stac";
import { useItems } from "@/hooks/store";
import { useStore } from "@/store/index.ts";
import { toSearchKey } from "@/store/items";
import type { StacSearch } from "@/types/stac";
import { paddedBbox } from "@/utils/bbox";
import { getCollectionDatetimes } from "@/utils/stac";
import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  HStack,
  IconButton,
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
  LuHash,
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
  limit?: number;
}

export default function Search({ href, collection }: Props) {
  const searches = useStore((store) => store.searches);
  const setSearchState = useStore((store) => store.setSearch);
  const setSearchedItems = useStore((store) => store.setSearchedItems);
  const setDatetimeBounds = useStore((store) => store.setDatetimeBounds);
  const [fetchAll, setFetchAll] = useState(false);

  const searchKey = { href, collection };
  const searchKeyString = toSearchKey(searchKey);
  const search = searches[searchKeyString] || { collections: [collection.id] };
  const setSearch = (s: StacSearch) => setSearchState(searchKey, s);
  const result = useStacSearch({ href, search });

  const numberMatched = useMemo(() => {
    if (result.data) return result.data.pages.at(0)?.numberMatched;
  }, [result.data]);

  useEffect(() => {
    if (result.data)
      setSearchedItems(result.data.pages.map((page) => page?.features || []));
  }, [result.data, setSearchedItems]);

  useEffect(() => {
    setDatetimeBounds(getCollectionDatetimes(collection));
  }, [collection, setDatetimeBounds]);

  useEffect(() => {
    if (fetchAll && !result.isFetching && result.hasNextPage)
      result.fetchNextPage();
  }, [fetchAll, result]);

  const headerAction = (
    <ButtonGroup size={"2xs"} variant={"ghost"}>
      <IconButton
        disabled={result.isFetching || fetchAll || !result.hasNextPage}
        onClick={(e) => {
          e.stopPropagation();
          result.fetchNextPage();
        }}
      >
        {result.isFetching ? <LuLoader /> : <LuForward />}
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setFetchAll((previous) => !previous);
        }}
        disabled={!result.hasNextPage}
      >
        {fetchAll && result.hasNextPage ? <LuPause /> : <LuPlay />}
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setSearch({ collections: [collection.id] });
          setFetchAll(false);
        }}
        disabled={!search.bbox && !search.datetime && !search.limit}
      >
        <LuX />
      </IconButton>
    </ButtonGroup>
  );

  return (
    <Section
      icon={<LuSearch />}
      title="Item search"
      headerAction={headerAction}
    >
      <Stack gap={4}>
        <SearchControls
          collection={collection}
          setSearch={(params: SetSearchParams) => {
            const merged = {
              ...search,
              collections: [collection.id],
              ...params,
            };
            const filtered = Object.fromEntries(
              Object.entries(merged).filter(([, v]) => v !== undefined)
            ) as unknown as StacSearch;
            setSearch(filtered);
          }}
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
}: {
  collection: StacCollection;
  setSearch: (params: SetSearchParams) => void;
}) {
  const bbox = useStore((store) => store.bbox);
  const { start, end } = getCollectionDatetimes(collection);

  return (
    <Stack>
      <ButtonGroup size={"xs"} variant={"outline"} attached>
        <Button
          onClick={() => {
            const b = bbox ? paddedBbox(bbox) : undefined;
            setSearch({ bbox: b || undefined });
          }}
        >
          <LuFrame />
          Bounding box to viewport
        </Button>
        <DatetimePopover
          start={start}
          end={end}
          setDatetime={(datetime) => setSearch({ datetime })}
        />
        <LimitPopover setLimit={(limit) => setSearch({ limit })} />
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
          Datetime
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

function LimitPopover({
  setLimit,
}: {
  setLimit: (limit: number | undefined) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <Popover.Root
      onOpenChange={(e) => {
        if (!e.open) setLimit(parseInt(value, 10) || undefined);
      }}
    >
      <Popover.Trigger asChild>
        <Button>
          <LuHash />
          Limit
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap={4}>
                <HStack>
                  <Text fontSize="sm" flex="1">
                    Items per page
                  </Text>
                  <Input
                    type="number"
                    size="sm"
                    width="80px"
                    min={1}
                    max={10000}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                  />
                </HStack>
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
