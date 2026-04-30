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

export function useAuthEnabled(): boolean {
  return useContext(AuthEnabledContext);
}
