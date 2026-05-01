import type { StacCollection } from "stac-ts";
import ValueListItem from "./value";

export default function CollectionListItem({
  collection,
  hovered,
  setHovered,
}: {
  collection: StacCollection;
  hovered: StacCollection | undefined;
  setHovered: (collection: StacCollection | undefined) => void;
}) {
  return (
    <ValueListItem
      value={collection}
      isHovered={collection.id === hovered?.id}
      onMouseEnter={() => setHovered(collection)}
      onMouseLeave={() => {
        if (hovered?.id === collection.id) setHovered(undefined);
      }}
    />
  );
}
