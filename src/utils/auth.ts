import type { AuthProviderProps } from "react-oidc-context";
import { useStore } from "../store";

/**
 * Options for {@link buildAuth}.
 */
export interface BuildAuthOptions {
  /** OpenID Connect authority URL (e.g. from `VITE_AUTH_AUTHORITY`). */
  authority: string | undefined;
  /** OAuth2 client ID (e.g. from `VITE_AUTH_CLIENT_ID`). */
  clientId: string | undefined;
  /** App base path used to construct the redirect URI. Defaults to `/`. */
  basePath?: string;
}

/**
 * Build an `AuthProviderProps` object for `react-oidc-context` from
 * stac-map-friendly inputs, returning `undefined` when either `authority` or
 * `clientId` is missing so the caller can omit the `auth` prop and run
 * unauthenticated.
 */
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
