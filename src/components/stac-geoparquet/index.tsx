import type { ReactNode } from "react";
import DuckDbProvider from "./duckdb-provider";

export default function StacGeoparquetFeature({
  children,
}: {
  children: ReactNode;
}) {
  return <DuckDbProvider>{children}</DuckDbProvider>;
}
