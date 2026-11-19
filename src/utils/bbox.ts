import type { BBox2D } from "@/store";

export function resolveInitialBbox(
  search: string = location.search
): BBox2D | null {
  const bbox = new URLSearchParams(search).get("bbox");
  if (!bbox) return null;
  const parts = bbox.split(",").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null;
  return [parts[0], parts[1], parts[2], parts[3]];
}

export function roundBbox(bbox: BBox2D, precision: number = 5): BBox2D {
  const factor = 10 ** precision;
  return bbox.map((n) => Math.round(n * factor) / factor) as BBox2D;
}

export function clampToGlobalExtents(bbox: BBox2D): BBox2D {
  return [
    Math.max(bbox[0], -180),
    Math.max(bbox[1], -90),
    Math.min(bbox[2], 180),
    Math.min(bbox[3], 90),
  ];
}

/**
 * Normalizes a map viewport into one or two bboxes within [-180, 180],
 * splitting at the antimeridian when the viewport wraps around it.
 *
 * Returns `null` when the viewport spans every longitude.
 */
export function normalizeViewport(bbox: BBox2D): BBox2D[] | null {
  const [west, south, east, north] = bbox;
  const width = east - west;
  if (width >= 360) return null;
  const s = Math.max(south, -90);
  const n = Math.min(north, 90);
  const w = ((((west + 180) % 360) + 360) % 360) - 180;
  const e = w + width;
  if (e <= 180) return [[w, s, e, n]];
  return [
    [w, s, 180, n],
    [-180, s, e - 360, n],
  ];
}
