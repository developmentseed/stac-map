import { type ReactNode, useEffect } from "react";
import { Box, HStack, SkeletonText, Spinner } from "@chakra-ui/react";
import Introduction from "./introduction";
import { StacIcon } from "./stac";
import Value from "./value";
import { useStacJson } from "../hooks/stac";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { getStacValueId } from "../utils/stac";

export default function Panel() {
  const href = useStore((store) => store.href);
  const value = useStore((store) => store.value);

  if (value) {
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
  const setValue = useStore((store) => store.setValue);
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
