import { useCollectionBounds, useGeotiffHref, useItems } from "@/hooks/store";
import type { Tokens } from "@/types/planetary-computer";
import type { SignedItem, StacValue } from "@/types/stac";
import { sanitizeBbox } from "@/utils/bbox";
import { fitBounds } from "@/utils/map";
import {
  parsePlanetaryComputerContainer,
  signPlanetaryComputerHref,
} from "@/utils/planetary-computer";
import {
  collectionToFeature,
  getBestAsset,
  getGeotiffHref,
  isGlobalBbox,
} from "@/utils/stac";
import { type DeckProps, Layer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { COGLayer, MosaicLayer, proj } from "@developmentseed/deck.gl-geotiff";
import {
  GeoArrowPolygonLayer,
  GeoArrowScatterplotLayer,
} from "@geoarrow/deck.gl-layers";
import type { Feature, FeatureCollection } from "geojson";
import { toProj4 } from "geotiff-geokeys-to-proj4";
import "maplibre-gl/dist/maplibre-gl.css";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MaplibreMap,
  type MapRef,
  useControl,
} from "react-map-gl/maplibre";
import type { StacItem } from "stac-ts";
import { useColorModeValue } from "../components/ui/color-mode";
import { useStore } from "../store";

type Color = [number, number, number, number];

export default function Map() {
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useColorModeValue(
    "positron-gl-style",
    "dark-matter-gl-style"
  );
  const value = useStore((store) => store.value);
  const collections = useStore((store) => store.collections);
  const setBbox = useStore((store) => store.setBbox);
  const hoveredItem = useStore((store) => store.hoveredItem);
  const planetaryComputerTokens = useStore(
    (store) => store.planetaryComputerTokens
  );
  const pickedItem = useStore((store) => store.pickedItem);
  const setPickedItem = useStore((store) => store.setPickedItem);
  const setHoveredItem = useStore((store) => store.setHoveredItem);
  const pagedItems = useStore((store) => store.pagedItems);
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const stacGeoparquetTable = useStore((store) => store.stacGeoparquetTable);
  const visualizeItems = useStore((store) => store.visualizeItems);
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
  const geotiffHref = useGeotiffHref();

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

  const signedGeotiffHref = useMemo(() => {
    if (geotiffHref) {
      const container = parsePlanetaryComputerContainer(geotiffHref);
      if (container) {
        return signPlanetaryComputerHref(
          geotiffHref,
          container,
          planetaryComputerTokens
        );
      } else {
        return geotiffHref;
      }
    }
  }, [geotiffHref, planetaryComputerTokens]);

  const signedPagedItems = useMemo(() => {
    return (
      visualizeItems &&
      pagedItems?.map((page) =>
        page
          .map((item) => signItem(item, planetaryComputerTokens))
          .filter((item) => !!item)
      )
    );
  }, [visualizeItems, pagedItems, planetaryComputerTokens]);

  useEffect(() => {
    if (mapRef?.current && value) fitBounds(mapRef.current, value, collections);
  }, [value, collections]);

  const layers: Layer[] = [
    new GeoJsonLayer({
      id: "picked-item",
      data: (pickedItem as Feature) || undefined,
      filled: true,
      getFillColor: inverseFillColor,
      getLineColor: inverseLineColor,
      getLineWidth: 2 * lineWidth,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "items",
      data: (items as Feature[]) || undefined,
      filled: true,
      getFillColor: (e) => (e.id === hoveredItem?.id ? fillColor : transparent),
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
      pickable: true,
      onClick: (e) => setPickedItem(e.object),
      onHover: (e) => setHoveredItem(e.object),
    }),
    new GeoJsonLayer({
      id: "value",
      data: (value && toGeoJson(value)) || undefined,
      filled: !items,
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      lineWidthUnits: "pixels",
    }),
    new GeoJsonLayer({
      id: "collections",
      data: collectionBounds,
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
    }),
  ];

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
              return data.data.get(index)?.["id"] ===
                hoveredStacGeoparquetItemId
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

  if (signedGeotiffHref)
    layers.push(
      new COGLayer({
        id: "cog-" + signedGeotiffHref,
        geotiff: signedGeotiffHref,
        geoKeysParser,
      })
    );
  else if (signedPagedItems)
    signedPagedItems.forEach((page, i) => {
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
      onMoveEnd={() => {
        const bbox = mapRef?.current
          ?.getBounds()
          .toArray()
          .flatMap((a) => a);
        if (bbox) setBbox(sanitizeBbox(bbox));
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

function signItem(item: StacItem, planetaryComputerTokens: Tokens) {
  if (!item.bbox) return null;
  const [, asset] = getBestAsset(item);
  if (!asset) return null;
  let geotiffHref = getGeotiffHref(asset);
  if (!geotiffHref) return null;
  const container = parsePlanetaryComputerContainer(geotiffHref);
  if (container)
    geotiffHref = signPlanetaryComputerHref(
      geotiffHref,
      container,
      planetaryComputerTokens
    );
  if (!geotiffHref) return null;

  asset.href = geotiffHref;
  item.assets = { data: asset };
  return item as SignedItem;
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
