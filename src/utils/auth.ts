import { User } from "oidc-client-ts";

export function getAccessToken(): string | null {
  const authority = import.meta.env.VITE_AUTH_AUTHORITY;
  const clientId = import.meta.env.VITE_AUTH_CLIENT_ID;
  if (!authority || !clientId) return null;

  const oidcStorage = sessionStorage.getItem(
    `oidc.user:${authority}:${clientId}`
  );
  if (oidcStorage) {
    const user = User.fromStorageString(oidcStorage);
    return user?.access_token ?? null;
  }
  return null;
}
