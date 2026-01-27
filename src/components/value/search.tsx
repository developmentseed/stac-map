import { Section } from "@/components/section";
import { useStacSearch } from "@/hooks/stac";
import { useItems } from "@/hooks/store";
import { useStore } from "@/store/index.ts";
import type { StacSearch } from "@/types/stac";
import { paddedBbox } from "@/utils/bbox";
import { getCollectionDatetimes } from "@/utils/stac";
import {
  Button,
  ButtonGroup,
  Checkbox,
  HStack,
  Input,
  Popover,
  Portal,
  Progress,
  Slider,
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
  setSearch,
  resetSearch,
  isFetching,
  fetchNextPage,
  hasNextPage,
}: {
  setSearch: (params: SetSearchParams) => void;
  resetSearch: () => void;
} & UseInfiniteQueryResult) {
  const [fetchAll, setFetchAll] = useState(false);
  const bbox = useStore((store) => store.bbox);
  const datetimeBounds = useStore((store) => store.datetimeBounds);

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
          datetimeBounds={datetimeBounds}
          onApply={(datetime) => setSearch({ datetime })}
        />
        <Button onClick={() => resetSearch()}>
          <LuX />
          Reset
        </Button>
      </ButtonGroup>
    </Stack>
  );
}

function toDateInputValue(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function DatetimePopover({
  datetimeBounds,
  onApply,
}: {
  datetimeBounds: { start: Date | null; end: Date | null } | null;
  onApply: (datetime: string | undefined) => void;
}) {
  const [now] = useState(() => Date.now());
  const [prevBounds, setPrevBounds] = useState(datetimeBounds);
  const [startUnbounded, setStartUnbounded] = useState(!datetimeBounds?.start);
  const [endUnbounded, setEndUnbounded] = useState(!datetimeBounds?.end);
  const [sliderValue, setSliderValue] = useState<[number, number] | null>(null);

  if (datetimeBounds !== prevBounds) {
    setPrevBounds(datetimeBounds);
    setStartUnbounded(!datetimeBounds?.start);
    setEndUnbounded(!datetimeBounds?.end);
    setSliderValue(null);
  }

  const minTime =
    datetimeBounds?.start?.getTime() ?? now - 365 * 24 * 60 * 60 * 1000;
  const maxTime = datetimeBounds?.end?.getTime() ?? now;

  const currentValue: [number, number] = sliderValue ?? [minTime, maxTime];

  const formatDatetime = (date: Date) => date.toISOString();

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open) {
      const start = startUnbounded
        ? ".."
        : formatDatetime(new Date(currentValue[0]));
      const end = endUnbounded
        ? ".."
        : formatDatetime(new Date(currentValue[1]));
      if (start === ".." && end === "..") {
        onApply(undefined);
      } else {
        onApply(`${start}/${end}`);
      }
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSliderValue([date.getTime(), currentValue[1]]);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSliderValue([currentValue[0], date.getTime()]);
    }
  };

  return (
    <Popover.Root onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button>
          <LuCalendar />
          Set datetime
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content width="320px">
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap={4}>
                <Slider.Root
                  value={currentValue}
                  min={minTime}
                  max={maxTime}
                  onValueChange={(e) =>
                    setSliderValue(e.value as [number, number])
                  }
                  disabled={startUnbounded && endUnbounded}
                >
                  <HStack>
                    <Slider.Label>Datetime range</Slider.Label>
                  </HStack>
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.Root>

                <Stack gap={2}>
                  <HStack>
                    <Text fontSize="sm" flex="1">
                      Start
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      width="auto"
                      value={
                        startUnbounded ? "" : toDateInputValue(currentValue[0])
                      }
                      onChange={handleStartDateChange}
                      disabled={startUnbounded}
                    />
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" flex="1">
                      End
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      width="auto"
                      value={
                        endUnbounded ? "" : toDateInputValue(currentValue[1])
                      }
                      onChange={handleEndDateChange}
                      disabled={endUnbounded}
                    />
                  </HStack>
                </Stack>

                <HStack justify="space-between">
                  <Checkbox.Root
                    checked={startUnbounded}
                    onCheckedChange={(e) => setStartUnbounded(!!e.checked)}
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Start unbounded</Checkbox.Label>
                  </Checkbox.Root>

                  <Checkbox.Root
                    checked={endUnbounded}
                    onCheckedChange={(e) => setEndUnbounded(!!e.checked)}
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>End unbounded</Checkbox.Label>
                  </Checkbox.Root>
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
