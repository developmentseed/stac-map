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
