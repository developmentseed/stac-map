import type { BBox2D } from "@/types/map";
import type { StacValue } from "@/types/stac";
import type { LngLatLike, MapRef } from "react-map-gl/maplibre";
import type { StacCollection } from "stac-ts";
import { getBbox } from "./stac";

export function fitBounds(
  map: MapRef,
  value: StacValue,
  collections: StacCollection[] | null
) {
  const padding = {
    top: window.innerHeight / 10,
    bottom: window.innerHeight / 20,
    right: window.innerWidth / 20,
    left: window.innerWidth / 20 + window.innerWidth / 3,
  };
  const bbox = getBbox(value, collections);
  if (bbox) map.fitBounds(bboxToBounds(bbox), { padding });
}

function bboxToBounds(bbox: BBox2D): [LngLatLike, LngLatLike] {
  return [
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ];
}
