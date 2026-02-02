import type { StateCreator } from "zustand";
import type { State } from ".";

export type Projection = "mercator" | "globe";

export interface MapState {
  projection: Projection;
  setProjection: (projection: Projection) => void;
  toggleProjection: () => void;
}

export const createMapSlice: StateCreator<State, [], [], MapState> = (
  set,
  get
) => ({
  projection: "mercator",
  setProjection: (projection) => set({ projection }),
  toggleProjection: () =>
    set({ projection: get().projection === "mercator" ? "globe" : "mercator" }),
});
