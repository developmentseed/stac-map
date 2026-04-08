import { User } from "oidc-client-ts";
import { useStore } from "../store";

export function getAccessToken(href?: string | URL): string | null {
  const authority = import.meta.env.VITE_AUTH_AUTHORITY;
  const clientId = import.meta.env.VITE_AUTH_CLIENT_ID;

  if (authority && clientId) {
    const oidcStorage = sessionStorage.getItem(
      `oidc.user:${authority}:${clientId}`
    );
    if (oidcStorage) {
      const user = User.fromStorageString(oidcStorage);
      return user?.access_token ?? null;
    }
    return null;
  }

  if (href) {
    try {
      const url = new URL(href.toString());
      const baseUri = url.origin;
      const tokens = useStore.getState().tokens;
      return tokens[baseUri] ?? null;
    } catch {
      return null;
    }
  }

  return null;
}
