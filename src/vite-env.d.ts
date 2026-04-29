/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STAC_BROWSER_URL?: string;
  readonly VITE_STAC_NATURAL_QUERY_API?: string;
  readonly VITE_EXTRA_LAYERS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
