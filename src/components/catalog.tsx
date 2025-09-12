import { Stack } from "@chakra-ui/react";
import type { StacCatalog } from "stac-ts";
import type { SetHref } from "../types/app";
import { Children } from "./children";
import Value from "./value";

export function Catalog({
  catalog,
  setHref,
}: {
  catalog: StacCatalog;
  setHref: SetHref;
}) {
  return (
    <Stack>
      <Value value={catalog}></Value>
      <Children value={catalog} setHref={setHref}></Children>
    </Stack>
  );
}
