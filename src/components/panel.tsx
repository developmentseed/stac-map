import { type ReactNode, useEffect } from "react";
import { LuArrowRight } from "react-icons/lu";
import {
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
import { useStacJson } from "../hooks/stac";
import { useBoundStore } from "../store";
import type { StacValue } from "../types/stac";
import { getSelfHref, getStacValueId } from "../utils/stac";

export default function Panel() {
  const href = useBoundStore((store) => store.href);
  const value = useBoundStore((store) => store.value);
  const pickedItem = useBoundStore((store) => store.pickedItem);

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
  const setHref = useBoundStore((store) => store.setHref);
  const setPickedItem = useBoundStore((store) => store.setPickedItem);
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
  const setValue = useBoundStore((store) => store.setValue);
  const result = useStacJson({ href });
  const header = (
    <HStack truncate>
      <Spinner size="xs" mr={2} />
      Fetching {href}...
    </HStack>
  );

  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  return (
    <BasePanel header={header}>
      <SkeletonText />
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
