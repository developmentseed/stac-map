import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useEffect } from "react";
import { useStacGeoparquetItem } from "../../hooks/stac";
import { useStore } from "../../store";
import { ErrorAlert } from "../ui/error-alert";

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
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  const result = useStacGeoparquetItem({
    id,
    href,
    connection,
    hivePartitioning,
  });

  useEffect(() => {
    setPickedItem(result.data);
  }, [result.data, setPickedItem]);

  if (result.error)
    return (
      <ErrorAlert
        title="Error while fetching stac-geoparquet item"
        error={result.error}
      />
    );
}
