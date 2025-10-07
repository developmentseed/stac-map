import { Stack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import CollectionCard from "../cards/collection";

export default function Collections({
  collections,
  setHref,
}: {
  collections: StacCollection[];
  setHref: (href: string | undefined) => void;
}) {
  return (
    <Stack>
      {collections.map((collection) => (
        <CollectionCard
          key={"collection-" + collection.id}
          collection={collection}
          setHref={setHref}
        />
      ))}
    </Stack>
  );
}
