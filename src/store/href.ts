import type { StateCreator } from "zustand";
import type { State } from ".";

export interface HrefState {
  href: string | null;
  hrefIsParquet: boolean;
  setHref: (href: string | null) => void;
}

export const createHrefSlice: StateCreator<State, [], [], HrefState> = (
  set
) => ({
  href: null,
  hrefIsParquet: false,
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
      searches: {},
      datetimeBounds: null,
      datetimeFilter: null,
      stacGeoparquetTable: null,
      stacGeoparquetItemId: null,
      cogHref: null,
      cogSources: null,
      pagedCogSources: null,
      webMapLink: null,
    });
  },
});
