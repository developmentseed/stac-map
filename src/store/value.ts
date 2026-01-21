import type { State } from ".";
import type { StateCreator } from "zustand";
import type { StacValue } from "../types/stac";

export interface ValueState {
  value: StacValue | null;
  setValue: (value: StacValue | null) => void;
}

export const createValueSlice: StateCreator<State, [], [], ValueState> = (
  set,
  get
) => ({
  value: null,
  setValue: (value) => {
    const search = get().search;
    set({
      value,
      search:
        value?.type === "Collection" &&
        search?.collections?.length === 1 &&
        search.collections[0] !== value.id
          ? null
          : search,
    });
  },
});
