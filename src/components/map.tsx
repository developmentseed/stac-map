import { useEffect, useRef } from "react";
import { useMemo, useState } from "react";
import {
  Map as MaplibreMap,
  type MapRef,
  useControl,
} from "react-map-gl/maplibre";
import { type DeckProps } from "@deck.gl/core";
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
import { useStore } from "../store";
import type { BBox2D } from "../types/map";
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
  const setHref = useStore((store) => store.setHref);
  const value = useStore((store) => store.value);
  const collections = useStore((store) => store.collections);
  const filteredCollections = useStore((store) => store.filteredCollections);
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);
  const searchItems = useStore((store) => store.searchItems);
  const geotiffHref = useStore((store) => store.geotiffHref);
  const setBbox = useStore((store) => store.setBbox);
  const fillColor = useStore((store) => store.fillColor);
  const lineColor = useStore((store) => store.lineColor);
  const lineWidth = useStore((store) => store.lineWidth);

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

  const layers = [];

  if (geotiffHref) {
    layers.push(
      new COGLayer({
        id: "cog",
        geotiff: geotiffHref,
      })
    );
  }
  if (searchItems) {
    layers.push(
      new GeoJsonLayer({
        id: "search-items",
        data: featureCollection(searchItems as Feature[]),
        filled: true,
        getFillColor: fillColor,
        getLineColor: lineColor,
        getLineWidth: lineWidth,
        lineWidthUnits: "pixels",
      })
    );
  }
  if (valueGeoJson) {
    layers.push(
      new GeoJsonLayer({
        id: "value",
        data: valueGeoJson,
        filled: !(geotiffHref || searchItems),
        getFillColor: fillColor,
        getLineColor: lineColor,
        getLineWidth: lineWidth,
        lineWidthUnits: "pixels",
        updateTriggers: {
          filled: [geotiffHref, searchItems],
        },
      })
    );
  }
  if (hoveredCollection) {
    layers.push(
      new GeoJsonLayer({
        id: "hovered-collection",
        data: [bboxPolygon(getCollectionExtents(hoveredCollection) as BBox)],
        filled: true,
        getFillColor: fillColor,
        getLineColor: lineColor,
        getLineWidth: lineWidth,
        lineWidthUnits: "pixels",
      })
    );
  }
  if (collectionsGeoJson) {
    layers.push(
      new GeoJsonLayer({
        id: "collections",
        data: collectionsGeoJson,
        filled: true,
        getFillColor: [fillColor[0], fillColor[1], fillColor[2], 0],
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
      <DeckGLOverlay layers={layers}></DeckGLOverlay>
    </MaplibreMap>
  );
}

function DeckGLOverlay(props: DeckProps) {
  const control = useControl<MapboxOverlay>(() => new MapboxOverlay({}));
  control.setProps(props);
  return <></>;
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
