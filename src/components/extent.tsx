import { Box } from "@chakra-ui/react";
import type {
  SpatialExtent as StacSpatialExtent,
  TemporalExtent as StacTemporalExtent,
} from "stac-ts";

export function SpatialExtent({ bbox }: { bbox: StacSpatialExtent }) {
  return <Box>[{bbox.map((n) => Number(n.toFixed(4))).join(", ")}]</Box>;
}

export function TemporalExtent({ interval }: { interval: StacTemporalExtent }) {
  return (
    <Box>
      <DateString datetime={interval[0]}></DateString> —{" "}
      <DateString datetime={interval[1]}></DateString>
    </Box>
  );
}

function DateString({ datetime }: { datetime: string | null }) {
  if (datetime) {
    return new Date(datetime).toLocaleDateString();
  } else {
    return "unbounded";
  }
}
