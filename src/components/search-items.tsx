import { LuSearch } from "react-icons/lu";
import type { StacItem } from "stac-ts";
import Items from "./items";
import { Section } from "./section";

export default function SearchItems({ items }: { items: StacItem[] }) {
  return (
    <Section
      icon={<LuSearch />}
      title="Items"
      count={items.length}
      defaultListOrCard="list"
    >
      {(listOrCard) => <Items items={items} listOrCard={listOrCard} />}
    </Section>
  );
}
