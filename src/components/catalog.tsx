import { Stack } from "@chakra-ui/react";
import type { StacCatalog } from "stac-ts";
import { Children } from "./children";
import Value from "./value";

export function Catalog({ catalog }: { catalog: StacCatalog }) {
  return (
    <Stack>
      <Value value={catalog}></Value>
      <Children value={catalog}></Children>
    </Stack>
  );
}
