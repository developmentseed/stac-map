import { Link, List } from "@chakra-ui/react";
import { useStore } from "../store";
import type { StacValue } from "../types/stac";
import { getSelfHref, getStacValueTitle } from "../utils/stac";

export default function ValueListItem({ value }: { value: StacValue }) {
  const href = getSelfHref(value);
  const setHref = useStore((store) => store.setHref);

  return (
    <List.Item>
      <Link onClick={() => href && setHref(href)}>
        {getStacValueTitle(value)}
      </Link>
    </List.Item>
  );
}
