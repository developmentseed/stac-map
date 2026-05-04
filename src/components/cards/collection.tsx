import { Text, VStack } from "@chakra-ui/react";
import type { StacCollection } from "stac-ts";
import ValueCard from "./value";

export default function CollectionCard({
  collection,
  hovered,
  setHovered,
}: {
  collection: StacCollection;
  hovered: StacCollection | undefined;
  setHovered: (collection: StacCollection | undefined) => void;
}) {
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
      isHovered={collection.id === hovered?.id}
      onMouseEnter={() => setHovered(collection)}
      onMouseLeave={() => {
        if (hovered?.id === collection.id) setHovered(undefined);
      }}
      footer={footer}
    />
  );
}
