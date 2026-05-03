import { type BBox2D, useStore } from "@/store";
import type { StacAssets, StacItemCollection } from "@/types/stac";
import {
  fetchStacValue,
  getCogHref,
  getLinkHref,
  getSelfHref,
  sanitizeBbox,
} from "@/utils/stac";
import {
  Alert,
  Button,
  Center,
  Checkbox,
  CloseButton,
  createListCollection,
  Dialog,
  Field,
  Fieldset,
  Input,
  InputGroup,
  Portal,
  Select,
  SkeletonText,
  Slider,
  Stack,
} from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import {
  COGLayer,
  MosaicLayer,
  type MosaicSource,
} from "@developmentseed/deck.gl-geotiff";
import { epsgResolver } from "@developmentseed/proj";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Feature } from "geojson";
import { useEffect, useMemo, useState } from "react";
import {
  LuFiles,
  LuFileSearch2,
  LuSearch,
  LuSettings2,
  LuView,
} from "react-icons/lu";
import type { StacCollection, StacItem, StacLink } from "stac-ts";
import ItemCard from "./cards/item";
import ItemListItem from "./list-items/item";
import EntityList from "./ui/entity-list";
import PaginationBar from "./ui/pagination-bar";
import Section from "./ui/section";

export default function Search({
  link,
  collection,
}: {
  link: StacLink;
  collection: StacCollection;
}) {
  const setSearchParams = useStore((store) => store.setSearchParams);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [startDatetime, setStartDatetime] = useState(
    () =>
      useStore.getState().searchParams[collection.id]?.startDatetime ??
      toDatetimeInputValue(collection.extent?.temporal?.interval?.[0]?.[0])
  );
  const [endDatetime, setEndDatetime] = useState(
    () =>
      useStore.getState().searchParams[collection.id]?.endDatetime ??
      toDatetimeInputValue(collection.extent?.temporal?.interval?.[0]?.[1])
  );
  const [limit, setLimit] = useState(
    () => useStore.getState().searchParams[collection.id]?.limit ?? ""
  );

  useEffect(() => {
    setSearchParams(collection.id, { startDatetime, endDatetime, limit });
  }, [collection.id, startDatetime, endDatetime, limit, setSearchParams]);

  const startBoundMs = useMemo(
    () => toMs(collection.extent?.temporal?.interval?.[0]?.[0]),
    [collection]
  );
  const endBoundMs = useMemo(
    () => toMs(collection.extent?.temporal?.interval?.[0]?.[1]),
    [collection]
  );

  const href = useMemo(() => {
    const url = new URL(link.href);
    url.searchParams.set("collections", collection.id);
    if (startDatetime || endDatetime)
      url.searchParams.set(
        "datetime",
        `${toStacDatetime(startDatetime)}/${toStacDatetime(endDatetime)}`
      );
    if (limit) url.searchParams.set("limit", limit);
    return url.toString();
  }, [link, collection, startDatetime, endDatetime, limit]);

  const result = useInfiniteQuery({
    queryKey: ["search", href],
    queryFn: async ({ pageParam }) => fetchStacValue({ href: pageParam }),
    initialPageParam: href,
    getNextPageParam: (lastPage: StacItemCollection) =>
      getLinkHref(lastPage, "next"),
  });

  useEffect(() => {
    if (isFetchingAll && result.hasNextPage && !result.isFetchingNextPage)
      result.fetchNextPage();
  }, [isFetchingAll, result]);

  const items = useMemo(() => {
    return result.data?.pages
      .flatMap((page) => page?.features)
      .filter((item) => !!item);
  }, [result.data]);

  const numberMatched = useMemo(() => {
    return result.data?.pages[0]?.numberMatched;
  }, [result.data]);

  const body = items ? (
    <Items items={items} />
  ) : result.isLoading ? (
    <SkeletonText h={3} />
  ) : (
    <Error error={result.error} />
  );

  return (
    <>
      <Section icon={<LuFileSearch2 />} title="Search">
        <Fieldset.Root size={"sm"}>
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Collection</Field.Label>
              <Input value={collection.id} disabled />
            </Field.Root>
            <Fieldset.Root size={"sm"}>
              <Fieldset.Legend>Datetime</Fieldset.Legend>
              <Fieldset.Content>
                <Field.Root orientation={"horizontal"}>
                  <Field.Label color={"fg.muted"} fontWeight={"normal"}>
                    Start
                  </Field.Label>
                  <Input
                    size={"sm"}
                    type={"datetime-local"}
                    step={1}
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                  />
                </Field.Root>
                <Field.Root orientation={"horizontal"}>
                  <Field.Label color={"fg.muted"} fontWeight={"normal"}>
                    End
                  </Field.Label>
                  <Input
                    size={"sm"}
                    type={"datetime-local"}
                    step={1}
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}
                  />
                </Field.Root>
                {startBoundMs !== undefined && endBoundMs !== undefined && (
                  <DatetimeSlider
                    startBoundMs={startBoundMs}
                    endBoundMs={endBoundMs}
                    startDatetime={startDatetime}
                    endDatetime={endDatetime}
                    setStartDatetime={setStartDatetime}
                    setEndDatetime={setEndDatetime}
                  />
                )}
              </Fieldset.Content>
            </Fieldset.Root>
          </Fieldset.Content>
        </Fieldset.Root>
        <AdvancedSettings limit={limit} setLimit={setLimit} />
      </Section>
      {result.data?.pages && result.data.pages.length > 0 && (
        <Visualization pages={result.data.pages} />
      )}
      <Section icon={<LuFiles />} title="Items">
        {body}
      </Section>
      {items && items.length > 0 && (
        <PaginationBar
          count={items.length}
          numberMatched={numberMatched}
          noun={"item"}
          isFetchingAll={isFetchingAll}
          setIsFetchingAll={setIsFetchingAll}
          {...result}
        />
      )}
    </>
  );
}

