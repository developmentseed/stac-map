import type { MosaicSource } from "@developmentseed/deck.gl-geotiff";
import type { StacAsset } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface CogSource extends MosaicSource {
  id: string;
  assets: { data: StacAsset };
}

export interface CogsState {
  cogHref: string | null;
  cogSources: CogSource[] | null;
  pagedCogSources: CogSource[][] | null;
  setCogHref: (href: string | null) => void;
  setCogSources: (sources: CogSource[] | null) => void;
  setPagedCogSources: (pages: CogSource[][] | null) => void;
}

export const createCogsSlice: StateCreator<State, [], [], CogsState> = (
  set
) => ({
  cogHref: null,
  cogSources: null,
  pagedCogSources: null,
  setCogHref: (cogHref) => set({ cogHref }),
  setCogSources: (cogSources) => set({ cogSources }),
  setPagedCogSources: (pagedCogSources) => set({ pagedCogSources }),
});
