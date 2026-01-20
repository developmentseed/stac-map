import type { StacItem } from "stac-ts";

export interface ItemsState {
  searchItems: StacItem[] | null;
  setSearchItems: (items: StacItem[] | null) => void;
  pickedItem: StacItem | null;
  setPickedItem: (item: StacItem | null) => void;
}

export const createItemsSlice = (set) => ({
  searchItems: null,
  setSearchItems: (items) => set({ searchItems: items }),
  pickedItem: null,
  setPickedItem: (item) =>
    set({
      pickedItem: item,
      geotiffHref: null,
    }),
});
