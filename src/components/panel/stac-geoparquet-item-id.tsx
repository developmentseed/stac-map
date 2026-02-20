import { HStack, SkeletonText, Spinner } from "@chakra-ui/react";
import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useEffect } from "react";
import { LuBird } from "react-icons/lu";
import { useStacGeoparquetItem } from "../../hooks/stac";
import { useStore } from "../../store";
import { ErrorAlert } from "../ui/error-alert";
import { BasePanel } from "./base";

export default function StacGeoparquetItemIdPanel({ id }: { id: string }) {
  return (
    <BasePanel
      header={
        <HStack>
          <Spinner size={"sm"} />
          <LuBird />
          Loading {id} with DuckDB...
        </HStack>
      }
    >
      <Body id={id} />
    </BasePanel>
  );
}

function Body({ id }: { id: string }) {
  const href = useStore((store) => store.href);
  const connection = useStore((store) => store.connection);

  return (
    <>
      <SkeletonText />
      {href && connection && (
        <Loader id={id} href={href} connection={connection} />
      )}
    </>
  );
}

function Loader({
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
