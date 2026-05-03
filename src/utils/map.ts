import type { BBox2D } from "@/store";
import type { MapRef } from "react-map-gl/maplibre";

export function fitBoundsToBbox(map: MapRef, bbox: BBox2D) {
  map.fitBounds(
    [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ],
    {
      padding: {
        top: window.innerHeight / 10,
        bottom: window.innerHeight / 10,
        right: window.innerWidth / 20,
        left: window.innerWidth / 20 + window.innerWidth / 3,
      },
    }
  );
}
