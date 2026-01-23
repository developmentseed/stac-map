import type { State } from ".";
import type { StateCreator } from "zustand";

interface DatetimeFilter {
  start: Date;
  end: Date;
}

export interface DatetimeState {
  datetimeFilter: DatetimeFilter | null;
  setDatetimeFilter: (filter: DatetimeFilter | null) => void;
}

export const createDatetimeSlice: StateCreator<State, [], [], DatetimeState> = (
  set
) => ({
  datetimeFilter: null,
  setDatetimeFilter: (filter) => set({ datetimeFilter: filter }),
});
