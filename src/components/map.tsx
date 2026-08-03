import { useStore, type BBox2D } from "@/store";
import { resolveInitialBbox } from "@/utils/bbox";
import { fitBoundsToBbox } from "@/utils/map";
import { type DeckProps } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import {
  Layer as MaplibreLayer,
  Map as MaplibreMap,
  Source,
  useControl,
} from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import { useColorModeValue } from "../components/ui/color-mode";
import type { ExtraLayerProps } from "./stac-map";
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);

export default function Map({
  extraLayers,
}: {
  extraLayers?: ExtraLayerProps[];
}) {
  const projection = useStore((store) => store.projection);
  const layers = useStore((store) => store.layers);
  const maplibreLayers = useStore((store) => store.maplibreLayers);
  const valueBbox = useStore((store) => store.valueBbox);
  const setMapBbox = useStore((store) => store.setMapBbox);
  const mapRef = useRef<MapRef>(null);
  const [initialBbox, setInitialBbox] = useState<BBox2D | null>(() =>
    resolveInitialBbox()
  );
  const skipNextValueBboxRef = useRef<boolean>(
    initialBbox !== null && useStore.getState().href !== null
  );
  const mapStyle = useColorModeValue(
    "positron-gl-style",
    "dark-matter-gl-style"
  );

  useEffect(() => {
    if (!initialBbox) return;
    const url = new URL(location.href);
    url.searchParams.delete("bbox");
    history.replaceState(null, "", url.pathname + url.search);
  }, [initialBbox]);

  useEffect(() => {
    if (!valueBbox) return;
    if (skipNextValueBboxRef.current) {
      skipNextValueBboxRef.current = false;
      return;
    }
    if (mapRef.current) fitBoundsToBbox(mapRef.current, valueBbox);
  }, [valueBbox]);

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
      onLoad={(e) => {
        const b = e.target.getBounds();
        setMapBbox([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        if (initialBbox && mapRef.current) {
          fitBoundsToBbox(mapRef.current, initialBbox);
          setInitialBbox(null);
        }
      }}
      onMoveEnd={(e) => {
        const b = e.target.getBounds();
        setMapBbox([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      }}
    >
      <DeckGLOverlay
        layers={Object.values(layers)}
        getCursor={(props) => getCursor(mapRef, props)}
      ></DeckGLOverlay>
      {Object.values(maplibreLayers).map((layer, i) => (
        <Source key={"maplibre-layer-" + i} {...layer.source}>
          <MaplibreLayer {...layer.layer} />
        </Source>
      ))}
      {extraLayers &&
        extraLayers.map((layer, i) => (
          <Source key={"extra-layer-" + i} {...layer.source}>
            <MaplibreLayer {...layer.layer} />
          </Source>
        ))}
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
