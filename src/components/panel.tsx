import { useEffect } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Introduction from "./introduction";
import Value from "./value";
import { toaster } from "../components/ui/toaster";
import { useStore } from "../store";
import { fetchStac } from "../utils/stac";
import { getStacValueTitle } from "../utils/stac";

export default function Panel() {
  const href = useStore((store) => store.href);
  const value = useStore((store) => store.value);
  const setValue = useStore((state) => state.setValue);
  const heading = value ? getStacValueTitle(value) : "stac-map";

  const valueJsonQuery = useQuery({
    queryKey: ["stac-value-json", href],
    enabled: !href?.endsWith(".parquet"),
    queryFn: async () => (href && (await fetchStac(href))) || null,
  });

  useEffect(() => {
    setValue(valueJsonQuery.data || null);
  }, [valueJsonQuery.data, setValue]);

  useEffect(() => {
    if (href && valueJsonQuery.error) {
      toaster.create({
        type: "error",
        title: href,
        description: valueJsonQuery.error.message,
      });
    }
  }, [valueJsonQuery.error, href]);

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
        {(value && <Value value={value} />) || <Introduction />}
      </Box>
    </Box>
  );
}
