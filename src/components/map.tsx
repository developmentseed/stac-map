import { type RefObject, useEffect, useRef } from "react";
import { useMemo, useState } from "react";
import {
  Map as MaplibreMap,
  type MapRef,
  useControl,
} from "react-map-gl/maplibre";
import { type DeckProps, Layer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { featureCollection } from "@turf/helpers";
import "maplibre-gl/dist/maplibre-gl.css";
import type { StacCollection } from "stac-ts";
import { COGLayer } from "@developmentseed/deck.gl-geotiff";
import type { BBox, Feature, FeatureCollection } from "geojson";
import { useColorModeValue } from "../components/ui/color-mode";
import { useBoundStore } from "../store";
import type { BBox2D, Color } from "../types/map";
import type { StacValue } from "../types/stac";
import { sanitizeBbox } from "../utils/map";
import {
  getCollectionExtents,
  getSelfHref,
  isGlobalCollection,
} from "../utils/stac";

export default function Map() {
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useColorModeValue(
    "positron-gl-style",
    "dark-matter-gl-style"
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const setHref = useBoundStore((store) => store.setHref);
  const value = useBoundStore((store) => store.value);
  const collections = useBoundStore((store) => store.collections);
  const filteredCollections = useBoundStore((store) => store.filteredCollections);
  const hoveredCollection = useBoundStore((store) => store.hoveredCollection);
  const setHoveredCollection = useBoundStore((store) => store.setHoveredCollection);
  const hoveredItem = useBoundStore((store) => store.hoveredItem);
  const setHoveredItem = useBoundStore((store) => store.setHoveredItem);
  const pickedItem = useBoundStore((store) => store.pickedItem);
  const setPickedItem = useBoundStore((store) => store.setPickedItem);
  const searchItems = useBoundStore((store) => store.searchItems);
  const geotiffHref = useBoundStore((store) => store.geotiffHref);
  const setBbox = useBoundStore((store) => store.setBbox);
  const fillColor = useBoundStore((store) => store.fillColor);
  const lineColor = useBoundStore((store) => store.lineColor);
  const lineWidth = useBoundStore((store) => store.lineWidth);

  const inverseFillColor = [
    256 - fillColor[0],
    256 - fillColor[1],
    256 - fillColor[2],
    fillColor[3],
  ];
  const inverseLineColor = [
    256 - fillColor[0],
    256 - fillColor[1],
    256 - fillColor[2],
    fillColor[3],
  ];

  const valueGeoJson = useMemo(() => {
    if (value) {
      return toGeoJson(value);
    }
  }, [value]);
  const collectionsGeoJson = useMemo(() => {
    return (filteredCollections || collections)
      ?.map(
        (collection) =>
          collection.extent?.spatial?.bbox &&
          bboxPolygon(getCollectionExtents(collection) as BBox, {
            id: collection.id,
          })
      )
      .filter((feature) => !!feature);
  }, [collections, filteredCollections]);

  useEffect(() => {
    if (value && mapRef.current && isMapLoaded) {
      const padding = {
        top: window.innerHeight / 10,
        bottom: window.innerHeight / 20,
        right: window.innerWidth / 20,
        left: window.innerWidth / 20 + window.innerWidth / 3,
      };
      const bbox = getBbox(value, collections);
      if (bbox) mapRef.current.fitBounds(bbox, { linear: true, padding });
    }
  }, [value, isMapLoaded, collections]);

  const layers: Layer[] = [
    new GeoJsonLayer({
      id: "picked-item",
      data: pickedItem ? ([pickedItem] as Feature[]) : [],
      filled: true,
      getFillColor: inverseFillColor as Color,
      getLineColor: inverseLineColor as Color,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "hovered-item",
      data: hoveredItem ? ([hoveredItem] as Feature[]) : [],
      filled: true,
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "hovered-collection",
      data: hoveredCollection
        ? [bboxPolygon(getCollectionExtents(hoveredCollection) as BBox)]
        : [],
      filled: true,
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "search-items",
      data: searchItems ? featureCollection(searchItems as Feature[]) : [],
      filled: true,
      getFillColor: geotiffHref ? [0, 0, 0, 0] : fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
      pickable: true,
      onHover: (e) => {
        setHoveredItem(e.object);
      },
      onClick: (e) => {
        setPickedItem(e.object);
      },
    }),
    new GeoJsonLayer({
      id: "collections",
      data: collectionsGeoJson,
      filled: true,
      getFillColor: [0, 0, 0, 0],
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
      pickable: true,
      onHover: (e) => {
        setHoveredCollection(
          collections?.find(
            (collection) =>
              collection.id == e.object?.id && !isGlobalCollection(collection)
          ) || null
        );
      },
      onClick: (e) => {
        const collection = collections?.find(
          (collection) =>
            collection.id == e.object?.id && !isGlobalCollection(collection)
        );
        const href = collection && getSelfHref(collection);
        if (href) setHref(href);
      },
    }),
    new GeoJsonLayer({
      id: "value",
      data: valueGeoJson,
      filled: !(geotiffHref || searchItems || collectionsGeoJson),
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
    }),
  ];

  if (geotiffHref) {
    layers.push(
      new COGLayer({
        id: "cog-" + geotiffHref,
        geotiff: geotiffHref,
      })
    );
  }

  return (
    <MaplibreMap
      id="map"
      ref={mapRef}
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      mapStyle={`https://basemaps.cartocdn.com/gl/${mapStyle}/style.json`}
      style={{ zIndex: 0 }}
      onLoad={() => setIsMapLoaded(true)}
      onMoveEnd={() => {
        if (mapRef.current && !mapRef.current.isMoving())
          setBbox(sanitizeBbox(mapRef.current?.getBounds().toArray().flat()));
      }}
    >
      <DeckGLOverlay
        layers={layers}
        getCursor={(props) => getCursor(mapRef, props)}
      ></DeckGLOverlay>
    </MaplibreMap>
  );
}

function DeckGLOverlay(props: DeckProps) {
  const control = useControl<MapboxOverlay>(() => new MapboxOverlay({}));
  control.setProps(props);
  return <></>;
}

function getCursor(
  mapRef: RefObject<MapRef | null>,
  {
    isHovering,
    isDragging,
  }: {
    isHovering: boolean;
    isDragging: boolean;
  }
) {
  let cursor = "grab";
  if (isHovering) {
    cursor = "pointer";
  } else if (isDragging) {
    cursor = "grabbing";
  }
  if (mapRef.current) {
    mapRef.current.getCanvas().style.cursor = cursor;
  }
  return cursor;
}

function toGeoJson(value: StacValue) {
  switch (value.type) {
    case "Catalog":
      return undefined;
    case "Collection":
      return (
        value.extent?.spatial?.bbox &&
        bboxPolygon(getCollectionExtents(value) as BBox)
      );
    case "Feature":
      return value as Feature;
    case "FeatureCollection":
      return value as FeatureCollection;
  }
}

function getBbox(
  value: StacValue,
  collections: StacCollection[] | null
): BBox2D | undefined {
  let valueBbox;
  switch (value.type) {
    case "Catalog":
      valueBbox =
        collections && collections.length > 0
          ? sanitizeBbox(
              collections
                .map((collection) => getCollectionExtents(collection))
                .filter((extents) => !!extents)
                .reduce((accumulator, currentValue) => {
                  return [
                    Math.min(accumulator[0], currentValue[0]),
                    Math.min(accumulator[1], currentValue[1]),
                    Math.max(accumulator[2], currentValue[2]),
                    Math.max(accumulator[3], currentValue[3]),
                  ];
                })
            )
          : undefined;
      break;
    case "Collection":
      valueBbox = getCollectionExtents(value);
      break;
    case "Feature":
      valueBbox = value.bbox;
      break;
    case "FeatureCollection":
      valueBbox = bbox(value as FeatureCollection) as BBox2D;
      break;
  }
  return valueBbox ? sanitizeBbox(valueBbox) : undefined;
}
