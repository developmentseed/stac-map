import type { StateCreator } from "zustand";
import type { State } from ".";
import { getInitialHref } from "../utils/href";

export interface HrefState {
  href: string | null;
  hrefIsParquet: boolean;
  setHref: (href: string | null) => void;
}

const initialHref = getInitialHref();

export const createHrefSlice: StateCreator<State, [], [], HrefState> = (
  set
) => ({
  href: initialHref,
  hrefIsParquet: !!initialHref?.endsWith(".parquet"),
  setHref: (href) => {
    set({
      href,
      hrefIsParquet: !!href?.endsWith(".parquet"),
      input: href || "",
      value: null,
      collections: null,
      filteredCollections: null,
      hoveredCollection: null,
      hoveredItem: null,
      pickedItem: null,
      staticItems: null,
      searchedItems: null,
      datetimeBounds: null,
      datetimeFilter: null,
      stacGeoparquetTable: null,
      stacGeoparquetItemId: null,
      cogHref: null,
      cogSources: null,
      pagedCogSources: null,
    });
  },
});
