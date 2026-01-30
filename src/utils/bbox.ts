import type { BBox } from "geojson";
import type { SpatialExtent } from "stac-ts";
import type { BBox2D } from "../types/map";

export const GLOBAL_BBOX: BBox2D = [-180, -90, 180, 90];

export function sanitizeBbox(bbox: BBox | SpatialExtent): BBox2D | null {
  if (!bbox) return null;
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

export function formatBbox(bbox: BBox2D): string {
  return `${bbox[0].toFixed(2)}, ${bbox[1].toFixed(2)}, ${bbox[2].toFixed(2)}, ${bbox[3].toFixed(2)}`;
}

export function paddedBbox(bbox: BBox2D): BBox2D | null {
  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const basePadding = 20;
  const leftPadding = basePadding + viewportWidth / 3;

  const degreesPerPixelX = width / viewportWidth;
  const degreesPerPixelY = height / viewportHeight;

  return sanitizeBbox([
    bbox[0] + leftPadding * degreesPerPixelX,
    bbox[1] + basePadding * degreesPerPixelY,
    bbox[2] - basePadding * degreesPerPixelX,
    bbox[3] - basePadding * degreesPerPixelY,
  ]);
}
