import { useEffect } from "react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { ResultError } from "./ui/result-error";
import { useStacGeoparquetTable } from "../hooks/stac";
import { useStore } from "../store";

export default function StacGeoparquetHref({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const setStacGeoparquetTable = useStore(
    (store) => store.setStacGeoparquetTable
  );
  const result = useStacGeoparquetTable({ href, connection });

  useEffect(() => {
    if (result.data?.geometryType && result.data.table)
      setStacGeoparquetTable({
        table: result.data.table,
        geometryType: result.data.geometryType,
      });
    else setStacGeoparquetTable(null);
  }, [result.data, setStacGeoparquetTable]);

  if (result.error)
    return (
      <ResultError
        title="Error while fetching stac-geoparquet table"
        error={result.error}
      />
    );
}
