import { useStore } from "@/store";
import type { StacCollection } from "stac-ts";
import ValueListItem from "./value";

export default function CollectionListItem({
  collection,
}: {
  collection: StacCollection;
}) {
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);

  return (
    <ValueListItem
      value={collection}
      isHovered={collection.id === hoveredCollection?.id}
      onMouseEnter={() => setHoveredCollection(collection)}
      onMouseLeave={() => {
        if (hoveredCollection?.id === collection.id) setHoveredCollection(null);
      }}
    />
  );
}
