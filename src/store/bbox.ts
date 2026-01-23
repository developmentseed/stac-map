import type { StateCreator } from "zustand";
import type { State } from ".";
import type { BBox2D } from "../types/map";

export interface BboxState {
  bbox: BBox2D | null;
  setBbox: (bbox: BBox2D) => void;
}

export const createBboxSlice: StateCreator<State, [], [], BboxState> = (
  set
) => ({
  bbox: null,
  setBbox: (bbox) => set({ bbox }),
});
