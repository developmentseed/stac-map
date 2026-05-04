import type { StacItem } from "stac-ts";
import ValueListItem from "./value";

export default function ItemListItem({
  item,
  hovered,
  setHovered,
}: {
  item: StacItem;
  hovered: StacItem | undefined;
  setHovered: (item: StacItem | undefined) => void;
}) {
  return (
    <ValueListItem
      value={item}
      isHovered={item.id === hovered?.id}
      onMouseEnter={() => setHovered(item)}
      onMouseLeave={() => {
        if (hovered?.id === item.id) setHovered(undefined);
      }}
    />
  );
}
