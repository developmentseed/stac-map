import { Box, DataList, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { LuFileSearch } from "react-icons/lu";
import type {
  StacCollection,
  SpatialExtent as StacSpatialExtent,
  TemporalExtent as StacTemporalExtent,
} from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { ChildCard } from "./children";
import ItemSearch from "./search/item";
import Section from "./section";
import Value from "./value";

export function Collection({ collection }: { collection: StacCollection }) {
  const { root } = useStacMap();
  const searchLinks =
    (root && root.links?.filter((link) => link.rel == "search")) || [];
  return (
    <Stack>
      <Value value={collection}>
        <Extents collection={collection}></Extents>
      </Value>

      {searchLinks.length > 0 && (
        <Section
          title={
            <HStack>
              <Icon>
                <LuFileSearch></LuFileSearch>
              </Icon>{" "}
              Item search
            </HStack>
          }
        >
          <ItemSearch collection={collection} links={searchLinks}></ItemSearch>
        </Section>
      )}
    </Stack>
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
            {collection.extent?.spatial?.bbox && (
              <SpatialExtent
                bbox={collection.extent.spatial.bbox[0]}
              ></SpatialExtent>
            )}
            <Box flex={1}></Box>
            {collection.extent?.temporal?.interval && (
              <TemporalExtent
                interval={collection.extent.temporal.interval[0]}
              ></TemporalExtent>
            )}
          </HStack>
          {explanation && <Text>{explanation}</Text>}
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

function Extents({ collection }: { collection: StacCollection }) {
  return (
    <DataList.Root orientation={"horizontal"}>
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
