import { useEffect } from "react";
import { Box, HStack, SkeletonText } from "@chakra-ui/react";
import Introduction from "./introduction";
import { StacIcon } from "./stac";
import Value from "./value";
import { useStacJson } from "../hooks/stac";
import { useStore } from "../store";
import { getStacValueId } from "../utils/stac";

export default function Panel() {
  const href = useStore((store) => store.href);
  const value = useStore((store) => store.value);
  const setValue = useStore((state) => state.setValue);

  const result = useStacJson({
    href,
    enabled: !href?.endsWith(".parquet"),
  });

  const heading = value ? (
    <HStack>
      <StacIcon value={value} /> {getStacValueId(value)}
    </HStack>
  ) : result.isFetching ? (
    "Fetching..."
  ) : (
    "stac-map"
  );

  useEffect(() => {
    setValue(result.data || null);
  }, [result.data, setValue]);

  return (
    <Box
      bg={"bg.muted"}
      pointerEvents={"auto"}
      rounded={4}
      borderColor={"bg.emphasized"}
    >
      <Box borderBottomWidth={1} borderColor={"border.subtle"} py={2} px={4}>
        <HStack fontWeight={"light"}>{heading}</HStack>
      </Box>
      <Box p={4} overflow={"scroll"} maxH={"80dvh"}>
        {value ? (
          <Value value={value} />
        ) : result.isLoading ? (
          <SkeletonText />
        ) : (
          <Introduction />
        )}
      </Box>
    </Box>
  );
}
