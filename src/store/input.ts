import type { StateCreator } from "zustand";
import type { State } from ".";
import { getInitialHref } from "../utils/href";

export interface InputState {
  input: string;
  setInput: (input: string) => void;
}

const initialHref = getInitialHref();

export const createInputSlice: StateCreator<State, [], [], InputState> = (
  set
) => ({
  input: initialHref || "",
  setInput: (input) => set({ input }),
});
