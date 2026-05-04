import { createContext, useContext } from "react";

/**
 * Default URL prefix used for "Open in STAC Browser" links. Can be overridden
 * via the `stacBrowserUrl` prop on {@link StacMap}.
 */
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

/**
 * Returns the STAC Browser URL prefix configured on the surrounding
 * {@link StacMap}, falling back to {@link DEFAULT_STAC_BROWSER_URL}.
 */
export function useStacBrowserUrl(): string {
  return useContext(StacBrowserUrlContext);
}
