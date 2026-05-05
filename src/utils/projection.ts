export function resolveInitialProjection(
  search: string = location.search
): "globe" | "mercator" | null {
  const projection = new URLSearchParams(search).get("projection");
  if (projection === "globe" || projection === "mercator") {
    return projection;
  }
  return null;
}
