import { createContext, useContext } from "react";

const AuthEnabledContext = createContext<boolean>(false);

export function AuthEnabledProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AuthEnabledContext.Provider value={enabled}>
      {children}
    </AuthEnabledContext.Provider>
  );
}

/**
 * Returns `true` when the surrounding `<StacMap>` was given an `auth` prop,
 * i.e. when the OIDC `AuthProvider` is mounted. Useful for host components
 * rendered inside the map that need to gate behavior on authentication.
 */
export function useAuthEnabled(): boolean {
  return useContext(AuthEnabledContext);
}
