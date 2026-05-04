/**
 * Public API for `@developmentseed/stac-map`.
 *
 * The {@link StacMap} component is the single entry point. The other exports
 * are escape hatches for host apps that want to read shared state, integrate
 * authentication, or override defaults.
 *
 * @packageDocumentation
 */

export { StacMap, default } from "./components/stac-map";
export type { StacMapProps } from "./components/stac-map";
export { useAuthEnabled } from "./contexts/auth-enabled";
export {
  DEFAULT_STAC_BROWSER_URL,
  useStacBrowserUrl,
} from "./contexts/stac-browser";
export { useStore } from "./store";
export type { State } from "./store";
export type { StacItemCollection, StacValue } from "./types/stac";
export { buildAuth } from "./utils/auth";
export type { BuildAuthOptions } from "./utils/auth";
