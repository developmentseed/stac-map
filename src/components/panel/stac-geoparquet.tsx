import { SkeletonText } from "@chakra-ui/react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { useEffect } from "react";
import { LuBird } from "react-icons/lu";

import { useStacGeoparquet } from "../../hooks/stac";
import { useStore } from "../../store";
import { BasePanel, PanelHeader } from "./base";
import { LoadingPanel } from "./loading";

export function StacGeoparquetHrefPanel({ href }: { href: string }) {
  const connection = useStore((store) => store.connection);
  return connection ? (
    <StacGeoparquetHrefConnectionPanel href={href} connection={connection} />
  ) : (
    <BasePanel
      header={<PanelHeader icon={<LuBird />}>Initializing DuckDB</PanelHeader>}
    >
      <SkeletonText />
    </BasePanel>
  );
}

export function StacGeoparquetHrefConnectionPanel({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const setValue = useStore((store) => store.setValue);
  const result = useStacGeoparquet({ href, connection });
  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return <LoadingPanel href={href} {...result} />;
}
