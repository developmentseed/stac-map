import type { BBox2D } from "@/store";
import type { MapRef } from "react-map-gl/maplibre";

function getPadding() {
  return {
    top: window.innerHeight / 10,
    bottom: window.innerHeight / 10,
    right: window.innerWidth / 20,
    left: window.innerWidth / 20 + window.innerWidth / 3,
  };
}

export function fitBoundsToBbox(map: MapRef, bbox: BBox2D) {
  map.fitBounds(
    [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ],
    { padding: getPadding() }
  );
}

export function getPaddedViewportBbox(map: MapRef): BBox2D {
  const padding = getPadding();
  const canvas = map.getCanvas();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const tl = map.unproject([padding.left, padding.top]);
  const br = map.unproject([width - padding.right, height - padding.bottom]);
  return [
    Math.min(tl.lng, br.lng),
    Math.min(tl.lat, br.lat),
    Math.max(tl.lng, br.lng),
    Math.max(tl.lat, br.lat),
  ];
}
