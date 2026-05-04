import {
  useStacGeoparquetItem,
  useStacGeoparquetValue,
  useStacValue,
} from "@/hooks/stac";
import { useStore } from "@/store";
import type { StacValue } from "@/types/stac";
import { getStacId } from "@/utils/stac";
import {
  ActionBar,
  Alert,
  Box,
  Button,
  HStack,
  Link,
  Portal,
  SkeletonText,
  Span,
  Stack,
} from "@chakra-ui/react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import { type ReactNode } from "react";
import { LuBird, LuLoader, LuX } from "react-icons/lu";
import { StacIcon } from "./ui/stac";
import Value from "./value";

export default function Panel() {
  const href = useStore((store) => store.href);
  const hrefIsParquet = useStore((store) => store.hrefIsParquet);
  const connection = useStore((store) => store.connection);
  return href ? (
    hrefIsParquet ? (
      connection ? (
        <StacGeoparquetHrefPanel href={href} connection={connection} />
      ) : (
        <LoadingDuckdbPanel />
      )
    ) : (
      <HrefPanel href={href} />
    )
  ) : (
    <IntroductionPanel />
  );
}

function HrefPanel({ href }: { href: string }) {
  const result = useStacValue({ href });
  return result.data ? (
    <ValuePanel href={href} value={result.data} />
  ) : result.isLoading ? (
    <LoadingPanel href={href} />
  ) : (
    <ErrorPanel error={result.error} href={href} />
  );
}

function StacGeoparquetHrefPanel({
  href,
  connection,
}: {
  href: string;
  connection: AsyncDuckDBConnection;
}) {
  const result = useStacGeoparquetValue({ href, connection });
  const stacGeoparquetId = useStore((store) => store.stacGeoparquetId);

  return result.data ? (
    stacGeoparquetId ? (
      <StacGeoparquetItemPanel
        href={href}
        connection={connection}
        id={stacGeoparquetId}
      />
    ) : (
      <ValuePanel href={href} value={result.data} connection={connection} />
    )
  ) : result.isLoading ? (
    <LoadingPanel href={href} />
  ) : (
    <ErrorPanel error={result.error} href={href} />
  );
}

function StacGeoparquetItemPanel({
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
  return result.data ? (
    <>
      <ValuePanel href={href} value={result.data} />
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
  ) : result.isLoading ? (
    <LoadingPanel href={href} />
  ) : (
    <ErrorPanel error={result.error} href={href} />
  );
}

function ValuePanel({
  href,
  value,
  connection,
}: {
  href: string;
  value: StacValue;
  connection?: AsyncDuckDBConnection;
}) {
  const header = (
    <PanelHeader icon={<StacIcon value={value} />}>
      {getStacId(value)}
    </PanelHeader>
  );
  return (
    <BasePanel header={header}>
      <Value href={href} value={value} connection={connection} />
    </BasePanel>
  );
}

function LoadingPanel({ href }: { href: string }) {
  const header = <PanelHeader icon={<LuLoader />}>Loading {href}</PanelHeader>;
  return (
    <BasePanel header={header}>
      <SkeletonText h={3} />
    </BasePanel>
  );
}

function LoadingDuckdbPanel() {
  const header = <PanelHeader icon={<LuBird />}>Loading DuckDB...</PanelHeader>;
  return (
    <BasePanel header={header}>
      <SkeletonText h={3} />
    </BasePanel>
  );
}

function ErrorPanel({ error, href }: { error: Error | null; href: string }) {
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

function IntroductionPanel() {
  const body = (
    <Stack fontSize={"sm"} fontWeight={"lighter"}>
      <Box>
        <strong>stac-map</strong> is a map-first visualization tool for{" "}
        <Link variant={"underline"} href="https://stacspec.org">
          STAC
        </Link>
        .
      </Box>
      <Box>
        Questions, issues, or feature requests? Get in touch on{" "}
        <Link asChild>
          <a href="https://github.com/developmentseed/stac-map" target="_blank">
            GitHub
          </a>
        </Link>
        .
      </Box>
    </Stack>
  );
  return <BasePanel header={"stac-map"} children={body} />;
}

function BasePanel({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      bg={"bg.muted"}
      pointerEvents={"auto"}
      rounded={4}
      borderColor={"bg.emphasized"}
    >
      <Box
        borderBottomWidth={1}
        borderColor={"border.subtle"}
        py={2}
        px={4}
        fontWeight={"lighter"}
        fontSize={"sm"}
      >
        {header}
      </Box>
      <Box p={4} overflow={"auto"} maxH={"80dvh"}>
        {children}
      </Box>
    </Box>
  );
}

function PanelHeader({
  icon,
  children,
  actions,
}: {
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <HStack>
      {icon}
      <Span flex={1} truncate>
        {children}
      </Span>
      {actions}
    </HStack>
  );
}
