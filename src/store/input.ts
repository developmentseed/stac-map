import { getInitialHref } from "../utils/href";

export interface InputState {
  input: string;
  setInput: (input: string) => void;
}

const initialHref = getInitialHref();

export const createInputSlice = (set) => ({
  input: initialHref || "",
  setInput: (input) => set({ input }),
});
