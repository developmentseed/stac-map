/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STAC_BROWSER_URL?: string;
  readonly VITE_STAC_NATURAL_QUERY_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
