import {
  Accordion,
  Box,
  DataList,
  HStack,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react";
import type {
  StacCollection,
  SpatialExtent as StacSpatialExtent,
  TemporalExtent as StacTemporalExtent,
} from "stac-ts";
import useStacMap from "../hooks/stac-map";
import { ChildCard, Children } from "./children";
import { CollectionCombobox } from "./search/collection";
import ItemSearch from "./search/item";
import { NaturalLanguageCollectionSearch } from "./search/natural-language";
import Value from "./value";

export function Collection({ collection }: { collection: StacCollection }) {
  const { root } = useStacMap();
  const searchLinks =
    (root && root.links?.filter((link) => link.rel == "search")) || [];
  console.log(searchLinks);
  return (
    <Stack>
      <Value value={collection}>
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
      </Value>
      {searchLinks.length > 0 && (
        <ItemSearch collection={collection} links={searchLinks}></ItemSearch>
      )}
    </Stack>
  );
}

export function Collections({
  collections,
}: {
  collections: StacCollection[];
}) {
  const { value } = useStacMap();
  const catalogHref =
    value?.type == "Catalog" &&
    value.links.find((link) => link.rel == "self")?.href;

  return (
    <Children heading="Collections">
      <Accordion.Root collapsible defaultValue={["simple"]}>
        <Accordion.Item value="simple">
          <Accordion.ItemTrigger>
            <Span flex={1}>Simple search</Span>
            <Accordion.ItemIndicator></Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <CollectionCombobox collections={collections}></CollectionCombobox>
          </Accordion.ItemContent>
        </Accordion.Item>
        {catalogHref && (
          <Accordion.Item value="natural-language">
            <Accordion.ItemTrigger>
              <Span flex={1}>Natural language search</Span>
              <Accordion.ItemIndicator></Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <NaturalLanguageCollectionSearch
                collections={collections}
                href={catalogHref}
              />
            </Accordion.ItemContent>
          </Accordion.Item>
        )}
      </Accordion.Root>
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
