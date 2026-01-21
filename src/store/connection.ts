import type { State } from ".";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import type { StateCreator } from "zustand";

export interface ConnectionState {
  connection: AsyncDuckDBConnection | null;
  setConnection: (connection: AsyncDuckDBConnection) => void;
}

export const createConnectionSlice: StateCreator<
  State,
  [],
  [],
  ConnectionState
> = (set) => ({
  connection: null,
  setConnection: (connection) => {
    set({ connection });
  },
});
