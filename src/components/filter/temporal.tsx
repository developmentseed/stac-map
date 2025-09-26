import { useEffect, useState } from "react";
import useStacMap from "../../hooks/stac-map";
import { HStack, Slider } from "@chakra-ui/react";
import Section from "../section";
import { LuFilter } from "react-icons/lu";

export default function TemporalFilter({
  start,
  end,
}: {
  start: Date;
  end: Date;
}) {
  const { setTemporalFilter } = useStacMap();
  const [filterStart, setFilterStart] = useState<Date>();
  const [filterEnd, setFilterEnd] = useState<Date>();
  const [value, setValue] = useState([start.getTime(), end.getTime()]);

  useEffect(() => {
    setValue([
      (filterStart && filterStart.getTime()) || start.getTime(),
      (filterEnd && filterEnd.getTime()) || end.getTime(),
    ]);
  }, [filterStart, filterEnd, start, end]);

  useEffect(() => {
    if (filterStart && filterEnd) {
      setTemporalFilter({ start: filterStart, end: filterEnd });
    } else {
      setTemporalFilter(undefined);
    }
  }, [filterStart, filterEnd, setTemporalFilter]);

  return (
    <Section title="Temporal filter" TitleIcon={LuFilter}>
      <Slider.Root
        value={value}
        onValueChange={(e) => {
          setFilterStart(new Date(e.value[0]));
          setFilterEnd(new Date(e.value[1]));
        }}
        min={start.getTime()}
        max={end.getTime()}
        gap={2}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumbs />
        </Slider.Control>
        <HStack justify={"space-between"}>
          <Slider.Label>
            {(filterStart && filterStart.toLocaleString()) ||
              start.toLocaleString()}
          </Slider.Label>
          <Slider.Label>
            {(filterEnd && filterEnd.toLocaleString()) || end.toLocaleString()}
          </Slider.Label>
        </HStack>
      </Slider.Root>
    </Section>
  );
}
