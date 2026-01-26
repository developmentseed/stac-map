import type { DatetimeBounds } from "@/types/stac";
import type { StateCreator } from "zustand";
import type { State } from ".";

export interface DatetimeFilter {
  start: Date;
  end: Date;
}

export interface DatetimeState {
  datetimeBounds: DatetimeBounds | null;
  setDatetimeBounds: (bounds: DatetimeBounds | null) => void;
  datetimeFilter: DatetimeFilter | null;
  setDatetimeFilter: (filter: DatetimeFilter | null) => void;
}

export const createDatetimeSlice: StateCreator<State, [], [], DatetimeState> = (
  set
) => ({
  datetimeBounds: null,
  setDatetimeBounds: (bounds) => set({ datetimeBounds: bounds }),
  datetimeFilter: null,
  setDatetimeFilter: (filter) => set({ datetimeFilter: filter }),
});
