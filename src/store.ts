import type { StacCollection, StacItem } from "stac-ts";
import { create } from "zustand";
import type { BBox2D } from "./types/map";
import type { StacValue } from "./types/stac";
import { getInitialHref } from "./utils/href";

interface State {
  input: string;
  setInput: (input: string) => void;
  href: string | null;
  setHref: (href: string | null) => void;
  value: StacValue | null;
  setValue: (value: StacValue | null) => void;
  collections: StacCollection[] | null;
  setCollections: (collections: StacCollection[] | null) => void;
  filteredCollections: StacCollection[] | null;
  setFilteredCollections: (collections: StacCollection[] | null) => void;
  searchItems: StacItem[] | null;
  setSearchItems: (items: StacItem[] | null) => void;

  geotiffHref: string | null;
  setGeotiffHref: (geotiffHref: string | null) => void;

  bbox: BBox2D | null;
  setBbox: (bbox: BBox2D) => void;

  fillColor: [number, number, number, number];
  lineColor: [number, number, number, number];
  lineWidth: number;
}

const initialHref = getInitialHref();

export const useStore = create<State>((set) => ({
  input: initialHref || "",
  setInput: (input) => set({ input }),
  href: initialHref,
  setHref: (href) =>
    set({
      href,
      input: href || "",
      collections: null,
      filteredCollections: null,
      searchItems: null,
      geotiffHref: null,
    }),
  value: null,
  setValue: (value) => set({ value }),
  collections: null,
  setCollections: (collections) => set({ collections }),
  filteredCollections: null,
  setFilteredCollections: (collections) =>
    set({ filteredCollections: collections }),
  searchItems: null,
  setSearchItems: (items) => set({ searchItems: items }),
  geotiffHref: null,
  setGeotiffHref: (geotiffHref) => set({ geotiffHref }),
  bbox: null,
  setBbox: (bbox) => set({ bbox }),
  fillColor: [207, 63, 2, 50] as [number, number, number, number],
  lineColor: [207, 63, 2, 100] as [number, number, number, number],
  lineWidth: 2,
}));
