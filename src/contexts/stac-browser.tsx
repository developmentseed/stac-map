import { createContext, useContext } from "react";

export const DEFAULT_STAC_BROWSER_URL =
  "https://radiantearth.github.io/stac-browser/#/external/";

const StacBrowserUrlContext = createContext<string>(DEFAULT_STAC_BROWSER_URL);

export function StacBrowserUrlProvider({
  url,
  children,
}: {
  url?: string;
  children: React.ReactNode;
}) {
  return (
    <StacBrowserUrlContext.Provider value={url ?? DEFAULT_STAC_BROWSER_URL}>
      {children}
    </StacBrowserUrlContext.Provider>
  );
}

export function useStacBrowserUrl(): string {
  return useContext(StacBrowserUrlContext);
}
