/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_HREF?: string;
  readonly VITE_AUTH_AUTHORITY?: string;
  readonly VITE_AUTH_CLIENT_ID?: string;
  readonly VITE_STAC_BROWSER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
