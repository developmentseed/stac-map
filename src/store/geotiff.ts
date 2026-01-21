import type { State } from ".";
import type { StateCreator } from "zustand";

export interface GeotiffState {
  geotiffHref: string | null;
  setGeotiffHref: (geotiffHref: string | null) => void;
}

export const createGeotiffSlice: StateCreator<State, [], [], GeotiffState> = (
  set
) => ({
  geotiffHref: null,
  setGeotiffHref: (geotiffHref) => set({ geotiffHref }),
});
