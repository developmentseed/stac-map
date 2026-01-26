import type { StacItem } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";
import type { StacSearch } from "../types/stac";

export interface ItemsState {
  search: StacSearch | null;
  setSearch: (search: StacSearch | null) => void;
  items: StacItem[] | null;
  setItems: (items: StacItem[] | null) => void;
  addItem: (item: StacItem) => void;
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
    set({ search, items: null });
  },
  items: null,
  setItems: (items) => {
    set({ items });
  },
  addItem: (item) => {
    const items = get().items;
    if (!items?.find((i) => i.id === item.id))
      get().setItems([...(get().items || []), item]);
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
