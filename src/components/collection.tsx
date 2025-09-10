import {
  Badge,
  Box,
  DataList,
  HStack,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuFileSearch } from "react-icons/lu";
import type { StacCollection } from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { ChildCard, Children } from "./children";
import { SpatialExtent, TemporalExtent } from "./extents";
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
              <Badge colorPalette={"orange"}>Under development</Badge>
            </HStack>
          }
        >
          <ItemSearch collection={collection} links={searchLinks}></ItemSearch>
        </Section>
      )}

      <Children value={collection}></Children>
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

export function Extents({ collection }: { collection: StacCollection }) {
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
