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
  set
) => ({
  asset: null,
  assetKey: null,
  geotiffHref: null,
  setAsset: async (assetKey, asset) => {
    {
      set({ assetKey, asset });
      if (asset) {
        const geotiffHref = await getGeotiffHref(asset);
        set({ geotiffHref });
      } else set({ geotiffHref: null });
    }
  },
});
