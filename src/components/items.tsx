import { Link, List } from "@chakra-ui/react";
import type { StacItem } from "stac-ts";

export default function Items({
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
