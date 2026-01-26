import {
  useStacGeoparquetDatetimeBounds,
  useStacGeoparquetTable,
} from "@/hooks/stac";
import { useStore } from "@/store";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useEffect } from "react";
import { LuFilter } from "react-icons/lu";
import { Section } from "../section";
import DatetimeSlider from "../ui/datetime-slider";
import { ErrorAlert } from "../ui/error-alert";

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
      <ErrorAlert
        title="Error while fetching stac-geoparquet table"
        error={result.error}
      />
    );
  else return <StacGeoparquetFilter href={href} connection={connection} />;
}

function StacGeoparquetFilter({ href, connection }: Props) {
  const result = useStacGeoparquetDatetimeBounds({ href, connection });
  if (result.error)
    return (
      <ErrorAlert
        title="Error while fetching stac-geoparquet datetime bounds"
        error={result.error}
      />
    );
  else if (result.data?.start && result.data?.end)
    return (
      <Section title="Filter" icon={<LuFilter />}>
        <DatetimeSlider start={result.data.start} end={result.data.end} />
      </Section>
    );
}
