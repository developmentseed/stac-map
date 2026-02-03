import {
  useStacGeoparquetDatetimeBounds,
  useStacGeoparquetTable,
} from "@/hooks/stac";
import { useStore } from "@/store";
import { Box, Center } from "@chakra-ui/react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useEffect } from "react";
import DatetimeSlider from "../ui/datetime-slider";
import { ErrorAlert } from "../ui/error-alert";

interface Props {
  href: string;
  connection: AsyncDuckDBConnection;
}

export default function StacGeoparquetHref({ href, connection }: Props) {
  const datetimeFilter = useStore((store) => store.datetimeFilter);
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  const setStacGeoparquetTable = useStore(
    (store) => store.setStacGeoparquetTable
  );
  const result = useStacGeoparquetTable({
    href,
    connection,
    datetimeFilter,
    hivePartitioning,
  });

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
  const hivePartitioning = useStore((store) => store.hivePartitioning);
  const result = useStacGeoparquetDatetimeBounds({
    href,
    connection,
    hivePartitioning,
  });
  if (result.error)
    return (
      <ErrorAlert
        title="Error while fetching stac-geoparquet datetime bounds"
        error={result.error}
      />
    );
  else if (result.data?.start && result.data?.end)
    return (
      <Center mb={4}>
        <Box mx={8} w="full">
          <DatetimeSlider start={result.data.start} end={result.data.end} />
        </Box>
      </Center>
    );
}
