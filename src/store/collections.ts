import { getSelfHref } from "@/utils/stac";
import type { StacCollection } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface CollectionsState {
  collections: StacCollection[] | null;
  setCollections: (collections: StacCollection[] | null) => void;
  addCollection: (collection: StacCollection) => void;
  hoveredCollection: StacCollection | null;
  setHoveredCollection: (collection: StacCollection | null) => void;
  filteredCollections: StacCollection[] | null;
  setFilteredCollections: (collections: StacCollection[] | null) => void;
  collectionFreeTextSearch: string | null;
  setCollectionFreeTextSearch: (q: string | null) => void;
  setHrefFromCollectionId: (id: string) => void;
  setHoveredCollectionFromId: (id: string) => void;
}

export const createCollectionsSlice: StateCreator<
  State,
  [],
  [],
  CollectionsState
> = (set, get) => ({
  collections: null,
  setCollections: (collections) =>
    set({ collections, filteredCollections: null }),
  addCollection: (collection) => {
    const collections = get().collections;
    if (!collections?.find((c) => c.id == collection.id))
      set({ collections: [...(collections || []), collection] });
  },
  hoveredCollection: null,
  setHoveredCollection: (collection) => set({ hoveredCollection: collection }),
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
  setHrefFromCollectionId: (id: string) => {
    const collection = get().collections?.find((c) => c.id === id);
    if (collection) {
      const href = getSelfHref(collection);
      if (href) get().setHref(href);
    }
  },
  setHoveredCollectionFromId: (id: string) => {
    const collection = get().collections?.find((c) => c.id === id);
    if (collection) {
      const href = getSelfHref(collection);
      if (href) get().setHoveredCollection(collection);
    }
  },
});
