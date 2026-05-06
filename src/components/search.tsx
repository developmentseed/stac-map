import { type BBox2D, type Color, useStore } from "@/store";
import type { StacItemCollection } from "@/types/stac";
import {
  datetimeInputToMs,
  msToDatetimeInputValue,
  toDatetimeInputValue,
  toMs,
} from "@/utils/datetime";
import { getPaddedViewportBbox } from "@/utils/map";
import { fetchStacValue, getLinkHref } from "@/utils/stac";
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
} from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useInfiniteQuery } from "@tanstack/react-query";
import bboxPolygon from "@turf/bbox-polygon";
import { useEffect, useMemo, useState } from "react";
import { LuFileSearch2, LuFrame, LuSettings2, LuX } from "react-icons/lu";
import { useMap } from "react-map-gl/maplibre";
import type { StacCollection, StacLink } from "stac-ts";
import { Items } from "./items";
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
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [startDatetime, setStartDatetime] = useState(
    () =>
      useStore.getState().searchParams[link.href]?.startDatetime ??
      toDatetimeInputValue(collection.extent?.temporal?.interval?.[0]?.[0])
  );
  const [endDatetime, setEndDatetime] = useState(
    () =>
      useStore.getState().searchParams[link.href]?.endDatetime ??
      toDatetimeInputValue(collection.extent?.temporal?.interval?.[0]?.[1])
  );
  const [limit, setLimit] = useState(
    () => useStore.getState().searchParams[link.href]?.limit ?? ""
  );
  const [bbox, setBbox] = useState<BBox2D | undefined>(
    () => useStore.getState().searchParams[link.href]?.bbox
  );
  const { map } = useMap();

  useEffect(() => {
    setSearchParams(link.href, {
      startDatetime,
      endDatetime,
      limit,
      bbox,
    });
  }, [link.href, startDatetime, endDatetime, limit, bbox, setSearchParams]);

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
    if (bbox) url.searchParams.set("bbox", bbox.join(","));
    return url.toString();
  }, [link, collection, startDatetime, endDatetime, limit, bbox]);

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
        <AdvancedSettings limit={limit} setLimit={setLimit} />
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

function toStacDatetime(datetime: string | null): string {
  return datetime ? new Date(`${datetime}Z`).toISOString() : "..";
}
