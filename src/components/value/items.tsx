import { List, Stack } from "@chakra-ui/react";
import { LuFiles } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import ItemCard from "../cards/item";
import ItemListItem from "../list-items/item";
import { Section } from "../section";

export default function Items({ items }: { items: StacItem[] }) {
  const title = `Items (${items.length})`;
  return (
    <Section defaultListOrCard="list" title={title} icon={<LuFiles />}>
      {(listOrCard) => {
        return listOrCard === "list" ? (
          <List.Root variant={"plain"}>
            {items.map((item) => (
              <ItemListItem key={item.id} item={item} />
            ))}
          </List.Root>
        ) : (
          <Stack>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </Stack>
        );
      }}
    </Section>
  );
}
