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

/**
 * Whether a STAC bbox (2D or 3D) intersects a map viewport.
 *
 * The viewport may run past ±180 when the map is panned across the
 * antimeridian, and the bbox may cross it too (west greater than east).
 */
export function bboxIntersectsViewport(
  bbox: number[],
  viewport: BBox2D
): boolean {
  const views = normalizeViewport(viewport);
  if (!views) return true;
  const [west, south, east, north] =
    bbox.length === 6 ? [bbox[0], bbox[1], bbox[3], bbox[4]] : bbox;
  const boxes =
    west > east
      ? [
          [west, south, 180, north],
          [-180, south, east, north],
        ]
      : [[west, south, east, north]];
  return views.some((view) =>
    boxes.some(
      (box) =>
        !(
          box[0] > view[2] ||
          box[1] > view[3] ||
          box[2] < view[0] ||
          box[3] < view[1]
        )
    )
  );
}
