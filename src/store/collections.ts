import type { State } from ".";
import type { StacCollection } from "stac-ts";
import type { StateCreator } from "zustand";

export interface CollectionsState {
  collections: StacCollection[] | null;
  setCollections: (collections: StacCollection[] | null) => void;
  addCollection: (collection: StacCollection) => void;
  filteredCollections: StacCollection[] | null;
  setFilteredCollections: (collections: StacCollection[] | null) => void;
}

export const createCollectionsSlice: StateCreator<
  State,
  [],
  [],
  CollectionsState
> = (set, get) => ({
  collections: null,
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) => {
    const collections = get().collections;
    if (!collections?.find((c) => c.id == collection.id)) {
      set({ collections: [...(collections || []), collection] });
    }
  },
  filteredCollections: null,
  setFilteredCollections: (collections) => {
    set({ filteredCollections: collections });
    const hoveredCollection = get().hoveredCollection;
    if (
      hoveredCollection &&
      !collections?.find((collection) => collection.id === hoveredCollection.id)
    )
      get().setHoveredCollection(null);
  },
});
