import type { StateCreator } from "zustand";
import type { State } from ".";

export interface TokensState {
  tokens: Record<string, string>;
  setToken: (baseUri: string, token: string) => void;
  removeToken: (baseUri: string) => void;
}

export const createTokensSlice: StateCreator<State, [], [], TokensState> = (
  set,
  get
) => ({
  tokens: {},
  setToken: (baseUri, token) =>
    set({ tokens: { ...get().tokens, [baseUri]: token } }),
  removeToken: (baseUri) => {
    const tokens = { ...get().tokens };
    delete tokens[baseUri];
    set({ tokens });
  },
});
