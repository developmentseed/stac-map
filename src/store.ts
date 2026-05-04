import type { Layer } from "@deck.gl/core";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExtraLayerProps } from "./components/stac-map";

export type Color = [number, number, number, number];
export type Projection = "mercator" | "globe";
export type BBox2D = [number, number, number, number];

export interface SearchParams {
  startDatetime: string;
  endDatetime: string;
  limit: string;
  bbox?: BBox2D;
}

export interface State {
  href: string | null;
  hrefIsParquet: boolean;
  setHref: (href: string | null) => void;
  uploadedFile: File | null;
  setUploadedFile: (uploadedFile: File) => void;
  stacGeoparquetId: string | null;
  setStacGeoparquetId: (id: string | null) => void;
  connection: AsyncDuckDBConnection | null;
  setConnection: (connection: AsyncDuckDBConnection) => void;
  fillColor: Color;
  lineColor: Color;
  projection: Projection;
  layers: Record<string, Layer>;
  setLayer: (id: string, layer: Layer | undefined) => void;
  maplibreLayers: Record<string, ExtraLayerProps>;
  setMaplibreLayer: (id: string, layer: ExtraLayerProps | undefined) => void;
  setProjection: (projection: Projection) => void;
  toggleProjection: () => void;
  oidcAccessToken: string | null;
  setOidcAccessToken: (token: string | null) => void;
  tokens: Record<string, string>;
  valueBbox: BBox2D | null;
  setValueBbox: (bbox: BBox2D | null) => void;
  mapBbox: BBox2D | null;
  setMapBbox: (bbox: BBox2D | null) => void;
  searchParams: Record<string, SearchParams>;
  setSearchParams: (key: string, params: SearchParams) => void;
  addErrorListener: boolean;
  setAddErrorListener: (addErrorListener: boolean) => void;
  hivePartitioning: boolean;
  setHivePartitioning: (hivePartitioning: boolean) => void;
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
      stacGeoparquetId: null,
      setStacGeoparquetId: (id) => set({ stacGeoparquetId: id }),
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
      maplibreLayers: {},
      setMaplibreLayer: (id, layer) => {
        if (layer) {
          set({ maplibreLayers: { ...get().maplibreLayers, [id]: layer } });
        } else {
          const maplibreLayers = { ...get().maplibreLayers };
          delete maplibreLayers[id];
          set({ maplibreLayers });
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
      tokens: {},
      valueBbox: null,
      setValueBbox: (valueBbox) => set({ valueBbox }),
      mapBbox: null,
      setMapBbox: (mapBbox) => set({ mapBbox }),
      searchParams: {},
      setSearchParams: (key, params) =>
        set({
          searchParams: { ...get().searchParams, [key]: params },
        }),
      addErrorListener: false,
      setAddErrorListener: (addErrorListener) => set({ addErrorListener }),
      hivePartitioning: false,
      setHivePartitioning: (hivePartitioning) => set({ hivePartitioning }),
    }),
    {
      name: "stac-map-settings",
      partialize: (state) => ({
        fillColor: state.fillColor,
        lineColor: state.lineColor,
        projection: state.projection,
        tokens: state.tokens,
        addErrorListener: state.addErrorListener,
        hivePartitioning: state.hivePartitioning,
      }),
    }
  )
);
