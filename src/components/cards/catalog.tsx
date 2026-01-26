import { useState } from "react";
import type { StacCatalog } from "stac-ts";
import ValueCard from "./value";

export default function CatalogCard({ catalog }: { catalog: StacCatalog }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ValueCard
      value={catalog}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
