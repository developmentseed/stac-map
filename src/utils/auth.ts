import { useStore } from "../store";

export function getAccessToken(href?: string | URL): string | null {
  const state = useStore.getState();

  if (state.oidcAccessToken) {
    return state.oidcAccessToken;
  }

  if (href) {
    try {
      const url = new URL(href.toString());
      const baseUri = url.origin;
      return state.tokens[baseUri] ?? null;
    } catch {
      return null;
    }
  }

  return null;
}
