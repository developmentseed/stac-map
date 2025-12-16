import type { StacCollection, StacItem } from "stac-ts";
import type { StacValue } from "../types/stac";
import { getItemDatetimes } from "../utils/stac";

const getDateTimes = (
  value: StacValue,
  items: StacItem[] | undefined,
  collections: StacCollection[] | undefined
) => {
  let start =
    value.start_datetime && typeof value.start_datetime === "string"
      ? new Date(value.start_datetime as string)
      : null;
  let end =
    value.end_datetime && typeof value.end_datetime === "string"
      ? new Date(value.end_datetime as string)
      : null;

  if (items) {
    for (const item of items) {
      const itemDatetimes = getItemDatetimes(item);
      if (itemDatetimes.start && (!start || itemDatetimes.start < start))
        start = itemDatetimes.start;
      if (itemDatetimes.end && (!end || itemDatetimes.end > end))
        end = itemDatetimes.end;
    }
  }

  if (collections) {
    for (const collection of collections) {
      const extents = collection.extent?.temporal?.interval?.[0];
      if (extents) {
        const collectionStart = extents[0] ? new Date(extents[0]) : null;
        if (collectionStart && (!start || collectionStart < start))
          start = collectionStart;
        const collectionEnd = extents[1] ? new Date(extents[1]) : null;
        if (collectionEnd && (!end || collectionEnd > end)) end = collectionEnd;
      }
    }
  }
  return start && end ? { start, end } : null;
};

export default getDateTimes;
