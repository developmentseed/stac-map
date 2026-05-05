import type { Layer } from "@deck.gl/core";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExtraLayerProps } from "./components/stac-map";

export type Color = [number, number, number, number];
export type Projection = "mercator" | "globe";
export type BBox2D = [number, number, number, number];

export type DatetimeExtentSource = "items" | "collections" | "geoparquet";

function setEntry<T>(
  record: Record<string, T>,
  key: string,
  value: T | undefined
): Record<string, T> {
  if (value === undefined) {
    const next = { ...record };
    delete next[key];
    return next;
  }
  return { ...record, [key]: value };
}

export interface SearchParams {
  startDatetime: string;
  endDatetime: string;
  limit: string;
  bbox?: BBox2D;
}

/**
 * Shape of the shared Zustand store. See {@link useStore}.
 */
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
  setToken: (uri: string, token: string) => void;
  removeToken: (uri: string) => void;
  valueBbox: BBox2D | null;
  setValueBbox: (bbox: BBox2D | null) => void;
  mapBbox: BBox2D | null;
  setMapBbox: (bbox: BBox2D | null) => void;
  searchParams: Record<string, SearchParams>;
  setSearchParams: (key: string, params: SearchParams) => void;
  datetimeExtents: Record<DatetimeExtentSource, [number, number] | null>;
  setDatetimeExtent: (
    source: DatetimeExtentSource,
    extent: [number, number] | null
  ) => void;
  datetimeFilters: Record<string, [number, number]>;
  setDatetimeFilter: (
    href: string,
    filter: [number, number] | undefined
  ) => void;
  addErrorListener: boolean;
  setAddErrorListener: (addErrorListener: boolean) => void;
  hivePartitioning: boolean;
  setHivePartitioning: (hivePartitioning: boolean) => void;
}

/**
 * Zustand hook for the shared stac-map store. The store is a singleton — host
 * apps can read filters, the loaded value, the active `href`, etc., or call
 * setters to drive the map programmatically.
 */
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
      setLayer: (id, layer) =>
        set({ layers: setEntry(get().layers, id, layer) }),
      maplibreLayers: {},
      setMaplibreLayer: (id, layer) =>
        set({ maplibreLayers: setEntry(get().maplibreLayers, id, layer) }),
      projection: "mercator",
      setProjection: (projection) => set({ projection }),
      toggleProjection: () =>
        set({
          projection: get().projection === "mercator" ? "globe" : "mercator",
        }),
      oidcAccessToken: null,
      setOidcAccessToken: (oidcAccessToken) => set({ oidcAccessToken }),
      tokens: {},
      setToken: (uri, token) => set({ tokens: setEntry(get().tokens, uri, token) }),
      removeToken: (uri) => set({ tokens: setEntry(get().tokens, uri, undefined) }),
      valueBbox: null,
      setValueBbox: (valueBbox) => set({ valueBbox }),
      mapBbox: null,
      setMapBbox: (mapBbox) => set({ mapBbox }),
      searchParams: {},
      setSearchParams: (key, params) =>
        set({ searchParams: setEntry(get().searchParams, key, params) }),
      datetimeExtents: { items: null, collections: null, geoparquet: null },
      setDatetimeExtent: (source, extent) =>
        set({
          datetimeExtents: { ...get().datetimeExtents, [source]: extent },
        }),
      datetimeFilters: {},
      setDatetimeFilter: (href, filter) =>
        set({ datetimeFilters: setEntry(get().datetimeFilters, href, filter) }),
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
