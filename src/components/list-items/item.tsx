import { useStore } from "@/store";
import type { StacItem } from "stac-ts";
import ValueListItem from "./value";

export default function ItemListItem({ item }: { item: StacItem }) {
  const hoveredItem = useStore((store) => store.hoveredItem);
  const setHoveredItem = useStore((store) => store.setHoveredItem);

  return (
    <ValueListItem
      value={item}
      isHovered={item.id === hoveredItem?.id}
      onMouseEnter={() => setHoveredItem(item)}
      onMouseLeave={() => {
        if (hoveredItem?.id === item.id) setHoveredItem(null);
      }}
    />
  );
}
