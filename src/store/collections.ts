import type { StacCollection } from "stac-ts";

export interface CollectionsState {
  collections: StacCollection[] | null;
  setCollections: (collections: StacCollection[] | null) => void;
  addCollection: (collection: StacCollection) => void;
  filteredCollections: StacCollection[] | null;
  setFilteredCollections: (collections: StacCollection[] | null) => void;
}

export const createCollectionsSlice = (set, get) => ({
  collections: null,
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) => {
    const collections = get().collections;
    if (!collections?.find((c) => c.id == collection.id)) {
      set({ collections: [...(collections || []), collection] });
    }
  },
  filteredCollections: null,
  setFilteredCollections: (collections) =>
    set({ filteredCollections: collections }),
});
