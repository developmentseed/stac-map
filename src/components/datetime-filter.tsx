import { useStore } from "@/store";
import { msToIsoLabel } from "@/utils/datetime";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { LuX } from "react-icons/lu";
import DatetimeSlider from "./ui/datetime-slider";

export default function DatetimeFilter() {
  const href = useStore((store) => store.href);
  const extents = useStore((store) => store.datetimeExtents);
  const filters = useStore((store) => store.datetimeFilters);
  const setFilter = useStore((store) => store.setDatetimeFilter);

  const extent = useMemo<[number, number] | null>(() => {
    const xs = [extents.items, extents.collections, extents.geoparquet].filter(
      (x): x is [number, number] => x !== null
    );
    if (xs.length === 0) return null;
    return [Math.min(...xs.map((x) => x[0])), Math.max(...xs.map((x) => x[1]))];
  }, [extents]);

  if (!href || !extent) return null;
  const filter: [number, number] = filters[href] ?? extent;
  const isDirty = filter[0] !== extent[0] || filter[1] !== extent[1];

  return (
    <Box
      position={"absolute"}
      right={4}
      top={20}
      bottom={20}
      pointerEvents={"auto"}
      bg={"bg.muted/60"}
      rounded={4}
      p={2}
      zIndex={2}
    >
      <Stack h={"100%"} align={"center"} gap={2}>
        <Text fontSize={"xs"}>{msToIsoLabel(filter[1])}</Text>
        <Box flex={1} minH={"120px"}>
          <DatetimeSlider
            orientation={"vertical"}
            startBoundMs={extent[0]}
            endBoundMs={extent[1]}
            value={filter}
            onChangeEnd={(v) => setFilter(href, [v[0], v[1]])}
          />
        </Box>
        <Text fontSize={"xs"}>{msToIsoLabel(filter[0])}</Text>
        <Button
          size={"xs"}
          variant={"ghost"}
          disabled={!isDirty}
          onClick={() => setFilter(href, undefined)}
          aria-label={"Reset datetime filter"}
        >
          <LuX /> Reset
        </Button>
      </Stack>
    </Box>
  );
}
