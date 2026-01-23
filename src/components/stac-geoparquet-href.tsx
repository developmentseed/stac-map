import { useEffect } from "react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import DatetimeSlider from "./datetime-slider";
import { ResultError } from "./result-error";
import {
  useStacGeoparquetDatetimeBounds,
  useStacGeoparquetTable,
} from "../hooks/stac";
import { useStore } from "../store";

interface Props {
  href: string;
  connection: AsyncDuckDBConnection;
}

export default function StacGeoparquetHref({ href, connection }: Props) {
  const datetimeFilter = useStore((store) => store.datetimeFilter);
  const setStacGeoparquetTable = useStore(
    (store) => store.setStacGeoparquetTable
  );
  const result = useStacGeoparquetTable({ href, connection, datetimeFilter });

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
  else
    return <StacGeoparquetDatetimeBounds href={href} connection={connection} />;
}

function StacGeoparquetDatetimeBounds({ href, connection }: Props) {
  const result = useStacGeoparquetDatetimeBounds({ href, connection });
  if (result.error)
    return (
      <ResultError
        title="Error while fetching stac-geoparquet datetime bounds"
        error={result.error}
      />
    );
  else if (result.data?.start && result.data?.end)
    return <DatetimeSlider start={result.data.start} end={result.data.end} />;
}
