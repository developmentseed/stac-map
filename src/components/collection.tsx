import { Link, List } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import { useStore } from "../store";
import { getSelfHref, getStacValueTitle } from "../utils/stac";

export default function Collection({
  collection,
}: {
  collection: StacCollection;
}) {
  const href = getSelfHref(collection);
  const setHref = useStore((state) => state.setHref);

  return (
    <List.Item>
      <Link onClick={() => href && setHref(href)}>
        {getStacValueTitle(collection)}
      </Link>
    </List.Item>
  );
}
