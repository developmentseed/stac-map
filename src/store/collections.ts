import type { StacCollection } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";
import type { DatetimeBounds } from "../types/stac";

export interface CollectionsState {
  collections: StacCollection[] | null;
  setCollections: (collections: StacCollection[] | null) => void;
  addCollection: (collection: StacCollection) => void;
  collectionDatetimeBounds: DatetimeBounds | null;
  setCollectionDatetimeBounds: (bounds: DatetimeBounds | null) => void;
  filteredCollections: StacCollection[] | null;
  setFilteredCollections: (collections: StacCollection[] | null) => void;
  collectionFreeTextSearch: string | null;
  setCollectionFreeTextSearch: (q: string | null) => void;
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
    if (!collections?.find((c) => c.id == collection.id))
      set({ collections: [...(collections || []), collection] });
  },
  collectionDatetimeBounds: null,
  setCollectionDatetimeBounds: (bounds) =>
    set({ collectionDatetimeBounds: bounds }),
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
  collectionFreeTextSearch: null,
  setCollectionFreeTextSearch: (q) => set({ collectionFreeTextSearch: q }),
});
