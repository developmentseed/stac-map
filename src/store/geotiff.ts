import type { StateCreator } from "zustand";
import type { State } from ".";

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
