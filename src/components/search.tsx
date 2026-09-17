import { useCql2Wasm } from "@/hooks/stac";
import { type BBox2D, type Color, useStore } from "@/store";
import type { StacItemCollection } from "@/types/stac";
import { buildCql2Json, type QueryableFilter } from "@/utils/cql2";
import {
  datetimeInputToMs,
  msToDatetimeInputValue,
  toDatetimeInputValue,
  toMs,
  toStacDatetimeRange,
} from "@/utils/datetime";
import { getPaddedViewportBbox } from "@/utils/map";
import { fetchStacValue, getLinkHref, getQueryablesHref } from "@/utils/stac";
import {
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Fieldset,
  IconButton,
  Input,
  Portal,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useInfiniteQuery } from "@tanstack/react-query";
import bboxPolygon from "@turf/bbox-polygon";
import { useEffect, useMemo, useState } from "react";
import { LuFileSearch2, LuFrame, LuSettings2, LuX } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacCollection, StacLink } from "stac-ts";
import { Items } from "./items";
import Queryables from "./queryables";
import DatetimeSlider from "./ui/datetime-slider";
import { ErrorAlert } from "./ui/error-alert";
import PaginationBar from "./ui/pagination-bar";
import Section from "./ui/section";
import Visualization from "./visualization";

export default function Search({
  link,
  collection,
}: {
  link: StacLink;
  collection: StacCollection;
}) {
  const setSearchParams = useStore((store) => store.setSearchParams);
  const setInitialSearchParams = useStore(
    (store) => store.setInitialSearchParams
  );
  const setActiveSearchHref = useStore((store) => store.setActiveSearchHref);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [startDatetime, setStartDatetime] = useState(
    () =>
      useStore.getState().searchParams[link.href]?.startDatetime ??
      useStore.getState().initialSearchParams?.startDatetime ??
      toDatetimeInputValue(collection.extent?.temporal?.interval?.[0]?.[0])
  );
  const [endDatetime, setEndDatetime] = useState(
    () =>
      useStore.getState().searchParams[link.href]?.endDatetime ??
      useStore.getState().initialSearchParams?.endDatetime ??
      toDatetimeInputValue(collection.extent?.temporal?.interval?.[0]?.[1])
  );
  const [limit, setLimit] = useState(
    () =>
      useStore.getState().searchParams[link.href]?.limit ??
      useStore.getState().initialSearchParams?.limit ??
      ""
  );
  const [bbox, setBbox] = useState<BBox2D | undefined>(
    () =>
      useStore.getState().searchParams[link.href]?.bbox ??
      useStore.getState().initialSearchParams?.bbox
  );
  const [queryables, setQueryables] = useState<Record<string, QueryableFilter>>(
    () =>
      useStore.getState().searchParams[link.href]?.queryables ??
      useStore.getState().initialSearchParams?.queryables ??
      {}
  );
  const { map } = useMap();

  useEffect(() => {
    setSearchParams(link.href, {
      startDatetime,
      endDatetime,
      limit,
      bbox,
      queryables,
    });
  }, [
    link.href,
    startDatetime,
    endDatetime,
    limit,
    bbox,
    queryables,
    setSearchParams,
  ]);

  useEffect(() => {
    if (useStore.getState().initialSearchParams) setInitialSearchParams(null);
    setActiveSearchHref(link.href);
    return () => setActiveSearchHref(null);
  }, [link.href, setInitialSearchParams, setActiveSearchHref]);

  const startBoundMs = useMemo(
    () => toMs(collection.extent?.temporal?.interval?.[0]?.[0]),
    [collection]
  );
  const endBoundMs = useMemo(
    () => toMs(collection.extent?.temporal?.interval?.[0]?.[1]),
    [collection]
  );

  const queryablesHref = useMemo(
    () => getQueryablesHref(collection),
    [collection]
  );
  const cql2Wasm = useCql2Wasm({ enabled: !!queryablesHref });

  const href = useMemo(() => {
    const url = new URL(link.href);
    url.searchParams.set("collections", collection.id);
    const datetimeRange = toStacDatetimeRange(startDatetime, endDatetime);
    if (datetimeRange) url.searchParams.set("datetime", datetimeRange);
    if (limit) url.searchParams.set("limit", limit);
    if (bbox) url.searchParams.set("bbox", bbox.join(","));
    const cql2Json = buildCql2Json(queryables);
    if (cql2Json && cql2Wasm.data) {
      const filterText = cql2Wasm.data
        .parseJson(JSON.stringify(cql2Json))
        .to_text();
      url.searchParams.set("filter-lang", "cql2-text");
      url.searchParams.set("filter", filterText);
    }
    return url.toString();
  }, [
    link,
    collection,
    startDatetime,
    endDatetime,
    limit,
    bbox,
    queryables,
    cql2Wasm.data,
  ]);

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
  ) : result.error ? (
    <ErrorAlert title="Search error" error={result.error} />
  ) : null;

  return (
    <>
      {result.data?.pages && result.data.pages.length > 0 && (
        <Visualization itemPages={result.data.pages} />
      )}
      <Section icon={<LuFileSearch2 />} title="Search">
        <Fieldset.Root size={"sm"}>
          <Fieldset.Content>
            <Fieldset.Root size={"sm"}>
              <Fieldset.Legend>Datetime</Fieldset.Legend>
              <Fieldset.Content gap={4}>
                <Stack>
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
                      value={[
                        datetimeInputToMs(startDatetime) ?? startBoundMs,
                        datetimeInputToMs(endDatetime) ?? endBoundMs,
                      ]}
                      onChangeEnd={(v) => {
                        setStartDatetime(msToDatetimeInputValue(v[0]));
                        setEndDatetime(msToDatetimeInputValue(v[1]));
                      }}
                    />
                  )}
                </Stack>
                <Field.Root>
                  <Field.Label>Bounding box</Field.Label>
                  <ButtonGroup size={"sm"} variant={"surface"} attached>
                    <Button
                      disabled={!map}
                      onClick={() => map && setBbox(getPaddedViewportBbox(map))}
                    >
                      <LuFrame /> Set to map extents
                    </Button>
                    {bbox && (
                      <IconButton
                        aria-label={"Clear bounding box"}
                        onClick={() => setBbox(undefined)}
                      >
                        <LuX />
                      </IconButton>
                    )}
                  </ButtonGroup>
                </Field.Root>
              </Fieldset.Content>
            </Fieldset.Root>
          </Fieldset.Content>
        </Fieldset.Root>
        <AdvancedSettings
          limit={limit}
          setLimit={setLimit}
          queryablesHref={queryablesHref}
          queryables={queryables}
          setQueryables={setQueryables}
        />
      </Section>
      {bbox && <BboxLayer bbox={bbox} />}
      {body}
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

