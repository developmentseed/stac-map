import { useStore } from "@/store";
import { type DeckProps } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { type RefObject, useRef } from "react";
import {
  Layer as MaplibreLayer,
  Map as MaplibreMap,
  type MapRef,
  Source,
  useControl,
} from "react-map-gl/maplibre";
import { useColorModeValue } from "../components/ui/color-mode";
import type { ExtraLayerProps } from "./stac-map";

export default function Map({
  extraLayers,
}: {
  extraLayers?: ExtraLayerProps[];
}) {
  const projection = useStore((store) => store.projection);
  const layers = useStore((store) => store.layers);
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useColorModeValue(
    "positron-gl-style",
    "dark-matter-gl-style"
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
    >
      <DeckGLOverlay
        layers={Object.values(layers)}
        getCursor={(props) => getCursor(mapRef, props)}
      ></DeckGLOverlay>
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
