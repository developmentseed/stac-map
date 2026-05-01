import { useStore } from "@/store";
import type { StacCollections } from "@/types/stac";
import { fetchStacValue, getLinkHref } from "@/utils/stac";
import {
  ActionBar,
  Alert,
  Button,
  ButtonGroup,
  List,
  Portal,
  SegmentGroup,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import bboxPolygon from "@turf/bbox-polygon";
import type { BBox, Feature } from "geojson";
import { useEffect, useMemo, useState } from "react";
import {
  LuFolderPlus,
  LuForward,
  LuList,
  LuPause,
  LuPlay,
  LuSquare,
} from "react-icons/lu";
import type { SpatialExtent, StacCollection, StacLink } from "stac-ts";
import CollectionCard from "./cards/collection";
import CollectionListItem from "./list-items/collection";
import Section from "./ui/section";

type BBox2D = [number, number, number, number];

export default function Collections({ link }: { link: StacLink }) {
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const result = useInfiniteQuery({
    queryKey: ["collections", link.href],
    queryFn: async ({ pageParam }) => fetchStacValue({ href: pageParam }),
    initialPageParam: link.href,
    getNextPageParam: (lastPage: StacCollections | null) =>
      lastPage ? getLinkHref(lastPage, "next") : undefined,
  });

  useEffect(() => {
    if (isFetchingAll && result.hasNextPage && !result.isFetchingNextPage)
      result.fetchNextPage();
  }, [isFetchingAll, result]);

  const collections = useMemo(() => {
    return result.data?.pages
      .flatMap((page) => page?.collections)
      .filter((collection) => !!collection);
  }, [result.data]);

  const numberMatched = useMemo(() => {
    return result.data?.pages[0]?.numberMatched;
  }, [result.data]);

  const body = collections ? (
    <Data collections={collections} />
  ) : result.isLoading ? (
    <Loading />
  ) : (
    <Error error={result.error} />
  );
  return (
    <>
      <Section icon={<LuFolderPlus />} title="Collections">
        {body}
      </Section>
      {collections && (
        <Actions
          collections={collections}
          numberMatched={numberMatched}
          isFetchingAll={isFetchingAll}
          setIsFetchingAll={setIsFetchingAll}
          {...result}
        />
      )}
    </>
  );
}

type View = "list" | "card";

function Data({ collections }: { collections: StacCollection[] }) {
  const [hovered, setHovered] = useState<StacCollection>();
  const [view, setView] = useState<View>("card");
  const fillColor = useStore((state) => state.fillColor);
  const lineColor = useStore((state) => state.lineColor);
  const setLayer = useStore((state) => state.setLayer);

  const bounds = useMemo(() => {
    return collections
      ?.map((collection) => ({
        id: collection.id,
        bbox: sanitizeBbox(getSpatialExtent(collection)),
      }))
      .filter(
        (entry): entry is { id: string; bbox: BBox2D } =>
          !!entry.bbox && !isGlobalBbox(entry.bbox)
      )
      .map(({ id, bbox }) => bboxPolygon(bbox, { id }));
  }, [collections]);

  useEffect(() => {
    setLayer(
      "collections",
      new GeoJsonLayer({
        id: "collections",
        data: bounds,
        filled: true,
        getFillColor: (e: Feature) =>
          e.id === hovered?.id ? fillColor : [0, 0, 0, 0],
        getLineColor: lineColor,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        pickable: true,
        onHover: (e) => {
          if (e.object && !isGlobalBbox(e.object.bbox))
            setHovered(
              collections.find((collection) => collection.id === e.object.id)
            );
          else setHovered(undefined);
        },
        updateTriggers: {
          getFillColor: [fillColor, hovered],
        },
      })
    );

    return () => setLayer("collections", undefined);
  }, [bounds, setLayer, fillColor, hovered, lineColor, collections]);

  return (
    <Stack>
      <SegmentGroup.Root
        size={"xs"}
        alignSelf={"flex-end"}
        value={view}
        onValueChange={(e) => e.value && setView(e.value as View)}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={[
            {
              value: "list",
              label: <LuList />,
            },
            {
              value: "card",
              label: <LuSquare />,
            },
          ]}
        />
      </SegmentGroup.Root>
      {view === "card" ? (
        <Stack>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              hovered={hovered}
              setHovered={setHovered}
            />
          ))}
        </Stack>
      ) : (
        <List.Root variant={"plain"}>
          {collections.map((collection) => (
            <CollectionListItem
              key={collection.id}
              collection={collection}
              hovered={hovered}
              setHovered={setHovered}
            />
          ))}
        </List.Root>
      )}
    </Stack>
  );
}

function Loading() {
  return <SkeletonText h={3} />;
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

function Actions({
  collections,
  numberMatched,
  isFetchingAll,
  setIsFetchingAll,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}: {
  collections: StacCollection[];
  numberMatched: number | undefined;
  isFetchingAll: boolean;
  setIsFetchingAll: (isFetchingAll: boolean) => void;
} & UseInfiniteQueryResult) {
  return (
    <ActionBar.Root open={true}>
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {collections.length}
              {numberMatched && "/" + numberMatched} collection
              {collections.length !== 1 && "s"} loaded
            </ActionBar.SelectionTrigger>
            {hasNextPage && (
              <>
                <ActionBar.Separator />
                <ButtonGroup size={"sm"} variant={"outline"}>
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage || isFetchingAll}
                  >
                    <LuForward />
                    Next page
                  </Button>
                  <Button onClick={() => setIsFetchingAll(!isFetchingAll)}>
                    {isFetchingAll ? <LuPause /> : <LuPlay />}
                    Fetch all
                  </Button>
                </ButtonGroup>
              </>
            )}
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
}

function getSpatialExtent(collection: StacCollection): SpatialExtent {
  const spatialExtent = collection.extent?.spatial;
  // check if bbox is a list of lists, otherwise its a single list of nums
  return Array.isArray(spatialExtent?.bbox?.[0])
    ? spatialExtent?.bbox[0]
    : (spatialExtent?.bbox as unknown as SpatialExtent);
}

function isGlobalBbox(bbox: BBox2D | SpatialExtent) {
  const sanitizedBbox = sanitizeBbox(bbox);
  return (
    sanitizedBbox &&
    sanitizedBbox[0] == -180 &&
    sanitizedBbox[1] == -90 &&
    sanitizedBbox[2] == 180 &&
    sanitizedBbox[3] == 90
  );
}

function sanitizeBbox(bbox: BBox | SpatialExtent): BBox2D | null {
  if (!bbox) return null;
  if (bbox.length === 6) {
    return [
      Math.max(bbox[0], -180),
      Math.max(bbox[1], -90),
      Math.min(bbox[3], 180),
      Math.min(bbox[4], 90),
    ];
  } else {
    return [
      Math.max(bbox[0], -180),
      Math.max(bbox[1], -90),
      Math.min(bbox[2], 180),
      Math.min(bbox[3], 90),
    ];
  }
}
