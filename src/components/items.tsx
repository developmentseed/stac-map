import { List, Stack } from "@chakra-ui/react";
import type { StacItem } from "stac-ts";
import { type ListOrCard } from "./section";
import ValueCard from "./value-card";
import ValueListItem from "./value-list-item";

export default function Items({
  items,
  listOrCard,
}: {
  items: StacItem[];
  listOrCard: ListOrCard;
}) {
  if (listOrCard === "list") {
    return (
      <List.Root variant={"plain"}>
        {items.map((item) => (
          <ValueListItem key={item.id} value={item} />
        ))}
      </List.Root>
    );
  } else {
    return (
      <Stack>
        {items.map((item) => (
          <ValueCard key={item.id} value={item} />
        ))}
      </Stack>
    );
  }
}
