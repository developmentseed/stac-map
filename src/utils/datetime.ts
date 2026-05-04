import type { StacCollection, StacItem } from "stac-ts";

export function toMs(datetime: string | null | undefined): number | undefined {
  if (!datetime) return undefined;
  const ms = new Date(datetime).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}

export function datetimeInputToMs(value: string): number | undefined {
  if (!value) return undefined;
  const ms = new Date(`${value}Z`).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}

export function msToDatetimeInputValue(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19);
}

export function toDatetimeInputValue(
  datetime: string | null | undefined
): string {
  if (!datetime) return "";
  const date = new Date(datetime);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 19);
}

export function msToIsoLabel(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function getItemDatetimeMs(
  item: StacItem
): { start: number; end: number } | null {
  const properties = (item.properties ?? {}) as Record<
    string,
    string | null | undefined
  >;
  const dt = toMs(properties.datetime);
  if (dt !== undefined) return { start: dt, end: dt };
  const start = toMs(properties.start_datetime);
  const end = toMs(properties.end_datetime);
  if (start !== undefined && end !== undefined) return { start, end };
  return null;
}

export function getCollectionDatetimeMs(
  collection: StacCollection
): { start: number | null; end: number | null } | null {
  const interval = collection.extent?.temporal?.interval?.[0];
  if (!interval) return null;
  return {
    start: toMs(interval[0]) ?? null,
    end: toMs(interval[1]) ?? null,
  };
}

export function getItemsDatetimeExtent(
  items: StacItem[]
): [number, number] | null {
  let lo = Infinity;
  let hi = -Infinity;
  for (const item of items) {
    const d = getItemDatetimeMs(item);
    if (!d) continue;
    if (d.start < lo) lo = d.start;
    if (d.end > hi) hi = d.end;
  }
  return lo === Infinity ? null : [lo, hi];
}

export function getCollectionsDatetimeExtent(
  collections: StacCollection[]
): [number, number] | null {
  let lo = Infinity;
  let hi = -Infinity;
  for (const collection of collections) {
    const d = getCollectionDatetimeMs(collection);
    if (!d) continue;
    if (d.start !== null && d.start < lo) lo = d.start;
    if (d.end !== null && d.end > hi) hi = d.end;
  }
  if (lo === Infinity && hi === -Infinity) return null;
  if (lo === Infinity) lo = hi - 1;
  if (hi === -Infinity) hi = Date.now();
  return [lo, hi];
}

export function itemMatchesFilter(
  item: StacItem,
  filter: [number, number]
): boolean {
  const d = getItemDatetimeMs(item);
  if (!d) return true;
  return d.end >= filter[0] && d.start <= filter[1];
}

export function collectionMatchesFilter(
  collection: StacCollection,
  filter: [number, number]
): boolean {
  const d = getCollectionDatetimeMs(collection);
  if (!d) return true;
  const start = d.start ?? -Infinity;
  const end = d.end ?? Infinity;
  return end >= filter[0] && start <= filter[1];
}
