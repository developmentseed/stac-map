import { useState } from "react";
import type { StacCatalog } from "stac-ts";
import ValueListItem from "./value";

export default function CatalogListItem({ catalog }: { catalog: StacCatalog }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ValueListItem
      value={catalog}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
