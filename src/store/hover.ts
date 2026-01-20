import type { StacCollection, StacItem } from "stac-ts";

export interface HoverState {
  hoveredCollection: StacCollection | null;
  setHoveredCollection: (collection: StacCollection | null) => void;
  hoveredItem: StacItem | null;
  setHoveredItem: (item: StacItem | null) => void;
}

export const createHoversSlice = (set) => ({
  hoveredCollection: null,
  setHoveredCollection: (collection) => set({ hoveredCollection: collection }),
  hoveredItem: null,
  setHoveredItem: (item) => set({ hoveredItem: item }),
});
