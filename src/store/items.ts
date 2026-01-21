import type { State } from ".";
import type { StacItem } from "stac-ts";
import type { StateCreator } from "zustand";
import type { StacSearch } from "../types/stac";

export interface ItemsState {
  search: StacSearch | null;
  setSearch: (search: StacSearch | null) => void;
  searchItems: StacItem[] | null;
  setSearchItems: (items: StacItem[] | null) => void;
  pickedItem: StacItem | null;
  setPickedItem: (item: StacItem | null) => void;
}

export const createItemsSlice: StateCreator<State, [], [], ItemsState> = (
  set
) => ({
  search: null,
  setSearch: (search) => set({ search }),
  searchItems: null,
  setSearchItems: (items) => set({ searchItems: items }),
  pickedItem: null,
  setPickedItem: (item) =>
    set({
      pickedItem: item,
      geotiffHref: null,
    }),
});
