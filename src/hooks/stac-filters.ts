import { useMemo } from "react";
import type { StacCollection, StacItem } from "stac-ts";
import type { BBox2D } from "../types/map";
import type { DatetimeBounds } from "../types/stac";
import {
  isCollectionInBbox,
  isCollectionInDatetimeBounds,
  isItemInBbox,
  isItemInDatetimeBounds,
} from "../utils/stac";

interface UseStacFiltersProps {
  collections?: StacCollection[];
  items?: StacItem[];
  filter: boolean;
  bbox?: BBox2D;
  datetimeBounds?: DatetimeBounds;
}

export default function useStacFilters({
  collections,
  items,
  filter,
  bbox,
  datetimeBounds,
}: UseStacFiltersProps) {
  const filteredCollections = useMemo(() => {
    if (filter && collections) {
      return collections.filter(
        (collection) =>
          (!bbox || isCollectionInBbox(collection, bbox)) &&
          (!datetimeBounds ||
            isCollectionInDatetimeBounds(collection, datetimeBounds))
      );
    } else {
      return undefined;
    }
  }, [collections, filter, bbox, datetimeBounds]);

  const filteredItems = useMemo(() => {
    if (filter && items) {
      return items.filter(
        (item) =>
          (!bbox || isItemInBbox(item, bbox)) &&
          (!datetimeBounds || isItemInDatetimeBounds(item, datetimeBounds))
      );
    } else {
      return undefined;
    }
  }, [items, filter, bbox, datetimeBounds]);

  return { filteredCollections, filteredItems };
}
