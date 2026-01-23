import type { Table } from "apache-arrow";
import type { StateCreator } from "zustand";
import type { State } from ".";
import type { SupportedGeometryType } from "../utils/stac-geoparquet";

export interface StacGeoparquetTable {
  table: Table;
  geometryType: SupportedGeometryType;
}

export interface StacGeoparquetState {
  stacGeoparquetTable: StacGeoparquetTable | null;
  setStacGeoparquetTable: (table: StacGeoparquetTable | null) => void;
  stacGeoparquetItemId: string | null;
  setStacGeoparquetItemId: (id: string | null) => void;
}

export const createStacGeoparquetState: StateCreator<
  State,
  [],
  [],
  StacGeoparquetState
> = (set) => ({
  stacGeoparquetTable: null,
  setStacGeoparquetTable: (table) =>
    set({
      stacGeoparquetTable: table,
    }),
  stacGeoparquetItemId: null,
  setStacGeoparquetItemId: (id) =>
    set({
      stacGeoparquetItemId: id,
    }),
});
