import type { StateCreator } from "zustand";
import type { State } from ".";

interface Tokens {
  [key: string]: Token;
}

interface Token {
  "msft:expiry": string;
  token: string;
}

export interface PlanetaryComputerState {
  tokens: Tokens;
  getToken: (collectionId: string) => Promise<string>;
}

export const createPlanetaryComputerSlice: StateCreator<
  State,
  [],
  [],
  PlanetaryComputerState
> = (set, get) => ({
  tokens: {},
  getToken: async (collectionId) => {
    const tokens = get().tokens;
    const token = tokens[collectionId];
    if (
      token &&
      new Date(token["msft:expiry"]).getTime() - Date.now() > 60 * 60 * 1000
    )
      return token.token;

    const newToken = await fetch(
      "https://planetarycomputer.microsoft.com/api/sas/v1/token/" + collectionId
    ).then((response) => {
      if (!response.ok)
        throw new Error(
          "Failed to fetch token for collection: " + collectionId
        );
      return response.json() as Promise<Token>;
    });
    set({ tokens: { ...tokens, [collectionId]: newToken } });
    return token.token;
  },
});
