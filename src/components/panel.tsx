import { type ReactNode, useEffect } from "react";
import { LuArrowRight, LuBird, LuFileWarning } from "react-icons/lu";
import {
  Alert,
  Box,
  CloseButton,
  HStack,
  IconButton,
  SkeletonText,
  Spinner,
} from "@chakra-ui/react";
import type { StacItem } from "stac-ts";
import Introduction from "./introduction";
import { StacIcon } from "./stac";
import Value from "./value";
import { useStac } from "../hooks/stac";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { getSelfHref, getStacValueId } from "../utils/stac";

export default function Panel() {
  const href = useStore((store) => store.href);
  const value = useStore((store) => store.value);
  const pickedItem = useStore((store) => store.pickedItem);

  if (pickedItem) {
    return <PickedItemPanel pickedItem={pickedItem} />;
  } else if (value) {
    return <ValuePanel value={value} />;
  } else if (href) {
    return <HrefPanel href={href} />;
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
  const setPickedItem = useStore((store) => store.setPickedItem);
  const href = getSelfHref(pickedItem);

  const header = (
    <HStack>
      <StacIcon value={pickedItem} /> {getStacValueId(pickedItem)}{" "}
      <Box flex={1} />
      {href && (
        <IconButton variant={"subtle"} size={"2xs"} m={0}>
          <LuArrowRight onClick={() => setHref(href)} />
        </IconButton>
      )}
      <CloseButton size={"2xs"} onClick={() => setPickedItem(null)} />
    </HStack>
  );
  return (
    <BasePanel header={header}>
      <Value value={pickedItem} />
    </BasePanel>
  );
}

function ValuePanel({ value }: { value: StacValue }) {
  const header = (
    <HStack>
      <StacIcon value={value} /> {getStacValueId(value)}{" "}
    </HStack>
  );
  return (
    <BasePanel header={header}>
      <Value value={value} />
    </BasePanel>
  );
}

function HrefPanel({ href }: { href: string }) {
  const connection = useStore((store) => store.connection);
  const setValue = useStore((store) => store.setValue);
  const result = useStac({ href });
  const header = (
    <HStack truncate>
      {result.error ? (
        <>
          <LuFileWarning /> Error loading {href}
        </>
      ) : result.isFetching ? (
        <>
          <Spinner size="xs" mr={1} /> Fetching {href}
        </>
      ) : !connection ? (
        <>
          <LuBird />
          Loading DuckDB...
        </>
      ) : (
        "stac-map"
      )}
    </HStack>
  );

  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return (
    <BasePanel header={header}>
      {(result.error && (
        <Alert.Root status={"error"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{result.error.name}</Alert.Title>
            <Alert.Description>{result.error.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )) || <SkeletonText />}
    </BasePanel>
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
