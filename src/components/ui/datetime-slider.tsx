import { Slider } from "@chakra-ui/react";
import { useState } from "react";

export default function DatetimeSlider({
  startBoundMs,
  endBoundMs,
  value,
  onChangeEnd,
  orientation = "horizontal",
}: {
  startBoundMs: number;
  endBoundMs: number;
  value: [number, number];
  onChangeEnd: (value: [number, number]) => void;
  orientation?: "horizontal" | "vertical";
}) {
  const [internal, setInternal] = useState<number[]>([value[0], value[1]]);
  const [lastExternal, setLastExternal] = useState<number[]>([
    value[0],
    value[1],
  ]);
  if (lastExternal[0] !== value[0] || lastExternal[1] !== value[1]) {
    setLastExternal([value[0], value[1]]);
    setInternal([value[0], value[1]]);
  }
  return (
    <Slider.Root
      size={"sm"}
      orientation={orientation}
      min={startBoundMs}
      max={endBoundMs}
      value={internal}
      onValueChange={(e) => setInternal(e.value)}
      onValueChangeEnd={(e) => onChangeEnd([e.value[0], e.value[1]])}
      h={orientation === "vertical" ? "100%" : undefined}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  );
}
