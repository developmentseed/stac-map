import { useStore } from "@/store";
import { HStack, Slider, Span } from "@chakra-ui/react";
import { useState } from "react";

export default function DatetimeSlider({
  start,
  end,
}: {
  start: Date;
  end: Date;
}) {
  const [userValue, setUserValue] = useState<[number, number] | null>(null);
  const datetimeFilter = useStore((store) => store.datetimeFilter);
  const setDatetimeFilter = useStore((store) => store.setDatetimeFilter);

  const value =
    datetimeFilter && userValue ? userValue : [start.getTime(), end.getTime()];

  return (
    <Slider.Root
      value={value}
      min={start.getTime()}
      max={end.getTime()}
      onValueChange={(e) => {
        setUserValue(e.value as [number, number]);
        setDatetimeFilter({
          start: new Date(value[0]),
          end: new Date(value[1]),
        });
      }}
      onValueChangeEnd={() => {}}
    >
      <HStack>
        <Slider.Label>Filter by datetime</Slider.Label>
      </HStack>
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
      <HStack justify={"space-between"}>
        <Span>{new Date(value[0]).toLocaleDateString()}</Span>
        <Span>{new Date(value[1]).toLocaleDateString()}</Span>
      </HStack>
    </Slider.Root>
  );
}
