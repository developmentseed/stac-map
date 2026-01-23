import {
  Alert,
  Box,
  CloseButton,
  HStack,
  IconButton,
  SkeletonText,
  Span,
  Spinner,
} from "@chakra-ui/react";
import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";
import type { UseQueryResult } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { LuArrowRight, LuBird, LuFileWarning } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import {
  useStacGeoparquet,
  useStacJson,
  useStacJsonFromFile,
} from "../hooks/stac";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { isUrl } from "../utils/href";
import { getSelfHref, getStacValueId } from "../utils/stac";
import Introduction from "./introduction";
import { StacIcon } from "./stac";
import Value from "./value";

export default function Panel() {
  const href = useStore((store) => store.href);
  const hrefIsParquet = useStore((store) => store.hrefIsParquet);
  const value = useStore((store) => store.value);
  const pickedItem = useStore((store) => store.pickedItem);

  if (pickedItem) {
    return <PickedItemPanel pickedItem={pickedItem} />;
  } else if (value) {
    return <ValuePanel value={value} />;
  } else if (href) {
    const hrefIsUrl = isUrl(href);
    return hrefIsParquet ? (
      <StacGeoparquetHrefPanel href={href} />
    ) : hrefIsUrl ? (
      <HrefPanel href={href} />
    ) : (
      <LocalHrefPanel href={href} />
    );
  } else {
    return (
      <BasePanel header="stac-map">
        <Introduction />
      </BasePanel>
    );
  }
}

function PickedItemPanel({ pickedItem }: { pickedItem: StacItem }) {
  const setHref = useStore((store) => store.setHref);
  const clearPickedItem = useStore((store) => store.clearPickedItem);
  const href = getSelfHref(pickedItem);

  const header = (
    <PanelHeader
      icon={<StacIcon value={pickedItem} />}
      actions={
        <>
          {href && (
            <IconButton
              variant="subtle"
              size="2xs"
              onClick={() => setHref(href)}
            >
              <LuArrowRight />
            </IconButton>
          )}
          <CloseButton size="2xs" onClick={() => clearPickedItem()} />
        </>
      }
    >
      {getStacValueId(pickedItem)}
    </PanelHeader>
  );
  return (
    <BasePanel header={header}>
      <Value value={pickedItem} />
    </BasePanel>
  );
}

function ValuePanel({ value }: { value: StacValue }) {
  const header = (
    <PanelHeader icon={<StacIcon value={value} />}>
      {getStacValueId(value)}
    </PanelHeader>
  );
  return (
    <BasePanel header={header}>
      <Value value={value} />
    </BasePanel>
  );
}

function HrefPanel({ href }: { href: string }) {
  const setValue = useStore((store) => store.setValue);
  const result = useStacJson({ href });
  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return <LoadingPanel href={href} {...result} />;
}

function LocalHrefPanel({ href }: { href: string }) {
  const uploadedFile = useStore((store) => store.uploadedFile);
  return uploadedFile ? (
    <LocalFilePanel file={uploadedFile} />
  ) : (
    <BasePanel
      header={
        <PanelHeader icon={<LuFileWarning />}>
          Could not load {href}
        </PanelHeader>
      }
    >
      <Alert.Root status={"error"}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            {href} is a local file path, but no file was uploaded
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </BasePanel>
  );
}

function LocalFilePanel({ file }: { file: File }) {
  const setValue = useStore((store) => store.setValue);
  const result = useStacJsonFromFile({ file });
  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return <LoadingPanel href={file.name} {...result} />;
}

function StacGeoparquetHrefPanel({ href }: { href: string }) {
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

function StacGeoparquetHrefConnectionPanel({
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

function LoadingPanel({
  href,
  isFetching,
  error,
}: { href: string } & UseQueryResult) {
  const header = (
    <PanelHeader
      icon={
        error ? (
          <LuFileWarning />
        ) : isFetching ? (
          <Spinner size="xs" />
        ) : undefined
      }
    >
      {error
        ? `Error loading ${href}`
        : isFetching
          ? `Fetching ${href}`
          : "stac-map"}
    </PanelHeader>
  );

  return (
    <BasePanel header={header}>
      {(error && (
        <Alert.Root status={"error"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error.name}</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )) || <SkeletonText />}
    </BasePanel>
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
      <Box borderBottomWidth={1} borderColor={"border.subtle"} py={2} px={4}>
        {header}
      </Box>
      <Box p={4} overflow={"scroll"} maxH={"80dvh"}>
        {children}
      </Box>
    </Box>
  );
}
