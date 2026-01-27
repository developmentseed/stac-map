import type { Container, Token, Tokens } from "@/types/planetary-computer";
import type { StateCreator } from "zustand";
import type { State } from ".";

interface SetTokenProps extends Container {
  token: Token;
}

export interface PlanetaryComputerState {
  planetaryComputerTokens: Tokens;
  setPlanetaryComputerToken: ({
    storageAccount,
    container,
    token,
  }: SetTokenProps) => void;
}

export const createPlanetaryComputerSlice: StateCreator<
  State,
  [],
  [],
  PlanetaryComputerState
> = (set, get) => ({
  planetaryComputerTokens: {},
  setPlanetaryComputerToken: ({
    storageAccount,
    container,
    token,
  }: SetTokenProps) => {
    const tokens = get().planetaryComputerTokens;
    const storageAccountObject = tokens[storageAccount];
    const newStorageAccountObject = {
      ...storageAccountObject,
      [container]: token,
    };
    set({
      planetaryComputerTokens: {
        ...tokens,
        [storageAccount]: newStorageAccountObject,
      },
    });
  },
});
