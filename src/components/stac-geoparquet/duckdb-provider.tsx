import {
  StacGeoparquetProvider,
  useStacGeoparquet,
  type StacGeoparquetContextValue,
} from "@/contexts/stac-geoparquet";
import { useStore } from "@/store";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useDuckDb } from "duckdb-wasm-kit";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ParquetExportButton from "./parquet-export-button";
import ParquetPanel from "./parquet-panel";
import ParquetView from "./parquet-view";
import { warmStacWasm } from "./stac-wasm-loader";

function ContextParquetView({ href }: { href: string }) {
  const ctx = useStacGeoparquet();
  if (!ctx?.connection) return null;
  return <ParquetView href={href} connection={ctx.connection} />;
}

function ContextParquetPanel({ href }: { href: string }) {
  const ctx = useStacGeoparquet();
  if (!ctx?.connection) return null;
  return <ParquetPanel href={href} connection={ctx.connection} />;
}

export default function DuckDbProvider({ children }: { children: ReactNode }) {
  const setConnection = useStore((store) => store.setConnection);
  const { db } = useDuckDb();
  const [connection, setLocalConnection] =
    useState<AsyncDuckDBConnection | null>(null);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;
    (async () => {
      const conn = await db.connect();
      await conn.query("LOAD spatial;");
      await conn.query("LOAD icu;");
      await conn.query("LOAD httpfs;");
      if (cancelled) return;
      setLocalConnection(conn);
      setConnection(conn);
    })();
    return () => {
      cancelled = true;
    };
  }, [db, setConnection]);

  useEffect(() => {
    warmStacWasm();
  }, []);

  const value = useMemo<StacGeoparquetContextValue>(
    () => ({
      connection,
      registerParquet: async (file: File) => {
        if (!db) return;
        await db.registerFileBuffer(
          file.name,
          new Uint8Array(await file.arrayBuffer())
        );
      },
      ParquetView: ContextParquetView,
      ParquetPanel: ContextParquetPanel,
      ParquetExportButton,
    }),
    [connection, db]
  );

  return (
    <StacGeoparquetProvider value={value}>{children}</StacGeoparquetProvider>
  );
}
