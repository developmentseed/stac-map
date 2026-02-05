import { useCollectionBounds, useItems } from "@/hooks/store";
import type { StacValue } from "@/types/stac";
import { sanitizeBbox } from "@/utils/bbox";
import { fitBounds } from "@/utils/map";
import { collectionToFeature, isGlobalBbox } from "@/utils/stac";
import { type DeckProps, Layer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { COGLayer, MosaicLayer, proj } from "@developmentseed/deck.gl-geotiff";
import {
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
} from "@geoarrow/deck.gl-layers";
import bbox from "@turf/bbox";
import type { Feature, FeatureCollection } from "geojson";
import { toProj4 } from "geotiff-geokeys-to-proj4";
import "maplibre-gl/dist/maplibre-gl.css";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MaplibreMap,
  type MapRef,
  useControl,
} from "react-map-gl/maplibre";
import { useColorModeValue } from "../components/ui/color-mode";
import { useStore } from "../store";

type Color = [number, number, number, number];

export default function Map() {
  const mapRef = useRef<MapRef>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapStyle = useColorModeValue(
    "positron-gl-style",
    "dark-matter-gl-style"
  );
  const projection = useStore((store) => store.projection);
  const value = useStore((store) => store.value);
  const collections = useStore((store) => store.collections);
  const setBbox = useStore((store) => store.setBbox);
  const cogHref = useStore((store) => store.cogHref);
  const cogSources = useStore((store) => store.cogSources);
  const pagedCogSources = useStore((store) => store.pagedCogSources);
  const hoveredItem = useStore((store) => store.hoveredItem);
  const pickedItem = useStore((store) => store.pickedItem);
  const setPickedItem = useStore((store) => store.setPickedItem);
  const setHoveredItem = useStore((store) => store.setHoveredItem);
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const stacGeoparquetTable = useStore((store) => store.stacGeoparquetTable);
  const visualizeItems = useStore((store) => store.visualizeItems);
  const visualizeItemBounds = useStore((store) => store.visualizeItemBounds);
  const visualizeCollections = useStore((store) => store.visualizeCollections);
  const setStacGeoparquetItemId = useStore(
    (store) => store.setStacGeoparquetItemId
  );
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);
  const setHrefFromCollectionId = useStore(
    (store) => store.setHrefFromCollectionId
  );
  const setHoveredCollectionFromId = useStore(
    (store) => store.setHoveredCollectionFromId
  );
  const fillColor = useStore((store) => store.fillColor);
  const lineColor = useStore((store) => store.lineColor);
  const lineWidth = useStore((store) => store.lineWidth);
  const collectionBounds = useCollectionBounds();
  const items = useItems();
  const [hoveredStacGeoparquetItemId, setHoveredStacGeoparquetItemId] =
    useState<string | null>(null);

  const inverseFillColor = [
    256 - fillColor[0],
    256 - fillColor[1],
    256 - fillColor[2],
    fillColor[3],
  ] as Color;
  const inverseLineColor = [
    256 - lineColor[0],
    256 - lineColor[1],
    256 - lineColor[2],
    fillColor[3],
  ] as Color;
  const transparent = [0, 0, 0, 0] as Color;

  const nonGlobalCollectionBounds = useMemo(() => {
    return collectionBounds?.filter((feature) => !isGlobalBbox(bbox(feature)));
  }, [collectionBounds]);

  useEffect(() => {
    if (mapRef?.current && value && isLoaded)
      fitBounds(mapRef.current, value, collections);
  }, [value, collections, isLoaded]);

  const layers: Layer[] = [
    new GeoJsonLayer({
      id: "picked-item",
      data: (pickedItem as Feature) || undefined,
      filled: !cogHref,
      getFillColor: inverseFillColor,
      getLineColor: inverseLineColor,
      getLineWidth: 2 * lineWidth,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "value",
      data: (value && toGeoJson(value)) || undefined,
      filled: !(items || cogHref),
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
    }),
  ];

  if (visualizeItemBounds) {
    layers.push(
      new GeoJsonLayer({
        id: "items",
        data: (items as Feature[]) || undefined,
        filled: true,
        getFillColor: (e) =>
          e.id === hoveredItem?.id ? fillColor : transparent,
        getLineColor: lineColor,
        getLineWidth: lineWidth,
        lineWidthUnits: "pixels",
        pickable: true,
        onClick: (e) => setPickedItem(e.object),
        onHover: (e) => setHoveredItem(e.object),
      })
    );
  }

  if (visualizeCollections) {
    layers.push(
      new GeoJsonLayer({
        id: "collections",
        data: nonGlobalCollectionBounds,
        filled: true,
        getFillColor: (e) =>
          e.id === hoveredCollection?.id ? fillColor : transparent,
        getLineColor: lineColor,
        getLineWidth: lineWidth,
        lineWidthUnits: "pixels",
        pickable: true,
        onClick: (e) => setHrefFromCollectionId(e.object?.id),
        onHover: (e) => {
          if (e.object && !isGlobalBbox(e.object.bbox))
            setHoveredCollectionFromId(e.object.id);
          else setHoveredCollection(null);
        },
      })
    );
  }

  if (stacGeoparquetTable)
    layers.push(
      stacGeoparquetTable.geometryType === "point"
        ? new GeoArrowScatterplotLayer({
            id: "stac-geoparquet-point",
            data: stacGeoparquetTable.table,
            getColor: lineColor,
            getRadius: 2,
            getPosition: stacGeoparquetTable.table.getChild("geometry")!,
            radiusUnits: "pixels",
            pickable: true,
            onClick: (info) => {
              setStacGeoparquetItemId(info.object?.id);
            },
          })
        : new GeoArrowPolygonLayer({
            id: "stac-geoparquet-polygon",
            data: stacGeoparquetTable.table,
            filled: true,
            getFillColor: ({ index, data }) => {
              const id = data.data.get(index)?.["id"];
              return id === hoveredStacGeoparquetItemId && id !== pickedItem?.id
                ? fillColor
                : transparent;
            },
            getLineColor: lineColor,
            getLineWidth: 2,
            lineWidthUnits: "pixels",
            pickable: true,
            onClick: (info) => {
              setStacGeoparquetItemId(info.object?.id);
            },
            onHover: (info) => {
              setHoveredStacGeoparquetItemId(info.object?.id);
            },
            updateTriggers: {
              getFillColor: [hoveredStacGeoparquetItemId],
            },
          })
    );

  if (cogHref && projection === "mercator")
    layers.push(
      new COGLayer({
        id: "cog-" + cogHref,
        geotiff: cogHref,
        geoKeysParser,
      })
    );
  else if (visualizeItems && pagedCogSources && projection === "mercator")
    pagedCogSources.forEach((page, i) => {
      if (page)
        layers.push(
          new MosaicLayer({
            id: "cog-mosaic-" + i,
            sources: page,
            getSource: async (source) => {
              return source.assets.data.href;
            },
            renderSource: (source, { data, signal }) => {
              return new COGLayer({
                id: `cog-${source.id}`,
                geotiff: data,
                geoKeysParser,
                signal,
              });
            },
          })
        );
    });
  else if (visualizeItems && cogSources && projection === "mercator")
    layers.push(
      new MosaicLayer({
        id: "cog-mosaic",
        sources: cogSources,
        getSource: async (source) => {
          return source.assets.data.href;
        },
        renderSource: (source, { data, signal }) => {
          return new COGLayer({
            id: `cog-${source.id}`,
            geotiff: data,
            geoKeysParser,
            signal,
          });
        },
      })
    );

  return (
    <MaplibreMap
      id="map"
      ref={mapRef}
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      projection={projection}
      mapStyle={`https://basemaps.cartocdn.com/gl/${mapStyle}/style.json`}
      style={{ zIndex: 0 }}
      onLoad={() => setIsLoaded(true)}
      onMoveEnd={() => {
        const bbox = mapRef?.current
          ?.getBounds()
          .toArray()
          .flatMap((a) => a);
        const sanitizedBbox = bbox && sanitizeBbox(bbox);
        if (sanitizedBbox) setBbox(sanitizedBbox);
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
    case "Collection":
      return collectionToFeature(value);
    case "Feature":
      return value as Feature;
    case "FeatureCollection":
      return value as FeatureCollection;
  }
}

async function geoKeysParser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geoKeys: Record<string, any>
): Promise<proj.ProjectionInfo> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projDefinition = toProj4(geoKeys as any);

  return {
    def: projDefinition.proj4,
    parsed: proj.parseCrs(projDefinition.proj4),
    coordinatesUnits: projDefinition.coordinatesUnits as proj.SupportedCrsUnit,
  };
}
