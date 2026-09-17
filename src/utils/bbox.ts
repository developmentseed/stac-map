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
