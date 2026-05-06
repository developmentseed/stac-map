import type { BBox2D } from "@/store";

const MERCATOR_LAT_LIMIT = 85.0511287798066;

export function resolveInitialProjection(
  search: string = location.search
): "globe" | "mercator" | null {
  const projection = new URLSearchParams(search).get("projection");
  if (projection === "globe" || projection === "mercator") {
    return projection;
  }
  return null;
}

export function exceedsMercatorBounds(bbox: BBox2D): boolean {
  return bbox[1] < -MERCATOR_LAT_LIMIT || bbox[3] > MERCATOR_LAT_LIMIT;
}
