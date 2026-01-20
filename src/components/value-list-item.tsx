import { Link, List } from "@chakra-ui/react";
import { useBoundStore } from "../store";
import type { StacValue } from "../types/stac";
import { getSelfHref, getStacValueTitle } from "../utils/stac";

export default function ValueListItem({ value }: { value: StacValue }) {
  const href = getSelfHref(value);
  const setHref = useBoundStore((store) => store.setHref);

  return (
    <List.Item>
      <Link onClick={() => href && setHref(href)}>
        {getStacValueTitle(value)}
      </Link>
    </List.Item>
  );
}
