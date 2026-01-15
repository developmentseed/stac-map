import type { SpatialExtent } from "stac-ts";
import type { BBox } from "geojson";
import type { BBox2D } from "../types/map";

export function sanitizeBbox(bbox: BBox | SpatialExtent): BBox2D {
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
