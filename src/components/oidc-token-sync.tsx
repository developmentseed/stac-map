import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useStore } from "../store";

export function OidcTokenSync() {
  const { user } = useAuth();
  const setOidcAccessToken = useStore((state) => state.setOidcAccessToken);

  useEffect(() => {
    setOidcAccessToken(user?.access_token ?? null);
  }, [user, setOidcAccessToken]);

  return null;
}
