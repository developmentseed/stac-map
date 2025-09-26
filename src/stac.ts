import type { StacItem } from "stac-ts";

export function getItemDatetimes(item: StacItem) {
  const start = item.properties?.start_datetime
    ? new Date(item.properties.start_datetime)
    : item.properties?.datetime
      ? new Date(item.properties.datetime)
      : null;
  const end = item.properties?.end_datetime
    ? new Date(item.properties.end_datetime)
    : item.properties?.datetime
      ? new Date(item.properties.datetime)
      : null;
  return { start, end };
}
