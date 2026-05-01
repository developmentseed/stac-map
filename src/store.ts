import type { Layer } from "@deck.gl/core";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Color = [number, number, number, number];
export type Projection = "mercator" | "globe";

export interface State {
  href: string | null;
  hrefIsParquet: boolean;
  setHref: (href: string | null) => void;
  uploadedFile: File | null;
  setUploadedFile: (uploadedFile: File) => void;
  connection: AsyncDuckDBConnection | null;
  setConnection: (connection: AsyncDuckDBConnection) => void;
  fillColor: Color;
  lineColor: Color;
  projection: Projection;
  layers: Record<string, Layer>;
  setLayer: (id: string, layer: Layer | undefined) => void;
  setProjection: (projection: Projection) => void;
  toggleProjection: () => void;
  oidcAccessToken: string | null;
  setOidcAccessToken: (token: string | null) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      href: null,
      hrefIsParquet: false,
      setHref: (href) => {
        set({
          href,
          hrefIsParquet: !!href?.endsWith(".parquet"),
        });
      },
      uploadedFile: null,
      setUploadedFile: (uploadedFile) => {
        set({ uploadedFile });
        get().setHref(uploadedFile.name);
      },
      connection: null,
      setConnection: (connection) => {
        set({ connection });
      },
      fillColor: [207, 63, 2, 50],
      lineColor: [207, 63, 2, 100],
      layers: {},
      setLayer: (id, layer) => {
        if (layer) {
          set({ layers: { ...get().layers, [id]: layer } });
        } else {
          const layers = { ...get().layers };
          delete layers[id];
          set({ layers });
        }
      },
      projection: "mercator",
      setProjection: (projection) => set({ projection }),
      toggleProjection: () =>
        set({
          projection: get().projection === "mercator" ? "globe" : "mercator",
        }),
      oidcAccessToken: null,
      setOidcAccessToken: (oidcAccessToken) => set({ oidcAccessToken }),
    }),
    {
      name: "stac-map-settings",
      partialize: (state) => ({
        projection: state.projection,
      }),
    }
  )
);
