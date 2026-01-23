import type { StacCollection, StacItem } from "stac-ts";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface HoverState {
  hoveredCollection: StacCollection | null;
  setHoveredCollection: (collection: StacCollection | null) => void;
  hoveredItem: StacItem | null;
  setHoveredItem: (item: StacItem | null) => void;
}

export const createHoversSlice: StateCreator<State, [], [], HoverState> = (
  set
) => ({
  hoveredCollection: null,
  setHoveredCollection: (collection) => set({ hoveredCollection: collection }),
  hoveredItem: null,
  setHoveredItem: (item) => set({ hoveredItem: item }),
});
