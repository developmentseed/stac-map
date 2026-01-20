import type { StacValue } from "../types/stac";

export interface ValueState {
  value: StacValue | null;
  setValue: (value: StacValue | null) => void;
}

export const createValueSlice = (set) => ({
  value: null,
  setValue: (value) => set({ value }),
});
