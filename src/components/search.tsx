import { useStore } from "@/store";
import type { StacItemCollection } from "@/types/stac";
import { fetchStacValue, getLinkHref, getSelfHref } from "@/utils/stac";
import { Alert, Field, Fieldset, Input, SkeletonText } from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Feature } from "geojson";
import { useEffect, useMemo, useState } from "react";
import { LuFiles, LuFileSearch2 } from "react-icons/lu";
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
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [startDatetime, setStartDatetime] = useState(() =>
    toDateInputValue(collection.extent?.temporal?.interval?.[0]?.[0])
  );
  const [endDatetime, setEndDatetime] = useState(() =>
    toDateInputValue(collection.extent?.temporal?.interval?.[0]?.[1])
  );
  const [limit, setLimit] = useState("");

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
            <Field.Root>
              <Field.Label>Start datetime</Field.Label>
              <Input
                size={"sm"}
                type={"date"}
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>End datetime</Field.Label>
              <Input
                size={"sm"}
                type={"date"}
                value={endDatetime}
                onChange={(e) => setEndDatetime(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Limit</Field.Label>
              <Input
                size={"sm"}
                type={"number"}
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </Field.Root>
          </Fieldset.Content>
        </Fieldset.Root>
      </Section>
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

function Items({ items }: { items: StacItem[] }) {
  const [hovered, setHovered] = useState<StacItem>();
  const setHref = useStore((store) => store.setHref);
  const setLayer = useStore((store) => store.setLayer);
  const fillColor = useStore((store) => store.fillColor);
  const lineColor = useStore((store) => store.lineColor);

  useEffect(() => {
    setLayer(
      "items",
      new GeoJsonLayer({
        id: "items",
        data: items as Feature[],
        filled: true,
        getFillColor: (e: Feature) =>
          e.id === hovered?.id ? fillColor : [0, 0, 0, 0],
        getLineColor: lineColor,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        pickable: true,
        onClick: (e) => {
          const item: StacItem | undefined =
            e.object && items.find((item) => item.id === e.object?.id);
          const href = item && getSelfHref(item);
          if (href) setHref(href);
        },
        onHover: (e) => {
          if (e.object)
            setHovered(items.find((item) => item.id === e.object.id));
          else setHovered(undefined);
        },
        updateTriggers: {
          getFillColor: [fillColor, hovered],
        },
      })
    );

    return () => setLayer("items", undefined);
  }, [setLayer, fillColor, hovered, lineColor, items, setHref]);

  return (
    <EntityList
      items={items}
      getKey={(item) => item.id}
      renderCard={(item) => <ItemCard item={item} />}
      renderListItem={(item) => <ItemListItem item={item} />}
      defaultView={"list"}
    />
  );
}

function toDateInputValue(datetime: string | null | undefined): string {
  if (!datetime) return "";
  const date = new Date(datetime);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
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
  return datetime ? new Date(datetime).toISOString() : "..";
}
