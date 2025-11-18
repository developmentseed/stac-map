import { useEffect, useMemo, useState } from "react";
import {
  LuDownload,
  LuPause,
  LuPlay,
  LuSearch,
  LuStepForward,
  LuX,
} from "react-icons/lu";
import {
  Alert,
  Button,
  ButtonGroup,
  createListCollection,
  DownloadTrigger,
  Field,
  Group,
  Heading,
  HStack,
  IconButton,
  Input,
  Portal,
  Progress,
  Select,
  Span,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import type {
  StacCollection,
  StacItem,
  StacLink,
  TemporalExtent,
} from "stac-ts";
import * as stac_wasm from "stac-wasm";
import useStacSearch from "../../hooks/stac-search";
import type { BBox2D } from "../../types/map";
import type { StacSearch } from "../../types/stac";
import { SpatialExtent } from "../extent";
import Section from "../section";

interface ItemSearchProps {
  search: StacSearch | undefined;
  setSearch: (search: StacSearch | undefined) => void;
  links: StacLink[];
  bbox: BBox2D | undefined;
  collection: StacCollection;
  setItems: (items: StacItem[] | undefined) => void;
}

export default function ItemSearchSection({ ...props }: ItemSearchProps) {
  return (
    <Section title="Item search" TitleIcon={LuSearch} value="item-search">
      <ItemSearch {...props} />
    </Section>
  );
}

function ItemSearch({
  search,
  setSearch,
  links,
  bbox,
  collection,
  setItems,
}: {
  search: StacSearch | undefined;
  setSearch: (search: StacSearch | undefined) => void;
  links: StacLink[];
  bbox: BBox2D | undefined;
  collection: StacCollection;
  setItems: (items: StacItem[] | undefined) => void;
}) {
  // We trust that there's at least one link.
  const [link, setLink] = useState<StacLink>(links[0]);
  const [useViewportBounds, setUseViewportBounds] = useState(true);
  const [datetime, setDatetime] = useState<string | undefined>(
    search?.datetime
  );
  const methods = createListCollection({
    items: links.map((link) => {
      return {
        label: (link.method as string) || "GET",
        value: (link.method as string) || "GET",
      };
    }),
  });

  return (
    <Stack gap={4}>
      <Stack>
        <Switch.Root
          disabled={!bbox}
          checked={!!bbox && useViewportBounds}
          onCheckedChange={(e) => setUseViewportBounds(e.checked)}
          size={"sm"}
        >
          <Switch.HiddenInput></Switch.HiddenInput>
          <Switch.Label>Use viewport bounds</Switch.Label>
          <Switch.Control></Switch.Control>
        </Switch.Root>
        {bbox && useViewportBounds && (
          <Text fontSize={"sm"} fontWeight={"lighter"} as="div">
            <SpatialExtent bbox={bbox}></SpatialExtent>
          </Text>
        )}
      </Stack>

      <Datetime
        interval={collection.extent?.temporal?.interval[0]}
        setDatetime={setDatetime}
      ></Datetime>

      <HStack justify={"right"}>
        <Select.Root
          collection={methods}
          value={[link?.method as string]}
          onValueChange={(e) => {
            const link = links.find(
              (link) => (link.method || "GET") == e.value
            );
            if (link) setLink(link);
          }}
          maxW={100}
        >
          <Select.HiddenSelect></Select.HiddenSelect>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select search method" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {methods.items.map((method) => (
                  <Select.Item item={method} key={method.value}>
                    {method.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        <Button
          size={"md"}
          variant={"surface"}
          onClick={() =>
            setSearch({
              bbox: bbox,
              collections: [collection.id],
              datetime: datetime,
            })
          }
          disabled={!!search}
        >
          <LuSearch /> Search
        </Button>
      </HStack>

      {search && (
        <Search
          search={search}
          link={link}
          onClear={() => setSearch(undefined)}
          setItems={setItems}
        />
      )}
    </Stack>
  );
}

function Search({
  search,
  link,
  onClear,
  setItems,
}: {
  search: StacSearch;
  link: StacLink;
  onClear: () => void;
  setItems: (items: StacItem[] | undefined) => void;
}) {
  const result = useStacSearch(search, link);
  const numberMatched = result.data?.pages.at(0)?.numberMatched;
  const items = useMemo(() => {
    return result.data?.pages.flatMap((page) => page.features);
  }, [result.data]);
  const [autoFetch, setAutoFetch] = useState(false);

  useEffect(() => {
    if (autoFetch && !result.isFetching && result.hasNextPage)
      result.fetchNextPage();
  }, [result, autoFetch]);

  useEffect(() => {
    setItems(items);
  }, [items, setItems]);

  const downloadJson = () => {
    return JSON.stringify(
      items ? { type: "FeatureCollection", features: items } : {}
    );
  };

  const downloadStacGeoparquet = () => {
    return new Blob(
      items ? [stac_wasm.stacJsonToParquet(items) as BlobPart] : []
    );
  };

  return (
    <Stack gap={4}>
      <Heading size={"md"}>Search results</Heading>
      {(numberMatched && (
        <Progress.Root value={items?.length || 0} max={numberMatched}>
          <HStack>
            <Progress.Track flex={"1"}>
              <Progress.Range />
            </Progress.Track>
            <Progress.ValueText />
          </HStack>
        </Progress.Root>
      )) ||
        (items && <Text fontSize={"xs"}>{items.length} item(s) fetched</Text>)}
      {result.error && (
        <Alert.Root status={"error"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error while searching</Alert.Title>
            <Alert.Description>{result.error.toString()}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <ButtonGroup variant={"surface"}>
        <Button
          disabled={autoFetch || result.isFetching || !result.hasNextPage}
          onClick={() => {
            if (!result.isFetching && result.hasNextPage)
              result.fetchNextPage();
          }}
        >
          Next
          <LuStepForward />
        </Button>
        <Button
          onClick={() => setAutoFetch((autoFetch) => !autoFetch)}
          disabled={!result.hasNextPage}
        >
          {(autoFetch && (
            <>
              Pause
              <LuPause />
            </>
          )) || (
            <>
              Auto-fetch
              <LuPlay />
            </>
          )}
        </Button>
        <Span flex="1" />
        <Button onClick={onClear}>
          Clear <LuX />
        </Button>
      </ButtonGroup>
      {items && items.length > 0 && (
        <>
          <Heading size={"sm"}>Download</Heading>
          <ButtonGroup variant={"surface"} size={"xs"}>
            <DownloadTrigger
              data={downloadJson}
              fileName="search.json"
              mimeType="application/json"
              asChild
            >
              <Button>
                JSON <LuDownload />
              </Button>
            </DownloadTrigger>
            <DownloadTrigger
              data={downloadStacGeoparquet}
              fileName="search.parquet"
              mimeType="application/json"
              asChild
            >
              <Button>
                stac-geoparquet <LuDownload />
              </Button>
            </DownloadTrigger>
          </ButtonGroup>
        </>
      )}
    </Stack>
  );
}

function Datetime({
  interval,
  setDatetime,
}: {
  interval: TemporalExtent | undefined;
  setDatetime: (datetime: string | undefined) => void;
}) {
  const [startDatetime, setStartDatetime] = useState(
    interval?.[0] ? new Date(interval[0]) : undefined
  );
  const [endDatetime, setEndDatetime] = useState(
    interval?.[1] ? new Date(interval[1]) : undefined
  );

  useEffect(() => {
    if (startDatetime || endDatetime) {
      setDatetime(
        `${startDatetime?.toISOString() || ".."}/${endDatetime?.toISOString() || ".."}`
      );
    } else {
      setDatetime(undefined);
    }
  }, [startDatetime, endDatetime, setDatetime]);

  return (
    <Stack>
      <DatetimeInput
        label="Start datetime"
        datetime={startDatetime}
        setDatetime={setStartDatetime}
      ></DatetimeInput>
      <DatetimeInput
        label="End datetime"
        datetime={endDatetime}
        setDatetime={setEndDatetime}
      ></DatetimeInput>
      <Button
        size={"sm"}
        variant={"outline"}
        onClick={() => {
          setStartDatetime(interval?.[0] ? new Date(interval[0]) : undefined);
          setEndDatetime(interval?.[1] ? new Date(interval[1]) : undefined);
        }}
      >
        Set to collection extents
      </Button>
    </Stack>
  );
}

function DatetimeInput({
  label,
  datetime,
  setDatetime,
}: {
  label: string;
  datetime: Date | undefined;
  setDatetime: (datetime: Date | undefined) => void;
}) {
  const [error, setError] = useState<string>();
  const dateValue = datetime?.toISOString().split("T")[0] || "";
  const timeValue = datetime?.toISOString().split("T")[1].slice(0, 8) || "";

  const setDatetimeChecked = (datetime: Date) => {
    try {
      datetime.toISOString();
      // eslint-disable-next-line
    } catch (e: any) {
      setError(e.toString());
      return;
    }
    setDatetime(datetime);
    setError(undefined);
  };
  const setDate = (date: string) => {
    setDatetimeChecked(
      new Date(date + "T" + (timeValue == "" ? "00:00:00" : timeValue) + "Z")
    );
  };
  const setTime = (time: string) => {
    if (dateValue != "") {
      const newDatetime = new Date(dateValue);
      const timeParts = time.split(":").map(Number);
      newDatetime.setUTCHours(timeParts[0]);
      newDatetime.setUTCMinutes(timeParts[1]);
      if (timeParts.length == 3) {
        newDatetime.setUTCSeconds(timeParts[2]);
      }
      setDatetimeChecked(newDatetime);
    }
  };

  return (
    <Field.Root invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      <Group attached w={"full"}>
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => setDate(e.target.value)}
          size={"sm"}
        ></Input>
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => setTime(e.target.value)}
          size={"sm"}
        ></Input>
        <IconButton
          size={"sm"}
          variant={"outline"}
          onClick={() => setDatetime(undefined)}
        >
          <LuX></LuX>
        </IconButton>
      </Group>
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}
