import { parsePlanetaryComputerStorageAccountAndContainer } from "@/utils/planetary-computer";
import type { StateCreator } from "zustand";
import type { State } from ".";

interface Tokens {
  [storageAccount: string]: { [container: string]: Token };
}

interface Token {
  "msft:expiry": string;
  token: string;
}

export interface PlanetaryComputerState {
  planetaryComputerTokens: Tokens;
  getPlanetaryComputerToken: (
    storageAccount: string,
    container: string
  ) => Promise<string>;
  maybeSignPlanetaryComputerHref: (href: string) => Promise<string>;
}

export const createPlanetaryComputerSlice: StateCreator<
  State,
  [],
  [],
  PlanetaryComputerState
> = (set, get) => ({
  planetaryComputerTokens: {},
  getPlanetaryComputerToken: async (storageAccount, container) => {
    const tokens = get().planetaryComputerTokens;
    const storageAccountObject = tokens[storageAccount];
    const token = storageAccountObject?.[container];
    if (
      token &&
      new Date(token["msft:expiry"]).getTime() - Date.now() > 60 * 60 * 1000
    )
      return token.token;

    const newToken = await fetch(
      `https://planetarycomputer.microsoft.com/api/sas/v1/token/${storageAccount}/${container}`
    ).then((response) => {
      if (!response.ok)
        throw new Error(
          "Failed to fetch token: " + storageAccount + ", " + container
        );
      return response.json() as Promise<Token>;
    });
    const newStorageAccountObject = {
      ...storageAccountObject,
      [container]: newToken,
    };
    set({
      planetaryComputerTokens: {
        ...tokens,
        [storageAccount]: newStorageAccountObject,
      },
    });
    return newToken.token;
  },
  maybeSignPlanetaryComputerHref: async (href: string) => {
    const { storageAccount, container } =
      parsePlanetaryComputerStorageAccountAndContainer(href);
    if (!storageAccount || !container) return href;

    const token = await get().getPlanetaryComputerToken(
      storageAccount,
      container
    );
    if (!token) return href;
    const signedHref = new URL(href);
    signedHref.search = token;
    return signedHref.toString();
  },
});
