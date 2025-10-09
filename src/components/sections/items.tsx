import { LuFiles } from "react-icons/lu";
import { Link, List } from "@chakra-ui/react";
import type { StacItem } from "stac-ts";
import Section from "../section";

interface ItemsProps {
  items: StacItem[];
  setHref: (href: string | undefined) => void;
}

export default function ItemsSection({
  filteredItems,
  items,
  ...props
}: { filteredItems: StacItem[] | undefined } & ItemsProps) {
  const parenthetical = filteredItems
    ? `${filteredItems.length}/${items.length}`
    : items.length;
  const title = `Items (${parenthetical})`;
  return (
    <Section title={title} TitleIcon={LuFiles} value="items">
      <Items items={filteredItems || items} {...props} />
    </Section>
  );
}

function Items({
  items,
  setHref,
}: {
  items: StacItem[];
  setHref: (href: string | undefined) => void;
}) {
  return (
    <List.Root variant={"plain"}>
      {items.map((item, i) => (
        <List.Item key={"item-" + i}>
          <Link
            onClick={() => {
              const selfHref = item.links.find(
                (link) => link.rel === "self"
              )?.href;
              if (selfHref) setHref(selfHref);
            }}
          >
            {item.id}
          </Link>
        </List.Item>
      ))}
    </List.Root>
  );
}