function DatetimeSlider({
  startBoundMs,
  endBoundMs,
  startDatetime,
  endDatetime,
  setStartDatetime,
  setEndDatetime,
}: {
  startBoundMs: number;
  endBoundMs: number;
  startDatetime: string;
  endDatetime: string;
  setStartDatetime: (value: string) => void;
  setEndDatetime: (value: string) => void;
}) {
  const startMs = datetimeInputToMs(startDatetime) ?? startBoundMs;
  const endMs = datetimeInputToMs(endDatetime) ?? endBoundMs;
  const [value, setValue] = useState([startMs, endMs]);
  const [lastExternal, setLastExternal] = useState([startMs, endMs]);
  if (lastExternal[0] !== startMs || lastExternal[1] !== endMs) {
    setLastExternal([startMs, endMs]);
    setValue([startMs, endMs]);
  }
  return (
    <Slider.Root
      size={"sm"}
      min={startBoundMs}
      max={endBoundMs}
      value={value}
      onValueChange={(e) => setValue(e.value)}
      onValueChangeEnd={(e) => {
        setStartDatetime(msToDatetimeInputValue(e.value[0]));
        setEndDatetime(msToDatetimeInputValue(e.value[1]));
      }}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  );
}

function AdvancedSettings({
  limit,
  setLimit,
}: {
  limit: string;
  setLimit: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftLimit, setDraftLimit] = useState(limit);
  const save = () => {
    setLimit(draftLimit);
    setOpen(false);
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) setDraftLimit(limit);
        setOpen(e.open);
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant={"ghost"} size={"sm"} mt={2}>
          <LuSettings2 />
          Advanced settings
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Advanced settings</Dialog.Title>
            </Dialog.Header>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <Dialog.Body>
                <Fieldset.Root size={"sm"}>
                  <Fieldset.Content>
                    <Field.Root>
                      <Field.Label>Limit</Field.Label>
                      <Input
                        size={"sm"}
                        type={"number"}
                        min={1}
                        value={draftLimit}
                        onChange={(e) => setDraftLimit(e.target.value)}
                      />
                    </Field.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type={"submit"}>Save</Button>
              </Dialog.Footer>
            </form>
            <Dialog.CloseTrigger asChild>
              <CloseButton size={"sm"} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function Items({ items }: { items: StacItem[] }) {
  const [filterByMapBbox, setFilterByMapBbox] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [hovered, setHovered] = useState<StacItem>();
  const setHref = useStore((store) => store.setHref);
  const setLayer = useStore((store) => store.setLayer);
  const fillColor = useStore((store) => store.fillColor);
  const lineColor = useStore((store) => store.lineColor);
  const mapBbox = useStore((store) => store.mapBbox);

  const filteredItems = useMemo(() => {
    const needle = filterText.trim().toLowerCase();
    return items.filter((item) => {
      if (filterByMapBbox && mapBbox && !isItemInBbox(item, mapBbox)) {
        return false;
      }
      if (needle) {
        const id = item.id?.toLowerCase() ?? "";
        const title =
          (item.properties?.title as string | undefined)?.toLowerCase() ?? "";
        if (!id.includes(needle) && !title.includes(needle)) return false;
      }
      return true;
    });
  }, [items, filterByMapBbox, mapBbox, filterText]);

  useEffect(() => {
    setLayer(
      "items",
      new GeoJsonLayer({
        id: "items",
        data: filteredItems as Feature[],
        filled: true,
        getFillColor: (e: Feature) =>
          e.id === hovered?.id ? fillColor : [0, 0, 0, 0],
        getLineColor: lineColor,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        pickable: true,
        onClick: (e) => {
          const item: StacItem | undefined =
            e.object && filteredItems.find((item) => item.id === e.object?.id);
          const href = item && getSelfHref(item);
          if (href) setHref(href);
        },
        onHover: (e) => {
          if (e.object)
            setHovered(filteredItems.find((item) => item.id === e.object.id));
          else setHovered(undefined);
        },
        updateTriggers: {
          getFillColor: [fillColor, hovered],
        },
      })
    );

    return () => setLayer("items", undefined);
  }, [setLayer, fillColor, hovered, lineColor, filteredItems, setHref]);

  const filters = (
    <>
      <Checkbox.Root
        size={"sm"}
        checked={filterByMapBbox}
        onCheckedChange={(e) => setFilterByMapBbox(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Filter by map bounding box</Checkbox.Label>
      </Checkbox.Root>
      <InputGroup
        startElement={<LuSearch />}
        endElement={
          filterText && (
            <CloseButton
              size={"xs"}
              variant={"plain"}
              onClick={() => setFilterText("")}
            />
          )
        }
      >
        <Input
          size={"sm"}
          placeholder={"Filter by id or title"}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </InputGroup>
    </>
  );

  return (
    <EntityList
      items={filteredItems}
      getKey={(item) => item.id}
      renderCard={(item) => (
        <ItemCard item={item} hovered={hovered} setHovered={setHovered} />
      )}
      renderListItem={(item) => (
        <ItemListItem item={item} hovered={hovered} setHovered={setHovered} />
      )}
      filters={filters}
      defaultView={"list"}
    />
  );
}

function Visualization({ pages }: { pages: StacItemCollection[] }) {
  const items = useMemo(
    () =>
      pages.flatMap((page) => page?.features ?? []).filter((item) => !!item),
    [pages]
  );
  const validKeys = useMemo(() => getValidAssetKeys(items), [items]);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(() =>
    pickBestKeyForItems(items)
  );
  const [enabled, setEnabled] = useState(true);
  const firstPage = pages[0];
  const [lastFirstPage, setLastFirstPage] = useState(firstPage);
  if (lastFirstPage !== firstPage) {
    setLastFirstPage(firstPage);
    setSelectedKey(pickBestKeyForItems(items));
  }

  const collection = useMemo(
    () =>
      createListCollection({
        items: validKeys.map((key) => ({ label: key, value: key })),
      }),
    [validKeys]
  );

  if (validKeys.length === 0) return null;

  return (
    <>
      {enabled &&
        selectedKey &&
        pages.map((page, index) => (
          <PageLayer
            key={index}
            page={page}
            pageIndex={index}
            assetKey={selectedKey}
          />
        ))}
      <Section icon={<LuView />} title="Visualization">
        <Stack gap={4}>
          <Field.Root>
            <Field.Label>Asset key</Field.Label>
            <Select.Root
              size={"sm"}
              collection={collection}
              value={selectedKey ? [selectedKey] : []}
              onValueChange={(e) => setSelectedKey(e.value[0])}
              disabled={!enabled}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder={"Select an asset"} />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {collection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>
          <Center>
            <Checkbox.Root
              checked={enabled}
              onCheckedChange={(e) => setEnabled(!!e.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>Enabled</Checkbox.Label>
            </Checkbox.Root>
          </Center>
        </Stack>
      </Section>
    </>
  );
}

function PageLayer({
  page,
  pageIndex,
  assetKey,
}: {
  page: StacItemCollection;
  pageIndex: number;
  assetKey: string;
}) {
  const setLayer = useStore((store) => store.setLayer);
  const sources = useMemo(() => {
    return (page?.features ?? [])
      .map((item) => {
        item.bbox = item.bbox && (sanitizeBbox(item.bbox) as number[]);
        const asset = item.assets[assetKey];
        const cogHref = asset && getCogHref(asset);
        if (cogHref) item.assets.cog = { href: cogHref };
        return item;
      })
      .filter(
        (item): item is StacItem & MosaicSource =>
          !!item.bbox && !!item.assets.cog
      );
  }, [page, assetKey]);

  useEffect(() => {
    const id = `search-visualization-page-${pageIndex}`;
    if (sources.length === 0) {
      setLayer(id, undefined);
      return;
    }
    setLayer(
      id,
      new MosaicLayer({
        id,
        sources,
        getSource: async (source) => source.assets.cog.href,
        renderSource: (source, { data, signal }) => {
          const href = source.assets.cog.href;
          return new COGLayer({
            id: `cog-${href}`,
            epsgResolver,
            geotiff: data,
            signal,
          });
        },
      })
    );
    return () => setLayer(id, undefined);
  }, [sources, pageIndex, setLayer]);

  return null;
}

function getValidAssetKeys(items: StacItem[]): string[] {
  const keys = new Set<string>();
  for (const item of items) {
    const assets = item.assets as StacAssets | undefined;
    if (!assets) continue;
    for (const [key, asset] of Object.entries(assets)) {
      if (getCogHref(asset)) keys.add(key);
    }
  }
  return [...keys].sort();
}

function pickBestKeyForItems(items: StacItem[]): string | undefined {
  if (items.length === 0) return undefined;
  const counts = new Map<string, number>();
  const hasVisualRole = new Set<string>();
  for (const item of items) {
    const assets = item.assets as StacAssets | undefined;
    if (!assets) continue;
    for (const [key, asset] of Object.entries(assets)) {
      if (!getCogHref(asset)) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (asset.roles?.includes("visual")) hasVisualRole.add(key);
    }
  }
  if (counts.size === 0) return undefined;
  const score = (key: string) =>
    (key === "visual" ? 2 : 0) +
    (hasVisualRole.has(key) ? 1 : 0) +
    (counts.get(key) ?? 0) / items.length;
  let best: string | undefined;
  let bestScore = -Infinity;
  for (const key of counts.keys()) {
    const s = score(key);
    if (s > bestScore) {
      bestScore = s;
      best = key;
    }
  }
  return best;
}

function isItemInBbox(item: StacItem, bbox: BBox2D): boolean {
  const itemBbox = item.bbox as BBox2D | undefined;
  if (!itemBbox) return false;
  if (bbox[2] - bbox[0] >= 360) return true;
  return !(
    itemBbox[0] > bbox[2] ||
    itemBbox[1] > bbox[3] ||
    itemBbox[2] < bbox[0] ||
    itemBbox[3] < bbox[1]
  );
}

function toDatetimeInputValue(datetime: string | null | undefined): string {
  if (!datetime) return "";
  const date = new Date(datetime);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 19);
}

function toMs(datetime: string | null | undefined): number | undefined {
  if (!datetime) return undefined;
  const ms = new Date(datetime).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}

function datetimeInputToMs(value: string): number | undefined {
  if (!value) return undefined;
  const ms = new Date(`${value}Z`).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}

function msToDatetimeInputValue(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19);
}

function Error({ error }: { error: Error | null }) {
  return (
    <Alert.Root status={"error"}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{error ? error.name : "Unknown error"}</Alert.Title>
        {error && <Alert.Description>{error.message}</Alert.Description>}
      </Alert.Content>
    </Alert.Root>
  );
}

function toStacDatetime(datetime: string | null): string {
  return datetime ? new Date(`${datetime}Z`).toISOString() : "..";
}
