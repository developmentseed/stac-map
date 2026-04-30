import {
  ChakraProvider,
  defaultSystem,
  type SystemContext,
} from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, type ReactNode } from "react";
import {
  MapProvider,
  type LayerProps,
  type SourceProps,
} from "react-map-gl/maplibre";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { AuthEnabledProvider } from "../contexts/auth-enabled";
import { StacBrowserUrlProvider } from "../contexts/stac-browser";
import App from "./app";
import { HrefBootstrap } from "./href-bootstrap";
import { OidcTokenSync } from "./oidc-token-sync";
import { LoginSplash } from "./ui/auth";
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./ui/color-mode";

export interface ExtraLayerProps {
  source: SourceProps;
  layer: LayerProps;
}

export interface StacMapProps {
  /** Initial STAC URL to load on mount when no `?href=` is present in the URL. */
  defaultHref?: string;
  /** When true (default), the `href` state is mirrored into `?href=` and reacts to popstate. */
  syncWithUrl?: boolean;
  /** Override the Chakra UI system. Defaults to `defaultSystem`. */
  chakraSystem?: SystemContext;
  /** Forwarded to the internal next-themes ColorModeProvider. */
  colorMode?: Omit<ColorModeProviderProps, "children">;
  /** Reuse a host-app QueryClient instead of the internal one. */
  queryClient?: QueryClient;
  /** Wrap the inner tree in `react-oidc-context` AuthProvider with these settings. */
  auth?: AuthProviderProps;
  /** Override the STAC Browser external link prefix. */
  stacBrowserUrl?: string;
  /** Optional footer rendered below the map (e.g. version + changelog). */
  footer?: ReactNode;
  /** Source and layer information for extra maplibre layers */
  extraLayers?: ExtraLayerProps[];
}

let mountCount = 0;

/**
 * Single-component entry point for stac-map. Mount at most one instance per
 * page; the underlying Zustand store, DuckDB connection, and maplibre-gl are
 * singletons.
 */
export function StacMap({
  defaultHref,
  syncWithUrl = true,
  chakraSystem,
  colorMode,
  queryClient: externalQueryClient,
  auth,
  stacBrowserUrl,
  footer,
  extraLayers,
}: StacMapProps) {
  useEffect(() => {
    mountCount += 1;
    if (mountCount > 1) {
      console.error(
        "<StacMap> was mounted more than once on the same page. Its store, DuckDB connection, and maplibre-gl are singletons; expect inconsistent state."
      );
    }
    return () => {
      mountCount -= 1;
    };
  }, []);

  const queryClient = useMemo(
    () =>
      externalQueryClient ??
      new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: 1 } },
      }),
    [externalQueryClient]
  );

  const inner = (
    <QueryClientProvider client={queryClient}>
      <AuthEnabledProvider enabled={!!auth}>
        <StacBrowserUrlProvider url={stacBrowserUrl}>
          <MapProvider>
            <HrefBootstrap defaultHref={defaultHref} syncWithUrl={syncWithUrl}>
              <App footer={footer} extraLayers={extraLayers} />
            </HrefBootstrap>
          </MapProvider>
        </StacBrowserUrlProvider>
      </AuthEnabledProvider>
    </QueryClientProvider>
  );

  return (
    <ChakraProvider value={chakraSystem ?? defaultSystem}>
      <ColorModeProvider {...colorMode}>
        {auth ? (
          <AuthProvider {...auth}>
            <OidcTokenSync>
              <LoginSplash>{inner}</LoginSplash>
            </OidcTokenSync>
          </AuthProvider>
        ) : (
          inner
        )}
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default StacMap;
