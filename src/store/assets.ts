import type { StacAsset } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface AssetsState {
  assetKey: string | null;
  asset: StacAsset | null;
  setAsset: (assetKey: string | null, asset: StacAsset | null) => void;
}

export const createAssetsSlice: StateCreator<State, [], [], AssetsState> = (
  set
) => ({
  asset: null,
  assetKey: null,
  setAsset: (assetKey, asset) => {
    {
      set({ assetKey, asset });
    }
  },
});
