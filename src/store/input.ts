import type { StateCreator } from "zustand";
import type { State } from ".";

export interface InputState {
  input: string;
  setInput: (input: string) => void;
}

export const createInputSlice: StateCreator<State, [], [], InputState> = (
  set
) => ({
  input: "",
  setInput: (input) => set({ input }),
});
