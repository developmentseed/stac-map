import type { AuthProviderProps } from "react-oidc-context";
import { useStore } from "../store";

export interface BuildAuthOptions {
  authority: string | undefined;
  clientId: string | undefined;
  basePath?: string;
}

export function buildAuth({
  authority,
  clientId,
  basePath = "/",
}: BuildAuthOptions): AuthProviderProps | undefined {
  if (!authority || !clientId) {
    return undefined;
  }
  return {
    authority,
    client_id: clientId,
    redirect_uri: window.location.origin + basePath.replace(/\/$/, "") + "/",
    onSigninCallback: () => {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );
    },
  };
}

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