function BboxLayer({ bbox }: { bbox: BBox2D }) {
  const setLayer = useStore((store) => store.setLayer);
  const lineColor = useStore((store) => store.lineColor);

  useEffect(() => {
    const id = "search-bbox";
    const inverted: Color = [
      255 - lineColor[0],
      255 - lineColor[1],
      255 - lineColor[2],
      lineColor[3],
    ];
    setLayer(
      id,
      new GeoJsonLayer({
        id,
        data: [bboxPolygon(bbox)],
        filled: false,
        getLineColor: inverted,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
      })
    );
    return () => setLayer(id, undefined);
  }, [bbox, lineColor, setLayer]);

  return null;
}

function AdvancedSettings({
  limit,
  setLimit,
  queryablesHref,
  queryables,
  setQueryables,
}: {
  limit: string;
  setLimit: (value: string) => void;
  queryablesHref: string | undefined;
  queryables: Record<string, QueryableFilter>;
  setQueryables: (value: Record<string, QueryableFilter>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftLimit, setDraftLimit] = useState(limit);
  const [draftQueryables, setDraftQueryables] = useState(queryables);
  const save = () => {
    setLimit(draftLimit);
    setQueryables(draftQueryables);
    setOpen(false);
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) {
          setDraftLimit(limit);
          setDraftQueryables(queryables);
        }
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
                <Queryables
                  href={queryablesHref}
                  value={draftQueryables}
                  onChange={setDraftQueryables}
                />
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
