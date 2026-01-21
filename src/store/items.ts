import type { State } from ".";
import type { StacItem } from "stac-ts";
import type { StateCreator } from "zustand";

export interface ItemsState {
  searchItems: StacItem[] | null;
  setSearchItems: (items: StacItem[] | null) => void;
  pickedItem: StacItem | null;
  setPickedItem: (item: StacItem | null) => void;
}

export const createItemsSlice: StateCreator<State, [], [], ItemsState> = (
  set
) => ({
  searchItems: null,
  setSearchItems: (items) => set({ searchItems: items }),
  pickedItem: null,
  setPickedItem: (item) =>
    set({
      pickedItem: item,
      geotiffHref: null,
    }),
});
