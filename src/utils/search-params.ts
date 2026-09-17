import type { SearchParams } from "@/store";
import { resolveInitialBbox } from "./bbox";
import type { QueryableFilter } from "./cql2";
import { parseStacDatetimeRange } from "./datetime";

export function resolveInitialSearchParams(
  search: string = location.search
): Partial<SearchParams> | null {
  const params = new URLSearchParams(search);
  const result: Partial<SearchParams> = {};

  const datetime = params.get("datetime");
  if (datetime) {
    const { startDatetime, endDatetime } = parseStacDatetimeRange(datetime);
    if (startDatetime) result.startDatetime = startDatetime;
    if (endDatetime) result.endDatetime = endDatetime;
  }

  const bbox = resolveInitialBbox(search);
  if (bbox) result.bbox = bbox;

  const limit = params.get("limit");
  if (limit) result.limit = limit;

  const queryables = params.get("queryables");
  const parsedQueryables = queryables && tryParseJson(queryables);
  if (parsedQueryables && typeof parsedQueryables === "object")
    result.queryables = parsedQueryables as Record<string, QueryableFilter>;

  return Object.keys(result).length > 0 ? result : null;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
