import type { StateCreator } from "zustand";
import type { State } from ".";

export interface WebMapLink {
  href: string;
  rel: string;
  "wmts:layer"?: string[];
  "wmts:dimensions"?: Record<string, string>;
  type?: string;
}

export interface WebMapLinksState {
  webMapLink: WebMapLink | null;
  setWebMapLink: (link: WebMapLink | null) => void;
}

export const createWebMapLinksSlice: StateCreator<
  State,
  [],
  [],
  WebMapLinksState
> = (set) => ({
  webMapLink: null,
  setWebMapLink: (link) => set({ webMapLink: link }),
});
