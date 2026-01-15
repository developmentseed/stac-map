import { type ReactNode, useEffect } from "react";
import { Box, HStack, SkeletonText } from "@chakra-ui/react";
import Introduction from "./introduction";
import { StacIcon } from "./stac";
import Value from "./value";
import { useStacJson } from "../hooks/stac";
import { useStore } from "../store";
import { getStacValueId } from "../utils/stac";

export default function Panel() {
  const href = useStore((store) => store.href);

  if (href) {
    return <HrefPanel href={href} />;
  } else {
    return (
      <BasePanel header="stac-map">
        <Introduction />
      </BasePanel>
    );
  }
}

function HrefPanel({ href }: { href: string }) {
  const setValue = useStore((store) => store.setValue);
  const result = useStacJson({ href });

  useEffect(() => {
    if (result.data) setValue(result.data);
  }, [result.data, setValue]);

  if (result.data) {
    const header = (
      <HStack>
        <StacIcon value={result.data} /> {getStacValueId(result.data)}{" "}
      </HStack>
    );
    return (
      <BasePanel header={header}>
        <Value value={result.data} />
      </BasePanel>
    );
  } else if (result.isFetching) {
    return (
      <BasePanel header="Fetching...">
        <SkeletonText />
      </BasePanel>
    );
  }
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
