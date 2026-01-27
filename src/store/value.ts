import type { StateCreator } from "zustand";
import type { State } from ".";
import type { StacValue } from "../types/stac";

export interface ValueState {
  value: StacValue | null;
  setValue: (value: StacValue | null) => void;
}

export const createValueSlice: StateCreator<State, [], [], ValueState> = (
  set
) => ({
  value: null,
  setValue: (value) => {
    set({
      value,
    });
  },
});
