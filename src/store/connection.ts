import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import type { StateCreator } from "zustand";
import type { State } from ".";

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
