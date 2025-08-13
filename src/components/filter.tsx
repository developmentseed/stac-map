import {
  Center,
  DataList,
  Heading,
  HStack,
  Slider,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import useStacMap from "../hooks/stac-map";
import DownloadButtons from "./download";

export default function Filter({
  temporalExtents,
}: {
  temporalExtents: { start: Date; end: Date };
}) {
  const { setTemporalFilter, filteredItems } = useStacMap();
  const [start, setStart] = useState<number>();
  const [end, setEnd] = useState<number>();

  return (
    <Stack gap={4}>
      <Heading>Temporal extents</Heading>
      <DataList.Root orientation={"horizontal"}>
        <DataList.Item>
          <DataList.ItemLabel>Start</DataList.ItemLabel>
          <DataList.ItemValue>
            {temporalExtents.start.toLocaleString()}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>End</DataList.ItemLabel>
          <DataList.ItemValue>
            {temporalExtents.end.toLocaleString()}
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>

      <Slider.Root
        min={0}
        max={
          (temporalExtents.end.getTime() - temporalExtents.start.getTime()) /
          1000
        }
        value={[
          start || 0,
          end ||
            (temporalExtents.end.getTime() - temporalExtents.start.getTime()) /
              1000,
        ]}
        onValueChange={(e) => {
          const start = e.value[0];
          const end = e.value[1];
          setStart(start);
          setEnd(end);
          setTemporalFilter({
            start: new Date(temporalExtents.start.getTime() + start * 1000),
            end: new Date(temporalExtents.start.getTime() + end * 1000),
          });
        }}
      >
        <Slider.Label>Temporal filter</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range></Slider.Range>
          </Slider.Track>
          <Slider.Thumbs></Slider.Thumbs>
        </Slider.Control>
      </Slider.Root>
      {start !== undefined && end !== undefined && (
        <Center>
          <Text fontSize={"xs"}>
            {new Date(
              temporalExtents.start.getTime() + start * 1000,
            ).toLocaleString()}{" "}
            to{" "}
            {new Date(
              temporalExtents.start.getTime() + end * 1000,
            ).toLocaleString()}
          </Text>
        </Center>
      )}
      <HStack>
        {filteredItems && filteredItems.length > 0 && (
          <DownloadButtons items={filteredItems}></DownloadButtons>
        )}
      </HStack>
    </Stack>
  );
}
