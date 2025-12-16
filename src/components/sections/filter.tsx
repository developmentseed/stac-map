import { useEffect, useMemo, useState } from "react";
import { LuFilter, LuFilterX } from "react-icons/lu";
import { Checkbox, DataList, Slider, Stack, Text } from "@chakra-ui/react";
import type { StacCollection, StacItem } from "stac-ts";
import type { BBox2D } from "../../types/map";
import type { DatetimeBounds, StacValue } from "../../types/stac";
import { SpatialExtent } from "../extent";
import Section from "../section";

interface FilterProps {
  filter: boolean;
  setFilter: (filter: boolean) => void;
  bbox: BBox2D | undefined;
  setDatetimeBounds: (bounds: DatetimeBounds | undefined) => void;
  value: StacValue;
  items: StacItem[] | undefined;
  collections: StacCollection[] | undefined;
  datetimes: {
    start: Date;
    end: Date;
  } | null;
}

export default function FilterSection({ filter, ...props }: FilterProps) {
  return (
    <Section
      title="Filter"
      TitleIcon={filter ? LuFilter : LuFilterX}
      value="filter"
    >
      <Filter filter={filter} {...props} />
    </Section>
  );
}

function Filter({
  filter,
  setFilter,
  bbox,
  setDatetimeBounds,
  datetimes,
}: FilterProps) {
  const [filterStart, setFilterStart] = useState<Date>();
  const [filterEnd, setFilterEnd] = useState<Date>();

  const sliderValue = useMemo(() => {
    if (!datetimes) return undefined;
    if (filterStart && filterEnd) {
      return [filterStart.getTime(), filterEnd.getTime()];
    }
    return [datetimes.start.getTime(), datetimes.end.getTime()];
  }, [datetimes, filterStart, filterEnd]);

  useEffect(() => {
    if (filterStart && filterEnd) {
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
