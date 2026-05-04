import { useStacValue } from "@/hooks/stac";
import { useStore } from "@/store";
import type { StacAssets, StacValue } from "@/types/stac";
import {
  conformsToFreeTextCollectionSearch,
  getLink,
  getSpatialExtent,
  getStacTitle,
  getThumbnailAsset,
  sanitizeBbox,
} from "@/utils/stac";
import { Badge, Heading, HStack, Stack } from "@chakra-ui/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import type { Feature, FeatureCollection, GeoJsonProperties } from "geojson";
import { useEffect, useMemo } from "react";
import type { StacCollection, StacLink } from "stac-ts";
import Assets from "./assets";
import Breadcrumbs from "./breadcrumbs";
import Buttons from "./buttons";
import Children from "./children";
import { CollectionsEndpoint } from "./collections";
import { ItemLinks } from "./items";
import Links from "./links";
import Properties from "./properties";
import Search from "./search";
import StacGeoparquet from "./stac-geoparquet";
import Tilejson from "./tilejson";
import Description from "./ui/description";
import Thumbnail from "./ui/thumbnail";

export default function Value({
  href,
  value,
  connection,
}: {
  href: string;
  value: StacValue;
  connection?: AsyncDuckDBConnection;
}) {
  const lineColor = useStore((store) => store.lineColor);
  const setValueBbox = useStore((store) => store.setValueBbox);
  const setLayer = useStore((store) => store.setLayer);
  const hrefIsParquet = useStore((store) => store.hrefIsParquet);
  const version = value.stac_version as string;
  const thumbnailAsset = getThumbnailAsset(value);
  const description = value.description as string;
  const collectionsLink = getLink(value, "data");
  const childLinks = value.links?.filter((link) => link.rel === "child");
  const itemLinks = value.links?.filter((link) => link.rel === "item");
  const rootLink = getLink(value, "root");
  const tilejsonLink = getLink(value, "tilejson");
  const properties = value.properties as GeoJsonProperties | undefined;
  const assets = value.assets as StacAssets | undefined;

  useEffect(() => {
    switch (value.type) {
      case "Collection":
        setValueBbox(sanitizeBbox(getSpatialExtent(value)));
        break;
      case "Feature":
        setValueBbox((value.bbox && sanitizeBbox(value.bbox)) || null);
        break;
      case "FeatureCollection":
        setValueBbox(sanitizeBbox(bbox(value as FeatureCollection)));
        break;
    }
  }, [value, setValueBbox]);

  useEffect(() => {
    setLayer(
      "value",
      new GeoJsonLayer({
        id: "value",
        data: (value && toGeoJson(value)) || undefined,
        filled: true,
        getFillColor: [0, 0, 0, 0],
        getLineColor: lineColor,
        getLineWidth: 2,
        lineWidthUnits: "pixels",
      })
    );

    return () => {
      setLayer("value", undefined);
    };
  }, [value, setLayer, lineColor]);

  return (
    <Stack gap={4}>
      <Stack gap={4}>
        <Heading>
          <HStack gap={4}>
            {getStacTitle(value)}
            {version && <Badge variant={"surface"}>{version}</Badge>}
          </HStack>
        </Heading>
        <Breadcrumbs value={value} />
        {thumbnailAsset && <Thumbnail asset={thumbnailAsset} />}
        {description && <Description description={description} />}
        <Buttons value={value} />
      </Stack>

      <Stack>
        {collectionsLink && (
          <CollectionsEndpoint
            link={collectionsLink}
            hasCollectionSearch={conformsToFreeTextCollectionSearch(value)}
          />
        )}
        {!collectionsLink && childLinks && childLinks?.length > 0 && (
          <Children links={childLinks} />
        )}
        {itemLinks && itemLinks?.length > 0 && <ItemLinks links={itemLinks} />}
        {rootLink && <Root link={rootLink} value={value} />}
        {properties && <Properties properties={properties} />}
        {tilejsonLink && <Tilejson link={tilejsonLink} />}
        {assets && <Assets assets={assets} />}
        {value.links && <Links links={value.links} />}
      </Stack>

      {hrefIsParquet && connection && (
        <StacGeoparquet href={href} connection={connection} />
      )}
    </Stack>
  );
}

function Root({ value, link }: { value: StacValue; link: StacLink }) {
  const result = useStacValue({ href: link.href });

  const searchLink = useMemo(() => {
    return result.data && getLink(result.data, "search");
  }, [result]);

  return searchLink && value.type === "Collection" ? (
    <Search link={searchLink} collection={value} />
  ) : null;
}

function toGeoJson(value: StacValue) {
  switch (value.type) {
    case "Collection":
      return collectionToFeature(value);
    case "Feature":
      return value as Feature;
    case "FeatureCollection":
      return value as FeatureCollection;
  }
}

function collectionToFeature(collection: StacCollection) {
  const bbox = sanitizeBbox(getSpatialExtent(collection)) || [
    -180, -90, 180, 90,
  ];
  return bboxPolygon(bbox, {
    id: collection.id,
  });
}
