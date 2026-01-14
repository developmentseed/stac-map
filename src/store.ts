import type { StacCollection } from "stac-ts";
import { create } from "zustand";
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
  lineColor: [number, number, number, number];
  lineWidth: number;
}

const initialHref = getInitialHref();

export const useStore = create<State>((set) => ({
  input: initialHref || "",
  setInput: (input) => set({ input }),
  href: initialHref,
  setHref: (href) => set({ href, input: href || "" }),
  value: null,
  setValue: (value) => set({ value, collections: null }),
  collections: null,
  setCollections: (collections) => set({ collections }),
  filteredCollections: null,
  setFilteredCollections: (collections) =>
    set({ filteredCollections: collections }),
  lineColor: [207, 63, 2, 100] as [number, number, number, number],
  lineWidth: 2,
}));
