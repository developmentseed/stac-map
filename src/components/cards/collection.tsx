import { useStore } from "@/store";
import { Text, VStack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import ValueCard from "./value";

export default function CollectionCard({
  collection,
}: {
  collection: StacCollection;
}) {
  const hoveredCollection = useStore((store) => store.hoveredCollection);
  const setHoveredCollection = useStore((store) => store.setHoveredCollection);

  const bbox = collection.extent?.spatial?.bbox?.[0];
  const interval = collection.extent?.temporal?.interval?.[0];

  const formatBbox = (bbox: number[]) => {
    return bbox.map((v) => v.toFixed(2)).join(", ");
  };

  const formatInterval = (interval: (string | null)[]) => {
    const start = interval[0] ? interval[0].split("T")[0] : "..";
    const end = interval[1] ? interval[1].split("T")[0] : "..";
    return `${start} / ${end}`;
  };

  const footer = (bbox || interval) && (
    <VStack align="start" gap={0} fontSize="xs" color="fg.muted">
      {bbox && <Text>Bbox: {formatBbox(bbox)}</Text>}
      {interval && <Text>Temporal: {formatInterval(interval)}</Text>}
    </VStack>
  );

  return (
    <ValueCard
      value={collection}
      isHovered={collection.id === hoveredCollection?.id}
      onMouseEnter={() => setHoveredCollection(collection)}
      onMouseLeave={() => {
        if (hoveredCollection?.id === collection.id) setHoveredCollection(null);
      }}
      footer={footer}
    />
  );
}
