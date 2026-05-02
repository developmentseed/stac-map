import type { StacItem } from "stac-ts";
import ValueCard from "./value";

export default function ItemCard({
  item,
  hovered,
  setHovered,
}: {
  item: StacItem;
  hovered: StacItem | undefined;
  setHovered: (item: StacItem | undefined) => void;
}) {
  const numberOfAssets = Object.keys(item.assets).length;

  return (
    <ValueCard
      value={item}
      isHovered={item.id === hovered?.id}
      onMouseEnter={() => setHovered(item)}
      onMouseLeave={() => {
        if (hovered?.id === item.id) setHovered(undefined);
      }}
      footer={numberOfAssets + " asset" + (numberOfAssets !== 1 ? "s" : "")}
    />
  );
}
