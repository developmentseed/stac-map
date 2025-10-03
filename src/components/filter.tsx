import { useEffect, useMemo, useState } from "react";
import { Checkbox, DataList, Slider, Stack, Text } from "@chakra-ui/react";
import type { StacCollection, StacItem } from "stac-ts";
import { SpatialExtent } from "./extent";
import type { BBox2D } from "../types/map";
import type { DatetimeBounds, StacValue } from "../types/stac";
import { getItemDatetimes } from "../utils/stac";

export default function Filter({
  filter,
  setFilter,
  bbox,
  setDatetimeBounds,
  value,
  items,
  collections,
}: {
  filter: boolean;
  setFilter: (filter: boolean) => void;
  bbox: BBox2D | undefined;
  setDatetimeBounds: (bounds: DatetimeBounds | undefined) => void;
  value: StacValue;
  items: StacItem[] | undefined;
  collections: StacCollection[] | undefined;
}) {
  const [filterStart, setFilterStart] = useState<Date>();
  const [filterEnd, setFilterEnd] = useState<Date>();
  const [sliderValue, setSliderValue] = useState<number[]>();

  const datetimes = useMemo(() => {
    let start =
      value.start_datetime && typeof value.start_datetime === "string"
        ? new Date(value.start_datetime as string)
        : null;
    let end =
      value.end_datetime && typeof value.end_datetime === "string"
        ? new Date(value.end_datetime as string)
        : null;

    if (items) {
      for (const item of items) {
        const itemDatetimes = getItemDatetimes(item);
        if (itemDatetimes.start && (!start || itemDatetimes.start < start))
          start = itemDatetimes.start;
        if (itemDatetimes.end && (!end || itemDatetimes.end > end))
          end = itemDatetimes.end;
      }
    }

    if (collections) {
      for (const collection of collections) {
        const extents = collection.extent?.temporal?.interval?.[0];
        if (extents) {
          const collectionStart = extents[0] ? new Date(extents[0]) : null;
          if (collectionStart && (!start || collectionStart < start))
            start = collectionStart;
          const collectionEnd = extents[1] ? new Date(extents[1]) : null;
          if (collectionEnd && (!end || collectionEnd > end))
            end = collectionEnd;
        }
      }
    }

    return start && end ? { start, end } : null;
  }, [value, items, collections]);

  useEffect(() => {
    if (datetimes && !filterStart && !filterEnd) {
      setSliderValue([datetimes.start.getTime(), datetimes.end.getTime()]);
    }
  }, [datetimes, filterStart, filterEnd]);

  useEffect(() => {
    if (filterStart && filterEnd) {
      setSliderValue([filterStart.getTime(), filterEnd.getTime()]);
      setDatetimeBounds({ start: filterStart, end: filterEnd });
    }
  }, [filterStart, filterEnd, setDatetimeBounds]);

  return (
    <Stack gap={4}>
      <Checkbox.Root
        size={"sm"}
        checked={filter}
        onCheckedChange={(e) => setFilter(!!e.checked)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Label>Filter collections and items?</Checkbox.Label>
        <Checkbox.Control />
      </Checkbox.Root>

      <DataList.Root>
        <DataList.Item>
          <DataList.ItemLabel>Bounding box</DataList.ItemLabel>
          <DataList.ItemValue>
            {(bbox && <SpatialExtent bbox={bbox} />) || "not set"}
          </DataList.ItemValue>
        </DataList.Item>
        {datetimes && (
          <DataList.Item>
            <DataList.ItemLabel>Datetime</DataList.ItemLabel>
            <DataList.ItemValue>
              <Stack w="full">
                <Text>
                  {filterStart
                    ? filterStart.toLocaleDateString()
                    : datetimes.start.toLocaleDateString()}{" "}
                  —{" "}
                  {filterEnd
                    ? filterEnd.toLocaleDateString()
                    : datetimes.end.toLocaleDateString()}
                </Text>
                <Slider.Root
                  min={datetimes.start.getTime()}
                  max={datetimes.end.getTime()}
                  value={sliderValue}
                  onValueChange={(e) => {
                    setFilterStart(new Date(e.value[0]));
                    setFilterEnd(new Date(e.value[1]));
                  }}
                  disabled={!filter}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.Root>
              </Stack>
            </DataList.ItemValue>
          </DataList.Item>
        )}
      </DataList.Root>
    </Stack>
  );
}
