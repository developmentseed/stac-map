import type { StacItem } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";
import type { StacSearch } from "../types/stac";

export type ItemSource = "static" | "searched";

export interface ItemsState {
  search: StacSearch;
  setSearch: (search: StacSearch) => void;
  staticItems: StacItem[] | null;
  setStaticItems: (items: StacItem[] | null) => void;
  addItem: (item: StacItem) => void;
  searchedItems: StacItem[][] | null;
  setSearchedItems: (items: StacItem[][] | null) => void;
  itemSource: ItemSource;
  setItemSource: (source: ItemSource) => void;
  hoveredItem: StacItem | null;
  setHoveredItem: (item: StacItem | null) => void;
  pickedItem: StacItem | null;
  setPickedItem: (item: StacItem) => void;
  clearPickedItem: () => void;
  visualizeItems: boolean;
  setVisualizeItems: (visualizeItems: boolean) => void;
  visualizeItemBounds: boolean;
  setVisualizeItemBounds: (visualize: boolean) => void;
}

export const createItemsSlice: StateCreator<State, [], [], ItemsState> = (
  set,
  get
) => ({
  search: {
    collections: [],
  },
  setSearch: (search) => {
    set({ search });
  },
  staticItems: null,
  setStaticItems: (items) => {
    set({ staticItems: items });
  },
  addItem: (item) => {
    const items = get().staticItems;
    if (!items?.find((i) => i.id === item.id))
      set({ staticItems: [...(items || []), item] });
  },
  searchedItems: null,
  setSearchedItems: (items) => {
    set({ searchedItems: items });
  },
  itemSource: "static",
  setItemSource: (itemSource) => {
    set({ itemSource });
  },
  hoveredItem: null,
  setHoveredItem: (item) => set({ hoveredItem: item }),
  pickedItem: null,
  setPickedItem: (item) => {
    set({
      pickedItem: item,
    });
  },
  clearPickedItem: () => {
    set({
      pickedItem: null,
      stacGeoparquetItemId: null,
    });
  },
  visualizeItems: false,
  setVisualizeItems: (visualizeItems) => {
    set({ visualizeItems });
  },
  visualizeItemBounds: true,
  setVisualizeItemBounds: (visualizeItemBounds) => {
    set({ visualizeItemBounds });
  },
});
