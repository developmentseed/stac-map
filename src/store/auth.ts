import type { StateCreator } from "zustand";
import type { State } from ".";

export interface AuthState {
  oidcAccessToken: string | null;
  setOidcAccessToken: (token: string | null) => void;
}

export const createAuthSlice: StateCreator<State, [], [], AuthState> = (
  set
) => ({
  oidcAccessToken: null,
  setOidcAccessToken: (oidcAccessToken) => set({ oidcAccessToken }),
});
