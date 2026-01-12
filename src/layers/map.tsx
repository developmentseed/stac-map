import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MaplibreMap,
  type MapRef,
  useControl,
} from "react-map-gl/maplibre";
import { type DeckProps, Layer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import {
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
} from "@geoarrow/deck.gl-layers";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import "maplibre-gl/dist/maplibre-gl.css";
import type { SpatialExtent, StacCollection, StacItem } from "stac-ts";
import { COGLayer } from "@developmentseed/deck.gl-geotiff";
import type { BBox, Feature, FeatureCollection } from "geojson";
import { useColorModeValue } from "../components/ui/color-mode";
import type { GeoparquetTable } from "../hooks/stac-value";
import type { BBox2D, Color } from "../types/map";
import type { StacValue } from "../types/stac";
import { ValidGeometryType } from "../utils/stac-geoparquet";

export default function Map({
  value,
  collections,
  filteredCollections,
  items,
  fillColor,
  lineColor,
  setBbox,
  picked,
  setPicked,
  geoparquetTable,
  setStacGeoparquetItemId,
  cogHref,
}: {
  value: StacValue | undefined;
  collections: StacCollection[] | undefined;
  filteredCollections: StacCollection[] | undefined;
  items: StacItem[] | undefined;
  fillColor: Color;
  lineColor: Color;
  setBbox: (bbox: BBox2D | undefined) => void;
  picked: StacValue | undefined;
  setPicked: (picked: StacValue | undefined) => void;
  geoparquetTable: GeoparquetTable | undefined;
  setStacGeoparquetItemId: (id: string | undefined) => void;
  cogHref: string | undefined;
}) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapStyle = useColorModeValue(
    "positron-gl-style",
    "dark-matter-gl-style"
  );
  const table = geoparquetTable?.table;
  const geometryType = geoparquetTable?.geometryType;
  const valueGeoJson = useMemo(() => {
    if (value) {
      return valueToGeoJson(value);
    } else {
      return undefined;
    }
  }, [value]);
  const pickedGeoJson = useMemo(() => {
    if (picked) {
      return valueToGeoJson(picked);
    } else {
      return undefined;
    }
  }, [picked]);
  const collectionsGeoJson = useMemo(() => {
    return (filteredCollections || collections)
      ?.map(
        (collection) =>
          collection.extent?.spatial?.bbox &&
          bboxPolygon(getCollectionExtents(collection) as BBox)
      )
      .filter((feature) => !!feature);
  }, [collections, filteredCollections]);

  const inverseFillColor: Color = [
    256 - fillColor[0],
    256 - fillColor[1],
    256 - fillColor[2],
    fillColor[3],
  ];
  const inverseLineColor: Color = [
    256 - fillColor[0],
    256 - fillColor[1],
    256 - fillColor[2],
    fillColor[3],
  ];

  let layers: Layer[] = [];

  if (cogHref)
    layers.push(
      new COGLayer({
        id: "cog-layer",
        geotiff: cogHref,
      })
    );
  layers = [
    ...layers,
    new GeoJsonLayer({
      id: "picked",
      data: pickedGeoJson,
      filled: true,
      getFillColor: inverseFillColor,
      getLineColor: inverseLineColor,
      getLineWidth: 2,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "items",
      data: items as Feature[] | undefined,
      filled: true,
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: 2,
      lineWidthUnits: "pixels",
      pickable: true,
      onClick: (info) => {
        setPicked(info.object);
      },
    }),
    new GeoJsonLayer({
      id: "collections",
      data: collectionsGeoJson,
      filled: false,
      getLineColor: lineColor,
      getLineWidth: 2,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "value",
      data: valueGeoJson,
      filled: !items && !cogHref,
      getFillColor: collections ? inverseFillColor : fillColor,
      getLineColor: collections ? inverseLineColor : lineColor,
      getLineWidth: 2,
      lineWidthUnits: "pixels",
      pickable: value?.type !== "Collection" && value?.type !== "Feature",
      onClick: (info) => {
        setPicked(info.object);
      },
    }),
  ];
  if (table) {
    if (geometryType === ValidGeometryType.Polygon) {
      layers.push(
        new GeoArrowPolygonLayer({
          id: "table-polygon",
          data: table,
          filled: true,
          getFillColor: fillColor,
          getLineColor: lineColor,
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          pickable: true,
          onClick: (info) => {
            setStacGeoparquetItemId(table.getChild("id")?.get(info.index));
          },
        })
      );
    } else if (geometryType === ValidGeometryType.Point) {
      layers.push(
        new GeoArrowScatterplotLayer({
          id: "table-point",
          data: table,
          getColor: lineColor,
          getRadius: 2,
          getPosition: table.getChild("geometry")!,
          radiusUnits: "pixels",
          pickable: true,
          onClick: (info) => {
            setStacGeoparquetItemId(table.getChild("id")?.get(info.index));
          },
        })
      );
    }
  }

  useEffect(() => {
    if (value && mapRef.current && mapLoaded) {
      const padding = {
        top: window.innerHeight / 10,
        bottom: window.innerHeight / 20,
        right: window.innerWidth / 20,
        left: window.innerWidth / 20 + window.innerWidth / 3,
      };
      const bbox = getBbox(value, collections);
      if (bbox) mapRef.current.fitBounds(bbox, { linear: true, padding });
    }
  }, [value, collections, mapLoaded]);

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
      onLoad={() => setMapLoaded(true)}
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

function valueToGeoJson(value: StacValue) {
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

function getCollectionExtents(collection: StacCollection): SpatialExtent {
  const spatialExtent = collection.extent?.spatial;
  // check if bbox is a list of lists, otherwise its a single list of nums
  return Array.isArray(spatialExtent?.bbox?.[0])
    ? spatialExtent?.bbox[0]
    : (spatialExtent?.bbox as unknown as SpatialExtent);
}

function getBbox(
  value: StacValue,
  collections: StacCollection[] | undefined
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

function sanitizeBbox(bbox: BBox | SpatialExtent): BBox2D {
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
