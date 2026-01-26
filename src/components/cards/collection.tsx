import { useStore } from "@/store";
import type { StacCollection } from "stac-ts";
import ValueCard from "./value";

export default function CollectionCard({
  collection,
}: {
  collection: StacCollection;
}) {
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);

  return (
    <ValueCard
      value={collection}
      isHovered={collection.id === hoveredCollection?.id}
      onMouseEnter={() => setHoveredCollection(collection)}
      onMouseLeave={() => {
        if (hoveredCollection?.id === collection.id) setHoveredCollection(null);
      }}
    />
  );
}
