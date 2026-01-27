import type { StacItem } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";
import type { StacSearch } from "../types/stac";

export interface ItemsState {
  search: StacSearch | null;
  setSearch: (search: StacSearch | null) => void;
  unpagedItems: StacItem[] | null;
  setUnpagedItems: (items: StacItem[] | null) => void;
  addItem: (item: StacItem) => void;
  pagedItems: StacItem[][] | null;
  setPagedItems: (items: StacItem[][] | null) => void;
  hoveredItem: StacItem | null;
  setHoveredItem: (item: StacItem | null) => void;
  pickedItem: StacItem | null;
  setPickedItem: (item: StacItem) => void;
  clearPickedItem: () => void;
}

export const createItemsSlice: StateCreator<State, [], [], ItemsState> = (
  set,
  get
) => ({
  search: null,
  setSearch: (search) => {
    set({ search, pagedItems: null });
  },
  unpagedItems: null,
  setUnpagedItems: (items) => {
    set({ unpagedItems: items });
  },
  addItem: (item) => {
    const items = get().unpagedItems;
    if (!items?.find((i) => i.id === item.id))
      set({ unpagedItems: [...(items || []), item] });
  },
  pagedItems: null,
  setPagedItems: (items) => {
    set({ pagedItems: items });
  },
  hoveredItem: null,
  setHoveredItem: (item) => set({ hoveredItem: item }),
  pickedItem: null,
  setPickedItem: (item) => {
    set({
      pickedItem: item,
      geotiffHref: null,
    });
  },
  clearPickedItem: () => {
    set({
      pickedItem: null,
      geotiffHref: null,
      stacGeoparquetItemId: null,
    });
  },
});
