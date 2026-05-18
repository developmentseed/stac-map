import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { createContext, useContext, type ComponentType } from "react";
import type { StacItem } from "stac-ts";

export interface StacGeoparquetContextValue {
  connection: AsyncDuckDBConnection | null;
  registerParquet: (file: File) => Promise<void>;
  ParquetView: ComponentType<{ href: string }>;
  ParquetPanel: ComponentType<{ href: string }>;
  ParquetExportButton: ComponentType<{ items: StacItem[] }>;
}

const StacGeoparquetContext = createContext<StacGeoparquetContextValue | null>(
  null
);

export const StacGeoparquetProvider = StacGeoparquetContext.Provider;

export function useStacGeoparquet(): StacGeoparquetContextValue | null {
  return useContext(StacGeoparquetContext);
}
