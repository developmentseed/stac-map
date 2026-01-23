import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useEffect } from "react";
import { useStacGeoparquetItem } from "../hooks/stac";
import { useStore } from "../store";
import { ResultError } from "./result-error";

export default function StacGeoparquetItemId({
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
