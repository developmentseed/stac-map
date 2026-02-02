import type { StateCreator } from "zustand";
import type { State } from ".";

export interface SettingsState {
  restrictToThreeBandCogs: boolean;
  setRestrictToThreeBandCogs: (restrict: boolean) => void;
}

export const createSettingsSlice: StateCreator<State, [], [], SettingsState> = (
  set
) => ({
  restrictToThreeBandCogs: true,
  setRestrictToThreeBandCogs: (restrict) =>
    set({ restrictToThreeBandCogs: restrict }),
});
