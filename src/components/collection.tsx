import { Box, DataList, HStack, Stack, Text } from "@chakra-ui/react";
import type {
  StacCollection,
  SpatialExtent as StacSpatialExtent,
  TemporalExtent as StacTemporalExtent,
} from "stac-ts";
import { ChildCard, Children } from "./children";
import { CollectionCombobox } from "./search/collection";

export function Collection({ collection }: { collection: StacCollection }) {
  return (
    <DataList.Root orientation={"horizontal"} size={"sm"} py={4}>
      {collection.extent?.spatial?.bbox?.[0] && (
        <DataList.Item>
          <DataList.ItemLabel>Spatial extent</DataList.ItemLabel>
          <DataList.ItemValue>
            <SpatialExtent
              bbox={collection.extent.spatial.bbox[0]}
            ></SpatialExtent>
          </DataList.ItemValue>
        </DataList.Item>
      )}
      {collection.extent?.temporal?.interval?.[0] && (
        <DataList.Item>
          <DataList.ItemLabel>Temporal extent</DataList.ItemLabel>
          <DataList.ItemValue>
            <TemporalExtent
              interval={collection.extent.temporal.interval[0]}
            ></TemporalExtent>
          </DataList.ItemValue>
        </DataList.Item>
      )}
    </DataList.Root>
  );
}

export function Collections({
  collections,
}: {
  collections: StacCollection[];
}) {
  return (
    <Children heading="Collections">
      <CollectionCombobox collections={collections}></CollectionCombobox>
      {collections.map((collection) => (
        <CollectionCard
          collection={collection}
          key={"collection-" + collection.id}
        ></CollectionCard>
      ))}
    </Children>
  );
}

export function CollectionCard({
  collection,
  explanation,
}: {
  collection: StacCollection;
  explanation?: string;
}) {
  return (
    <ChildCard
      child={collection}
      footer={
        <Stack>
          <HStack>
            <SpatialExtent
              bbox={collection.extent.spatial.bbox[0]}
            ></SpatialExtent>
            <Box flex={1}></Box>
            <TemporalExtent
              interval={collection.extent.temporal.interval[0]}
            ></TemporalExtent>
          </HStack>
          {explanation && (
            <Text>Natural language search explanation: {explanation}</Text>
          )}
        </Stack>
      }
    ></ChildCard>
  );
}

function SpatialExtent({ bbox }: { bbox: StacSpatialExtent }) {
  return <Text>[{bbox.map((n) => Number(n.toFixed(4))).join(", ")}]</Text>;
}

function TemporalExtent({ interval }: { interval: StacTemporalExtent }) {
  return (
    <Text>
      <DateString datetime={interval[0]}></DateString> —{" "}
      <DateString datetime={interval[1]}></DateString>
    </Text>
  );
}

function DateString({ datetime }: { datetime: string | null }) {
  if (datetime) {
    return new Date(datetime).toLocaleDateString();
  } else {
    return "unbounded";
  }
}
