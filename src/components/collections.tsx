import { useStore } from "@/store";
import type { StacCollections } from "@/types/stac";
import { fetchStacValue, getLinkHref, getSelfHref } from "@/utils/stac";
import {
  Alert,
  Button,
  Checkbox,
  CloseButton,
  Group,
  Input,
  InputGroup,
  SkeletonText,
} from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useInfiniteQuery } from "@tanstack/react-query";
import bboxPolygon from "@turf/bbox-polygon";
import type { BBox, Feature } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuFolderPlus, LuFolderSearch2, LuSearch } from "react-icons/lu";
import type { SpatialExtent, StacCollection, StacLink } from "stac-ts";
import CollectionCard from "./cards/collection";
import CollectionListItem from "./list-items/collection";
import EntityList from "./ui/entity-list";
import PaginationBar from "./ui/pagination-bar";
import Section from "./ui/section";

type BBox2D = [number, number, number, number];

export default function Collections({
  link,
  hasCollectionSearch,
}: {
  link: StacLink;
  hasCollectionSearch: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isFetchingAll, setIsFetchingAll] = useState(false);

  const href = useMemo(() => {
    const url = new URL(link.href);
    if (search) url.searchParams.set("q", search);
    return url.toString();
  }, [link, search]);

  const result = useInfiniteQuery({
    queryKey: ["collections", href],
    queryFn: async ({ pageParam }) => fetchStacValue({ href: pageParam }),
    initialPageParam: href,
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
    collections.length > 0 ? (
      <Data collections={collections} />
    ) : (
      <Alert.Root status={"info"}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            No collections found{search && ` for search "${search}"`}
          </Alert.Title>
        </Alert.Content>
      </Alert.Root>
    )
  ) : result.isLoading ? (
    <Loading />
  ) : (
    <Error error={result.error} />
  );
  return (
    <>
      {hasCollectionSearch && <Search setSearch={setSearch} />}
      <Section icon={<LuFolderPlus />} title="Collections">
        {body}
      </Section>
      {collections && collections.length > 0 && (
        <PaginationBar
          count={collections.length}
          numberMatched={numberMatched}
          noun={"collection"}
          isFetchingAll={isFetchingAll}
          setIsFetchingAll={setIsFetchingAll}
          fetchNextPage={result.fetchNextPage}
          isFetchingNextPage={result.isFetchingNextPage}
          hasNextPage={result.hasNextPage}
        />
      )}
    </>
  );
}

function Data({ collections }: { collections: StacCollection[] }) {
  const [includeGlobal, setIncludeGlobal] = useState(false);
  const [filterByMapBbox, setFilterByMapBbox] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [hovered, setHovered] = useState<StacCollection>();
  const setHref = useStore((store) => store.setHref);
  const fillColor = useStore((store) => store.fillColor);
  const lineColor = useStore((store) => store.lineColor);
  const setLayer = useStore((store) => store.setLayer);
  const mapBbox = useStore((store) => store.mapBbox);

  const filteredCollections = useMemo(() => {
    const needle = filterText.trim().toLowerCase();
    return collections.filter((collection) => {
      if (
        filterByMapBbox &&
        mapBbox &&
        !isCollectionInBbox(collection, mapBbox, includeGlobal)
      ) {
        return false;
      }
      if (needle) {
        const id = collection.id?.toLowerCase() ?? "";
        const title = collection.title?.toLowerCase() ?? "";
        if (!id.includes(needle) && !title.includes(needle)) return false;
      }
      return true;
    });
  }, [collections, includeGlobal, filterByMapBbox, mapBbox, filterText]);

  const bounds = useMemo(() => {
    return filteredCollections
      ?.map((collection) => ({
        id: collection.id,
        bbox: sanitizeBbox(getSpatialExtent(collection)),
      }))
      .filter(
        (entry): entry is { id: string; bbox: BBox2D } =>
          !!entry.bbox && !isGlobalBbox(entry.bbox)
      )
      .map(({ id, bbox }) => bboxPolygon(bbox, { id }));
  }, [filteredCollections]);

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
        onClick: (e) => {
          const collection: StacCollection | undefined =
            e.object &&
            collections.find((collection) => collection.id === e.object?.id);
          const href = collection && getSelfHref(collection);
          if (href) setHref(href);
        },
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
  }, [bounds, setLayer, fillColor, hovered, lineColor, collections, setHref]);

  const filters = (
    <>
      <Checkbox.Root
        size={"sm"}
        checked={includeGlobal}
        onCheckedChange={(e) => setIncludeGlobal(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Include global collections</Checkbox.Label>
      </Checkbox.Root>
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
      items={filteredCollections}
      getKey={(collection) => collection.id}
      renderCard={(collection) => (
        <CollectionCard
          collection={collection}
          hovered={hovered}
          setHovered={setHovered}
        />
      )}
      renderListItem={(collection) => (
        <CollectionListItem
          collection={collection}
          hovered={hovered}
          setHovered={setHovered}
        />
      )}
      filters={filters}
      defaultView={"card"}
    />
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

function isCollectionInBbox(
  collection: StacCollection,
  bbox: BBox2D,
  includeGlobalCollections: boolean
) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every collection
    return true;
  } else if (includeGlobalCollections && isGlobalCollection(collection)) {
    // A global collection is always there
    return true;
  }
  const collectionBbox = collection?.extent?.spatial?.bbox?.[0];
  if (collectionBbox) {
    return (
      !(
        collectionBbox[0] < bbox[0] &&
        collectionBbox[1] < bbox[1] &&
        collectionBbox[2] > bbox[2] &&
        collectionBbox[3] > bbox[3]
      ) &&
      !(
        collectionBbox[0] > bbox[2] ||
        collectionBbox[1] > bbox[3] ||
        collectionBbox[2] < bbox[0] ||
        collectionBbox[3] < bbox[1]
      )
    );
  } else {
    return false;
  }
}

function isGlobalCollection(collection: StacCollection) {
  const bbox = getSpatialExtent(collection);
  return isGlobalBbox(bbox);
}

function Search({ setSearch }: { setSearch: (search: string) => void }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Section icon={<LuFolderSearch2 />} title="Collection search">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(input);
        }}
      >
        <Group width={"full"}>
          <InputGroup
            flex={1}
            endElement={
              input && (
                <CloseButton
                  size={"xs"}
                  me="-2"
                  onClick={() => {
                    setInput("");
                    setSearch("");
                    inputRef.current?.focus();
                  }}
                />
              )
            }
          >
            <Input
              placeholder="Free-text collection search"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
          </InputGroup>
          <Button variant={"outline"} type="submit">
            <LuSearch /> Search
          </Button>
        </Group>
      </form>
    </Section>
  );
}
