import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Collapsible,
  createListCollection,
  Field,
  Group,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberInput,
  Portal,
  Progress,
  Select,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuPause, LuPlay, LuSearch, LuX } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacCollection, StacLink, TemporalExtent } from "stac-ts";
import useStacMap from "../../hooks/stac-map";
import useStacSearch from "../../hooks/stac-search";
import type { StacSearch } from "../../types/stac";
import DownloadButtons from "../download";
import { toaster } from "../ui/toaster";

export default function ItemSearch({
  collection,
  links,
}: {
  collection: StacCollection;
  links: StacLink[];
}) {
  const { setItems, setPicked } = useStacMap();
  const [search, setSearch] = useState<StacSearch>();
  const [link, setLink] = useState<StacLink | undefined>(links[0]);
  const [datetime, setDatetime] = useState<string>();
  const [useViewportBounds, setUseViewportBounds] = useState(true);
  const [maxItems, setMaxItems] = useState("500");
  const { map } = useMap();

  useEffect(() => {
    if (!search) {
      setItems(undefined);
      setPicked(undefined);
    }
  }, [search, setItems, setPicked]);

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
      <Heading>Item search</Heading>

      <Alert.Root status={"warning"} size={"sm"}>
        <Alert.Indicator></Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Under construction</Alert.Title>
          <Alert.Description>
            Item search is under active development and is relatively
            under-powered at the moment.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Switch.Root
        disabled={!map}
        checked={!!map && useViewportBounds}
        onCheckedChange={(e) => setUseViewportBounds(e.checked)}
      >
        <Switch.HiddenInput></Switch.HiddenInput>
        <Switch.Label>Use viewport bounds</Switch.Label>
        <Switch.Control></Switch.Control>
      </Switch.Root>

      <Text></Text>

      <Datetime
        interval={collection.extent?.temporal?.interval[0]}
        setDatetime={setDatetime}
      ></Datetime>

      <Collapsible.Root>
        <Collapsible.Trigger py={4}>Advanced</Collapsible.Trigger>
        <Collapsible.Content>
          <Field.Root>
            <Field.Label>Max pages</Field.Label>
            <NumberInput.Root
              size={"sm"}
              value={maxItems}
              onValueChange={(e) => setMaxItems(e.value)}
            >
              <NumberInput.Control></NumberInput.Control>
              <NumberInput.Input></NumberInput.Input>
            </NumberInput.Root>
          </Field.Root>
        </Collapsible.Content>
      </Collapsible.Root>

      <HStack>
        <Box flex={1}></Box>

        <Select.Root
          collection={methods}
          value={[link?.method as string]}
          onValueChange={(e) =>
            setLink(links.find((link) => (link.method || "GET") == e.value))
          }
          disabled={!!search}
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
          variant={"surface"}
          onClick={() =>
            setSearch({
              collections: [collection.id],
              datetime,
              bbox:
                useViewportBounds && map
                  ? fixAntimeridian(
                      map.getBounds().toArray().flat() as [
                        number,
                        number,
                        number,
                        number,
                      ],
                    )
                  : undefined,
            })
          }
          disabled={!!search}
        >
          <LuSearch></LuSearch>
          Search
        </Button>
      </HStack>

      {search && link && (
        <Results
          search={search}
          link={link}
          maxItems={Number(maxItems)}
          doClear={() => setSearch(undefined)}
        ></Results>
      )}
    </Stack>
  );
}

function Results({
  search,
  link,
  maxItems,
  doClear,
}: {
  search: StacSearch;
  link: StacLink;
  maxItems: number;
  doClear: () => void;
}) {
  const { items, setItems } = useStacMap();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, error } =
    useStacSearch(search, link);
  const [numberMatched, setNumberMatched] = useState<number>();
  const [pause, setPause] = useState(false);
  const [done, setDone] = useState(false);

  console.log(search);

  useEffect(() => {
    setNumberMatched(data?.pages[0]?.numberMatched);
  }, [data]);

  useEffect(() => {
    if (!done) {
      setItems(data?.pages.flatMap((page) => page.features));
    }
  }, [data, setItems, done]);

  useEffect(() => {
    setDone(!hasNextPage || !!(items && items.length >= maxItems));
  }, [hasNextPage, items, maxItems]);

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !done) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, done]);

  useEffect(() => {
    if (error) {
      toaster.create({
        type: "error",
        title: "Search error",
        description: error.toString(),
      });
      doClear();
    }
  }, [error, doClear]);

  return (
    <Stack>
      <Progress.Root
        value={
          (done && items?.length) ||
          (numberMatched && items ? items.length : null)
        }
        max={numberMatched}
        maxW={"md"}
      >
        <HStack>
          <Progress.Track flex={1}>
            <Progress.Range></Progress.Range>
          </Progress.Track>
          <Progress.ValueText>
            <HStack gap={2}>
              {items?.length || "0"}

              <ButtonGroup size={"xs"} variant={"subtle"} attached>
                {(pause && (
                  <IconButton onClick={() => setPause(false)}>
                    <LuPlay></LuPlay>
                  </IconButton>
                )) || (
                  <IconButton
                    disabled={!hasNextPage}
                    onClick={() => setPause(true)}
                  >
                    <LuPause></LuPause>
                  </IconButton>
                )}
                <IconButton onClick={doClear}>
                  <LuX></LuX>
                </IconButton>
              </ButtonGroup>
            </HStack>
          </Progress.ValueText>
        </HStack>
      </Progress.Root>
      {items && items.length > 0 && (
        <HStack>
          <DownloadButtons
            items={items}
            disabled={!(pause || done)}
          ></DownloadButtons>
        </HStack>
      )}
      {done && items && items.length >= maxItems && (
        <Alert.Root>
          <Alert.Indicator></Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Max items reached</Alert.Title>
            <Alert.Description>
              Max items was set to {maxItems}, and we fetched {items.length}{" "}
              item{items.length == 1 ? "" : "s"}. Try increasing "Max items" in
              the "Advanced" collapsible menu.
            </Alert.Description>
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
      <HStack>
        <Button
          size={"xs"}
          variant={"outline"}
          onClick={() => {
            setStartDatetime(interval?.[0] ? new Date(interval[0]) : undefined);
            setEndDatetime(interval?.[1] ? new Date(interval[1]) : undefined);
          }}
        >
          Set to collection temporal extents
        </Button>
      </HStack>
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

function fixAntimeridian(bounds: [number, number, number, number]) {
  if (bounds[2] > 180) {
    toaster.create({
      type: "info",
      title: "Bounding box crosses the antimeridian",
      description:
        "Many servers do not support searching across the antimeridian by bbox. Try narrowing your viewport to not cross +/- 180° longitude",
    });
    return [bounds[0], bounds[1], bounds[2] - 360, bounds[3]];
  } else {
    return bounds;
  }
}
