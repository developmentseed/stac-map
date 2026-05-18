import { useStore } from "@/store";
import { getStacId } from "@/utils/stac";
import {
  ActionBar,
  Alert,
  Button,
  Portal,
  SkeletonText,
} from "@chakra-ui/react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { LuLoader, LuX } from "react-icons/lu";
import { BasePanel, PanelHeader } from "../ui/panel-frame";
import { StacIcon } from "../ui/stac";
import Value from "../value";
import { useStacGeoparquetItem, useStacGeoparquetValue } from "./hooks";

export default function ParquetPanel({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const result = useStacGeoparquetValue({ href, connection });
  const stacGeoparquetId = useStore((store) => store.stacGeoparquetId);

  if (result.isLoading) return <ParquetLoading href={href} />;
  if (!result.data) return <ParquetError error={result.error} href={href} />;

  if (stacGeoparquetId) {
    return (
      <ParquetItem href={href} connection={connection} id={stacGeoparquetId} />
    );
  }

  const value = result.data;
  return (
    <BasePanel
      header={
        <PanelHeader icon={<StacIcon value={value} />}>
          {getStacId(value)}
        </PanelHeader>
      }
    >
      <Value href={href} value={value} />
    </BasePanel>
  );
}

function ParquetItem({
  href,
  connection,
  id,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
  id: string;
}) {
  const result = useStacGeoparquetItem({ href, connection, id });
  const setStacGeoparquetId = useStore((store) => store.setStacGeoparquetId);
  if (result.isLoading) return <ParquetLoading href={href} />;
  if (!result.data) return <ParquetError error={result.error} href={href} />;

  const value = result.data;
  return (
    <>
      <BasePanel
        header={
          <PanelHeader icon={<StacIcon value={value} />}>
            {getStacId(value)}
          </PanelHeader>
        }
      >
        <Value href={href} value={value} />
      </BasePanel>
      <ActionBar.Root open>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>{id}</ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => setStacGeoparquetId(null)}
              >
                <LuX /> Clear selection
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
}

function ParquetLoading({ href }: { href: string }) {
  return (
    <BasePanel
      header={<PanelHeader icon={<LuLoader />}>Loading {href}</PanelHeader>}
    >
      <SkeletonText h={3} />
    </BasePanel>
  );
}

function ParquetError({ href, error }: { href: string; error: Error | null }) {
  return (
    <BasePanel header={"Error loading " + href}>
      <Alert.Root status={"error"}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{error ? error.name : "Unknown error"}</Alert.Title>
          {error && <Alert.Description>{error.message}</Alert.Description>}
        </Alert.Content>
      </Alert.Root>
    </BasePanel>
  );
}
