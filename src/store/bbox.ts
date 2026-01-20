import type { BBox2D } from "../types/map";

export interface BboxState {
  bbox: BBox2D | null;
  setBbox: (bbox: BBox2D) => void;
}

export const createBboxSlice = (set) => ({
  bbox: null,
  setBbox: (bbox) => set({ bbox }),
});
