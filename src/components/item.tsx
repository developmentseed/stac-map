import { Stack } from "@chakra-ui/react";
import type { StacItem } from "stac-ts";
import Assets from "./assets";
import Value from "./value";

export default function Item({ item }: { item: StacItem }) {
  return (
    <Stack>
      <Value value={item}></Value>
      <Assets assets={item.assets}></Assets>
    </Stack>
  );
}
