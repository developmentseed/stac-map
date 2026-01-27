import { getGeotiffHref } from "@/utils/stac";
import type { StacAsset } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface AssetsState {
  assetKey: string | null;
  asset: StacAsset | null;
  setAsset: (assetKey: string | null, asset: StacAsset | null) => void;
  geotiffHref: string | null;
}

export const createAssetsSlice: StateCreator<State, [], [], AssetsState> = (
  set,
  get
) => ({
  asset: null,
  assetKey: null,
  geotiffHref: null,
  setAsset: async (assetKey, asset) => {
    {
      set({ assetKey, asset });
      if (asset) {
        let geotiffHref = getGeotiffHref(asset);
        if (geotiffHref) {
          geotiffHref = await get().maybeSignPlanetaryComputerHref(geotiffHref);
          set({ geotiffHref });
        } else {
          set({ geotiffHref: null });
        }
      } else set({ geotiffHref: null });
    }
  },
});
