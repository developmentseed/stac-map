import {
  Accordion,
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  createListCollection,
  Field,
  Group,
  Heading,
  HStack,
  IconButton,
  Input,
  Link,
  Portal,
  Progress,
  Select,
  Spinner,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import type { BBox } from "geojson";
import { useEffect, useState } from "react";
import { LuPause, LuPlay, LuSearch, LuStepForward, LuX } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type {
  StacCollection,
  StacItem,
  StacLink,
  TemporalExtent,
} from "stac-ts";
import useStacMap from "../../hooks/stac-map";
import useStacSearch from "../../hooks/stac-search";
import type { StacSearch } from "../../types/stac";
import { SpatialExtent } from "../extents";

interface NormalizedBbox {
  bbox: BBox;
  isCrossingAntimeridian: boolean;
}

export default function ItemSearch({
  collection,
  links,
}: {
  collection: StacCollection;
  links: StacLink[];
}) {
  const [link, setLink] = useState<StacLink | undefined>(links[0]);
  const [normalizedBbox, setNormalizedBbox] = useState<NormalizedBbox>();
  const [datetime, setDatetime] = useState<string>();
  const [useViewportBounds, setUseViewportBounds] = useState(true);
  const { search, setSearch } = useStacMap();
  const [autoLoad, setAutoLoad] = useState(false);
  const { map } = useMap();

  const methods = createListCollection({
    items: links.map((link) => {
      return {
        label: (link.method as string) || "GET",
        value: (link.method as string) || "GET",
      };
    }),
  });

  useEffect(() => {
    function getNormalizedMapBounds() {
      return normalizeBbox(map?.getBounds().toArray().flat() as BBox);
    }

    const listener = () => {
      setNormalizedBbox(getNormalizedMapBounds());
    };

    if (useViewportBounds && map) {
      map.on("moveend", listener);
      setNormalizedBbox(getNormalizedMapBounds());
    } else {
      map?.off("moveend", listener);
      setNormalizedBbox(undefined);
    }
  }, [map, useViewportBounds]);

  return (
    <Stack gap={4}>
      <Accordion.Root
        defaultValue={["spatial", "temporal"]}
        multiple
        variant={"enclosed"}
      >
        <Accordion.Item value="spatial">
          <Accordion.ItemTrigger>
            <Heading flex="1" size={"md"}>
              Spatial
            </Heading>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent py={4}>
            <Stack>
              <Switch.Root
                disabled={!map}
                checked={!!map && useViewportBounds}
                onCheckedChange={(e) => setUseViewportBounds(e.checked)}
                size={"sm"}
              >
                <Switch.HiddenInput></Switch.HiddenInput>
                <Switch.Label>Use viewport bounds</Switch.Label>
                <Switch.Control></Switch.Control>
              </Switch.Root>
              {normalizedBbox && (
                <Text fontSize={"sm"} fontWeight={"lighter"}>
                  <SpatialExtent bbox={normalizedBbox?.bbox}></SpatialExtent>
                </Text>
              )}
              {normalizedBbox?.isCrossingAntimeridian && (
                <Alert.Root status={"warning"} size={"sm"}>
                  <Alert.Indicator></Alert.Indicator>
                  <Alert.Content>
                    <Alert.Title>Antimeridian-crossing viewport</Alert.Title>
                    <Alert.Description>
                      The viewport bounds cross the{" "}
                      <Link
                        href="https://en.wikipedia.org/wiki/180th_meridian"
                        target="_blank"
                      >
                        antimeridian
                      </Link>
                      , and may servers do not support antimeridian-crossing
                      bounding boxes. The search bounding box has been reduced
                      to only one side of the antimeridian.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            </Stack>
          </Accordion.ItemContent>
        </Accordion.Item>

        <Accordion.Item value="temporal">
          <Accordion.ItemTrigger>
            <Heading flex="1" size={"md"}>
              Temporal
            </Heading>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent py={4}>
            <Datetime
              interval={collection.extent?.temporal?.interval[0]}
              setDatetime={setDatetime}
            ></Datetime>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>

      <HStack>
        <Button
          variant={"solid"}
          size={"md"}
          onClick={() =>
            setSearch({
              collections: [collection.id],
              datetime,
              bbox: normalizedBbox?.bbox,
            })
          }
        >
          <LuSearch></LuSearch>
          Search
        </Button>

        <Select.Root
          collection={methods}
          value={[link?.method as string]}
          onValueChange={(e) =>
            setLink(links.find((link) => (link.method || "GET") == e.value))
          }
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
        <Checkbox.Root
          checked={autoLoad}
          onCheckedChange={(e) => setAutoLoad(!!e.checked)}
        >
          <Checkbox.HiddenInput></Checkbox.HiddenInput>
          <Checkbox.Control>
            <Checkbox.Indicator></Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Auto-load?</Checkbox.Label>
        </Checkbox.Root>
      </HStack>

      {search && link && (
        <Results
          search={search}
          link={link}
          autoLoad={autoLoad}
          setAutoLoad={setAutoLoad}
        ></Results>
      )}
    </Stack>
  );
}

function Results({
  search,
  link,
  autoLoad,
  setAutoLoad,
}: {
  search: StacSearch;
  link: StacLink;
  autoLoad: boolean;
  setAutoLoad: (autoLoad: boolean) => void;
}) {
  const results = useStacSearch(search, link);
  const [items, setItems] = useState<StacItem[]>();
  const { setSearch, setSearchItems } = useStacMap();

  useEffect(() => {
    setItems(results.data?.pages.flatMap((page) => page.features));
  }, [results.data]);

  useEffect(() => {
    if (autoLoad && !results.isFetching && results.hasNextPage) {
      results.fetchNextPage();
    }
  }, [results, autoLoad]);

  useEffect(() => {
    setSearchItems(items);
  }, [items, setSearchItems]);

  const numberMatched = results.data?.pages[0].numberMatched;
  const value = items?.length || 0;

  return (
    <Stack>
      <Progress.Root
        value={results.isFetching && !numberMatched ? null : value}
        max={numberMatched}
        striped={!numberMatched}
      >
        <HStack>
          <Progress.Track flex={"1"}>
            <Progress.Range></Progress.Range>
          </Progress.Track>
          <Progress.ValueText>
            {items?.length || 0} / {numberMatched || "?"}
          </Progress.ValueText>
        </HStack>
      </Progress.Root>
      <HStack>
        <ButtonGroup size={"xs"} attached variant={"subtle"}>
          <IconButton
            disabled={results.isFetching || !results.hasNextPage}
            onClick={() => results.fetchNextPage()}
          >
            <LuStepForward></LuStepForward>
          </IconButton>
          <IconButton
            onClick={() => setAutoLoad(!autoLoad)}
            disabled={!results.hasNextPage}
          >
            {(autoLoad && <LuPause></LuPause>) || <LuPlay></LuPlay>}
          </IconButton>
          <IconButton
            onClick={() => {
              setSearch(undefined);
            }}
          >
            <LuX></LuX>
          </IconButton>
        </ButtonGroup>
        {((autoLoad && results.hasNextPage) || results.isFetching) && (
          <Spinner size={"xs"}></Spinner>
        )}
      </HStack>
      {results.error && (
        <Alert.Root status={"error"}>
          <Alert.Indicator></Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Error while searching</Alert.Title>
            <Alert.Description>{results.error.toString()}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
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
    interval?.[0] ? new Date(interval[0]) : undefined,
  );
  const [endDatetime, setEndDatetime] = useState(
    interval?.[1] ? new Date(interval[1]) : undefined,
  );

  useEffect(() => {
    if (startDatetime || endDatetime) {
      setDatetime(
        `${startDatetime?.toISOString() || ".."}/${endDatetime?.toISOString() || ".."}`,
      );
    } else {
      setDatetime(undefined);
    }
  }, [startDatetime, endDatetime, setDatetime]);

  return (
    <Stack gap={4}>
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
      new Date(date + "T" + (timeValue == "" ? "00:00:00" : timeValue) + "Z"),
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

function normalizeBbox(bbox: BBox): NormalizedBbox {
  if (bbox[2] - bbox[0] >= 360) {
    return {
      bbox: [-180, bbox[1], 180, bbox[3]],
      isCrossingAntimeridian: false,
    };
  } else if (bbox[0] < -180) {
    return normalizeBbox([bbox[0] + 360, bbox[1], bbox[2] + 360, bbox[3]]);
  } else if (bbox[0] > 180) {
    return normalizeBbox([bbox[0] - 360, bbox[1], bbox[2] - 360, bbox[3]]);
  } else if (bbox[2] > 180) {
    if ((bbox[0] + bbox[2]) / 2 > 180) {
      return {
        bbox: [-180, bbox[1], bbox[2] - 360, bbox[3]],
        isCrossingAntimeridian: true,
      };
    } else {
      return {
        bbox: [bbox[0], bbox[1], 180, bbox[3]],
        isCrossingAntimeridian: true,
      };
    }
  } else {
    return { bbox: bbox, isCrossingAntimeridian: false };
  }
}
