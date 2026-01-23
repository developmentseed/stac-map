import { useEffect } from "react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { ResultError } from "./result-error";
import { useStacGeoparquetItem, useStacGeoparquetTable } from "../hooks/stac";
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
  const stacGeoparquetItemId = useStore((store) => store.stacGeoparquetItemId);
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
  else if (result.isSuccess && stacGeoparquetItemId)
    return (
      <StacGeoparquetItemId
        id={stacGeoparquetItemId}
        href={href}
        connection={connection}
      />
    );
}

function StacGeoparquetItemId({
  id,
  href,
  connection,
}: {
  id: string;
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const setPickedItem = useStore((store) => store.setPickedItem);
  const result = useStacGeoparquetItem({ id, href, connection });

  useEffect(() => {
    setPickedItem(result.data);
  }, [result.data, setPickedItem]);

  if (result.error)
    return (
      <ResultError
        title="Error while fetching stac-geoparquet item"
        error={result.error}
      />
    );
}
